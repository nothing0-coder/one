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
import { 
  Plus, 
  Users, 
  DollarSign, 
  MoreVertical, 
  Settings,
  UserPlus,
  TrendingUp,
  Calendar,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../utils/supabase/client';
import { toast } from 'sonner@2.0.3';

export default function Groups() {
  const { accessToken } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isAddMemberDialogOpen, setIsAddMemberDialogOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [addMemberLoading, setAddMemberLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [memberFormData, setMemberFormData] = useState({
    email: '',
    name: ''
  });

  useEffect(() => {
    if (accessToken) {
      loadGroups();
    }
  }, [accessToken]);

  const loadGroups = async () => {
    try {
      const result = await api.getGroups(accessToken!);
      if (result.error) {
        toast.error('Failed to load groups');
      } else {
        setGroups(result.groups || []);
      }
    } catch (error) {
      console.error('Groups load error:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async () => {
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    setCreateLoading(true);
    try {
      const result = await api.createGroup(accessToken!, formData.name, formData.description);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Group created successfully!');
        setIsCreateDialogOpen(false);
        setFormData({ name: '', description: '' });
        loadGroups(); // Reload groups
      }
    } catch (error) {
      console.error('Group creation error:', error);
      toast.error('Failed to create group');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!memberFormData.email.trim() || !memberFormData.name.trim()) {
      toast.error('Email and name are required');
      return;
    }

    setAddMemberLoading(true);
    try {
      const result = await api.addGroupMember(accessToken!, selectedGroupId, memberFormData.email, memberFormData.name);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success('Member added successfully!');
        setIsAddMemberDialogOpen(false);
        setMemberFormData({ email: '', name: '' });
        setSelectedGroupId('');
        loadGroups(); // Reload groups
      }
    } catch (error) {
      console.error('Add member error:', error);
      toast.error('Failed to add member');
    } finally {
      setAddMemberLoading(false);
    }
  };

  const openAddMemberDialog = (groupId: string) => {
    setSelectedGroupId(groupId);
    setIsAddMemberDialogOpen(true);
  };

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



  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
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
      {/* Header */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        {...fadeInUp}
      >
        <div>
          <h1 className="text-2xl md:text-3xl mb-2">Your Groups</h1>
          <p className="text-muted-foreground">Manage your expense groups and members</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Group
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create New Group</DialogTitle>
              <DialogDescription>
                Create a new group to start splitting expenses with friends and family.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="group-name">Group Name</Label>
                <Input 
                  id="group-name" 
                  placeholder="e.g., Weekend Trip, Roommates"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="group-description">Description (Optional)</Label>
                <Textarea 
                  id="group-description" 
                  placeholder="Brief description of the group"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setFormData({ name: '', description: '' });
                  }}
                  disabled={createLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleCreateGroup} disabled={createLoading}>
                  {createLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Group
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Member Dialog */}
        <Dialog open={isAddMemberDialogOpen} onOpenChange={setIsAddMemberDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Member</DialogTitle>
              <DialogDescription>
                Add a new member to this group by entering their email and name.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="member-email">Email</Label>
                <Input 
                  id="member-email" 
                  type="email"
                  placeholder="member@example.com"
                  value={memberFormData.email}
                  onChange={(e) => setMemberFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-name">Name</Label>
                <Input 
                  id="member-name" 
                  placeholder="Member's full name"
                  value={memberFormData.name}
                  onChange={(e) => setMemberFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsAddMemberDialogOpen(false);
                    setMemberFormData({ email: '', name: '' });
                    setSelectedGroupId('');
                  }}
                  disabled={addMemberLoading}
                >
                  Cancel
                </Button>
                <Button onClick={handleAddMember} disabled={addMemberLoading}>
                  {addMemberLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Member
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </motion.div>

      {/* Groups Grid */}
      <motion.div 
        className="grid md:grid-cols-2 gap-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        <AnimatePresence>
          {groups.map((group) => (
            <motion.div
              key={group.id}
              variants={fadeInUp}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              layout
            >
              <Card className="cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg ${group.color || 'bg-gradient-to-br from-blue-500 to-purple-600'} flex items-center justify-center`}>
                          <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{group.description}</p>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Balance Info */}
                  <div className="flex justify-between items-center p-3 bg-accent/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Your balance</span>
                    </div>
                    <span className={`font-medium ${
                      (group.userBalance || 0) > 0 
                        ? 'text-green-600' 
                        : (group.userBalance || 0) < 0 
                          ? 'text-red-600' 
                          : 'text-muted-foreground'
                    }`}>
                      {(group.userBalance || 0) > 0 ? '+' : ''}${Math.abs(group.userBalance || 0).toFixed(2)}
                    </span>
                  </div>

                  {/* Members */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-muted-foreground">
                        Members ({group.members?.length || group.memberCount || 1})
                      </span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2"
                        onClick={() => openAddMemberDialog(group.id)}
                      >
                        <UserPlus className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      {group.members ? group.members.slice(0, 4).map((member: any, idx: number) => (
                        <Avatar key={member.id || idx} className="w-8 h-8">
                          <AvatarFallback className="text-xs">
                            {member.initials || (member.name ? member.name.split(' ').map((n: string) => n[0]).join('') : 'U')}
                          </AvatarFallback>
                        </Avatar>
                      )) : (
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs">YU</AvatarFallback>
                        </Avatar>
                      )}
                      {(group.members?.length || 0) > 4 && (
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            +{(group.members?.length || 0) - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        ${(group.totalExpenses || 0).toFixed(2)} total
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {group.recentActivity ? formatDate(group.recentActivity) : 'New group'}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 px-2">
                      <Settings className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Empty State */}
      {groups.length === 0 && (
        <motion.div 
          className="text-center py-12"
          {...fadeInUp}
        >
          <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No groups yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first group to start splitting expenses with friends
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Your First Group
          </Button>
        </motion.div>
      )}

      {/* Quick Actions */}
      <motion.div 
        className="grid md:grid-cols-3 gap-4"
        {...fadeInUp}
      >
        <Card className="p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
          <Plus className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-medium mb-1">Create Group</h3>
          <p className="text-sm text-muted-foreground">Start a new expense group</p>
        </Card>
        <Card className="p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
          <UserPlus className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-medium mb-1">Join Group</h3>
          <p className="text-sm text-muted-foreground">Join an existing group</p>
        </Card>
        <Card className="p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
          <Settings className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-medium mb-1">Manage</h3>
          <p className="text-sm text-muted-foreground">Edit group settings</p>
        </Card>
      </motion.div>
    </div>
  );
}