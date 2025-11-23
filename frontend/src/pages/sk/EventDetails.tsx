import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users, ArrowLeft, UserCheck } from 'lucide-react';
import type { Event } from '@/types/index';

interface EventRegistration {
  id: string;
  status: string;
  registeredAt: string;
  confirmedAt?: string;
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
  userId: string;
  attendedAt: string;
  remarks?: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showMarkAttendance, setShowMarkAttendance] = useState(false);
  const [markAttendanceData, setMarkAttendanceData] = useState({
    userId: '',
    remarks: ''
  });

  useEffect(() => {
    if (id) {
      fetchEvent();
      fetchAttendance();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      const [eventResponse, registrationsResponse] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/events/${id}/registrations?status=APPROVED`)
      ]);
      setEvent(eventResponse.data.event);
      setRegistrations(registrationsResponse.data.registrations || []);
    } catch (error) {
      console.error('Failed to fetch event data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendance = async () => {
    try {
      const response = await api.get(`/events/${id}/attendance`);
      setAttendance(response.data.attendance || []);
    } catch (error) {
      console.error('Failed to fetch attendance');
    }
  };

  const markAttendance = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if we've reached the maximum of 100 attendees
    if (attendance.length >= 100) {
      alert('Maximum of 100 attendees reached for this event.');
      return;
    }

    try {
      await api.post('/events/attendance', {
        eventId: id,
        userId: markAttendanceData.userId,
        remarks: markAttendanceData.remarks
      });

      setMarkAttendanceData({ userId: '', remarks: '' });
      setShowMarkAttendance(false);
      fetchAttendance(); // Refresh the attendance list
    } catch (error) {
      console.error('Failed to mark attendance', error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="/sk/events">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!event) {
    return (
      <DashboardLayout currentPage="/sk/events">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Event not found</p>
          <Button onClick={() => navigate('/sk/events')} className="mt-4">
            Back to Events
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="/sk/events">
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/sk/events')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Events
          </Button>
          <Badge variant={event.status === 'PUBLISHED' ? 'default' : event.status === 'DRAFT' ? 'secondary' : 'destructive'}>
            {event.status}
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{event.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">{event.description}</p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.eventDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(event.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      {event.endTime && ` - ${new Date(event.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>
                
                {event.maxParticipants && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Capacity</p>
                      <p className="text-sm text-muted-foreground">{event.maxParticipants} participants</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {event.category && (
              <div>
                <p className="font-medium mb-2">Category</p>
                <Badge variant="outline">{event.category}</Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Approved Participants */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Approved Participants ({registrations.length})
              </div>
              <Button onClick={() => setShowMarkAttendance(true)}>
                <UserCheck className="h-4 w-4 mr-2" />
                Mark Attendance
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {registrations.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No approved participants yet.
              </p>
            ) : (
              <div className="space-y-3">
                {registrations.map((registration) => {
                  const hasAttended = attendance.some(a => a.userId === registration.user.id);
                  return (
                    <div
                      key={registration.id}
                      className={`flex items-center justify-between p-3 border rounded-lg ${
                        hasAttended ? 'bg-green-50 border-green-200' : 'bg-muted/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          hasAttended ? 'bg-green-100' : 'bg-primary/10'
                        }`}>
                          <span className={`text-sm font-medium ${
                            hasAttended ? 'text-green-800' : 'text-primary'
                          }`}>
                            {registration.user.firstName.charAt(0)}{registration.user.lastName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">
                            {registration.user.firstName} {registration.user.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {registration.user.email}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {hasAttended ? (
                          <Badge variant="default" className="bg-green-600">
                            Attended
                          </Badge>
                        ) : attendance.length >= 100 ? (
                          <span className="text-sm text-muted-foreground">Limit reached</span>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setMarkAttendanceData({
                                userId: registration.user.id,
                                remarks: ''
                              });
                              setShowMarkAttendance(true);
                            }}
                          >
                            Mark Attended
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5" />
              Attendance Records ({attendance.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attendance.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No attendance records marked yet.
              </p>
            ) : (
              <div className="space-y-3">
                {attendance.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg bg-green-50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-green-800">
                          {record.user?.firstName?.charAt(0)}{record.user?.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">
                          {record.user?.firstName} {record.user?.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {record.user?.email}
                        </p>
                        {record.remarks && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Remarks:</span> {record.remarks}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="default" className="bg-green-600">
                        Attended
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(record.attendedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>

    {/* Mark Attendance Dialog */}
    <>
      {showMarkAttendance && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Mark Attendance</h3>

            <form onSubmit={markAttendance}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Select Participant</label>
                <select
                  value={markAttendanceData.userId}
                  onChange={(e) => setMarkAttendanceData({...markAttendanceData, userId: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Choose a participant...</option>
                  {attendance.length < 100 && registrations
                    .filter(reg => !attendance.some(att => att.userId === reg.user.id))
                    .map(reg => (
                      <option key={reg.user.id} value={reg.user.id}>
                        {reg.user.firstName} {reg.user.lastName}
                      </option>
                    ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Remarks (Optional)</label>
                <textarea
                  value={markAttendanceData.remarks}
                  onChange={(e) => setMarkAttendanceData({...markAttendanceData, remarks: e.target.value})}
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowMarkAttendance(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Mark Attended</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}