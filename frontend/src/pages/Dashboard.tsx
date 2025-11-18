import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import {
  Users,
  Calendar,
  Heart,
  Baby,
  Activity,
  Settings,
  FileText,
  ArrowRight,
  Shield,
  UserCheck,
  Crown,
  Stethoscope,
  GraduationCap,
  Trophy,
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    
    // Get user roles (support both single role and multi-role)
    const userRoles = user.roles || (user.role ? [user.role] : []);
    
    // Only redirect if user has exactly ONE role (single-role users)
    if (userRoles.length === 1) {
      const singleRole = userRoles[0];
      if (['BHW', 'BHW_COORDINATOR'].includes(singleRole)) {
        navigate('/health');
        return;
      }
      if (['DAYCARE_STAFF', 'DAYCARE_TEACHER'].includes(singleRole)) {
        navigate('/daycare');
        return;
      }
      if (['SK_OFFICER', 'SK_CHAIRMAN'].includes(singleRole)) {
        navigate('/sk');
        return;
      }
      if (['SYSTEM_ADMIN', 'BARANGAY_CAPTAIN'].includes(singleRole)) {
        navigate('/admin');
        return;
      }
    }
    // Multi-role users stay on the main dashboard
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Get user roles (support both single role and multi-role)
  const userRoles = user.roles || (user.role ? [user.role] : []);
  
  // Get role display info
  const getRoleInfo = (role: string) => {
    const roleConfig: Record<string, { label: string; variant: 'default' | 'destructive' | 'outline' | 'secondary'; icon: React.ComponentType<{ className?: string }> }> = {
      'SYSTEM_ADMIN': { label: 'System Admin', variant: 'destructive' as const, icon: Shield },
      'BARANGAY_CAPTAIN': { label: 'Barangay Captain', variant: 'default' as const, icon: Crown },
      'BARANGAY_OFFICIAL': { label: 'Barangay Official', variant: 'secondary' as const, icon: UserCheck },
      'BHW': { label: 'BHW', variant: 'outline' as const, icon: Stethoscope },
      'BHW_COORDINATOR': { label: 'BHW Coordinator', variant: 'outline' as const, icon: Stethoscope },
      'DAYCARE_STAFF': { label: 'Daycare Staff', variant: 'outline' as const, icon: GraduationCap },
      'DAYCARE_TEACHER': { label: 'Daycare Teacher', variant: 'outline' as const, icon: GraduationCap },
      'SK_OFFICER': { label: 'SK Officer', variant: 'outline' as const, icon: Trophy },
      'SK_CHAIRMAN': { label: 'SK Chairman', variant: 'outline' as const, icon: Trophy },
      'PARENT_RESIDENT': { label: 'Parent/Resident', variant: 'secondary' as const, icon: Users },
      'KK_MEMBER': { label: 'KK Member', variant: 'secondary' as const, icon: Calendar },
      'PATIENT': { label: 'Patient', variant: 'secondary' as const, icon: Heart },
      'VISITOR': { label: 'Visitor', variant: 'outline' as const, icon: Users },
    };
    return roleConfig[role] || { label: role.replace('_', ' '), variant: 'outline' as const, icon: Users };
  };
  
  // Multi-role dashboard actions based on user's roles
  const quickActions = [
    // Health Services
    {
      title: 'Health Dashboard',
      description: 'Manage patients and appointments',
      icon: Heart,
      path: '/health',
      available: userRoles.some(role => ['BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN'].includes(role))
    },
    // Daycare Services
    {
      title: 'Daycare Dashboard',
      description: 'Manage student enrollment and attendance',
      icon: Baby,
      path: '/daycare',
      available: userRoles.some(role => ['DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN'].includes(role))
    },
    // SK Services
    {
      title: 'SK Dashboard',
      description: 'Manage youth events and engagement',
      icon: Calendar,
      path: '/sk',
      available: userRoles.some(role => ['SK_OFFICER', 'SK_CHAIRMAN', 'SYSTEM_ADMIN'].includes(role))
    },
    // Admin Services
    {
      title: 'Admin Dashboard',
      description: 'System administration and user management',
      icon: Users,
      path: '/admin',
      available: userRoles.some(role => ['SYSTEM_ADMIN', 'BARANGAY_CAPTAIN'].includes(role))
    },
    // Reports
    {
      title: 'Reports & Analytics',
      description: 'View comprehensive reports and insights',
      icon: Activity,
      path: '/reports',
      available: userRoles.some(role => ['SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BHW_COORDINATOR', 'SK_CHAIRMAN'].includes(role))
    },
    // Public Services
    {
      title: 'My Health Records',
      description: 'View health records and appointments',
      icon: Heart,
      path: '/health/my-records',
      available: userRoles.some(role => ['PATIENT', 'PARENT_RESIDENT'].includes(role))
    },
    {
      title: 'Daycare Registration',
      description: 'Register children for daycare',
      icon: Baby,
      path: '/daycare/registration',
      available: userRoles.some(role => ['PARENT_RESIDENT'].includes(role))
    },
    {
      title: 'SK Events',
      description: 'Register for youth programs and track slots',
      icon: Calendar,
      path: '/sk/event-registration',
      available: userRoles.some(role => ['PARENT_RESIDENT', 'KK_MEMBER'].includes(role))
    },
    {
      title: 'Profile Settings',
      description: 'Update your profile information',
      icon: Settings,
      path: '/profile',
      available: true
    }
  ];

  const availableActions = quickActions.filter(action => action.available);

  return (
    <DashboardLayout currentPage="/dashboard">
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user.firstName}!</h1>
              <p className="text-muted-foreground text-lg">
                Access your barangay services and stay connected with the community.
              </p>
            </div>
          </div>
        </div>

        {/* Multi-Role Overview */}
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <h3 className="font-semibold text-lg">
                    {userRoles.length > 1 ? 'Multi-Role Access' : 'Your Role'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {userRoles.length > 1 
                      ? `You have access to ${userRoles.length} different service areas. Use the dashboard below to navigate to your responsibilities.`
                      : 'Access your designated service area and responsibilities.'
                    }
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {userRoles.map((role, index) => {
                    const roleInfo = getRoleInfo(role);
                    const Icon = roleInfo.icon;
                    return (
                      <Badge key={index} variant={roleInfo.variant} className="flex items-center gap-1.5 px-3 py-1">
                        <Icon className="h-3 w-3" />
                        {roleInfo.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Role-Based Actions */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            {userRoles.length > 1 ? 'Your Service Areas' : 'Quick Actions'}
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card 
                  key={index} 
                  className="group hover:shadow-lg hover:border-primary/20 transition-all duration-200 cursor-pointer hover:scale-[1.02]"
                  onClick={() => navigate(action.path)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-linear-to-br from-primary/10 to-primary/5 group-hover:from-primary/20 group-hover:to-primary/10 transition-colors">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-base group-hover:text-primary transition-colors">{action.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{action.description}</p>
                    <Button 
                      variant="outline" 
                      className="w-full group-hover:border-primary group-hover:text-primary transition-colors"
                    >
                      Access Service
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Information Section */}
        <Card className="bg-linear-to-r from-primary/5 via-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Barangay Services Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                  <Heart className="h-8 w-8 text-red-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Health Services</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Medical care, immunization tracking, and health monitoring for all residents</p>
                </div>
              </div>
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center">
                  <Baby className="h-8 w-8 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Daycare Services</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Early childhood education, development tracking, and safe childcare</p>
                </div>
              </div>
              <div className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
                  <Calendar className="h-8 w-8 text-green-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">SK Programs</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">Youth development, community events, and leadership opportunities</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
