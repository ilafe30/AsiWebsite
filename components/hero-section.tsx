"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import { useState, useEffect } from "react"

// Define fixed particle positions to avoid hydration mismatch
const particlePositions = [
  { left: 15.2, top: 23.4, delay: 1.2 },
  { left: 67.8, top: 45.1, delay: 2.8 },
  { left: 34.5, top: 78.9, delay: 0.5 },
  { left: 89.1, top: 12.3, delay: 3.4 },
  { left: 23.7, top: 56.8, delay: 1.9 },
  { left: 78.2, top: 89.4, delay: 2.1 },
  { left: 45.9, top: 34.7, delay: 0.8 },
  { left: 12.6, top: 67.2, delay: 3.7 },
  { left: 91.3, top: 43.8, delay: 1.5 },
  { left: 58.4, top: 21.6, delay: 2.9 },
  { left: 76.7, top: 65.3, delay: 0.3 },
  { left: 29.8, top: 82.1, delay: 3.2 }
];

export default function HeroSection() {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* Main gradient background */}
        <div
          className="absolute inset-0 animate-gradient-shift"
          style={{
            background: `linear-gradient(135deg, #003255 0%, #002a4a 25%, #003f66 50%, #002a4a 75%, #003255 100%)`,
            backgroundSize: "400% 400%",
          }}
        />

        {/* Dynamic Wave Layer 1 */}
        <div
          className="absolute inset-0 animate-wave-float-1"
          style={{
            background: `radial-gradient(ellipse at 20% 50%, #003f66 0%, transparent 50%), 
                        radial-gradient(ellipse at 80% 20%, #002a4a 0%, transparent 50%),
                        radial-gradient(ellipse at 40% 80%, #003255 0%, transparent 50%)`,
          }}
        />

        {/* Dynamic Wave Layer 2 */}
        <div
          className="absolute inset-0 animate-wave-float-2"
          style={{
            background: `radial-gradient(ellipse at 60% 30%, #003f66 0%, transparent 60%), 
                        radial-gradient(ellipse at 10% 70%, #002a4a 0%, transparent 60%),
                        radial-gradient(ellipse at 90% 60%, #003255 0%, transparent 60%)`,
          }}
        />

        {/* Dynamic Wave Layer 3 - Enhanced shadows */}
        <div
          className="absolute inset-0 animate-wave-float-3"
          style={{
            background: `radial-gradient(ellipse at 30% 20%, rgba(0, 50, 85, 0.8) 0%, transparent 70%), 
                        radial-gradient(ellipse at 70% 80%, rgba(0, 63, 102, 0.6) 0%, transparent 70%)`,
            filter: "blur(3px)",
          }}
        />

        {/* Fixed particles - no more Math.random() */}
        <div className="absolute inset-0">
          {particlePositions.map((particle, i) => (
            <div
              key={i}
              className="absolute animate-floating-particles"
              style={{
                left: `${particle.left}%`,
                top: `${particle.top}%`,
                animationDelay: `${particle.delay}s`,
              }}
            >
              <div
                className="w-2 h-2 rounded-full opacity-40"
                style={{
                  backgroundColor: i % 2 === 0 ? "#fdc513" : "#003255",
                  boxShadow: `0 0 10px ${i % 2 === 0 ? "#fdc513" : "#003255"}`,
                }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8 animate-fade-in-up">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold leading-tight">
                <span className="text-white">Empowering Algeria's</span>
                <span className="block text-6xl font-black text-white">Startup Ecosystem</span>
              </h1>
              <p className="text-xl max-w-2xl text-white/90 font-medium">
                We nurture innovative startups from conception to success, providing mentorship, programs, and resources
                to build Algeria's next generation of successful companies.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="group px-8 py-4 text-lg font-semibold transition-all duration-300 transform hover:scale-105 animate-pulse-glow"
                style={{
                  backgroundColor: "#fdc513",
                  color: "#003255",
                }}
                onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
              >
                Explore More
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="group px-8 py-4 text-lg font-semibold border-2 text-white hover:text-white transition-all duration-300 transform hover:scale-105 bg-transparent"
                style={{
                  borderColor: "#003255",
                  backgroundColor: "rgba(0, 50, 85, 0.1)",
                  backdropFilter: "blur(10px)",
                }}
                onClick={() => setIsVideoPlaying(true)}
              >
                <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                Watch Our Story
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-8 pt-8">
              <div
                className="text-center p-4 rounded-lg animate-floating-particles"
                style={{
                  backgroundColor: "rgba(0, 50, 85, 0.8)",
                  backdropFilter: "blur(10px)",
                  animationDelay: "0s",
                }}
              >
                <div className="text-3xl font-bold" style={{ color: "#fdc513" }}>
                  150+
                </div>
                <div className="text-sm text-white/80">Startups Supported</div>
              </div>
              <div
                className="text-center p-4 rounded-lg animate-floating-particles"
                style={{
                  backgroundColor: "rgba(253, 197, 19, 0.9)",
                  animationDelay: "2s",
                }}
              >
                <div className="text-3xl font-bold" style={{ color: "#003255" }}>
                  25+
                </div>
                <div className="text-sm" style={{ color: "#003255" }}>
                  Programs Launched
                </div>
              </div>
              <div
                className="text-center p-4 rounded-lg animate-floating-particles"
                style={{
                  backgroundColor: "rgba(0, 50, 85, 0.8)",
                  backdropFilter: "blur(10px)",
                  animationDelay: "4s",
                }}
              >
                <div className="text-3xl font-bold" style={{ color: "#fdc513" }}>
                  85%
                </div>
                <div className="text-sm text-white/80">Success Rate</div>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="relative">
            <div
              className="relative rounded-2xl p-8 backdrop-blur-sm animate-floating-particles"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                animationDelay: "1s",
              }}
            >
              <img
                src="/placeholder.svg?height=400&width=600"
                alt="ASI Startup Environment"
                className="w-full h-auto rounded-lg shadow-2xl"
              />
              <div className="absolute -top-4 -right-4 animate-floating-particles">
                <Sparkles className="w-8 h-8" style={{ color: "#fdc513" }} />
              </div>
              <div className="absolute -bottom-4 -left-4 animate-floating-particles" style={{ animationDelay: "3s" }}>
                <Sparkles className="w-6 h-6" style={{ color: "#003255" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div
          className="w-6 h-10 border-2 rounded-full flex justify-center animate-pulse-glow"
          style={{ borderColor: "#fdc513" }}
        >
          <div className="w-1 h-3 rounded-full mt-2 animate-pulse" style={{ backgroundColor: "#003255" }}></div>
        </div>
      </div>
    </section>
  )
}