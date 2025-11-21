import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { lazy, Suspense } from 'react';

// Loading component
const Loading = () => <div className="flex items-center justify-center min-h-screen">Loading...</div>;

// Lazy load components
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const YouthRegistration = lazy(() => import('./pages/YouthRegistration'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const Profile = lazy(() => import('./pages/Profile'));
const Notifications = lazy(() => import('./pages/Notifications'));
const NotificationPreferences = lazy(() => import('./pages/NotificationPreferences'));

// Health Services Module
const HealthDashboard = lazy(() => import('./pages/health/HealthDashboard'));
const PatientManagement = lazy(() => import('./pages/health/PatientManagement'));
const AppointmentScheduling = lazy(() => import('./pages/health/AppointmentScheduling'));
const HealthRecords = lazy(() => import('./pages/health/HealthRecords'));
const VaccinationTracking = lazy(() => import('./pages/health/VaccinationTracking'));
const CertificateGenerator = lazy(() => import('./pages/health/CertificateGenerator'));
const MyHealthRecords = lazy(() => import('./pages/health/MyHealthRecords'));

// Daycare Module
const DaycareDashboard = lazy(() => import('./pages/daycare/DaycareDashboard'));
const ChildRegistrationForm = lazy(() => import('./pages/daycare/ChildRegistrationForm'));
const StudentRegistration = lazy(() => import('./pages/daycare/StudentRegistration'));
const Enrollees = lazy(() => import('./pages/daycare/Enrollees'));
const AttendanceTracking = lazy(() => import('./pages/daycare/AttendanceTracking'));
const MyChildrenProgress = lazy(() => import('./pages/daycare/MyChildrenProgress'));
const ProgressReports = lazy(() => import('./pages/daycare/ProgressReports'));
const EducationalResources = lazy(() => import('./pages/daycare/EducationalResources'));
const LearningMaterials = lazy(() => import('./pages/daycare/LearningMaterials'));
const DaycareCertificateGenerator = lazy(() => import('./pages/daycare/CertificateGenerator'));

// SK Engagement Module
const SKDashboard = lazy(() => import('./pages/sk/SKDashboard'));
const EventManagement = lazy(() => import('./pages/sk/EventManagement'));
const EventDetails = lazy(() => import('./pages/sk/EventDetails'));
const EventRegistration = lazy(() => import('./pages/sk/EventRegistration'));
const MyEventRegistrations = lazy(() => import('./pages/sk/MyEventRegistrations'));
const AttendanceAnalytics = lazy(() => import('./pages/sk/AttendanceAnalytics'));
const SKAnalytics = lazy(() => import('./pages/sk/SKAnalytics'));
const SKCertificateGenerator = lazy(() => import('./pages/sk/CertificateGenerator'));

// Admin Module
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const PendingApprovals = lazy(() => import('./pages/admin/PendingApprovals'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));
const AuditLogs = lazy(() => import('./pages/admin/AuditLogs'));
const AnnouncementManagement = lazy(() => import('./pages/admin/AnnouncementManagement'));
const RoleManagement = lazy(() => import('./pages/admin/RoleManagement'));
const BackupManagement = lazy(() => import('./pages/admin/BackupManagement'));
const BroadcastManagement = lazy(() => import('./pages/admin/BroadcastManagement'));

// Public Pages
const Homepage = lazy(() => import('./pages/public/Homepage'));
const PublicEvents = lazy(() => import('./pages/public/PublicEvents'));
const Announcements = lazy(() => import('./pages/public/Announcements'));
const Contact = lazy(() => import('./pages/public/Contact'));
const Services = lazy(() => import('./pages/public/Services'));
const AboutBarangay = lazy(() => import('./pages/public/AboutBarangay'));

// Reports Module
const ReportsDashboard = lazy(() => import('./pages/reports/ReportsDashboard'));
const HealthReports = lazy(() => import('./pages/reports/HealthReports'));
const DaycareReports = lazy(() => import('./pages/reports/DaycareReports'));
const SKReports = lazy(() => import('./pages/reports/SKReports'));
const CrossModuleAnalytics = lazy(() => import('./pages/reports/CrossModuleAnalytics'));
const HealthStats = lazy(() => import('./pages/reports/HealthStats'));


function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <Suspense fallback={<Loading />}>
            <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Homepage />} />
            <Route path="/events/public" element={<PublicEvents />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/services" element={<Services />} />
            <Route path="/about" element={<AboutBarangay />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/register/youth" element={<YouthRegistration />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected User Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/notifications/preferences" element={
              <ProtectedRoute>
                <NotificationPreferences />
              </ProtectedRoute>
            } />

            {/* Health Services Module */}
            <Route path="/health" element={
              <ProtectedRoute>
                <HealthDashboard />
              </ProtectedRoute>
            } />
            <Route path="/health/patients" element={
              <ProtectedRoute>
                <PatientManagement />
              </ProtectedRoute>
            } />
            <Route path="/health/appointments" element={
              <ProtectedRoute>
                <AppointmentScheduling />
              </ProtectedRoute>
            } />
            <Route path="/health/records" element={
              <ProtectedRoute>
                <HealthRecords />
              </ProtectedRoute>
            } />
            <Route path="/health/my-records" element={
              <ProtectedRoute>
                <MyHealthRecords />
              </ProtectedRoute>
            } />
            <Route path="/health/vaccinations" element={
              <ProtectedRoute>
                <VaccinationTracking />
              </ProtectedRoute>
            } />
            <Route path="/health/certificates" element={
              <ProtectedRoute>
                <CertificateGenerator />
              </ProtectedRoute>
            } />

            {/* Daycare Module */}
            <Route path="/daycare" element={
              <ProtectedRoute>
                <DaycareDashboard />
              </ProtectedRoute>
            } />
            <Route path="/daycare/registration" element={
              <ProtectedRoute>
                <ChildRegistrationForm />
              </ProtectedRoute>
            } />
            <Route path="/daycare/registrations" element={
              <ProtectedRoute>
                <StudentRegistration />
              </ProtectedRoute>
            } />
            <Route path="/daycare/enrollees" element={
              <ProtectedRoute>
                <Enrollees />
              </ProtectedRoute>
            } />
            <Route path="/daycare/attendance" element={
              <ProtectedRoute>
                <AttendanceTracking />
              </ProtectedRoute>
            } />
            <Route path="/daycare/progress" element={
              <ProtectedRoute>
                <MyChildrenProgress />
              </ProtectedRoute>
            } />
            <Route path="/daycare/progress-reports" element={
              <ProtectedRoute>
                <ProgressReports />
              </ProtectedRoute>
            } />
            <Route path="/daycare/resources" element={
              <ProtectedRoute>
                <EducationalResources />
              </ProtectedRoute>
            } />
            <Route path="/daycare/materials" element={
              <ProtectedRoute>
                <LearningMaterials />
              </ProtectedRoute>
            } />
            <Route path="/daycare/certificates" element={
              <ProtectedRoute>
                <DaycareCertificateGenerator />
              </ProtectedRoute>
            } />

            {/* SK Engagement Module */}
            <Route path="/sk" element={
              <ProtectedRoute>
                <SKDashboard />
              </ProtectedRoute>
            } />
            <Route path="/sk/events" element={
              <ProtectedRoute>
                <EventManagement />
              </ProtectedRoute>
            } />
            <Route path="/sk/events/:id" element={
              <ProtectedRoute>
                <EventDetails />
              </ProtectedRoute>
            } />
            <Route path="/sk/event-registration" element={
              <ProtectedRoute>
                <EventRegistration />
              </ProtectedRoute>
            } />
            <Route path="/events/my-registrations" element={
              <ProtectedRoute>
                <MyEventRegistrations />
              </ProtectedRoute>
            } />
            <Route path="/sk/attendance" element={
              <ProtectedRoute>
                <AttendanceAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/sk/analytics" element={
              <ProtectedRoute>
                <SKAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/sk/certificates" element={
              <ProtectedRoute>
                <SKCertificateGenerator />
              </ProtectedRoute>
            } />

            {/* Admin Module */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/users/pending" element={
              <ProtectedRoute>
                <PendingApprovals />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings" element={
              <ProtectedRoute>
                <SystemSettings />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings/audit-logs" element={
              <ProtectedRoute>
                <AuditLogs />
              </ProtectedRoute>
            } />
            <Route path="/admin/announcements" element={
              <ProtectedRoute>
                <AnnouncementManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/users/roles" element={
              <ProtectedRoute>
                <RoleManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings/backup" element={
              <ProtectedRoute>
                <BackupManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/settings/notifications" element={
              <ProtectedRoute>
                <BroadcastManagement />
              </ProtectedRoute>
            } />

            {/* Reports Module */}
            <Route path="/reports" element={
              <ProtectedRoute>
                <ReportsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/reports/health" element={
              <ProtectedRoute>
                <HealthReports />
              </ProtectedRoute>
            } />
            <Route path="/reports/daycare" element={
              <ProtectedRoute>
                <DaycareReports />
              </ProtectedRoute>
            } />
            <Route path="/reports/sk" element={
              <ProtectedRoute>
                <SKReports />
              </ProtectedRoute>
            } />
            <Route path="/reports/analytics" element={
              <ProtectedRoute>
                <CrossModuleAnalytics />
              </ProtectedRoute>
            } />
            <Route path="/reports/health/stats" element={
              <ProtectedRoute>
                <HealthStats />
              </ProtectedRoute>
            } />

            {/* Catch all - redirect to homepage */}
            <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;
