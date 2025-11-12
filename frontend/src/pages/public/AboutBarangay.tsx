import { useNavigate } from 'react-router-dom';
import PublicLayout from '@/components/PublicLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, Users, Heart, Baby, 
  Calendar, Award, Building, Shield, Landmark, FileText,
  ArrowRight, Sparkles
} from 'lucide-react';



export default function AboutBarangay() {
  const navigate = useNavigate();





  return (
    <PublicLayout>
      <main className="flex-1">
        <div className="container mx-auto px-4 md:px-6 py-8 space-y-16">
        {/* Hero Section */}
        <section className="relative w-full py-16 md:py-24 lg:py-32 overflow-hidden bg-muted/30">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
            <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
          </div>

          <Card className="relative overflow-hidden border-0 shadow-2xl max-w-6xl mx-auto">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-background" />
            <div className="absolute inset-0 bg-grid-white/5 bg-[size:20px_20px]" />
            <CardContent className="relative p-6 md:p-8 lg:p-12">
              <div className="text-center space-y-6 md:space-y-8 mb-8">
                <Badge className="w-fit mx-auto" variant="secondary">
                  <Sparkles className="mr-2 h-4 w-4" />
                  About Barangay Binitayan
                </Badge>

                <div className="flex items-center justify-center w-28 h-28 md:w-32 md:h-32 bg-card rounded-3xl border shadow-2xl mx-auto">
                  <img src="/binitayanlogo.png" alt="Barangay Binitayan Logo" className="w-24 h-24 md:w-28 md:h-28 object-contain" />
                </div>

                <div className="space-y-4">
                  <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
                    Barangay
                    <span className="block text-primary">
                      Binitayan
                    </span>
                  </h1>

                  <div className="max-w-4xl mx-auto space-y-4">
                    <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
                      A vibrant rural barangay located in the municipality of Daraga, Province of Albay, Bicol Region.
                    </p>
                    <p className="text-muted-foreground leading-relaxed">
                      Known for its scenic views of Mayon Volcano, rich historical heritage, and strong community spirit rooted in agricultural traditions.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card border hover:shadow-md transition-shadow duration-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">6,451</div>
                  <span className="text-xs font-medium text-center text-muted-foreground">Population</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card border hover:shadow-md transition-shadow duration-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">117 km</div>
                  <span className="text-xs font-medium text-center text-muted-foreground">from Town</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card border hover:shadow-md transition-shadow duration-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">1957</div>
                  <span className="text-xs font-medium text-center text-muted-foreground">Established</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card border hover:shadow-md transition-shadow duration-300">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <div className="text-2xl font-bold">1,649</div>
                  <span className="text-xs font-medium text-center text-muted-foreground">Households</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact Information */}
        {/* {barangayInfo && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium">Address</div>
                      <div className="text-muted-foreground">{barangayInfo.address}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium">Phone</div>
                      <div className="text-muted-foreground">{barangayInfo.phone}</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium">Email</div>
                      <div className="text-muted-foreground">{barangayInfo.email}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-muted-foreground mt-1" />
                    <div>
                      <div className="font-medium">Office Hours</div>
                      <div className="text-muted-foreground">{barangayInfo.officeHours}</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Barangay Officials */}
        {/* {officials.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Barangay Officials</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {officials.map((official) => (
                  <div key={official.id} className="text-center p-6 border rounded-lg">
                    <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                      <Users className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold mb-1">{official.name}</h3>
                    <p className="text-sm text-primary font-medium mb-1">{official.position}</p>
                    <p className="text-xs text-muted-foreground">Term: {official.term}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )} */}

        {/* Barangay Officials */}
        <section className="w-full py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <Badge variant="outline">Leadership</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Barangay
                <span className="block text-primary">Officials</span>
              </h2>
              <p className="max-w-[800px] text-muted-foreground text-lg">
                Current leadership of Barangay Binitayan committed to serving our community.
              </p>
            </div>

            <Card className="border-0 shadow-lg max-w-6xl mx-auto">
              <CardContent className="px-8 pb-8">
            
            <div className="space-y-8">
              {/* Punong Barangay */}
              <div className="flex justify-center mb-8">
                <Card className="border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6 text-center min-w-[280px]">
                    <div className="w-20 h-20 bg-primary rounded-2xl mx-auto mb-4 flex items-center justify-center">
                      <Shield className="h-10 w-10 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold text-primary mb-1">MICHAEL L. RODRIGUEZA</h3>
                    <Badge variant="secondary" className="mt-2">Punong Barangay</Badge>
                  </CardContent>
                </Card>
              </div>
              <Separator className="mb-8" />

              {/* Barangay Kagawads */}
              <div>
                <div className="text-center mb-6">
                  <h4 className="text-xl font-semibold mb-3">Sangguniang Barangay</h4>
                  <Badge variant="outline" className="text-sm">Barangay Kagawads</Badge>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">PAUL KRISTIAN ANDES</h4>
                      <Badge variant="outline" className="text-xs">Ways and Means</Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <Building className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">EDWIN LL. LOMA</h4>
                      <Badge variant="outline" className="text-xs">Infrastructure</Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <Shield className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">RAYMOND MAPA</h4>
                      <Badge variant="outline" className="text-xs">Peace & Order</Badge>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">ROGEL L. MAPA</h4>
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">Education & Skills</Badge>
                        <Badge variant="outline" className="text-xs">Transportation</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">RODRIGO C. BOOTAN</h4>
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">Cooperatives</Badge>
                        <Badge variant="outline" className="text-xs">Agriculture</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <Heart className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">SHERYL M. BANDA</h4>
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">Health & Sanitation</Badge>
                        <Badge variant="outline" className="text-xs">Women & Family</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <h4 className="font-semibold mb-2">JULIUS J. MARTINEZ</h4>
                      <div className="space-y-1">
                        <Badge variant="outline" className="text-xs">Finance</Badge>
                        <Badge variant="outline" className="text-xs">Senior & PWD</Badge>
                        <Badge variant="outline" className="text-xs">ICT</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <Separator className="my-8" />
              
              {/* SK Chairman and Administrative Staff */}
              <div>
                <div className="text-center mb-6">
                  <h4 className="text-xl font-semibold mb-3">Administrative Staff</h4>
                  <Badge variant="outline" className="text-sm">Key Personnel</Badge>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                  {/* SK Chairman */}
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-green-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <Heart className="h-8 w-8 text-green-600" />
                      </div>
                      <h4 className="font-semibold mb-2">GIAN FRANCO A. TIRADOR</h4>
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-200">SK Chairman</Badge>
                    </CardContent>
                  </Card>
                  
                  {/* Barangay Secretary */}
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <FileText className="h-8 w-8 text-blue-600" />
                      </div>
                      <h4 className="font-semibold mb-2">AIRA DE LA TORRE</h4>
                      <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Secretary</Badge>
                    </CardContent>
                  </Card>
                  
                  {/* Barangay Treasurer */}
                  <Card className="hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-6 text-center">
                      <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <Building className="h-8 w-8 text-purple-600" />
                      </div>
                      <h4 className="font-semibold mb-2">GEMMA BAEZA</h4>
                      <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-200">Treasurer</Badge>
                    </CardContent>
                  </Card>
                </div>
              </div>
              </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Historical Background */}
        <section className="w-full py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <Badge variant="outline">Heritage</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Historical
                <span className="block text-primary">Background</span>
              </h2>
              <p className="max-w-[800px] text-muted-foreground text-lg">
                A community steeped in history and rich cultural heritage.
              </p>
            </div>

            <div className="max-w-5xl mx-auto">
              <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-start gap-6">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0">
                      <FileText className="h-8 w-8 text-primary-foreground" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold mb-4">Historical Origin</h3>
                      <p className="text-muted-foreground leading-relaxed text-lg">
                        The name "Binitayan" originates from a tragic historical event during the Spanish colonial era. 
                        An innocent, intelligent man was unjustly imprisoned, tortured, and ultimately executed by hanging in the area. 
                        The place where he was hanged became known as "Binitayan," a name the community carries to this day as a reminder of its historical heritage.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Location & Geography */}
        <section className="w-full py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <Badge variant="outline">Geography</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Location &
                <span className="block text-primary">Geography</span>
              </h2>
              <p className="max-w-[800px] text-muted-foreground text-lg">
                Geographic and administrative information about our barangay.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 max-w-6xl mx-auto">
              <Card className="hover:shadow-xl transition-all duration-300 hover:border-primary/50">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Administrative Division
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">Municipality:</span>
                        <Badge variant="secondary">Daraga</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">Province:</span>
                        <Badge variant="secondary">Albay</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">Region:</span>
                        <Badge variant="secondary">Bicol Region (V)</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">Distance from Town:</span>
                        <Badge variant="secondary">117 Kilometers</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Boundaries
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">North:</span>
                        <Badge variant="outline">Malobago</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">East:</span>
                        <Badge variant="outline">Tagas</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">West:</span>
                        <Badge variant="outline">Bañag</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">South:</span>
                        <Badge variant="outline">Market Site</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Building className="h-5 w-5 text-primary" />
                      Community Structure
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">Main Puroks:</span>
                        <Badge variant="outline">8 Zones</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">Additional Villages:</span>
                        <Badge variant="outline">5 Villages</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">Special Areas:</span>
                        <Badge variant="outline">COPE/GK, Compassion, DSWD</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-xl transition-all duration-300 hover:border-primary/50">
                <CardContent className="p-6 space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Landmark className="h-5 w-5 text-primary" />
                      Geographic Features
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">Elevation:</span>
                        <Badge variant="secondary">29.5m above sea level</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">Climate:</span>
                        <Badge variant="secondary">Tropical, Type II</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">Land Type:</span>
                        <Badge variant="secondary">Nearly Level, Fertile</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">Primary Products:</span>
                        <Badge variant="secondary">Rice & Vegetables</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">Local Industries:</span>
                        <Badge variant="secondary">Abaca Weaving</Badge>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      Demographics (2020)
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">Population (2024):</span>
                        <Badge variant="outline">6,451 residents</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">Households:</span>
                        <Badge variant="outline">1,649 families</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">Male Population:</span>
                        <Badge variant="outline">3,135 (48.6%)</Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-background/50 rounded-lg">
                        <span className="text-muted-foreground">Female Population:</span>
                        <Badge variant="outline">3,316 (51.4%)</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
 

        {/* Services */}
        <section className="w-full py-16 md:py-24 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center text-center space-y-4 mb-12">
              <Badge variant="outline">Services</Badge>
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                Community
                <span className="block text-primary">Services</span>
              </h2>
              <p className="max-w-[800px] text-muted-foreground text-lg">
                Comprehensive community services designed to serve all residents of Barangay Binitayan.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary/50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md">
                      <Heart className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <Badge variant="secondary" className="text-xs">Healthcare</Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Health Services</h3>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive healthcare including prenatal care, immunizations, and health monitoring
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2 p-0 h-auto hover:text-primary">
                    Learn more
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary/50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md">
                      <Baby className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <Badge variant="secondary" className="text-xs">Education</Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">Daycare Services</h3>
                    <p className="text-sm text-muted-foreground">
                      Early childhood education and care for children aged 3-5 years
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2 p-0 h-auto hover:text-primary">
                    Learn more
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
              
              <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300 hover:border-primary/50">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary shadow-md">
                      <Calendar className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <Badge variant="secondary" className="text-xs">Youth Development</Badge>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold">SK Programs</h3>
                    <p className="text-sm text-muted-foreground">
                      Youth development programs and community engagement activities
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-2 p-0 h-auto hover:text-primary">
                    Learn more
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="w-full py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <Card className="shadow-xl max-w-5xl mx-auto">
              <CardContent className="p-8 md:p-12">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-4">
                    <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                      Ready to Join
                      <span className="block text-primary">Our Community?</span>
                    </h2>
                    <p className="text-muted-foreground text-lg">
                      Join our digital community and access all barangay services online. 
                      Register today to schedule appointments, enroll in daycare, and stay updated with community events.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 lg:justify-end">
                    <Button
                      size="lg"
                      onClick={() => navigate('/register')}
                      className="gap-2"
                    >
                      Register Now
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => navigate('/login')}>
                      Sign In
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
      </main>
    </PublicLayout>
  );
}