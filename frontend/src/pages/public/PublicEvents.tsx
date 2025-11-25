import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, Users, X, Check } from 'lucide-react';
import PublicLayout from '@/components/PublicLayout';
import type { Event } from '@/types/index';

export default function PublicEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [userRegistrations, setUserRegistrations] = useState<string[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [registering, setRegistering] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublicEvents();
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchUserRegistrations();
    }
  }, [user]);

  const checkUser = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

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

  const fetchUserRegistrations = async () => {
    try {
      const response = await api.get('/events/registrations/my');
      const registrations = response.data.registrations || [];
      setUserRegistrations(registrations.map((reg: any) => reg.eventId));
    } catch (error) {
      console.error('Failed to fetch user registrations');
    }
  };

  const fetchPublicEvents = async () => {
    setLoading(true);
    try {
      const response = await api.get('/events/public');
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to fetch events');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDialog(true);
  };

  const handleEventRegistration = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!selectedEvent) return;

    setRegistering(true);
    try {
      await api.post('/events/register', {
        eventId: selectedEvent.id
      });
      toast.success('Successfully registered for event!');
      setShowEventDialog(false);
      fetchUserRegistrations(); // Refresh registration status
    } catch (error: any) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.error || 'Registration failed');
      } else {
        toast.error('Failed to register for event');
      }
    } finally {
      setRegistering(false);
    }
  };

  return (
    <PublicLayout>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center max-w-3xl mx-auto">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary shadow-lg">
                <Calendar className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
                Community Events
              </h1>
              <p className="text-muted-foreground text-lg md:text-xl">
                Join us in our upcoming events and be a part of our growing community
              </p>
            </div>
          </div>
        </section>

        {/* Events Grid */}
        <section className="w-full py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No upcoming events</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {events.map(event => (
                  <Card key={event.id} className="hover:shadow-xl transition-all duration-300 hover:border-primary/50 flex flex-col">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <Badge variant="secondary">{event.category}</Badge>
                      </div>
                      <CardTitle className="text-xl">{event.title}</CardTitle>
                      <CardDescription className="line-clamp-2">{event.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 flex-1 flex flex-col">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{new Date(event.eventDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>
                            {formatTime(event.startTime)}
                            {event.endTime && ` - ${formatTime(event.endTime)}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Users className="h-4 w-4 text-primary" />
                          <span>{event.maxParticipants} available slots</span>
                        </div>
                      </div>
                      {user && userRegistrations.includes(event.id) ? (
                        <Button
                          className="w-full bg-green-600 hover:bg-green-600 text-white cursor-not-allowed opacity-80"
                          disabled={true}
                        >
                          <Check className="h-4 w-4 mr-2" />
                          Already Registered
                        </Button>
                      ) : (
                        <Button className="w-full" onClick={() => handleEventClick(event)}>
                          View Details & Register
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Event Details Dialog */}
      <Dialog open={showEventDialog} onOpenChange={setShowEventDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-6">
              {/* Event Category */}
              {selectedEvent.category && (
                <Badge variant="secondary" className="w-fit">
                  {selectedEvent.category}
                </Badge>
              )}

              {/* Event Description */}
              <div>
                <h3 className="font-semibold mb-2">Description</h3>
                <p className="text-muted-foreground">{selectedEvent.description}</p>
              </div>

              <Separator />

              {/* Event Details */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(selectedEvent.eventDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(selectedEvent.startTime)}
                        {selectedEvent.endTime && ` - ${formatTime(selectedEvent.endTime)}`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
                    </div>
                  </div>
                  
                  {selectedEvent.maxParticipants && (
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">Capacity</p>
                        <p className="text-sm text-muted-foreground">{selectedEvent.maxParticipants} participants</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Registration Status */}
              {user && userRegistrations.includes(selectedEvent.id) ? (
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Already Registered</h3>
                  <p className="text-sm text-green-700">
                    You are already registered for this event. Check your dashboard for more details.
                  </p>
                </div>
              ) : user ? (
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Confirm Registration</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Are you sure you want to register for this event? You will receive a confirmation once your registration is processed.
                  </p>
                </div>
              ) : null}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowEventDialog(false)}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                {user && userRegistrations.includes(selectedEvent.id) ? (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-600 text-white cursor-not-allowed opacity-80"
                    disabled={true}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Already Registered
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={handleEventRegistration}
                    disabled={registering}
                  >
                    {registering ? 'Registering...' :
                     user ? 'Confirm Registration' : 'Login to Register'}
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </PublicLayout>
  );
}
