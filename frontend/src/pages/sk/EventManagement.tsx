import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, Users, Eye, Trash2, Play, X, Plus, Filter, Search, Edit, FileDown } from 'lucide-react';
import type { Event } from '@/types/index';
import { exportEventAttendeesToPDF } from '@/lib/exportUtils';

export default function EventManagement() {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    startTime: '',
    endTime: '',
    location: '',
    category: '',
    maxParticipants: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [events, searchTerm, statusFilter, categoryFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/events');
      console.log('Fetched events:', response.data);
      setEvents(response.data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const filterEvents = () => {
    let filtered = events;

    if (searchTerm) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    } else {
      // Exclude cancelled events when showing all events
      filtered = filtered.filter(event => event.status !== 'CANCELLED');
    }

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(event => event.category === categoryFilter);
    }

    // Sort events: future events first (by date ascending), then past events (by date descending)
    const now = new Date();
    const futureEvents = filtered.filter(event => new Date(event.eventDate) >= now)
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    const pastEvents = filtered.filter(event => new Date(event.eventDate) < now)
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

    setFilteredEvents([...futureEvents, ...pastEvents]);
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

  const handleEditClick = (event: Event) => {
    setEditingEvent(event);
    // Extract just the date part (YYYY-MM-DD)
    const eventDate = new Date(event.eventDate).toISOString().split('T')[0];
    // Extract just the time part (HH:MM)
    const startTime = event.startTime ? event.startTime.substring(0, 5) : '';
    const endTime = event.endTime ? event.endTime.substring(0, 5) : '';

    setFormData({
      title: event.title,
      description: event.description,
      eventDate: eventDate,
      startTime: startTime,
      endTime: endTime,
      location: event.location,
      category: event.category || '',
      maxParticipants: event.maxParticipants ? String(event.maxParticipants) : ''
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingEvent) return;

    // Validate required fields
    if (!formData.title || !formData.description || !formData.eventDate || !formData.startTime || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await api.put(`/events/${editingEvent.id}`, {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
      });

      toast.success('Event updated successfully!');
      setIsEditDialogOpen(false);
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        eventDate: '',
        startTime: '',
        endTime: '',
        location: '',
        category: '',
        maxParticipants: ''
      });
      fetchEvents();
    } catch (error: any) {
      console.error('Update event error:', error);
      const message = error?.response?.data?.error || 'Failed to update event';
      toast.error(message);
    }
  };

  const handleSubmit = async (e: React.FormEvent, status: 'DRAFT' | 'PUBLISHED') => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title || !formData.description || !formData.eventDate || !formData.startTime || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate date is not in the past
    const selectedDate = new Date(formData.eventDate + 'T00:00:00');
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      alert('Event date cannot be in the past');
      return;
    }

    try {
      const response = await api.post('/events', {
        ...formData,
        maxParticipants: formData.maxParticipants ? parseInt(formData.maxParticipants) : null,
        status
      });
      
      console.log('Event created successfully:', response.data);
      toast.success(`Event ${status === 'PUBLISHED' ? 'published' : 'saved as draft'} successfully!`);
      
      setShowCreateForm(false);
      setFormData({
        title: '',
        description: '',
        eventDate: '',
        startTime: '',
        endTime: '',
        location: '',
        category: '',
        maxParticipants: ''
      });
      fetchEvents();
    } catch (error: any) {
      console.error('Create event error:', error);
      const message = error?.response?.data?.error || 'Failed to create event';
      toast.error(message);
    }
  };

  const handlePublishEvent = async (eventId: string) => {
    try {
      await api.patch(`/events/${eventId}/status`, { status: 'PUBLISHED' });
      toast.success('Event published successfully!');
      fetchEvents();
    } catch (error: any) {
      const message = error?.response?.data?.error || 'Failed to publish event';
      toast.error(message);
    }
  };

  const handleCancelEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to cancel this event?')) {
      try {
        await api.patch(`/events/${eventId}/status`, { status: 'CANCELLED' });
        toast.success('Event cancelled successfully!');
        fetchEvents();
      } catch (error: any) {
        const message = error?.response?.data?.error || 'Failed to cancel event';
        toast.error(message);
      }
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      try {
        await api.delete(`/events/${eventId}`);
        toast.success('Event deleted successfully!');
        fetchEvents();
      } catch (error: any) {
        const message = error?.response?.data?.error || 'Failed to delete event';
        toast.error(message);
      }
    }
  };

  const handleExportAttendees = async (event: Event) => {
    try {
      const response = await api.get(`/events/${event.id}/attendance`);
      const attendance = response.data.attendance || [];

      if (attendance.length === 0) {
        toast.error('No attendance records to export for this event');
        return;
      }

      const exportData = {
        eventTitle: event.title,
        eventDate: event.eventDate,
        eventCategory: event.category,
        eventLocation: event.location,
        attendees: attendance.map((record: any) => ({
          firstName: record.user?.firstName || '',
          lastName: record.user?.lastName || '',
          email: record.user?.email || '',
          contactNumber: record.user?.contactNumber,
          attendedAt: record.attendedAt,
          remarks: record.remarks
        }))
      };

      exportEventAttendeesToPDF(exportData);
      toast.success('Attendee list exported successfully!');
    } catch (error) {
      console.error('Failed to export attendees:', error);
      toast.error('Failed to export attendee list');
    }
  };

  const getUniqueCategories = () => {
    const categories = events.map(event => event.category).filter((category): category is string => Boolean(category));
    return [...new Set(categories)];
  };

  if (loading) {
    return (
      <DashboardLayout currentPage="/sk/events">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  };

  return (
    <DashboardLayout currentPage="/sk/events">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Event Management</h1>
            <p className="text-muted-foreground mt-1">Create and manage SK events</p>
          </div>
          <Button onClick={() => setShowCreateForm(!showCreateForm)} className="w-fit">
            <Plus className="h-4 w-4 mr-2" />
            {showCreateForm ? 'Cancel' : 'Create New Event'}
          </Button>
        </div>

        {/* Filters */}
        {!showCreateForm && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search events..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="ONGOING">Ongoing</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getUniqueCategories().map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        )}

        {showCreateForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New Event</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Event Title *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description *</label>
                  <Textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Event Date *</label>
                    <Input
                      type="date"
                      value={formData.eventDate}
                      min={(() => {
                        const today = new Date();
                        const year = today.getFullYear();
                        const month = String(today.getMonth() + 1).padStart(2, '0');
                        const day = String(today.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                      })()}
                      onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Start Time *</label>
                    <Input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">End Time</label>
                    <Input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Location *</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({...formData, location: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Category</label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sports">Sports</SelectItem>
                        <SelectItem value="Health">Health</SelectItem>
                        <SelectItem value="Educational">Educational</SelectItem>
                        <SelectItem value="Cultural">Cultural</SelectItem>
                        <SelectItem value="Assembly">Assembly</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Max Participants</label>
                    <Input
                      type="number"
                      value={formData.maxParticipants}
                      onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                      placeholder="Leave blank for unlimited"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button type="button" variant="outline" className="flex-1" onClick={(e) => handleSubmit(e, 'DRAFT')}>
                    Save as Draft
                  </Button>
                  <Button type="button" className="flex-1" onClick={(e) => handleSubmit(e, 'PUBLISHED')}>
                    Publish Event
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6">
          {filteredEvents.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground text-center">
                  {events.length === 0 ? 'No events created yet.' : 'No events match your filters.'}
                </p>
                <p className="text-sm text-muted-foreground text-center mt-1">
                  {events.length === 0 ? 'Create your first event to get started.' : 'Try adjusting your search or filters.'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredEvents.length} of {events.length} events
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/20">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-lg line-clamp-2 hover:text-primary transition-colors">{event.title}</CardTitle>
                      <Badge
                        variant={event.status === 'PUBLISHED' ? 'default' :
                                event.status === 'DRAFT' ? 'secondary' :
                                event.status === 'COMPLETED' ? 'outline' :
                                event.status === 'ONGOING' ? 'default' :
                                'destructive'}
                        className="shrink-0"
                      >
                        {event.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(event.eventDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>
                          {formatTime(event.startTime)}
                          {event.endTime && ` - ${formatTime(event.endTime)}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                      {event.maxParticipants && (
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>Max: {event.maxParticipants}</span>
                        </div>
                      )}
                      {event.category && (
                        <Badge variant="outline" className="w-fit">{event.category}</Badge>
                      )}
                    </div>

                    <Separator />

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => navigate(`/sk/events/${event.id}`)} className="flex-1 min-w-fit">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleExportAttendees(event)} className="flex-1 min-w-fit">
                        <FileDown className="h-3 w-3 mr-1" />
                        Export
                      </Button>
                      {(event.status === 'DRAFT' || event.status === 'PUBLISHED') && (
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(event)} className="flex-1 min-w-fit">
                          <Edit className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                      )}
                      {event.status === 'DRAFT' && (
                        <Button size="sm" onClick={() => handlePublishEvent(event.id)} className="flex-1 min-w-fit">
                          <Play className="h-3 w-3 mr-1" />
                          Publish
                        </Button>
                      )}
                      {(event.status === 'DRAFT' || event.status === 'PUBLISHED') && (
                        <Button size="sm" variant="outline" onClick={() => handleCancelEvent(event.id)}>
                          <X className="h-3 w-3 mr-1" />
                          Cancel
                        </Button>
                      )}
                      {event.status === 'DRAFT' && (
                        <Button size="sm" variant="outline" onClick={() => handleDeleteEvent(event.id)}>
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              </div>
            </>
          )}
        </div>

        {/* Edit Event Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Event Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description *</label>
                <Textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Event Date *</label>
                  <Input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Start Time *</label>
                  <Input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Time</label>
                  <Input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Location *</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sports">Sports</SelectItem>
                      <SelectItem value="Health">Health</SelectItem>
                      <SelectItem value="Educational">Educational</SelectItem>
                      <SelectItem value="Cultural">Cultural</SelectItem>
                      <SelectItem value="Assembly">Assembly</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Max Participants</label>
                  <Input
                    type="number"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                    placeholder="Leave blank for unlimited"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  Update Event
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
