"use client";

import { Upload, FileText, CheckCircle, AlertCircle, X, BarChart3, Mail, Clock, Award } from "lucide-react";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SubmissionResult {
  success: boolean;
  candidature_id: number;
  message: string;
  estimated_completion: string;
}

export default function BusinessPlanUpload() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [startupName, setStartupName] = useState<string>("");
  const [sector, setSector] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [submissionResult, setSubmissionResult] = useState<SubmissionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    const isPdf = selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setErrorMessage("Please upload a PDF file only.");
      setSubmitStatus("error");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage("File size must be less than 10MB.");
      setSubmitStatus("error");
      return;
    }

    setFile(selectedFile);
    setErrorMessage("");
    setSubmitStatus("idle");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFileSelect(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = () => {
    setFile(null);
    setSubmitStatus("idle");
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !phoneNumber || !email || !startupName || !sector || !file) {
      setErrorMessage("Please fill out all fields and upload a PDF file.");
      setSubmitStatus("error");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("submitting");
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);
      formData.append("phoneNumber", phoneNumber);
      formData.append("email", email);
      formData.append("startupName", startupName);
      formData.append("sector", sector);
      formData.append("businessPlan", file);
      formData.append("async", "true"); // Flag for asynchronous processing

      const response = await fetch("/api/upload-business-plan", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Submission failed");
      }

      // Set successful submission
      setSubmissionResult({
        success: true,
        candidature_id: result.candidature_id,
        message: result.message,
        estimated_completion: result.estimated_completion || "within 24 hours"
      });
      setSubmitStatus("submitted");

    } catch (error) {
      console.error("Submission error:", error);
      setSubmitStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to submit. Please try again.");
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFirstName("");
    setLastName("");
    setPhoneNumber("");
    setEmail("");
    setStartupName("");
    setSector("");
    setFile(null);
    setSubmitStatus("idle");
    setSubmissionResult(null);
    setIsSubmitting(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const formatFileSize = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  // Success screen after submission
  if (submitStatus === "submitted" && submissionResult) {
    return (
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Business Plan Submitted Successfully!</h2>
              <p className="text-lg text-gray-600">Your business plan has been received and queued for analysis</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 mb-8">
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="w-5 h-5" />
                    Submission Confirmed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-green-700">Reference ID:</span>
                      <p className="text-green-900 text-lg font-mono">#{submissionResult.candidature_id}</p>
                    </div>
                    <div>
                      <span className="font-semibold text-green-700">Status:</span>
                      <Badge variant="default" className="ml-2 bg-green-600">
                        Queued for Analysis
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-800">
                    <Clock className="w-5 h-5" />
                    What Happens Next?
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-900">Analysis will begin shortly</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-900">Estimated completion: {submissionResult.estimated_completion}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span className="text-blue-900">Results sent to: {email}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Submission Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <span className="font-semibold text-gray-700">Business:</span>
                    <p className="text-gray-900">{startupName}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Sector:</span>
                    <p className="text-gray-900">{sector}</p>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Contact:</span>
                    <p className="text-gray-900">{firstName} {lastName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <Mail className="w-6 h-6 text-yellow-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-2">Important Notes:</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Keep your reference ID <strong>#{submissionResult.candidature_id}</strong> for future reference</li>
                    <li>• Check your email (including spam folder) for the analysis results</li>
                    <li>• The analysis report will include detailed scoring and recommendations</li>
                    <li>• Our team may contact you for additional information if needed</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center">
              <button
                onClick={resetForm}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors duration-200"
              >
                Submit Another Business Plan
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Main submission form
  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Business Plan</h2>
            <p className="text-lg text-gray-600">Submit your business plan for professional analysis. Results will be emailed to you within 24 hours.</p>
          </div>

          <Card className="p-6">
            <div className="space-y-6">
              {/* Contact Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+213 555 123 456"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email Address *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Startup Name *</label>
                  <input
                    type="text"
                    value={startupName}
                    onChange={(e) => setStartupName(e.target.value)}
                    placeholder="Your startup name"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sector *</label>
                  <input
                    type="text"
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    placeholder="e.g., Technology, Healthcare"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Plan (PDF, max 10MB) *</label>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
                    isSubmitting 
                      ? "cursor-not-allowed opacity-50" 
                      : isDragging
                      ? "border-blue-500 bg-blue-50 cursor-pointer"
                      : file
                      ? "border-green-500 bg-green-50 cursor-pointer"
                      : "border-gray-300 hover:border-blue-400 hover:bg-blue-50 cursor-pointer"
                  }`}
                  onDragOver={!isSubmitting ? handleDragOver : undefined}
                  onDragLeave={!isSubmitting ? handleDragLeave : undefined}
                  onDrop={!isSubmitting ? handleDrop : undefined}
                  onClick={!isSubmitting ? handleClick : undefined}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf,.pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    disabled={isSubmitting}
                  />
                  {file ? (
                    <div className="flex items-center justify-center gap-4">
                      <FileText className="w-8 h-8 text-green-500" />
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{file.name}</p>
                        <p className="text-sm text-gray-500">Size: {formatFileSize(file.size)}</p>
                      </div>
                      {!isSubmitting && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile();
                          }}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? "text-blue-500" : "text-gray-400"}`} />
                      <p className="text-lg font-medium text-gray-900 mb-2">Drop your PDF here or click to browse</p>
                      <p className="text-sm text-gray-500">Maximum file size: 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Error Display */}
              {submitStatus === "error" && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
              )}

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || !firstName || !lastName || !phoneNumber || !email || !startupName || !sector || !file}
                className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 ${
                  isSubmitting || !firstName || !lastName || !phoneNumber || !email || !startupName || !sector || !file
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Submitting Business Plan...
                  </div>
                ) : (
                  "Submit Business Plan for Analysis"
                )}
              </button>

              {/* Information Cards */}
              {!isSubmitting && submitStatus === "idle" && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <span className="font-medium text-blue-800">Processing Timeline</span>
                    </div>
                    <p className="text-sm text-blue-700">
                      Your business plan will be analyzed within 24 hours. Results will be sent directly to your email address with detailed scoring and recommendations.
                    </p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-3">
                    <Card className="text-center p-4">
                      <BarChart3 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                      <h3 className="font-medium text-gray-900 mb-1">Professional Analysis</h3>
                      <p className="text-xs text-gray-600">12-criteria evaluation system with detailed scoring</p>
                    </Card>
                    <Card className="text-center p-4">
                      <Award className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <h3 className="font-medium text-gray-900 mb-1">Detailed Report</h3>
                      <p className="text-xs text-gray-600">Professional analysis report with recommendations</p>
                    </Card>
                    <Card className="text-center p-4">
                      <Mail className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                      <h3 className="font-medium text-gray-900 mb-1">Email Delivery</h3>
                      <p className="text-xs text-gray-600">Results sent directly to your email address</p>
                    </Card>
                  </div>
                </>
              )}
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}