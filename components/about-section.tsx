"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Target, Users, Lightbulb, TrendingUp } from "lucide-react"

export default function AboutSection() {
  const values = [
    {
      icon: Target,
      title: "Mission-Driven",
      description: "Transforming innovative ideas into successful businesses that drive Algeria's economic growth.",
    },
    {
      icon: Users,
      title: "Community-Focused",
      description: "Building a supportive ecosystem where entrepreneurs can connect, learn, and grow together.",
    },
    {
      icon: Lightbulb,
      title: "Innovation-First",
      description: "Fostering creativity and technological advancement to solve real-world problems.",
    },
    {
      icon: TrendingUp,
      title: "Growth-Oriented",
      description: "Providing scalable solutions and strategies for sustainable business expansion.",
    },
  ]

  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            About <span className="text-primary">ASI</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            The Algerian Startup Initiative is more than an incubator – we're a catalyst for innovation, dedicated to
            nurturing Algeria's entrepreneurial talent and building a thriving startup ecosystem.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-foreground">Our Story</h3>
            <p className="text-muted-foreground leading-relaxed">
              Founded with the vision of transforming Algeria's business landscape, ASI has been at the forefront of
              supporting innovative startups since our inception. We believe that every great company starts with a bold
              idea and the right support system.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our comprehensive approach combines mentorship, funding, workspace, and strategic partnerships to give
              startups the best chance of success. We've helped over 150 companies grow from concept to market leaders.
            </p>
          </div>
          <div className="relative">
            <img
              src="/placeholder.svg?height=400&width=500"
              alt="ASI Team"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
              <CardContent className="p-6 text-center">
                <div className="mb-4 inline-flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <value.icon className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-lg font-semibold text-foreground mb-2">{value.title}</h4>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
