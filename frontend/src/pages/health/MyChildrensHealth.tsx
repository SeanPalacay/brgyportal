import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import {
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Download,
  Syringe,
  Users,
  Shield,
  Info,
  Baby
} from 'lucide-react';

interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  dateOfBirth: string;
  gender: string;
  bloodType?: string;
}

interface ImmunizationRecord {
  id: string;
  patientId: string;
  patient?: Patient;
  vaccineName: string;
  vaccineType: string;
  manufacturer?: string;
  lotNumber?: string;
  dosage?: string;
  dateGiven: string;
  ageAtVaccination?: string;
  siteOfAdministration?: string;
  administeredBy: string;
  doseNumber?: number;
  nextDueDate?: string;
  batchNumber?: string;
  expirationDate?: string;
  adverseReactions?: string;
  notes?: string;
}

export default function MyChildrensHealth() {
  const { user } = useAuth();
  const [children, setChildren] = useState<Patient[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [immunizationRecords, setImmunizationRecords] = useState<ImmunizationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildrenAndRecords();
  }, []);

  const fetchChildrenAndRecords = async () => {
    try {
      // Fetch patients where current user is guardian
      const patientsResponse = await api.get('/health/patients');
      const allPatients = patientsResponse.data.patients || [];

      // Filter patients where current user is the guardian
      const myChildren = allPatients.filter(
        (patient: Patient & { guardianUserId?: string }) =>
          patient.guardianUserId === user?.id
      );

      setChildren(myChildren);

      // Fetch immunization records for all children
      if (myChildren.length > 0) {
        const recordsPromises = myChildren.map((child: Patient) =>
          api.get(`/health/immunization-records?patientId=${child.id}`)
            .then(res => res.data.immunizationRecords || [])
            .catch(() => [])
        );

        const allRecords = await Promise.all(recordsPromises);
        const flatRecords = allRecords.flat().map((record: ImmunizationRecord) => {
          const child = myChildren.find((c: Patient) => c.id === record.patientId);
          return { ...record, patient: child };
        });

        setImmunizationRecords(flatRecords);
      }
    } catch (error) {
      console.error('Error fetching children health records:', error);
      toast.error('Failed to fetch children health records');
    } finally {
      setLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    return age;
  };

  const getRecordStatus = (record: ImmunizationRecord): 'completed' | 'due-soon' | 'overdue' | 'scheduled' => {
    if (!record.nextDueDate) return 'completed';
    const today = new Date();
    const dueDate = new Date(record.nextDueDate);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 30) return 'due-soon';
    return 'scheduled';
  };

  const getStatusBadge = (status: 'completed' | 'due-soon' | 'overdue' | 'scheduled') => {
    const statusConfig = {
      completed: { variant: 'default' as const, label: 'Completed', color: 'text-green-600' },
      'due-soon': { variant: 'secondary' as const, label: 'Due Soon', color: 'text-yellow-600' },
      overdue: { variant: 'destructive' as const, label: 'Overdue', color: 'text-red-600' },
      scheduled: { variant: 'outline' as const, label: 'Scheduled', color: 'text-blue-600' }
    };

    const config = statusConfig[status];
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getStatusIcon = (status: 'completed' | 'due-soon' | 'overdue' | 'scheduled') => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'due-soon':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4 text-blue-600" />;
    }
  };

  const handleDownloadCard = (childId: string) => {
    const child = children.find(c => c.id === childId);
    const childRecords = immunizationRecords.filter(r => r.patientId === childId);

    if (!child) return;

    // Create HTML template for immunization card
    const cardHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Immunization Card - ${child.firstName} ${child.lastName}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 20px;
              background: #f8fafc;
            }
            .card {
              max-width: 900px;
              margin: 0 auto;
              background: white;
              border-radius: 12px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
              overflow: hidden;
            }
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
              color: white;
              padding: 24px;
              text-align: center;
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
            }
            .header p {
              margin: 8px 0 0 0;
              opacity: 0.9;
              font-size: 16px;
            }
            .content {
              padding: 32px;
            }
            .patient-info {
              display: grid;
              grid-template-columns: 1fr 1fr 1fr;
              gap: 24px;
              margin-bottom: 32px;
              padding-bottom: 24px;
              border-bottom: 2px solid #e5e7eb;
            }
            .info-item {
              display: flex;
              flex-direction: column;
              gap: 4px;
            }
            .info-label {
              font-weight: 500;
              color: #6b7280;
              font-size: 14px;
            }
            .info-value {
              font-weight: 600;
              color: #111827;
              font-size: 16px;
            }
            h2 {
              margin: 0 0 16px 0;
              color: #374151;
              font-size: 20px;
              font-weight: 600;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 24px;
            }
            th {
              background: #f3f4f6;
              padding: 12px;
              text-align: left;
              font-weight: 600;
              color: #374151;
              border-bottom: 2px solid #e5e7eb;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              color: #111827;
            }
            .status-completed {
              background: #dcfce7;
              color: #166534;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
            }
            .status-scheduled {
              background: #fef3c7;
              color: #92400e;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
            }
            .status-overdue {
              background: #fee2e2;
              color: #991b1b;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 600;
            }
            .footer {
              background: #f9fafb;
              padding: 24px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            .footer p {
              margin: 0;
              color: #6b7280;
              font-size: 14px;
            }
            @media print {
              body { background: white; }
              .card { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>🏥 Child Immunization Card</h1>
              <p>Barangay Health Services - Parent Copy</p>
            </div>

            <div class="content">
              <div class="patient-info">
                <div class="info-item">
                  <span class="info-label">Child's Name</span>
                  <span class="info-value">${child.firstName} ${child.middleName || ''} ${child.lastName}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Date of Birth</span>
                  <span class="info-value">${new Date(child.dateOfBirth).toLocaleDateString()}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Age</span>
                  <span class="info-value">${calculateAge(child.dateOfBirth)} years old</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Gender</span>
                  <span class="info-value">${child.gender}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Blood Type</span>
                  <span class="info-value">${child.bloodType || 'Not specified'}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">Total Vaccinations</span>
                  <span class="info-value">${childRecords.length}</span>
                </div>
              </div>

              <h2>Immunization History</h2>
              <table>
                <thead>
                  <tr>
                    <th>Vaccine Name</th>
                    <th>Date Given</th>
                    <th>Dose #</th>
                    <th>Next Due Date</th>
                    <th>Status</th>
                    <th>Administered By</th>
                  </tr>
                </thead>
                <tbody>
                  ${childRecords.length === 0 ? '<tr><td colspan="6" style="text-align: center; color: #6b7280;">No immunization records yet</td></tr>' : childRecords.map(record => {
                    const status = getRecordStatus(record);
                    const statusClass = status.replace('due-soon', 'scheduled');
                    const statusLabel = status === 'completed' ? 'Completed' :
                                       status === 'due-soon' ? 'Due Soon' :
                                       status === 'overdue' ? 'Overdue' : 'Scheduled';
                    return `
                      <tr>
                        <td><strong>${record.vaccineName}</strong><br/><small style="color: #6b7280;">${record.vaccineType}</small></td>
                        <td>${new Date(record.dateGiven).toLocaleDateString()}</td>
                        <td>${record.doseNumber || '-'}</td>
                        <td>${record.nextDueDate ? new Date(record.nextDueDate).toLocaleDateString() : '-'}</td>
                        <td><span class="status-${statusClass}">${statusLabel}</span></td>
                        <td>${record.administeredBy}</td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>

              ${childRecords.some(r => r.adverseReactions) ? `
                <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
                  <h3 style="margin: 0 0 8px 0; color: #92400e; font-size: 16px;">⚠️ Adverse Reactions Noted</h3>
                  ${childRecords.filter(r => r.adverseReactions).map(record => `
                    <p style="margin: 8px 0; color: #92400e; font-size: 14px;">
                      <strong>${record.vaccineName}:</strong> ${record.adverseReactions}
                    </p>
                  `).join('')}
                </div>
              ` : ''}
            </div>

            <div class="footer">
              <p>This immunization card is issued by Barangay Health Services for ${child.firstName} ${child.lastName}</p>
              <p style="margin-top: 8px; font-size: 12px;">Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
              <p style="margin-top: 8px; font-size: 12px;">Parent/Guardian: ${user?.firstName} ${user?.lastName}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Create a new window with the card
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(cardHtml);
      printWindow.document.close();

      // Wait for content to load, then print
      printWindow.onload = () => {
        printWindow.print();
      };
    } else {
      toast.error('Unable to open print window. Please check your popup blocker.');
    }
  };

  // Filter records by selected child
  const filteredRecords = selectedChildId === 'all'
    ? immunizationRecords
    : immunizationRecords.filter(r => r.patientId === selectedChildId);

  const selectedChild = selectedChildId === 'all' ? null : children.find(c => c.id === selectedChildId);

  // Calculate stats for selected child or all children
  const stats = {
    totalRecords: filteredRecords.length,
    completedVaccinations: filteredRecords.filter(r => !r.nextDueDate).length,
    upcomingVaccinations: filteredRecords.filter(r => {
      if (!r.nextDueDate) return false;
      const status = getRecordStatus(r);
      return status === 'due-soon' || status === 'scheduled';
    }).length,
    overdueVaccinations: filteredRecords.filter(r => getRecordStatus(r) === 'overdue').length
  };

  return (
    <DashboardLayout currentPage="/health/my-childrens-health">
      <div className="space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">My Children's Health Records</h1>
            <p className="text-muted-foreground mt-2 text-lg">
              View immunization history and vaccination schedules for your children
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Baby className="h-8 w-8 text-primary" />
          </div>
        </div>

        {/* Children Selector */}
        {children.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Select Child
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                  <SelectTrigger className="w-full md:w-[300px]">
                    <SelectValue placeholder="Select a child" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Children</SelectItem>
                    {children.map((child) => (
                      <SelectItem key={child.id} value={child.id}>
                        {child.firstName} {child.lastName} (Age: {calculateAge(child.dateOfBirth)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {selectedChild && (
                  <div className="flex-1 p-4 bg-muted rounded-lg">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Name:</span>
                        <p className="font-medium">{selectedChild.firstName} {selectedChild.lastName}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Age:</span>
                        <p className="font-medium">{calculateAge(selectedChild.dateOfBirth)} years</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Gender:</span>
                        <p className="font-medium">{selectedChild.gender}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Blood Type:</span>
                        <p className="font-medium">{selectedChild.bloodType || 'Not specified'}</p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedChildId !== 'all' && (
                  <Button
                    onClick={() => handleDownloadCard(selectedChildId)}
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Download Card
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden border-0 bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Total Records
                </CardTitle>
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                {stats.totalRecords}
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Immunization records
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-linear-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-green-700 dark:text-green-300">
                  Completed
                </CardTitle>
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-900 dark:text-green-100">
                {stats.completedVaccinations}
              </div>
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                Fully vaccinated
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-linear-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  Upcoming
                </CardTitle>
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">
                {stats.upcomingVaccinations}
              </div>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                Next doses due
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden border-0 bg-linear-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium text-red-700 dark:text-red-300">
                  Overdue
                </CardTitle>
                <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-900 dark:text-red-100">
                {stats.overdueVaccinations}
              </div>
              <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                Needs attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Immunization Records Table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Syringe className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-xl">Immunization History</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Complete vaccination records for {selectedChildId === 'all' ? 'all children' : 'selected child'}
                </p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Loading health records...</span>
              </div>
            ) : children.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Baby className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No children registered</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  You don't have any children registered under your care. Contact your barangay health worker to register your children.
                </p>
              </div>
            ) : filteredRecords.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No immunization records yet</h3>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  {selectedChildId === 'all'
                    ? 'Your children don\'t have immunization records yet. Contact your health worker to schedule vaccinations.'
                    : `${selectedChild?.firstName} doesn't have immunization records yet. Contact your health worker to schedule vaccinations.`}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {selectedChildId === 'all' && <TableHead>Child Name</TableHead>}
                      <TableHead>Vaccine Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date Given</TableHead>
                      <TableHead>Dose #</TableHead>
                      <TableHead>Next Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Administered By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRecords.map((record) => {
                      const status = getRecordStatus(record);
                      return (
                        <TableRow key={record.id}>
                          {selectedChildId === 'all' && (
                            <TableCell className="font-medium">
                              {record.patient?.firstName} {record.patient?.lastName}
                            </TableCell>
                          )}
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Syringe className="h-4 w-4 text-primary" />
                              {record.vaccineName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {record.vaccineType}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(record.dateGiven).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {record.doseNumber ? `#${record.doseNumber}` : '-'}
                          </TableCell>
                          <TableCell>
                            {record.nextDueDate ? new Date(record.nextDueDate).toLocaleDateString() : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(status)}
                              {getStatusBadge(status)}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {record.administeredBy}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Information Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Info className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">Understanding Your Child's Immunization Records</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Status Indicators
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <div>
                        <Badge className="bg-green-600 mr-2">Completed</Badge>
                        <span className="text-sm text-muted-foreground">Vaccination completed, no further doses needed</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      <div>
                        <Badge className="bg-yellow-600 mr-2">Due Soon</Badge>
                        <span className="text-sm text-muted-foreground">Next dose due within 30 days</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                      <div>
                        <Badge variant="destructive" className="mr-2">Overdue</Badge>
                        <span className="text-sm text-muted-foreground">Next dose is past due - contact health worker</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <div>
                        <Badge variant="outline" className="mr-2">Scheduled</Badge>
                        <span className="text-sm text-muted-foreground">Future vaccination scheduled</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Immunization Cards
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download your child's immunization card for school enrollment, daycare requirements,
                    or travel documentation.
                  </p>
                </div>

                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Baby className="h-4 w-4" />
                    Need Help?
                  </h4>
                  <p className="text-sm text-muted-foreground mb-3">
                    Contact your barangay health worker if you have questions about your child's vaccination schedule or health records.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
