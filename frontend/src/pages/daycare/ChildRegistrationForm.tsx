import { useState } from 'react';
import { api } from '@/lib/api';
import DashboardLayout from '@/components/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function ChildRegistrationForm() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    childFirstName: '',
    childMiddleName: '',
    childLastName: '',
    childDateOfBirth: '',
    childGender: '',
    childAddress: '',
    childMedicalConditions: '',
    childAllergies: '',
    childMedications: '',
    parentContact: '',
    emergencyContact: '',
    emergencyRelationship: '',
    emergencyPhone: '',
    additionalNotes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      'childFirstName', 'childLastName', 'childDateOfBirth',
      'childGender', 'childAddress', 'parentContact', 'emergencyContact'
    ];

    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      // Map frontend fields to backend schema
      const payload = {
        childFirstName: formData.childFirstName,
        childMiddleName: formData.childMiddleName || null,
        childLastName: formData.childLastName,
        childDateOfBirth: formData.childDateOfBirth,
        childGender: formData.childGender,
        address: formData.childAddress, // Schema expects 'address' not 'childAddress'
        parentContact: formData.parentContact,
        emergencyContact: formData.emergencyContact,
        notes: [
          formData.childMedicalConditions && `Medical Conditions: ${formData.childMedicalConditions}`,
          formData.childAllergies && `Allergies: ${formData.childAllergies}`,
          formData.childMedications && `Medications: ${formData.childMedications}`,
          formData.emergencyRelationship && `Emergency Relationship: ${formData.emergencyRelationship}`,
          formData.emergencyPhone && `Emergency Phone: ${formData.emergencyPhone}`,
          formData.additionalNotes
        ].filter(Boolean).join('\n') || null
      };
      await api.post('/daycare/registrations', payload);

      toast.success('Daycare registration submitted successfully! You will receive a notification once it\'s reviewed.');

      // Reset form
      setFormData({
        childFirstName: '',
        childMiddleName: '',
        childLastName: '',
        childDateOfBirth: '',
        childGender: '',
        childAddress: '',
        childMedicalConditions: '',
        childAllergies: '',
        childMedications: '',
        parentContact: '',
        emergencyContact: '',
        emergencyRelationship: '',
        emergencyPhone: '',
        additionalNotes: ''
      });
    } catch {
      toast.error('Failed to submit registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <DashboardLayout currentPage="/daycare/registrations">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Child Daycare Registration</h1>
          <p className="text-muted-foreground mt-1">
            Register your child for daycare services. All information will be kept confidential.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Child Information</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Child Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="childFirstName">First Name *</Label>
                  <Input
                    id="childFirstName"
                    value={formData.childFirstName}
                    onChange={(e) => handleInputChange('childFirstName', e.target.value)}
                    placeholder="Enter first name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="childMiddleName">Middle Name</Label>
                  <Input
                    id="childMiddleName"
                    value={formData.childMiddleName}
                    onChange={(e) => handleInputChange('childMiddleName', e.target.value)}
                    placeholder="Enter middle name"
                  />
                </div>
                <div>
                  <Label htmlFor="childLastName">Last Name *</Label>
                  <Input
                    id="childLastName"
                    value={formData.childLastName}
                    onChange={(e) => handleInputChange('childLastName', e.target.value)}
                    placeholder="Enter last name"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="childDateOfBirth">Date of Birth *</Label>
                  <Input
                    id="childDateOfBirth"
                    type="date"
                    value={formData.childDateOfBirth}
                    onChange={(e) => handleInputChange('childDateOfBirth', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="childGender">Gender *</Label>
                  <Select value={formData.childGender} onValueChange={(value) => handleInputChange('childGender', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Male</SelectItem>
                      <SelectItem value="FEMALE">Female</SelectItem>
                      <SelectItem value="OTHER">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="childAddress">Home Address *</Label>
                <Textarea
                  id="childAddress"
                  value={formData.childAddress}
                  onChange={(e) => handleInputChange('childAddress', e.target.value)}
                  placeholder="Enter complete home address"
                  rows={3}
                  required
                />
              </div>

              {/* Health Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Health Information</h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="childMedicalConditions">Medical Conditions</Label>
                    <Textarea
                      id="childMedicalConditions"
                      value={formData.childMedicalConditions}
                      onChange={(e) => handleInputChange('childMedicalConditions', e.target.value)}
                      placeholder="List any medical conditions, disabilities, or special needs"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="childAllergies">Allergies</Label>
                    <Textarea
                      id="childAllergies"
                      value={formData.childAllergies}
                      onChange={(e) => handleInputChange('childAllergies', e.target.value)}
                      placeholder="List any allergies (food, medication, environmental, etc.)"
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label htmlFor="childMedications">Current Medications</Label>
                    <Textarea
                      id="childMedications"
                      value={formData.childMedications}
                      onChange={(e) => handleInputChange('childMedications', e.target.value)}
                      placeholder="List any current medications and dosages"
                      rows={2}
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-t pt-6">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="parentContact">Parent/Guardian Contact Number *</Label>
                    <Input
                      id="parentContact"
                      type="tel"
                      value={formData.parentContact}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length > 0 && !value.startsWith('09')) {
                          if (value.startsWith('9')) {
                            value = '0' + value;
                          } else if (value.startsWith('63')) {
                            value = '0' + value.substring(2);
                          } else {
                            value = '09' + value;
                          }
                        }
                        if (value.length > 11) {
                          value = value.substring(0, 11);
                        }
                        handleInputChange('parentContact', value);
                      }}
                      placeholder="09XX XXX XXXX"
                      pattern="09[0-9]{9}"
                      maxLength={11}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter Philippine mobile number starting with 09
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="emergencyContact">Emergency Contact Name *</Label>
                      <Input
                        id="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={(e) => handleInputChange('emergencyContact', e.target.value)}
                        placeholder="Full name"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="emergencyRelationship">Relationship</Label>
                      <Select value={formData.emergencyRelationship} onValueChange={(value) => handleInputChange('emergencyRelationship', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select relationship" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PARENT">Parent</SelectItem>
                          <SelectItem value="GRANDPARENT">Grandparent</SelectItem>
                          <SelectItem value="AUNT">Aunt</SelectItem>
                          <SelectItem value="UNCLE">Uncle</SelectItem>
                          <SelectItem value="SIBLING">Sibling</SelectItem>
                          <SelectItem value="OTHER">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      type="tel"
                      value={formData.emergencyPhone}
                      onChange={(e) => {
                        let value = e.target.value.replace(/\D/g, '');
                        if (value.length > 0 && !value.startsWith('09')) {
                          if (value.startsWith('9')) {
                            value = '0' + value;
                          } else if (value.startsWith('63')) {
                            value = '0' + value.substring(2);
                          } else {
                            value = '09' + value;
                          }
                        }
                        if (value.length > 11) {
                          value = value.substring(0, 11);
                        }
                        handleInputChange('emergencyPhone', value);
                      }}
                      placeholder="09XX XXX XXXX"
                      pattern="09[0-9]{9}"
                      maxLength={11}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter Philippine mobile number starting with 09
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div className="border-t pt-6">
                <Label htmlFor="additionalNotes">Additional Notes</Label>
                <Textarea
                  id="additionalNotes"
                  value={formData.additionalNotes}
                  onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                  placeholder="Any additional information you'd like to share"
                  rows={3}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t">
                <Button type="submit" disabled={loading} className="px-8">
                  {loading ? 'Submitting...' : 'Submit Registration'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card>
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>
                <strong>Processing Time:</strong> Registration applications are typically reviewed within 3-5 business days.
              </p>
              <p>
                <strong>Requirements:</strong> Please ensure all information is accurate and up-to-date. You may be asked to provide additional documentation.
              </p>
              <p>
                <strong>Fees:</strong> Daycare services may have associated fees. You will be informed of any costs during the approval process.
              </p>
              <p>
                <strong>Updates:</strong> You will receive notifications about your application status via SMS and email.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}