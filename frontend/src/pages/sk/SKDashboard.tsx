import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import type { User } from '@/types/index';
import { Calendar, UserPlus, Trophy, Loader2, Users, BarChart } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SKDashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<{
    totalEvents: number;
    upcomingEvents: number;
    totalParticipants: number;
  } | null>(null);
  const [chartData, setChartData] = useState<{
    name: string;
    events: number;
    participants: number;
  }[]>([]);
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
    
    if (!userRoles.some((role: string) => ['SK_OFFICER', 'SK_CHAIRMAN', 'SYSTEM_ADMIN', 'BARANGAY_CAPTAIN', 'BARANGAY_OFFICIAL'].includes(role))) {
      navigate('/dashboard');
      return;
    }
    setUser(parsedUser);
    fetchSKStats();
  }, [navigate]);

  const fetchSKStats = async () => {
    try {
      const response = await api.get('/reports/sk');
      const report = response.data.report;
      setStats({
        totalEvents: report?.summary?.totalEvents || 0,
        upcomingEvents: report?.summary?.publishedEvents || 0,
        totalParticipants: report?.summary?.totalRegistrations || 0
      });
      
      // Convert monthly trend to chart data
      const monthlyTrend = report?.participation?.registrationVsAttendance || [];
      const chartData = monthlyTrend.map((item: { month: string; registrations: number }) => ({
        name: item.month,
        events: report?.summary?.totalEvents || 0,
        participants: item.registrations || 0
      }));
      setChartData(chartData);
    } catch (error) {
      console.error('Failed to fetch SK stats:', error);
      setStats({
        totalEvents: 0,
        upcomingEvents: 0,
        totalParticipants: 0
      });
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout currentPage="/sk">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">SK Engagement Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome, {user.firstName}! Manage youth events and community engagement.
            </p>
          </div>
          <Button onClick={() => navigate('/sk/events')}>
            <Calendar className="mr-2 h-4 w-4" />
            Create Event
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
                    <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                    <Trophy className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalEvents || 0}</div>
                    <p className="text-xs text-muted-foreground">All time events</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.upcomingEvents || 0}</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total Participants</CardTitle>
                    <Users className="w-4 h-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats?.totalParticipants || 0}</div>
                    <p className="text-xs text-muted-foreground">Across all events</p>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Event Participation Overview</CardTitle>
                <CardDescription>Monthly participants and new events.</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                {loading ? (
                  <div className="flex items-center justify-center h-[300px]">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="participants" stackId="1" stroke="#8884d8" fill="#8884d8" />
                      <Area type="monotone" dataKey="events" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                    </AreaChart>
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
                <CardDescription>Event management tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/sk/events')}
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  Manage Events
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/sk/event-registration')}
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Event Registration
                </Button>
                <Button
                  className="w-full justify-start"
                  variant="outline"
                  onClick={() => navigate('/sk/attendance')}
                >
                  <BarChart className="mr-2 h-4 w-4" />
                  Attendance Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
      </div>
    </DashboardLayout>
  );
}