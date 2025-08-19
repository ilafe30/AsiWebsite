import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Mail, Phone, MapPin, Clock, MessageSquare, Users, Briefcase, HelpCircle } from "lucide-react"

const contactReasons = [
  { value: "general", label: "General Inquiry", icon: <MessageSquare className="h-4 w-4" /> },
  { value: "program", label: "Program Application", icon: <Briefcase className="h-4 w-4" /> },
  { value: "partnership", label: "Partnership Opportunity", icon: <Users className="h-4 w-4" /> },
  { value: "support", label: "Support Request", icon: <HelpCircle className="h-4 w-4" /> },
]

const officeLocations = [
  {
    city: "Algiers",
    address: "123 Innovation Street, Algiers 16000",
    phone: "+213 (0) 21 XX XX XX",
    email: "algiers@asi-algeria.com",
    hours: "Sunday - Thursday: 9:00 AM - 6:00 PM",
  },
  {
    city: "Oran",
    address: "456 Startup Avenue, Oran 31000",
    phone: "+213 (0) 41 XX XX XX",
    email: "oran@asi-algeria.com",
    hours: "Sunday - Thursday: 9:00 AM - 6:00 PM",
  },
  {
    city: "Constantine",
    address: "789 Tech Boulevard, Constantine 25000",
    phone: "+213 (0) 31 XX XX XX",
    email: "constantine@asi-algeria.com",
    hours: "Sunday - Thursday: 9:00 AM - 6:00 PM",
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-serif">Contact Us</h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                Ready to start your entrepreneurial journey? Get in touch with our team and discover how ASI can help
                transform your innovative ideas into successful businesses.
              </p>
            </div>
          </div>
        </section>

        {/* Contact Form & Info */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Contact Form */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6 font-serif">Send us a Message</h2>
                <Card className="shadow-lg">
                  <CardHeader>
                    <CardTitle>Get in Touch</CardTitle>
                    <CardDescription>Fill out the form below and we'll get back to you within 24 hours</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input id="firstName" placeholder="Enter your first name" required />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input id="lastName" placeholder="Enter your last name" required />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" placeholder="Enter your email address" required />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" type="tel" placeholder="Enter your phone number" />
                    </div>

                    <div>
                      <Label htmlFor="company">Company/Organization</Label>
                      <Input id="company" placeholder="Enter your company name (optional)" />
                    </div>

                    <div>
                      <Label htmlFor="reason">Reason for Contact *</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          {contactReasons.map((reason) => (
                            <SelectItem key={reason.value} value={reason.value}>
                              <div className="flex items-center space-x-2">
                                {reason.icon}
                                <span>{reason.label}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        placeholder="Tell us about your startup idea, questions, or how we can help you..."
                        rows={6}
                        required
                      />
                    </div>

                    <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90 text-lg py-3">
                      Send Message
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-6 font-serif">Contact Information</h2>

                {/* Main Contact */}
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Mail className="h-5 w-5 mr-2 text-accent" />
                      General Contact
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground">info@asi-algeria.com</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-muted-foreground">+213 (0) 21 XX XX XX</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Business Hours</p>
                        <p className="text-muted-foreground">Sunday - Thursday: 9:00 AM - 6:00 PM</p>
                        <p className="text-muted-foreground">Friday: 9:00 AM - 2:00 PM</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Contact Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="bg-accent/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Briefcase className="h-8 w-8 text-accent" />
                      </div>
                      <h3 className="font-semibold mb-2">Program Applications</h3>
                      <p className="text-sm text-muted-foreground mb-3">Ready to apply to our programs?</p>
                      <Button variant="outline" size="sm">
                        Apply Now
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6 text-center">
                      <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <Users className="h-8 w-8 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Partnership Inquiries</h3>
                      <p className="text-sm text-muted-foreground mb-3">Interested in partnering with us?</p>
                      <Button variant="outline" size="sm">
                        Learn More
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Emergency Contact */}
                <Card className="bg-accent/5 border-accent/20">
                  <CardHeader>
                    <CardTitle className="text-accent">Need Immediate Assistance?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">
                      For urgent matters or time-sensitive opportunities, contact our emergency line:
                    </p>
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-accent" />
                      <div>
                        <p className="font-medium">Emergency Line</p>
                        <p className="text-accent font-semibold">+213 (0) 55 XX XX XX</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* Office Locations */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">Our Locations</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Visit us at any of our offices across Algeria
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {officeLocations.map((location) => (
                <Card key={location.city} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="h-5 w-5 mr-2 text-accent" />
                      {location.city}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="font-medium mb-1">Address</p>
                      <p className="text-muted-foreground text-sm">{location.address}</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Phone</p>
                      <p className="text-muted-foreground text-sm">{location.phone}</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Email</p>
                      <p className="text-muted-foreground text-sm">{location.email}</p>
                    </div>
                    <div>
                      <p className="font-medium mb-1">Hours</p>
                      <p className="text-muted-foreground text-sm">{location.hours}</p>
                    </div>
                    <Button variant="outline" className="w-full bg-transparent">
                      Get Directions
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-muted-foreground leading-relaxed">
                Quick answers to common questions about ASI and our programs
              </p>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How do I apply to ASI programs?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    You can apply through our online application portal. Visit our Programs page to see current
                    opportunities and application deadlines. The process typically involves submitting your business
                    plan, team information, and participating in an interview process.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What types of startups does ASI support?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We support startups across various sectors including technology, healthcare, fintech, e-commerce,
                    sustainability, and social impact. We're particularly interested in innovative solutions that
                    address local and regional challenges while having global scalability potential.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What support do you provide?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    We provide comprehensive support including mentorship, business development guidance, technical
                    resources, networking opportunities, and access to our partner ecosystem. Our programs focus on
                    helping startups scale and achieve sustainable growth.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How long are your programs?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Our main accelerator program runs for 12 weeks, while our incubation program can last 6-12 months
                    depending on the startup's needs. We also offer shorter intensive workshops and bootcamps throughout
                    the year.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
