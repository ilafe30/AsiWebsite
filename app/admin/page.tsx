'use client'

import { useState, useEffect } from 'react'
import { Download, FileText, User, Mail, Phone, Building, Calendar } from 'lucide-react'

interface Submission {
  id: number
  firstName: string
  lastName: string
  phoneNumber: string
  email: string
  startupName: string
  sector: string
  fileName: string
  originalName: string
  filePath: string
  fileSize: number
  uploadDate: string
}

export default function AdminPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchSubmissions()
  }, [])

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/upload-business-plan')
      if (!response.ok) {
        throw new Error('Failed to fetch submissions')
      }
      const data = await response.json()
      setSubmissions(data.reverse()) // Show newest first
    } catch (error) {
      setError('Failed to load submissions')
      console.error('Error fetching submissions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (fileName: string, originalName: string) => {
    try {
      const response = await fetch(`/api/download/${fileName}`)
      if (!response.ok) {
        throw new Error('Download failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = originalName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Download error:', error)
      alert('Failed to download file')
    }
  }

  const formatFileSize = (bytes: number): string => {
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB'
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }


  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-container">
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>Loading submissions...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-container">
        <div className="admin-header">
          <h1 className="admin-title">Business Plan Submissions</h1>
          <p className="admin-description">
            Total submissions: {submissions.length}
          </p>
        </div>

        {error && (
          <div className="status-message status-error">
            <p className="status-text">{error}</p>
          </div>
        )}

        {submissions.length === 0 && !error ? (
          <div className="empty-state">
            <FileText className="empty-icon" />
            <h3>No submissions yet</h3>
            <p>Business plan submissions will appear here.</p>
          </div>
        ) : (
          <div className="submissions-grid">
            {submissions.map((submission) => (
              <div key={submission.id} className="submission-card">
                <div className="submission-header">
                  <h3 className="submission-name">
                    {submission.firstName} {submission.lastName}
                  </h3>
                  <div className="submission-date">
                    <Calendar className="date-icon" />
                    {formatDate(submission.uploadDate)}
                  </div>
                </div>

                <div className="submission-details">
                  <div className="detail-item">
                    <Building className="detail-icon" />
                    <span className="detail-label">Startup:</span>
                    <span className="detail-value">{submission.startupName}</span>
                  </div>

                  <div className="detail-item">
                    <span className="detail-label">Sector:</span>
                    <span className="detail-value">{submission.sector}</span>
                  </div>

                  <div className="detail-item">
                    <Mail className="detail-icon" />
                    <span className="detail-label">Email:</span>
                    <span className="detail-value">{submission.email}</span>
                  </div>

                  <div className="detail-item">
                    <Phone className="detail-icon" />
                    <span className="detail-label">Phone:</span>
                    <span className="detail-value">{submission.phoneNumber}</span>
                  </div>
                </div>

                <div className="file-info">
                  <div className="file-details">
                    <FileText className="file-icon" />
                    <div>
                      <p className="file-name">{submission.originalName}</p>
                      <p className="file-size">{formatFileSize(submission.fileSize)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDownload(submission.fileName, submission.originalName)}
                    className="download-btn"
                    title="Download business plan"
                  >
                    <Download className="download-icon" />
                    Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}