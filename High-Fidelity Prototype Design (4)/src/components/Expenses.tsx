import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plus, 
  Receipt, 
  DollarSign, 
  Calendar,
  Users,
  Filter,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export default function Expenses() {
  const { accessToken } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    amount: '',
    groupId: '',
    category: ''
  });

  useEffect(() => {
    if (accessToken) {
      loadExpenses();
      loadGroups();
    }
  }, [accessToken]);

  const loadExpenses = async () => {
    try {
      const result = await api.getExpenses(accessToken!);
      if (result.error) {
        toast.error('Failed to load expenses');
      } else {
        setExpenses(result.expenses || []);
      }
    } catch (error) {
      console.error('Expenses load error:', error);
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const loadGroups = async () => {
    try {
      const result = await api.getGroups(accessToken!);
      if (!result.error) {
        setGroups(result.groups || []);
      }
    } catch (error) {
      console.error('Groups load error:', error);
    }
  };

  const categories = [
    "Food & Dining", "Transportation", "Groceries", "Entertainment", 
    "Utilities", "Shopping", "Travel", "Other"
  ];

  const handleCreateExpense = async () => {
    if (!formData.title.trim() || !formData.amount || !formData.groupId) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreateLoading(true);
    try {
      // Get group members for splitting
      const membersResult = await api.getGroupMembers(accessToken!, formData.groupId);
      if (membersResult.error) {
        toast.error('Failed to get group members');
        return;
      }

      const participants = membersResult.members.map((member: any) => ({
        userId: member.id,
        name: member.name,
        share: parseFloat(formData.amount) / membersResult.members.length
      }));

      const expenseData = {
        title: formData.title,
        description: formData.description,
        amount: formData.amount,
        groupId: formData.groupId,
        category: formData.category || 'Other',
        participants
      };

      const result = await api.createExpense(accessToken!, expenseData);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Expense added successfully!');
        setIsCreateDialogOpen(false);
        setFormData({ title: '', description: '', amount: '', groupId: '', category: '' });
        loadExpenses(); // Reload expenses
      }
    } catch (error) {
      console.error('Expense creation error:', error);
      toast.error('Failed to add expense');
    } finally {
      setCreateLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'settled': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'partial': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'settled': return <CheckCircle className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'partial': return <Clock className="w-3 h-3" />;
      default: return <Clock className="w-3 h-3" />;
    }
  };

  const filteredExpenses = expenses.filter(expense => {
    if (activeFilter === 'all') return true;
    return expense.status === activeFilter;
  });

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        {...fadeInUp}
      >
        <div>
          <h1 className="text-2xl md:text-3xl mb-2">Expenses</h1>
          <p className="text-muted-foreground">Track and manage all your shared expenses</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Add New Expense</DialogTitle>
              <DialogDescription>
                Add a new expense to split with your group members.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expense-title">Title</Label>
                  <Input 
                    id="expense-title" 
                    placeholder="e.g., Dinner, Gas, Movie tickets"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="expense-amount">Amount</Label>
                  <Input 
                    id="expense-amount" 
                    type="number"
                    placeholder="0.00"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expense-description">Description (Optional)</Label>
                <Textarea 
                  id="expense-description" 
                  placeholder="Additional details about the expense"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Group</Label>
                  <Select value={formData.groupId} onValueChange={(value) => setFormData(prev => ({ ...prev, groupId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select group" />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((group) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setFormData({ title: '', description: '', amount: '', groupId: '', category: '' });
                  }}
                  disabled={createLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateExpense} disabled={createLoading}>
                  {createLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Expense
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Filters and Search */}
      <motion.div 
        className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between"
        {...fadeInUp}
      >
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full md:w-auto">
          <TabsList className="grid w-full grid-cols-4 md:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="settled">Settled</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="partial">Partial</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search expenses..." className="pl-10" />
          </div>
          <Button variant="outline" size="icon">
            <Filter className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Expenses List */}
      <motion.div 
        className="space-y-4"
        initial="initial"
        animate="animate"
        variants={{
          animate: {
            transition: {
              staggerChildren: 0.05
            }
          }
        }}
      >
        <AnimatePresence>
          {filteredExpenses.map((expense) => (
            <motion.div
              key={expense.id}
              variants={fadeInUp}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              layout
            >
              <Card className="hover:shadow-md transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Receipt className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-medium">{expense.title}</h3>
                              <p className="text-sm text-muted-foreground">{expense.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground ml-13">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(expense.createdAt)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {groups.find(g => g.id === expense.groupId)?.name || 'Unknown Group'}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {expense.category}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-medium">${expense.amount.toFixed(2)}</p>
                          <Badge className={`${getStatusColor(expense.status)}`}>
                            {getStatusIcon(expense.status)}
                            <span className="ml-1 capitalize">{expense.status}</span>
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Split between:</span>
                            {expense.participants?.slice(0, 3).map((participant: any, idx: number) => (
                              <Avatar key={idx} className="w-6 h-6">
                                <AvatarFallback className="text-xs">
                                  {participant.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {(expense.participants?.length || 0) > 3 && (
                              <span className="text-xs text-muted-foreground">
                                +{(expense.participants?.length || 0) - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Your share info */}
                      <div className="mt-4 p-3 bg-accent/30 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Your share:</span>
                          <span className="font-medium">
                            ${(expense.participants?.[0]?.share || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredExpenses.length === 0 && (
        <motion.div 
          className="text-center py-12"
          {...fadeInUp}
        >
          <Receipt className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No expenses found</h3>
          <p className="text-muted-foreground mb-4">
            {activeFilter === 'all' 
              ? "Start by adding your first expense" 
              : `No ${activeFilter} expenses found`
            }
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Expense
          </Button>
        </motion.div>
      )}
    </div>
  );
}