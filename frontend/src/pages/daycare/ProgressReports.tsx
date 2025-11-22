import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Pencil, Trash2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Student {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
}

interface ProgressReport {
  id: string;
  studentId: string;
  student?: Student;
  reportingPeriod: string;
  academicPerformance?: string;
  socialBehavior?: string;
  physicalDevelopment?: string;
  emotionalDevelopment?: string;
  recommendations?: string;
  generatedBy: string;
  generatedAt: string;
}

export default function ProgressReports() {
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [filterStudent, setFilterStudent] = useState('all');
  const [editingReport, setEditingReport] = useState<ProgressReport | null>(null);
  const [deleteReportId, setDeleteReportId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    reportingPeriod: '',
    academicPerformance: '',
    socialBehavior: '',
    physicalDevelopment: '',
    emotionalDevelopment: '',
    recommendations: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchStudents();
    fetchReports();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/daycare/students');
      setStudents(response.data.students || []);
    } catch (error) {
      toast.error('Failed to fetch students');
    }
  };

  const fetchReports = async () => {
    try {
      const response = await api.get('/daycare/progress-reports');
      setReports(response.data.reports || []);
    } catch (error) {
      toast.error('Failed to fetch progress reports');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedStudent) {
      toast.error('Please select a student');
      return;
    }

    if (!formData.reportingPeriod) {
      toast.error('Please enter the reporting period');
      return;
    }

    try {
      await api.post('/daycare/progress-reports', {
        studentId: selectedStudent,
        reportingPeriod: formData.reportingPeriod,
        academicPerformance: formData.academicPerformance || null,
        socialBehavior: formData.socialBehavior || null,
        physicalDevelopment: formData.physicalDevelopment || null,
        emotionalDevelopment: formData.emotionalDevelopment || null,
        recommendations: formData.recommendations || null
      });

      toast.success('Progress report created successfully!');
      setShowDialog(false);
      setFormData({
        reportingPeriod: '',
        academicPerformance: '',
        socialBehavior: '',
        physicalDevelopment: '',
        emotionalDevelopment: '',
        recommendations: ''
      });
      setSelectedStudent('');
      fetchReports();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create progress report');
    }
  };

  const handleDownload = async (reportId: string, studentName: string, reportPeriod: string) => {
    setDownloading(reportId);
    toast.loading('Generating PDF...', { id: 'download-toast' });

    try {
      const response = await api.get(`/daycare/progress-reports/${reportId}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `progress-report-${studentName}-${reportPeriod.replace(/\s+/g, '-')}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Progress report downloaded successfully!', { id: 'download-toast' });
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download progress report', { id: 'download-toast' });
    } finally {
      setDownloading(null);
    }
  };

  const handleEdit = (report: ProgressReport) => {
    setEditingReport(report);
    setFormData({
      reportingPeriod: report.reportingPeriod,
      academicPerformance: report.academicPerformance || '',
      socialBehavior: report.socialBehavior || '',
      physicalDevelopment: report.physicalDevelopment || '',
      emotionalDevelopment: report.emotionalDevelopment || '',
      recommendations: report.recommendations || ''
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingReport) return;

    if (!formData.reportingPeriod) {
      toast.error('Please enter the reporting period');
      return;
    }

    try {
      await api.put(`/daycare/progress-reports/${editingReport.id}`, {
        reportingPeriod: formData.reportingPeriod,
        academicPerformance: formData.academicPerformance || null,
        socialBehavior: formData.socialBehavior || null,
        physicalDevelopment: formData.physicalDevelopment || null,
        emotionalDevelopment: formData.emotionalDevelopment || null,
        recommendations: formData.recommendations || null
      });

      toast.success('Progress report updated successfully!');
      setShowEditDialog(false);
      setEditingReport(null);
      setFormData({
        reportingPeriod: '',
        academicPerformance: '',
        socialBehavior: '',
        physicalDevelopment: '',
        emotionalDevelopment: '',
        recommendations: ''
      });
      fetchReports();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update progress report');
    }
  };

  const handleDelete = async () => {
    if (!deleteReportId) return;

    try {
      await api.delete(`/daycare/progress-reports/${deleteReportId}`);
      toast.success('Progress report deleted successfully!');
      setDeleteReportId(null);
      fetchReports();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete progress report');
    }
  };

  const filteredReports = filterStudent && filterStudent !== 'all'
    ? reports.filter(r => r.studentId === filterStudent)
    : reports;

  return (
    <DashboardLayout currentPage="/daycare/progress-reports">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Progress Reports</h1>
            <p className="text-muted-foreground">Student development tracking and assessments</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            Create Report
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{reports.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">This Quarter</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {reports.filter(r => {
                  const reportDate = new Date(r.generatedAt);
                  const now = new Date();
                  const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
                  return reportDate >= quarterStart;
                }).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Students Evaluated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {new Set(reports.map(r => r.studentId)).size}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Progress Reports</CardTitle>
              <div className="flex gap-2 items-center">
                <span className="text-sm text-gray-600">Filter by student:</span>
                <Select value={filterStudent} onValueChange={setFilterStudent}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="All students" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All students</SelectItem>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.firstName} {student.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading reports...</p>
            ) : filteredReports.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No progress reports yet.</p>
                <p className="text-sm text-gray-500 mt-2">Click "Create Report" to generate the first progress report.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <Card key={report.id} className="border">
                    <CardContent className="pt-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="font-semibold text-lg">
                            {report.student?.firstName} {report.student?.lastName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            Period: {report.reportingPeriod} | Date: {new Date(report.generatedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {report.academicPerformance && (
                        <div className="mb-3">
                          <p className="text-sm font-medium">Academic Performance:</p>
                          <p className="text-sm text-gray-700">{report.academicPerformance}</p>
                        </div>
                      )}

                      {report.socialBehavior && (
                        <div className="mb-3">
                          <p className="text-sm font-medium">Social Behavior:</p>
                          <p className="text-sm text-gray-700">{report.socialBehavior}</p>
                        </div>
                      )}

                      {report.physicalDevelopment && (
                        <div className="mb-3">
                          <p className="text-sm font-medium">Physical Development:</p>
                          <p className="text-sm text-gray-700">{report.physicalDevelopment}</p>
                        </div>
                      )}

                      {report.emotionalDevelopment && (
                        <div className="mb-3">
                          <p className="text-sm font-medium">Emotional Development:</p>
                          <p className="text-sm text-gray-700">{report.emotionalDevelopment}</p>
                        </div>
                      )}

                      {report.recommendations && (
                        <div className="mb-3">
                          <p className="text-sm font-medium">Recommendations:</p>
                          <p className="text-sm text-gray-700">{report.recommendations}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500">Generated by: {report.generatedBy}</p>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(report)}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleDownload(
                                report.id,
                                `${report.student?.firstName}-${report.student?.lastName}`,
                                report.reportingPeriod
                              )
                            }
                            disabled={downloading === report.id}
                          >
                            {downloading === report.id ? 'Downloading...' : 'Download PDF'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => setDeleteReportId(report.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Progress Report</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Select Student *</label>
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a student..." />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.firstName} {student.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Reporting Period *</label>
                  <Input
                    value={formData.reportingPeriod}
                    onChange={(e) => setFormData({...formData, reportingPeriod: e.target.value})}
                    placeholder="e.g., Q1 2025, January-March 2025"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Academic Performance</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.academicPerformance}
                  onChange={(e) => setFormData({...formData, academicPerformance: e.target.value})}
                  placeholder="Describe the student's academic progress, learning achievements, and areas of strength..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Social Behavior</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.socialBehavior}
                  onChange={(e) => setFormData({...formData, socialBehavior: e.target.value})}
                  placeholder="How the student interacts with peers and teachers, cooperation, sharing..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Physical Development</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.physicalDevelopment}
                  onChange={(e) => setFormData({...formData, physicalDevelopment: e.target.value})}
                  placeholder="Motor skills, coordination, physical activities participation..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Emotional Development</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.emotionalDevelopment}
                  onChange={(e) => setFormData({...formData, emotionalDevelopment: e.target.value})}
                  placeholder="Self-regulation, emotional expression, confidence, resilience..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Recommendations</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.recommendations}
                  onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                  placeholder="Recommendations for parents and areas to focus on at home..."
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Create Report</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Progress Report</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Student</label>
                  <Input
                    value={`${editingReport?.student?.firstName || ''} ${editingReport?.student?.lastName || ''}`}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Reporting Period *</label>
                  <Input
                    value={formData.reportingPeriod}
                    onChange={(e) => setFormData({...formData, reportingPeriod: e.target.value})}
                    placeholder="e.g., Q1 2025, January-March 2025"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Academic Performance</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.academicPerformance}
                  onChange={(e) => setFormData({...formData, academicPerformance: e.target.value})}
                  placeholder="Describe the student's academic progress, learning achievements, and areas of strength..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Social Behavior</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.socialBehavior}
                  onChange={(e) => setFormData({...formData, socialBehavior: e.target.value})}
                  placeholder="How the student interacts with peers and teachers, cooperation, sharing..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Physical Development</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.physicalDevelopment}
                  onChange={(e) => setFormData({...formData, physicalDevelopment: e.target.value})}
                  placeholder="Motor skills, coordination, physical activities participation..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Emotional Development</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.emotionalDevelopment}
                  onChange={(e) => setFormData({...formData, emotionalDevelopment: e.target.value})}
                  placeholder="Self-regulation, emotional expression, confidence, resilience..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Recommendations</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.recommendations}
                  onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                  placeholder="Recommendations for parents and areas to focus on at home..."
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => {
                  setShowEditDialog(false);
                  setEditingReport(null);
                }}>
                  Cancel
                </Button>
                <Button type="submit">Update Report</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <AlertDialog open={!!deleteReportId} onOpenChange={() => setDeleteReportId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this progress report. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
