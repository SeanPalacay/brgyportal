import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { FileText, Download, Award, TrendingUp, Calendar, Edit, Trash2 } from 'lucide-react';
import { Patient } from '@/types';

interface Certificate {
  id: string;
  certificateType: string;
  issuedDate: string;
  expiryDate?: string;
  certificateNumber: string;
  patientId?: string;
  patient?: Patient;
  purpose?: string;
  findings?: string;
  recommendations?: string;
  issuedBy: string;
}

export default function CertificateGenerator() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | null>(null);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [formData, setFormData] = useState({
    certificateType: '',
    purpose: '',
    findings: '',
    recommendations: '',
    expiryDate: '',
    certificateNumber: ''
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchPatients();
    fetchCertificates();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/health/patients');
      setPatients(response.data.patients || []);
    } catch (error) {
      toast.error('Failed to fetch patients');
    }
  };

  const fetchCertificates = async () => {
    try {
      const response = await api.get('/health/certificates');
      setCertificates(response.data.certificates || []);
    } catch (error) {
      toast.error('Failed to fetch certificates');
    } finally {
      setLoading(false);
    }
  };

  const generateCertificateNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `HEALTH-${year}${month}-${random}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }

    if (!formData.certificateType) {
      toast.error('Please select certificate type');
      return;
    }

    try {
      const certificateNumber = generateCertificateNumber();

      await api.post('/health/certificates', {
        patientId: selectedPatient,
        certificateType: formData.certificateType,
        certificateNumber,
        purpose: formData.purpose,
        findings: formData.findings,
        recommendations: formData.recommendations,
        expiryDate: formData.expiryDate || null,
        issuedBy: `${user.firstName} ${user.lastName}`
      });

      toast.success('Certificate generated successfully!');
      setShowDialog(false);
      setFormData({
        certificateType: '',
        purpose: '',
        findings: '',
        recommendations: '',
        expiryDate: '',
        certificateNumber: ''
      });
      setSelectedPatient('');
      fetchCertificates();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to generate certificate');
    }
  };

  const handleDownload = async (certificateId: string) => {
    try {
      toast.info('Generating PDF...');
      const response = await api.get(`/health/certificates/${certificateId}/download`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `health-certificate-${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Certificate downloaded successfully!');
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  const handleEdit = (certificate: Certificate) => {
    setEditingCertificate(certificate);
    setFormData({
      certificateType: certificate.certificateType,
      purpose: certificate.purpose || '',
      findings: certificate.findings || '',
      recommendations: certificate.recommendations || '',
      expiryDate: certificate.expiryDate ? new Date(certificate.expiryDate).toISOString().split('T')[0] : '',
      certificateNumber: certificate.certificateNumber
    });
    setShowEditDialog(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingCertificate) return;

    try {
      await api.put(`/health/certificates/${editingCertificate.id}`, {
        certificateType: formData.certificateType,
        certificateNumber: formData.certificateNumber,
        purpose: formData.purpose,
        findings: formData.findings,
        recommendations: formData.recommendations,
        expiryDate: formData.expiryDate || null,
        issuedBy: user.id
      });

      toast.success('Certificate updated successfully!');
      setShowEditDialog(false);
      setEditingCertificate(null);
      setFormData({
        certificateType: '',
        purpose: '',
        findings: '',
        recommendations: '',
        expiryDate: '',
        certificateNumber: ''
      });
      fetchCertificates();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update certificate');
    }
  };

  const handleDelete = async (certificateId: string) => {
    if (!confirm('Are you sure you want to delete this certificate? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/health/certificates/${certificateId}`);
      toast.success('Certificate deleted successfully!');
      fetchCertificates();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete certificate');
    }
  };

  const getCertificateTypeBadge = (type: string) => {
    const typeColors: Record<string, 'default' | 'secondary' | 'outline'> = {
      'MEDICAL_CLEARANCE': 'default',
      'FIT_TO_WORK': 'secondary',
      'HEALTH_PARTICIPATION': 'outline',
      'IMMUNIZATION': 'default'
    };

    return <Badge variant={typeColors[type] || 'outline'}>{type.replace(/_/g, ' ')}</Badge>;
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <DashboardLayout currentPage="/health/certificates">
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold">
              Certificate Generator
            </h1>
            <p className="text-muted-foreground mt-1">
              Generate health certificates for patients
            </p>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <FileText className="h-5 w-5" />
                Generate Certificate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Generate Health Certificate</DialogTitle>
                <DialogDescription>
                  Fill in the patient's information to create a new certificate
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="patient">Select Patient *</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a patient..." />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certificateType">Certificate Type *</Label>
                  <Select
                    value={formData.certificateType}
                    onValueChange={(value) => setFormData({...formData, certificateType: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select certificate type..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MEDICAL_CLEARANCE">Medical Clearance</SelectItem>
                      <SelectItem value="FIT_TO_WORK">Fit to Work</SelectItem>
                      <SelectItem value="HEALTH_PARTICIPATION">Health Program Participation</SelectItem>
                      <SelectItem value="IMMUNIZATION">Immunization Record</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Purpose</Label>
                  <Input
                    id="purpose"
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                    placeholder="e.g., Employment, School enrollment, Travel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="findings">Medical Findings</Label>
                  <textarea
                    id="findings"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    value={formData.findings}
                    onChange={(e) => setFormData({...formData, findings: e.target.value})}
                    placeholder="Enter medical examination findings"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recommendations">Recommendations</Label>
                  <textarea
                    id="recommendations"
                    className="w-full p-2 border rounded-md"
                    rows={3}
                    value={formData.recommendations}
                    onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                    placeholder="Enter health recommendations or restrictions"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                    placeholder="Leave blank for no expiry"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank if certificate has no expiration
                  </p>
                </div>

                <div className="bg-muted p-4 rounded-md">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Certificate will be issued by {user.firstName} {user.lastName}.
                    A unique certificate number will be generated automatically.
                  </p>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Generate Certificate</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Certificates</CardTitle>
              <FileText className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{certificates.length}</div>
              <p className="text-xs text-muted-foreground mt-1">All generated certificates</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">This Month</CardTitle>
              <Calendar className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {certificates.filter(c => {
                  const issued = new Date(c.issuedDate);
                  const now = new Date();
                  return issued.getMonth() === now.getMonth() && issued.getFullYear() === now.getFullYear();
                }).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Issued this month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Certificates</CardTitle>
              <Award className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {certificates.filter(c => !isExpired(c.expiryDate)).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Valid certificates</p>
            </CardContent>
          </Card>
        </div>

        {/* Certificates Table */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Certificates</CardTitle>
            <CardDescription>View and download all issued certificates</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : certificates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No certificates generated yet.</p>
                <p className="text-sm text-muted-foreground mt-2">Click "Generate Certificate" to create the first certificate.</p>
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate No.</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Issued Date</TableHead>
                      <TableHead>Expiry Date</TableHead>
                      <TableHead>Issued By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((certificate) => (
                      <TableRow key={certificate.id}>
                        <TableCell className="font-medium">
                          {certificate.certificateNumber}
                        </TableCell>
                        <TableCell>
                          {certificate.patient?.firstName} {certificate.patient?.lastName}
                        </TableCell>
                        <TableCell>
                          {getCertificateTypeBadge(certificate.certificateType)}
                        </TableCell>
                        <TableCell>{certificate.purpose || '-'}</TableCell>
                        <TableCell>
                          {new Date(certificate.issuedDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {certificate.expiryDate
                            ? new Date(certificate.expiryDate).toLocaleDateString()
                            : 'No expiry'}
                        </TableCell>
                        <TableCell>{certificate.issuedBy}</TableCell>
                        <TableCell>
                          {isExpired(certificate.expiryDate) ? (
                            <Badge variant="destructive">Expired</Badge>
                          ) : (
                            <Badge variant="default">Valid</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => handleDownload(certificate.id)}
                            >
                              <Download className="h-3 w-3" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="gap-1"
                              onClick={() => handleEdit(certificate)}
                            >
                              <Edit className="h-3 w-3" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="gap-1"
                              onClick={() => handleDelete(certificate.id)}
                            >
                              <Trash2 className="h-3 w-3" />
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

        {/* Edit Certificate Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Certificate</DialogTitle>
              <DialogDescription>
                Update the certificate information below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-certificateNumber">Certificate Number *</Label>
                <Input
                  id="edit-certificateNumber"
                  value={formData.certificateNumber}
                  onChange={(e) => setFormData({...formData, certificateNumber: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-certificateType">Certificate Type *</Label>
                <Select
                  value={formData.certificateType}
                  onValueChange={(value) => setFormData({...formData, certificateType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select certificate type..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEDICAL_CLEARANCE">Medical Clearance</SelectItem>
                    <SelectItem value="FIT_TO_WORK">Fit to Work</SelectItem>
                    <SelectItem value="HEALTH_PARTICIPATION">Health Program Participation</SelectItem>
                    <SelectItem value="IMMUNIZATION">Immunization Record</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-purpose">Purpose</Label>
                <Input
                  id="edit-purpose"
                  value={formData.purpose}
                  onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                  placeholder="e.g., Employment, School enrollment, Travel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-findings">Medical Findings</Label>
                <textarea
                  id="edit-findings"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.findings}
                  onChange={(e) => setFormData({...formData, findings: e.target.value})}
                  placeholder="Enter medical examination findings"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-recommendations">Recommendations</Label>
                <textarea
                  id="edit-recommendations"
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.recommendations}
                  onChange={(e) => setFormData({...formData, recommendations: e.target.value})}
                  placeholder="Enter health recommendations or restrictions"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-expiryDate">Expiry Date (Optional)</Label>
                <Input
                  id="edit-expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Certificate</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
