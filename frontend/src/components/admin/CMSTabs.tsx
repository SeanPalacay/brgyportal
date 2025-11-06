import { useState, useEffect } from 'react';
import { Feature, Benefit, Testimonial, ServiceFeature } from '@/types';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Pencil, Trash2, Eye, EyeOff, AlertTriangle } from 'lucide-react';

// ===== FEATURES TAB =====
export function FeaturesTab() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingFeature, setEditingFeature] = useState<Feature | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    iconType: 'heart',
    stats: 'Active',
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      const response = await api.get('/admin/features');
      setFeatures(response.data.features);
    } catch (error) {
      toast.error('Failed to load features');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingFeature) {
        await api.put(`/admin/features/${editingFeature.id}`, formData);
        toast.success('Feature updated successfully');
      } else {
        await api.post('/admin/features', formData);
        toast.success('Feature created successfully');
      }
      setDialogOpen(false);
      resetForm();
      fetchFeatures();
    } catch (error) {
      toast.error('Failed to save feature');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/admin/features/${deletingId}`);
      toast.success('Feature deleted successfully');
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchFeatures();
    } catch (error) {
      toast.error('Failed to delete feature');
    }
  };

  const toggleActive = async (id: string) => {
    try {
      await api.patch(`/admin/features/${id}/toggle-active`);
      fetchFeatures();
    } catch (error) {
      toast.error('Failed to toggle feature status');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      iconType: 'heart',
      stats: 'Active',
      isActive: true,
      sortOrder: 0
    });
    setEditingFeature(null);
  };

  const openEditDialog = (feature: Feature) => {
    setEditingFeature(feature);
    setFormData({
      title: feature.title,
      description: feature.description,
      iconType: feature.iconType,
      stats: feature.stats,
      isActive: feature.isActive,
      sortOrder: feature.sortOrder
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  if (loading) return <div>Loading features...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Homepage Features</CardTitle>
            <CardDescription>Manage the main features displayed on the homepage</CardDescription>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Feature
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {features.map((feature) => (
              <TableRow key={feature.id}>
                <TableCell className="font-medium">{feature.title}</TableCell>
                <TableCell>{feature.iconType}</TableCell>
                <TableCell>{feature.stats}</TableCell>
                <TableCell>{feature.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={feature.isActive}
                      onCheckedChange={() => toggleActive(feature.id)}
                    />
                    {feature.isActive ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(feature)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(feature.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingFeature ? 'Edit Feature' : 'Add Feature'}</DialogTitle>
              <DialogDescription>
                {editingFeature ? 'Update the feature details below' : 'Create a new homepage feature'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="iconType">Icon Type</Label>
                  <Select value={formData.iconType} onValueChange={(value) => setFormData({ ...formData, iconType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heart">Heart</SelectItem>
                      <SelectItem value="baby">Baby</SelectItem>
                      <SelectItem value="users">Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="stats">Stats Text</Label>
                  <Input
                    id="stats"
                    value={formData.stats}
                    onChange={(e) => setFormData({ ...formData, stats: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-2 mt-8">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingFeature ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Feature?
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the feature.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeletingId(null); }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// ===== BENEFITS TAB =====
export function BenefitsTab() {
  const [benefits, setBenefits] = useState<Benefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    text: '',
    iconType: 'shield',
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    fetchBenefits();
  }, []);

  const fetchBenefits = async () => {
    try {
      const response = await api.get('/admin/benefits');
      setBenefits(response.data.benefits);
    } catch (error) {
      toast.error('Failed to load benefits');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingBenefit) {
        await api.put(`/admin/benefits/${editingBenefit.id}`, formData);
        toast.success('Benefit updated successfully');
      } else {
        await api.post('/admin/benefits', formData);
        toast.success('Benefit created successfully');
      }
      setDialogOpen(false);
      resetForm();
      fetchBenefits();
    } catch (error) {
      toast.error('Failed to save benefit');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/admin/benefits/${deletingId}`);
      toast.success('Benefit deleted successfully');
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchBenefits();
    } catch (error) {
      toast.error('Failed to delete benefit');
    }
  };

  const toggleActive = async (id: string) => {
    try {
      await api.patch(`/admin/benefits/${id}/toggle-active`);
      fetchBenefits();
    } catch (error) {
      toast.error('Failed to toggle benefit status');
    }
  };

  const resetForm = () => {
    setFormData({
      text: '',
      iconType: 'shield',
      isActive: true,
      sortOrder: 0
    });
    setEditingBenefit(null);
  };

  const openEditDialog = (benefit: Benefit) => {
    setEditingBenefit(benefit);
    setFormData({
      text: benefit.text,
      iconType: benefit.iconType,
      isActive: benefit.isActive,
      sortOrder: benefit.sortOrder
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  if (loading) return <div>Loading benefits...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Benefits</CardTitle>
            <CardDescription>Manage the benefits/quick wins displayed on the homepage</CardDescription>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Benefit
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Text</TableHead>
              <TableHead>Icon</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {benefits.map((benefit) => (
              <TableRow key={benefit.id}>
                <TableCell className="font-medium">{benefit.text}</TableCell>
                <TableCell>{benefit.iconType}</TableCell>
                <TableCell>{benefit.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={benefit.isActive}
                      onCheckedChange={() => toggleActive(benefit.id)}
                    />
                    {benefit.isActive ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(benefit)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(benefit.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingBenefit ? 'Edit Benefit' : 'Add Benefit'}</DialogTitle>
              <DialogDescription>
                {editingBenefit ? 'Update the benefit details below' : 'Create a new benefit'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="text">Benefit Text</Label>
                <Input
                  id="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="iconType">Icon Type</Label>
                <Select value={formData.iconType} onValueChange={(value) => setFormData({ ...formData, iconType: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shield">Shield</SelectItem>
                    <SelectItem value="fileText">File Text</SelectItem>
                    <SelectItem value="calendar">Calendar</SelectItem>
                    <SelectItem value="barChart">Bar Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-2 mt-8">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingBenefit ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Benefit?
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the benefit.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeletingId(null); }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// ===== TESTIMONIALS TAB =====
export function TestimonialsTab() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    content: '',
    rating: 5,
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await api.get('/admin/testimonials');
      setTestimonials(response.data.testimonials);
    } catch (error) {
      toast.error('Failed to load testimonials');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingTestimonial) {
        await api.put(`/admin/testimonials/${editingTestimonial.id}`, formData);
        toast.success('Testimonial updated successfully');
      } else {
        await api.post('/admin/testimonials', formData);
        toast.success('Testimonial created successfully');
      }
      setDialogOpen(false);
      resetForm();
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to save testimonial');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/admin/testimonials/${deletingId}`);
      toast.success('Testimonial deleted successfully');
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  const toggleActive = async (id: string) => {
    try {
      await api.patch(`/admin/testimonials/${id}/toggle-active`);
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to toggle testimonial status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      role: '',
      content: '',
      rating: 5,
      isActive: true,
      sortOrder: 0
    });
    setEditingTestimonial(null);
  };

  const openEditDialog = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      name: testimonial.name,
      role: testimonial.role,
      content: testimonial.content,
      rating: testimonial.rating,
      isActive: testimonial.isActive,
      sortOrder: testimonial.sortOrder
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  if (loading) return <div>Loading testimonials...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Testimonials</CardTitle>
            <CardDescription>Manage community testimonials displayed on the homepage</CardDescription>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Testimonial
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Content Preview</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {testimonials.map((testimonial) => (
              <TableRow key={testimonial.id}>
                <TableCell className="font-medium">{testimonial.name}</TableCell>
                <TableCell>{testimonial.role}</TableCell>
                <TableCell className="max-w-xs truncate">{testimonial.content}</TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {'⭐'.repeat(testimonial.rating)}
                  </div>
                </TableCell>
                <TableCell>{testimonial.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={testimonial.isActive}
                      onCheckedChange={() => toggleActive(testimonial.id)}
                    />
                    {testimonial.isActive ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(testimonial)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(testimonial.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
              <DialogDescription>
                {editingTestimonial ? 'Update the testimonial details below' : 'Create a new testimonial'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role/Position</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="content">Testimonial Content</Label>
                <Textarea
                  id="content"
                  rows={4}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="rating">Rating (1-5)</Label>
                  <Select
                    value={formData.rating.toString()}
                    onValueChange={(value) => setFormData({ ...formData, rating: parseInt(value) })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">⭐ 1 Star</SelectItem>
                      <SelectItem value="2">⭐⭐ 2 Stars</SelectItem>
                      <SelectItem value="3">⭐⭐⭐ 3 Stars</SelectItem>
                      <SelectItem value="4">⭐⭐⭐⭐ 4 Stars</SelectItem>
                      <SelectItem value="5">⭐⭐⭐⭐⭐ 5 Stars</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-2 mt-8">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingTestimonial ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Testimonial?
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the testimonial.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeletingId(null); }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}

// ===== SERVICE FEATURES TAB =====
export function ServiceFeaturesTab() {
  const [serviceFeatures, setServiceFeatures] = useState<ServiceFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingServiceFeature, setEditingServiceFeature] = useState<ServiceFeature | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    description: '',
    isActive: true,
    sortOrder: 0
  });

  useEffect(() => {
    fetchServiceFeatures();
  }, []);

  const fetchServiceFeatures = async () => {
    try {
      const response = await api.get('/admin/service-features');
      setServiceFeatures(response.data.serviceFeatures);
    } catch (error) {
      toast.error('Failed to load service features');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingServiceFeature) {
        await api.put(`/admin/service-features/${editingServiceFeature.id}`, formData);
        toast.success('Service feature updated successfully');
      } else {
        await api.post('/admin/service-features', formData);
        toast.success('Service feature created successfully');
      }
      setDialogOpen(false);
      resetForm();
      fetchServiceFeatures();
    } catch (error) {
      toast.error('Failed to save service feature');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/admin/service-features/${deletingId}`);
      toast.success('Service feature deleted successfully');
      setDeleteDialogOpen(false);
      setDeletingId(null);
      fetchServiceFeatures();
    } catch (error) {
      toast.error('Failed to delete service feature');
    }
  };

  const toggleActive = async (id: string) => {
    try {
      await api.patch(`/admin/service-features/${id}/toggle-active`);
      fetchServiceFeatures();
    } catch (error) {
      toast.error('Failed to toggle service feature status');
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      isActive: true,
      sortOrder: 0
    });
    setEditingServiceFeature(null);
  };

  const openEditDialog = (serviceFeature: ServiceFeature) => {
    setEditingServiceFeature(serviceFeature);
    setFormData({
      description: serviceFeature.description,
      isActive: serviceFeature.isActive,
      sortOrder: serviceFeature.sortOrder
    });
    setDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  };

  if (loading) return <div>Loading service features...</div>;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Service Features</CardTitle>
            <CardDescription>Manage detailed service descriptions displayed on the services page</CardDescription>
          </div>
          <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Add Service Feature
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Description</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {serviceFeatures.map((serviceFeature) => (
              <TableRow key={serviceFeature.id}>
                <TableCell className="font-medium max-w-md">{serviceFeature.description}</TableCell>
                <TableCell>{serviceFeature.sortOrder}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={serviceFeature.isActive}
                      onCheckedChange={() => toggleActive(serviceFeature.id)}
                    />
                    {serviceFeature.isActive ? (
                      <Eye className="h-4 w-4 text-green-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(serviceFeature)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => openDeleteDialog(serviceFeature.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Create/Edit Dialog */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingServiceFeature ? 'Edit Service Feature' : 'Add Service Feature'}</DialogTitle>
              <DialogDescription>
                {editingServiceFeature ? 'Update the service feature description below' : 'Create a new service feature'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="description">Service Feature Description</Label>
                <Textarea
                  id="description"
                  rows={3}
                  placeholder="Describe the service feature..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="sortOrder">Sort Order</Label>
                  <Input
                    id="sortOrder"
                    type="number"
                    value={formData.sortOrder}
                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center gap-2 mt-8">
                  <Switch
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label>Active</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSubmit}>
                {editingServiceFeature ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                Delete Service Feature?
              </DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the service feature.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDeleteDialogOpen(false); setDeletingId(null); }}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
