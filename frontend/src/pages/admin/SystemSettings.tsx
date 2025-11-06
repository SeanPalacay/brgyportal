import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Settings,
  Save,
  FileText,
  Bell,
  Mail,
  RefreshCw,
  AlertCircle,
  Info,
  Heart,
  Gift,
  MessageSquare,
  List,
} from 'lucide-react';
// import { SystemBackup } from '@/types';
import { api } from '@/lib/api';
import { FeaturesTab, BenefitsTab, TestimonialsTab, ServiceFeaturesTab } from '@/components/admin/CMSTabs';

interface SystemConfig {
  barangayName: string;
  barangayAddress: string;
  barangayContactNumber: string;
  barangayEmail: string;
  captainName: string;
  timezone: string;
  dateFormat: string;
  emailNotifications: boolean;
  smsNotifications: boolean;
  maintenanceMode: boolean;
  autoApproveRegistrations: boolean;
  sessionTimeout: number;
  maxLoginAttempts: number;
  passwordExpiryDays: number;
  backupFrequency: string;
  lastBackupDate?: string;
}

export default function SystemSettings() {
  const [config, setConfig] = useState<SystemConfig>({
    barangayName: '',
    barangayAddress: '',
    barangayContactNumber: '',
    barangayEmail: '',
    captainName: '',
    timezone: 'Asia/Manila',
    dateFormat: 'MM/DD/YYYY',
    emailNotifications: true,
    smsNotifications: false,
    maintenanceMode: false,
    autoApproveRegistrations: false,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordExpiryDays: 90,
    backupFrequency: 'daily',
    lastBackupDate: undefined
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const navigate = useNavigate();

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/settings');
      const settingsData = response.data.settings;
      if (settingsData) {
        setConfig(prevConfig => ({ ...prevConfig, ...settingsData }));
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load system settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await api.put('/admin/settings', config);
      toast.success('Settings saved successfully', {
        description: 'System configuration has been updated.'
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };


  const handleTestEmail = async () => {
    try {
      toast.info('Sending test email...');
      await api.post('/admin/test-email');
      toast.success('Test email sent', {
        description: `Check your inbox at ${config.barangayEmail}`
      });
    } catch (error) {
      console.error('Error sending test email:', error);
      toast.error('Failed to send test email');
    }
  };

  const handleTestSMS = async () => {
    try {
      toast.info('Sending test SMS...');
      await api.post('/admin/test-sms');
      toast.success('Test SMS sent', {
        description: `Check your phone at ${config.barangayContactNumber}`
      });
    } catch (error) {
      console.error('Error sending test SMS:', error);
      toast.error('Failed to send test SMS');
    }
  };


  const updateConfig = (key: keyof SystemConfig, value: string | number | boolean) => {
    setConfig({ ...config, [key]: value });
  };



  if (loading) {
    return (
      <DashboardLayout currentPage="System Settings">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading settings...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="System Settings">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
            <p className="text-muted-foreground">
              Configure system-wide settings and preferences
            </p>
          </div>
          <Button onClick={handleSaveSettings} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>

        {/* Maintenance Mode Warning */}
        {config.maintenanceMode && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div className="flex-1">
                  <h3 className="font-semibold text-yellow-900">Maintenance Mode Active</h3>
                  <p className="text-sm text-yellow-800 mt-1">
                    The system is currently in maintenance mode. Only administrators can access the portal.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="general">
              <Settings className="mr-2 h-4 w-4" />
              General
            </TabsTrigger>
            <TabsTrigger value="features">
              <Heart className="mr-2 h-4 w-4" />
              Features
            </TabsTrigger>
            <TabsTrigger value="benefits">
              <Gift className="mr-2 h-4 w-4" />
              Benefits
            </TabsTrigger>
            <TabsTrigger value="testimonials">
              <MessageSquare className="mr-2 h-4 w-4" />
              Testimonials
            </TabsTrigger>
            <TabsTrigger value="service-features">
              <List className="mr-2 h-4 w-4" />
              Services
            </TabsTrigger>
          </TabsList>

          {/* General Settings */}
          <TabsContent value="general" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Barangay Information</CardTitle>
                <CardDescription>
                  Basic information about your barangay
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="barangayName">Barangay Name</Label>
                    <Input
                      id="barangayName"
                      value={config.barangayName}
                      onChange={(e) => updateConfig('barangayName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="captainName">Barangay Captain</Label>
                    <Input
                      id="captainName"
                      value={config.captainName}
                      onChange={(e) => updateConfig('captainName', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="barangayAddress">Address</Label>
                    <Textarea
                      id="barangayAddress"
                      value={config.barangayAddress}
                      onChange={(e) => updateConfig('barangayAddress', e.target.value)}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barangayContactNumber">Contact Number</Label>
                    <Input
                      id="barangayContactNumber"
                      value={config.barangayContactNumber}
                      onChange={(e) => updateConfig('barangayContactNumber', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="barangayEmail">Email Address</Label>
                    <Input
                      id="barangayEmail"
                      type="email"
                      value={config.barangayEmail}
                      onChange={(e) => updateConfig('barangayEmail', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regional Settings</CardTitle>
                <CardDescription>
                  Configure timezone and date format preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={config.timezone}
                      onValueChange={(value) => updateConfig('timezone', value)}
                    >
                      <SelectTrigger id="timezone">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Manila">Asia/Manila (PHT)</SelectItem>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dateFormat">Date Format</Label>
                    <Select
                      value={config.dateFormat}
                      onValueChange={(value) => updateConfig('dateFormat', value)}
                    >
                      <SelectTrigger id="dateFormat">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notification Settings */}
          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Configure email notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications">Enable Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via email to users
                    </p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={config.emailNotifications}
                    onCheckedChange={(checked) => updateConfig('emailNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Email Server Configuration</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input placeholder="SMTP Server" />
                    <Input placeholder="Port" type="number" />
                    <Input placeholder="Username" />
                    <Input placeholder="Password" type="password" />
                  </div>
                </div>

                <Button variant="outline" onClick={handleTestEmail}>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Test Email
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>SMS Notifications</CardTitle>
                <CardDescription>
                  Configure SMS notification settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="smsNotifications">Enable SMS Notifications</Label>
                    <p className="text-sm text-muted-foreground">
                      Send notifications via SMS to users
                    </p>
                  </div>
                  <Switch
                    id="smsNotifications"
                    checked={config.smsNotifications}
                    onCheckedChange={(checked) => updateConfig('smsNotifications', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>SMS Gateway Configuration</Label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Input placeholder="API Key" type="password" />
                    <Input placeholder="Sender ID" />
                  </div>
                </div>

                <Button variant="outline" onClick={handleTestSMS} disabled={!config.smsNotifications}>
                  <Bell className="mr-2 h-4 w-4" />
                  Send Test SMS
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Settings */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Authentication Settings</CardTitle>
                <CardDescription>
                  Configure user authentication and security policies
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={config.sessionTimeout}
                      onChange={(e) => updateConfig('sessionTimeout', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Users will be logged out after this period of inactivity
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxLoginAttempts">Max Login Attempts</Label>
                    <Input
                      id="maxLoginAttempts"
                      type="number"
                      value={config.maxLoginAttempts}
                      onChange={(e) => updateConfig('maxLoginAttempts', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Account will be locked after this many failed attempts
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passwordExpiryDays">Password Expiry (days)</Label>
                    <Input
                      id="passwordExpiryDays"
                      type="number"
                      value={config.passwordExpiryDays}
                      onChange={(e) => updateConfig('passwordExpiryDays', parseInt(e.target.value))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Users must change password after this many days
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="autoApproveRegistrations">Auto-Approve Registrations</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically activate new user accounts without admin approval
                    </p>
                  </div>
                  <Switch
                    id="autoApproveRegistrations"
                    checked={config.autoApproveRegistrations}
                    onCheckedChange={(checked) => updateConfig('autoApproveRegistrations', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="text-red-600">Danger Zone</CardTitle>
                <CardDescription>
                  Critical system settings that affect all users
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenanceMode" className="text-red-600">Maintenance Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Block all non-admin users from accessing the system
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={config.maintenanceMode}
                    onCheckedChange={(checked) => updateConfig('maintenanceMode', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>


          {/* System Settings */}
          <TabsContent value="system" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>System Information</CardTitle>
                <CardDescription>
                  Current system status and information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Info className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">System information unavailable</p>
                  <p className="text-sm text-muted-foreground mt-1">Connect to system monitoring API for detailed metrics</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Logs</CardTitle>
                <CardDescription>
                  Recent system activity and errors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-muted-foreground">System logs will be displayed here</p>
                  <p className="text-sm text-muted-foreground mt-1">Connect to audit logs API to view recent activity</p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => navigate('/admin/settings/audit-logs')}>
                  <FileText className="mr-2 h-4 w-4" />
                  View All Logs
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          {/* CMS Content Management Tabs */}
          <TabsContent value="features" className="space-y-4">
            <FeaturesTab />
          </TabsContent>

          <TabsContent value="benefits" className="space-y-4">
            <BenefitsTab />
          </TabsContent>

          <TabsContent value="testimonials" className="space-y-4">
            <TestimonialsTab />
          </TabsContent>

          <TabsContent value="service-features" className="space-y-4">
            <ServiceFeaturesTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
