// User Types
export enum UserRole {
  SYSTEM_ADMIN = 'SYSTEM_ADMIN',
  BARANGAY_CAPTAIN = 'BARANGAY_CAPTAIN',
  BARANGAY_OFFICIAL = 'BARANGAY_OFFICIAL',
  BHW = 'BHW',
  BHW_COORDINATOR = 'BHW_COORDINATOR',
  DAYCARE_STAFF = 'DAYCARE_STAFF',
  DAYCARE_TEACHER = 'DAYCARE_TEACHER',
  SK_OFFICER = 'SK_OFFICER',
  SK_CHAIRMAN = 'SK_CHAIRMAN',
  PARENT_RESIDENT = 'PARENT_RESIDENT',
  PATIENT = 'PATIENT',
  VISITOR = 'VISITOR'
}

export enum AccountStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  INACTIVE = 'INACTIVE'
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  contactNumber?: string;
  address?: string;
  role?: string; // Legacy single role support (string)
  roles?: string[]; // New multi-role support (array of role names)
  permissions?: string[]; // Navigation permissions from all roles
  status: AccountStatus;
  otpEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
  requiresOTP?: boolean;
}

// Health Types
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: string;
  bloodType?: string;
  address: string;
  contactNumber: string;
  emergencyContact: string;
  guardianName?: string;
  birthWeight?: string;
  birthLength?: string;
  motherName?: string;
  fatherName?: string;
  placeOfBirth?: string;
  createdAt?: string;
  userId?: string; // Link to user account for residents
}

export interface Appointment {
  id: string;
  patientId: string;
  appointmentDate: string;
  appointmentType: string;
  status: string;
  notes?: string;
  patient?: Patient;
  healthWorker?: User;
}

// Event Types
export interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  location: string;
  category?: string;
  maxParticipants?: number;
  status: string;
}

// Daycare Types
export interface DaycareRegistration {
  id: string;
  childFirstName: string;
  childLastName: string;
  childMiddleName?: string;
  childDateOfBirth: string;
  childGender: string;
  address: string;
  parentContact: string;
  emergencyContact: string;
  status: string;
  submittedAt: string;
}

// System Types
export interface SystemBackup {
  id: string;
  backupType: 'MANUAL' | 'SCHEDULED';
  filePath: string;
  fileSize: number;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  startedAt: string;
  completedAt?: string;
  initiatedBy: string;
  errorMessage?: string;
}

// CMS / Public Content Types
export interface Feature {
  id: string;
  title: string;
  description: string;
  iconType: string; // 'heart', 'baby', 'users'
  stats: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Benefit {
  id: string;
  text: string;
  iconType: string; // 'shield', 'fileText', 'calendar', 'barChart'
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  rating: number; // 1-5
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceFeature {
  id: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}
