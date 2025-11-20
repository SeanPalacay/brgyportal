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
  Heart,
  Trophy,
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

  // Demographic Characteristics (for under-30 users)
  youthAgeGroup: string;
  youthClassification: string;
  educationalBackground: string;
  workStatus: string;
  registeredSkVoter: string;
  registeredNationalVoter: string;
  votedLastSkElection: string;
  attendedSkAssembly: string;
  assemblyAttendanceCount: string;
  notAttendedReason: string;
  lgbtqCommunity: string;
  youthSpecificNeeds: string[];
  soloParent: boolean;
  others: boolean;
  othersSpecify: string;

  // Interests (for under-30 users)
  sports: string[];
  sportsOtherSpecify: string;
  hobbies: string[];
}

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

const PUROK_ZONES = [
  'Purok 1',
  'Purok 2',
  'Purok 3',
  'Purok 4',
  'Purok 5A',
  'Purok 5B',
  'Purok 6',
  'Purok 7',
  'Relocation site'
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
    youthAgeGroup: '',
    youthClassification: '',
    educationalBackground: '',
    workStatus: '',
    registeredSkVoter: '',
    registeredNationalVoter: '',
    votedLastSkElection: '',
    attendedSkAssembly: '',
    assemblyAttendanceCount: '',
    notAttendedReason: '',
    lgbtqCommunity: '',
    youthSpecificNeeds: [],
    soloParent: false,
    others: false,
    othersSpecify: '',
    sports: [],
    sportsOtherSpecify: '',
    hobbies: []
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

  // Define steps differently based on age
  const steps = isAgeThirtyOrAbove ? [
    { id: 1, title: 'Personal Profile', icon: User },
    { id: 2, title: 'Additional Information', icon: GraduationCap },
  ] : [
    { id: 1, title: 'Personal Profile', icon: User },
    { id: 2, title: 'Demographics', icon: GraduationCap },
    { id: 3, title: 'Interests', icon: Heart }
  ];

  const totalSteps = steps.length;

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof ProfileFormData, value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...(prev[field] as string[]), value]
        : (prev[field] as string[]).filter(item => item !== value)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Personal Profile - required for all users
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
      case 2: // Additional Information - different content based on age
        if (isAgeThirtyOrAbove) {
          // For 30+ users: Work Status and Voter Information
          return !!(
            formData.workStatus &&
            formData.registeredSkVoter &&
            formData.registeredNationalVoter &&
            formData.votedLastSkElection
          );
        } else {
          // For under-30 users: Youth Demographics
          return !!(
            formData.youthAgeGroup &&
            formData.youthClassification &&
            formData.educationalBackground &&
            formData.workStatus &&
            formData.registeredSkVoter &&
            formData.registeredNationalVoter &&
            formData.votedLastSkElection &&
            formData.attendedSkAssembly &&
            formData.lgbtqCommunity
          );
        }
      case 3: // Interests - only for under-30 users
        if (!isAgeThirtyOrAbove) {
          return true; // Interests are optional
        }
        return false; // This step should not exist for 30+ users
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
      if (isNaN(ageNum) || ageNum < 0) {
        toast.error('Age must be a valid number');
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
      if (currentStep === totalSteps) {
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
        youthAgeGroup: formData.youthAgeGroup,
        youthClassification: formData.youthClassification,
        educationalBackground: formData.educationalBackground,
        workStatus: formData.workStatus,
        registeredSkVoter: formData.registeredSkVoter === 'YES',
        registeredNationalVoter: formData.registeredNationalVoter === 'YES',
        votedLastSkElection: formData.votedLastSkElection === 'YES',
        attendedSkAssembly: formData.attendedSkAssembly === 'YES',
        assemblyAttendanceCount: formData.assemblyAttendanceCount,
        notAttendedReason: formData.notAttendedReason,
        lgbtqCommunity: formData.lgbtqCommunity === 'YES',
        youthSpecificNeeds: formData.youthSpecificNeeds,
        soloParent: formData.soloParent,
        others: formData.others,
        othersSpecify: formData.othersSpecify,
        sports: formData.sports,
        sportsOtherSpecify: formData.sportsOtherSpecify,
        hobbies: formData.hobbies
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
    if (isAgeThirtyOrAbove) {
      // 30+ users: Personal Profile + Additional Information (Work Status & Voter Info)
      switch (currentStep) {
        case 1: // Personal Profile
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
                      <Select
                        value={formData.purokZone}
                        onValueChange={(value) => handleInputChange('purokZone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Purok/Zone" />
                        </SelectTrigger>
                        <SelectContent>
                          {PUROK_ZONES.map((purok) => (
                            <SelectItem key={purok} value={purok}>
                              {purok}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      Age is automatically calculated from birthday
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

        case 2: // Additional Information for 30+ (Work Status & Voter Information)
          return (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Additional Information
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Additional information for adult community members
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Work Status */}
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

                {/* Voter Information */}
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

                {/* LGBTQ+ */}
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
              </CardContent>
            </Card>
          );

        default:
          return null;
      }
    } else {
      // Under-30 users: Full youth registration form
      switch (currentStep) {
        case 1: // Personal Profile
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
                      <Select
                        value={formData.purokZone}
                        onValueChange={(value) => handleInputChange('purokZone', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Purok/Zone" />
                        </SelectTrigger>
                        <SelectContent>
                          {PUROK_ZONES.map((purok) => (
                            <SelectItem key={purok} value={purok}>
                              {purok}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                      Age is automatically calculated from birthday
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

        case 2: // Youth Demographics
          return (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Demographic Characteristics
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Help us understand your background and current situation
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Youth Age Group */}
                <div className="bg-muted/30 p-4 rounded-lg">
                  <Label className="text-base font-medium">Youth Age Group *</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Select the age group that matches your current age
                  </p>
                  <RadioGroup
                    value={formData.youthAgeGroup}
                    onValueChange={(value) => handleInputChange('youthAgeGroup', value)}
                    className="space-y-2"
                  >
                    {[
                      'Child Youth (15-17 yrs old)',
                      'Core Youth (18-24 yrs old)',
                      'Young Adult (25-30 yrs old)'
                    ].map((group) => (
                      <div key={group} className="flex items-center space-x-2">
                        <RadioGroupItem value={group} id={group} />
                        <Label htmlFor={group}>{group}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Youth Classification */}
                <div>
                  <Label className="text-base font-medium">Youth Classification *</Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Select the category that best describes your current situation
                  </p>
                  <RadioGroup
                    value={formData.youthClassification}
                    onValueChange={(value) => {
                      handleInputChange('youthClassification', value);
                      // Update solo parent and others based on selection
                      if (value === 'Solo Parent') {
                        setFormData(prev => ({ ...prev, soloParent: true, others: false, othersSpecify: '' }));
                      } else if (value === 'Others') {
                        setFormData(prev => ({ ...prev, soloParent: false, others: true }));
                      } else {
                        setFormData(prev => ({ ...prev, soloParent: false, others: false, othersSpecify: '' }));
                      }
                    }}
                    className="space-y-3"
                  >
                    {[
                      { value: 'In-school youth', desc: 'Currently enrolled in school' },
                      { value: 'Out of school youth', desc: 'Not currently in school' },
                      { value: 'Working Youth', desc: 'Currently employed or working' },
                      { value: 'Teenage Parent', desc: 'Parent under 20 years old' },
                      { value: 'Solo Parent', desc: 'Single parent raising children alone' },
                    ].map((classification) => (
                      <div key={classification.value} className="flex items-start space-x-2 p-2 rounded border">
                        <RadioGroupItem
                          value={classification.value}
                          id={classification.value}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <Label htmlFor={classification.value} className="font-medium">{classification.value}</Label>
                          <p className="text-xs text-muted-foreground">{classification.desc}</p>
                        </div>
                      </div>
                    ))}

                    {/* Others option with text input */}
                    <div className="flex items-start space-x-2 p-2 rounded border">
                      <RadioGroupItem
                        value="Others"
                        id="Others"
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <Label htmlFor="Others" className="font-medium">Others</Label>
                        <p className="text-xs text-muted-foreground">Other classification not listed above</p>

                        {formData.youthClassification === 'Others' && (
                          <div className="mt-2">
                            <Label htmlFor="othersSpecify" className="text-sm">Please specify:</Label>
                            <Input
                              id="othersSpecify"
                              placeholder="Type here..."
                              value={formData.othersSpecify}
                              onChange={(e) => handleInputChange('othersSpecify', e.target.value)}
                              className="mt-1"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Educational Background */}
                <div>
                  <Label htmlFor="educationalBackground">Educational Background *</Label>
                  <Select
                    value={formData.educationalBackground}
                    onValueChange={(value) => handleInputChange('educationalBackground', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Educational Background" />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        'Elementary Level',
                        'Elementary Graduate',
                        'High School Level',
                        'High School Graduate',
                        'Vocational Graduate',
                        'College Level',
                        'College Graduate',
                        'Masters Level',
                        'Masters Graduate',
                        'Doctorate Level',
                        'Doctorate Graduate'
                      ].map((education) => (
                        <SelectItem key={education} value={education}>
                          {education}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Work Status */}
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

                {/* Voter Information */}
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

                {/* SK Assembly */}
                <div>
                  <Label className="font-medium">Have you attended SK Assembly? *</Label>
                  <RadioGroup
                    value={formData.attendedSkAssembly}
                    onValueChange={(value) => {
                      handleInputChange('attendedSkAssembly', value);
                      // Reset conditional fields
                      if (value === 'YES') {
                        handleInputChange('notAttendedReason', '');
                      } else {
                        handleInputChange('assemblyAttendanceCount', '');
                      }
                    }}
                    className="flex gap-4 mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="YES" id="assembly-yes" />
                      <Label htmlFor="assembly-yes">YES</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="NO" id="assembly-no" />
                      <Label htmlFor="assembly-no">NO</Label>
                    </div>
                  </RadioGroup>

                  {formData.attendedSkAssembly === 'YES' && (
                    <div className="mt-4">
                      <Label className="font-medium">How many times?</Label>
                      <RadioGroup
                        value={formData.assemblyAttendanceCount}
                        onValueChange={(value) => handleInputChange('assemblyAttendanceCount', value)}
                        className="space-y-2 mt-2"
                      >
                        {['1-2 times', '3-4 times', '5 and above'].map((count) => (
                          <div key={count} className="flex items-center space-x-2">
                            <RadioGroupItem value={count} id={count} />
                            <Label htmlFor={count}>{count}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}

                  {formData.attendedSkAssembly === 'NO' && (
                    <div className="mt-4">
                      <Label className="font-medium">Why not?</Label>
                      <RadioGroup
                        value={formData.notAttendedReason}
                        onValueChange={(value) => handleInputChange('notAttendedReason', value)}
                        className="space-y-2 mt-2"
                      >
                        {[
                          'There was no KK Assembly Meeting',
                          'Not interested to attend'
                        ].map((reason) => (
                          <div key={reason} className="flex items-center space-x-2">
                            <RadioGroupItem value={reason} id={reason} />
                            <Label htmlFor={reason}>{reason}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  )}
                </div>

                {/* LGBTQ+ */}
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

                {/* Specific Needs */}
                <div>
                  <Label className="text-base font-medium">Youth with specific needs (Select all that apply)</Label>
                  <div className="space-y-2 mt-2">
                    {[
                      'Person w/ Disability',
                      'Children in conflict w/ law',
                      'Indigenous People'
                    ].map((need) => (
                      <div key={need} className="flex items-center space-x-2">
                        <Checkbox
                          id={need}
                          checked={formData.youthSpecificNeeds.includes(need)}
                          onCheckedChange={(checked) =>
                            handleArrayChange('youthSpecificNeeds', need, checked as boolean)
                          }
                        />
                        <Label htmlFor={need}>{need}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );

        case 3: // Interests for under-30 users
          return (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5" />
                  Interests & Activities
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tell us about your hobbies and activities (Optional - helps us plan better programs)
                </p>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Sports */}
                <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200/50">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-blue-600" />
                    Sports & Physical Activities
                  </Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Select sports you enjoy playing or would like to participate in
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[
                      { value: 'Basketball', desc: 'Team sport, very popular' },
                      { value: 'Volleyball', desc: 'Team sport, indoor/outdoor' },
                      { value: 'Badminton', desc: 'Racket sport, singles/doubles' },
                      { value: "Other's", desc: 'Specify other sports you enjoy' }
                    ].map((sport) => (
                      <div key={sport.value} className="flex items-start space-x-2 p-2 rounded bg-white/50">
                        <Checkbox
                          id={sport.value}
                          checked={formData.sports.includes(sport.value)}
                          onCheckedChange={(checked) =>
                            handleArrayChange('sports', sport.value, checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div>
                          <Label htmlFor={sport.value} className="font-medium">{sport.value}</Label>
                          <p className="text-xs text-muted-foreground">{sport.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {formData.sports.includes("Other's") && (
                    <div className="mt-4">
                      <Label htmlFor="sportsOtherSpecify">Please specify other sports:</Label>
                      <Input
                        id="sportsOtherSpecify"
                        placeholder="e.g., Tennis, Swimming, etc."
                        value={formData.sportsOtherSpecify}
                        onChange={(e) => handleInputChange('sportsOtherSpecify', e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Hobbies */}
                <div className="bg-purple-50/50 p-4 rounded-lg border border-purple-200/50">
                  <Label className="text-base font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4 text-purple-600" />
                    Hobbies & Interests
                  </Label>
                  <p className="text-xs text-muted-foreground mb-3">
                    Select hobbies and interests you enjoy
                  </p>
                  <div className="space-y-3">
                    {[
                      { value: 'Dancing', desc: 'Traditional, modern, or any dance style' },
                      { value: 'Arts & Crafts', desc: 'Drawing, painting, handicrafts, DIY projects' },
                      { value: 'News Writing, Photography, Cartoonist', desc: 'Media, journalism, visual arts' },
                      { value: 'Cooking, Baking', desc: 'Culinary arts, food preparation' }
                    ].map((hobby) => (
                      <div key={hobby.value} className="flex items-start space-x-2 p-2 rounded bg-white/50">
                        <Checkbox
                          id={hobby.value}
                          checked={formData.hobbies.includes(hobby.value)}
                          onCheckedChange={(checked) =>
                            handleArrayChange('hobbies', hobby.value, checked as boolean)
                          }
                          className="mt-1"
                        />
                        <div>
                          <Label htmlFor={hobby.value} className="font-medium">{hobby.value}</Label>
                          <p className="text-xs text-muted-foreground">{hobby.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          );

        default:
          return null;
      }
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
            {steps.map((step, index) => {
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
                  {index < steps.length - 1 && (
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
            <span className="font-medium">Step {currentStep} of {steps.length}</span>
            <span className="text-muted-foreground">
              {Math.round((currentStep / steps.length) * 100)}% Complete
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mt-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300" 
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
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
            onClick={currentStep === steps.length ? handleNext : handleNext}
            className="gap-2"
          >
            {currentStep === steps.length ? 'Review & Submit' : 'Next'}
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