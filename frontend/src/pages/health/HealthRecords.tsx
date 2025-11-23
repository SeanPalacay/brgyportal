import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Patient } from '@/types';
import { AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';

interface ImmunizationCard {
  id: string;
  patientId: string;
  patient?: Patient;
  cardData: {
    childInformation: any;
    vaccinationSchedule: Array<{
      vaccine: string;
      doses: Array<{
        number: number;
        timing: string;
        dueDate?: string;
        dateGiven?: string | null;
        remarks?: string | null;
      }>;
    }>;
  };
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

export default function HealthRecords() {
  const [records, setRecords] = useState<ImmunizationRecord[]>([]);
  const [cards, setCards] = useState<ImmunizationCard[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState('');
  const [filterPatient, setFilterPatient] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedRecord, setSelectedRecord] = useState<ImmunizationRecord | null>(null);
  const [selectedCard, setSelectedCard] = useState<ImmunizationCard | null>(null);
  const [cardDialogOpen, setCardDialogOpen] = useState(false);
  const [cardDraft, setCardDraft] = useState<ImmunizationCard | null>(null);

  // Get user role to determine interface
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRoles = user.roles || [user.role];
  const isPatient = userRoles.includes('PARENT_RESIDENT');
  const isHealthWorker = userRoles.some((role: string) => ['BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN'].includes(role));
  const isAdmin = userRoles.includes('SYSTEM_ADMIN');
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
    fetchCards();
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

  const fetchCards = async () => {
    try {
      const response = await api.get('/health/immunization-cards');
      setCards(response.data.cards || []);
    } catch (error) {
      console.error('Failed to fetch immunization cards:', error);
      toast.error('Failed to fetch immunization cards');
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

  const updateDoseField = (vaccineIdx: number, doseIdx: number, field: 'dateGiven' | 'remarks', value: string) => {
    setCardDraft((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      const dose = next.cardData.vaccinationSchedule[vaccineIdx].doses[doseIdx];
      dose[field] = value || null;
      return next;
    });
  };

  const saveCardEdits = async () => {
    if (!selectedCard || !cardDraft) return;
    try {
      await api.put(`/health/immunization-cards/${selectedCard.id}`, {
        cardData: cardDraft.cardData
      });
      // Refresh list with updated card
      setCards((prev) => prev.map((c) => (c.id === selectedCard.id ? cardDraft : c)));
      toast.success('Immunization card updated');
      setCardDialogOpen(false);
      setSelectedCard(null);
      setCardDraft(null);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update immunization card');
    }
  };

  const getDoseStatus = (dose: { dueDate?: string; dateGiven?: string | null }) => {
    if (dose.dateGiven) return 'completed';
    if (!dose.dueDate) return 'pending';
    const due = new Date(dueDateSafe(dose.dueDate));
    return due < new Date() ? 'overdue' : 'pending';
  };

  const ProgressIcon = ({ given, total }: { given: number; total: number }) => {
    const all = given === total;
    const none = given === 0;
    if (all) return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />;
    if (none) return <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
    return <Clock className="h-4 w-4 text-blue-500 dark:text-blue-400" />;
  };

  const StatusIcon = ({ status }: { status: string }) => {
    if (status === 'completed') return <CheckCircle className="h-4 w-4 text-green-500 dark:text-green-400" />;
    if (status === 'overdue') return <AlertTriangle className="h-4 w-4 text-red-500 dark:text-red-400" />;
    return <Clock className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
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
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">
                Infant Immunization Cards
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{cards.length}</p>
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
                  <div key={record.id} className="border p-4 rounded-lg flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {!isPatient && (
                          <span className="text-sm font-semibold text-gray-900">
                            {record.patient?.firstName} {record.patient?.lastName}
                          </span>
                        )}
                        <Badge variant="outline">{record.vaccineName}</Badge>
                        {record.doseNumber && (
                          <Badge variant="secondary">Dose {record.doseNumber}</Badge>
                        )}
                        <Badge variant={getRecordStatus(record) === 'completed' ? 'secondary' : 'outline'}>
                          {getRecordStatus(record).replace('-', ' ')}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        Given {new Date(record.dateGiven).toLocaleDateString()}
                        {record.nextDueDate && (
                          <> • Next due {new Date(record.nextDueDate).toLocaleDateString()}</>
                        )}
                      </div>
                      {record.notes && (
                        <div className="text-xs text-muted-foreground line-clamp-1">
                          Notes: {record.notes}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {record.siteOfAdministration && (
                        <Badge variant="outline">{record.siteOfAdministration}</Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedRecord(record);
                          setShowDetailsDialog(true);
                        }}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setRecordDraft(record);
                          setRecordEditOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Infant Immunization Cards (auto-generated) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Infant Immunization Cards</h2>
            <span className="text-sm text-muted-foreground">Auto-generated for patients under 1 year old</span>
          </div>
          {cards.length === 0 ? (
            <p className="text-muted-foreground">No immunization cards found.</p>
          ) : (
            <div className="space-y-3">
              {cards.map((card) => {
                const totalDoses = card.cardData.vaccinationSchedule.reduce((acc, v) => acc + v.doses.length, 0);
                const given = card.cardData.vaccinationSchedule.reduce(
                  (acc, v) => acc + v.doses.filter(d => d.dateGiven).length,
                  0
                );
                const completion = `${given}/${totalDoses} doses`;

                return (
                  <Card key={card.id} className="h-full">
                  <CardContent className="flex items-center justify-between gap-4 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold">
                          {card.patient?.firstName} {card.patient?.lastName}
                        </span>
                        <Badge variant="outline">Family #{card.cardData.childInformation?.familyNumber}</Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <ProgressIcon given={given} total={totalDoses} />
                        <span>{completion}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {card.cardData.vaccinationSchedule.length} vaccine types • tap View for details
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                        <span><strong>Name:</strong> {card.cardData.childInformation?.name}</span>
                        <span><strong>DOB:</strong> {card.cardData.childInformation?.dateOfBirth}</span>
                        <span><strong>Mother:</strong> {card.cardData.childInformation?.motherName}</span>
                        <span><strong>Father:</strong> {card.cardData.childInformation?.fatherName}</span>
                        <span><strong>Address:</strong> {card.cardData.childInformation?.address}</span>
                        <span><strong>Barangay:</strong> {card.cardData.childInformation?.barangay}</span>
                        <span><strong>Birth Wt:</strong> {card.cardData.childInformation?.birthWeight ?? '—'}</span>
                        <span><strong>Birth Ht:</strong> {card.cardData.childInformation?.birthHeight ?? '—'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                          onClick={() => {
                            setSelectedCard(card);
                            setCardDraft(card);
                            setCardDialogOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-1" /> View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Infant card details modal for admin edits */}
        <Dialog open={cardDialogOpen} onOpenChange={(open) => { setCardDialogOpen(open); if (!open) { setSelectedCard(null); setCardDraft(null); } }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Infant Immunization Card</DialogTitle>
            </DialogHeader>
            {cardDraft && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold text-lg">
                      {cardDraft.patient?.firstName} {cardDraft.patient?.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">Family #{cardDraft.cardData.childInformation?.familyNumber}</div>
                    <div className="text-xs text-muted-foreground grid grid-cols-2 gap-1 bg-slate-50 dark:bg-slate-900/50 p-2 rounded">
                      <span><strong>DOB:</strong> {cardDraft.cardData.childInformation?.dateOfBirth}</span>
                      <span><strong>Place:</strong> {cardDraft.cardData.childInformation?.placeOfBirth || '—'}</span>
                      <span><strong>Mother:</strong> {cardDraft.cardData.childInformation?.motherName || '—'}</span>
                      <span><strong>Father:</strong> {cardDraft.cardData.childInformation?.fatherName || '—'}</span>
                      <span><strong>Address:</strong> {cardDraft.cardData.childInformation?.address || '—'}</span>
                      <span><strong>Barangay:</strong> {cardDraft.cardData.childInformation?.barangay || '—'}</span>
                      <span><strong>Birth Wt:</strong> {cardDraft.cardData.childInformation?.birthWeight ?? '—'}</span>
                      <span><strong>Birth Ht:</strong> {cardDraft.cardData.childInformation?.birthHeight ?? '—'}</span>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    {cardDraft.cardData.vaccinationSchedule.reduce((acc, v) => acc + v.doses.filter(d => d.dateGiven).length, 0)} /
                    {cardDraft.cardData.vaccinationSchedule.reduce((acc, v) => acc + v.doses.length, 0)} completed
                  </Badge>
                </div>

                <div className="space-y-3">
                  {cardDraft.cardData.vaccinationSchedule.map((vaccine, vIdx) => (
                    <div key={vaccine.vaccine} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-semibold">{vaccine.vaccine}</div>
                        <Badge variant="outline">{vaccine.doses.length} dose(s)</Badge>
                      </div>
                      <div className="space-y-2">
                        {vaccine.doses.map((dose, dIdx) => {
                          const status = getDoseStatus(dose);
                          return (
                            <div key={dose.number} className="flex flex-wrap items-center gap-3 rounded bg-slate-50 dark:bg-slate-900/60 p-2">
                              <div className="flex items-center gap-2 text-sm font-medium">
                                <StatusIcon status={status} />
                                Dose {dose.number} ({dose.timing})
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Due {dose.dueDate ? new Date(dueDateSafe(dose.dueDate)).toLocaleDateString() : '—'}
                              </div>
                              <div className="flex-1 min-w-[200px]">
                                {isAdmin ? (
                                  <Input
                                    type="date"
                                    value={dose.dateGiven || ''}
                                    onChange={(e) => updateDoseField(vIdx, dIdx, 'dateGiven', e.target.value)}
                                  />
                                ) : (
                                  <span className="text-sm">
                                    {dose.dateGiven ? new Date(dose.dateGiven).toLocaleDateString() : 'Not given'}
                                  </span>
                                )}
                              </div>
                              <div className="flex-1 min-w-[200px]">
                                {isAdmin ? (
                                  <Input
                                    placeholder="Remarks"
                                    value={dose.remarks || ''}
                                    onChange={(e) => updateDoseField(vIdx, dIdx, 'remarks', e.target.value)}
                                  />
                                ) : (
                                  <span className="text-sm text-muted-foreground">
                                    {dose.remarks || 'No remarks'}
                                  </span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {isAdmin && (
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => { setCardDialogOpen(false); setSelectedCard(null); }}>
                      Close
                    </Button>
                    <Button onClick={saveCardEdits}>
                      Save Changes
                    </Button>
                  </div>
                )}
                {!isAdmin && (
                  <div className="flex justify-end">
                    <Button variant="outline" onClick={() => setCardDialogOpen(false)}>Close</Button>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>

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

// Guard against invalid dates coming from API
const dueDateSafe = (value?: string) => {
  if (!value) return '';
  const parsed = new Date(value);
  return isNaN(parsed.getTime()) ? '' : parsed.toISOString();
};
