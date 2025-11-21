import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { Search, Users, Clock, CheckCircle, XCircle, Eye, UserCheck, UserX, RefreshCw, Baby, Calendar, MapPin, Phone, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import type { DaycareRegistration } from '@/types/index';

export default function StudentRegistration() {
  const [registrations, setRegistrations] = useState<DaycareRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedRegistration, setSelectedRegistration] = useState<DaycareRegistration | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editForm, setEditForm] = useState<Partial<DaycareRegistration>>({});

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await api.get('/daycare/registrations');
      setRegistrations(response.data.registrations || []);
    } catch (error) {
      console.error('Failed to fetch registrations');
      toast.error('Failed to fetch registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      const endpoint = status === 'APPROVED'
        ? `/daycare/registrations/${id}/approve`
        : `/daycare/registrations/${id}/reject`;
      await api.patch(endpoint);
      toast.success(`Registration ${status.toLowerCase()} successfully`);
      fetchRegistrations();
    } catch (error) {
      toast.error(`Failed to ${status.toLowerCase()} registration`);
    }
  };

  const handleViewDetails = (registration: DaycareRegistration) => {
    setSelectedRegistration(registration);
    setShowViewDialog(true);
  };

  const handleEdit = (registration: DaycareRegistration) => {
    setSelectedRegistration(registration);
    setEditForm(registration);
    setShowEditDialog(true);
  };

  const handleDelete = (registration: DaycareRegistration) => {
    setSelectedRegistration(registration);
    setShowDeleteDialog(true);
  };

  const handleEditSubmit = async () => {
    if (!selectedRegistration) return;
    try {
      // Only send editable fields
      const updateData = {
        childFirstName: editForm.childFirstName,
        childMiddleName: editForm.childMiddleName,
        childLastName: editForm.childLastName,
        childGender: editForm.childGender,
        childDateOfBirth: editForm.childDateOfBirth,
        address: editForm.address,
        parentContact: editForm.parentContact,
        emergencyContact: editForm.emergencyContact
      };
      await api.patch(`/daycare/registrations/${selectedRegistration.id}`, updateData);
      toast.success('Registration updated successfully');
      setShowEditDialog(false);
      fetchRegistrations();
    } catch (error) {
      toast.error('Failed to update registration');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedRegistration) return;
    try {
      await api.delete(`/daycare/registrations/${selectedRegistration.id}`);
      toast.success('Registration deleted successfully');
      setShowDeleteDialog(false);
      fetchRegistrations();
    } catch (error) {
      toast.error('Failed to delete registration');
    }
  };

  const filteredRegistrations = registrations.filter(reg => {
    const matchesSearch = `${reg.childFirstName} ${reg.childLastName}`.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || reg.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: registrations.length,
    pending: registrations.filter(r => r.status === 'PENDING').length,
    approved: registrations.filter(r => r.status === 'APPROVED').length,
    rejected: registrations.filter(r => r.status === 'REJECTED').length
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
      case 'APPROVED':
        return <Badge variant="default" className="bg-green-50 text-green-700 border-green-200">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="destructive" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <DashboardLayout currentPage="/daycare/registrations">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Daycare Registrations</h1>
            <p className="text-muted-foreground">Manage student registration applications</p>
          </div>
          <Button onClick={fetchRegistrations} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">All registrations</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <p className="text-xs text-muted-foreground">Accepted students</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Rejected</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <p className="text-xs text-muted-foreground">Declined applications</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Baby className="h-5 w-5" />
                  Registration Applications
                </CardTitle>
                <CardDescription>Review and manage daycare registration applications</CardDescription>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by child name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading registrations...</span>
              </div>
            ) : filteredRegistrations.length === 0 ? (
              <div className="text-center py-12">
                <Baby className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {registrations.length === 0 ? 'No registration applications yet.' : 'No registrations match your filters.'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {registrations.length === 0 ? 'Applications will appear here once parents submit them.' : 'Try adjusting your search or filters.'}
                </p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredRegistrations.length} of {registrations.length} applications
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Child</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Parent Contact</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRegistrations.map((reg) => (
                        <TableRow key={reg.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary/10 text-primary">
                                  {reg.childFirstName.charAt(0)}{reg.childLastName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {reg.childFirstName} {reg.childMiddleName} {reg.childLastName}
                                </div>
                                <div className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {new Date(reg.childDateOfBirth).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">{calculateAge(reg.childDateOfBirth)} years old</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {reg.childGender}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="max-w-[150px] truncate">{reg.address}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3 text-muted-foreground" />
                              {reg.parentContact}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              {new Date(reg.submittedAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(reg.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {reg.status === 'PENDING' && (
                                <>
                                  <Button
                                    size="sm"
                                    onClick={() => handleStatusUpdate(reg.id, 'APPROVED')}
                                    className="h-8"
                                  >
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleStatusUpdate(reg.id, 'REJECTED')}
                                    className="h-8"
                                  >
                                    <UserX className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleViewDetails(reg)}>
                                    <Eye className="mr-2 h-4 w-4" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEdit(reg)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => handleDelete(reg)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* View Details Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registration Details</DialogTitle>
              <DialogDescription>Complete information for this daycare registration</DialogDescription>
            </DialogHeader>
            {selectedRegistration && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Child Name</Label>
                    <p className="font-medium">
                      {selectedRegistration.childFirstName} {selectedRegistration.childMiddleName} {selectedRegistration.childLastName}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                    <p>{selectedRegistration.childGender}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                    <p>{new Date(selectedRegistration.childDateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Age</Label>
                    <p>{calculateAge(selectedRegistration.childDateOfBirth)} years old</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Parent Contact</Label>
                    <p>{selectedRegistration.parentContact}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Emergency Contact</Label>
                    <p>{selectedRegistration.emergencyContact}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                  <p>{selectedRegistration.address}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                    <div>{getStatusBadge(selectedRegistration.status)}</div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Submitted Date</Label>
                    <p>{new Date(selectedRegistration.submittedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Registration</DialogTitle>
              <DialogDescription>Update registration information</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="childFirstName">First Name</Label>
                  <Input
                    id="childFirstName"
                    value={editForm.childFirstName || ''}
                    onChange={(e) => setEditForm({...editForm, childFirstName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childMiddleName">Middle Name</Label>
                  <Input
                    id="childMiddleName"
                    value={editForm.childMiddleName || ''}
                    onChange={(e) => setEditForm({...editForm, childMiddleName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childLastName">Last Name</Label>
                  <Input
                    id="childLastName"
                    value={editForm.childLastName || ''}
                    onChange={(e) => setEditForm({...editForm, childLastName: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="childGender">Gender</Label>
                  <Select value={editForm.childGender || ''} onValueChange={(value) => setEditForm({...editForm, childGender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="childDateOfBirth">Date of Birth</Label>
                  <Input
                    id="childDateOfBirth"
                    type="date"
                    value={editForm.childDateOfBirth ? new Date(editForm.childDateOfBirth).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditForm({...editForm, childDateOfBirth: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={editForm.address || ''}
                  onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="parentContact">Parent Contact</Label>
                  <Input
                    id="parentContact"
                    value={editForm.parentContact || ''}
                    onChange={(e) => setEditForm({...editForm, parentContact: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContact">Emergency Contact</Label>
                  <Input
                    id="emergencyContact"
                    value={editForm.emergencyContact || ''}
                    onChange={(e) => setEditForm({...editForm, emergencyContact: e.target.value})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancel</Button>
              <Button onClick={handleEditSubmit}>Save Changes</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Registration</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the registration for {selectedRegistration?.childFirstName} {selectedRegistration?.childLastName}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
