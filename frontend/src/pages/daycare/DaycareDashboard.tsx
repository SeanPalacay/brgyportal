import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { User } from '@/types/index';
import { UserPlus, Calendar, BookOpen, Loader2, Users, BarChart } from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function DaycareDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(userData);
    // Get user roles (support both single role and multi-role)
    const userRoles = parsedUser.roles || (parsedUser.role ? [parsedUser.role] : []);
    
    if (!userRoles.some((role: string) => ['DAYCARE_STAFF', 'DAYCARE_TEACHER', 'SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'].includes(role))) {
      navigate('/dashboard');
      return;
    }
    setUser(parsedUser);
    fetchDaycareStats();
  }, [navigate]);

  const fetchDaycareStats = async () => {
    try {
      const response = await api.get('/reports/daycare');
      const report = response.data.report;
      setStats({
        totalStudents: report?.summary?.totalStudents || 0,
        pendingRegistrations: report?.summary?.pendingRegistrations || 0,
        todayAttendance: report?.summary?.attendanceRate || '0%'
      });
      
      // Convert monthly trend to chart data
      const monthlyTrend = report?.registrations?.monthlyTrends || [];
      const chartData = monthlyTrend.map((item: any) => ({
        name: item.month,
        registrations: item.count,
        students: report?.summary?.totalStudents || 0
      }));
      setChartData(chartData);
    } catch (error) {
      console.error('Failed to fetch daycare stats:', error);
      setStats({
        totalStudents: 0,
        pendingRegistrations: 0,
        todayAttendance: '0%'
      });
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout currentPage="/daycare">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Daycare Management Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome, {user.firstName}! Manage daycare services and student enrollment.
            </p>
          </div>
          <Button onClick={() => navigate('/daycare/registrations')}>
            <UserPlus className="mr-2 h-4 w-4" />
            New Registration
          </Button>
        </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-3 flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalStudents || 0}</div>
                    <p className="text-xs text-muted-foreground">Enrolled students</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Pending Registrations</CardTitle>
                    <UserPlus className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.pendingRegistrations || 0}</div>
                    <p className="text-xs text-muted-foreground">Awaiting approval</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Today's Attendance</CardTitle>
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.todayAttendance || 0}</div>
                    <p className="text-xs text-muted-foreground">Present today</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Student Enrollment Overview</CardTitle>
                <CardDescription>Monthly student enrollment and new registrations.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsBarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="students" fill="#8884d8" />
                      <Bar dataKey="registrations" fill="#82ca9d" />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    No chart data available
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common daycare tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/daycare/registrations')}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  View Registrations
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/daycare/attendance')}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Mark Attendance
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/daycare/progress-reports')}
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  Progress Reports
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/daycare/learning-materials')}
                >
                  <BookOpen className="mr-2 h-4 w-4" />
                  Learning Materials
                </Button>
              </CardContent>
            </Card>
          </div>
      </div>
    </DashboardLayout>
  );
}