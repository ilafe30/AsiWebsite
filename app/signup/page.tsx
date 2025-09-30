"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Eye, EyeOff } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function SignUpPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [formData, setFormData] = useState({
    startupName: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      return
    }
    if (!acceptTerms) {
      setError("Please accept the terms and conditions")
      return
    }
    try {
      setSubmitting(true)
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startupName: formData.startupName,
          email: formData.email,
          password: formData.password,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.error || "Registration failed")
      }
      setSuccess("Registration successful! Check your email to verify your account.")
    } catch (err: any) {
      setError(err.message || "Something went wrong")
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <div
        className="flex-1 flex items-center justify-center py-8 relative overflow-hidden"
        style={{ backgroundColor: "#003255" }}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 opacity-100"
            style={{
              background: `linear-gradient(135deg, #003255 0%, #002a4a 25%, #003f66 50%, #002a4a 75%, #003255 100%)`,
              backgroundSize: "400% 400%",
              animation: "gradientShift 15s ease infinite",
            }}
          />

          {/* Wave Layer 1 */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(ellipse at 20% 50%, #003f66 0%, transparent 50%), 
                          radial-gradient(ellipse at 80% 20%, #002a4a 0%, transparent 50%),
                          radial-gradient(ellipse at 40% 80%, #003255 0%, transparent 50%)`,
              animation: "waveFloat1 20s ease-in-out infinite",
            }}
          />

          {/* Wave Layer 2 */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(ellipse at 60% 30%, #003f66 0%, transparent 60%), 
                          radial-gradient(ellipse at 10% 70%, #002a4a 0%, transparent 60%),
                          radial-gradient(ellipse at 90% 60%, #003255 0%, transparent 60%)`,
              animation: "waveFloat2 25s ease-in-out infinite reverse",
            }}
          />

          {/* Wave Layer 3 - Subtle shadows */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              background: `radial-gradient(ellipse at 30% 20%, rgba(0, 50, 85, 0.8) 0%, transparent 70%), 
                          radial-gradient(ellipse at 70% 80%, rgba(0, 63, 102, 0.6) 0%, transparent 70%)`,
              animation: "waveFloat3 30s ease-in-out infinite",
              filter: "blur(2px)",
            }}
          />
        </div>

        <style jsx>{`
          @keyframes gradientShift {
            0%, 100% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
          }
          
          @keyframes waveFloat1 {
            0%, 100% { transform: translateX(-10%) translateY(-5%) scale(1); }
            33% { transform: translateX(5%) translateY(-10%) scale(1.1); }
            66% { transform: translateX(-5%) translateY(5%) scale(0.9); }
          }
          
          @keyframes waveFloat2 {
            0%, 100% { transform: translateX(10%) translateY(5%) scale(0.8); }
            50% { transform: translateX(-15%) translateY(-8%) scale(1.2); }
          }
          
          @keyframes waveFloat3 {
            0%, 100% { transform: translateX(0%) translateY(0%) scale(1); }
            25% { transform: translateX(8%) translateY(-12%) scale(1.1); }
            50% { transform: translateX(-12%) translateY(8%) scale(0.9); }
            75% { transform: translateX(6%) translateY(10%) scale(1.05); }
          }
        `}</style>

        <div className="w-full max-w-lg px-6 relative z-10">
          <Card className="shadow-2xl backdrop-blur-sm bg-white/95 p-2">
            <CardHeader className="text-center pb-6">
              <div className="mb-6">
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/ASI_Transparent_SD-knzc0SIjlFdpoLdRiMdhKs5hbOwXQL.png"
                  alt="ASI Logo"
                  width={140}
                  height={50}
                  className="h-12 w-auto mx-auto"
                />
              </div>
              <CardTitle className="text-3xl font-bold text-foreground">Join ASI</CardTitle>
              <CardDescription className="text-lg">
                Create your account and start your entrepreneurial journey with us
              </CardDescription>
            </CardHeader>
            <CardContent className="px-8 pb-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                {error && <p className="text-sm text-red-600">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}

                <div>
                  <Label htmlFor="startupName" className="text-base font-medium">
                    Startup Name
                  </Label>
                  <Input
                    id="startupName"
                    placeholder="Your startup name"
                    value={formData.startupName}
                    onChange={(e) => handleInputChange("startupName", e.target.value)}
                    required
                    className="h-12 text-base mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-base font-medium">
                    Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                    className="h-12 text-base mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-base font-medium">
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      required
                      className="h-12 text-base pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-base font-medium">
                    Confirm Password
                  </Label>
                  <div className="relative mt-2">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      required
                      className="h-12 text-base pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Eye className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="terms"
                    checked={acceptTerms}
                    onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                  />
                  <Label htmlFor="terms" className="text-base">
                    I agree to the{" "}
                    <Link href="/terms" className="text-accent hover:text-accent/80">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-accent hover:text-accent/80">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 text-base bg-accent text-accent-foreground hover:bg-accent/90"
                >
                  {submitting ? "Creating..." : "Create Account"}
                </Button>
              </form>

              <div className="text-center mt-8">
                <p className="text-base text-muted-foreground">
                  Already have an account?{" "}
                  <Link href="/login" className="text-accent hover:text-accent/80 font-medium transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  )
}
