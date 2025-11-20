import { Request, Response } from 'express';
import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateToken } from '../utils/jwt';
import { sendOTP, verifyOTP } from '../services/otp.service';
import { sendPasswordResetEmail } from '../services/email.service';
import { uploadFile } from '../utils/supabase';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Configure multer for file uploads (memory storage for Supabase)
export const upload = multer({
  storage: multer.memoryStorage(), // Use memory storage instead of disk
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
  }
});

export const register = async (req: Request, res: Response) => {
  try {
    const {
      email,
      password,
      firstName,
      lastName,
      middleName,
      suffix,
      contactNumber,
      address,
      role,
      consentAgreed,
      profile
    } = req.body;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Handle proof of residency file upload to Supabase
    let proofOfResidency = null;
    if ((req as any).file) {
      const file = (req as any).file;
      const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
      const filePath = fileName; // Don't duplicate bucket name in path

      try {
        proofOfResidency = await uploadFile('proof-of-residency', file, filePath);
      } catch (error) {
        console.error('File upload error:', error);
        return res.status(500).json({ error: 'Failed to upload proof of residency' });
      }
    }

    // Parse profile data if provided
    let profileData = null;
    if (profile) {
      try {
        profileData = JSON.parse(profile);
      } catch (error) {
        return res.status(400).json({ error: 'Invalid profile data' });
      }
    }

    // Get base roles for residents
    const [parentResidentRole, kkMemberRole] = await Promise.all([
      prisma.role.findUnique({ where: { name: 'PARENT_RESIDENT' } }),
      prisma.role.findUnique({ where: { name: 'KK_MEMBER' } })
    ]);

    if (!parentResidentRole) {
      return res.status(500).json({ error: 'PARENT_RESIDENT role not found' });
    }

    const numericAge = profileData && typeof profileData.age !== 'undefined'
      ? Number(profileData.age)
      : undefined;
    const hasValidAge = typeof numericAge === 'number' && !Number.isNaN(numericAge);
    const isKkMemberEligible = hasValidAge && numericAge! < 30;
    const roleToAssign = isKkMemberEligible && kkMemberRole ? kkMemberRole : parentResidentRole;

    // Create user with profile data and assign role
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName,
        lastName,
        middleName,
        suffix,
        contactNumber,
        address,
        proofOfResidency,
        consentAgreed: consentAgreed === 'true',
        consentDate: consentAgreed === 'true' ? new Date() : null,
        status: 'PENDING', // Account needs approval
        roles: {
          connect: { id: roleToAssign.id }
        },
        profile: profileData ? {
          create: {
            purokZone: profileData.purokZone,
            barangay: profileData.barangay,
            cityMunicipality: profileData.cityMunicipality,
            province: profileData.province,
            region: profileData.region,
            birthday: new Date(profileData.birthday),
            age: hasValidAge ? numericAge! : profileData.age,
            sex: profileData.sex,
            civilStatus: profileData.civilStatus,
            religion: profileData.religion,
            youthAgeGroup: profileData.youthAgeGroup,
            youthClassification: profileData.youthClassification,
            educationalBackground: profileData.educationalBackground,
            workStatus: profileData.workStatus,
            registeredSkVoter: profileData.registeredSkVoter,
            registeredNationalVoter: profileData.registeredNationalVoter,
            votedLastSkElection: profileData.votedLastSkElection,
            attendedSkAssembly: profileData.attendedSkAssembly,
            assemblyAttendanceCount: profileData.assemblyAttendanceCount,
            notAttendedReason: profileData.notAttendedReason,
            lgbtqCommunity: profileData.lgbtqCommunity,
            youthSpecificNeeds: profileData.youthSpecificNeeds,
            soloParent: profileData.soloParent,
            others: profileData.others,
            othersSpecify: profileData.othersSpecify,
            sports: profileData.sports,
            sportsOtherSpecify: profileData.sportsOtherSpecify,
            hobbies: profileData.hobbies
          }
        } : undefined
      }
    });

    res.status(201).json({
      message: 'Registration successful. Account pending approval.',
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          select: {
            name: true,
            displayName: true,
            permissions: true
          }
        }
      }
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        error: 'Account is not active',
        status: user.status
      });
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token with multi-role support
    const roleNames = user.roles.map(r => r.name);
    
    // Collect all permissions from all roles
    const allPermissions = new Set<string>();
    user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        allPermissions.add(permission);
      });
    });
    
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: roleNames[0] || 'VISITOR',
      roles: roleNames
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: roleNames[0] || 'VISITOR',
        roles: roleNames,
        permissions: Array.from(allPermissions),
        status: user.status,
        otpEnabled: user.otpEnabled
      },
      requiresOTP: user.otpEnabled
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const getProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: {
          select: {
            name: true,
            displayName: true,
            permissions: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Format response to match frontend expectations
    const roleNames = user.roles.map(r => r.name);
    
    // Collect all permissions from all roles
    const allPermissions = new Set<string>();
    user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        allPermissions.add(permission);
      });
    });
    
    const response = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      suffix: user.suffix,
      contactNumber: user.contactNumber,
      address: user.address,
      proofOfResidency: user.proofOfResidency,
      role: roleNames[0] || 'VISITOR',
      roles: roleNames,
      permissions: Array.from(allPermissions),
      status: user.status,
      otpEnabled: user.otpEnabled,
      consentAgreed: user.consentAgreed,
      consentDate: user.consentDate,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({ user: response });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;
    const { firstName, lastName, middleName, contactNumber, address, otpEnabled } = req.body;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        firstName,
        lastName,
        middleName,
        contactNumber,
        address,
        otpEnabled
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

    // Format response to match frontend expectations
    const roleNames = user.roles.map(r => r.name);
    const response = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      middleName: user.middleName,
      contactNumber: user.contactNumber,
      address: user.address,
      role: roleNames[0] || 'VISITOR',
      roles: roleNames,
      status: user.status,
      otpEnabled: user.otpEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({ user: response });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

export const sendLoginOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          select: {
            name: true,
            displayName: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if account is active
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({
        error: 'Account is not active',
        status: user.status
      });
    }

    // Check if user has a contact number
    if (!user.contactNumber) {
      return res.status(400).json({ error: 'No contact number found. Please update your profile.' });
    }

    // Send OTP using Telerivet with user's actual phone number
    const otpResult = await sendOTP(user.contactNumber);

    if (!otpResult.success) {
      return res.status(400).json({ error: otpResult.error });
    }

    res.json({
      message: 'OTP sent successfully. SMS may take 2-5 minutes to arrive.',
      requiresOTP: true,
      phoneNumber: user.contactNumber.replace(/\d(?=\d{4})/g, '*'), // Mask phone number for security
      estimatedDelivery: '2-5 minutes',
      expiryTime: '15 minutes'
    });
  } catch (error: any) {
    console.error('Send OTP error:', error);
    if (error.code === 'P1001') {
      return res.status(503).json({ error: 'Database connection failed. Please try again later.' });
    }
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

export const resendOTP = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.contactNumber) {
      return res.status(404).json({ error: 'User not found or no contact number' });
    }

    // Send new OTP
    const otpResult = await sendOTP(user.contactNumber);

    if (!otpResult.success) {
      return res.status(400).json({ error: otpResult.error });
    }

    res.json({
      message: 'New OTP sent successfully. SMS may take 2-5 minutes to arrive.',
      estimatedDelivery: '2-5 minutes'
    });
  } catch (error: any) {
    console.error('Resend OTP error:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

export const verifyLoginOTP = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        roles: {
          select: {
            name: true,
            displayName: true,
            permissions: true
          }
        }
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Verify OTP using user's actual phone number from database
    const verifyResult = await verifyOTP(user.contactNumber!, otp);

    if (!verifyResult.success) {
      return res.status(401).json({ error: verifyResult.error });
    }

    // Generate token with multi-role support
    const roleNames = user.roles.map(r => r.name);
    
    // Collect all permissions from all roles
    const allPermissions = new Set<string>();
    user.roles.forEach(role => {
      role.permissions.forEach(permission => {
        allPermissions.add(permission);
      });
    });
    
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: roleNames[0] || 'VISITOR',
      roles: roleNames
    });

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: roleNames[0] || 'VISITOR',
        roles: roleNames,
        permissions: Array.from(allPermissions),
        status: user.status
      }
    });
  } catch (error: any) {
    console.error('Verify OTP error:', error);
    if (error.code === 'P1001') {
      return res.status(503).json({ error: 'Database connection failed. Please try again later.' });
    }
    res.status(500).json({ error: 'OTP verification failed' });
  }
};

// ========== FORGOT PASSWORD ==========

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    // Generate 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetTokenExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Hash the reset code for storage
    const hashedResetCode = await hashPassword(resetCode);

    // Update user with reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: hashedResetCode,
        resetTokenExpiry
      }
    });

    // Send email with reset code
    const emailResult = await sendPasswordResetEmail(email, resetCode, user.firstName);

    if (!emailResult.success) {
      return res.status(500).json({ error: 'Failed to send reset email' });
    }

    res.json({ message: 'Password reset code sent to your email!' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Failed to process password reset request' });
  }
};

export const verifyResetCode = async (req: Request, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    // Check if reset token has expired
    if (new Date() > user.resetTokenExpiry) {
      // Clear expired token
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null
        }
      });
      return res.status(400).json({ error: 'Reset code has expired' });
    }

    // Verify the reset code
    const isValidCode = await comparePassword(code, user.resetToken);

    if (!isValidCode) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    res.json({ message: 'Reset code verified successfully' });
  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({ error: 'Failed to verify reset code' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user || !user.resetToken || !user.resetTokenExpiry) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    // Check if reset token has expired
    if (new Date() > user.resetTokenExpiry) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: null,
          resetTokenExpiry: null
        }
      });
      return res.status(400).json({ error: 'Reset code has expired' });
    }

    // Verify the reset code
    const isValidCode = await comparePassword(code, user.resetToken);

    if (!isValidCode) {
      return res.status(400).json({ error: 'Invalid reset code' });
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Failed to reset password' });
  }
};
