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
import { toast } from 'sonner';
import { Search, Users, RefreshCw, Baby, Calendar, MapPin, Phone, Plus, Edit, Eye } from 'lucide-react';

interface DaycareStudent {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  emergencyContact: string;
  allergies?: string;
  medicalConditions?: string;
  enrollmentDate: string;
  registration?: {
    parent?: {
      firstName: string;
      lastName: string;
      email: string;
      contactNumber?: string;
    };
  };
  _count?: {
    attendanceRecords: number;
    progressReports: number;
  };
}

export default function Enrollees() {
  const [students, setStudents] = useState<DaycareStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<DaycareStudent | null>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    emergencyContact: '',
    allergies: '',
    medicalConditions: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/daycare/students');
      setStudents(response.data.students || []);
    } catch (error) {
      console.error('Failed to fetch students');
      toast.error('Failed to fetch enrollees');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/daycare/students', formData);
      toast.success('Enrollee added successfully');
      setShowAddDialog(false);
      resetForm();
      fetchStudents();
    } catch (error) {
      toast.error('Failed to add enrollee');
    }
  };

  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    try {
      await api.patch(`/daycare/students/${selectedStudent.id}`, formData);
      toast.success('Enrollee updated successfully');
      setShowEditDialog(false);
      setSelectedStudent(null);
      resetForm();
      fetchStudents();
    } catch (error) {
      toast.error('Failed to update enrollee');
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      middleName: '',
      dateOfBirth: '',
      gender: '',
      address: '',
      emergencyContact: '',
      allergies: '',
      medicalConditions: ''
    });
  };

  const openEditDialog = (student: DaycareStudent) => {
    setSelectedStudent(student);
    setFormData({
      firstName: student.firstName,
      lastName: student.lastName,
      middleName: student.middleName || '',
      dateOfBirth: student.dateOfBirth.split('T')[0],
      gender: student.gender,
      address: student.address,
      emergencyContact: student.emergencyContact,
      allergies: student.allergies || '',
      medicalConditions: student.medicalConditions || ''
    });
    setShowEditDialog(true);
  };

  const openViewDialog = (student: DaycareStudent) => {
    setSelectedStudent(student);
    setShowViewDialog(true);
  };

  const filteredStudents = students.filter(student =>
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const StudentForm = ({ onSubmit, submitLabel }: { onSubmit: (e: React.FormEvent) => void, submitLabel: string }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="middleName">Middle Name</Label>
          <Input
            id="middleName"
            value={formData.middleName}
            onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth *</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender *</Label>
          <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="address">Address *</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="emergencyContact">Emergency Contact *</Label>
        <Input
          id="emergencyContact"
          value={formData.emergencyContact}
          onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
          placeholder="Name - Phone Number"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies</Label>
          <Textarea
            id="allergies"
            value={formData.allergies}
            onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
            placeholder="List any allergies"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="medicalConditions">Medical Conditions</Label>
          <Textarea
            id="medicalConditions"
            value={formData.medicalConditions}
            onChange={(e) => setFormData({ ...formData, medicalConditions: e.target.value })}
            placeholder="List any medical conditions"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={() => {
          setShowAddDialog(false);
          setShowEditDialog(false);
          resetForm();
        }}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </DialogFooter>
    </form>
  );

  return (
    <DashboardLayout currentPage="/daycare/enrollees">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Daycare Enrollees</h1>
            <p className="text-muted-foreground">Manage enrolled students</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={fetchStudents} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Enrollee
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enrollees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{students.length}</div>
              <p className="text-xs text-muted-foreground">Currently enrolled students</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Baby className="h-5 w-5" />
                  Enrolled Students
                </CardTitle>
                <CardDescription>View and manage daycare enrollees</CardDescription>
              </div>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 max-w-sm"
              />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="text-center py-12">
                <Baby className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {students.length === 0 ? 'No enrollees yet.' : 'No students match your search.'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {students.length === 0 && 'Add enrollees manually or approve registrations.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Emergency Contact</TableHead>
                      <TableHead>Enrolled</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-primary/10 text-primary">
                                {student.firstName.charAt(0)}{student.lastName.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {student.firstName} {student.middleName} {student.lastName}
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(student.dateOfBirth).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{calculateAge(student.dateOfBirth)} years old</TableCell>
                        <TableCell>
                          <Badge variant="outline">{student.gender}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span className="max-w-[150px] truncate">{student.address}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {student.emergencyContact}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(student.enrollmentDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => openViewDialog(student)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => openEditDialog(student)}>
                              <Edit className="h-3 w-3" />
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

        {/* Add Enrollee Dialog */}
        <Dialog open={showAddDialog} onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) resetForm();
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Enrollee</DialogTitle>
              <DialogDescription>Manually enroll a new student to the daycare</DialogDescription>
            </DialogHeader>
            <StudentForm onSubmit={handleAddStudent} submitLabel="Add Enrollee" />
          </DialogContent>
        </Dialog>

        {/* Edit Enrollee Dialog */}
        <Dialog open={showEditDialog} onOpenChange={(open) => {
          setShowEditDialog(open);
          if (!open) {
            setSelectedStudent(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Enrollee</DialogTitle>
              <DialogDescription>Update student information</DialogDescription>
            </DialogHeader>
            <StudentForm onSubmit={handleEditStudent} submitLabel="Save Changes" />
          </DialogContent>
        </Dialog>

        {/* View Details Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Enrollee Details</DialogTitle>
              <DialogDescription>Complete information for this student</DialogDescription>
            </DialogHeader>
            {selectedStudent && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                    <p className="font-medium">
                      {selectedStudent.firstName} {selectedStudent.middleName} {selectedStudent.lastName}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                    <p>{selectedStudent.gender}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                    <p>{new Date(selectedStudent.dateOfBirth).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Age</Label>
                    <p>{calculateAge(selectedStudent.dateOfBirth)} years old</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Enrollment Date</Label>
                    <p>{new Date(selectedStudent.enrollmentDate).toLocaleDateString()}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-muted-foreground">Emergency Contact</Label>
                    <p>{selectedStudent.emergencyContact}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                  <p>{selectedStudent.address}</p>
                </div>
                {(selectedStudent.allergies || selectedStudent.medicalConditions) && (
                  <div className="grid grid-cols-2 gap-4">
                    {selectedStudent.allergies && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Allergies</Label>
                        <p>{selectedStudent.allergies}</p>
                      </div>
                    )}
                    {selectedStudent.medicalConditions && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-muted-foreground">Medical Conditions</Label>
                        <p>{selectedStudent.medicalConditions}</p>
                      </div>
                    )}
                  </div>
                )}
                {selectedStudent.registration?.parent && (
                  <div className="space-y-2 pt-4 border-t">
                    <Label className="text-sm font-medium text-muted-foreground">Parent/Guardian</Label>
                    <p>{selectedStudent.registration.parent.firstName} {selectedStudent.registration.parent.lastName}</p>
                    <p className="text-sm text-muted-foreground">{selectedStudent.registration.parent.email}</p>
                    {selectedStudent.registration.parent.contactNumber && (
                      <p className="text-sm text-muted-foreground">{selectedStudent.registration.parent.contactNumber}</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
