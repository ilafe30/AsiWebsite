"use client"

import { useEffect, useState } from "react"

export default function StatsSection() {
  const [isVisible, setIsVisible] = useState(false)

  const stats = [
    { number: 150, suffix: "+", label: "Startups Supported", description: "Companies in our portfolio" },
    { number: 500, suffix: "+", label: "Entrepreneurs Mentored", description: "Individual guidance provided" },
    { number: 85, suffix: "%", label: "Success Rate", description: "Startups still operating" },
    { number: 750, suffix: "+", label: "Jobs Created", description: "Employment opportunities" },
    { number: 25, suffix: "+", label: "Industry Partners", description: "Strategic partnerships" },
    { number: 12, suffix: "", label: "Cities Reached", description: "Across Algeria" },
  ]

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    const element = document.getElementById("stats-section")
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [])

  return (
    <section id="stats-section" className="py-20 bg-primary text-primary-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Our <span className="text-accent">Impact</span>
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-3xl mx-auto">
            Numbers that showcase our commitment to building Algeria's startup ecosystem.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className="bg-primary-foreground/10 rounded-2xl p-8 hover:bg-primary-foreground/20 transition-all duration-300 hover:scale-105">
                <div className="text-4xl md:text-5xl font-bold text-accent mb-2">
                  {isVisible ? <CountUpAnimation target={stat.number} suffix={stat.suffix} /> : `0${stat.suffix}`}
                </div>
                <div className="text-xl font-semibold text-primary-foreground mb-2">{stat.label}</div>
                <div className="text-primary-foreground/70 text-sm">{stat.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function CountUpAnimation({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const duration = 2000
    const steps = 60
    const increment = target / steps
    const stepDuration = duration / steps

    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(timer)
  }, [target])

  return (
    <>
      {count}
      {suffix}
    </>
  )
}
