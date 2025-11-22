import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Calendar, Users, Clock, MapPin, Search, Filter, UserCheck, UserX, Eye, RefreshCw } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  description?: string;
  eventDate: string;
  startTime: string;
  endTime?: string;
  location?: string;
  capacity?: number;
  registeredCount?: number;
  status?: string;
  maxParticipants?: number;
}

interface Registration {
  id: string;
  eventId: string;
  event?: Event;
  userId: string;
  userName: string;
  email: string;
  contactNumber?: string;
  status: string;
  registrationDate: string;
  notes?: string;
}

export default function EventRegistration() {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [showManageDialog, setShowManageDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [filterEvent, setFilterEvent] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [allRegistrations, setAllRegistrations] = useState<Registration[]>([]);
  const [formData, setFormData] = useState({
    contactNumber: '',
    notes: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRoles = user.roles || [user.role]; // Support both single role and multi-role
  const isStaff = userRoles.some((role: string) => ['SK_OFFICER', 'SK_CHAIRMAN', 'SYSTEM_ADMIN'].includes(role));

  // Helper function to format time correctly (avoid timezone issues)
  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    // Extract just the time part if it's a full ISO string
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

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      fetchRegistrations();
    }
  }, [events, isStaff]);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      const eventsData = response.data.events || [];

      // Fetch registration counts for each event
      const eventsWithCounts = await Promise.all(
        eventsData.map(async (event: Event) => {
          try {
            const regResponse = await api.get(`/events/${event.id}/registrations`);
            return {
              ...event,
              registeredCount: regResponse.data.registrations?.length || 0
            };
          } catch {
            return { ...event, registeredCount: 0 };
          }
        })
      );

      setEvents(eventsWithCounts);
    } catch (error) {
      toast.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrations = async () => {
    try {
      const response = await api.get('/events/registrations/my');
      setRegistrations(response.data.registrations || []);
      
      // If user is staff, also fetch all registrations
      if (isStaff) {
        await fetchAllRegistrations();
      }
    } catch (error) {
      toast.error('Failed to fetch registrations');
    }
  };

  const fetchAllRegistrations = async () => {
    try {
      // Fetch registrations for all events
      const allRegs: Registration[] = [];
      
      for (const event of events) {
        try {
          const response = await api.get(`/events/${event.id}/registrations`);
          const eventRegs = response.data.registrations || [];
          allRegs.push(...eventRegs.map((reg: any) => ({
            ...reg,
            event: event,
            userName: `${reg.user?.firstName || ''} ${reg.user?.lastName || ''}`.trim(),
            email: reg.user?.email || '',
            contactNumber: reg.user?.contactNumber || '',
            registrationDate: reg.registeredAt || reg.createdAt
          })));
        } catch (error) {
          console.error(`Failed to fetch registrations for event ${event.id}:`, error);
        }
      }
      
      setAllRegistrations(allRegs);
    } catch (error) {
      console.error('Failed to fetch all registrations:', error);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEvent) return;

    // Check if already registered
    const existingReg = registrations.find(
      r => r.eventId === selectedEvent.id && r.userId === user.userId
    );

    if (existingReg) {
      toast.error('You are already registered for this event');
      return;
    }

    // Check capacity
    if (selectedEvent.capacity && selectedEvent.registeredCount! >= selectedEvent.capacity) {
      toast.error('Event is at full capacity');
      return;
    }

    try {
      await api.post('/events/register', {
        eventId: selectedEvent.id,
        contactNumber: formData.contactNumber,
        notes: formData.notes
      });

      toast.success('Registration successful!');
      setShowRegisterDialog(false);
      setSelectedEvent(null);
      setFormData({
        contactNumber: '',
        notes: ''
      });
      // Refresh both events and registrations to update UI
      await Promise.all([fetchEvents(), fetchRegistrations()]);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
    }
  };

  const handleApprove = async (registrationId: string) => {
    try {
      await api.patch(`/events/registrations/${registrationId}`, {
        status: 'APPROVED'
      });
      toast.success('Registration approved');
      fetchRegistrations();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to approve registration');
    }
  };

  const handleReject = async (registrationId: string) => {
    try {
      await api.patch(`/events/registrations/${registrationId}`, {
        status: 'REJECTED'
      });
      toast.success('Registration rejected');
      fetchRegistrations();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reject registration');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline', label: string }> = {
      PENDING: { variant: 'outline', label: 'Pending' },
      APPROVED: { variant: 'default', label: 'Approved' },
      REJECTED: { variant: 'destructive', label: 'Rejected' },
      CANCELLED: { variant: 'secondary', label: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const isEventFull = (event: Event) => {
    return event.maxParticipants && event.registeredCount! >= event.maxParticipants;
  };

  const isEventPast = (eventDate: string) => {
    return new Date(eventDate) < new Date();
  };

  const myRegistrations = registrations.filter(r => r.userId === user.id || r.userId === user.userId);
  
  // Use all registrations for staff, personal registrations for others
  const baseRegistrations = isStaff ? allRegistrations : registrations;
  
  let filteredRegistrations = baseRegistrations;
  
  // Apply filters
  if (filterEvent && filterEvent !== 'all') {
    filteredRegistrations = filteredRegistrations.filter(r => r.eventId === filterEvent);
  }
  
  if (searchTerm) {
    filteredRegistrations = filteredRegistrations.filter(r => 
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.event?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
  
  if (statusFilter !== 'all') {
    filteredRegistrations = filteredRegistrations.filter(r => r.status === statusFilter);
  }

  const stats = {
    totalEvents: events.length,
    upcomingEvents: events.filter(e => !isEventPast(e.eventDate)).length,
    myRegistrations: myRegistrations.length,
    pendingApprovals: isStaff ? allRegistrations.filter(r => r.status === 'PENDING').length : 0,
    totalRegistrations: isStaff ? allRegistrations.length : myRegistrations.length
  };

  return (
    <DashboardLayout currentPage="/sk/event-registration">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Event Registration</h1>
          <p className="text-muted-foreground">Register for community events and manage registrations</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalEvents}</div>
              <p className="text-xs text-muted-foreground">Available events</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Clock className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">Events to come</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{isStaff ? 'Total Registrations' : 'My Registrations'}</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{isStaff ? stats.totalRegistrations : stats.myRegistrations}</div>
              <p className="text-xs text-muted-foreground">{isStaff ? 'All registrations' : 'Your registrations'}</p>
            </CardContent>
          </Card>
          {isStaff && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <UserCheck className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.pendingApprovals}</div>
                <p className="text-xs text-muted-foreground">Need approval</p>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Available Events</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading events...</p>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No events available.</p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => {
                  const isRegistered = myRegistrations.some(r => r.eventId === event.id);
                  const isFull = isEventFull(event);
                  const isPast = isEventPast(event.eventDate);
                  const isCancelled = event.status === 'CANCELLED';

                  return (
                    <Card key={event.id} className="border">
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          {isCancelled && <Badge variant="destructive">Cancelled</Badge>}
                          {isPast && !isCancelled && <Badge variant="secondary">Past</Badge>}
                          {isFull && !isPast && !isCancelled && <Badge variant="destructive">Full</Badge>}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          📅 {new Date(event.eventDate).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 mb-2">
                          🕒 {formatTime(event.startTime)}
                          {event.endTime && ` - ${formatTime(event.endTime)}`}
                        </p>
                        {event.location && (
                          <p className="text-sm text-gray-600 mb-2">
                            📍 {event.location}
                          </p>
                        )}
                        {event.maxParticipants && (
                          <p className="text-sm text-gray-600 mb-3">
                            Capacity: {event.registeredCount}/{event.maxParticipants}
                          </p>
                        )}
                        {event.description && (
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        {isRegistered ? (
                          <Badge variant="default" className="w-full justify-center">
                            Already Registered
                          </Badge>
                        ) : (
                          <Button
                            className="w-full"
                            disabled={isFull || isPast || isCancelled}
                            onClick={() => {
                              setSelectedEvent(event);
                              setShowRegisterDialog(true);
                            }}
                          >
                            {isCancelled ? 'Event Cancelled' : isPast ? 'Event Ended' : isFull ? 'Event Full' : 'Register Now'}
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {isStaff && (
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Manage Registrations
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    View and manage all event registrations
                  </p>
                </div>
                <Button onClick={() => fetchAllRegistrations()} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>
              
              {/* Filters */}
              <div className="flex flex-col md:flex-row gap-4 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search registrations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterEvent} onValueChange={setFilterEvent}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All events</SelectItem>
                    {events.map((event) => (
                      <SelectItem key={event.id} value={event.id}>
                        {event.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All status</SelectItem>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="APPROVED">Approved</SelectItem>
                    <SelectItem value="REJECTED">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {filteredRegistrations.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {allRegistrations.length === 0 ? 'No registrations yet.' : 'No registrations match your filters.'}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {allRegistrations.length === 0 ? 'Registrations will appear here once users sign up for events.' : 'Try adjusting your search or filters.'}
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredRegistrations.length} of {allRegistrations.length} registrations
                    </p>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Event</TableHead>
                          <TableHead>Participant</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Registered Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredRegistrations.map((registration) => (
                          <TableRow key={registration.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                {registration.event?.title || 'Unknown Event'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-muted-foreground" />
                                {registration.userName || 'Unknown User'}
                              </div>
                            </TableCell>
                            <TableCell>{registration.email || '-'}</TableCell>
                            <TableCell>{registration.contactNumber || '-'}</TableCell>
                            <TableCell>
                              {registration.registrationDate ? new Date(registration.registrationDate).toLocaleDateString() : '-'}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(registration.status)}
                            </TableCell>
                            <TableCell>
                              {registration.status === 'PENDING' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(registration.id)}
                                    className="h-8"
                                  >
                                    <UserCheck className="h-3 w-3 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleReject(registration.id)}
                                    className="h-8"
                                  >
                                    <UserX className="h-3 w-3 mr-1" />
                                    Reject
                                  </Button>
                                </div>
                              )}
                              {registration.status !== 'PENDING' && (
                                <span className="text-sm text-muted-foreground">No actions</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        )}

        <Dialog open={showRegisterDialog} onOpenChange={setShowRegisterDialog}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Register for Event</DialogTitle>
            </DialogHeader>
            {selectedEvent && (
              <div className="mb-4">
                <h3 className="font-semibold text-lg">{selectedEvent.title}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  📅 {new Date(selectedEvent.eventDate).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  🕒 {formatTime(selectedEvent.startTime)}
                  {selectedEvent.endTime && ` - ${formatTime(selectedEvent.endTime)}`}
                </p>
                {selectedEvent.location && (
                  <p className="text-sm text-gray-600">📍 {selectedEvent.location}</p>
                )}
              </div>
            )}
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Contact Number *</label>
                <Input
                  value={formData.contactNumber}
                  onChange={(e) => {
                    let value = e.target.value;
                    // Remove any non-digit characters
                    value = value.replace(/\D/g, '');
                    
                    // Handle different input formats
                    if (value.startsWith('639')) {
                      // Convert +639XXXXXXXXX to 09XXXXXXXXX
                      value = '0' + value.substring(2);
                    } else if (value.startsWith('9') && value.length === 10) {
                      // Convert 9XXXXXXXXX to 09XXXXXXXXX
                      value = '0' + value;
                    }
                    
                    // Ensure it starts with 09 and limit to 11 digits
                    if (value.length > 0 && !value.startsWith('09')) {
                      if (value.startsWith('0')) {
                        value = '09' + value.substring(1);
                      } else {
                        value = '09' + value;
                      }
                    }
                    
                    // Limit to 11 digits
                    if (value.length > 11) {
                      value = value.substring(0, 11);
                    }
                    
                    setFormData({...formData, contactNumber: value});
                  }}
                  placeholder="09XXXXXXXXX"
                  maxLength={11}
                  pattern="09[0-9]{9}"
                  required
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter your phone number in 09XXXXXXXXX format
                </p>
              </div>

              <div>
                <label className="text-sm font-medium">Additional Notes</label>
                <Textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any special requirements or questions"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Your registration will be pending approval by the event organizer.
                  You will receive a notification once your registration is approved.
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRegisterDialog(false);
                    setSelectedEvent(null);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Confirm Registration</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
