import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Users,
  Search,
  MoreVertical,
  UserCheck,
  Ban,
  Mail,
  Eye,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  Shield,
  Phone,
  MapPin,
  Calendar,
  UserPlus,
  FileText,
  ExternalLink,
  User,
  GraduationCap,
  Heart,
} from 'lucide-react';
import { api, BACKEND_BASE_URL } from '@/lib/api';

interface YouthProfile {
  purokZone: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  region: string;
  birthday: string;
  age: number;
  sex: string;
  civilStatus: string;
  religion: string;
  youthAgeGroup: string;
  youthClassification: string[];
  educationalBackground: string;
  workStatus: string;
  registeredSkVoter: boolean;
  registeredNationalVoter: boolean;
  votedLastSkElection: boolean;
  attendedSkAssembly: boolean;
  assemblyAttendanceCount?: string;
  notAttendedReason?: string;
  lgbtqCommunity: boolean;
  youthSpecificNeeds: string[];
  soloParent: boolean;
  sports: string[];
  sportsOtherSpecify?: string;
  hobbies: string[];
}

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  suffix?: string;
  contactNumber?: string;
  address?: string;
  proofOfResidency?: string;
  role?: string;
  roles?: string[];
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'INACTIVE';
  otpEnabled?: boolean;
  consentAgreed?: boolean;
  consentDate?: string;
  profile?: YouthProfile;
  createdAt: string;
  updatedAt?: string;
}

const ROLE_HIERARCHY = {
  'Administrative': {
    roles: ['SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'],
    variant: 'default' as const,
    icon: Shield
  },
  'Health Services': {
    roles: ['BHW_COORDINATOR', 'BHW'],
    variant: 'secondary' as const,
    icon: Users
  },
  'Daycare Services': {
    roles: ['DAYCARE_TEACHER', 'DAYCARE_STAFF'],
    variant: 'outline' as const,
    icon: Users
  },
  'Youth Services': {
    roles: ['SK_CHAIRMAN', 'SK_OFFICER'],
    variant: 'secondary' as const,
    icon: Users
  },
  'Community': {
    roles: ['PARENT_RESIDENT', 'VISITOR'],
    variant: 'outline' as const,
    icon: Users
  }
};

const USER_ROLES = Object.values(ROLE_HIERARCHY).flatMap(group => group.roles);

const USER_STATUSES = ['ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE'];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    address: '',
    roles: [] as string[],
    otpEnabled: false
  });
  const [addFormData, setAddFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    address: '',
    roles: [] as string[],
    otpEnabled: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    const filterUsers = () => {
      let filtered = users;

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (u) =>
            u.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Role filter
      if (roleFilter !== 'all') {
        filtered = filtered.filter((u) => {
          const userRoles = u.roles || [u.role];
          return userRoles.includes(roleFilter);
        });
      }

      // Status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter((u) => u.status === statusFilter);
      }

      setFilteredUsers(filtered);
    };

    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users');
      setUsers(response.data.users || []);
      setFilteredUsers(response.data.users || []);
    } catch (error) {
      toast.error('Failed to load users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: 'ACTIVE' });
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'ACTIVE' as const } : u));
      toast.success('User approved successfully');
    } catch {
      toast.error('Failed to approve user');
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: 'SUSPENDED' });
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'SUSPENDED' as const } : u));
      toast.success('User suspended successfully');
    } catch {
      toast.error('Failed to suspend user');
    }
  };

  const handleUnsuspendUser = async (userId: string) => {
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: 'ACTIVE' });
      setUsers(users.map(u => u.id === userId ? { ...u, status: 'ACTIVE' as const } : u));
      toast.success('User unsuspended successfully');
    } catch {
      toast.error('Failed to unsuspend user');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted successfully');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  const handleViewDetails = async (user: User) => {
    try {
      const response = await api.get(`/admin/users/${user.id}`);
      setSelectedUser(response.data.user);
      setShowViewDialog(true);
    } catch {
      toast.error('Failed to load user details');
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      contactNumber: user.contactNumber || '',
      address: user.address || '',
      roles: user.roles || [user.role || ''],
      otpEnabled: user.otpEnabled || false
    });
    setShowEditDialog(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      // Update user roles if changed
      if (JSON.stringify(editFormData.roles) !== JSON.stringify(selectedUser.roles || [selectedUser.role])) {
        await api.put(`/admin/users/${selectedUser.id}/roles`, { roles: editFormData.roles });
      }

      // Update other user details
      const userUpdateData = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email,
        contactNumber: editFormData.contactNumber,
        address: editFormData.address,
        otpEnabled: editFormData.otpEnabled
      };

      await api.put(`/admin/users/${selectedUser.id}`, userUpdateData);

      // Refetch the updated user data to ensure local state matches database
      const response = await api.get(`/admin/users/${selectedUser.id}`);
      const updatedUser = response.data.user;

      setUsers(users.map(u => u.id === selectedUser.id ? updatedUser : u));
      setShowEditDialog(false);
      toast.success('User updated successfully');
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleRoleToggle = (role: string) => {
    if (role === 'SYSTEM_ADMIN') {
      // Special handling for SYSTEM_ADMIN - toggle all roles
      const hasSystemAdmin = editFormData.roles.includes('SYSTEM_ADMIN');
      setEditFormData(prev => ({
        ...prev,
        roles: hasSystemAdmin ? [] : USER_ROLES
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        roles: prev.roles.includes(role)
          ? prev.roles.filter(r => r !== role)
          : [...prev.roles, role]
      }));
    }
  };

  const handleAddRoleToggle = (role: string) => {
    if (role === 'SYSTEM_ADMIN') {
      // Special handling for SYSTEM_ADMIN - toggle all roles
      const hasSystemAdmin = addFormData.roles.includes('SYSTEM_ADMIN');
      setAddFormData(prev => ({
        ...prev,
        roles: hasSystemAdmin ? [] : USER_ROLES
      }));
    } else {
      setAddFormData(prev => ({
        ...prev,
        roles: prev.roles.includes(role)
          ? prev.roles.filter(r => r !== role)
          : [...prev.roles, role]
      }));
    }
  };

  const handleAddUser = async () => {
    try {
      const userData = {
        firstName: addFormData.firstName,
        lastName: addFormData.lastName,
        email: addFormData.email,
        contactNumber: addFormData.contactNumber,
        address: addFormData.address,
        roles: addFormData.roles,
        otpEnabled: addFormData.otpEnabled
      };

      const response = await api.post('/admin/users', userData);
      setUsers([...users, response.data.user]);
      setShowAddDialog(false);
      setAddFormData({
        firstName: '',
        lastName: '',
        email: '',
        contactNumber: '',
        address: '',
        roles: [],
        otpEnabled: false
      });
      toast.success('User created successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create user');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      ACTIVE: 'bg-green-100 text-green-800 border-green-200',
      PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      SUSPENDED: 'bg-red-100 text-red-800 border-red-200',
      INACTIVE: 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return (
      <Badge variant="outline" className={styles[status as keyof typeof styles]}>
        {status}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    if (!role) return <Badge variant="outline">Unknown</Badge>;
    
    const roleColors: Record<string, string> = {
      SYSTEM_ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
      BARANGAY_CAPTAIN: 'bg-blue-100 text-blue-800 border-blue-200',
      BHW: 'bg-pink-100 text-pink-800 border-pink-200',
      DAYCARE_STAFF: 'bg-orange-100 text-orange-800 border-orange-200',
      SK_OFFICER: 'bg-cyan-100 text-cyan-800 border-cyan-200',
      PARENT_RESIDENT: 'bg-green-100 text-green-800 border-green-200',
      PATIENT: 'bg-teal-100 text-teal-800 border-teal-200'
    };

    return (
      <Badge variant="outline" className={roleColors[role] || 'bg-gray-100 text-gray-800'}>
        {role.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const exportUsers = () => {
    const csv = [
      ['Name', 'Email', 'Role', 'Status', 'Contact', 'Created'],
      ...filteredUsers.map(u => [
        `${u.firstName} ${u.lastName}`,
        u.email,
        u.roles ? u.roles.join('; ') : u.role || 'Unknown',
        u.status,
        u.contactNumber || '',
        formatDate(u.createdAt)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    toast.success('Users exported successfully');
  };

  return (
    <DashboardLayout currentPage="User Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
            <p className="text-muted-foreground">
              Manage user accounts, roles, and permissions
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowAddDialog(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
            <Button variant="outline" onClick={() => fetchUsers()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportUsers}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => navigate('/admin/users/pending')}>
              <UserCheck className="h-4 w-4 mr-2" />
              Pending Approvals
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{users.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Registered accounts
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                  <p className="text-3xl font-bold text-green-600">
                    {users.filter(u => u.status === 'ACTIVE').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {users.length > 0 ? Math.round((users.filter(u => u.status === 'ACTIVE').length / users.length) * 100) : 0}% of total
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <UserCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Pending Approval</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {users.filter(u => u.status === 'PENDING').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Awaiting verification
                  </p>
                </div>
                <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Mail className="h-6 w-6 text-yellow-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Suspended</p>
                  <p className="text-3xl font-bold text-red-600">
                    {users.filter(u => u.status === 'SUSPENDED').length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Access restricted
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
                  <Ban className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {Object.entries(ROLE_HIERARCHY).map(([category, { roles, icon: IconComponent }]) => (
                    <div key={category}>
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground flex items-center gap-2">
                        <IconComponent className="h-3 w-3" />
                        {category}
                      </div>
                      {roles.map(role => (
                        <SelectItem key={role} value={role} className="pl-6">
                          {role.replace(/_/g, ' ')}
                        </SelectItem>
                      ))}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {USER_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Card>
          <CardHeader>
            <CardTitle>Users ({filteredUsers.length})</CardTitle>
            <CardDescription>
              {filteredUsers.length !== users.length && `Showing ${filteredUsers.length} of ${users.length} users`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Loading users...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No users found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.firstName} {user.lastName}
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        {user.roles ? (
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((role, idx) => (
                              <span key={idx}>{getRoleBadge(role)}</span>
                            ))}
                          </div>
                        ) : (
                          getRoleBadge(user.role || 'Unknown')
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(user.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {user.contactNumber || 'N/A'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleViewDetails(user)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            {user.proofOfResidency && (
                              <DropdownMenuItem onClick={() => {
                                // Handle both Supabase URLs and local file paths
                                let imageUrl = user.proofOfResidency || '';
                                if (!imageUrl.startsWith('http')) {
                                  imageUrl = `${BACKEND_BASE_URL}${imageUrl}`;
                                }
                                setSelectedImageUrl(imageUrl);
                                setShowImageModal(true);
                              }}>
                                <FileText className="h-4 w-4 mr-2" />
                                View Proof of Residency
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit User
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {user.status === 'PENDING' && (
                              <DropdownMenuItem onClick={() => handleApproveUser(user.id)}>
                                <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                                Approve
                              </DropdownMenuItem>
                            )}
                            {user.status === 'ACTIVE' && (
                              <DropdownMenuItem onClick={() => handleSuspendUser(user.id)}>
                                <Ban className="h-4 w-4 mr-2 text-yellow-600" />
                                Suspend
                              </DropdownMenuItem>
                            )}
                            {user.status === 'SUSPENDED' && (
                              <DropdownMenuItem onClick={() => handleUnsuspendUser(user.id)}>
                                <UserCheck className="h-4 w-4 mr-2 text-green-600" />
                                Unsuspend
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteUser(user.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* View User Details Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                User Details
              </DialogTitle>
              <DialogDescription>
                Complete information about the selected user
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="flex-1 overflow-hidden">
                <Tabs defaultValue="personal" className="h-full flex flex-col">
                  <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
                    <TabsTrigger value="personal" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Personal Profile
                    </TabsTrigger>
                    <TabsTrigger value="demographic" className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4" />
                      Demographics
                    </TabsTrigger>
                    <TabsTrigger value="interests" className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Interests
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="flex-1 overflow-y-auto mt-4">
                    <TabsContent value="personal" className="space-y-6 mt-0">
                      {/* Basic Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Full Name</Label>
                          <p className="text-sm">
                            {selectedUser.firstName} {selectedUser.middleName} {selectedUser.lastName} {selectedUser.suffix}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Email</Label>
                          <p className="text-sm">{selectedUser.email}</p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Contact Number</Label>
                          <p className="text-sm flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            {selectedUser.contactNumber || 'Not provided'}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Status</Label>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(selectedUser.status)}
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* Address */}
                      {(selectedUser.address || selectedUser.profile) && (
                        <>
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Address</Label>
                            {selectedUser.profile ? (
                              <p className="text-sm flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {selectedUser.profile.purokZone}, {selectedUser.profile.barangay}, {selectedUser.profile.cityMunicipality}, {selectedUser.profile.province}, {selectedUser.profile.region}
                              </p>
                            ) : selectedUser.address ? (
                              <p className="text-sm flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {selectedUser.address}
                              </p>
                            ) : null}
                          </div>
                          <Separator />
                        </>
                      )}

                      {/* Roles */}
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Roles</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.roles ? (
                            selectedUser.roles.map((role, idx) => (
                              <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                                <Shield className="h-3 w-3" />
                                {role.replace(/_/g, ' ')}
                              </Badge>
                            ))
                          ) : (
                            <Badge variant="secondary" className="flex items-center gap-1">
                              <Shield className="h-3 w-3" />
                              {selectedUser.role || 'Unknown'}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Proof of Residency */}
                      {selectedUser.proofOfResidency && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Proof of Residency</Label>
                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  // Handle both Supabase URLs and local file paths
                                  let imageUrl = selectedUser.proofOfResidency || '';
                                  if (!imageUrl.startsWith('http')) {
                                    imageUrl = `${BACKEND_BASE_URL}${imageUrl}`;
                                  }
                                  setSelectedImageUrl(imageUrl);
                                  setShowImageModal(true);
                                }}
                                className="flex items-center gap-2"
                              >
                                <FileText className="h-4 w-4" />
                                View Document
                              </Button>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Uploaded
                              </Badge>
                            </div>
                          </div>
                        </>
                      )}

                      {/* Account Information */}
                      <Separator />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Account Created</Label>
                          <p className="text-sm flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {formatDate(selectedUser.createdAt)}
                          </p>
                        </div>
                        {selectedUser.updatedAt && (
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Last Updated</Label>
                            <p className="text-sm flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {formatDate(selectedUser.updatedAt)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Consent Information */}
                      {selectedUser.consentAgreed && (
                        <>
                          <Separator />
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Consent Information</Label>
                            <div className="flex items-center gap-2">
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Consent Agreed
                              </Badge>
                              {selectedUser.consentDate && (
                                <span className="text-sm text-muted-foreground">
                                  on {new Date(selectedUser.consentDate).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </TabsContent>

                    <TabsContent value="demographic" className="space-y-6 mt-0">
                      {selectedUser.profile ? (
                        <>
                          {/* Personal Details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Birthday & Age</Label>
                              <p className="text-sm">
                                {new Date(selectedUser.profile.birthday).toLocaleDateString()} ({selectedUser.profile.age} years old)
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Sex</Label>
                              <p className="text-sm">{selectedUser.profile.sex}</p>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Civil Status</Label>
                              <p className="text-sm">{selectedUser.profile.civilStatus}</p>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Religion</Label>
                              <p className="text-sm">{selectedUser.profile.religion}</p>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Youth Age Group</Label>
                              <p className="text-sm">{selectedUser.profile.youthAgeGroup}</p>
                            </div>
                          </div>

                          <Separator />

                          {/* Youth Classification */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Youth Classification</Label>
                            <div className="flex flex-wrap gap-1">
                              {selectedUser.profile.youthClassification.length > 0 ? (
                                selectedUser.profile.youthClassification.map((classification, idx) => (
                                  <Badge key={idx} variant="outline">{classification}</Badge>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">None specified</span>
                              )}
                            </div>
                          </div>

                          <Separator />

                          {/* Education & Work */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Educational Background</Label>
                              <p className="text-sm">{selectedUser.profile.educationalBackground}</p>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Work Status</Label>
                              <p className="text-sm">{selectedUser.profile.workStatus}</p>
                            </div>
                          </div>

                          <Separator />

                          {/* Voter Information */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Voter Information</Label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                              <div>SK Voter: <Badge variant={selectedUser.profile.registeredSkVoter ? 'default' : 'secondary'}>
                                {selectedUser.profile.registeredSkVoter ? 'Yes' : 'No'}
                              </Badge></div>
                              <div>National Voter: <Badge variant={selectedUser.profile.registeredNationalVoter ? 'default' : 'secondary'}>
                                {selectedUser.profile.registeredNationalVoter ? 'Yes' : 'No'}
                              </Badge></div>
                              <div>Voted Last SK: <Badge variant={selectedUser.profile.votedLastSkElection ? 'default' : 'secondary'}>
                                {selectedUser.profile.votedLastSkElection ? 'Yes' : 'No'}
                              </Badge></div>
                            </div>
                          </div>

                          <Separator />

                          {/* SK Assembly Attendance */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">SK Assembly Attendance</Label>
                            <div className="text-sm">
                              <div>Attended: <Badge variant={selectedUser.profile.attendedSkAssembly ? 'default' : 'secondary'}>
                                {selectedUser.profile.attendedSkAssembly ? 'Yes' : 'No'}
                              </Badge></div>
                              {selectedUser.profile.attendedSkAssembly && selectedUser.profile.assemblyAttendanceCount && (
                                <div className="mt-1">Frequency: {selectedUser.profile.assemblyAttendanceCount}</div>
                              )}
                              {!selectedUser.profile.attendedSkAssembly && selectedUser.profile.notAttendedReason && (
                                <div className="mt-1">Reason: {selectedUser.profile.notAttendedReason}</div>
                              )}
                            </div>
                          </div>

                          <Separator />

                          {/* Special Categories */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">LGBTQ+ Community</Label>
                              <Badge variant={selectedUser.profile.lgbtqCommunity ? 'default' : 'secondary'}>
                                {selectedUser.profile.lgbtqCommunity ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              <Label className="text-sm font-medium">Solo Parent</Label>
                              <Badge variant={selectedUser.profile.soloParent ? 'default' : 'secondary'}>
                                {selectedUser.profile.soloParent ? 'Yes' : 'No'}
                              </Badge>
                            </div>
                          </div>

                          <Separator />

                          {/* Youth with Specific Needs */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Youth with Specific Needs</Label>
                            <div className="flex flex-wrap gap-1">
                              {selectedUser.profile.youthSpecificNeeds.length > 0 ? (
                                selectedUser.profile.youthSpecificNeeds.map((need, idx) => (
                                  <Badge key={idx} variant="outline">{need}</Badge>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">None</span>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <GraduationCap className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-muted-foreground">No demographic information available</p>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="interests" className="space-y-6 mt-0">
                      {selectedUser.profile ? (
                        <>
                          {/* Sports Interests */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Sports Interests</Label>
                            <div className="flex flex-wrap gap-1">
                              {selectedUser.profile.sports.length > 0 ? (
                                <>
                                  {selectedUser.profile.sports.map((sport, idx) => (
                                    <Badge key={idx} variant="outline">{sport}</Badge>
                                  ))}
                                  {selectedUser.profile.sportsOtherSpecify && (
                                    <Badge variant="outline">{selectedUser.profile.sportsOtherSpecify}</Badge>
                                  )}
                                </>
                              ) : (
                                <span className="text-sm text-muted-foreground">None specified</span>
                              )}
                            </div>
                          </div>

                          <Separator />

                          {/* Hobbies */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium">Hobbies</Label>
                            <div className="flex flex-wrap gap-1">
                              {selectedUser.profile.hobbies.length > 0 ? (
                                selectedUser.profile.hobbies.map((hobby, idx) => (
                                  <Badge key={idx} variant="outline">{hobby}</Badge>
                                ))
                              ) : (
                                <span className="text-sm text-muted-foreground">None specified</span>
                              )}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8">
                          <Heart className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-muted-foreground">No interests information available</p>
                        </div>
                      )}
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit User</DialogTitle>
              <DialogDescription>
                Update user information and roles
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  value={editFormData.contactNumber}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={editFormData.address}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Roles</Label>
                <div className="space-y-2">
                  {Object.entries(ROLE_HIERARCHY).map(([category, { roles }]) => (
                    <div key={category} className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">{category}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {roles.map(role => (
                          <div key={role} className="flex items-center space-x-2">
                            <Switch
                              id={role}
                              checked={editFormData.roles.includes(role)}
                              onCheckedChange={() => handleRoleToggle(role)}
                            />
                            <Label htmlFor={role} className="text-sm">
                              {role.replace(/_/g, ' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="otpEnabled"
                  checked={editFormData.otpEnabled}
                  onCheckedChange={(checked) => setEditFormData(prev => ({ ...prev, otpEnabled: checked }))}
                />
                <Label htmlFor="otpEnabled">Enable OTP Authentication</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser}>
                  Update User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Image Modal Dialog */}
        <Dialog open={showImageModal} onOpenChange={setShowImageModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Proof of Residency
              </DialogTitle>
            </DialogHeader>
            <div className="px-6 pb-6">
              <div className="relative bg-gray-50 rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center">
                <img
                  src={selectedImageUrl}
                  alt="Proof of Residency"
                  className="w-full h-auto max-h-[70vh] object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    const container = target.parentElement;
                    if (container) {
                      container.innerHTML = `
                        <div class="flex flex-col items-center justify-center text-gray-500 p-8">
                          <svg class="h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                          </svg>
                          <p class="text-lg font-medium mb-2">Unable to load image</p>
                          <p class="text-sm text-gray-400 mb-4 text-center">The image may be corrupted, moved, or the server may be unavailable.</p>
                          <button 
                            onclick="window.open('${selectedImageUrl}', '_blank')" 
                            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <svg class="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                            </svg>
                            Try Opening in New Tab
                          </button>
                        </div>
                      `;
                    }
                  }}
                  onLoad={() => {
                    // Image loaded successfully
                    console.log('Image loaded successfully:', selectedImageUrl);
                  }}
                />
              </div>
              <div className="space-y-3 mt-4">
                <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                  <p className="font-medium mb-1">Image URL:</p>
                  <p className="font-mono text-xs break-all select-all">{selectedImageUrl}</p>
                </div>
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(selectedImageUrl);
                      toast.success('URL copied to clipboard');
                    }}
                  >
                    Copy URL
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedImageUrl, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in New Tab
                    </Button>
                    <Button onClick={() => setShowImageModal(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add User Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>
                Create a new user account with roles
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="addFirstName">First Name</Label>
                  <Input
                    id="addFirstName"
                    value={addFormData.firstName}
                    onChange={(e) => setAddFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="addLastName">Last Name</Label>
                  <Input
                    id="addLastName"
                    value={addFormData.lastName}
                    onChange={(e) => setAddFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="addEmail">Email</Label>
                <Input
                  id="addEmail"
                  type="email"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addContactNumber">Contact Number</Label>
                <Input
                  id="addContactNumber"
                  value={addFormData.contactNumber}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, contactNumber: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addAddress">Address</Label>
                <Input
                  id="addAddress"
                  value={addFormData.address}
                  onChange={(e) => setAddFormData(prev => ({ ...prev, address: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Roles</Label>
                <div className="space-y-2">
                  {Object.entries(ROLE_HIERARCHY).map(([category, { roles }]) => (
                    <div key={category} className="space-y-1">
                      <Label className="text-sm font-medium text-muted-foreground">{category}</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {roles.map(role => (
                          <div key={role} className="flex items-center space-x-2">
                            <Switch
                              id={`add-${role}`}
                              checked={addFormData.roles.includes(role)}
                              onCheckedChange={() => handleAddRoleToggle(role)}
                            />
                            <Label htmlFor={`add-${role}`} className="text-sm">
                              {role.replace(/_/g, ' ')}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="addOtpEnabled"
                  checked={addFormData.otpEnabled}
                  onCheckedChange={(checked) => setAddFormData(prev => ({ ...prev, otpEnabled: checked }))}
                />
                <Label htmlFor="addOtpEnabled">Enable OTP Authentication</Label>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddUser}>
                  Create User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}