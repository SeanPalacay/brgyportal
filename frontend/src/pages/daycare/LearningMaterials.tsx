import { useState, useEffect } from 'react';
import { api, BACKEND_BASE_URL } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface LearningMaterial {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  fileType: string;
  category: string;
  uploadedBy: string;
  uploadedAt: string;
  isPublic: boolean;
}

export default function LearningMaterials() {
  const [materials, setMaterials] = useState<LearningMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    isPublic: 'true'
  });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await api.get('/daycare/learning-materials');
      setMaterials(response.data.materials || []);
    } catch {
      toast.error('Failed to fetch learning materials');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4',
        'video/mpeg'
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error('File type not supported. Please upload PDF, Word, PowerPoint, Image, or Video files.');
        return;
      }

      setSelectedFile(file);
      toast.success(`File "${file.name}" selected`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    if (!formData.title || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('file', selectedFile);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('isPublic', formData.isPublic);

      toast.info('Uploading file...');

      await api.post('/daycare/learning-materials', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Learning material uploaded successfully!');
      setShowDialog(false);
      setFormData({
        title: '',
        description: '',
        category: '',
        isPublic: 'true'
      });
      setSelectedFile(null);
      fetchMaterials();
    } catch (error: unknown) {
      toast.error(error instanceof Error && error.message ? error.message : 'Failed to upload material');
    }
  };

  const handleView = (fileUrl: string) => {
    // If fileUrl is already a complete URL (from Supabase), use it directly
    // Otherwise, prepend the backend base URL (for legacy local files)
    const fullUrl = fileUrl.startsWith('http') ? fileUrl : `${BACKEND_BASE_URL}${fileUrl}`;
    window.open(fullUrl, '_blank');
  };

  const handleDownload = async (materialId: string, fileName: string) => {
    try {
      toast.info('Preparing download...');
      const response = await api.get(`/daycare/learning-materials/${materialId}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Download started!');
    } catch {
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (materialId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      toast.info('Deleting material...');
      await api.delete(`/daycare/learning-materials/${materialId}`);
      toast.success('Learning material deleted successfully!');
      fetchMaterials();
    } catch {
      toast.error('Failed to delete learning material');
    }
  };

  const getCategoryBadge = (category: string) => {
    const categoryColors: Record<string, 'default' | 'secondary' | 'outline'> = {
      'LESSON_PLANS': 'default',
      'WORKSHEETS': 'secondary',
      'ACTIVITIES': 'outline',
      'STORIES': 'default',
      'SONGS': 'secondary',
      'VIDEOS': 'outline',
      'OTHER': 'outline'
    };

    return (
      <Badge variant={categoryColors[category] || 'outline'}>
        {category.replace(/_/g, ' ')}
      </Badge>
    );
  };

  const getFileTypeBadge = (fileType: string) => {
    if (fileType.includes('pdf')) return <Badge variant="destructive">PDF</Badge>;
    if (fileType.includes('word') || fileType.includes('document')) return <Badge variant="default">Word</Badge>;
    if (fileType.includes('powerpoint') || fileType.includes('presentation')) return <Badge variant="secondary">PPT</Badge>;
    if (fileType.includes('image')) return <Badge variant="outline">Image</Badge>;
    if (fileType.includes('video')) return <Badge variant="default">Video</Badge>;
    return <Badge variant="outline">File</Badge>;
  };

  const filteredMaterials = filterCategory === 'all'
    ? materials
    : materials.filter(m => m.category === filterCategory);

  return (
    <DashboardLayout currentPage="/daycare/materials">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Learning Materials</h1>
            <p className="text-gray-600 mt-1">Upload and manage educational resources</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            Upload Material
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{materials.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Public Materials</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-green-600">
                {materials.filter(m => m.isPublic).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {materials.filter(m => {
                  const uploaded = new Date(m.uploadedAt);
                  const now = new Date();
                  return uploaded.getMonth() === now.getMonth() && uploaded.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Learning Materials Library</CardTitle>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-600">Filter by category:</span>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    <SelectItem value="LESSON_PLANS">Lesson Plans</SelectItem>
                    <SelectItem value="WORKSHEETS">Worksheets</SelectItem>
                    <SelectItem value="ACTIVITIES">Activities</SelectItem>
                    <SelectItem value="STORIES">Stories</SelectItem>
                    <SelectItem value="SONGS">Songs</SelectItem>
                    <SelectItem value="VIDEOS">Videos</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading materials...</p>
            ) : filteredMaterials.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No learning materials yet.</p>
                <p className="text-sm text-gray-500 mt-2">Click "Upload Material" to add educational resources.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Visibility</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaterials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.title}</TableCell>
                        <TableCell>{getCategoryBadge(material.category)}</TableCell>
                        <TableCell>{getFileTypeBadge(material.fileType)}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {material.description || '-'}
                        </TableCell>
                        <TableCell>{material.uploadedBy}</TableCell>
                        <TableCell>
                          {new Date(material.uploadedAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {material.isPublic ? (
                            <Badge variant="default">Public</Badge>
                          ) : (
                            <Badge variant="secondary">Private</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {(material.fileType.includes('image') || material.fileType.includes('pdf')) && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleView(material.fileUrl)}
                            >
                              View
                            </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(material.id, material.fileUrl.split('/').pop() || material.title)}
                            >
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(material.id, material.title)}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Upload Learning Material</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Enter material title"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium">Category *</label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LESSON_PLANS">Lesson Plans</SelectItem>
                    <SelectItem value="WORKSHEETS">Worksheets</SelectItem>
                    <SelectItem value="ACTIVITIES">Activities</SelectItem>
                    <SelectItem value="STORIES">Stories</SelectItem>
                    <SelectItem value="SONGS">Songs</SelectItem>
                    <SelectItem value="VIDEOS">Videos</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="Brief description of the material"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Visibility *</label>
                <Select
                  value={formData.isPublic}
                  onValueChange={(value) => setFormData({...formData, isPublic: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Public (Visible to parents)</SelectItem>
                    <SelectItem value="false">Private (Staff only)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium block mb-2">Upload File *</label>
                <Input
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.mp4,.mpeg"
                  required
                />
                {selectedFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Accepted formats: PDF, Word, PowerPoint, Images (JPG, PNG, GIF), Videos (MP4, MPEG)
                  <br />
                  Maximum file size: 10MB
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-md">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Files marked as "Public" will be visible to parents in the public portal.
                  Private files are only accessible to daycare staff.
                </p>
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Upload Material</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
