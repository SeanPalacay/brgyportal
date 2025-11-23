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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Patient } from '@/types';

interface ImmunizationCard {
  id?: string;
  patientId: string;
  cardData: {
    childInformation: {
      name: string;
      motherName: string;
      fatherName: string;
      dateOfBirth: string;
      placeOfBirth: string;
      birthWeight: number | null;
      birthHeight: number | null;
      sex: string;
      address: string;
      barangay: string;
      familyNumber: string;
    };
    vaccinationSchedule: Array<{
      vaccine: string;
      doses: Array<{
        number: number;
        timing: string;
        dateGiven: string | null;
        remarks: string | null;
      }>;
    }>;
  };
}

export default function ImmunizationCardManager() {
  const [immunizationCards, setImmunizationCards] = useState<ImmunizationCard[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ImmunizationCard | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [filterPatient, setFilterPatient] = useState('all');
  const [isEditing, setIsEditing] = useState(false);

  // Get user role
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userRoles = user.roles || [user.role];
  const isHealthWorker = userRoles.some((role: string) => ['BHW', 'BHW_COORDINATOR', 'SYSTEM_ADMIN'].includes(role));

  useEffect(() => {
    fetchPatients();
    fetchImmunizationCards();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/health/patients');
      setPatients(response.data.patients || []);
    } catch (error) {
      toast.error('Failed to fetch patients');
    }
  };

  const fetchImmunizationCards = async () => {
    try {
      const response = await api.get('/health/immunization-cards');
      setImmunizationCards(response.data.cards || []);
    } catch (error) {
      console.error('Failed to fetch immunization cards:', error);
      toast.error('Failed to fetch immunization cards');
    } finally {
      setLoading(false);
    }
  };

  // Initialize immunization card structure with calculated dates
  const initializeImmunizationCard = (patient: Patient): ImmunizationCard => {
    const dob = new Date(patient.dateOfBirth);
    
    // Helper function to calculate dates based on timing
    const calculateDate = (timing: string): string => {
      switch (timing) {
        case "At birth":
          return dob.toISOString().split('T')[0];
        case "1½ months":
          const oneHalfMonths = new Date(dob);
          oneHalfMonths.setDate(dob.getDate() + 45); // ~1.5 months
          return oneHalfMonths.toISOString().split('T')[0];
        case "2½ months":
          const twoHalfMonths = new Date(dob);
          twoHalfMonths.setDate(dob.getDate() + 75); // ~2.5 months
          return twoHalfMonths.toISOString().split('T')[0];
        case "3½ months":
          const threeHalfMonths = new Date(dob);
          threeHalfMonths.setDate(dob.getDate() + 105); // ~3.5 months
          return threeHalfMonths.toISOString().split('T')[0];
        case "9 months":
          const nineMonths = new Date(dob);
          nineMonths.setMonth(dob.getMonth() + 9);
          return nineMonths.toISOString().split('T')[0];
        case "1 year":
          const oneYear = new Date(dob);
          oneYear.setFullYear(dob.getFullYear() + 1);
          return oneYear.toISOString().split('T')[0];
        default:
          return dob.toISOString().split('T')[0];
      }
    };

    return {
      patientId: patient.id,
      cardData: {
        childInformation: {
          name: `${patient.firstName} ${patient.middleName || ''} ${patient.lastName}`.trim(),
          motherName: patient.motherName || '',
          fatherName: patient.fatherName || '',
          dateOfBirth: patient.dateOfBirth.split('T')[0],
          placeOfBirth: patient.placeOfBirth || '',
          birthWeight: patient.birthWeight ? parseFloat(patient.birthWeight as unknown as string) : null,
          birthHeight: patient.birthLength ? parseFloat(patient.birthLength as unknown as string) : null,
          sex: patient.gender,
          address: patient.address,
          barangay: patient.address.split(',').pop() || '', // Assuming barangay is the last part of address
          familyNumber: patient.id.slice(0, 8) // Using first part of patient ID as family number
        },
        vaccinationSchedule: [
          {
            vaccine: "BCG Vaccine",
            doses: [
              { number: 1, timing: "At birth", dateGiven: calculateDate("At birth"), remarks: null }
            ]
          },
          {
            vaccine: "Hepatitis B Vaccine",
            doses: [
              { number: 1, timing: "At birth", dateGiven: calculateDate("At birth"), remarks: null }
            ]
          },
          {
            vaccine: "Pentavalent Vaccine (DPT-Hep B-HIB)",
            doses: [
              { number: 1, timing: "1½ months", dateGiven: calculateDate("1½ months"), remarks: null },
              { number: 2, timing: "2½ months", dateGiven: calculateDate("2½ months"), remarks: null },
              { number: 3, timing: "3½ months", dateGiven: calculateDate("3½ months"), remarks: null }
            ]
          },
          {
            vaccine: "Oral Polio Vaccine (OPV)",
            doses: [
              { number: 1, timing: "1½ months", dateGiven: calculateDate("1½ months"), remarks: null },
              { number: 2, timing: "2½ months", dateGiven: calculateDate("2½ months"), remarks: null },
              { number: 3, timing: "3½ months", dateGiven: calculateDate("3½ months"), remarks: null }
            ]
          },
          {
            vaccine: "Inactivated Polio Vaccine (IPV)",
            doses: [
              { number: 1, timing: "3½ months", dateGiven: calculateDate("3½ months"), remarks: null },
              { number: 2, timing: "9 months", dateGiven: calculateDate("9 months"), remarks: null }
            ]
          },
          {
            vaccine: "Pneumococcal Conjugate Vaccine (PCV)",
            doses: [
              { number: 1, timing: "1½ months", dateGiven: calculateDate("1½ months"), remarks: null },
              { number: 2, timing: "2½ months", dateGiven: calculateDate("2½ months"), remarks: null },
              { number: 3, timing: "3½ months", dateGiven: calculateDate("3½ months"), remarks: null }
            ]
          },
          {
            vaccine: "Measles, Mumps, Rubella Vaccine (MMR)",
            doses: [
              { number: 1, timing: "9 months", dateGiven: calculateDate("9 months"), remarks: null },
              { number: 2, timing: "1 year", dateGiven: calculateDate("1 year"), remarks: null }
            ]
          }
        ]
      }
    };
  };

  const handleCreateCard = async () => {
    if (!selectedPatient) {
      toast.error('Please select a patient');
      return;
    }

    const patient = patients.find(p => p.id === selectedPatient);
    if (!patient) {
      toast.error('Patient not found');
      return;
    }

    // Check if card already exists
    const existingCard = immunizationCards.find(card => card.patientId === selectedPatient);
    if (existingCard) {
      toast.error('Immunization card already exists for this patient');
      return;
    }

    const cardData = initializeImmunizationCard(patient);

    try {
      const response = await api.post('/health/immunization-cards', cardData);
      setImmunizationCards([...immunizationCards, response.data.card]);
      toast.success('Immunization card created successfully!');
      setShowModal(false);
      setSelectedPatient('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to create immunization card');
    }
  };

  const handleUpdateDose = async (cardId: string, vaccineIndex: number, doseIndex: number, field: string, value: string) => {
    if (!isHealthWorker) {
      toast.error('Only health workers can update immunization records');
      return;
    }

    try {
      // Update the local state immediately for better UX
      setImmunizationCards(prev => prev.map(card => {
        if (card.id === cardId) {
          const updatedCard = { ...card };
          updatedCard.cardData.vaccinationSchedule[vaccineIndex].doses[doseIndex] = {
            ...updatedCard.cardData.vaccinationSchedule[vaccineIndex].doses[doseIndex],
            [field]: value || null
          };
          return updatedCard;
        }
        return card;
      }));

      // Make API call to update the record
      await api.put(`/health/immunization-cards/${cardId}`, {
        cardData: immunizationCards.find(c => c.id === cardId)?.cardData
      });

      toast.success('Immunization record updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to update immunization record');
      // Revert the local change if API fails
      fetchImmunizationCards();
    }
  };

  const handleViewDetails = (card: ImmunizationCard) => {
    setSelectedCard(card);
    setIsEditing(false);
    setShowModal(true);
  };

  const handleEditCard = (card: ImmunizationCard) => {
    setSelectedCard(card);
    setIsEditing(true);
    setShowModal(true);
  };

  const filteredCards = immunizationCards.filter(card => {
    return filterPatient === 'all' || card.patientId === filterPatient;
  });

  const filteredPatients = patients.filter(patient => {
    // Only show patients who don't have an immunization card yet if creating a new card
    if (showModal && !selectedCard) {
      return !immunizationCards.some(card => card.patientId === patient.id);
    }
    return true;
  });

  return (
    <DashboardLayout currentPage="/health/immunization-card">
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Immunization Card Manager</h1>
            <p className="text-gray-600 mt-1">Manage infant immunization cards with automatic scheduling</p>
          </div>
          {isHealthWorker && (
            <Button onClick={() => {
              setSelectedCard(null);
              setIsEditing(false);
              setShowModal(true);
            }}>
              Create New Card
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Total Cards</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{immunizationCards.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Active Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{patients.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-gray-600">Infants</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {patients.filter(p => {
                  const dob = new Date(p.dateOfBirth);
                  const today = new Date();
                  const age = today.getFullYear() - dob.getFullYear();
                  return age < 1; // Less than 1 year old
                }).length}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Immunization Cards</CardTitle>
              <div className="flex gap-2 items-center">
                <Select value={filterPatient} onValueChange={setFilterPatient}>
                  <SelectTrigger className="w-[200px]">
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
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading immunization cards...</p>
            ) : filteredCards.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No immunization cards found.
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  {isHealthWorker ? 'Create a new immunization card to get started.' : 'Contact a health worker for assistance.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCards.map((card) => (
                  <Card key={card.id} className="border">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <h3 className="font-semibold text-lg">
                          {card.cardData.childInformation.name}
                        </h3>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleViewDetails(card)}
                          >
                            View Card
                          </Button>
                          {isHealthWorker && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleEditCard(card)}
                            >
                              Edit
                            </Button>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        DOB: {new Date(card.cardData.childInformation.dateOfBirth).toLocaleDateString()} • 
                        Age: {(() => {
                          const dob = new Date(card.cardData.childInformation.dateOfBirth);
                          const today = new Date();
                          const age = today.getFullYear() - dob.getFullYear();
                          return age + ' year' + (age !== 1 ? 's' : '');
                        })()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-medium mb-2">Vaccines Due Soon</h4>
                          {card.cardData.vaccinationSchedule
                            .flatMap(vaccine => vaccine.doses
                              .filter(dose => 
                                dose.dateGiven && 
                                new Date(dose.dateGiven) > new Date() &&
                                new Date(dose.dateGiven) <= new Date(new Date().setDate(new Date().getDate() + 30))
                              )
                              .map(dose => ({ ...dose, vaccine: vaccine.vaccine }))
                            )
                            .slice(0, 3)
                            .map((dose, idx) => (
                              <div key={idx} className="flex justify-between text-sm py-1 border-b">
                                <span>{dose.vaccine} (Dose {dose.number})</span>
                                <span>{new Date(dose.dateGiven!).toLocaleDateString()}</span>
                              </div>
                            ))}
                          {card.cardData.vaccinationSchedule
                            .flatMap(vaccine => vaccine.doses)
                            .filter(dose => 
                              dose.dateGiven && 
                              new Date(dose.dateGiven) > new Date()
                            ).length === 0 && (
                            <p className="text-sm text-muted-foreground">No upcoming vaccines</p>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium mb-2">Recent Vaccinations</h4>
                          {card.cardData.vaccinationSchedule
                            .flatMap(vaccine => vaccine.doses
                              .filter(dose => 
                                dose.dateGiven && 
                                new Date(dose.dateGiven) <= new Date()
                              )
                              .map(dose => ({ ...dose, vaccine: vaccine.vaccine }))
                            )
                            .sort((a, b) => new Date(b.dateGiven!).getTime() - new Date(a.dateGiven!).getTime())
                            .slice(0, 3)
                            .map((dose, idx) => (
                              <div key={idx} className="flex justify-between text-sm py-1 border-b">
                                <span>{dose.vaccine} (Dose {dose.number})</span>
                                <span>{new Date(dose.dateGiven!).toLocaleDateString()}</span>
                              </div>
                            ))}
                          {card.cardData.vaccinationSchedule
                            .flatMap(vaccine => vaccine.doses)
                            .filter(dose => 
                              dose.dateGiven && 
                              new Date(dose.dateGiven) <= new Date()
                            ).length === 0 && (
                            <p className="text-sm text-muted-foreground">No vaccinations recorded yet</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modal for viewing/editing immunization card */}
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedCard ? 
                  `${isEditing ? 'Edit' : 'View'} Immunization Card` : 
                  'Create New Immunization Card'
                }
              </DialogTitle>
            </DialogHeader>
            
            {!selectedCard ? (
              // Create new card form
              <div className="space-y-4">
                <div>
                  <Label htmlFor="patientSelect">Select Patient *</Label>
                  <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a patient..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredPatients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.firstName} {patient.middleName} {patient.lastName} 
                          ({new Date(patient.dateOfBirth).toLocaleDateString()})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateCard}>
                    Create Card
                  </Button>
                </div>
              </div>
            ) : (
              // View/edit card details
              <div className="space-y-6">
                {/* Child Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Child Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label>Name</Label>
                        <Input 
                          value={selectedCard.cardData.childInformation.name} 
                          readOnly
                        />
                      </div>
                      <div>
                        <Label>Sex</Label>
                        <Input 
                          value={selectedCard.cardData.childInformation.sex} 
                          readOnly
                        />
                      </div>
                      <div>
                        <Label>Date of Birth</Label>
                        <Input 
                          value={new Date(selectedCard.cardData.childInformation.dateOfBirth).toLocaleDateString()} 
                          readOnly
                        />
                      </div>
                      <div>
                        <Label>Birth Weight (kg)</Label>
                        <Input 
                          value={selectedCard.cardData.childInformation.birthWeight || ''} 
                          readOnly
                        />
                      </div>
                      <div>
                        <Label>Birth Height (cm)</Label>
                        <Input 
                          value={selectedCard.cardData.childInformation.birthHeight || ''} 
                          readOnly
                        />
                      </div>
                      <div>
                        <Label>Place of Birth</Label>
                        <Input 
                          value={selectedCard.cardData.childInformation.placeOfBirth} 
                          readOnly
                        />
                      </div>
                      <div>
                        <Label>Mother's Name</Label>
                        <Input 
                          value={selectedCard.cardData.childInformation.motherName} 
                          readOnly
                        />
                      </div>
                      <div>
                        <Label>Father's Name</Label>
                        <Input 
                          value={selectedCard.cardData.childInformation.fatherName} 
                          readOnly
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label>Address</Label>
                        <Input 
                          value={selectedCard.cardData.childInformation.address} 
                          readOnly
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                {/* Vaccination Schedule */}
                <Card>
                  <CardHeader>
                    <CardTitle>Vaccination Schedule</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {isEditing ? 'Click on "Date Given" or "Remarks" to edit' : 'Click "View Card" to see more details'}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {selectedCard.cardData.vaccinationSchedule.map((vaccine, vIndex) => (
                        <div key={vIndex} className="border rounded-lg p-4">
                          <h3 className="font-semibold text-lg mb-3">{vaccine.vaccine}</h3>
                          <div className="overflow-x-auto">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-[100px]">Dose #</TableHead>
                                  <TableHead className="w-[120px]">Timing</TableHead>
                                  <TableHead className="w-[150px]">Calculated Date</TableHead>
                                  <TableHead className="w-[150px]">Date Given</TableHead>
                                  <TableHead>Remarks</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {vaccine.doses.map((dose, dIndex) => (
                                  <TableRow key={dIndex}>
                                    <TableCell>{dose.number}</TableCell>
                                    <TableCell>{dose.timing}</TableCell>
                                    <TableCell>{new Date(dose.dateGiven!).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                      {isHealthWorker ? (
                                        <Input
                                          type="date"
                                          value={dose.dateGiven || ''}
                                          onChange={(e) => {
                                            if (selectedCard.id) {
                                              handleUpdateDose(
                                                selectedCard.id, 
                                                vIndex, 
                                                dIndex, 
                                                'dateGiven', 
                                                e.target.value
                                              );
                                            }
                                          }}
                                          className="w-full"
                                        />
                                      ) : (
                                        dose.dateGiven ? 
                                          new Date(dose.dateGiven).toLocaleDateString() : 
                                          'Not given'
                                      )}
                                    </TableCell>
                                    <TableCell>
                                      {isHealthWorker ? (
                                        <Input
                                          value={dose.remarks || ''}
                                          onChange={(e) => {
                                            if (selectedCard.id) {
                                              handleUpdateDose(
                                                selectedCard.id, 
                                                vIndex, 
                                                dIndex, 
                                                'remarks', 
                                                e.target.value
                                              );
                                            }
                                          }}
                                          placeholder="Add remarks..."
                                          className="w-full"
                                        />
                                      ) : (
                                        dose.remarks || 'None'
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setShowModal(false)}
                      >
                        Close
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}