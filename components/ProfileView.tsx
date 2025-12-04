
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useAuditLogs } from '../hooks/useAuditLogs';
import { AuditAction } from '../types';
import { User, Mail, Phone, MapPin, Shield, Key, Lock, Activity, FileText, Plus, FileClock, Save, CheckCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Flex } from './ui/flex';
import { Grid } from './ui/grid';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { RoleBadge } from './StatusBadges';
import { useToast } from '../contexts/ToastContext';

export const ProfileView: React.FC = () => {
  const { currentUser, updateProfile } = useAuth();
  const { logs, loadLogs } = useAuditLogs();
  const toast = useToast();

  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [isSaving, setIsSaving] = useState(false);

  // Security state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (currentUser) {
        setName(currentUser.name);
        setEmail(currentUser.email);
        setPhone(currentUser.phone || '');
        setAddress(currentUser.address || '');
    }
    loadLogs();
  }, [currentUser, loadLogs]);

  // Filter logs for current user
  const myActivity = logs.filter(log => 
    log.performed_by === currentUser?.name || 
    log.performed_by === currentUser?.email
  );

  const handleUpdateProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      setIsSaving(true);
      
      // Simulate API call
      setTimeout(() => {
          updateProfile({
              name,
              email,
              phone,
              address
          });
          toast.success("Profile updated successfully");
          setIsSaving(false);
      }, 800);
  };

  const handleChangePassword = (e: React.FormEvent) => {
      e.preventDefault();
      if (newPassword !== confirmPassword) {
          toast.error("New passwords do not match");
          return;
      }
      toast.success("Password updated successfully");
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in duration-500">
        
        {/* Profile Header */}
        <div className="relative rounded-xl overflow-hidden bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm">
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            <div className="px-8 pb-8">
                <Flex align="end" className="relative -mt-12 mb-4 flex-col sm:flex-row gap-4 sm:gap-0">
                    <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-800 shadow-md">
                        <AvatarImage src={currentUser.avatar_url} />
                        <AvatarFallback className="text-2xl bg-slate-200 dark:bg-slate-700">{currentUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="sm:ml-6 flex-1 text-center sm:text-left mb-2">
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h1>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{currentUser.email}</p>
                    </div>
                    <div className="mb-2">
                        <RoleBadge role={currentUser.role} />
                    </div>
                </Flex>
            </div>
        </div>

        <Tabs defaultValue="general" className="w-full">
            <TabsList className="mb-6">
                <TabsTrigger value="general"><User className="w-4 h-4 mr-2" /> General</TabsTrigger>
                <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" /> Security</TabsTrigger>
                <TabsTrigger value="activity"><Activity className="w-4 h-4 mr-2" /> My Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="general">
                <Grid cols={1} className="lg:grid-cols-3" gap={8}>
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Profile Information</CardTitle>
                                <CardDescription>Update your personal details and contact information.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleUpdateProfile}>
                                <CardContent className="space-y-6">
                                    <Grid cols={1} className="md:grid-cols-2" gap={6}>
                                        <div>
                                            <Label htmlFor="name">Full Name</Label>
                                            <div className="relative mt-1">
                                                <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input id="name" value={name} onChange={e => setName(e.target.value)} className="pl-10" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="email">Email Address</Label>
                                            <div className="relative mt-1">
                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="pl-10" />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="phone">Phone Number</Label>
                                            <div className="relative mt-1">
                                                <Phone className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input id="phone" type="tel" value={phone} onChange={e => setPhone(e.target.value)} className="pl-10" placeholder="+1..." />
                                            </div>
                                        </div>
                                        <div>
                                            <Label htmlFor="address">Address</Label>
                                            <div className="relative mt-1">
                                                <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                                <Input id="address" value={address} onChange={e => setAddress(e.target.value)} className="pl-10" />
                                            </div>
                                        </div>
                                    </Grid>
                                </CardContent>
                                <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                                    <Button type="submit" isLoading={isSaving}>Save Changes</Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                    
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Role & Permissions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="mb-4">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Current Role</span>
                                    <div className="mt-1"><RoleBadge role={currentUser.role} /></div>
                                </div>
                                <div className="mb-4">
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Department</span>
                                    <p className="mt-1 text-sm font-medium text-gray-900 dark:text-white">{currentUser.department || 'General'}</p>
                                </div>
                                <div>
                                    <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Status</span>
                                    <div className="mt-1 flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </Grid>
            </TabsContent>

            <TabsContent value="security">
                <Grid cols={1} className="lg:grid-cols-2" gap={8}>
                    <Card>
                        <CardHeader>
                            <CardTitle>Change Password</CardTitle>
                            <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
                        </CardHeader>
                        <form onSubmit={handleChangePassword}>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="current">Current Password</Label>
                                    <div className="relative mt-1">
                                        <Key className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input id="current" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="pl-10" />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="new">New Password</Label>
                                    <div className="relative mt-1">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input id="new" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="pl-10" />
                                    </div>
                                </div>
                                <div>
                                    <Label htmlFor="confirm">Confirm New Password</Label>
                                    <div className="relative mt-1">
                                        <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                                        <Input id="confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="pl-10" />
                                    </div>
                                </div>
                            </CardContent>
                            <div className="px-6 py-4 bg-gray-50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-slate-700 flex justify-end">
                                <Button type="submit">Update Password</Button>
                            </div>
                        </form>
                    </Card>

                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Two-Factor Authentication</CardTitle>
                                <CardDescription>Add an extra layer of security to your account.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Flex align="center" justify="between" className="p-4 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700">
                                    <Flex gap={3}>
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                            <Shield className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">2FA is currently disabled</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Protect your account with an authenticator app.</p>
                                        </div>
                                    </Flex>
                                    <Button variant="outline" size="sm">Enable</Button>
                                </Flex>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Active Sessions</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Flex align="center" justify="between" className="text-sm">
                                    <Flex gap={3}>
                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">Chrome on Windows</p>
                                            <p className="text-xs text-gray-500">Jakarta, ID • Current Session</p>
                                        </div>
                                    </Flex>
                                </Flex>
                            </CardContent>
                        </Card>
                    </div>
                </Grid>
            </TabsContent>

            <TabsContent value="activity">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>A history of changes and actions performed by your account.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {myActivity.length > 0 ? (
                            <div className="relative border-l-2 border-gray-200 dark:border-slate-700 ml-4 space-y-8 my-4">
                                {myActivity.map((log) => {
                                    let Icon = FileText;
                                    let bgClass = "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300";
                                    
                                    if (log.action === AuditAction.CREATE) { Icon = Plus; bgClass = "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"; }
                                    if (log.action === AuditAction.UPDATE) { Icon = FileClock; bgClass = "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"; }
                                    if (log.action === AuditAction.DELETE) { Icon = Shield; bgClass = "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"; }

                                    return (
                                        <div key={log.id} className="relative pl-8">
                                            <span className={`absolute -left-[11px] top-0 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white dark:ring-slate-900 ${bgClass}`}>
                                                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                                            </span>
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{log.action} {log.entity}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{log.details}</p>
                                                </div>
                                                <div className="whitespace-nowrap text-right">
                                                    <time className="text-xs text-gray-400 block">{new Date(log.created_at).toLocaleString()}</time>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="bg-gray-100 dark:bg-slate-800 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Activity className="w-6 h-6 text-gray-400" />
                                </div>
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">No activity found</h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">You haven't performed any actions yet.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>
        </Tabs>
    </div>
  );
};
