/**
 * Lesson Creation Component with Video & Document Upload
 * 
 * 3-Step Workflow:
 * Step 1: Create Lesson (Title, Content Type, Lesson Type)
 * Step 2: Upload Video Lecture (Video file upload)
 * Step 3: Upload Documents (Notes, Assignments, Resources)
 * 
 * Backend Schema:
 * - Lesson table: SectionID, Title, ContentType, ContentURL, PositionOrder
 * - Video upload: POST /:lessonId/videos/upload
 * - Document upload: POST /:lessonId/documents/upload
 * - Student Notes: POST /:lessonId/notes (student-only)
 */

import React, { useState } from 'react';
import axios from 'axios';
import './LessonForm.css';

export function LessonForm({ sectionId, courseId, onSuccess, onCancel }) {
  const [step, setStep] = useState(1); // 1: Create | 2: Upload Video | 3: Upload Docs
  const [loading, setLoading] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const token = localStorage.getItem('token');

  // ========== Step 1: Lesson Details ==========
  const [lessonDetails, setLessonDetails] = useState({
    title: '',
    contentType: 'Video', // Video, Text, Interactive, Assignment
    lessonType: 'Lecture' // Lecture, Practical, Quiz, Project
  });

  // ========== Step 2: Video Upload ==========
  const [videoFile, setVideoFile] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);

  // ========== Step 3: Documents Upload ==========
  const [documents, setDocuments] = useState([]);
  const [documentProgress, setDocumentProgress] = useState(0);

  // ========== Validation ==========
  const validateStep1 = () => {
    if (!sectionId) {
      setError('❌ Section not selected. Please select or create a section first.');
      return false;
    }
    if (!lessonDetails.title.trim()) {
      setError('❌ Lesson title is required');
      return false;
    }
    if (!lessonDetails.contentType) {
      setError('❌ Content type is required');
      return false;
    }
    return true;
  };

  // Step 1: Create Lesson
  const handleCreateLesson = async (e) => {
    e.preventDefault();
    
    if (!lesson.title.trim()) {
      setError('Lesson title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Send lesson with proper field names
      const lessonPayload = {
        title: lesson.title,
        contentType: lesson.contentType || 'Video',
        lessonType: lesson.lessonType || 'Lecture',
        // ContentURL will be added when video is uploaded
      };

      console.log('Sending lesson payload:', lessonPayload);
      
      const response = await axios.post(
        `/api/sections/${sectionId}/lessons`,
        lessonPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('Lesson created:', response.data);
      setCurrentLessonId(response.data.LessonID);
      setStep(2);
      setError('');
    } catch (err) {
      console.error('Lesson creation error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to create lesson');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Upload Video and Documents
  const handleUploadMedia = async (e) => {
    e.preventDefault();
    
    if (!video && documents.length === 0) {
      setError('Please select at least a video or document');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload video
      if (video) {
        const formData = new FormData();
        formData.append('video', video);

        await axios.post(
          `/api/sections/${sectionId}/lessons/${currentLessonId}/videos/upload`,
          formData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (e) => {
              const progress = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(prev => ({ ...prev, video: progress }));
            }
          }
        );
      }

      // Upload documents
      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        const formData = new FormData();
        formData.append('document', doc);

        await axios.post(
          `/api/sections/${sectionId}/lessons/${currentLessonId}/documents/upload`,
          formData,
          {
            headers: { 
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            },
            onUploadProgress: (e) => {
              const progress = Math.round((e.loaded / e.total) * 100);
              setUploadProgress(prev => ({ 
                ...prev, 
                docs: Math.round(((i + (e.loaded / e.total)) / documents.length) * 100)
              }));
            }
          }
        );
      }

      setError('');
      onSuccess?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload media');
    } finally {
      setLoading(false);
      setUploadProgress({ video: 0, docs: 0 });
    }
  };

  // Skip video upload and complete
  const handleSkipVideo = async () => {
    setLoading(true);
    try {
      // Still create the lesson, user can add video later
      onSuccess?.();
    } finally {
      setLoading(false);
    }
  };

  // Back to step 1
  const handleBack = () => {
    setStep(1);
    setCurrentLessonId(null);
    setVideo(null);
    setDocuments([]);
    setUploadProgress({ video: 0, docs: 0 });
  };

  return (
    <div className="lesson-form-container">
      <div className="lesson-form-card">
        {/* Header */}
        <div className="form-header">
          <h2>📚 Create Lesson {step === 2 && '& Upload Video'}</h2>
          <button className="close-btn" onClick={onCancel}>✕</button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {/* Step 1: Create Lesson */}
        {step === 1 && (
          <form onSubmit={handleCreateLesson}>
            <div className="form-section">
              <h3>Lesson Details</h3>
              
              <div className="form-group">
                <label htmlFor="title">Lesson Title *</label>
                <input
                  id="title"
                  type="text"
                  name="title"
                  value={lesson.title}
                  onChange={handleLessonChange}
                  placeholder="e.g., Introduction to React Hooks"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="contentType">Content Type</label>
                  <select
                    id="contentType"
                    name="contentType"
                    value={lesson.contentType}
                    onChange={handleLessonChange}
                  >
                    <option value="Video">Video</option>
                    <option value="Text">Text Only</option>
                    <option value="Mixed">Video + Text</option>
                    <option value="Document">Document</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="duration">Duration (minutes)</label>
                  <input
                    id="duration"
                    type="number"
                    name="duration"
                    value={lesson.duration}
                    onChange={handleLessonChange}
                    placeholder="e.g., 45"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="lessonType">Lesson Type</label>
                <select
                  id="lessonType"
                  name="lessonType"
                  value={lesson.lessonType}
                  onChange={handleLessonChange}
                >
                  <option value="Lecture">Lecture</option>
                  <option value="Tutorial">Tutorial</option>
                  <option value="Discussion">Discussion</option>
                  <option value="Assignment">Assignment</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="notes">Lecture Notes & Learning Objectives</label>
                <textarea
                  id="notes"
                  name="notes"
                  value={lesson.notes}
                  onChange={handleLessonChange}
                  placeholder="Enter detailed lecture notes, key concepts, learning objectives, and resources..."
                  rows={6}
                />
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={onCancel}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Creating Lesson...' : 'Next: Upload Video →'}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Upload Video & Documents */}
        {step === 2 && (
          <form onSubmit={handleUploadMedia}>
            <div className="form-section">
              <h3>📹 Upload Video Lecture</h3>
              <p className="section-help">Upload your recorded lecture video</p>
              
              <div className="form-group">
                <label htmlFor="video" className="file-input-label">
                  <span>📹 Select Video File</span>
                  <small>MP4, WebM, OGG - Max 500MB</small>
                </label>
                <input
                  id="video"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoSelect}
                  className="file-input"
                />
                {video && (
                  <div className="file-preview">
                    <p>✓ Selected: {video.name}</p>
                    <small>{(video.size / 1024 / 1024).toFixed(2)} MB</small>
                  </div>
                )}
              </div>

              {video && uploadProgress.video > 0 && (
                <div className="progress-bar">
                  <div style={{ width: `${uploadProgress.video}%` }} />
                </div>
              )}
            </div>

            <div className="form-section">
              <h3>📄 Supporting Documents (Optional)</h3>
              <p className="section-help">Upload PDF notes, slides, or resources</p>
              
              <div className="form-group">
                <label htmlFor="documents" className="file-input-label">
                  <span>📄 Select Documents</span>
                  <small>PDF, DOC, PPT - Max 100MB each</small>
                </label>
                <input
                  id="documents"
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx"
                  onChange={handleDocumentsSelect}
                  className="file-input"
                />
              </div>

              {documents.length > 0 && (
                <div className="documents-list">
                  <h4>Attached Documents:</h4>
                  <ul>
                    {documents.map((doc, i) => (
                      <li key={i}>
                        <span>📎 {doc.name}</span>
                        <button
                          type="button"
                          onClick={() => removeDocument(i)}
                          className="remove-btn"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {uploadProgress.docs > 0 && documents.length > 0 && (
                <div className="progress-bar">
                  <div style={{ width: `${uploadProgress.docs}%` }} />
                </div>
              )}
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={handleBack}
                className="btn btn-secondary"
              >
                ← Back
              </button>
              <button
                type="button"
                onClick={handleSkipVideo}
                className="btn btn-link"
              >
                Skip & Complete
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
              >
                {loading ? 'Uploading...' : '✓ Create Lesson'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default LessonForm;
