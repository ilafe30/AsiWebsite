"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, ArrowRight, TrendingUp, Users, Award, Rocket } from "lucide-react"

const newsArticles = [
  {
    id: 1,
    title: "ASI Launches New Accelerator Program for Tech Startups",
    excerpt:
      "The Algerian Startup Initiative introduces an intensive 12-week accelerator program focusing on technology startups, providing mentorship, resources, and market access.",
    category: "Programs",
    date: "2024-01-15",
    readTime: "3 min read",
    image: "/placeholder.svg?height=200&width=400&text=Tech+Accelerator+Program",
    featured: true,
    icon: <TrendingUp className="h-5 w-5" />,
  },
  {
    id: 2,
    title: "Success Story: TechStart Algeria Expands to International Markets",
    excerpt:
      "One of ASI's portfolio companies, TechStart Algeria, successfully launches in three new international markets, showcasing the global potential of Algerian startups.",
    category: "Success Story",
    date: "2024-01-12",
    readTime: "4 min read",
    image: "/placeholder.svg?height=200&width=400&text=Success+Story",
    featured: true,
    icon: <Award className="h-5 w-5" />,
  },
  {
    id: 3,
    title: "Upcoming: Algeria Startup Summit 2024",
    excerpt:
      "Join us for the biggest startup event in Algeria, featuring international speakers, investor panels, and networking opportunities for entrepreneurs.",
    category: "Events",
    date: "2024-01-10",
    readTime: "2 min read",
    image: "/placeholder.svg?height=200&width=400&text=Startup+Summit+2024",
    featured: false,
    icon: <Users className="h-5 w-5" />,
  },
  {
    id: 4,
    title: "New Accelerator Program: FinTech Focus",
    excerpt:
      "ASI launches a specialized 12-week accelerator program dedicated to financial technology startups, partnering with leading banks and financial institutions.",
    category: "Programs",
    date: "2024-01-08",
    readTime: "5 min read",
    image: "/placeholder.svg?height=200&width=400&text=FinTech+Program",
    featured: false,
    icon: <Rocket className="h-5 w-5" />,
  },
]

export default function NewsSection() {
  const featuredArticles = newsArticles.filter((article) => article.featured)
  const regularArticles = newsArticles.filter((article) => !article.featured)

  return (
    <section id="news" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-6 font-serif">News & Updates</h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Stay informed about the latest developments in Algeria's startup ecosystem, success stories, and upcoming
            events.
          </p>
        </div>

        {/* Featured Articles */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-8 font-serif">Featured Stories</h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {featuredArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-accent text-accent-foreground">
                      {article.icon}
                      <span className="ml-1">{article.category}</span>
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-xl group-hover:text-accent transition-colors">{article.title}</CardTitle>
                  <CardDescription className="text-base leading-relaxed">{article.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(article.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        {article.readTime}
                      </div>
                    </div>
                  </div>
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Read More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Regular Articles */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground mb-8 font-serif">Latest Updates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {regularArticles.map((article) => (
              <Card key={article.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                <div className="aspect-video bg-muted relative overflow-hidden">
                  <img
                    src={article.image || "/placeholder.svg"}
                    alt={article.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4">
                    <Badge variant="secondary" className="bg-card/90 text-foreground">
                      {article.icon}
                      <span className="ml-1">{article.category}</span>
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-accent transition-colors line-clamp-2">
                    {article.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">{article.excerpt}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(article.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      {article.readTime}
                    </div>
                  </div>
                  <Button variant="outline" className="w-full bg-transparent">
                    Read More
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-primary text-primary-foreground rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-4 font-serif">Stay Updated</h3>
          <p className="text-lg text-primary-foreground/80 mb-6">
            Subscribe to our newsletter and never miss important updates about Algeria's startup ecosystem.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-4 py-3 rounded-lg text-foreground bg-background border-0 focus:ring-2 focus:ring-accent"
            />
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 px-6 py-3">Subscribe</Button>
          </div>
        </div>
      </div>
    </section>
  )
}
