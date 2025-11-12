import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  User,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Vote,
  FileText,
  CheckCircle2,
  Shield,
  Users,
  Clock,
  Check
} from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeToggle } from '@/components/theme-toggle';

interface ProfileFormData {
  // Personal Profile
  lastName: string;
  givenName: string;
  middleName: string;
  suffix: string;
  purokZone: string;
  barangay: string;
  cityMunicipality: string;
  province: string;
  region: string;
  birthday: string;
  age: string;
  sex: string;
  civilStatus: string;
  religion: string;
  contactNumber: string;
  emailAddress: string;
  password: string;
  confirmPassword: string;

  // Additional adult-specific fields
  workStatus: string;
  registeredSkVoter: string;
  registeredNationalVoter: string;
  votedLastSkElection: string;
  lgbtqCommunity: string;
  soloParent: boolean;
}

const STEPS = [
  { id: 1, title: 'Personal Profile', icon: User },
  { id: 2, title: 'Demographics', icon: GraduationCap },
];

const PHILIPPINE_REGIONS = [
  'Region I - Ilocos Region',
  'Region II - Cagayan Valley',
  'Region III - Central Luzon',
  'Region IV-A - CALABARZON',
  'Region IV-B - MIMAROPA',
  'Region V - Bicol Region',
  'Region VI - Western Visayas',
  'Region VII - Central Visayas',
  'Region VIII - Eastern Visayas',
  'Region IX - Zamboanga Peninsula',
  'Region X - Northern Mindanao',
  'Region XI - Davao Region',
  'Region XII - SOCCSKSARGEN',
  'Region XIII - Caraga',
  'NCR - National Capital Region',
  'CAR - Cordillera Administrative Region',
  'ARMM - Autonomous Region in Muslim Mindanao',
  'BARMM - Bangsamoro Autonomous Region in Muslim Mindanao'
];

export default function YouthRegistration() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentAgreed, setConsentAgreed] = useState(false);
  const [formData, setFormData] = useState<ProfileFormData>({
    lastName: '',
    givenName: '',
    middleName: '',
    suffix: '',
    purokZone: '',
    barangay: 'Binitayan',
    cityMunicipality: 'Daraga',
    province: 'Albay',
    region: 'Region V - Bicol Region',
    birthday: '',
    age: '',
    sex: '',
    civilStatus: '',
    religion: '',
    contactNumber: '',
    emailAddress: '',
    password: '',
    confirmPassword: '',
    workStatus: '',
    registeredSkVoter: '',
    registeredNationalVoter: '',
    votedLastSkElection: '',
    lgbtqCommunity: '',
    soloParent: false
  });

  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();

  // Auto-calculate age when birthday changes
  useEffect(() => {
    if (formData.birthday) {
      const birthDate = new Date(formData.birthday);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        setFormData(prev => ({ ...prev, age: (age - 1).toString() }));
      } else {
        setFormData(prev => ({ ...prev, age: age.toString() }));
      }
    }
  }, [formData.birthday]);

  // Check if user is 30 or above
  const isAgeThirtyOrAbove = parseInt(formData.age) >= 30;

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(
          formData.lastName &&
          formData.givenName &&
          formData.middleName &&
          formData.purokZone &&
          formData.barangay &&
          formData.cityMunicipality &&
          formData.province &&
          formData.region &&
          formData.birthday &&
          formData.sex &&
          formData.civilStatus &&
          formData.religion &&
          formData.contactNumber &&
          formData.emailAddress &&
          formData.password &&
          formData.confirmPassword &&
          proofFile
        );
      case 2:
        return !!(
          // Conditionally require work status and voter info for 30+ users
          (isAgeThirtyOrAbove ? 
            (formData.workStatus && 
             formData.registeredSkVoter && 
             formData.registeredNationalVoter && 
             formData.votedLastSkElection) : true)
        );
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (formData.password !== formData.confirmPassword) {
        toast.error('Passwords do not match');
        return;
      }

      const ageNum = parseInt(formData.age);
      if (isNaN(ageNum) || ageNum < 15) {
        toast.error('Age must be 15 or above');
        return;
      }

      if (!formData.contactNumber.match(/^09[0-9]{9}$/)) {
        toast.error('Invalid contact number format', {
          description: 'Please enter a valid Philippine mobile number (09XXXXXXXXX)'
        });
        return;
      }

      if (formData.password.length < 8) {
        toast.error('Password too short', {
          description: 'Password must be at least 8 characters long'
        });
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.emailAddress)) {
        toast.error('Invalid email format', {
          description: 'Please enter a valid email address'
        });
        return;
      }

      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(formData.lastName) || !nameRegex.test(formData.givenName) || !nameRegex.test(formData.middleName)) {
        toast.error('Invalid name format', {
          description: 'Names should only contain letters and spaces'
        });
        return;
      }
    }

    if (validateStep(currentStep)) {
      if (currentStep === STEPS.length) {
        setShowConsentModal(true);
      } else {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!consentAgreed) {
      toast.error('Please agree to the informed consent');
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();

      // Basic user data
      formDataToSend.append('email', formData.emailAddress);
      formDataToSend.append('password', formData.password);
      formDataToSend.append('firstName', formData.givenName);
      formDataToSend.append('lastName', formData.lastName);
      formDataToSend.append('middleName', formData.middleName);
      formDataToSend.append('suffix', formData.suffix);
      formDataToSend.append('contactNumber', formData.contactNumber);
      formDataToSend.append('role', 'PARENT_RESIDENT');
      formDataToSend.append('proofOfResidency', proofFile!);
      formDataToSend.append('consentAgreed', 'true');

      // Profile data
      const profileData = {
        purokZone: formData.purokZone,
        barangay: formData.barangay,
        cityMunicipality: formData.cityMunicipality,
        province: formData.province,
        region: formData.region,
        birthday: formData.birthday,
        age: parseInt(formData.age),
        sex: formData.sex,
        civilStatus: formData.civilStatus,
        religion: formData.religion,
        workStatus: formData.workStatus,
        registeredSkVoter: formData.registeredSkVoter === 'YES',
        registeredNationalVoter: formData.registeredNationalVoter === 'YES',
        votedLastSkElection: formData.votedLastSkElection === 'YES',
        lgbtqCommunity: formData.lgbtqCommunity === 'YES',
        soloParent: formData.soloParent
      };

      formDataToSend.append('profile', JSON.stringify(profileData));

      await registerUser(formDataToSend);

      toast.success('Registration successful!', {
        description: 'Your profile has been submitted and is pending approval.'
      });

      navigate('/login');
    } catch (err: any) {
      console.error('Registration error:', err);
      toast.error('Registration failed', {
        description: err.response?.data?.error || 'Please try again later.'
      });
    } finally {
      setLoading(false);
      setShowConsentModal(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Full Name</Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input
                      id="lastName"
                      placeholder="Dela Cruz"
                      value={formData.lastName}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Only letters and spaces
                        handleInputChange('lastName', value);
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="givenName">Given Name *</Label>
                    <Input
                      id="givenName"
                      placeholder="Juan"
                      value={formData.givenName}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Only letters and spaces
                        handleInputChange('givenName', value);
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="middleName">Middle Name *</Label>
                    <Input
                      id="middleName"
                      placeholder="Santos"
                      value={formData.middleName}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Only letters and spaces
                        handleInputChange('middleName', value);
                      }}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="suffix">Suffix (Optional)</Label>
                    <Input
                      id="suffix"
                      placeholder="Jr., Sr., III, IV"
                      value={formData.suffix}
                      onChange={(e) => handleInputChange('suffix', e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave blank if not applicable
                    </p>
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <Label className="text-base font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Address
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="purokZone">Purok/Zone *</Label>
                    <Input
                      id="purokZone"
                      placeholder="e.g., Purok 1, Zone 2"
                      value={formData.purokZone}
                      onChange={(e) => handleInputChange('purokZone', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="barangay">Barangay *</Label>
                    <Input
                      id="barangay"
                      value={formData.barangay}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cityMunicipality">City/Municipality *</Label>
                    <Input
                      id="cityMunicipality"
                      value={formData.cityMunicipality}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="province">Province *</Label>
                    <Input
                      id="province"
                      value={formData.province}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">Region *</Label>
                    <Input
                      id="region"
                      value={formData.region}
                      readOnly
                      className="bg-muted cursor-not-allowed"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Birth Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="birthday" className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Birthday *
                  </Label>
                  <Input
                    id="birthday"
                    type="date"
                    value={formData.birthday}
                    onChange={(e) => handleInputChange('birthday', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="age">Age *</Label>
                  <Input
                    id="age"
                    type="number"
                    min="15"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    required
                    readOnly
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Age is automatically calculated from birthday (15+ years old)
                  </p>
                </div>
              </div>

              {/* Sex */}
              <div>
                <Label className="text-base font-medium">Sex *</Label>
                <RadioGroup
                  value={formData.sex}
                  onValueChange={(value) => handleInputChange('sex', value)}
                  className="flex gap-6 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="Male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Civil Status */}
              <div>
                <Label className="text-base font-medium">Civil Status *</Label>
                <RadioGroup
                  value={formData.civilStatus}
                  onValueChange={(value) => handleInputChange('civilStatus', value)}
                  className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-2"
                >
                  {['Single', 'Married', 'Widowed', 'Separated', 'Annulled', 'Live-in'].map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <RadioGroupItem value={status} id={status.toLowerCase()} />
                      <Label htmlFor={status.toLowerCase()}>{status}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Contact & Religion */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="religion">Religion *</Label>
                  <Input
                    id="religion"
                    placeholder="e.g., Roman Catholic, Islam, Protestant"
                    value={formData.religion}
                    onChange={(e) => handleInputChange('religion', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="contactNumber">Contact Number *</Label>
                  <Input
                    id="contactNumber"
                    type="tel"
                    placeholder="09XX XXX XXXX"
                    value={formData.contactNumber}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, ''); // Remove non-digits

                      // Ensure it starts with 09
                      if (value.length > 0 && !value.startsWith('09')) {
                        if (value.startsWith('9')) {
                          value = '0' + value;
                        } else if (value.startsWith('63')) {
                          value = '0' + value.substring(2);
                        } else {
                          value = '09' + value;
                        }
                      }

                      // Limit to 11 digits (09XXXXXXXXX)
                      if (value.length > 11) {
                        value = value.substring(0, 11);
                      }

                      handleInputChange('contactNumber', value);
                    }}
                    pattern="09[0-9]{9}"
                    maxLength={11}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter Philippine mobile number starting with 09 (e.g., 09123456789)
                  </p>
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emailAddress">Email Address *</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    placeholder="you@example.com"
                    value={formData.emailAddress}
                    onChange={(e) => handleInputChange('emailAddress', e.target.value.toLowerCase())}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    minLength={8}
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Password must be at least 8 characters long
                  </p>
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                />
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="text-xs text-red-500 mt-1">
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Proof of Residence */}
              <div className="space-y-2">
                <Label htmlFor="proofOfResidence" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Proof of Residence *
                </Label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-4 hover:border-muted-foreground/50 transition-colors">
                  <Input
                    id="proofOfResidence"
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('File size must be less than 5MB');
                          return;
                        }
                        setProofFile(file);
                      }
                    }}
                    required
                    className="cursor-pointer"
                  />
                  {proofFile && (
                    <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                      <CheckCircle2 className="h-4 w-4" />
                      <span>{proofFile.name}</span>
                    </div>
                  )}
                </div>
                <div className="bg-muted/30 p-3 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Accepted Documents:</p>
                  <p className="text-xs text-muted-foreground">
                    • Barangay Certificate/Clearance • Utility Bills (Electric, Water, Internet)
                    <br />• Postal ID • Driver's License • Voter's ID • Any government-issued ID
                    <br />• Bank Statement • School Enrollment Form
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    <strong>File Requirements:</strong> JPG, PNG, or PDF format • Maximum 5MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );

      case 2:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Additional Information
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Additional information for adults
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Work Status - Only show for 30+ */}
              {isAgeThirtyOrAbove && (
                <div>
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Work Status *
                  </Label>
                  <RadioGroup
                    value={formData.workStatus}
                    onValueChange={(value) => handleInputChange('workStatus', value)}
                    className="space-y-2 mt-2"
                  >
                    {[
                      'Employed',
                      'Unemployed',
                      'Self-employed',
                      'Currently looking for a job',
                      'Not interested in looking for a job'
                    ].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <RadioGroupItem value={status} id={status} />
                        <Label htmlFor={status}>{status}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              )}

              {/* Voter Information - Only show for 30+ */}
              {isAgeThirtyOrAbove && (
                <div className="space-y-4">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Vote className="h-4 w-4" />
                    Voter Information
                  </Label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Label className="font-medium">Registered SK Voter? *</Label>
                      <RadioGroup
                        value={formData.registeredSkVoter}
                        onValueChange={(value) => handleInputChange('registeredSkVoter', value)}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="YES" id="sk-yes" />
                          <Label htmlFor="sk-yes">YES</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="NO" id="sk-no" />
                          <Label htmlFor="sk-no">NO</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="font-medium">Registered National Voter? *</Label>
                      <RadioGroup
                        value={formData.registeredNationalVoter}
                        onValueChange={(value) => handleInputChange('registeredNationalVoter', value)}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="YES" id="national-yes" />
                          <Label htmlFor="national-yes">YES</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="NO" id="national-no" />
                          <Label htmlFor="national-no">NO</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="font-medium">Did you vote last SK Election? *</Label>
                      <RadioGroup
                        value={formData.votedLastSkElection}
                        onValueChange={(value) => handleInputChange('votedLastSkElection', value)}
                        className="flex gap-4 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="YES" id="voted-yes" />
                          <Label htmlFor="voted-yes">YES</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="NO" id="voted-no" />
                          <Label htmlFor="voted-no">NO</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </div>
                </div>
              )}

              {/* LGBTQ+ - Always show */}
              <div>
                <Label className="font-medium">Are you part of LGBTQ+ Community? *</Label>
                <RadioGroup
                  value={formData.lgbtqCommunity}
                  onValueChange={(value) => handleInputChange('lgbtqCommunity', value)}
                  className="flex gap-4 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="YES" id="lgbtq-yes" />
                    <Label htmlFor="lgbtq-yes">YES</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NO" id="lgbtq-no" />
                    <Label htmlFor="lgbtq-no">NO</Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Solo Parent - Always show */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="soloParent"
                  checked={formData.soloParent}
                  onCheckedChange={(checked) =>
                    setFormData(prev => ({ ...prev, soloParent: checked as boolean }))
                  }
                />
                <Label htmlFor="soloParent" className="font-medium">Solo Parent</Label>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => navigate('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Button>
          <ThemeToggle />
        </div>

        {/* Main Content */}
        <div className="text-center mb-8">
          <Logo size="md" showText />
          <h1 className="text-3xl font-bold mt-4 mb-2">Registration</h1>
          <p className="text-muted-foreground">
            Register as a community member
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            {STEPS.map((step, index) => {
              const isCompleted = step.id < currentStep;
              const isActive = step.id === currentStep;
              const Icon = step.icon;

              return (
                <div key={step.id} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    isCompleted
                      ? 'bg-primary border-primary text-primary-foreground'
                      : isActive
                        ? 'border-primary text-primary'
                        : 'border-muted-foreground text-muted-foreground'
                  }`}>
                    {isCompleted ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      <Icon className="h-5 w-5" />
                    )}
                  </div>
                  <div className="ml-2 hidden sm:block">
                    <p className={`text-sm font-medium ${
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {step.title}
                    </p>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`w-12 h-0.5 mx-4 ${
                      isCompleted ? 'bg-primary' : 'bg-muted'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-muted/30 p-4 rounded-lg mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Step {currentStep} of {STEPS.length}</span>
            <span className="text-muted-foreground">
              {Math.round((currentStep / STEPS.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(currentStep / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <Button
            onClick={currentStep === STEPS.length ? handleNext : handleNext}
            className="gap-2"
          >
            {currentStep === STEPS.length ? 'Review & Submit' : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Consent Modal */}
      <Dialog open={showConsentModal} onOpenChange={setShowConsentModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center justify-center gap-2">
              <FileText className="h-6 w-6" />
              Informed Consent
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 p-4">
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="font-semibold">Title of Research:</p>
              <p className="mb-2">Community Profiling and Registration</p>

              <p className="font-semibold">Purpose:</p>
              <p className="mb-2">This system is designed to help our barangay community better serve residents by collecting demographic information and understanding community needs.</p>

              <p className="font-semibold">Consulting Agency:</p>
              <p className="mb-2">Barangay Hall Daraga, Albay</p>

              <div className="space-y-6">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  1. Voluntary Participation
                </h3>
                <p className="text-sm leading-relaxed">
                  Your participation in this registration is completely voluntary. You have the right to withdraw at any time without any consequences. By completing this registration, you consent to participate in the community profiling.
                </p>

                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  2. Confidentiality
                </h3>
                <p className="text-sm leading-relaxed">
                  All information you provide will be kept confidential and used solely for the purposes of community planning and service delivery. Personal information will not be shared with external parties without your consent.
                </p>

                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  3. Use of Information
                </h3>
                <p className="text-sm leading-relaxed">
                  The information you provide will be used to improve community services, plan programs that meet residents' needs, and communicate relevant information to you as a community member.
                </p>

                <h3 className="text-lg font-semibold mb-3">4. Data Storage</h3>
                <p className="text-sm leading-relaxed">
                  Your data will be securely stored and maintained according to applicable data protection regulations. You may request access to, correction of, or deletion of your personal information at any time.
                </p>

                <h3 className="text-lg font-semibold mb-3">5. Inquiries</h3>
                <p className="text-sm leading-relaxed mb-2">
                  For questions about this registration or your rights as a participant, please contact the Barangay Hall.
                </p>

                <p className="text-sm font-medium">
                  By clicking "I Agree", you confirm that you have read and understood this consent form and agree to participate in the community profiling.
                </p>
              </div>
            </div>

            <div className="border-2 border-primary/20 bg-primary/5 p-6 rounded-lg">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="consent"
                  checked={consentAgreed}
                  onCheckedChange={(checked) => setConsentAgreed(checked as boolean)}
                  className="mt-1"
                />
                <label
                  htmlFor="consent"
                  className="text-sm font-medium leading-relaxed cursor-pointer"
                >
                  I agree to the terms and consent to participate in the community registration process
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button
                variant="outline"
                onClick={() => setShowConsentModal(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!consentAgreed || loading}
                className="px-8"
              >
                {loading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Submitting...
                  </>
                ) : (
                  'Submit Registration'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}