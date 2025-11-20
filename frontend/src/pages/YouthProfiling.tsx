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
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  MapPin,
  Calendar,
  GraduationCap,
  Briefcase,
  Vote,
  Heart,
  Trophy,
  FileText,
  CheckCircle2
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
  
  // Demographic Characteristics
  youthAgeGroup: string;
  youthClassification: string[];
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
  
  // Interests
  sports: string[];
  sportsOtherSpecify: string;
  hobbies: string[];
}

export default function YouthProfiling() {
  const [formData, setFormData] = useState<ProfileFormData>({
    lastName: '',
    givenName: '',
    middleName: '',
    suffix: '',
    purokZone: '',
    barangay: '',
    cityMunicipality: '',
    province: '',
    region: '',
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
    youthClassification: [],
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (!proofFile) {
      toast.error('Proof of residence is required');
      return;
    }

    // Validate age range (15-30)
    const age = parseInt(formData.age);
    if (age < 15 || age > 30) {
      toast.error('Age must be between 15 and 30 years old');
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
      formDataToSend.append('proofOfResidency', proofFile);
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
            onClick={() => navigate('/register/consent')}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Consent
          </Button>
          <ThemeToggle />
        </div>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <Logo size="lg" showText />
          <h1 className="text-3xl font-bold mt-4 mb-2">Youth Profiling Form</h1>
          <p className="text-muted-foreground">
            Complete your profile information for KK registration
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* I. PERSONAL PROFILE */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                I. Personal Profile
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
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="givenName">Given Name *</Label>
                    <Input
                      id="givenName"
                      value={formData.givenName}
                      onChange={(e) => handleInputChange('givenName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="middleName">Middle Name *</Label>
                    <Input
                      id="middleName"
                      value={formData.middleName}
                      onChange={(e) => handleInputChange('middleName', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="suffix">Suffix</Label>
                    <Input
                      id="suffix"
                      placeholder="Jr., Sr., III"
                      value={formData.suffix}
                      onChange={(e) => handleInputChange('suffix', e.target.value)}
                    />
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
                      onChange={(e) => handleInputChange('barangay', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="cityMunicipality">City/Municipality *</Label>
                    <Input
                      id="cityMunicipality"
                      value={formData.cityMunicipality}
                      onChange={(e) => handleInputChange('cityMunicipality', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="province">Province *</Label>
                    <Input
                      id="province"
                      value={formData.province}
                      onChange={(e) => handleInputChange('province', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="region">Region *</Label>
                    <Input
                      id="region"
                      value={formData.region}
                      onChange={(e) => handleInputChange('region', e.target.value)}
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
                    max="30"
                    value={formData.age}
                    onChange={(e) => handleInputChange('age', e.target.value)}
                    required
                    readOnly
                  />
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
                    value={formData.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email & Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="emailAddress">Email Address *</Label>
                  <Input
                    id="emailAddress"
                    type="email"
                    value={formData.emailAddress}
                    onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  required
                />
              </div>

              {/* Proof of Residence */}
              <div>
                <Label htmlFor="proofOfResidence" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Proof of Residence *
                </Label>
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
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Accepted: Postal ID, Driver's License, Barangay ID, Voter's ID, etc. (Max 5MB)
                </p>
                {proofFile && (
                  <div className="flex items-center gap-2 text-sm text-green-600 mt-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>{proofFile.name}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* II. DEMOGRAPHIC CHARACTERISTICS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                II. Demographic Characteristics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Youth Age Group */}
              <div>
                <Label className="text-base font-medium">Youth Age Group *</Label>
                <RadioGroup
                  value={formData.youthAgeGroup}
                  onValueChange={(value) => handleInputChange('youthAgeGroup', value)}
                  className="space-y-2 mt-2"
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
                <Label className="text-base font-medium">Youth Classification (Select all that apply)</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {[
                    'In-school youth',
                    'Out of school youth',
                    'Working Youth',
                    'Teenage Parent'
                  ].map((classification) => (
                    <div key={classification} className="flex items-center space-x-2">
                      <Checkbox
                        id={classification}
                        checked={formData.youthClassification.includes(classification)}
                        onCheckedChange={(checked) => 
                          handleArrayChange('youthClassification', classification, checked as boolean)
                        }
                      />
                      <Label htmlFor={classification}>{classification}</Label>
                    </div>
                  ))}
                </div>
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

              {/* Solo Parent */}
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

          {/* III. INTERESTS */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5" />
                III. Interests
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sports */}
              <div>
                <Label className="text-base font-medium flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Sports (Select all that apply)
                </Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  {['Basketball', 'Volleyball', 'Badminton', "Other's"].map((sport) => (
                    <div key={sport} className="flex items-center space-x-2">
                      <Checkbox
                        id={sport}
                        checked={formData.sports.includes(sport)}
                        onCheckedChange={(checked) => 
                          handleArrayChange('sports', sport, checked as boolean)
                        }
                      />
                      <Label htmlFor={sport}>{sport}</Label>
                    </div>
                  ))}
                </div>

                {formData.sports.includes("Other's") && (
                  <div className="mt-4">
                    <Label htmlFor="sportsOtherSpecify">Please specify other sports:</Label>
                    <Input
                      id="sportsOtherSpecify"
                      value={formData.sportsOtherSpecify}
                      onChange={(e) => handleInputChange('sportsOtherSpecify', e.target.value)}
                    />
                  </div>
                )}
              </div>

              {/* Hobbies */}
              <div>
                <Label className="text-base font-medium">Hobbies (Select all that apply)</Label>
                <div className="space-y-2 mt-2">
                  {[
                    'Dancing',
                    'Arts & Crafts',
                    'News Writing, Photography, Cartoonist',
                    'Cooking, Baking'
                  ].map((hobby) => (
                    <div key={hobby} className="flex items-center space-x-2">
                      <Checkbox
                        id={hobby}
                        checked={formData.hobbies.includes(hobby)}
                        onCheckedChange={(checked) => 
                          handleArrayChange('hobbies', hobby, checked as boolean)
                        }
                      />
                      <Label htmlFor={hobby}>{hobby}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="text-center">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="px-12"
            >
              {loading ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  Submitting Profile...
                </>
              ) : (
                'Submit Profile'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}