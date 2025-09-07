import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Initialize Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-dcdac55e/health", (c) => {
  return c.json({ status: "ok" });
});

// Auth middleware
const requireAuth = async (c: any, next: any) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) {
      return c.json({ error: 'No authorization token provided' }, 401);
    }

    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    c.set('userId', user.id);
    c.set('userEmail', user.email);
    await next();
  } catch (error) {
    console.log('Auth middleware error:', error);
    return c.json({ error: 'Authentication failed' }, 401);
  }
};

// Auth Routes
app.post("/make-server-dcdac55e/auth/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    // Create user profile in KV store
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email: data.user.email,
      name,
      createdAt: new Date().toISOString(),
      groups: [],
      totalExpenses: 0,
      totalAmountTracked: 0
    });

    return c.json({ user: data.user, message: 'User created successfully' });
  } catch (error) {
    console.log('Signup server error:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

// User Routes
app.get("/make-server-dcdac55e/user/profile", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);
    
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    return c.json({ profile: userProfile });
  } catch (error) {
    console.log('Profile fetch error:', error);
    return c.json({ error: 'Failed to fetch user profile' }, 500);
  }
});

app.put("/make-server-dcdac55e/user/profile", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const updates = await c.req.json();
    
    const existingProfile = await kv.get(`user:${userId}`);
    if (!existingProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    const updatedProfile = { ...existingProfile, ...updates, updatedAt: new Date().toISOString() };
    await kv.set(`user:${userId}`, updatedProfile);

    return c.json({ profile: updatedProfile, message: 'Profile updated successfully' });
  } catch (error) {
    console.log('Profile update error:', error);
    return c.json({ error: 'Failed to update user profile' }, 500);
  }
});

// Group Routes
app.post("/make-server-dcdac55e/groups", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { name, description } = await c.req.json();
    
    const groupId = crypto.randomUUID();
    const group = {
      id: groupId,
      name,
      description,
      createdBy: userId,
      createdAt: new Date().toISOString(),
      members: [userId],
      totalExpenses: 0,
      color: `bg-gradient-to-br from-${['blue', 'green', 'purple', 'orange', 'red', 'pink'][Math.floor(Math.random() * 6)]}-500 to-${['purple', 'teal', 'pink', 'red', 'orange', 'purple'][Math.floor(Math.random() * 6)]}-600`
    };

    await kv.set(`group:${groupId}`, group);
    
    // Add group to user's groups list
    const userProfile = await kv.get(`user:${userId}`);
    if (userProfile) {
      userProfile.groups = [...(userProfile.groups || []), groupId];
      await kv.set(`user:${userId}`, userProfile);
    }

    return c.json({ group, message: 'Group created successfully' });
  } catch (error) {
    console.log('Group creation error:', error);
    return c.json({ error: 'Failed to create group' }, 500);
  }
});

// Add member to group
app.post("/make-server-dcdac55e/groups/:groupId/members", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const groupId = c.req.param('groupId');
    const { email, name } = await c.req.json();
    
    // Get the group
    const group = await kv.get(`group:${groupId}`);
    if (!group) {
      return c.json({ error: 'Group not found' }, 404);
    }

    // Check if user is member of the group
    if (!group.members.includes(userId)) {
      return c.json({ error: 'You are not a member of this group' }, 403);
    }

    // Create a new user profile if doesn't exist or find existing user
    let newUserId;
    const existingUsers = await kv.getByPrefix('user:');
    const existingUser = existingUsers.find(user => user.email === email);
    
    if (existingUser) {
      newUserId = existingUser.id;
      // Add group to existing user's groups if not already added
      if (!existingUser.groups?.includes(groupId)) {
        existingUser.groups = [...(existingUser.groups || []), groupId];
        await kv.set(`user:${newUserId}`, existingUser);
      }
    } else {
      // Create new user profile for invited member
      newUserId = crypto.randomUUID();
      await kv.set(`user:${newUserId}`, {
        id: newUserId,
        email,
        name,
        createdAt: new Date().toISOString(),
        groups: [groupId],
        totalExpenses: 0,
        totalAmountTracked: 0,
        isInvited: true // Mark as invited user
      });
    }

    // Add member to group if not already added
    if (!group.members.includes(newUserId)) {
      group.members.push(newUserId);
      await kv.set(`group:${groupId}`, group);
    }

    return c.json({ message: 'Member added successfully', userId: newUserId });
  } catch (error) {
    console.log('Add member error:', error);
    return c.json({ error: 'Failed to add member' }, 500);
  }
});

// Get group members with details
app.get("/make-server-dcdac55e/groups/:groupId/members", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const groupId = c.req.param('groupId');
    
    const group = await kv.get(`group:${groupId}`);
    if (!group) {
      return c.json({ error: 'Group not found' }, 404);
    }

    if (!group.members.includes(userId)) {
      return c.json({ error: 'You are not a member of this group' }, 403);
    }

    const members = [];
    for (const memberId of group.members) {
      const member = await kv.get(`user:${memberId}`);
      if (member) {
        members.push({
          id: member.id,
          name: member.name,
          email: member.email,
          initials: member.name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
        });
      }
    }

    return c.json({ members });
  } catch (error) {
    console.log('Get members error:', error);
    return c.json({ error: 'Failed to fetch members' }, 500);
  }
});

app.get("/make-server-dcdac55e/groups", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);
    
    if (!userProfile || !userProfile.groups) {
      return c.json({ groups: [] });
    }

    const groups = [];
    for (const groupId of userProfile.groups) {
      const group = await kv.get(`group:${groupId}`);
      if (group) {
        // Calculate user's balance in this group
        const expenses = await kv.getByPrefix(`expense:${groupId}:`);
        let userBalance = 0;
        
        for (const expense of expenses) {
          if (expense.paidBy === userId) {
            userBalance += expense.amount;
          }
          const userShare = expense.participants.find((p: any) => p.userId === userId);
          if (userShare) {
            userBalance -= userShare.share;
          }
        }

        groups.push({
          ...group,
          userBalance,
          memberCount: group.members.length,
          recentActivity: expenses.length > 0 ? expenses[expenses.length - 1].createdAt : group.createdAt
        });
      }
    }

    return c.json({ groups });
  } catch (error) {
    console.log('Groups fetch error:', error);
    return c.json({ error: 'Failed to fetch groups' }, 500);
  }
});

// Expense Routes
app.post("/make-server-dcdac55e/expenses", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const { title, description, amount, groupId, category, participants } = await c.req.json();
    
    // Verify user is member of the group
    const group = await kv.get(`group:${groupId}`);
    if (!group || !group.members.includes(userId)) {
      return c.json({ error: 'You are not a member of this group' }, 403);
    }

    const expenseId = crypto.randomUUID();
    const expense = {
      id: expenseId,
      title,
      description,
      amount: parseFloat(amount),
      groupId,
      category,
      paidBy: userId,
      participants,
      status: 'pending',
      createdAt: new Date().toISOString(),
      createdBy: userId
    };

    await kv.set(`expense:${groupId}:${expenseId}`, expense);
    
    // Update group total expenses
    group.totalExpenses = (group.totalExpenses || 0) + expense.amount;
    await kv.set(`group:${groupId}`, group);

    return c.json({ expense, message: 'Expense created successfully' });
  } catch (error) {
    console.log('Expense creation error:', error);
    return c.json({ error: 'Failed to create expense' }, 500);
  }
});

app.get("/make-server-dcdac55e/expenses", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const groupId = c.req.query('groupId');
    
    let expenses = [];
    
    if (groupId) {
      // Get expenses for specific group
      expenses = await kv.getByPrefix(`expense:${groupId}:`);
    } else {
      // Get all expenses for user's groups
      const userProfile = await kv.get(`user:${userId}`);
      if (userProfile && userProfile.groups) {
        for (const userGroupId of userProfile.groups) {
          const groupExpenses = await kv.getByPrefix(`expense:${userGroupId}:`);
          expenses = [...expenses, ...groupExpenses];
        }
      }
    }

    // Sort by creation date (newest first)
    expenses.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return c.json({ expenses });
  } catch (error) {
    console.log('Expenses fetch error:', error);
    return c.json({ error: 'Failed to fetch expenses' }, 500);
  }
});

// Dashboard Stats
app.get("/make-server-dcdac55e/dashboard/stats", requireAuth, async (c) => {
  try {
    const userId = c.get('userId');
    const userProfile = await kv.get(`user:${userId}`);
    
    if (!userProfile) {
      return c.json({ error: 'User profile not found' }, 404);
    }

    let totalBalance = 0;
    let youOwe = 0;
    let youAreOwed = 0;
    let totalExpenses = 0;
    let totalAmountTracked = 0;

    // Calculate balances across all groups
    if (userProfile.groups) {
      for (const groupId of userProfile.groups) {
        const expenses = await kv.getByPrefix(`expense:${groupId}:`);
        
        for (const expense of expenses) {
          totalExpenses++;
          totalAmountTracked += expense.amount;
          
          if (expense.paidBy === userId) {
            totalBalance += expense.amount;
          }
          
          const userShare = expense.participants.find((p: any) => p.userId === userId);
          if (userShare) {
            totalBalance -= userShare.share;
            
            if (expense.paidBy === userId) {
              youAreOwed += (expense.amount - userShare.share);
            } else {
              youOwe += userShare.share;
            }
          }
        }
      }
    }

    const stats = {
      totalBalance: totalBalance.toFixed(2),
      youOwe: youOwe.toFixed(2),
      youAreOwed: youAreOwed.toFixed(2),
      activeGroups: userProfile.groups?.length || 0,
      totalExpenses,
      totalAmountTracked: totalAmountTracked.toFixed(2)
    };

    return c.json({ stats });
  } catch (error) {
    console.log('Dashboard stats error:', error);
    return c.json({ error: 'Failed to fetch dashboard stats' }, 500);
  }
});

Deno.serve(app.fetch);