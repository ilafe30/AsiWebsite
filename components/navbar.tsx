"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("home")

  useEffect(() => {
    const handleScroll = () => {
      const sections = ["home", "news", "about", "services", "contact"]
      const scrollPosition = window.scrollY + 100 // Offset for navbar height

      for (const section of sections) {
        const element = document.getElementById(section)
        if (element) {
          const { offsetTop, offsetHeight } = element
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section)
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Check initial position

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
      setIsMenuOpen(false)
    }
  }

  const getButtonStyles = (section: string) => {
    const baseStyles = "text-foreground font-medium transition-all duration-300 hover:scale-105 relative"
    const activeStyles =
      activeSection === section
        ? "text-[#003255] after:absolute after:bottom-[-4px] after:left-0 after:right-0 after:h-0.5 after:bg-[#FDC513] after:rounded-full"
        : "hover:text-accent"
    return `${baseStyles} ${activeStyles}`
  }

  return (
    <nav className="bg-background/95 backdrop-blur-sm border-b border-border sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 group">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ASI_Transparent_SD-knzc0SIjlFdpoLdRiMdhKs5hbOwXQL.png"
                alt="ASI Logo"
                width={120}
                height={40}
                className="h-10 w-auto group-hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button onClick={() => scrollToSection("home")} className={getButtonStyles("home")}>
                Home
              </button>
              <button onClick={() => scrollToSection("news")} className={getButtonStyles("news")}>
                News & Updates
              </button>
              <button onClick={() => scrollToSection("about")} className={getButtonStyles("about")}>
                About Us
              </button>
              <button onClick={() => scrollToSection("services")} className={getButtonStyles("services")}>
                Services
              </button>
              <button onClick={() => scrollToSection("contact")} className={getButtonStyles("contact")}>
                Contact Us
              </button>
            </div>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="outline"
              asChild
              className="hover:scale-105 transition-transform duration-300 bg-transparent"
            >
              <Link href="/login">Login</Link>
            </Button>
            <Button
              asChild
              className="bg-accent text-accent-foreground hover:bg-accent/90 hover:scale-105 transition-all duration-300"
            >
              <Link href="/signup">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="hover:scale-110 transition-transform duration-300"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden animate-fade-in-down">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card/95 backdrop-blur-sm rounded-lg mt-2 shadow-lg">
              <button
                onClick={() => scrollToSection("home")}
                className={`block w-full text-left px-3 py-2 font-medium transition-colors duration-300 ${
                  activeSection === "home" ? "text-[#003255] bg-[#FDC513]/10" : "text-foreground hover:text-accent"
                }`}
              >
                Home
              </button>
              <button
                onClick={() => scrollToSection("news")}
                className={`block w-full text-left px-3 py-2 font-medium transition-colors duration-300 ${
                  activeSection === "news" ? "text-[#003255] bg-[#FDC513]/10" : "text-foreground hover:text-accent"
                }`}
              >
                News & Updates
              </button>
              <button
                onClick={() => scrollToSection("about")}
                className={`block w-full text-left px-3 py-2 font-medium transition-colors duration-300 ${
                  activeSection === "about" ? "text-[#003255] bg-[#FDC513]/10" : "text-foreground hover:text-accent"
                }`}
              >
                About Us
              </button>
              <button
                onClick={() => scrollToSection("services")}
                className={`block w-full text-left px-3 py-2 font-medium transition-colors duration-300 ${
                  activeSection === "services" ? "text-[#003255] bg-[#FDC513]/10" : "text-foreground hover:text-accent"
                }`}
              >
                Services
              </button>
              <button
                onClick={() => scrollToSection("contact")}
                className={`block w-full text-left px-3 py-2 font-medium transition-colors duration-300 ${
                  activeSection === "contact" ? "text-[#003255] bg-[#FDC513]/10" : "text-foreground hover:text-accent"
                }`}
              >
                Contact Us
              </button>
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Button variant="outline" asChild>
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
