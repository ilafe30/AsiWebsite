"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Rocket, DollarSign, Users, BookOpen, Network, Briefcase } from "lucide-react"

export default function ServicesSection() {
  const services = [
    {
      icon: Rocket,
      title: "Startup Incubation",
      description:
        "From idea validation to product development, we guide startups through every stage of their journey.",
      features: ["Business Model Development", "Product-Market Fit", "Go-to-Market Strategy"],
    },
    {
      icon: DollarSign,
      title: "Funding Support",
      description: "Connect with investors and access funding opportunities tailored to your startup's needs.",
      features: ["Seed Funding", "Series A Preparation", "Investor Matching"],
    },
    {
      icon: Users,
      title: "Mentorship Program",
      description: "Learn from experienced entrepreneurs and industry experts who've built successful companies.",
      features: ["1-on-1 Mentoring", "Industry Expertise", "Strategic Guidance"],
    },
    {
      icon: Network,
      title: "Business Development",
      description: "Strategic support to help scale your business and expand into new markets.",
      features: ["Market Analysis", "Partnership Development", "Growth Strategy"],
    },
    {
      icon: BookOpen,
      title: "Educational Workshops",
      description: "Comprehensive training programs covering all aspects of building and scaling a business.",
      features: ["Leadership Training", "Technical Skills", "Business Development"],
    },
    {
      icon: Users,
      title: "Networking Events",
      description: "Connect with fellow entrepreneurs, investors, and industry leaders in our vibrant community.",
      features: ["Monthly Meetups", "Industry Conferences", "Community Building"],
    },
    {
      icon: Briefcase,
      title: "Co-working Space",
      description: "Modern, collaborative workspace designed to foster creativity and productivity.",
      features: ["24/7 Access", "Meeting Rooms", "High-Speed Internet"],
    },
  ]

  return (
    <section id="services" className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Our <span className="text-primary">Services</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Comprehensive support services designed to accelerate your startup's growth and success.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card
              key={index}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-border hover:border-primary/20"
            >
              <CardHeader>
                <div className="mb-4 inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <service.icon className="h-7 w-7 text-primary group-hover:text-primary-foreground" />
                </div>
                <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-accent rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300 bg-transparent"
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
