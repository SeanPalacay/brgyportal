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
  reportPeriod: string;
  reportDate: string;
  cognitiveSkills?: number;
  motorSkills?: number;
  socialSkills?: number;
  languageSkills?: number;
  emotionalDevelopment?: number;
  behaviorNotes?: string;
  achievements?: string;
  areasForImprovement?: string;
  teacherComments?: string;
  createdBy: string;
}

export default function ProgressReports() {
  const [reports, setReports] = useState<ProgressReport[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [filterStudent, setFilterStudent] = useState('all');
  const [formData, setFormData] = useState({
    reportPeriod: '',
    cognitiveSkills: '',
    motorSkills: '',
    socialSkills: '',
    languageSkills: '',
    emotionalDevelopment: '',
    behaviorNotes: '',
    achievements: '',
    areasForImprovement: '',
    teacherComments: ''
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

    if (!formData.reportPeriod) {
      toast.error('Please enter the report period');
      return;
    }

    try {
      await api.post('/daycare/progress-reports', {
        studentId: selectedStudent,
        reportPeriod: formData.reportPeriod,
        cognitiveSkills: formData.cognitiveSkills ? parseInt(formData.cognitiveSkills) : null,
        motorSkills: formData.motorSkills ? parseInt(formData.motorSkills) : null,
        socialSkills: formData.socialSkills ? parseInt(formData.socialSkills) : null,
        languageSkills: formData.languageSkills ? parseInt(formData.languageSkills) : null,
        emotionalDevelopment: formData.emotionalDevelopment ? parseInt(formData.emotionalDevelopment) : null,
        behaviorNotes: formData.behaviorNotes,
        achievements: formData.achievements,
        areasForImprovement: formData.areasForImprovement,
        teacherComments: formData.teacherComments,
        createdBy: `${user.firstName} ${user.lastName}`
      });

      toast.success('Progress report created successfully!');
      setShowDialog(false);
      setFormData({
        reportPeriod: '',
        cognitiveSkills: '',
        motorSkills: '',
        socialSkills: '',
        languageSkills: '',
        emotionalDevelopment: '',
        behaviorNotes: '',
        achievements: '',
        areasForImprovement: '',
        teacherComments: ''
      });
      setSelectedStudent('');
      fetchReports();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create progress report');
    }
  };

  const getSkillBadge = (score?: number) => {
    if (!score) return <Badge variant="outline">Not Rated</Badge>;

    if (score >= 4) return <Badge variant="default">Excellent</Badge>;
    if (score >= 3) return <Badge variant="secondary">Good</Badge>;
    if (score >= 2) return <Badge variant="outline">Developing</Badge>;
    return <Badge variant="destructive">Needs Support</Badge>;
  };

  const calculateAverageScore = (report: ProgressReport) => {
    const scores = Object.values({
      cognitive: report.cognitiveSkills,
      motor: report.motorSkills,
      social: report.socialSkills,
      language: report.languageSkills,
      emotional: report.emotionalDevelopment
    }).filter(s => s !== null && s !== undefined) as number[];

    if (scores.length === 0) return null;
    return (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
  };

  const handleDownload = async (reportId: string, studentName: string, reportPeriod: string) => {
    try {
      const response = await api.get(`/daycare/progress-reports/${reportId}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `progress-report-${studentName}-${reportPeriod}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success('Progress report downloaded successfully!');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download progress report');
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
                  const reportDate = new Date(r.reportDate);
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
                            Period: {report.reportPeriod} | Date: {new Date(report.reportDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Average Score</p>
                          <p className="text-2xl font-bold">
                            {calculateAverageScore(report) || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-5 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Cognitive</p>
                          {getSkillBadge(report.cognitiveSkills)}
                          <p className="text-sm font-medium mt-1">{report.cognitiveSkills || '-'}/5</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Motor Skills</p>
                          {getSkillBadge(report.motorSkills)}
                          <p className="text-sm font-medium mt-1">{report.motorSkills || '-'}/5</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Social</p>
                          {getSkillBadge(report.socialSkills)}
                          <p className="text-sm font-medium mt-1">{report.socialSkills || '-'}/5</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Language</p>
                          {getSkillBadge(report.languageSkills)}
                          <p className="text-sm font-medium mt-1">{report.languageSkills || '-'}/5</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 mb-1">Emotional</p>
                          {getSkillBadge(report.emotionalDevelopment)}
                          <p className="text-sm font-medium mt-1">{report.emotionalDevelopment || '-'}/5</p>
                        </div>
                      </div>

                      {report.achievements && (
                        <div className="mb-2">
                          <p className="text-sm font-medium">Achievements:</p>
                          <p className="text-sm text-gray-700">{report.achievements}</p>
                        </div>
                      )}

                      {report.areasForImprovement && (
                        <div className="mb-2">
                          <p className="text-sm font-medium">Areas for Improvement:</p>
                          <p className="text-sm text-gray-700">{report.areasForImprovement}</p>
                        </div>
                      )}

                      {report.teacherComments && (
                        <div className="mb-2">
                          <p className="text-sm font-medium">Teacher Comments:</p>
                          <p className="text-sm text-gray-700">{report.teacherComments}</p>
                        </div>
                      )}

                      <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500">Created by: {report.createdBy}</p>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            handleDownload(
                              report.id,
                              `${report.student?.firstName}-${report.student?.lastName}`,
                              report.reportPeriod
                            )
                          }
                        >
                          Download PDF
                        </Button>
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
                  <label className="text-sm font-medium">Report Period *</label>
                  <Input
                    value={formData.reportPeriod}
                    onChange={(e) => setFormData({...formData, reportPeriod: e.target.value})}
                    placeholder="e.g., Q1 2025, Jan-Mar 2025"
                    required
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-medium mb-3">Development Assessment (Rate 1-5)</h3>
                <p className="text-xs text-gray-500 mb-3">1 = Needs Support, 2 = Developing, 3 = Good, 4 = Excellent, 5 = Outstanding</p>
                <div className="grid grid-cols-5 gap-4">
                  <div>
                    <label className="text-sm">Cognitive Skills</label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.cognitiveSkills}
                      onChange={(e) => setFormData({...formData, cognitiveSkills: e.target.value})}
                      placeholder="1-5"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Motor Skills</label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.motorSkills}
                      onChange={(e) => setFormData({...formData, motorSkills: e.target.value})}
                      placeholder="1-5"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Social Skills</label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.socialSkills}
                      onChange={(e) => setFormData({...formData, socialSkills: e.target.value})}
                      placeholder="1-5"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Language Skills</label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.languageSkills}
                      onChange={(e) => setFormData({...formData, languageSkills: e.target.value})}
                      placeholder="1-5"
                    />
                  </div>
                  <div>
                    <label className="text-sm">Emotional Dev.</label>
                    <Input
                      type="number"
                      min="1"
                      max="5"
                      value={formData.emotionalDevelopment}
                      onChange={(e) => setFormData({...formData, emotionalDevelopment: e.target.value})}
                      placeholder="1-5"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Behavior Notes</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={2}
                  value={formData.behaviorNotes}
                  onChange={(e) => setFormData({...formData, behaviorNotes: e.target.value})}
                  placeholder="Observations about the child's behavior"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Achievements</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={2}
                  value={formData.achievements}
                  onChange={(e) => setFormData({...formData, achievements: e.target.value})}
                  placeholder="Notable achievements during this period"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Areas for Improvement</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={2}
                  value={formData.areasForImprovement}
                  onChange={(e) => setFormData({...formData, areasForImprovement: e.target.value})}
                  placeholder="Skills or behaviors to work on"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Teacher Comments</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.teacherComments}
                  onChange={(e) => setFormData({...formData, teacherComments: e.target.value})}
                  placeholder="Additional comments or recommendations for parents"
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
      </div>
    </DashboardLayout>
  );
}
