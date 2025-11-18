"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  Settings,
  Activity,
  FileText,
  Database,
  Bell,
  Heart,
  Baby,
  Calendar,
  Home,
  Megaphone,
  BarChart3,
  ClipboardList,
  Syringe,
  BookOpen,
  TrendingUp,
  GraduationCap,
  PartyPopper,
  UserCheck,
  FileSpreadsheet,
} from "lucide-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import { TeamSwitcher } from "@/components/team-switcher"

// Define menu items for each role based on USER_STORIES.md and USER_FLOWS.md
const getRoleBasedNavigation = (userRole: string) => {
  // System Admin & Barangay Captain - Full Access
  if (userRole === 'SYSTEM_ADMIN' || userRole === 'BARANGAY_CAPTAIN') {
    return {
      main: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
          isActive: true,
        },
        {
          title: "User Management",
          url: "/admin/users",
          icon: Users,
          items: [
            { title: "All Users", url: "/admin/users" },
            { title: "Pending Approvals", url: "/admin/users/pending" },
            { title: "Role Management", url: "/admin/users/roles" },
          ],
        },
        {
          title: "Reports & Analytics",
          url: "/reports",
          icon: BarChart3,
          items: [
            { title: "Dashboard", url: "/reports" },
            { title: "Health Reports", url: "/reports/health" },
            { title: "Daycare Reports", url: "/reports/daycare" },
            { title: "SK Reports", url: "/reports/sk" },
            { title: "Cross-Module Analytics", url: "/reports/analytics" },
          ],
        },
        {
          title: "Health Services",
          url: "/health",
          icon: Heart,
          items: [
            { title: "Dashboard", url: "/health" },
            { title: "Patients", url: "/health/patients" },
            { title: "Appointments", url: "/health/appointments" },
            { title: "Immunization Cards", url: "/health/records" },
            { title: "Certificates", url: "/health/certificates" },
          ],
        },
        {
          title: "Daycare Management",
          url: "/daycare",
          icon: Baby,
          items: [
            { title: "Dashboard", url: "/daycare" },
            { title: "Registrations", url: "/daycare/registrations" },
            { title: "Attendance", url: "/daycare/attendance" },
            { title: "Progress Reports", url: "/daycare/progress-reports" },
            { title: "Learning Materials", url: "/daycare/materials" },
          ],
        },
        {
          title: "SK Engagement",
          url: "/sk",
          icon: PartyPopper,
          items: [
            { title: "Dashboard", url: "/sk" },
            { title: "Events", url: "/sk/events" },
            { title: "Event Registration", url: "/sk/event-registration" },
            { title: "Attendance", url: "/sk/attendance" },
          ],
        },
        {
          title: "Announcements",
          url: "/admin/announcements",
          icon: Megaphone,
        },
        {
          title: "System Settings",
          url: "/admin/settings",
          icon: Settings,
          items: [
            { title: "General Settings", url: "/admin/settings" },
            { title: "Backup Management", url: "/admin/settings/backup" },
            { title: "Audit Logs", url: "/admin/settings/audit-logs" },
            { title: "Notifications", url: "/admin/settings/notifications" },
          ],
        },
      ],
      quickActions: [
        { name: "Approve User", url: "/admin/users/pending", icon: UserCheck },
        { name: "View Reports", url: "/reports", icon: FileSpreadsheet },
        { name: "System Backup", url: "/admin/settings/backup", icon: Database },
      ],
    };
  }

  // Barangay Official - Department-specific access
  if (userRole === 'BARANGAY_OFFICIAL') {
    return {
      main: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
          isActive: true,
        },
        {
          title: "Reports & Analytics",
          url: "/reports",
          icon: BarChart3,
          items: [
            { title: "Department Reports", url: "/reports" },
            { title: "Analytics", url: "/reports/analytics" },
          ],
        },
        {
          title: "Announcements",
          url: "/announcements",
          icon: Megaphone,
        },
      ],
      quickActions: [
        { name: "View Reports", url: "/reports", icon: FileText },
        { name: "Announcements", url: "/announcements", icon: Megaphone },
      ],
    };
  }

  // BHW & BHW Coordinator - Health Services
  if (userRole === 'BHW' || userRole === 'BHW_COORDINATOR') {
    const isCoordinator = userRole === 'BHW_COORDINATOR';

    return {
      main: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
          isActive: true,
        },
        {
          title: "Health Services",
          url: "/health",
          icon: Heart,
          items: [
            { title: "Dashboard", url: "/health" },
            { title: "Patient Management", url: "/health/patients" },
            { title: "Appointments", url: "/health/appointments" },
            { title: "Immunization Cards", url: "/health/records" },
            { title: "Certificates", url: "/health/certificates" },
          ],
        },
        ...(isCoordinator ? [{
          title: "Reports",
          url: "/reports/health",
          icon: FileText,
          items: [
            { title: "Health Reports", url: "/reports/health" },
            { title: "Statistics", url: "/reports/health/stats" },
          ],
        }] : []),
        {
          title: "Notifications",
          url: "/notifications",
          icon: Bell,
        },
      ],
      quickActions: [
        { name: "Add Patient", url: "/health/patients", icon: Users },
        { name: "Schedule Appointment", url: "/health/appointments", icon: Calendar },
        { name: "Record Immunization", url: "/health/records", icon: Syringe },
      ],
    };
  }

  // Daycare Staff & Teacher
  if (userRole === 'DAYCARE_STAFF' || userRole === 'DAYCARE_TEACHER') {
    return {
      main: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
          isActive: true,
        },
        {
          title: "Daycare Management",
          url: "/daycare",
          icon: Baby,
          items: [
            { title: "Dashboard", url: "/daycare" },
            { title: "Registrations", url: "/daycare/registrations" },
            { title: "Attendance", url: "/daycare/attendance" },
            { title: "Progress Reports", url: "/daycare/progress-reports" },
            { title: "Learning Materials", url: "/daycare/materials" },
          ],
        },
        {
          title: "Notifications",
          url: "/notifications",
          icon: Bell,
        },
      ],
      quickActions: [
        { name: "Mark Attendance", url: "/daycare/attendance", icon: ClipboardList },
        { name: "Upload Materials", url: "/daycare/materials", icon: BookOpen },
        { name: "Progress Report", url: "/daycare/progress-reports", icon: GraduationCap },
      ],
    };
  }

  // SK Officer & SK Chairman
  if (userRole === 'SK_OFFICER' || userRole === 'SK_CHAIRMAN') {
    const isChairman = userRole === 'SK_CHAIRMAN';

    return {
      main: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
          isActive: true,
        },
        {
          title: "SK Engagement",
          url: "/sk",
          icon: PartyPopper,
          items: [
            { title: "Dashboard", url: "/sk" },
            { title: "Event Management", url: "/sk/events" },
            { title: "Event Registration", url: "/sk/event-registration" },
            { title: "Attendance Tracking", url: "/sk/attendance" },
          ],
        },
        ...(isChairman ? [{
          title: "Analytics",
          url: "/sk/analytics",
          icon: TrendingUp,
          items: [
            { title: "Participation Analytics", url: "/sk/analytics" },
            { title: "Reports", url: "/reports/sk" },
          ],
        }] : []),
        {
          title: "Notifications",
          url: "/notifications",
          icon: Bell,
        },
      ],
      quickActions: [
        { name: "Create Event", url: "/sk/events", icon: Calendar },
        { name: "Track Attendance", url: "/sk/attendance", icon: UserCheck },
        ...(isChairman ? [{ name: "View Analytics", url: "/sk/analytics", icon: TrendingUp }] : []),
      ],
    };
  }

  // Parent/Resident
  if (userRole === 'PARENT_RESIDENT') {
    return {
      main: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
          isActive: true,
        },
        {
          title: "Daycare Services",
          url: "/daycare/registrations",
          icon: Baby,
          items: [
            { title: "Child Registration", url: "/daycare/registrations" },
            { title: "Progress Reports", url: "/daycare/progress-reports" },
            { title: "Learning Materials", url: "/daycare/materials" },
          ],
        },
        {
          title: "My Health",
          url: "/health",
          icon: Heart,
          items: [
            { title: "My Appointments", url: "/health/appointments" },
            { title: "Immunization Cards", url: "/health/records" },
            { title: "Immunization E-Card", url: "/health/certificates" },
          ],
        },
        {
          title: "Events",
          url: "/events/public",
          icon: Calendar,
          items: [
            { title: "Browse Events", url: "/events/public" },
            { title: "My Registrations", url: "/sk/event-registration" },
          ],
        },
        {
          title: "Announcements",
          url: "/announcements",
          icon: Megaphone,
        },
        {
          title: "Notifications",
          url: "/notifications",
          icon: Bell,
        },
      ],
      quickActions: [
        { name: "Register Child", url: "/daycare/registrations", icon: Baby },
        { name: "View Appointments", url: "/health/appointments", icon: Calendar },
        { name: "Immunization Cards", url: "/health/records", icon: FileText },
      ],
    };
  }

  // KK Member - SK events + announcements only
  if (userRole === 'KK_MEMBER') {
    return {
      main: [
        {
          title: "Dashboard",
          url: "/dashboard",
          icon: LayoutDashboard,
          isActive: true,
        },
        {
          title: "SK Events",
          url: "/sk/event-registration",
          icon: Calendar,
          items: [
            { title: "Event Registration", url: "/sk/event-registration" },
            { title: "My Registrations", url: "/events/my-registrations" },
          ],
        },
        {
          title: "Announcements",
          url: "/announcements",
          icon: Megaphone,
        },
      ],
      quickActions: [
        { name: "Register for Event", url: "/sk/event-registration", icon: Calendar },
      ],
    };
  }



  // Visitor - Public access only
  return {
    main: [
      {
        title: "Home",
        url: "/",
        icon: Home,
        isActive: true,
      },
      {
        title: "Events",
        url: "/events/public",
        icon: Calendar,
      },
      {
        title: "Announcements",
        url: "/announcements",
        icon: Megaphone,
      },
      {
        title: "Services",
        url: "/services",
        icon: Activity,
      },
      {
        title: "Contact",
        url: "/contact",
        icon: Bell,
      },
    ],
    quickActions: [
      { name: "Browse Events", url: "/events/public", icon: Calendar },
      { name: "View Services", url: "/services", icon: Activity },
      { name: "Contact Us", url: "/contact", icon: Bell },
    ],
  };
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // Get user from localStorage
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {
    name: "Guest",
    email: "guest@theycare.com",
    role: "VISITOR",
    firstName: "Guest",
    lastName: "User"
  };

  // Get role-based navigation
  const navigation = getRoleBasedNavigation(user.role);

  // Format user data for NavUser component
  const userData = {
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Guest User',
    email: user.email || 'guest@theycare.com',
    avatar: user.avatar || `/avatars/${user.email}.png`,
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={[{
            name: "Gabay Barangay",
            logo: () => <img src="/theycare.png" alt="Gabay Barangay" className="h-8 w-8 object-contain" style={{ aspectRatio: '1/1' }} />, // Use a function component for logo
            plan: "Community"
          }]}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigation.main} />
        {/* Quick Actions could be added here if needed */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
// Hide the sidebar title when collapsed using a CSS variable and the [data-collapsed] attribute
// Add this to your global CSS (e.g., index.css or globals.css):
//
// .sidebar[data-collapsed="true"] .sidebar-title {
//   --sidebar-title-display: none;
// }
// Responsive sidebar header: hide title when collapsed
// You may need to add this to your global CSS if not using Tailwind's group/collapsed utilities
// .sidebar-header-responsive .sidebar-title {
//   display: inline;
// }
// .sidebar[data-collapsed="true"] .sidebar-header-responsive .sidebar-title {
//   display: none;
// }
}
