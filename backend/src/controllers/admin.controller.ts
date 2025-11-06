import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import prisma from '../utils/prisma';
import { hashPassword } from '../utils/password';
import * as path from 'path';
import * as fs from 'fs';
import { createPostgresBackup } from '../utils/backup';
import { createSqlBackup } from '../utils/simpleSqlBackup';

// ========== ADMIN STATS ==========
export const getAdminStats = async (req: AuthRequest, res: Response) => {
  try {
    const [
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      totalPatients,
      totalStudents,
      totalEvents,
      recentActivities
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
      prisma.user.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { status: 'SUSPENDED' } }),
      prisma.patient.count(),
      prisma.daycareStudent.count(),
      prisma.event.count({ where: { status: 'PUBLISHED' } }),
      prisma.auditLog.findMany({
        take: 5,
        orderBy: { timestamp: 'desc' },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        }
      })
    ]);

    const stats = {
      totalUsers,
      activeUsers,
      pendingUsers,
      suspendedUsers,
      totalPatients,
      totalStudents,
      totalEvents,
      recentActivities: recentActivities.map(log => ({
        id: log.id,
        action: log.action,
        user: log.user ? `${log.user.firstName} ${log.user.lastName}` : 'System',
        timestamp: formatTimeAgo(log.timestamp),
        type: getActivityType(log.action)
      }))
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};

// Helper function to format time ago
const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
};

// Helper function to determine activity type
const getActivityType = (action: string): 'success' | 'warning' | 'info' => {
  if (action.toLowerCase().includes('suspend') || action.toLowerCase().includes('delete')) {
    return 'warning';
  }
  if (action.toLowerCase().includes('create') || action.toLowerCase().includes('approve')) {
    return 'success';
  }
  return 'info';
};

// ========== USER MANAGEMENT ==========
export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, email, contactNumber, address, roles, otpEnabled } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email || !roles || !Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: 'First name, last name, email, and at least one role are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Validate roles
    const validRoles = [
      'SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL',
      'BHW', 'BHW_COORDINATOR', 'DAYCARE_STAFF', 'DAYCARE_TEACHER',
      'SK_OFFICER', 'SK_CHAIRMAN', 'PARENT_RESIDENT', 'VISITOR'
    ];

    const invalidRoles = roles.filter(role => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      return res.status(400).json({ error: `Invalid roles: ${invalidRoles.join(', ')}` });
    }

    // Create the user with a temporary password
    const tempPassword = Math.random().toString(36).slice(-12) + 'Temp!2025';
    const hashedPassword = await hashPassword(tempPassword);

    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        contactNumber,
        address,
        roles: {
          connect: roles.map(roleName => ({ name: roleName }))
        },
        otpEnabled: otpEnabled || false,
        status: 'ACTIVE' // New users are active by default
      },
      include: {
        roles: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Created new user: ${firstName} ${lastName} (${email})`,
        entityType: 'USER',
        entityId: user.id,
        changes: { created: true, roles }
      }
    });

    res.status(201).json({ user, message: 'User created successfully' });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { status, role, search } = req.query;
    
    const where: any = {};
    
    if (status) where.status = status;
    if (role) where.roles = { some: { name: role } };
    if (search) {
      where.OR = [
        { firstName: { contains: search as string, mode: 'insensitive' } },
        { lastName: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    const users = await prisma.user.findMany({
      where,
      include: {
        roles: {
          select: {
            name: true
          }
        },
        profile: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform users to include role names as strings and profile data
    const transformedUsers = users.map(user => ({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      suffix: user.suffix,
      contactNumber: user.contactNumber,
      address: user.address,
      proofOfResidency: user.proofOfResidency,
      status: user.status,
      consentAgreed: user.consentAgreed,
      consentDate: user.consentDate,
      createdAt: user.createdAt,
      roles: user.roles.map(r => r.name),
      profile: user.profile
    }));

    res.json({ users: transformedUsers });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, middleName, email, contactNumber, address, otpEnabled } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !email) {
      return res.status(400).json({ error: 'First name, last name, and email are required' });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        id: { not: userId }
      }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email is already in use by another user' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        middleName,
        email,
        contactNumber,
        address,
        otpEnabled
      },
      include: {
        roles: {
          select: {
            name: true
          }
        }
      }
    });

    // Transform user to include role names as strings
    const transformedUser = {
    };

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Updated user details: ${firstName} ${lastName} (${email})`,
        entityType: 'USER',
        entityId: userId,
        changes: { firstName, lastName, email, contactNumber, address, otpEnabled }
      }
    });

    res.json({ user: transformedUser, message: 'User updated successfully' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
};

export const updateUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    const validStatuses = ['ACTIVE', 'PENDING', 'SUSPENDED', 'INACTIVE'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { status: status as any },
      include: {
        roles: {
          select: {
            name: true
          }
        }
      }
    });

    // Transform user to include role names as strings
    const transformedUser = {
      ...user,
      roles: user.roles.map(r => r.name)
    };

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Updated user status to ${status}`,
        entityType: 'USER',
        entityId: userId,
        changes: { status }
      }
    });

    res.json({ user: transformedUser, message: 'User status updated successfully' });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

export const updateUserRole = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = [
      'SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL',
      'BHW', 'BHW_COORDINATOR', 'DAYCARE_STAFF', 'DAYCARE_TEACHER',
      'SK_OFFICER', 'SK_CHAIRMAN', 'PARENT_RESIDENT', 'VISITOR'
    ];

    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { 
        roles: {
          set: [], // Clear existing roles
          connect: [{ name: role }] // Connect the new role
        }
      },
      include: {
        roles: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Updated user role to ${role}`,
        entityType: 'USER',
        entityId: userId,
        changes: { role }
      }
    });

    res.json({ user, message: 'User role updated successfully' });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
};

export const updateUserRoles = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { roles } = req.body;

    const validRoles = [
      'SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL',
      'BHW', 'BHW_COORDINATOR', 'DAYCARE_STAFF', 'DAYCARE_TEACHER',
      'SK_OFFICER', 'SK_CHAIRMAN', 'PARENT_RESIDENT', 'VISITOR'
    ];

    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ error: 'Roles must be a non-empty array' });
    }

    const invalidRoles = roles.filter(role => !validRoles.includes(role));
    if (invalidRoles.length > 0) {
      return res.status(400).json({ error: `Invalid roles: ${invalidRoles.join(', ')}` });
    }

    // Update user roles - disconnect all existing roles and connect new ones
    await prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          set: [], // Clear existing roles
          connect: roles.map(roleName => ({ name: roleName })) // Connect new roles
        }
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Updated user roles to ${roles.join(', ')}`,
        entityType: 'USER',
        entityId: userId,
        changes: { roles }
      }
    });

  res.json({ message: 'User roles updated successfully' });
  } catch (error) {
    console.error('Update user roles error:', error);
    res.status(500).json({ error: 'Failed to update user roles' });
  }
};

export const getUserById = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          select: {
            name: true
          }
        },
        profile: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Transform user to include role names as strings and profile data
    const transformedUser = {
      ...user,
      roles: user.roles.map(r => r.name)
    };

    res.json({ user: transformedUser });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Prevent deleting own account
    if (req.user!.userId === userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Get user info before deletion for audit log
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        firstName: true,
        lastName: true,
        email: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Delete the user
    await prisma.user.delete({
      where: { id: userId }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Deleted user: ${user.firstName} ${user.lastName} (${user.email})`,
        entityType: 'USER',
        entityId: userId,
        changes: { deleted: true }
      }
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

// ========== SYSTEM SETTINGS ==========
export const getSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    let settings = await prisma.systemSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          barangayName: 'Barangay Binitayan',
          barangayAddress: 'Daraga, Albay, Philippines',
          barangayEmail: 'contact@barangaybinitayan.gov.ph',
          barangayContactNumber: '+63 XXX XXX XXXX',
          systemName: 'Gabay Barangay',
          systemVersion: '1.0.0',
          maintenanceMode: false,
          allowRegistration: true,
          requireApproval: true,
          lastBackupDate: null
        }
      });
    }

    res.json({ settings });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({ error: 'Failed to fetch system settings' });
  }
};

export const updateSystemSettings = async (req: AuthRequest, res: Response) => {
  try {
    const updateData = req.body;

    // Get existing settings or create if none exist
    let settings = await prisma.systemSettings.findFirst();
    
    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: {
          barangayName: 'Barangay Binitayan',
          barangayAddress: 'Daraga, Albay, Philippines',
          barangayEmail: 'contact@barangaybinitayan.gov.ph',
          barangayContactNumber: '+63 XXX XXX XXXX',
          systemName: 'Gabay Barangay',
          systemVersion: '1.0.0',
          maintenanceMode: false,
          allowRegistration: true,
          requireApproval: true
        }
      });
    }

    // Update settings
    const updatedSettings = await prisma.systemSettings.update({
      where: { id: settings.id },
      data: updateData
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'Updated system settings',
        entityType: 'SYSTEM',
        entityId: settings.id,
        changes: updateData
      }
    });

    res.json({ settings: updatedSettings, message: 'System settings updated successfully' });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({ error: 'Failed to update system settings' });
  }
};

// ========== ANNOUNCEMENTS ==========
export const getAnnouncements = async (req: AuthRequest, res: Response) => {
  try {
    const announcements = await prisma.announcement.findMany({
      orderBy: { createdAt: 'desc' }
    });

    res.json({ announcements });
  } catch (error) {
    console.error('Get announcements error:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
};

export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { title, content, priority, isPublic, category, expiresAt } = req.body;

    const createData: any = {
      title,
      content,
      priority: priority || 'MEDIUM',
      isPublic: isPublic !== undefined ? isPublic : false,
      category,
      publishedBy: req.user!.userId
    };

    // Handle expiresAt field - convert to Date or set to null
    if (expiresAt && expiresAt.trim() !== '') {
      createData.expiresAt = new Date(expiresAt);
    }

    const announcement = await prisma.announcement.create({
      data: createData
    });

    res.status(201).json({ announcement, message: 'Announcement created successfully' });
  } catch (error) {
    console.error('Create announcement error:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
};

export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, priority, isPublic, category, expiresAt } = req.body;

    const updateData: any = {
      title,
      content,
      priority,
      isPublic,
      category
    };

    // Handle expiresAt field - convert to Date or set to null
    if (expiresAt && expiresAt.trim() !== '') {
      updateData.expiresAt = new Date(expiresAt);
    } else {
      updateData.expiresAt = null;
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: updateData
    });

    res.json({ announcement, message: 'Announcement updated successfully' });
  } catch (error) {
    console.error('Update announcement error:', error);
    res.status(500).json({ error: 'Failed to update announcement' });
  }
};

export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.announcement.delete({
      where: { id }
    });

    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    console.error('Delete announcement error:', error);
    res.status(500).json({ error: 'Failed to delete announcement' });
  }
};

export const publishAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: { isPublic: true }
    });

    res.json({ announcement, message: 'Announcement published successfully' });
  } catch (error) {
    console.error('Publish announcement error:', error);
    res.status(500).json({ error: 'Failed to publish announcement' });
  }
};

// ========== AUDIT LOGS ==========
export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const { page = 1, limit = 50, action, entityType } = req.query;
    
    const where: any = {};
    if (action) where.action = { contains: action as string, mode: 'insensitive' };
    if (entityType) where.entityType = entityType;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const [rawLogs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              roles: true
            }
          }
        },
        orderBy: { timestamp: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.auditLog.count({ where })
    ]);

    // Map logs to always provide userName and userRole for frontend
    const logs = rawLogs.map(log => {
      let userRole = 'SYSTEM';
      if (log.user && Array.isArray(log.user.roles) && log.user.roles.length > 0) {
        if (typeof log.user.roles[0] === 'string') {
          userRole = log.user.roles[0];
        } else if (typeof log.user.roles[0] === 'object' && log.user.roles[0].name) {
          userRole = log.user.roles[0].name;
        }
      }
      return {
        ...log,
        userName: log.user ? `${log.user.firstName || ''} ${log.user.lastName || ''}`.trim() || log.user.email || 'System' : 'System',
        userRole: String(userRole),
      };
    });

    res.json({ 
      logs, 
      pagination: {
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        total,
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({ error: 'Failed to fetch audit logs' });
  }
};

// ========== ROLE MANAGEMENT ==========
export const getRoles = async (req: AuthRequest, res: Response) => {
  try {
    const roles = await prisma.role.findMany({
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: { users: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    res.json({ roles });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
};

export const createRole = async (req: AuthRequest, res: Response) => {
  try {
    const { name, displayName, description, permissions } = req.body;

    // Validate required fields
    if (!name || !displayName || !permissions || !Array.isArray(permissions)) {
      return res.status(400).json({ error: 'Name, display name, and permissions are required' });
    }

    // Check if role already exists
    const existingRole = await prisma.role.findUnique({
      where: { name }
    });

    if (existingRole) {
      return res.status(400).json({ error: 'Role with this name already exists' });
    }
    // Navigation permissions for sidebar visibility
    const validPermissions = [
      // Administrative
      'ADMIN_DASHBOARD', 'USER_MANAGEMENT', 'ROLE_MANAGEMENT', 'SYSTEM_SETTINGS', 'AUDIT_LOGS', 'BACKUP_MANAGEMENT', 'ANNOUNCEMENTS', 'BROADCAST_MANAGEMENT',
      // Health Services
      'HEALTH_DASHBOARD', 'PATIENT_MANAGEMENT', 'APPOINTMENTS', 'HEALTH_RECORDS', 'VACCINATIONS', 'CERTIFICATES', 'MY_HEALTH_RECORDS',
      // Daycare Services
      'DAYCARE_DASHBOARD', 'CHILD_REGISTRATION', 'STUDENT_REGISTRATIONS', 'ATTENDANCE_TRACKING', 'PROGRESS_REPORTS', 'LEARNING_MATERIALS', 'EDUCATIONAL_RESOURCES',
      // SK Engagement
      'SK_DASHBOARD', 'EVENT_MANAGEMENT', 'EVENT_REGISTRATION', 'ATTENDANCE_ANALYTICS', 'SK_ANALYTICS', 'MY_EVENT_REGISTRATIONS',
      // Reports & Analytics
      'REPORTS_DASHBOARD', 'HEALTH_REPORTS', 'DAYCARE_REPORTS', 'SK_REPORTS', 'CROSS_MODULE_ANALYTICS', 'HEALTH_STATS',
      // Public Access
      'PUBLIC_ANNOUNCEMENTS', 'PUBLIC_EVENTS'
    ];
    
    const filteredPermissions = permissions.filter((p: string) => validPermissions.includes(p));
    console.log('Create role - Original permissions:', permissions);
    console.log('Create role - Filtered permissions:', filteredPermissions);

    const role = await prisma.role.create({
      data: {
        name,
        displayName,
        description,
        permissions: {
          set: filteredPermissions
        }
      },
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: { users: true }
        }
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Created new role: ${displayName}`,
        entityType: 'ROLE',
        entityId: role.id,
        changes: { created: true, permissions }
      }
    });

    res.status(201).json({ role, message: 'Role created successfully' });
  } catch (error) {
    console.error('Create role error:', error);
    res.status(500).json({ error: 'Failed to create role' });
  }
};

export const updateRole = async (req: AuthRequest, res: Response) => {
  try {
    const { roleId } = req.params;
    const { displayName, description, permissions, isActive } = req.body;

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id: roleId }
    });

    if (!existingRole) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Allow updating system roles but prevent changing their name or system status
    const updateData: any = {};
    if (displayName !== undefined) updateData.displayName = displayName;
    if (description !== undefined) updateData.description = description;
    if (permissions !== undefined) {
      console.log('Raw permissions received:', JSON.stringify(permissions));
      console.log('Permissions type:', typeof permissions);
      console.log('Is array:', Array.isArray(permissions));
      
      // Ensure permissions is an array
      const permissionsArray = Array.isArray(permissions) ? permissions : [];
      
      // Navigation permissions for sidebar visibility
      const validPermissions = [
        // Administrative
        'ADMIN_DASHBOARD', 'USER_MANAGEMENT', 'ROLE_MANAGEMENT', 'SYSTEM_SETTINGS', 'AUDIT_LOGS', 'BACKUP_MANAGEMENT', 'ANNOUNCEMENTS', 'BROADCAST_MANAGEMENT',
        // Health Services
        'HEALTH_DASHBOARD', 'PATIENT_MANAGEMENT', 'APPOINTMENTS', 'HEALTH_RECORDS', 'VACCINATIONS', 'MY_HEALTH_RECORDS',
        // Daycare Services
        'DAYCARE_DASHBOARD', 'CHILD_REGISTRATION', 'STUDENT_REGISTRATIONS', 'ATTENDANCE_TRACKING', 'PROGRESS_REPORTS', 'LEARNING_MATERIALS', 'EDUCATIONAL_RESOURCES', 'DAYCARE_CERTIFICATES',
        // SK Engagement
        'SK_DASHBOARD', 'EVENT_MANAGEMENT', 'EVENT_REGISTRATION', 'ATTENDANCE_ANALYTICS', 'SK_ANALYTICS', 'MY_EVENT_REGISTRATIONS', 'SK_CERTIFICATES',
        // Reports & Analytics
        'REPORTS_DASHBOARD', 'HEALTH_REPORTS', 'DAYCARE_REPORTS', 'SK_REPORTS', 'CROSS_MODULE_ANALYTICS', 'HEALTH_STATS',
        // Public Access
        'PUBLIC_ANNOUNCEMENTS', 'PUBLIC_EVENTS'
      ];
      
      const filteredPermissions = permissionsArray.filter((p: string) => validPermissions.includes(p));
      console.log('Filtered permissions:', JSON.stringify(filteredPermissions));
      
      // Force permissions to be an array, not an object
      updateData.permissions = {
        set: filteredPermissions
      };
    }
    if (isActive !== undefined && !existingRole.isSystem) {
      // Only allow changing active status for non-system roles
      updateData.isActive = isActive;
    }

    console.log('Final updateData:', JSON.stringify(updateData));
    console.log('Permissions in updateData:', updateData.permissions);

    const role = await prisma.role.update({
      where: { id: roleId },
      data: updateData,
      include: {
        users: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        _count: {
          select: { users: true }
        }
      }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Updated role: ${role.displayName}`,
        entityType: 'ROLE',
        entityId: roleId,
        changes: updateData
      }
    });

    res.json({ role, message: 'Role updated successfully' });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({ error: 'Failed to update role' });
  }
};

export const deleteRole = async (req: AuthRequest, res: Response) => {
  try {
    const { roleId } = req.params;

    // Check if role exists
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: { users: true }
    });

    if (!role) {
      return res.status(404).json({ error: 'Role not found' });
    }

    // Prevent deleting system roles
    if (role.isSystem) {
      return res.status(400).json({ error: 'System roles cannot be deleted' });
    }

    // Check if role is assigned to users
    if (role.users.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete role that is assigned to users. Remove all users from this role first.' 
      });
    }

    await prisma.role.delete({
      where: { id: roleId }
    });

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Deleted role: ${role.displayName}`,
        entityType: 'ROLE',
        entityId: roleId,
        changes: { deleted: true }
      }
    });

    res.json({ message: 'Role deleted successfully' });
  } catch (error) {
    console.error('Delete role error:', error);
    res.status(500).json({ error: 'Failed to delete role' });
  }
};

export const getPermissions = async (req: AuthRequest, res: Response) => {
  try {
    // Navigation permissions for sidebar visibility
    const permissions = [
      // Administrative
      { name: 'ADMIN_DASHBOARD', category: 'Administrative', description: 'Access admin dashboard' },
      { name: 'USER_MANAGEMENT', category: 'Administrative', description: 'Access user management' },
      { name: 'ROLE_MANAGEMENT', category: 'Administrative', description: 'Access role management' },
      
      // Health Services
      { name: 'HEALTH_SERVICES', category: 'Health Services', description: 'Access health services menu' },
      { name: 'PATIENT_MANAGEMENT', category: 'Health Services', description: 'Access patient management' },
      { name: 'APPOINTMENTS', category: 'Health Services', description: 'Access appointments' },
      { name: 'IMMUNIZATION_RECORDS', category: 'Health Services', description: 'Access immunization records' },
      
      // Daycare Services
      { name: 'DAYCARE_SERVICES', category: 'Daycare Services', description: 'Access daycare services menu' },
      { name: 'DAYCARE_STUDENTS', category: 'Daycare Services', description: 'Access daycare students' },
      { name: 'DAYCARE_ATTENDANCE', category: 'Daycare Services', description: 'Access daycare attendance' },
      { name: 'DAYCARE_REPORTS', category: 'Daycare Services', description: 'Access daycare reports' },
      
      // SK Engagement
      { name: 'SK_ENGAGEMENT', category: 'SK Engagement', description: 'Access SK engagement menu' },
      { name: 'SK_EVENTS', category: 'SK Engagement', description: 'Access SK events' },
      { name: 'SK_ATTENDANCE', category: 'SK Engagement', description: 'Access SK attendance' },
      
      // Reports & Analytics
      { name: 'REPORTS_ANALYTICS', category: 'Reports & Analytics', description: 'Access reports and analytics' },
      
      // System Administration
      { name: 'SYSTEM_SETTINGS', category: 'System Administration', description: 'Access system settings' },
      { name: 'AUDIT_LOGS', category: 'System Administration', description: 'Access audit logs' },
      { name: 'ANNOUNCEMENTS', category: 'System Administration', description: 'Access announcements' },
      
      // Public Access
      { name: 'PUBLIC_ACCESS', category: 'Public Access', description: 'Access public pages' }
    ];

    res.json({ permissions });
  } catch (error) {
    console.error('Get permissions error:', error);
    res.status(500).json({ error: 'Failed to fetch permissions' });
  }
};

// ========== BACKUP MANAGEMENT ==========
export const createBackup = async (req: AuthRequest, res: Response) => {
  try {
    // Use simple SQL export backup logic (no pg_dump)
    console.log('[Backup] POST /api/admin/backup called (simple SQL export)');
    const outputDir = process.env.BACKUP_DIR || path.join(__dirname, '../../backups');
    const startedAt = new Date();
    let backupResult;
    try {
      backupResult = await createSqlBackup(outputDir);
    } catch (err) {
      console.error('[Backup] Error during createSqlBackup:', err);
      if (err instanceof Error && err.stack) {
        console.error(err.stack);
      }
      // Record failed backup
      await prisma.systemBackup.create({
        data: {
          backupType: 'MANUAL',
          filePath: '',
          fileSize: 0,
          status: 'FAILED',
          initiatedBy: req.user!.userId,
          startedAt,
          completedAt: new Date(),
          notes: err instanceof Error ? err.message : String(err)
        }
      });
      return res.status(500).json({ error: 'Backup failed', details: err instanceof Error ? err.message : String(err) });
    }

    // Success: record backup
    // Store only the file name in the database, not the full path
    const backup = await prisma.systemBackup.create({
      data: {
        backupType: 'MANUAL',
        filePath: path.basename(backupResult.filePath),
        fileSize: backupResult.fileSize,
        status: 'COMPLETED',
        initiatedBy: req.user!.userId,
        startedAt,
        completedAt: new Date()
      }
    });

    // Update system settings with last backup date
    const existingSettings = await prisma.systemSettings.findFirst();
    if (existingSettings) {
      await prisma.systemSettings.update({
        where: { id: existingSettings.id },
        data: {
          lastBackupDate: new Date()
        }
      });
    }

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'Created manual database backup',
        entityType: 'SYSTEM',
        entityId: backup.id,
        changes: { backupType: 'MANUAL', filePath: backupResult.filePath }
      }
    });

    res.json({
      backup,
      message: 'Database backup created successfully',
      fileName: path.basename(backupResult.filePath),
      fileSize: backupResult.fileSize
    });
  } catch (error) {
    console.error('[Backup] Create backup error:', error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    res.status(500).json({ error: 'Failed to create backup', details: error instanceof Error ? error.message : String(error) });
  }
};

export const getBackups = async (req: AuthRequest, res: Response) => {
  try {
    const backups = await prisma.systemBackup.findMany({
      orderBy: { startedAt: 'desc' },
      take: 20
    });

    res.json({ backups });
  } catch (error) {
    console.error('Get backups error:', error);
    res.status(500).json({ error: 'Failed to fetch backups' });
  }
};

export const downloadBackup = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const backup = await prisma.systemBackup.findUnique({
      where: { id }
    });

    if (!backup) {
      return res.status(404).json({ error: 'Backup not found' });
    }

    if (backup.status !== 'COMPLETED') {
      return res.status(400).json({ error: 'Backup is not ready for download' });
    }
    // Stream the actual backup file content
    // Always resolve the backup file from the backups directory
    const backupsDir = path.join(__dirname, '../../backups');
    const filePath = path.join(backupsDir, backup.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Backup file not found on disk' });
    }
    res.setHeader('Content-Type', 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    console.error('Download backup error:', error);
    res.status(500).json({ error: 'Failed to download backup' });
  }
};

// ========== BROADCAST MESSAGES ==========
export const getBroadcastMessages = async (req: AuthRequest, res: Response) => {
  try {
    const messages = await prisma.broadcastMessage.findMany({
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Transform messages to match frontend expectations
    const transformedMessages = messages.map(message => ({
      id: message.id,
      title: message.title,
      message: message.message,
      type: message.type,
      targetRoles: message.targetRoles,
      status: message.status,
      sentAt: message.sentAt,
      scheduledAt: message.scheduledAt,
      recipientCount: message.recipientCount,
      deliveredCount: message.deliveredCount,
      createdBy: `${message.sender.firstName} ${message.sender.lastName}`,
      createdAt: message.createdAt
    }));

    res.json({ messages: transformedMessages });
  } catch (error) {
    console.error('Get broadcast messages error:', error);
    res.status(500).json({ error: 'Failed to fetch broadcast messages' });
  }
};

export const createBroadcastMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { title, message, targetRoles } = req.body;

    // Validate required fields
    if (!title || !message || !targetRoles || !Array.isArray(targetRoles) || targetRoles.length === 0) {
      return res.status(400).json({ error: 'Title, message, and target roles are required' });
    }

    // Count recipients
    const recipientCount = await prisma.user.count({
      where: {
        roles: {
          some: {
            name: { in: targetRoles }
          }
        },
        status: 'ACTIVE'
      }
    });

    const createData: any = {
      title,
      message,
      targetRoles,
      type: 'NOTIFICATION',
      status: 'SENT',
      recipientCount,
      deliveredCount: recipientCount,
      createdBy: req.user!.userId,
      sentAt: new Date()
    };

    const broadcastMessage = await prisma.broadcastMessage.create({
      data: createData,
      include: {
        sender: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      }
    });

    // Get all users matching target roles and create notifications
    const where: any = {
      roles: {
        some: {
          name: { in: targetRoles }
        }
      },
      status: 'ACTIVE'
    };

    const targetUsers = await prisma.user.findMany({
      where,
      select: { id: true }
    });

    // Create notifications for all target users
    const notifications = await Promise.all(
      targetUsers.map(user =>
        prisma.notification.create({
          data: {
            userId: user.id,
            type: 'IN_APP',
            title,
            message,
            metadata: {
              broadcastId: broadcastMessage.id,
              isBroadcast: true
            }
          }
        })
      )
    );

    // Log the action
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Created broadcast message: ${title}`,
        entityType: 'BROADCAST',
        entityId: broadcastMessage.id,
        changes: { targetRoles, recipientCount: notifications.length }
      }
    });

    // Transform for response
    const transformedMessage = {
      id: broadcastMessage.id,
      title: broadcastMessage.title,
      message: broadcastMessage.message,
      targetRoles: broadcastMessage.targetRoles,
      status: broadcastMessage.status,
      sentAt: broadcastMessage.sentAt,
      recipientCount: broadcastMessage.recipientCount,
      deliveredCount: broadcastMessage.deliveredCount,
      createdBy: `${broadcastMessage.sender.firstName} ${broadcastMessage.sender.lastName}`,
      createdAt: broadcastMessage.createdAt
    };

    res.status(201).json({ message: transformedMessage, success: 'Broadcast message sent successfully' });
  } catch (error) {
    console.error('Create broadcast message error:', error);
    res.status(500).json({ error: 'Failed to create broadcast message' });
  }
};

// ========== PUBLIC CONTENT MANAGEMENT (CMS) ==========

// ========== FEATURES MANAGEMENT ==========
export const getFeatures = async (req: AuthRequest, res: Response) => {
  try {
    const features = await prisma.feature.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    res.json({ features });
  } catch (error) {
    console.error('Get features error:', error);
    res.status(500).json({ error: 'Failed to fetch features' });
  }
};

export const createFeature = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, iconType, stats, sortOrder, isActive } = req.body;

    if (!title || !description || !iconType) {
      return res.status(400).json({ error: 'Title, description, and icon type are required' });
    }

    const feature = await prisma.feature.create({
      data: {
        title,
        description,
        iconType,
        stats: stats || 'Active',
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Created feature: ${title}`,
        entityType: 'FEATURE',
        entityId: feature.id,
        changes: { created: true }
      }
    });

    res.status(201).json({ feature, message: 'Feature created successfully' });
  } catch (error) {
    console.error('Create feature error:', error);
    res.status(500).json({ error: 'Failed to create feature' });
  }
};

export const updateFeature = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, iconType, stats, sortOrder, isActive } = req.body;

    const feature = await prisma.feature.update({
      where: { id },
      data: {
        title,
        description,
        iconType,
        stats,
        sortOrder,
        isActive
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Updated feature: ${title}`,
        entityType: 'FEATURE',
        entityId: id,
        changes: { title, description, iconType, stats, sortOrder, isActive }
      }
    });

    res.json({ feature, message: 'Feature updated successfully' });
  } catch (error) {
    console.error('Update feature error:', error);
    res.status(500).json({ error: 'Failed to update feature' });
  }
};

export const deleteFeature = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const feature = await prisma.feature.findUnique({ where: { id } });
    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    await prisma.feature.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Deleted feature: ${feature.title}`,
        entityType: 'FEATURE',
        entityId: id,
        changes: { deleted: true }
      }
    });

    res.json({ message: 'Feature deleted successfully' });
  } catch (error) {
    console.error('Delete feature error:', error);
    res.status(500).json({ error: 'Failed to delete feature' });
  }
};

export const toggleFeatureActive = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const feature = await prisma.feature.findUnique({ where: { id } });
    if (!feature) {
      return res.status(404).json({ error: 'Feature not found' });
    }

    const updatedFeature = await prisma.feature.update({
      where: { id },
      data: { isActive: !feature.isActive }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Toggled feature ${updatedFeature.isActive ? 'active' : 'inactive'}: ${feature.title}`,
        entityType: 'FEATURE',
        entityId: id,
        changes: { isActive: updatedFeature.isActive }
      }
    });

    res.json({ feature: updatedFeature, message: `Feature ${updatedFeature.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Toggle feature active error:', error);
    res.status(500).json({ error: 'Failed to toggle feature status' });
  }
};

// ========== BENEFITS MANAGEMENT ==========
export const getBenefits = async (req: AuthRequest, res: Response) => {
  try {
    const benefits = await prisma.benefit.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    res.json({ benefits });
  } catch (error) {
    console.error('Get benefits error:', error);
    res.status(500).json({ error: 'Failed to fetch benefits' });
  }
};

export const createBenefit = async (req: AuthRequest, res: Response) => {
  try {
    const { text, iconType, sortOrder, isActive } = req.body;

    if (!text || !iconType) {
      return res.status(400).json({ error: 'Text and icon type are required' });
    }

    const benefit = await prisma.benefit.create({
      data: {
        text,
        iconType,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Created benefit: ${text}`,
        entityType: 'BENEFIT',
        entityId: benefit.id,
        changes: { created: true }
      }
    });

    res.status(201).json({ benefit, message: 'Benefit created successfully' });
  } catch (error) {
    console.error('Create benefit error:', error);
    res.status(500).json({ error: 'Failed to create benefit' });
  }
};

export const updateBenefit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { text, iconType, sortOrder, isActive } = req.body;

    const benefit = await prisma.benefit.update({
      where: { id },
      data: {
        text,
        iconType,
        sortOrder,
        isActive
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Updated benefit: ${text}`,
        entityType: 'BENEFIT',
        entityId: id,
        changes: { text, iconType, sortOrder, isActive }
      }
    });

    res.json({ benefit, message: 'Benefit updated successfully' });
  } catch (error) {
    console.error('Update benefit error:', error);
    res.status(500).json({ error: 'Failed to update benefit' });
  }
};

export const deleteBenefit = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const benefit = await prisma.benefit.findUnique({ where: { id } });
    if (!benefit) {
      return res.status(404).json({ error: 'Benefit not found' });
    }

    await prisma.benefit.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Deleted benefit: ${benefit.text}`,
        entityType: 'BENEFIT',
        entityId: id,
        changes: { deleted: true }
      }
    });

    res.json({ message: 'Benefit deleted successfully' });
  } catch (error) {
    console.error('Delete benefit error:', error);
    res.status(500).json({ error: 'Failed to delete benefit' });
  }
};

export const toggleBenefitActive = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const benefit = await prisma.benefit.findUnique({ where: { id } });
    if (!benefit) {
      return res.status(404).json({ error: 'Benefit not found' });
    }

    const updatedBenefit = await prisma.benefit.update({
      where: { id },
      data: { isActive: !benefit.isActive }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Toggled benefit ${updatedBenefit.isActive ? 'active' : 'inactive'}: ${benefit.text}`,
        entityType: 'BENEFIT',
        entityId: id,
        changes: { isActive: updatedBenefit.isActive }
      }
    });

    res.json({ benefit: updatedBenefit, message: `Benefit ${updatedBenefit.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Toggle benefit active error:', error);
    res.status(500).json({ error: 'Failed to toggle benefit status' });
  }
};

// ========== TESTIMONIALS MANAGEMENT ==========
export const getTestimonials = async (req: AuthRequest, res: Response) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    res.json({ testimonials });
  } catch (error) {
    console.error('Get testimonials error:', error);
    res.status(500).json({ error: 'Failed to fetch testimonials' });
  }
};

export const createTestimonial = async (req: AuthRequest, res: Response) => {
  try {
    const { name, role, content, rating, sortOrder, isActive } = req.body;

    if (!name || !role || !content) {
      return res.status(400).json({ error: 'Name, role, and content are required' });
    }

    const testimonial = await prisma.testimonial.create({
      data: {
        name,
        role,
        content,
        rating: rating || 5,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Created testimonial: ${name}`,
        entityType: 'TESTIMONIAL',
        entityId: testimonial.id,
        changes: { created: true }
      }
    });

    res.status(201).json({ testimonial, message: 'Testimonial created successfully' });
  } catch (error) {
    console.error('Create testimonial error:', error);
    res.status(500).json({ error: 'Failed to create testimonial' });
  }
};

export const updateTestimonial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, role, content, rating, sortOrder, isActive } = req.body;

    const testimonial = await prisma.testimonial.update({
      where: { id },
      data: {
        name,
        role,
        content,
        rating,
        sortOrder,
        isActive
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Updated testimonial: ${name}`,
        entityType: 'TESTIMONIAL',
        entityId: id,
        changes: { name, role, content, rating, sortOrder, isActive }
      }
    });

    res.json({ testimonial, message: 'Testimonial updated successfully' });
  } catch (error) {
    console.error('Update testimonial error:', error);
    res.status(500).json({ error: 'Failed to update testimonial' });
  }
};

export const deleteTestimonial = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    await prisma.testimonial.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Deleted testimonial: ${testimonial.name}`,
        entityType: 'TESTIMONIAL',
        entityId: id,
        changes: { deleted: true }
      }
    });

    res.json({ message: 'Testimonial deleted successfully' });
  } catch (error) {
    console.error('Delete testimonial error:', error);
    res.status(500).json({ error: 'Failed to delete testimonial' });
  }
};

export const toggleTestimonialActive = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const testimonial = await prisma.testimonial.findUnique({ where: { id } });
    if (!testimonial) {
      return res.status(404).json({ error: 'Testimonial not found' });
    }

    const updatedTestimonial = await prisma.testimonial.update({
      where: { id },
      data: { isActive: !testimonial.isActive }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Toggled testimonial ${updatedTestimonial.isActive ? 'active' : 'inactive'}: ${testimonial.name}`,
        entityType: 'TESTIMONIAL',
        entityId: id,
        changes: { isActive: updatedTestimonial.isActive }
      }
    });

    res.json({ testimonial: updatedTestimonial, message: `Testimonial ${updatedTestimonial.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Toggle testimonial active error:', error);
    res.status(500).json({ error: 'Failed to toggle testimonial status' });
  }
};

// ========== SERVICE FEATURES MANAGEMENT ==========
export const getServiceFeatures = async (req: AuthRequest, res: Response) => {
  try {
    const serviceFeatures = await prisma.serviceFeature.findMany({
      orderBy: { sortOrder: 'asc' }
    });

    res.json({ serviceFeatures });
  } catch (error) {
    console.error('Get service features error:', error);
    res.status(500).json({ error: 'Failed to fetch service features' });
  }
};

export const createServiceFeature = async (req: AuthRequest, res: Response) => {
  try {
    const { description, sortOrder, isActive } = req.body;

    if (!description) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const serviceFeature = await prisma.serviceFeature.create({
      data: {
        description,
        sortOrder: sortOrder || 0,
        isActive: isActive !== undefined ? isActive : true
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Created service feature: ${description}`,
        entityType: 'SERVICE_FEATURE',
        entityId: serviceFeature.id,
        changes: { created: true }
      }
    });

    res.status(201).json({ serviceFeature, message: 'Service feature created successfully' });
  } catch (error) {
    console.error('Create service feature error:', error);
    res.status(500).json({ error: 'Failed to create service feature' });
  }
};

export const updateServiceFeature = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { description, sortOrder, isActive } = req.body;

    const serviceFeature = await prisma.serviceFeature.update({
      where: { id },
      data: {
        description,
        sortOrder,
        isActive
      }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Updated service feature: ${description}`,
        entityType: 'SERVICE_FEATURE',
        entityId: id,
        changes: { description, sortOrder, isActive }
      }
    });

    res.json({ serviceFeature, message: 'Service feature updated successfully' });
  } catch (error) {
    console.error('Update service feature error:', error);
    res.status(500).json({ error: 'Failed to update service feature' });
  }
};

export const deleteServiceFeature = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const serviceFeature = await prisma.serviceFeature.findUnique({ where: { id } });
    if (!serviceFeature) {
      return res.status(404).json({ error: 'Service feature not found' });
    }

    await prisma.serviceFeature.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Deleted service feature: ${serviceFeature.description}`,
        entityType: 'SERVICE_FEATURE',
        entityId: id,
        changes: { deleted: true }
      }
    });

    res.json({ message: 'Service feature deleted successfully' });
  } catch (error) {
    console.error('Delete service feature error:', error);
    res.status(500).json({ error: 'Failed to delete service feature' });
  }
};

export const toggleServiceFeatureActive = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const serviceFeature = await prisma.serviceFeature.findUnique({ where: { id } });
    if (!serviceFeature) {
      return res.status(404).json({ error: 'Service feature not found' });
    }

    const updatedServiceFeature = await prisma.serviceFeature.update({
      where: { id },
      data: { isActive: !serviceFeature.isActive }
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: `Toggled service feature ${updatedServiceFeature.isActive ? 'active' : 'inactive'}: ${serviceFeature.description}`,
        entityType: 'SERVICE_FEATURE',
        entityId: id,
        changes: { isActive: updatedServiceFeature.isActive }
      }
    });

    res.json({ serviceFeature: updatedServiceFeature, message: `Service feature ${updatedServiceFeature.isActive ? 'activated' : 'deactivated'} successfully` });
  } catch (error) {
    console.error('Toggle service feature active error:', error);
    res.status(500).json({ error: 'Failed to toggle service feature status' });
  }
};