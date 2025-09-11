// app/components/BusinessPlanUpload.tsx
"use client";

import { Upload, FileText, CheckCircle, AlertCircle, X } from "lucide-react";
import { useState, useRef } from "react";
import "@/assets/styles/business-plan.css"

export default function BusinessPlanUpload() {
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [startupName, setStartupName] = useState<string>("");
  const [sector, setSector] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    const isPdf = selectedFile.type === "application/pdf" || selectedFile.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setErrorMessage("Please upload a PDF file only.");
      setUploadStatus("error");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setErrorMessage("File size must be less than 10MB.");
      setUploadStatus("error");
      return;
    }

    setFile(selectedFile);
    setErrorMessage("");
    setUploadStatus("idle");
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
    setUploadStatus("idle");
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !phoneNumber || !email || !startupName || !sector || !file) {
      setErrorMessage("Please fill out all fields and upload a PDF file.");
      setUploadStatus("error");
      return;
    }

    setIsUploading(true);
    setUploadStatus("idle");
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

      // Use absolute URL for clarity
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3000";
      const response = await fetch(`${baseUrl}/api/upload-business-plan`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Upload failed");
      }

      setUploadStatus("success");
      setFirstName("");
      setLastName("");
      setPhoneNumber("");
      setEmail("");
      setStartupName("");
      setSector("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Fetch error:", error); // Log for debugging
      setUploadStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to upload. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <section className="business-plan-upload">
      <div className="upload-container">
        <div className="upload-header">
          <h2 className="upload-title">Upload Your Business Plan</h2>
          <p className="upload-description">Submit your business plan for expert review and get feedback from our team.</p>
        </div>
        {/* Rest of the JSX unchanged from your original code */}
        <div className="upload-card">
          <div className="form-container">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">First Name *</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Last Name *</label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Phone Number *</label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+213 555 123 456"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Startup Name *</label>
                <input
                  type="text"
                  value={startupName}
                  onChange={(e) => setStartupName(e.target.value)}
                  placeholder="Your startup name"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sector *</label>
                <input
                  type="text"
                  value={sector}
                  onChange={(e) => setSector(e.target.value)}
                  placeholder="e.g., Technology, Healthcare"
                  className="form-input"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Business Plan (PDF, max 10MB) *</label>
              <div
                className={`file-upload-area ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleClick}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileChange}
                  className="file-input-hidden"
                />
                {file ? (
                  <div className="file-selected-content">
                    <FileText className="file-icon" />
                    <div>
                      <span className="file-name">{file.name}</span>
                      <p className="file-size">Size: {formatFileSize(file.size)}</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile();
                      }}
                      className="remove-file-btn"
                    >
                      <X className="remove-icon" />
                    </button>
                  </div>
                ) : (
                  <div className="file-upload-content">
                    <Upload className={`upload-icon ${isDragging ? "dragging" : ""}`} />
                    <p className="upload-text">Drop your PDF here or click to browse</p>
                    <p className="upload-hint">Maximum file size: 10MB</p>
                  </div>
                )}
              </div>
            </div>
            {uploadStatus === "error" && (
              <div className="status-message status-error">
                <AlertCircle className="status-icon" />
                <p className="status-text">{errorMessage}</p>
              </div>
            )}
            {uploadStatus === "success" && (
              <div className="status-message status-success">
                <CheckCircle className="status-icon" />
                <p className="status-text">
                  Successfully uploaded! We've received your business plan and will review it shortly.
                  You'll hear back from our team within 2-3 business days.
                </p>
              </div>
            )}
            <button
              onClick={handleSubmit}
              disabled={isUploading || !firstName || !lastName || !phoneNumber || !email || !startupName || !sector || !file}
              className="submit-button"
            >
              {isUploading ? (
                <div className="submit-loading">
                  <div className="loading-spinner" />
                  Uploading...
                </div>
              ) : (
                "Submit Business Plan"
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}