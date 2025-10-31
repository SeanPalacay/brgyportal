import { useState, useEffect } from 'react';
import { api, BACKEND_BASE_URL } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Eye, ExternalLink, FileText } from 'lucide-react';

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
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);
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

  const handleView = (material: LearningMaterial) => {
    setSelectedMaterial(material);
    setShowViewModal(true);
  };

  const handleOpenInNewTab = (fileUrl: string) => {
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
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleView(material)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
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

        {/* View Material Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] p-0">
            <DialogHeader className="p-6 pb-2">
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {selectedMaterial?.title}
              </DialogTitle>
              <DialogDescription>
                {selectedMaterial?.description || 'Learning material preview'}
              </DialogDescription>
            </DialogHeader>
            {selectedMaterial && (
              <div className="px-6 pb-6">
                <div className="relative bg-gray-50 rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center">
                  {selectedMaterial.fileType.includes('image') ? (
                    <img
                      src={selectedMaterial.fileUrl.startsWith('http') ? selectedMaterial.fileUrl : `${BACKEND_BASE_URL}${selectedMaterial.fileUrl}`}
                      alt={selectedMaterial.title}
                      className="w-full h-auto max-h-[70vh] object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const container = target.parentElement;
                        if (container) {
                          container.innerHTML = `
                            <div class="flex flex-col items-center justify-center text-gray-500 p-8">
                              <svg class="h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                              </svg>
                              <p class="text-lg font-medium mb-2">Unable to load image</p>
                              <p class="text-sm text-gray-400 mb-4 text-center">The image may be corrupted, moved, or the server may be unavailable.</p>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : selectedMaterial.fileType.includes('pdf') ? (
                    <iframe
                      src={selectedMaterial.fileUrl.startsWith('http') ? selectedMaterial.fileUrl : `${BACKEND_BASE_URL}${selectedMaterial.fileUrl}`}
                      className="w-full h-[70vh] border-0"
                      title={selectedMaterial.title}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 p-8">
                      <FileText className="h-16 w-16 mb-4" />
                      <p className="text-lg font-medium mb-2">{selectedMaterial.title}</p>
                      <p className="text-sm text-gray-400 mb-4 text-center">
                        {selectedMaterial.description || 'This file type cannot be previewed directly.'}
                      </p>
                      <div className="flex gap-2">
                        {getCategoryBadge(selectedMaterial.category)}
                        {getFileTypeBadge(selectedMaterial.fileType)}
                      </div>
                    </div>
                  )}
                </div>
                <div className="space-y-3 mt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Category:</span>
                      <div className="mt-1">{getCategoryBadge(selectedMaterial.category)}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">File Type:</span>
                      <div className="mt-1">{getFileTypeBadge(selectedMaterial.fileType)}</div>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Uploaded By:</span>
                      <p className="mt-1">{selectedMaterial.uploadedBy}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Upload Date:</span>
                      <p className="mt-1">{new Date(selectedMaterial.uploadedAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Visibility:</span>
                      <div className="mt-1">
                        {selectedMaterial.isPublic ? (
                          <Badge variant="default">Public</Badge>
                        ) : (
                          <Badge variant="secondary">Private</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded">
                    <p className="font-medium mb-1">File URL:</p>
                    <p className="font-mono text-xs break-all select-all">
                      {selectedMaterial.fileUrl.startsWith('http') ? selectedMaterial.fileUrl : `${BACKEND_BASE_URL}${selectedMaterial.fileUrl}`}
                    </p>
                  </div>
                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const fullUrl = selectedMaterial.fileUrl.startsWith('http') ? selectedMaterial.fileUrl : `${BACKEND_BASE_URL}${selectedMaterial.fileUrl}`;
                        navigator.clipboard.writeText(fullUrl);
                        toast.success('URL copied to clipboard');
                      }}
                    >
                      Copy URL
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => handleOpenInNewTab(selectedMaterial.fileUrl)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Open in New Tab
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleDownload(selectedMaterial.id, selectedMaterial.fileUrl.split('/').pop() || selectedMaterial.title)}
                      >
                        Download
                      </Button>
                      <Button onClick={() => setShowViewModal(false)}>
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Upload Material Dialog */}
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
