import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lightbulb, Target, Handshake, Award, Users, TrendingUp, Globe, Heart, ArrowRight } from "lucide-react"

const teamMembers = [
  {
    name: "Dr. Amina Benali",
    role: "Founder & CEO",
    bio: "Former tech executive with 15+ years in startup ecosystem development",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Karim Messaoudi",
    role: "Head of Programs",
    bio: "Serial entrepreneur and mentor with expertise in scaling startups",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Leila Hamidi",
    role: "Business Development Director",
    bio: "Strategic partnerships expert focused on expanding startup opportunities in MENA region",
    image: "/placeholder.svg?height=300&width=300",
  },
  {
    name: "Omar Khelifi",
    role: "Community Manager",
    bio: "Community builder passionate about connecting entrepreneurs",
    image: "/placeholder.svg?height=300&width=300",
  },
]

const milestones = [
  {
    year: "2020",
    title: "ASI Founded",
    description: "Established with a vision to transform Algeria's startup ecosystem",
  },
  { year: "2021", title: "First Cohort", description: "Launched our first accelerator program with 20 startups" },
  { year: "2022", title: "Growth Milestone", description: "Expanded programs to support 50+ startups annually" },
  { year: "2023", title: "Regional Expansion", description: "Extended programs to cover all major Algerian cities" },
  { year: "2024", title: "100+ Startups", description: "Reached milestone of supporting 100+ startups" },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/5 to-accent/5 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-serif">About ASI</h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
                We are Algeria's premier startup incubator and accelerator, dedicated to transforming innovative ideas
                into successful businesses that drive economic growth and create lasting impact across North Africa.
              </p>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6 font-serif">Our Mission</h2>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  To create a thriving startup ecosystem in Algeria by providing comprehensive support, resources, and
                  opportunities for entrepreneurs to transform their innovative ideas into successful, scalable
                  businesses.
                </p>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We believe in the power of entrepreneurship to drive economic growth, create jobs, and solve pressing
                  challenges facing our society. Through mentorship, funding, and strategic partnerships, we empower the
                  next generation of Algerian innovators.
                </p>
              </div>
              <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8">
                <h3 className="text-2xl font-bold text-foreground mb-4 font-serif">Our Vision</h3>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  To position Algeria as a leading startup hub in North Africa and the MENA region, fostering innovation
                  and entrepreneurship that contributes to sustainable economic development.
                </p>
                <div className="flex items-center space-x-4">
                  <div className="bg-accent/20 p-3 rounded-full">
                    <Globe className="h-6 w-6 text-accent" />
                  </div>
                  <span className="text-foreground font-medium">Global Impact, Local Roots</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">Our Core Values</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                These principles guide everything we do and shape our approach to supporting entrepreneurs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="bg-accent/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Lightbulb className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Innovation</h3>
                  <p className="text-muted-foreground">
                    Fostering creative solutions and cutting-edge thinking to solve real-world problems.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Target className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Excellence</h3>
                  <p className="text-muted-foreground">
                    Maintaining the highest standards in all our programs and services.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="bg-accent/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Handshake className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Collaboration</h3>
                  <p className="text-muted-foreground">
                    Building strong partnerships and fostering community among entrepreneurs.
                  </p>
                </CardContent>
              </Card>

              <Card className="text-center p-6 hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="bg-primary/10 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">Impact</h3>
                  <p className="text-muted-foreground">
                    Creating meaningful change that benefits society and the economy.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">Our Journey</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                From humble beginnings to becoming Algeria's leading startup accelerator
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 transform -translate-x-1/2 w-1 h-full bg-accent/20"></div>
              <div className="space-y-12">
                {milestones.map((milestone, index) => (
                  <div
                    key={milestone.year}
                    className={`flex items-center ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}
                  >
                    <div className={`w-1/2 ${index % 2 === 0 ? "pr-8 text-right" : "pl-8 text-left"}`}>
                      <Card className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <Badge className="bg-accent text-accent-foreground">{milestone.year}</Badge>
                          </div>
                          <CardTitle className="text-xl">{milestone.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{milestone.description}</p>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="relative z-10 flex items-center justify-center w-12 h-12 bg-accent rounded-full border-4 border-background">
                      <div className="w-4 h-4 bg-accent-foreground rounded-full"></div>
                    </div>
                    <div className="w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-20 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">Meet Our Team</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Experienced professionals dedicated to supporting Algeria's entrepreneurial ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <Card key={member.name} className="text-center hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted overflow-hidden">
                      <img
                        src={member.image || "/placeholder.svg"}
                        alt={member.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">{member.name}</h3>
                    <p className="text-accent font-medium mb-3">{member.role}</p>
                    <p className="text-sm text-muted-foreground">{member.bio}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4 font-serif">Our Impact</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                Numbers that reflect our commitment to Algeria's startup ecosystem
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <div className="bg-accent/10 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-4xl font-bold text-foreground mb-2">150+</h3>
                <p className="text-muted-foreground">Startups Supported</p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Users className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-4xl font-bold text-foreground mb-2">500+</h3>
                <p className="text-muted-foreground">Entrepreneurs Mentored</p>
              </div>

              <div className="text-center">
                <div className="bg-accent/10 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Award className="h-10 w-10 text-accent" />
                </div>
                <h3 className="text-4xl font-bold text-foreground mb-2">85%</h3>
                <p className="text-muted-foreground">Success Rate</p>
              </div>

              <div className="text-center">
                <div className="bg-primary/10 p-6 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Globe className="h-10 w-10 text-primary" />
                </div>
                <h3 className="text-4xl font-bold text-foreground mb-2">25+</h3>
                <p className="text-muted-foreground">Partner Organizations</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 font-serif">Ready to Join Our Community?</h2>
            <p className="text-xl text-primary-foreground/80 mb-8 leading-relaxed">
              Whether you're an aspiring entrepreneur, seasoned founder, or potential partner, we'd love to hear from
              you and explore how we can work together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Apply to Programs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
              >
                Get in Touch
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
