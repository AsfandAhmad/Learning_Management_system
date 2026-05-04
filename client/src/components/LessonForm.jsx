/**
 * Lesson Creation Component with Video & Document Upload
 * 
 * 3-Step Workflow:
 * Step 1: Create Lesson (Title, Content Type, Lesson Type)
 * Step 2: Upload Video Lecture (Optional - can skip)
 * Step 3: Upload Documents (Optional - can skip)
 * 
 * Backend Schema:
 * - Lesson table: SectionID, Title, ContentType, ContentURL, PositionOrder
 * - Video upload: POST /:lessonId/videos/upload
 * - Document upload: POST /:lessonId/documents/upload
 */

import React, { useState } from 'react';
import axios from 'axios';
import './LessonForm.css';

export function LessonForm({ sectionId, courseId, onSuccess, onCancel }) {
  // ========== STATE ==========
  const [step, setStep] = useState(1); // 1: Create | 2: Upload Video | 3: Upload Docs
  const [loading, setLoading] = useState(false);
  const [currentLessonId, setCurrentLessonId] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const token = localStorage.getItem('token');

  // Step 1: Lesson Details
  const [lessonDetails, setLessonDetails] = useState({
    title: '',
    contentType: 'Video',
    lessonType: 'Lecture'
  });

  // Step 2: Video Upload
  const [videoFile, setVideoFile] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);

  // Step 3: Documents Upload
  const [documents, setDocuments] = useState([]);
  const [documentProgress, setDocumentProgress] = useState(0);

  // ========== VALIDATIONS ==========
  const validateStep1 = () => {
    if (!sectionId) {
      setError('❌ Error: Please select or create a section before adding a lesson');
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

  // ========== STEP 1: Create Lesson ==========
  const handleStep1Submit = async (e) => {
    e.preventDefault();

    if (!validateStep1()) return;

    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      console.log('📝 Step 1: Creating lesson...');
      console.log('  Section ID:', sectionId);
      console.log('  Lesson Details:', lessonDetails);

      const response = await axios.post(
        `/api/sections/${sectionId}/lessons`,
        lessonDetails,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log('✅ Lesson created:', response.data);
      setCurrentLessonId(response.data.LessonID);
      setSuccessMsg(`✅ Lesson created successfully! (ID: ${response.data.LessonID})`);
      setStep(2);
      setError('');
    } catch (err) {
      console.error('❌ Step 1 Error:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create lesson';
      setError(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // ========== STEP 2: Upload Video ==========
  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (500MB max)
    if (file.size > 500 * 1024 * 1024) {
      setError('❌ Video file must be less than 500MB');
      return;
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      setError('❌ Please select a valid video file (mp4, webm, etc.)');
      return;
    }

    setVideoFile(file);
    setError('');
    console.log('✅ Video selected:', file.name, `(${(file.size / 1024 / 1024).toFixed(2)}MB)`);
  };

  const handleVideoUpload = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      setError('❌ Please select a video file to upload');
      return;
    }

    if (!currentLessonId) {
      setError('❌ Lesson ID not found. Please go back and create lesson first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🎬 Step 2: Uploading video...');
      console.log('  Lesson ID:', currentLessonId);
      console.log('  File:', videoFile.name, `(${(videoFile.size / 1024 / 1024).toFixed(2)}MB)`);

      const formData = new FormData();
      formData.append('video', videoFile);

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
            setVideoProgress(progress);
            console.log(`  Upload progress: ${progress}%`);
          }
        }
      );

      console.log('✅ Video uploaded successfully');
      setSuccessMsg('✅ Video uploaded successfully!');
      setVideoFile(null);
      setVideoProgress(0);
      setStep(3);
    } catch (err) {
      console.error('❌ Step 2 Error:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to upload video';
      setError(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipVideo = () => {
    console.log('⏭️  Skipping video upload');
    setStep(3);
    setError('');
  };

  // ========== STEP 3: Upload Documents ==========
  const handleDocumentsSelect = (e) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const validFiles = files.filter(file => {
      if (file.size > 100 * 1024 * 1024) {
        alert(`❌ ${file.name} exceeds 100MB limit`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setDocuments(prev => [...prev, ...validFiles]);
      setError('');
      console.log(`✅ ${validFiles.length} document(s) selected`);
    }
  };

  const removeDocument = (index) => {
    const removed = documents[index];
    setDocuments(prev => prev.filter((_, i) => i !== index));
    console.log(`🗑️  Removed: ${removed.name}`);
  };

  const handleUploadDocuments = async (e) => {
    e.preventDefault();

    if (!currentLessonId) {
      setError('❌ Lesson ID not found');
      return;
    }

    // If no documents, just finish
    if (documents.length === 0) {
      console.log('✅ Lesson creation complete (no documents)');
      setSuccessMsg('✅ Lesson created successfully!');
      handleFinish();
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('📄 Step 3: Uploading documents...');
      console.log('  Lesson ID:', currentLessonId);
      console.log('  Document count:', documents.length);

      for (let i = 0; i < documents.length; i++) {
        const doc = documents[i];
        const formData = new FormData();
        formData.append('document', doc);

        console.log(`  Uploading ${i + 1}/${documents.length}: ${doc.name}`);

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
              const totalProgress = Math.round(((i + progress / 100) / documents.length) * 100);
              setDocumentProgress(totalProgress);
              if (progress === 100) {
                console.log(`    ✅ ${doc.name} uploaded`);
              }
            }
          }
        );
      }

      console.log('✅ All documents uploaded successfully');
      setSuccessMsg('✅ Lesson created successfully with all documents!');
      setDocuments([]);
      setDocumentProgress(0);
      handleFinish();
    } catch (err) {
      console.error('❌ Step 3 Error:', err.response?.data || err.message);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to upload documents';
      setError(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSkipDocuments = () => {
    console.log('⏭️  Skipping document upload');
    setSuccessMsg('✅ Lesson created successfully!');
    handleFinish();
  };

  const handleFinish = () => {
    console.log('🎉 Lesson creation complete');
    setTimeout(() => {
      if (onSuccess) onSuccess(currentLessonId);
      onCancel();
    }, 1000);
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  // ========== RENDERING ==========
  return (
    <div className="lesson-form-overlay">
      <div className="lesson-form-container">
        {/* Header */}
        <div className="form-header">
          <div className="form-title">
            <span className="step-badge">Step {step}/3</span>
            <h2>
              {step === 1 && '📝 Create Lesson'}
              {step === 2 && '🎬 Upload Video'}
              {step === 3 && '📄 Upload Documents'}
            </h2>
          </div>
          <button className="close-btn" onClick={onCancel} title="Cancel">✕</button>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${(step / 3) * 100}%` }}></div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert alert-error">
            <strong>⚠️</strong> {error}
          </div>
        )}

        {/* Success Message */}
        {successMsg && (
          <div className="alert alert-success">
            <strong>✅</strong> {successMsg}
          </div>
        )}

        {/* STEP 1: Create Lesson */}
        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="form-content">
            <div className="form-section">
              <h3>Lesson Details</h3>

              {!sectionId && (
                <div className="alert alert-warning">
                  ⚠️ <strong>Section Required:</strong> Please select or create a section in the course hierarchy before adding a lesson.
                </div>
              )}

              <div className="form-group">
                <label htmlFor="lesson-title">
                  Lesson Title <span className="required">*</span>
                </label>
                <input
                  id="lesson-title"
                  type="text"
                  placeholder="e.g., Introduction to React Hooks"
                  value={lessonDetails.title}
                  onChange={(e) => setLessonDetails({ ...lessonDetails, title: e.target.value })}
                  disabled={!sectionId}
                  className="form-input"
                />
                <small className="form-text">The title of your lesson</small>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="content-type">
                    Content Type <span className="required">*</span>
                  </label>
                  <select
                    id="content-type"
                    value={lessonDetails.contentType}
                    onChange={(e) => setLessonDetails({ ...lessonDetails, contentType: e.target.value })}
                    disabled={!sectionId}
                    className="form-select"
                  >
                    <option value="Video">📹 Video Lecture</option>
                    <option value="Text">📄 Text Content</option>
                    <option value="Interactive">🎮 Interactive</option>
                    <option value="Assignment">✏️ Assignment</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="lesson-type">
                    Lesson Type <span className="required">*</span>
                  </label>
                  <select
                    id="lesson-type"
                    value={lessonDetails.lessonType}
                    onChange={(e) => setLessonDetails({ ...lessonDetails, lessonType: e.target.value })}
                    disabled={!sectionId}
                    className="form-select"
                  >
                    <option value="Lecture">👨‍🏫 Lecture</option>
                    <option value="Practical">🛠️ Practical</option>
                    <option value="Quiz">📝 Quiz</option>
                    <option value="Project">🎯 Project</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={onCancel}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={!sectionId || loading}
              >
                {loading ? '⏳ Creating...' : 'Create Lesson →'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Upload Video */}
        {step === 2 && (
          <form onSubmit={handleVideoUpload} className="form-content">
            <div className="form-section">
              <h3>Upload Video Lecture</h3>
              <p className="section-description">
                Upload a video file for this lesson. Maximum size: 500MB.
              </p>

              {videoFile ? (
                <div className="file-preview">
                  <div className="file-info">
                    <span className="file-icon">🎬</span>
                    <div>
                      <p className="file-name">{videoFile.name}</p>
                      <p className="file-size">
                        {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => setVideoFile(null)}
                  >
                    ✕ Remove
                  </button>
                </div>
              ) : (
                <div className="file-upload-area">
                  <input
                    type="file"
                    id="video-input"
                    accept="video/*"
                    onChange={handleVideoSelect}
                    className="file-input"
                  />
                  <label htmlFor="video-input" className="file-label">
                    <span className="upload-icon">📹</span>
                    <span className="upload-text">
                      <strong>Click to upload or drag and drop</strong>
                      <br />
                      MP4, WebM, MKV up to 500MB
                    </span>
                  </label>
                </div>
              )}

              {videoProgress > 0 && videoProgress < 100 && (
                <div className="progress-section">
                  <div className="progress-label">Uploading: {videoProgress}%</div>
                  <div className="progress-bar-full">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${videoProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={handleBack}>
                ← Back
              </button>
              {!videoFile ? (
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleSkipVideo}
                >
                  Skip Video →
                </button>
              ) : (
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? '⏳ Uploading...' : 'Upload Video →'}
                </button>
              )}
            </div>
          </form>
        )}

        {/* STEP 3: Upload Documents */}
        {step === 3 && (
          <form onSubmit={handleUploadDocuments} className="form-content">
            <div className="form-section">
              <h3>Upload Documents</h3>
              <p className="section-description">
                Upload notes, assignments, resources, or other documents. Maximum size per file: 100MB.
              </p>

              <div className="file-upload-area">
                <input
                  type="file"
                  id="docs-input"
                  multiple
                  onChange={handleDocumentsSelect}
                  className="file-input"
                  disabled={loading}
                />
                <label htmlFor="docs-input" className="file-label">
                  <span className="upload-icon">📄</span>
                  <span className="upload-text">
                    <strong>Click to upload or drag and drop</strong>
                    <br />
                    PDF, DOC, XLS, PPT up to 100MB each
                  </span>
                </label>
              </div>

              {documents.length > 0 && (
                <div className="documents-list">
                  <h4>Selected Documents ({documents.length}):</h4>
                  <ul>
                    {documents.map((doc, idx) => (
                      <li key={idx} className="document-item">
                        <span className="doc-info">
                          <span className="doc-icon">📎</span>
                          <div>
                            <p className="doc-name">{doc.name}</p>
                            <p className="doc-size">
                              {(doc.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                        </span>
                        <button
                          type="button"
                          className="btn-remove"
                          onClick={() => removeDocument(idx)}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {documentProgress > 0 && documentProgress < 100 && (
                <div className="progress-section">
                  <div className="progress-label">Uploading: {documentProgress}%</div>
                  <div className="progress-bar-full">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${documentProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </div>

            <div className="form-actions">
              <button type="button" className="btn btn-outline" onClick={handleBack}>
                ← Back
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleSkipDocuments}
              >
                Skip Documents
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? '⏳ Uploading...' : '✅ Complete'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default LessonForm;
