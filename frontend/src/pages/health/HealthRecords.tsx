import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Patient } from '@/types';

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

export default function HealthRecords() {
  const [records, setRecords] = useState<ImmunizationRecord[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [filterPatient, setFilterPatient] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<ImmunizationRecord | null>(null);

  // Get user role to determine interface
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRoles = user.roles || [user.role];
  const isPatient = userRoles.includes('PARENT_RESIDENT');
  const isHealthWorker = userRoles.some((role: string) => ['BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN'].includes(role));
  const [formData, setFormData] = useState({
    vaccineName: '',
    vaccineType: '',
    manufacturer: '',
    lotNumber: '',
    dosage: '',
    dateGiven: '',
    ageAtVaccination: '',
    siteOfAdministration: '',
    administeredBy: '',
    doseNumber: '',
    nextDueDate: '',
    batchNumber: '',
    expirationDate: '',
    adverseReactions: '',
    notes: ''
  });

  useEffect(() => {
    fetchPatients();
    fetchRecords();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/health/patients');
      setPatients(response.data.patients || []);
    } catch (error) {
      toast.error('Failed to fetch patients');
    }
  };

  const fetchRecords = async () => {
    try {
      let endpoint = '/health/immunization-records';
      if (isPatient) {
        // For patients, only fetch their own records
        endpoint = `/health/immunization-records/my`;
      }
      const response = await api.get(endpoint);
      setRecords(response.data.immunizationRecords || []);
    } catch (error) {
      console.error('Failed to fetch immunization records:', error);
      toast.error('Failed to fetch immunization records');
    } finally {
      setLoading(false);
    }
  };

  const getRecordStatus = (record: ImmunizationRecord) => {
    if (!record.nextDueDate) return 'completed';
    const today = new Date();
    const dueDate = new Date(record.nextDueDate);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'overdue';
    if (diffDays <= 30) return 'due-soon';
    return 'scheduled';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }

    try {
      await api.post('/health/immunization-records', {
        patientId: selectedPatient,
        vaccineName: formData.vaccineName,
        vaccineType: formData.vaccineType,
        manufacturer: formData.manufacturer,
        lotNumber: formData.lotNumber,
        dosage: formData.dosage,
        dateGiven: formData.dateGiven,
        ageAtVaccination: formData.ageAtVaccination,
        siteOfAdministration: formData.siteOfAdministration,
        administeredBy: formData.administeredBy,
        doseNumber: formData.doseNumber ? parseInt(formData.doseNumber) : null,
        nextDueDate: formData.nextDueDate || null,
        batchNumber: formData.batchNumber,
        expirationDate: formData.expirationDate || null,
        adverseReactions: formData.adverseReactions,
        notes: formData.notes
      });

      toast.success('Immunization record created successfully!');
      setShowDialog(false);
      setFormData({
        vaccineName: '',
        vaccineType: '',
        manufacturer: '',
        lotNumber: '',
        dosage: '',
        dateGiven: '',
        ageAtVaccination: '',
        siteOfAdministration: '',
        administeredBy: '',
        doseNumber: '',
        nextDueDate: '',
        batchNumber: '',
        expirationDate: '',
        adverseReactions: '',
        notes: ''
      });
      setSelectedPatient('');
      fetchRecords();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create immunization record');
    }
  };

  return (
    <DashboardLayout currentPage="/health/records">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {isPatient ? 'My Immunization Records' : 'Immunization Cards'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isPatient ? 'View your immunization history and e-cards' : 'Digital immunization card management'}
            </p>
          </div>
          {isHealthWorker && (
            <Button onClick={() => setShowDialog(true)}>
              Add Immunization Record
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                {isPatient ? 'My Records' : 'Total Records'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{records.length}</p>
            </CardContent>
          </Card>
          {isHealthWorker && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-gray-600">Registered Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{patients.length}</p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                {isPatient ? 'Recent Vaccines' : 'This Month'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {records.filter(record => {
                  const recordDate = new Date(record.dateGiven);
                  const now = new Date();
                  return recordDate.getMonth() === now.getMonth() && recordDate.getFullYear() === now.getFullYear();
                }).length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {isPatient ? 'My Immunization History' : 'Immunization Records'}
              </CardTitle>
              {isHealthWorker && (
                <div className="flex gap-2 items-center">
                  <Select value={filterPatient} onValueChange={setFilterPatient}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="All patients" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All patients</SelectItem>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="All status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All status</SelectItem>
                      <SelectItem value="due-soon">Due Soon</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading records...</p>
            ) : records.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {isPatient ? 'No immunization records found.' : 'No immunization records yet.'}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {isPatient ? 'Contact your health worker if you believe this is incorrect.' : 'Click "Add Immunization Record" to create the first record.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {records.filter(record => {
                  const patientMatch = filterPatient === 'all' || record.patientId === filterPatient;
                  const status = getRecordStatus(record);
                  const statusMatch = filterStatus === 'all' || status === filterStatus;
                  return patientMatch && statusMatch;
                }).map((record) => (
                  <div key={record.id} className="border p-4 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        {!isPatient && (
                          <h3 className="font-semibold">
                            {record.patient?.firstName} {record.patient?.lastName}
                          </h3>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          Date Given: {new Date(record.dateGiven).toLocaleDateString()}
                        </p>
                        <p className="text-sm mt-2">
                          <span className="font-medium">Vaccine:</span> {record.vaccineName} ({record.vaccineType})
                        </p>
                        {record.ageAtVaccination && (
                          <p className="text-sm">
                            <span className="font-medium">Age at Vaccination:</span> {record.ageAtVaccination}
                          </p>
                        )}
                        {record.dosage && (
                          <p className="text-sm">
                            <span className="font-medium">Dosage:</span> {record.dosage}
                          </p>
                        )}
                        {record.doseNumber && (
                          <p className="text-sm">
                            <span className="font-medium">Dose Number:</span> {record.doseNumber}
                          </p>
                        )}
                        <p className="text-sm">
                          <span className="font-medium">Administered By:</span> {record.administeredBy}
                        </p>
                        {record.siteOfAdministration && (
                          <p className="text-sm">
                            <span className="font-medium">Site:</span> {record.siteOfAdministration}
                          </p>
                        )}
                        {record.nextDueDate && (
                          <p className="text-sm">
                            <span className="font-medium">Next Due:</span> {new Date(record.nextDueDate).toLocaleDateString()}
                          </p>
                        )}
                        {record.adverseReactions && (
                          <p className="text-sm mt-2 text-orange-600">
                            <span className="font-medium">Adverse Reactions:</span> {record.adverseReactions}
                          </p>
                        )}
                        {record.notes && (
                          <p className="text-sm mt-2">
                            <span className="font-medium">Notes:</span> {record.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant="outline">Immunization</Badge>
                        {record.nextDueDate && new Date(record.nextDueDate) > new Date() && (
                          <Badge variant="secondary">Next Due</Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRecord(record);
                            setShowDetailsDialog(true);
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {isHealthWorker && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Immunization Record</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Select Patient *</label>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Vaccine Name *</label>
                  <Select value={formData.vaccineName} onValueChange={(value) => setFormData({...formData, vaccineName: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select vaccine..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BCG">BCG</SelectItem>
                      <SelectItem value="Hepatitis B">Hepatitis B</SelectItem>
                      <SelectItem value="DPT">DPT</SelectItem>
                      <SelectItem value="OPV">OPV (Polio)</SelectItem>
                      <SelectItem value="Hib">Hib</SelectItem>
                      <SelectItem value="PCV">PCV</SelectItem>
                      <SelectItem value="Measles">Measles</SelectItem>
                      <SelectItem value="MMR">MMR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Vaccine Type *</label>
                  <Input
                    value={formData.vaccineType}
                    onChange={(e) => setFormData({...formData, vaccineType: e.target.value})}
                    placeholder="e.g., BCG, DPT, MMR"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date Given *</label>
                  <Input
                    type="date"
                    value={formData.dateGiven}
                    onChange={(e) => setFormData({...formData, dateGiven: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Age at Vaccination</label>
                  <Input
                    value={formData.ageAtVaccination}
                    onChange={(e) => setFormData({...formData, ageAtVaccination: e.target.value})}
                    placeholder="e.g., Birth, 2 months, 1 year"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Dosage</label>
                  <Input
                    value={formData.dosage}
                    onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                    placeholder="e.g., 0.5ml"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Dose Number</label>
                  <Input
                    type="number"
                    value={formData.doseNumber}
                    onChange={(e) => setFormData({...formData, doseNumber: e.target.value})}
                    placeholder="1, 2, 3..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Administered By *</label>
                  <Input
                    value={formData.administeredBy}
                    onChange={(e) => setFormData({...formData, administeredBy: e.target.value})}
                    placeholder="Healthcare provider name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Site of Administration</label>
                  <Select value={formData.siteOfAdministration} onValueChange={(value) => setFormData({...formData, siteOfAdministration: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select site..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Left thigh">Left thigh</SelectItem>
                      <SelectItem value="Right thigh">Right thigh</SelectItem>
                      <SelectItem value="Left arm">Left arm</SelectItem>
                      <SelectItem value="Right arm">Right arm</SelectItem>
                      <SelectItem value="Left deltoid">Left deltoid</SelectItem>
                      <SelectItem value="Right deltoid">Right deltoid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Manufacturer</label>
                  <Input
                    value={formData.manufacturer}
                    onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                    placeholder="Vaccine manufacturer"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Lot Number</label>
                  <Input
                    value={formData.lotNumber}
                    onChange={(e) => setFormData({...formData, lotNumber: e.target.value})}
                    placeholder="Lot/batch number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Next Due Date</label>
                  <Input
                    type="date"
                    value={formData.nextDueDate}
                    onChange={(e) => setFormData({...formData, nextDueDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Expiration Date</label>
                  <Input
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Adverse Reactions</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={2}
                  value={formData.adverseReactions}
                  onChange={(e) => setFormData({...formData, adverseReactions: e.target.value})}
                  placeholder="Any adverse reactions observed"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Additional Notes</label>
                <textarea
                  className="w-full p-2 border rounded-md"
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Any additional observations or notes"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  Cancel
                </Button>
                <Button type="submit">Save Immunization Record</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        )}

        {/* Immunization Record Details Modal */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Immunization Record Details</DialogTitle>
            </DialogHeader>

            {selectedRecord && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Patient Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Patient Name</Label>
                      <p className="text-sm">
                        {selectedRecord.patient?.firstName} {selectedRecord.patient?.middleName} {selectedRecord.patient?.lastName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Date of Birth</Label>
                      <p className="text-sm">{selectedRecord.patient?.dateOfBirth ? new Date(selectedRecord.patient.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Vaccine Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Vaccine Name</Label>
                      <p className="text-sm">{selectedRecord.vaccineName}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Vaccine Type</Label>
                      <p className="text-sm">{selectedRecord.vaccineType}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Dosage</Label>
                      <p className="text-sm">{selectedRecord.dosage || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Dose Number</Label>
                      <p className="text-sm">{selectedRecord.doseNumber || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Manufacturer</Label>
                      <p className="text-sm">{selectedRecord.manufacturer || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Lot Number</Label>
                      <p className="text-sm">{selectedRecord.lotNumber || 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Administration Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Date Given</Label>
                      <p className="text-sm">{new Date(selectedRecord.dateGiven).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Age at Vaccination</Label>
                      <p className="text-sm">{selectedRecord.ageAtVaccination || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Site of Administration</Label>
                      <p className="text-sm">{selectedRecord.siteOfAdministration || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Administered By</Label>
                      <p className="text-sm">{selectedRecord.administeredBy}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Schedule Information</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Next Due Date</Label>
                      <p className="text-sm">{selectedRecord.nextDueDate ? new Date(selectedRecord.nextDueDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Batch Number</Label>
                      <p className="text-sm">{selectedRecord.batchNumber || 'N/A'}</p>
                    </div>
                    <div className="md:col-span-2">
                      <Label className="text-sm font-medium text-muted-foreground">Expiration Date</Label>
                      <p className="text-sm">{selectedRecord.expirationDate ? new Date(selectedRecord.expirationDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Additional Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedRecord.adverseReactions && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Adverse Reactions</Label>
                        <p className="text-sm text-red-600">{selectedRecord.adverseReactions}</p>
                      </div>
                    )}
                    {selectedRecord.notes && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Notes</Label>
                        <p className="text-sm">{selectedRecord.notes}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-end">
                  <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
