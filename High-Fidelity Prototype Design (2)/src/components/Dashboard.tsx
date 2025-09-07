import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Clock,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export default function Dashboard() {
  const { user, accessToken } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [recentExpenses, setRecentExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (accessToken) {
      loadDashboardData();
    }
  }, [accessToken]);

  const loadDashboardData = async () => {
    try {
      const [statsResult, expensesResult] = await Promise.all([
        api.getDashboardStats(accessToken!),
        api.getExpenses(accessToken!)
      ]);

      if (statsResult.error) {
        toast.error('Failed to load dashboard stats');
      } else {
        setStats(statsResult.stats);
      }

      if (expensesResult.error) {
        toast.error('Failed to load recent expenses');
      } else {
        setRecentExpenses(expensesResult.expenses.slice(0, 3));
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = stats ? [
    {
      title: "Total Balance",
      value: `${Math.abs(parseFloat(stats.totalBalance)).toFixed(2)}`,
      change: parseFloat(stats.totalBalance) >= 0 ? "+12.5%" : "-8.2%",
      trend: parseFloat(stats.totalBalance) >= 0 ? "up" : "down",
      icon: DollarSign,
      color: parseFloat(stats.totalBalance) >= 0 ? "text-green-600" : "text-red-600"
    },
    {
      title: "You Owe",
      value: `${stats.youOwe}`,
      change: "-8.2%",
      trend: "down",
      icon: ArrowUpRight,
      color: "text-red-600"
    },
    {
      title: "You're Owed",
      value: `${stats.youAreOwed}`,
      change: "+15.7%",
      trend: "up",
      icon: ArrowDownRight,
      color: "text-green-600"
    },
    {
      title: "Active Groups",
      value: stats.activeGroups.toString(),
      change: "+1",
      trend: "up",
      icon: Users,
      color: "text-blue-600"
    }
  ] : [];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays === 1) return '1 day ago';
    return `${diffDays} days ago`;
  };

  const quickActions = [
    { label: "Add Expense", icon: Plus, action: "expense" },
    { label: "Create Group", icon: Users, action: "group" },
    { label: "Settle Up", icon: DollarSign, action: "settle" },
  ];

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div {...fadeInUp}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl mb-2">Welcome back, {user?.name || 'there'}!</h1>
            <p className="text-muted-foreground">Here's your expense overview</p>
          </div>
          <div className="flex gap-3">
            {quickActions.map((action, index) => (
              <Button key={index} className="flex items-center gap-2">
                <action.icon className="w-4 h-4" />
                <span className="hidden sm:inline">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.1
            }
          }
        }}
        initial="initial"
        animate="animate"
      >
        {statsCards.map((stat, index) => (
          <motion.div key={index} variants={fadeInUp}>
            <Card className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-2xl font-medium">{stat.value}</p>
                    <div className="flex items-center gap-1 mt-2">
                      {stat.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3 text-green-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-600" />
                      )}
                      <span className={`text-xs ${stat.color}`}>{stat.change}</span>
                    </div>
                  </div>
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${stat.color.split('-')[1]}-100 to-${stat.color.split('-')[1]}-200 flex items-center justify-center`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Expenses */}
        <motion.div className="lg:col-span-2" {...fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Recent Expenses</CardTitle>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentExpenses.length > 0 ? recentExpenses.map((expense) => (
                <motion.div
                  key={expense.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/50 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium">{expense.title}</h4>
                      <Badge variant={expense.status === 'settled' ? 'default' : 'secondary'}>
                        {expense.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{expense.category}</span>
                      <span>•</span>
                      <span>{formatDate(expense.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {expense.participants.slice(0, 3).map((participant: any, idx: number) => (
                        <Avatar key={idx} className="w-6 h-6">
                          <AvatarFallback className="text-xs">
                            {participant.name ? participant.name.split(' ').map((n: string) => n[0]).join('') : 'U'}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {expense.participants.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{expense.participants.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${expense.amount.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Your share: ${(expense.participants.find((p: any) => p.userId === user?.id)?.share || 0).toFixed(2)}
                    </p>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No recent expenses</p>
                  <Button className="mt-4" size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Your First Expense
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Activity Summary */}
        <motion.div className="space-y-6" {...fadeInUp}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                This Month
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Expenses Created</span>
                  <span className="font-medium">{stats?.totalExpenses || 0}</span>
                </div>
                <Progress value={Math.min((stats?.totalExpenses || 0) * 10, 100)} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Amount Tracked</span>
                  <span className="font-medium">${stats?.totalAmountTracked || '0.00'}</span>
                </div>
                <Progress value={Math.min(parseFloat(stats?.totalAmountTracked || '0') / 10, 100)} className="h-2" />
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Groups Active</span>
                  <span className="font-medium">{stats?.activeGroups || 0}</span>
                </div>
                <Progress value={(stats?.activeGroups || 0) * 25} className="h-2" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Largest expense</span>
                <span className="font-medium">
                  ${recentExpenses.length > 0 ? Math.max(...recentExpenses.map(e => e.amount)).toFixed(2) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total balance</span>
                <span className={`font-medium ${parseFloat(stats?.totalBalance || '0') >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ${Math.abs(parseFloat(stats?.totalBalance || '0')).toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Recent expenses</span>
                <span className="font-medium">{recentExpenses.length}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}