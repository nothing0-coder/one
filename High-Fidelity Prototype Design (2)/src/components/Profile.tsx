import { useState } from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from './ui/switch';
import { Separator } from './ui/separator';
import { 
  User, 
  Mail, 
  Phone, 
  Settings, 
  Bell, 
  Shield, 
  CreditCard,
  Download,
  LogOut,
  Edit,
  Check,
  X,
  DollarSign,
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567'
  });

  const [notifications, setNotifications] = useState({
    expenseUpdates: true,
    paymentReminders: true,
    groupInvites: true,
    weeklyReports: false
  });

  const userStats = [
    {
      label: 'Total Groups',
      value: '4',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      label: 'Expenses Created',
      value: '23',
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      label: 'Amount Tracked',
      value: '$2,847.50',
      icon: TrendingUp,
      color: 'text-purple-600'
    },
    {
      label: 'Member Since',
      value: 'Jan 2024',
      icon: Calendar,
      color: 'text-orange-600'
    }
  ];

  const recentActivity = [
    {
      action: 'Created expense "Dinner at Olive Garden"',
      group: 'Friends Trip',
      amount: '$89.50',
      time: '2 hours ago'
    },
    {
      action: 'Settled up with Alice Smith',
      group: 'Weekend Getaway',
      amount: '$45.20',
      time: '1 day ago'
    },
    {
      action: 'Joined group "Office Lunch"',
      group: 'Office Lunch',
      amount: '-',
      time: '3 days ago'
    }
  ];

  const handleSaveProfile = () => {
    setIsEditing(false);
    // Here you would typically save to backend
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedProfile({
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+1 (555) 123-4567'
    });
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div {...fadeInUp}>
        <h1 className="text-2xl md:text-3xl mb-2">Profile & Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <motion.div className="lg:col-span-2 space-y-6" {...fadeInUp}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </CardTitle>
              {!isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                    <X className="w-4 h-4" />
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile}>
                    <Check className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="text-xl">JD</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Button variant="outline" size="sm">
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Recommended: Square image, at least 400x400px
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={editedProfile.name}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm py-2">{editedProfile.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      type="email"
                      value={editedProfile.email}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, email: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm py-2">{editedProfile.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      value={editedProfile.phone}
                      onChange={(e) => setEditedProfile(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  ) : (
                    <p className="text-sm py-2">{editedProfile.phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Account Status</Label>
                  <Badge className="bg-green-100 text-green-800 border-green-200">
                    <Check className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Expense Updates</p>
                  <p className="text-sm text-muted-foreground">Get notified when expenses are added or updated</p>
                </div>
                <Switch
                  checked={notifications.expenseUpdates}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, expenseUpdates: checked }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Payment Reminders</p>
                  <p className="text-sm text-muted-foreground">Reminders for outstanding balances</p>
                </div>
                <Switch
                  checked={notifications.paymentReminders}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, paymentReminders: checked }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Group Invites</p>
                  <p className="text-sm text-muted-foreground">Notifications for new group invitations</p>
                </div>
                <Switch
                  checked={notifications.groupInvites}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, groupInvites: checked }))
                  }
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Weekly Reports</p>
                  <p className="text-sm text-muted-foreground">Weekly summary of your expenses</p>
                </div>
                <Switch
                  checked={notifications.weeklyReports}
                  onCheckedChange={(checked) => 
                    setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Account Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Export Data
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Privacy Settings
                </Button>
                <Button variant="outline" className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Methods
                </Button>
                <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2">
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar Stats and Activity */}
        <motion.div className="space-y-6" {...fadeInUp}>
          {/* User Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Your Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg bg-${stat.color.split('-')[1]}-100 flex items-center justify-center`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <span className="text-sm text-muted-foreground">{stat.label}</span>
                  </div>
                  <span className="font-medium">{stat.value}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="space-y-2">
                  <p className="text-sm">{activity.action}</p>
                  <div className="flex justify-between items-center text-xs text-muted-foreground">
                    <span>{activity.group}</span>
                    <span>{activity.time}</span>
                  </div>
                  {activity.amount !== '-' && (
                    <p className="text-sm font-medium text-green-600">{activity.amount}</p>
                  )}
                  {index < recentActivity.length - 1 && <Separator className="mt-4" />}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Mail className="w-4 h-4 mr-2" />
                Invite Friends
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Download App
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Shield className="w-4 h-4 mr-2" />
                Help & Support
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}