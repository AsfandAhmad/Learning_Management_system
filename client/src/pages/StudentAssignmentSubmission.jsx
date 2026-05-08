import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { assignmentsAPI } from '../api/services';
import Card, { CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function StudentAssignmentSubmission() {
  const { courseId, assignmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submissionText, setSubmissionText] = useState('');
  const [submissionFiles, setSubmissionFiles] = useState([]);
  const [submissionLink, setSubmissionLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    fetchAssignmentData();
  }, [courseId, assignmentId]);

  const fetchAssignmentData = async () => {
    try {
      setLoading(true);
      // Fetch assignment details
      const response = await assignmentsAPI.getCourseAssignments(courseId);
      const assignments = Array.isArray(response.data) ? response.data : (response.data.assignments || []);
      const currentAssignment = assignments.find(a => a.AssignmentID === parseInt(assignmentId));
      
      if (currentAssignment) {
        setAssignment(currentAssignment);
      } else {
        setError('Assignment not found');
      }
    } catch (err) {
      console.error('Error fetching assignment:', err);
      setError(err.response?.data?.message || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setSubmissionFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setSubmissionFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateSubmission = () => {
    if (assignment.SubmissionType === 'FileUpload' && submissionFiles.length === 0) {
      setError('Please upload at least one file');
      return false;
    }
    if (assignment.SubmissionType === 'Text' && !submissionText.trim()) {
      setError('Please enter submission text');
      return false;
    }
    if (assignment.SubmissionType === 'Link' && !submissionLink.trim()) {
      setError('Please provide a submission link');
      return false;
    }
    return true;
  };

  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    if (!validateSubmission()) return;

    try {
      setSubmitting(true);
      setError('');

      let submissionData;

      if (assignment.SubmissionType === 'FileUpload') {
        const formData = new FormData();
        submissionFiles.forEach(file => {
          formData.append('files', file);
        });
        submissionData = formData;
      } else if (assignment.SubmissionType === 'Text') {
        submissionData = { submissionText };
      } else {
        submissionData = { submissionLink };
      }

      await assignmentsAPI.submitAssignment(assignmentId, submissionData);
      setSubmitted(true);
      setSubmissionText('');
      setSubmissionFiles([]);
      setSubmissionLink('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-muted">Loading assignment...</p>
        </div>
      </div>
    );
  }

  if (error && !assignment) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardContent>
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-text-dark mb-2">Error Loading Assignment</h3>
              <p className="text-text-muted mb-4">{error}</p>
              <Button variant="primary" onClick={() => navigate(-1)}>
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!assignment) {
    return null;
  }

  const isOverdue = assignment.DueDate && new Date(assignment.DueDate) < new Date();
  const daysUntilDue = assignment.DueDate 
    ? Math.ceil((new Date(assignment.DueDate) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Button variant="outline" onClick={() => navigate(-1)}>
            ← Back
          </Button>
          <h1 className="text-2xl font-bold text-text-dark">{assignment.Title}</h1>
          <div style={{ width: '48px' }} /> {/* Spacer for alignment */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Assignment Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 mb-6">
                  {assignment.Description && (
                    <div>
                      <h3 className="font-semibold text-text-dark mb-2">Description</h3>
                      <p className="text-text-muted whitespace-pre-wrap">{assignment.Description}</p>
                    </div>
                  )}

                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-text-dark mb-3">Requirements</h3>
                    <div className="space-y-2 text-sm text-text-muted">
                      <p>✓ Max Marks: <strong className="text-text-dark">{assignment.MaxMarks || 'N/A'}</strong></p>
                      <p>✓ Submission Type: <strong className="text-text-dark">{assignment.SubmissionType || 'File Upload'}</strong></p>
                      {assignment.MaxAttempts && (
                        <p>✓ Max Attempts: <strong className="text-text-dark">{assignment.MaxAttempts}</strong></p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submission Form */}
                {!submitted && (
                  <form onSubmit={handleSubmitAssignment} className="border-t pt-6">
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
                        {error}
                      </div>
                    )}

                    {assignment.SubmissionType === 'FileUpload' && (
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Upload Your Files
                        </label>
                        <p className="text-xs text-text-muted mb-3">
                          You can upload multiple files (PDF, DOC, ZIP, images, etc.)
                        </p>
                        <input
                          type="file"
                          multiple
                          onChange={handleFileChange}
                          className="block w-full text-sm text-text-muted
                            file:mr-4 file:py-2 file:px-4
                            file:rounded file:border-0
                            file:text-sm file:font-semibold
                            file:bg-badge-orange file:text-white
                            hover:file:bg-opacity-90 mb-4"
                        />

                        {submissionFiles.length > 0 && (
                          <div className="space-y-2 mb-4">
                            <p className="text-sm font-medium text-text-dark">Selected Files:</p>
                            {submissionFiles.map((file, index) => (
                              <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                                <span className="text-sm text-text-dark truncate">{file.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveFile(index)}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  ✕
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {assignment.SubmissionType === 'Text' && (
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Your Submission
                        </label>
                        <textarea
                          value={submissionText}
                          onChange={(e) => setSubmissionText(e.target.value)}
                          placeholder="Enter your submission text here..."
                          rows={6}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6b00b3]"
                        />
                      </div>
                    )}

                    {assignment.SubmissionType === 'Link' && (
                      <div>
                        <label className="block text-sm font-medium text-text-dark mb-2">
                          Submission Link
                        </label>
                        <input
                          type="url"
                          value={submissionLink}
                          onChange={(e) => setSubmissionLink(e.target.value)}
                          placeholder="https://example.com/your-submission"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#6b00b3]"
                        />
                      </div>
                    )}

                    <div className="flex gap-3 mt-6">
                      <Button variant="outline" fullWidth onClick={() => navigate(-1)}>
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        variant="primary" 
                        fullWidth 
                        disabled={submitting}
                      >
                        {submitting ? 'Submitting...' : 'Submit Assignment'}
                      </Button>
                    </div>
                  </form>
                )}

                {submitted && (
                  <div className="border-t pt-6 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-text-dark mb-2">Submitted Successfully!</h3>
                    <p className="text-text-muted mb-4">Your assignment has been submitted for grading.</p>
                    <Button variant="primary" onClick={() => navigate(-1)}>
                      Back to Course
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Deadline</CardTitle>
              </CardHeader>
              <CardContent>
                {assignment.DueDate ? (
                  <div>
                    <div className={`text-center p-4 rounded-lg mb-4 ${isOverdue ? 'bg-red-50' : 'bg-green-50'}`}>
                      <p className={`font-semibold ${isOverdue ? 'text-red-900' : 'text-green-900'}`}>
                        {isOverdue ? 'Overdue' : `${daysUntilDue} days left`}
                      </p>
                    </div>
                    <p className="text-sm text-text-muted mb-1">
                      <strong>Due Date:</strong>
                    </p>
                    <p className="text-text-dark font-medium">
                      {new Date(assignment.DueDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                ) : (
                  <p className="text-text-muted">No due date set</p>
                )}
              </CardContent>
            </Card>

            {assignment.AllowLateSubmission && isOverdue && (
              <Card className="mt-4 border-amber-200">
                <CardContent>
                  <div className="flex gap-2">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-amber-900">Late submission allowed</p>
                      <p className="text-xs text-amber-800 mt-1">You can still submit this assignment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
