import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  UserCheck,
  Filter,
  BarChart3,
  AlertCircle
} from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  location?: string;
  maxParticipants?: number;
  status?: string;
}

interface Registration {
  id: string;
  eventId: string;
  userId: string;
  status: string;
  registeredAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    contactNumber?: string;
  };
}

interface AttendanceRecord {
  id: string;
  eventId: string;
  event?: Event;
  userId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  attendedAt: string;
  remarks?: string;
}

interface EventStats {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  totalRegistrations: number;
  totalAttendees: number;
  attendanceRate: number;
}

export default function AttendanceAnalytics() {
  const [events, setEvents] = useState<Event[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [eventStats, setEventStats] = useState<EventStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [showMarkDialog, setShowMarkDialog] = useState(false);
  const [registeredUsers, setRegisteredUsers] = useState<Registration[]>([]);
  const [markFormData, setMarkFormData] = useState({
    userId: '',
    remarks: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRoles = user.roles || [user.role];
  const isStaff = userRoles.some((role: any) => {
    const roleName = typeof role === 'string' ? role : role.name;
    return ['SK_OFFICER', 'SK_CHAIRMAN', 'SYSTEM_ADMIN', 'BARANGAY_CAPTAIN'].includes(roleName);
  });

  useEffect(() => {
    fetchEvents();
    fetchEventStats();
  }, []);

  useEffect(() => {
    if (selectedEvent) {
      fetchAttendance(selectedEvent);
      fetchEventRegistrations(selectedEvent);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      const eventsList = response.data.events || [];
      setEvents(eventsList);
      if (eventsList.length > 0) {
        setSelectedEvent(eventsList[0].id);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async (eventId: string) => {
    try {
      const response = await api.get(`/events/${eventId}/attendance`);
      setAttendanceRecords(response.data.attendance || []);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      toast.error('Failed to fetch attendance');
    }
  };

  const fetchEventRegistrations = async (eventId: string) => {
    try {
      const response = await api.get(`/events/${eventId}/registrations`);
      const approvedUsers = response.data.registrations?.filter(
        (r: Registration) => r.status === 'APPROVED'
      ) || [];
      console.log('Approved registrations:', approvedUsers);
      setRegisteredUsers(approvedUsers);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
      toast.error('Failed to fetch registrations');
    }
  };

  const fetchEventStats = async () => {
    try {
      const eventsRes = await api.get('/events');
      const events = eventsRes.data.events || [];

      const statsPromises = events.map(async (event: Event) => {
        try {
          const [regRes, attRes] = await Promise.all([
            api.get(`/events/${event.id}/registrations`),
            api.get(`/events/${event.id}/attendance`)
          ]);

          const registrations = regRes.data.registrations || [];
          const attendance = attRes.data.attendance || [];

          const totalRegistrations = registrations.filter(
            (r: Registration) => r.status === 'APPROVED'
          ).length;
          const totalAttendees = attendance.length;

          return {
            eventId: event.id,
            eventTitle: event.title,
            eventDate: event.eventDate,
            totalRegistrations,
            totalAttendees,
            attendanceRate: totalRegistrations > 0 ? (totalAttendees / totalRegistrations) * 100 : 0
          };
        } catch {
          return null;
        }
      });

      const stats = (await Promise.all(statsPromises)).filter(Boolean) as EventStats[];
      setEventStats(stats);
    } catch (error) {
      console.error('Failed to fetch event statistics:', error);
      toast.error('Failed to fetch event statistics');
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!markFormData.userId) {
      toast.error('Please select a participant');
      return;
    }

    try {
      await api.post('/events/attendance', {
        eventId: selectedEvent,
        userId: markFormData.userId,
        remarks: markFormData.remarks
      });

      toast.success('Attendance marked successfully!');
      setShowMarkDialog(false);
      setMarkFormData({
        userId: '',
        remarks: ''
      });
      fetchAttendance(selectedEvent);
      fetchEventStats();
    } catch (error: any) {
      console.error('Mark attendance error:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to mark attendance');
    }
  };

  const getAttendanceRateBadge = (rate: number) => {
    if (rate >= 80) return <Badge className="bg-green-500">{rate.toFixed(1)}%</Badge>;
    if (rate >= 60) return <Badge className="bg-yellow-500">{rate.toFixed(1)}%</Badge>;
    if (rate >= 40) return <Badge className="bg-orange-500">{rate.toFixed(1)}%</Badge>;
    return <Badge variant="destructive">{rate.toFixed(1)}%</Badge>;
  };

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    const timeMatch = timeString.match(/(\d{2}):(\d{2})/);
    if (timeMatch) {
      const [_, hours, minutes] = timeMatch;
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    return timeString;
  };

  const overallStats = {
    totalEvents: eventStats.length,
    totalAttendees: eventStats.reduce((sum, e) => sum + e.totalAttendees, 0),
    totalRegistrations: eventStats.reduce((sum, e) => sum + e.totalRegistrations, 0),
    avgAttendanceRate: eventStats.length > 0
      ? eventStats.reduce((sum, e) => sum + e.attendanceRate, 0) / eventStats.length
      : 0,
    upcomingEvents: events.filter(e => new Date(e.eventDate) > new Date()).length
  };

  const selectedEventData = events.find(e => e.id === selectedEvent);
  const selectedEventStats = eventStats.find(s => s.eventId === selectedEvent);

  // Filter out users who already have attendance marked
  const availableUsers = registeredUsers.filter(reg =>
    !attendanceRecords.some(att => att.userId === reg.userId)
  );

  return (
    <DashboardLayout currentPage="/sk/attendance">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Attendance Analytics</h1>
          <p className="text-muted-foreground mt-1">Track and analyze event participation</p>
        </div>

        {/* Overall Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overallStats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">All time events tracked</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Registrations</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{overallStats.totalRegistrations}</div>
              <p className="text-xs text-muted-foreground">Approved participants</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Attendees</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{overallStats.totalAttendees}</div>
              <p className="text-xs text-muted-foreground">Marked as attended</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Attendance Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {overallStats.avgAttendanceRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Across all events</p>
            </CardContent>
          </Card>
        </div>

        {/* Event Statistics Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              <CardTitle>Event Statistics Overview</CardTitle>
            </div>
            <CardDescription>Performance metrics for all events</CardDescription>
          </CardHeader>
          <CardContent>
            {eventStats.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No event statistics available.</p>
                <p className="text-sm text-muted-foreground mt-1">Create events to start tracking attendance.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Event</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-center">Registered</TableHead>
                      <TableHead className="text-center">Attended</TableHead>
                      <TableHead className="text-center">No-Show</TableHead>
                      <TableHead className="text-right">Attendance Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventStats.map((stat) => (
                      <TableRow key={stat.eventId}>
                        <TableCell className="font-medium">{stat.eventTitle}</TableCell>
                        <TableCell>
                          {new Date(stat.eventDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline">{stat.totalRegistrations}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-500">{stat.totalAttendees}</Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary">
                            {stat.totalRegistrations - stat.totalAttendees}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {getAttendanceRateBadge(stat.attendanceRate)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Details */}
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <CardTitle>Attendance Details</CardTitle>
                  </div>
                  <CardDescription>View detailed attendance records by event</CardDescription>
                </div>
                <div className="flex gap-2 items-center">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                    <SelectTrigger className="w-[280px]">
                      <SelectValue placeholder="Select event..." />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Mark Attendance Button - Only show for staff when event is selected */}
              {isStaff && selectedEvent && selectedEventData && (
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 text-sm">
                    <UserCheck className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      Ready to mark attendance for "{selectedEventData.title}"
                    </span>
                    {availableUsers.length > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {availableUsers.length} pending
                      </Badge>
                    )}
                  </div>
                  <Button onClick={() => setShowMarkDialog(true)} size="default">
                    <UserCheck className="mr-2 h-4 w-4" />
                    Mark Attendance
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedEventData && (
              <div className="mb-6 p-4 bg-muted/50 rounded-lg border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{selectedEventData.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedEventData.eventDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      {selectedEventData.startTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatTime(selectedEventData.startTime)}
                          {selectedEventData.endTime && ` - ${formatTime(selectedEventData.endTime)}`}
                        </div>
                      )}
                    </div>
                  </div>
                  {selectedEventData.status && (
                    <Badge variant={selectedEventData.status === 'COMPLETED' ? 'default' : 'secondary'}>
                      {selectedEventData.status}
                    </Badge>
                  )}
                </div>

                <Separator className="my-3" />

                {selectedEventStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-background rounded-md">
                      <Users className="h-4 w-4 text-muted-foreground mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Registered</p>
                      <p className="text-xl font-bold">{selectedEventStats.totalRegistrations}</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-md">
                      <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Attended</p>
                      <p className="text-xl font-bold text-green-600">{selectedEventStats.totalAttendees}</p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-md">
                      <XCircle className="h-4 w-4 text-red-500 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">No-Show</p>
                      <p className="text-xl font-bold text-red-600">
                        {selectedEventStats.totalRegistrations - selectedEventStats.totalAttendees}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-background rounded-md">
                      <TrendingUp className="h-4 w-4 text-purple-500 mx-auto mb-1" />
                      <p className="text-xs text-muted-foreground">Attendance Rate</p>
                      <p className="text-xl font-bold text-purple-600">
                        {selectedEventStats.attendanceRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="text-muted-foreground mt-4">Loading attendance...</p>
              </div>
            ) : attendanceRecords.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-lg font-medium">No attendance records yet</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {isStaff
                    ? 'Click "Mark Attendance" above to start tracking participants.'
                    : 'Attendance records will appear here once marked by event organizers.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Participant</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Attended At</TableHead>
                      <TableHead>Remarks</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendanceRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            {record.user
                              ? `${record.user.firstName} ${record.user.lastName}`
                              : 'Unknown User'}
                          </div>
                        </TableCell>
                        <TableCell>{record.user?.email || '-'}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {new Date(record.attendedAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {record.remarks || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mark Attendance Dialog */}
        <Dialog open={showMarkDialog} onOpenChange={setShowMarkDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Mark Attendance
              </DialogTitle>
            </DialogHeader>

            {selectedEventData && (
              <div className="p-4 bg-muted/50 rounded-lg border">
                <h3 className="font-semibold">{selectedEventData.title}</h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(selectedEventData.eventDate).toLocaleDateString()}
                  </div>
                  {selectedEventData.startTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(selectedEventData.startTime)}
                    </div>
                  )}
                </div>
              </div>
            )}

            <form onSubmit={handleMarkAttendance} className="space-y-4">
              <div>
                <label className="text-sm font-medium flex items-center gap-2 mb-2">
                  <Users className="h-4 w-4" />
                  Select Participant *
                </label>
                <Select
                  value={markFormData.userId}
                  onValueChange={(value) => setMarkFormData({...markFormData, userId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a registered participant..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        {registeredUsers.length === 0
                          ? 'No approved registrations yet'
                          : 'All participants already marked'}
                      </div>
                    ) : (
                      availableUsers.map((registration) => (
                        <SelectItem key={registration.userId} value={registration.userId}>
                          {`${registration.user.firstName} ${registration.user.lastName}`}
                          <span className="text-muted-foreground text-xs ml-2">
                            ({registration.user.email})
                          </span>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {availableUsers.length} participant(s) available to mark
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Remarks (Optional)</label>
                <Textarea
                  rows={3}
                  value={markFormData.remarks}
                  onChange={(e) => setMarkFormData({...markFormData, remarks: e.target.value})}
                  placeholder="Any additional notes about the attendance..."
                />
              </div>

              <Separator />

              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowMarkDialog(false);
                    setMarkFormData({ userId: '', remarks: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={!markFormData.userId}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Mark as Attended
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
