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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  ShieldX,
  Edit,
  Trash2,
  RefreshCw,
  Plus,
  Settings,
  Eye,
} from 'lucide-react';
import { api } from '@/lib/api';

interface Role {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  permissions: string[];
  isSystem: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  users: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  }[];
  _count: {
    users: number;
  };
}

interface Permission {
  name: string;
  category: string;
  description: string;
}

const NAVIGATION_PERMISSIONS = {
  'Administrative': {
    permissions: [
      { name: 'ADMIN_DASHBOARD', description: 'Access admin dashboard' },
      { name: 'USER_MANAGEMENT', description: 'View user management pages' },
      { name: 'ROLE_MANAGEMENT', description: 'View role management pages' },
      { name: 'SYSTEM_SETTINGS', description: 'View system settings' },
      { name: 'AUDIT_LOGS', description: 'View audit logs' },
      { name: 'BACKUP_MANAGEMENT', description: 'View backup management' },
      { name: 'ANNOUNCEMENTS', description: 'View announcement management' },
      { name: 'BROADCAST_MANAGEMENT', description: 'View broadcast management' }
    ]
  },
  'Health Services': {
    permissions: [
      { name: 'HEALTH_DASHBOARD', description: 'Access health services dashboard' },
      { name: 'PATIENT_MANAGEMENT', description: 'View patient management' },
      { name: 'APPOINTMENTS', description: 'View appointment scheduling' },
      { name: 'HEALTH_RECORDS', description: 'View health records' },
      { name: 'MY_HEALTH_RECORDS', description: 'View personal health records' }
    ]
  },
  'Daycare Services': {
    permissions: [
      { name: 'DAYCARE_DASHBOARD', description: 'Access daycare dashboard' },
      { name: 'CHILD_REGISTRATION', description: 'View child registration' },
      { name: 'STUDENT_REGISTRATIONS', description: 'View student registrations' },
      { name: 'ATTENDANCE_TRACKING', description: 'View attendance tracking' },
      { name: 'PROGRESS_REPORTS', description: 'View progress reports' },
      { name: 'LEARNING_MATERIALS', description: 'View learning materials' },
      { name: 'EDUCATIONAL_RESOURCES', description: 'View educational resources' },
      { name: 'DAYCARE_CERTIFICATES', description: 'View daycare certificates' }
    ]
  },
  'SK Engagement': {
    permissions: [
      { name: 'SK_DASHBOARD', description: 'Access SK dashboard' },
      { name: 'EVENT_MANAGEMENT', description: 'View event management' },
      { name: 'EVENT_REGISTRATION', description: 'View event registration' },
      { name: 'ATTENDANCE_ANALYTICS', description: 'View attendance analytics' },
      { name: 'SK_ANALYTICS', description: 'View SK analytics' },
      { name: 'MY_EVENT_REGISTRATIONS', description: 'View personal event registrations' },
      { name: 'SK_CERTIFICATES', description: 'View SK event certificates' }
    ]
  },
  'Reports & Analytics': {
    permissions: [
      { name: 'REPORTS_DASHBOARD', description: 'Access reports dashboard' },
      { name: 'HEALTH_REPORTS', description: 'View health reports' },
      { name: 'DAYCARE_REPORTS', description: 'View daycare reports' },
      { name: 'SK_REPORTS', description: 'View SK reports' },
      { name: 'CROSS_MODULE_ANALYTICS', description: 'View cross-module analytics' },
      { name: 'HEALTH_STATS', description: 'View health statistics' }
    ]
  },
  'Public Access': {
    permissions: [
      { name: 'PUBLIC_ANNOUNCEMENTS', description: 'View public announcements' },
      { name: 'PUBLIC_EVENTS', description: 'View public events' }
    ]
  }
};

export default function RoleManagement() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [filteredRoles, setFilteredRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [createFormData, setCreateFormData] = useState({
    name: '',
    displayName: '',
    description: '',
    permissions: [] as string[],
    isActive: true
  });
  const [editFormData, setEditFormData] = useState({
    displayName: '',
    description: '',
    permissions: [] as string[],
    isActive: true
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  useEffect(() => {
    const filterRoles = () => {
      let filtered = roles;

      // Search filter
      if (searchTerm) {
        filtered = filtered.filter(
          (r) =>
            r.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            r.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Status filter
      if (statusFilter !== 'all') {
        filtered = filtered.filter((r) => {
          if (statusFilter === 'active') return r.isActive;
          if (statusFilter === 'inactive') return !r.isActive;
          if (statusFilter === 'system') return r.isSystem;
          return true;
        });
      }

      setFilteredRoles(filtered);
    };

    filterRoles();
  }, [roles, searchTerm, statusFilter]);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/roles');
      setRoles(response.data.roles || []);
      setFilteredRoles(response.data.roles || []);
    } catch (error) {
      toast.error('Failed to load roles');
      console.error('Error fetching roles:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/admin/permissions');
      setPermissions(response.data.permissions || []);
    } catch (error) {
      toast.error('Failed to load permissions');
      console.error('Error fetching permissions:', error);
    }
  };

  const handleCreateRole = async () => {
    try {
      const roleData = {
        name: createFormData.name,
        displayName: createFormData.displayName,
        description: createFormData.description,
        permissions: createFormData.permissions
      };

      const response = await api.post('/admin/roles', roleData);
      setRoles([...roles, response.data.role]);
      setShowCreateDialog(false);
      setCreateFormData({
        name: '',
        displayName: '',
        description: '',
        permissions: [],
        isActive: true
      });
      toast.success('Role created successfully');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to create role');
    }
  };

  const handleEditRole = (role: Role) => {
    setSelectedRole(role);
    setEditFormData({
      displayName: role.displayName,
      description: role.description || '',
      permissions: role.permissions,
      isActive: role.isActive
    });
    setShowEditDialog(true);
  };

  const handleUpdateRole = async () => {
    if (!selectedRole) return;

    try {
      const updateData = {
        displayName: editFormData.displayName,
        description: editFormData.description,
        permissions: editFormData.permissions,
        isActive: editFormData.isActive
      };

      const response = await api.put(`/admin/roles/${selectedRole.id}`, updateData);
      setRoles(roles.map(r => r.id === selectedRole.id ? response.data.role : r));
      setShowEditDialog(false);
      toast.success('Role updated successfully');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to update role');
    }
  };

  const handleDeleteRole = async (roleId: string) => {
    if (!confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/admin/roles/${roleId}`);
      setRoles(roles.filter(r => r.id !== roleId));
      toast.success('Role deleted successfully');
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete role');
    }
  };

  const handleViewRole = (role: Role) => {
    setSelectedRole(role);
    setShowViewDialog(true);
  };

  const handlePermissionToggle = (permission: string, isCreate: boolean = false) => {
    if (isCreate) {
      setCreateFormData(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission]
      }));
    } else {
      setEditFormData(prev => ({
        ...prev,
        permissions: prev.permissions.includes(permission)
          ? prev.permissions.filter(p => p !== permission)
          : [...prev.permissions, permission]
      }));
    }
  };



  const getRoleBadge = (role: Role) => {
    if (role.isSystem) {
      return <Badge variant="destructive" className="flex items-center gap-1">
        <ShieldCheck className="h-3 w-3" />
        System
      </Badge>;
    }
    return role.isActive ? (
      <Badge variant="default" className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Active
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <ShieldX className="h-3 w-3" />
        Inactive
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

  return (
    <DashboardLayout currentPage="Role Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
            <p className="text-muted-foreground">
              Manage user roles and control sidebar navigation visibility
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Role
            </Button>
            <Button variant="outline" onClick={() => fetchRoles()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Roles</p>
                  <p className="text-3xl font-bold">{roles.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    System roles included
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Roles</p>
                  <p className="text-3xl font-bold text-green-600">
                    {roles.filter(r => r.isActive).length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Currently enabled
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">System Roles</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {roles.filter(r => r.isSystem).length}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Cannot be modified
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Settings className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold text-orange-600">
                    {roles.reduce((sum, r) => sum + r._count.users, 0)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Assigned to roles
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600" />
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
                    placeholder="Search roles by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="active">Active Only</SelectItem>
                  <SelectItem value="inactive">Inactive Only</SelectItem>
                  <SelectItem value="system">System Roles</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Roles Table */}
        <Card>
          <CardHeader>
            <CardTitle>Roles ({filteredRoles.length})</CardTitle>
            <CardDescription>
              {filteredRoles.length !== roles.length && `Showing ${filteredRoles.length} of ${roles.length} roles`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">Loading roles...</p>
              </div>
            ) : filteredRoles.length === 0 ? (
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">No roles found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Role Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Navigation Items</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoles.map((role) => (
                    <TableRow key={role.id}>
                      <TableCell className="font-medium">
                        {role.displayName}
                        {role.isSystem && (
                          <Badge variant="outline" className="ml-2 text-xs">
                            System
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {role.description || 'No description'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {role.permissions.length} nav items
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {role._count.users} users
                        </Badge>
                      </TableCell>
                      <TableCell>{getRoleBadge(role)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(role.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewRole(role)}
                            title="View role details"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {!role.isSystem && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditRole(role)}
                                title="Edit role"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteRole(role.id)}
                                title="Delete role"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          {role.isSystem && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditRole(role)}
                              title="Edit system role"
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Create Role Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Create New Role
              </DialogTitle>
              <DialogDescription>
                Define a new role with specific permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="createName">Role Name *</Label>
                  <Input
                    id="createName"
                    value={createFormData.name}
                    onChange={(e) => setCreateFormData({...createFormData, name: e.target.value})}
                    placeholder="e.g., HEALTH_WORKER"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Internal name (no spaces, uppercase)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="createDisplayName">Display Name *</Label>
                  <Input
                    id="createDisplayName"
                    value={createFormData.displayName}
                    onChange={(e) => setCreateFormData({...createFormData, displayName: e.target.value})}
                    placeholder="e.g., Health Worker"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    User-friendly name
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="createDescription">Description</Label>
                <Textarea
                  id="createDescription"
                  value={createFormData.description}
                  onChange={(e) => setCreateFormData({...createFormData, description: e.target.value})}
                  placeholder="Describe the role's purpose and responsibilities"
                  rows={3}
                />
              </div>

              <Separator />

              {/* Navigation Permissions */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Navigation Permissions *</Label>
                <p className="text-sm text-muted-foreground">
                  Select which sidebar menu items this role can see. Users can still access pages directly via URL.
                </p>
                <div className="space-y-6">
                  {Object.entries(NAVIGATION_PERMISSIONS).map(([category, { permissions }]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground border-b pb-1">
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                        {permissions.map(permission => (
                          <div key={permission.name} className="flex items-start space-x-2">
                            <input
                              type="checkbox"
                              id={`create-${permission.name}`}
                              checked={createFormData.permissions.includes(permission.name)}
                              onChange={() => handlePermissionToggle(permission.name, true)}
                              className="mt-0.5 rounded border-gray-300"
                            />
                            <div className="flex-1">
                              <Label htmlFor={`create-${permission.name}`} className="text-sm font-medium">
                                {permission.name.replace(/_/g, ' ')}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRole}
                  disabled={!createFormData.name || !createFormData.displayName || createFormData.permissions.length === 0}
                >
                  Create Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Role Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Edit Role
              </DialogTitle>
              <DialogDescription>
                Update role information and permissions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="editDisplayName">Display Name *</Label>
                  <Input
                    id="editDisplayName"
                    value={editFormData.displayName}
                    onChange={(e) => setEditFormData({...editFormData, displayName: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role Name</Label>
                  <Input
                    value={selectedRole?.name || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Role name cannot be changed
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="editDescription">Description</Label>
                <Textarea
                  id="editDescription"
                  value={editFormData.description}
                  onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                  rows={3}
                />
              </div>

              <Separator />

              {/* Navigation Permissions */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Navigation Permissions</Label>
                <p className="text-sm text-muted-foreground">
                  Select which sidebar menu items this role can see. Users can still access pages directly via URL.
                </p>
                <div className="space-y-6">
                  {Object.entries(NAVIGATION_PERMISSIONS).map(([category, { permissions }]) => (
                    <div key={category} className="space-y-3">
                      <h4 className="font-medium text-sm text-muted-foreground border-b pb-1">
                        {category}
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 ml-4">
                        {permissions.map(permission => (
                          <div key={permission.name} className="flex items-start space-x-2">
                            <input
                              type="checkbox"
                              id={`edit-${permission.name}`}
                              checked={editFormData.permissions.includes(permission.name)}
                              onChange={() => handlePermissionToggle(permission.name, false)}
                              className="mt-0.5 rounded border-gray-300"
                            />
                            <div className="flex-1">
                              <Label htmlFor={`edit-${permission.name}`} className="text-sm font-medium">
                                {permission.name.replace(/_/g, ' ')}
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                {permission.description}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Active Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Active Status</Label>
                  <p className="text-sm text-muted-foreground">
                    Enable or disable this role
                  </p>
                </div>
                <Switch
                  checked={editFormData.isActive}
                  onCheckedChange={(checked) => setEditFormData({...editFormData, isActive: checked})}
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateRole}>
                  Update Role
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Role Details Dialog */}
        <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Role Details
              </DialogTitle>
              <DialogDescription>
                Complete information about the selected role
              </DialogDescription>
            </DialogHeader>
            {selectedRole && (
              <div className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Role Name</Label>
                    <p className="text-sm font-mono">{selectedRole.name}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Display Name</Label>
                    <p className="text-sm">{selectedRole.displayName}</p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <div className="flex items-center gap-2">
                      {getRoleBadge(selectedRole)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Users Assigned</Label>
                    <p className="text-sm">{selectedRole._count.users} users</p>
                  </div>
                </div>

                {/* Description */}
                {selectedRole.description && (
                  <>
                    <Separator />
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Description</Label>
                      <p className="text-sm">{selectedRole.description}</p>
                    </div>
                  </>
                )}

                {/* Navigation Permissions */}
                <Separator />
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Navigation Permissions ({selectedRole.permissions.length})</Label>
                  <div className="space-y-3">
                    {Object.entries(NAVIGATION_PERMISSIONS).map(([category, { permissions }]) => {
                      const categoryPermissions = selectedRole.permissions.filter(p =>
                        permissions.some(perm => perm.name === p)
                      );
                      if (categoryPermissions.length === 0) return null;

                      return (
                        <div key={category} className="space-y-2">
                          <h4 className="font-medium text-sm text-muted-foreground">
                            {category}
                          </h4>
                          <div className="flex flex-wrap gap-2 ml-4">
                            {categoryPermissions.map(permission => (
                              <Badge key={permission} variant="secondary" className="text-xs">
                                {permission.replace(/_/g, ' ')}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Assigned Users */}
                {selectedRole.users.length > 0 && (
                  <>
                    <Separator />
                    <div className="space-y-4">
                      <Label className="text-sm font-medium">Assigned Users</Label>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {selectedRole.users.map(user => (
                          <div key={user.id} className="flex items-center justify-between p-2 bg-muted rounded">
                            <div>
                              <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                              <p className="text-xs text-muted-foreground">{user.email}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Timestamps */}
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Created</Label>
                    <p className="text-sm flex items-center gap-2">
                      {new Date(selectedRole.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Last Updated</Label>
                    <p className="text-sm flex items-center gap-2">
                      {new Date(selectedRole.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}