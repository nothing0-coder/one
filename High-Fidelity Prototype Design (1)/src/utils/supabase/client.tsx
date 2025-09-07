import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

export const apiUrl = `https://${projectId}.supabase.co/functions/v1/make-server-dcdac55e`;

// API helper functions
export const api = {
  // Auth
  async signup(email: string, password: string, name: string) {
    const response = await fetch(`${apiUrl}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${publicAnonKey}`
      },
      body: JSON.stringify({ email, password, name })
    });
    return response.json();
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { session, error };
  },

  // User Profile
  async getProfile(accessToken: string) {
    const response = await fetch(`${apiUrl}/user/profile`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.json();
  },

  async updateProfile(accessToken: string, updates: any) {
    const response = await fetch(`${apiUrl}/user/profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(updates)
    });
    return response.json();
  },

  // Groups
  async createGroup(accessToken: string, name: string, description: string) {
    const response = await fetch(`${apiUrl}/groups`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ name, description })
    });
    return response.json();
  },

  async getGroups(accessToken: string) {
    const response = await fetch(`${apiUrl}/groups`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.json();
  },

  async addGroupMember(accessToken: string, groupId: string, email: string, name: string) {
    const response = await fetch(`${apiUrl}/groups/${groupId}/members`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({ email, name })
    });
    return response.json();
  },

  async getGroupMembers(accessToken: string, groupId: string) {
    const response = await fetch(`${apiUrl}/groups/${groupId}/members`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.json();
  },

  // Expenses
  async createExpense(accessToken: string, expense: any) {
    const response = await fetch(`${apiUrl}/expenses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify(expense)
    });
    return response.json();
  },

  async getExpenses(accessToken: string, groupId?: string) {
    const url = groupId ? `${apiUrl}/expenses?groupId=${groupId}` : `${apiUrl}/expenses`;
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.json();
  },

  // Dashboard
  async getDashboardStats(accessToken: string) {
    const response = await fetch(`${apiUrl}/dashboard/stats`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    return response.json();
  }
};