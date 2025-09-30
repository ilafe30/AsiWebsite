"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log("Form submitted:", formData)
  }

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      details: "hello@asi-algeria.com",
      description: "Send us an email anytime",
    },
    {
      icon: Phone,
      title: "Phone",
      details: "+213 (0) 21 XX XX XX",
      description: "Mon-Fri from 8am to 6pm",
    },
    {
      icon: MapPin,
      title: "Office",
      details: "Algiers, Algeria",
      description: "Come visit our headquarters",
    },
    {
      icon: Clock,
      title: "Working Hours",
      details: "Mon-Fri: 8AM-6PM",
      description: "Saturday: 9AM-2PM",
    },
  ]

  return (
    <section id="contact" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
            Get In <span className="text-primary">Touch</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Ready to start your entrepreneurial journey? We'd love to hear from you and discuss how we can help bring
            your ideas to life.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Contact Form (first) */}
          <Card className="shadow-lg order-1">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Send us a message</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Full Name *</label>
                    <Input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">Email Address *</label>
                    <Input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Company/Startup Name</label>
                  <Input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Your company name (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Message *</label>
                  <Textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Tell us about your project or how we can help..."
                  />
                </div>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <div className="space-y-6 order-2">
            <div className="grid gap-6">
              {contactInfo.map((info, index) => (
                <Card key={index} className="group hover:shadow-md transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                          <info.icon className="h-6 w-6 text-primary group-hover:text-primary-foreground" />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-foreground mb-1">{info.title}</h4>
                        <p className="text-primary font-medium mb-1">{info.details}</p>
                        <p className="text-muted-foreground text-sm">{info.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Map placeholder: moved after the form on desktop by ordering */}
            <Card className="overflow-hidden">
              <div className="h-64 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="h-12 w-12 text-primary mx-auto mb-4" />
                  <p className="text-foreground font-medium">Interactive Map</p>
                  <p className="text-muted-foreground text-sm">Find us in Algiers</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
