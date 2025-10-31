"use client"

import * as React from "react"
import {
  LayoutDashboard,
  Users,
  Settings, 
  FileText,
  Database,
  Heart,
  Baby,
  Calendar,
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

const getMultiRoleNavigation = (userRoles: string[], userPermissions: string[] = [], hasPatientRecord: boolean = false) => {
  const hasPermission = (permission: string) => userPermissions.includes(permission);
  const navigation = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    main: [] as any[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    quickActions: [] as any[]
  };

  // Always add dashboard
  navigation.main.push({
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard,
    isActive: true,
  });

  // Admin Navigation - Based on permissions
  if (hasPermission('ADMIN_DASHBOARD') || hasPermission('USER_MANAGEMENT')) {
    const adminItems = [];
    
    if (hasPermission('USER_MANAGEMENT')) {
      adminItems.push({ title: "All Users", url: "/admin/users" });
      adminItems.push({ title: "Pending Approvals", url: "/admin/users/pending" });
    }
    
    if (hasPermission('ROLE_MANAGEMENT')) {
      adminItems.push({ title: "Role Management", url: "/admin/users/roles" });
    }
    
    if (adminItems.length > 0) {
      navigation.main.push({
        title: "User Management",
        url: "/admin/users",
        icon: Users,
        items: adminItems,
      });
    }
  }

  // System Settings
  if (hasPermission('SYSTEM_SETTINGS') || hasPermission('AUDIT_LOGS') || hasPermission('BACKUP_MANAGEMENT')) {
    const settingsItems = [];
    
    if (hasPermission('SYSTEM_SETTINGS')) {
      settingsItems.push({ title: "General Settings", url: "/admin/settings" });
    }
    
    if (hasPermission('BACKUP_MANAGEMENT')) {
      settingsItems.push({ title: "Backup Management", url: "/admin/settings/backup" });
    }
    
    if (hasPermission('AUDIT_LOGS')) {
      settingsItems.push({ title: "Audit Logs", url: "/admin/settings/audit-logs" });
    }
    
    if (hasPermission('BROADCAST_MANAGEMENT')) {
      settingsItems.push({ title: "Notifications", url: "/admin/settings/notifications" });
    }
    
    if (settingsItems.length > 0) {
      navigation.main.push({
        title: "System Settings",
        url: "/admin/settings",
        icon: Settings,
        items: settingsItems,
      });
    }
  }

  // Announcements
  if (hasPermission('ANNOUNCEMENTS')) {
    navigation.main.push({
      title: "Announcements",
      url: "/admin/announcements",
      icon: Megaphone,
    });
  }

  // Health Services
  if (hasPermission('HEALTH_DASHBOARD')) {
    const healthItems = [{ title: "Dashboard", url: "/health" }];
    
    if (hasPermission('PATIENT_MANAGEMENT')) {
      healthItems.push({ title: "Patient Management", url: "/health/patients" });
    }
    
    if (hasPermission('APPOINTMENTS')) {
      healthItems.push({ title: "Appointments", url: "/health/appointments" });
    }
    
    if (hasPermission('HEALTH_RECORDS')) {
      healthItems.push({ title: "Health Records", url: "/health/records" });
    }
    

    
    navigation.main.push({
      title: "Health Services",
      url: "/health",
      icon: Heart,
      items: healthItems,
    });
  }

  // My Health Records (for patients/residents)
  if (hasPermission('MY_HEALTH_RECORDS')) {
    navigation.main.push({
      title: "My Health Records",
      url: "/health/my-records",
      icon: Heart,
      items: [
        { title: "Immunization Records", url: "/health/my-records" },
      ],
    });
  }

  // Daycare Services
  if (hasPermission('DAYCARE_DASHBOARD')) {
    const daycareItems = [{ title: "Dashboard", url: "/daycare" }];
    
    if (hasPermission('STUDENT_REGISTRATIONS')) {
      daycareItems.push({ title: "Registrations", url: "/daycare/registrations" });
    }
    
    if (hasPermission('ATTENDANCE_TRACKING')) {
      daycareItems.push({ title: "Attendance", url: "/daycare/attendance" });
    }
    
    if (hasPermission('PROGRESS_REPORTS')) {
      daycareItems.push({ title: "Progress Reports", url: "/daycare/progress-reports" });
    }
    
    if (hasPermission('LEARNING_MATERIALS')) {
      daycareItems.push({ title: "Learning Materials", url: "/daycare/materials" });
    }
    
    if (hasPermission('DAYCARE_CERTIFICATES')) {
      daycareItems.push({ title: "Certificates", url: "/daycare/certificates" });
    }
    
    navigation.main.push({
      title: "Daycare Management",
      url: "/daycare",
      icon: Baby,
      items: daycareItems,
    });
  }

  // Child Registration (for parents)
  if (hasPermission('CHILD_REGISTRATION')) {
    navigation.main.push({
      title: "Daycare Services",
      url: "/daycare/registration",
      icon: Baby,
      items: [
        { title: "Child Registration", url: "/daycare/registration" },
        { title: "My Children's Progress", url: "/daycare/progress" },
        { title: "Educational Resources", url: "/daycare/resources" },
      ],
    });
  }

  // Educational Resources (separate access)
  if (hasPermission('EDUCATIONAL_RESOURCES')) {
    navigation.main.push({
      title: "Educational Resources",
      url: "/daycare/resources",
      icon: BookOpen,
    });
  }

  // SK Services
  if (hasPermission('SK_DASHBOARD') || hasPermission('EVENT_REGISTRATION') || hasPermission('MY_EVENT_REGISTRATIONS')) {
    const skItems = [];
    
    if (hasPermission('SK_DASHBOARD')) {
      skItems.push({ title: "Dashboard", url: "/sk" });
    }
    
    if (hasPermission('EVENT_MANAGEMENT')) {
      skItems.push({ title: "Event Management", url: "/sk/events" });
    }
    
    if (hasPermission('EVENT_REGISTRATION')) {
      skItems.push({ title: "Event Registration", url: "/sk/event-registration" });
    }
    
    if (hasPermission('MY_EVENT_REGISTRATIONS')) {
      skItems.push({ title: "My Registrations", url: "/events/my-registrations" });
    }
    
    if (hasPermission('ATTENDANCE_ANALYTICS')) {
      skItems.push({ title: "Attendance Tracking", url: "/sk/attendance" });
    }
    
    if (hasPermission('SK_ANALYTICS')) {
      skItems.push({ title: "Analytics", url: "/sk/analytics" });
    }
    
    if (hasPermission('SK_CERTIFICATES')) {
      skItems.push({ title: "Certificates", url: "/sk/certificates" });
    }
    
    navigation.main.push({
      title: "SK Engagement",
      url: hasPermission('SK_DASHBOARD') ? "/sk" : (hasPermission('EVENT_REGISTRATION') ? "/sk/event-registration" : "/events/my-registrations"),
      icon: PartyPopper,
      items: skItems,
    });
  }

  // Reports & Analytics
  if (hasPermission('REPORTS_DASHBOARD')) {
    const reportItems = [{ title: "Dashboard", url: "/reports" }];
    
    if (hasPermission('HEALTH_REPORTS')) {
      reportItems.push({ title: "Health Reports", url: "/reports/health" });
    }
    
    if (hasPermission('DAYCARE_REPORTS')) {
      reportItems.push({ title: "Daycare Reports", url: "/reports/daycare" });
    }
    
    if (hasPermission('SK_REPORTS')) {
      reportItems.push({ title: "SK Reports", url: "/reports/sk" });
    }
    
    if (hasPermission('CROSS_MODULE_ANALYTICS')) {
      reportItems.push({ title: "Cross-Module Analytics", url: "/reports/analytics" });
    }
    
    if (hasPermission('HEALTH_STATS')) {
      reportItems.push({ title: "Health Statistics", url: "/reports/health/stats" });
    }
    
    navigation.main.push({
      title: "Reports & Analytics",
      url: "/reports",
      icon: BarChart3,
      items: reportItems,
    });
  }

  // Public Services
  if (hasPermission('PUBLIC_ANNOUNCEMENTS')) {
    navigation.main.push({
      title: "Announcements",
      url: "/announcements",
      icon: Megaphone,
    });
  }

  if (hasPermission('PUBLIC_EVENTS')) {
    navigation.main.push({
      title: "Public Events",
      url: "/events/public",
      icon: Calendar,
    });
  }

  // Deduplicate main navigation items by title, merging subitems if they exist
  const mainMap = new Map();
  navigation.main.forEach(item => {
    if (mainMap.has(item.title)) {
      const existing = mainMap.get(item.title);
      if (item.items && existing.items) {
        // Merge subitems, deduplicating by title
        const itemMap = new Map();
        // @ts-expect-error: items is any[] but we know it has title
        existing.items.forEach(sub => itemMap.set(sub.title, sub));
        // @ts-expect-error: items is any[] but we know it has title
        item.items.forEach(sub => itemMap.set(sub.title, sub));
        existing.items = Array.from(itemMap.values());
      }
    } else {
      mainMap.set(item.title, item);
    }
  });
  navigation.main = Array.from(mainMap.values());

  // Deduplicate quick actions by name
  const quickMap = new Map();
  navigation.quickActions.forEach(action => {
    quickMap.set(action.name, action);
  });
  navigation.quickActions = Array.from(quickMap.values());

  return navigation;
};

export function MultiRoleSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : {
    name: "Guest",
    email: "guest@theycare.com",
    roles: ["VISITOR"],
    firstName: "Guest",
    lastName: "User"
  };

  // Get multi-role navigation with permissions
  const userRoles = user.roles || [user.role || "VISITOR"];
  const userPermissions = user.permissions || [];
  const hasPatientRecord = user.hasPatientRecord || false;
  
  // Debug logging
  console.log('User roles:', userRoles);
  console.log('User permissions:', userPermissions);
  
  const navigation = getMultiRoleNavigation(userRoles, userPermissions, hasPatientRecord);

  const userData = {
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.name || 'Guest User',
    email: user.email || 'guest@theycare.com',
    avatar: user.avatar || '',
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher
          teams={[{
            name: "Gabay Barangay",
            logo: () => <img src="/theycare.png" alt="Gabay Barangay" className="h-8 w-8 object-contain" style={{ aspectRatio: '1/1' }} />,
            plan: "Community"
          }]}
        />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navigation.main} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}