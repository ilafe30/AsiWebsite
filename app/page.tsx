import Navbar from "@/components/navbar"
import HeroSection from "@/components/hero-section"
import NewsSection from "@/components/news-section"
import AboutSection from "@/components/about-section"
import ServicesSection from "@/components/services-section"
import StatsSection from "@/components/stats-section"
import ContactSection from "@/components/contact-section"
import Footer from "@/components/footer"
import BusinessPlanUpload from "@/components/business-plan-upload"


export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <NewsSection />
        <AboutSection />
        <ServicesSection />
        <StatsSection />
        <BusinessPlanUpload />
        <ContactSection />
      </main>
      <Footer />
    </div>
  )
}
