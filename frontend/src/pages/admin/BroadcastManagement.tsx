import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Send, MessageSquare, Clock, CheckCircle, XCircle } from 'lucide-react';

interface BroadcastMessage {
  id: string;
  title: string;
  message: string;
  targetRoles: string[];
  status: 'DRAFT' | 'SENT' | 'SCHEDULED' | 'FAILED';
  sentAt?: string;
  recipientCount: number;
  deliveredCount: number;
  createdBy: string;
  createdAt: string;
}

const AVAILABLE_ROLES = [
  'SYSTEM_ADMIN',
  'BARANGAY_CAPTAIN', 
  'BARANGAY_OFFICIAL',
  'BHW',
  'BHW_COORDINATOR',
  'DAYCARE_STAFF',
  'DAYCARE_TEACHER',
  'SK_OFFICER',
  'SK_CHAIRMAN',
  'PARENT_RESIDENT',
  'KK_MEMBER',
  'VISITOR'
];

export default function BroadcastManagement() {
  const [messages, setMessages] = useState<BroadcastMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [sending, setSending] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetRoles: [] as string[]
  });

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const response = await api.get('/admin/broadcast-messages');
      setMessages(response.data.messages || []);
    } catch {
      toast.error('Failed to fetch broadcast messages');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleToggle = (role: string) => {
    setFormData(prev => ({
      ...prev,
      targetRoles: prev.targetRoles.includes(role)
        ? prev.targetRoles.filter(r => r !== role)
        : [...prev.targetRoles, role]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.targetRoles.length === 0) {
      toast.error('Please select at least one target role');
      return;
    }

    setSending(true);
    try {
      await api.post('/admin/broadcast-messages', {
        ...formData
      });
      toast.success('Broadcast message sent successfully');
      setShowDialog(false);
      setFormData({
        title: '',
        message: '',
        targetRoles: []
      });
      fetchMessages();
    } catch {
      toast.error('Failed to send broadcast message');
    } finally {
      setSending(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      DRAFT: 'outline',
      SENT: 'default',
      SCHEDULED: 'secondary',
      FAILED: 'destructive'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'SCHEDULED':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <DashboardLayout currentPage="/admin/settings/notifications">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Broadcast Management</h1>
            <p className="text-muted-foreground">Send notifications to users by role</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Send className="h-4 w-4 mr-2" />
            New Broadcast
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{messages.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Sent</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {messages.filter(m => m.status === 'SENT').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Scheduled</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-blue-600">
                {messages.filter(m => m.status === 'SCHEDULED').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Recipients</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {messages.reduce((sum, m) => sum + m.recipientCount, 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Broadcast History</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading messages...</p>
            ) : messages.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No broadcast messages yet</p>
                <Button className="mt-4" onClick={() => setShowDialog(true)}>
                  Send First Message
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusIcon(message.status)}
                          <h3 className="font-semibold">{message.title}</h3>
                        </div>
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{message.message}</p>
                        <div className="flex gap-2 flex-wrap">
                          {getStatusBadge(message.status)}
                          {message.targetRoles.map((role) => (
                            <Badge key={role} variant="outline" className="text-xs">
                              {role.replace('_', ' ')}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <div className="text-sm font-medium">
                          {message.deliveredCount}/{message.recipientCount} delivered
                        </div>
                        <div className="text-xs text-gray-500">
                          {message.status === 'SENT' && message.sentAt && (
                            <>Sent: {new Date(message.sentAt).toLocaleString()}</>
                          )}
                          {message.status === 'DRAFT' && (
                            <>Created: {new Date(message.createdAt).toLocaleString()}</>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Send Broadcast Message</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Message title"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Message *</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Message content"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Target Roles *</label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto border p-3 rounded-md">
                  {AVAILABLE_ROLES.map((role) => (
                    <div key={role} className="flex items-center space-x-2">
                      <Checkbox
                        id={role}
                        checked={formData.targetRoles.includes(role)}
                        onCheckedChange={() => handleRoleToggle(role)}
                      />
                      <label htmlFor={role} className="text-sm cursor-pointer">
                        {role.replace('_', ' ')}
                      </label>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Selected: {formData.targetRoles.length} role(s)
                </p>
              </div>
              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={sending}>
                  <Send className="h-4 w-4 mr-2" />
                  {sending ? 'Sending...' : 'Send Now'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
