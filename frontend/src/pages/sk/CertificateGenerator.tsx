import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { FileText, Download, Award, TrendingUp, Calendar, Edit, Trash2 } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  eventDate: string;
  location: string;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Certificate {
  id: string;
  certificateType: string;
  issuedDate: string;
  certificateNumber: string;
  eventId?: string;
  event?: Event;
  userId?: string;
  user?: User;
  participationType?: string;
  achievements?: string;
  issuedBy: string;
}

export default function SKCertificateGenerator() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [formData, setFormData] = useState({
    certificateType: '',
    participationType: '',
    achievements: '',
    eventDate: '',
    certificateNumber: '',
    purpose: '',
    recommendations: ''
  });

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchEvents();
    fetchUsers();
    fetchCertificates();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/sk/events');
      setEvents(response.data.events || []);
    } catch (error) {
      toast.error('Failed to fetch events');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await api.get('/sk/certificates');
      setCertificates(response.data.certificates || []);
    } catch (error) {
      toast.error('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const generateCertificateNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `SK-${year}${month}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEvent) {
      toast.error('Please select an event');
      return;
    }

    if (!selectedUser) {
      toast.error('Please select a participant');
      return;
    }

    if (!formData.certificateType) {
      toast.error('Please select certificate type');
      return;
    }

    try {
      const certificateNumber = generateCertificateNumber();

      await api.post('/sk/certificates', {
        eventId: selectedEvent,
        userId: selectedUser,
        certificateType: formData.certificateType,
        certificateNumber,
        participationType: formData.participationType,
        achievements: formData.achievements,
        eventDate: formData.eventDate || null,
        issuedBy: `${currentUser.firstName} ${currentUser.lastName}`
      });

      toast.success('Certificate generated successfully!');
      setShowDialog(false);
      setFormData({
        certificateType: '',
        participationType: '',
        achievements: '',
        eventDate: '',
        certificateNumber: '',
        purpose: '',
        recommendations: ''
      });
      setSelectedEvent('');
      setSelectedUser('');
      fetchCertificates();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate certificate');
    }
  };

  const handleDownload = async (certificateId: string) => {
    try {
      toast.info('Generating PDF...');

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/sk/certificates/${certificateId}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download certificate');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sk-certificate-${certificateId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download certificate');
    }
  };

  const handleEdit = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      certificateType: certificate.certificateType,
      participationType: certificate.participationType || '',
      achievements: certificate.achievements || '',
      eventDate: '',
      certificateNumber: certificate.certificateNumber,
      purpose: '',
      recommendations: ''
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCertificate) return;

    try {
      await api.put(`/sk/certificates/${editingCertificate.id}`, {
        certificateType: formData.certificateType,
        certificateNumber: formData.certificateNumber,
        purpose: formData.purpose,
        achievements: formData.achievements,
        recommendations: formData.recommendations,
        issuedBy: currentUser.id
      });

      toast.success('Certificate updated successfully!');
      setShowEditDialog(false);
      setEditingCertificate(null);
      setFormData({
        certificateType: '',
        participationType: '',
        achievements: '',
        eventDate: '',
        certificateNumber: '',
        purpose: '',
        recommendations: ''
      });
      fetchCertificates();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update certificate');
    }
  };

  const handleDelete = async (certificateId: string) => {
    if (!confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/sk/certificates/${certificateId}`);
      toast.success('Certificate deleted successfully!');
      fetchCertificates();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete certificate');
    }
  };

  const getCertificateTypeBadge = (type: string) => {
    const typeColors: Record<string, 'default' | 'secondary' | 'outline'> = {
      'PARTICIPATION': 'default',
      'ACHIEVEMENT': 'secondary',
      'LEADERSHIP': 'outline',
      'COMPLETION': 'default'
    };

    return <Badge variant={typeColors[type] || 'outline'}>{type.replace(/_/g, ' ')}</Badge>;
  };

  return (
    <DashboardLayout currentPage="/sk/certificates">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              SK Certificate Generator
            </h1>
            <p className="text-muted-foreground mt-1">
              Generate certificates for SK events and activities
            </p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <FileText className="h-5 w-5" />
                Generate Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generate SK Certificate</DialogTitle>
                <DialogDescription>
                  Fill in the event and participant information to create a new certificate
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event">Select Event *</Label>
                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title} - {new Date(event.eventDate).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="user">Select Participant *</Label>
                  <Select value={selectedUser} onValueChange={setSelectedUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a participant..." />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.firstName} {user.lastName} ({user.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificateType">Certificate Type *</Label>
                  <Select
                    value={formData.certificateType}
                    onValueChange={(value) => setFormData({...formData, certificateType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select certificate type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PARTICIPATION">Event Participation</SelectItem>
                      <SelectItem value="ACHIEVEMENT">Outstanding Achievement</SelectItem>
                      <SelectItem value="LEADERSHIP">Leadership Excellence</SelectItem>
                      <SelectItem value="COMPLETION">Program Completion</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="participationType">Participation Type</Label>
                  <Input
                    id="participationType"
                    value={formData.participationType}
                    onChange={(e) => setFormData({...formData, participationType: e.target.value})}
                    placeholder="e.g., Participant, Organizer, Speaker, Volunteer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="achievements">Achievements/Recognition</Label>
                  <textarea
                    id="achievements"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    value={formData.achievements}
                    onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                    placeholder="Enter specific achievements, awards, or recognition received"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="eventDate">Event Date</Label>
                  <Input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                  />
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Certificate will be issued by {currentUser.firstName} {currentUser.lastName}.
                    A unique certificate number will be generated automatically.
                  </p>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Generate Certificate</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Certificates</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{certificates.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All generated certificates</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {certificates.filter(c => {
                  const issued = new Date(c.issuedDate);
                  const now = new Date();
                  return issued.getMonth() === now.getMonth() && issued.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Issued this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Events</CardTitle>
              <Award className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{events.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Available events</p>
            </CardContent>
          </Card>
        </div>

        {/* Certificates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Certificates</CardTitle>
            <CardDescription>View and download all issued SK certificates</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : certificates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No certificates generated yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Click "Generate Certificate" to create the first certificate.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate No.</TableHead>
                      <TableHead>Participant</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Participation</TableHead>
                      <TableHead>Issued Date</TableHead>
                      <TableHead>Issued By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((certificate) => (
                      <TableRow key={certificate.id}>
                        <TableCell className="font-medium">
                          {certificate.certificateNumber}
                        </TableCell>
                        <TableCell>
                          {certificate.user?.firstName} {certificate.user?.lastName}
                        </TableCell>
                        <TableCell>{certificate.event?.title || '-'}</TableCell>
                        <TableCell>
                          {getCertificateTypeBadge(certificate.certificateType)}
                        </TableCell>
                        <TableCell>{certificate.participationType || '-'}</TableCell>
                        <TableCell>
                          {new Date(certificate.issuedDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{certificate.issuedBy}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => handleDownload(certificate.id)}
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => handleEdit(certificate)}
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-1"
                              onClick={() => handleDelete(certificate.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Certificate Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit SK Certificate</DialogTitle>
              <DialogDescription>
                Update the certificate information below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-certificateNumber">Certificate Number *</Label>
                <Input
                  id="edit-certificateNumber"
                  value={formData.certificateNumber}
                  onChange={(e) => setFormData({...formData, certificateNumber: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-certificateType">Certificate Type *</Label>
                <Select
                  value={formData.certificateType}
                  onValueChange={(value) => setFormData({...formData, certificateType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select certificate type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PARTICIPATION">Participation</SelectItem>
                    <SelectItem value="ACHIEVEMENT">Achievement</SelectItem>
                    <SelectItem value="RECOGNITION">Recognition</SelectItem>
                    <SelectItem value="COMPLETION">Program Completion</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-purpose">Purpose</Label>
                <Input
                  id="edit-purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  placeholder="e.g., Event participation, Youth leadership"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-achievements">Achievements</Label>
                <textarea
                  id="edit-achievements"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.achievements}
                  onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                  placeholder="Enter participant achievements"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-recommendations">Recommendations</Label>
                <textarea
                  id="edit-recommendations"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.recommendations}
                  onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                  placeholder="Enter recommendations"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Certificate</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}