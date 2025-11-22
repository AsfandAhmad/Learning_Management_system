import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Textarea from '../components/ui/Textarea';
import { authAPI, teacherAPI } from '../api/services';

export default function InstructorRegister() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    qualification: '',
    password: '',
    confirmPassword: ''
  });
  const [cvFile, setCvFile] = useState(null);
  const [cvPreview, setCvPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [teacherId, setTeacherId] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleCVChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!validTypes.includes(file.type)) {
        setError('Only PDF, DOC, and DOCX files are allowed for CV');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('CV file must be less than 5MB');
        return;
      }
      setCvFile(file);
      setCvPreview(file.name);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...registerData } = formData;
      const response = await authAPI.registerTeacher(registerData);
      const newTeacherId = response.data.teacher?.TeacherID || response.data.TeacherID;
      setTeacherId(newTeacherId);

      // Upload CV if provided
      if (cvFile && newTeacherId) {
        const formDataCV = new FormData();
        formDataCV.append('cv', cvFile);
        
        try {
          await teacherAPI.uploadCV(formDataCV);
          setSuccess(true);
          setTimeout(() => navigate('/instructor/login'), 3000);
        } catch (cvErr) {
          // CV upload failed, but registration succeeded
          console.error('CV upload failed:', cvErr);
          setSuccess(true);
          setTimeout(() => navigate('/instructor/login'), 3000);
        }
      } else {
        setSuccess(true);
        setTimeout(() => navigate('/instructor/login'), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Instructor Registration" 
      subtitle="Share your knowledge with students worldwide"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm">
            Registration successful! Your account is pending approval. Redirecting to login...
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          name="fullName"
          placeholder="Dr. Jane Smith"
          value={formData.fullName}
          onChange={handleChange}
          required
        />

        <Input
          label="Email"
          type="email"
          name="email"
          placeholder="your.email@example.com"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <Input
          label="Qualification"
          type="text"
          name="qualification"
          placeholder="e.g., PhD in Computer Science, Master's in Mathematics"
          value={formData.qualification}
          onChange={handleChange}
        />

        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />

        <div className="border-t pt-4 mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload CV (Optional)
          </label>
          <p className="text-xs text-gray-500 mb-3">
            Supported formats: PDF, DOC, DOCX (Max 5MB)
          </p>
          <div className="relative">
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={handleCVChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50 transition">
              <svg className="w-8 h-8 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <p className="text-sm text-gray-600">
                {cvPreview ? (
                  <span className="text-green-600 font-medium">✓ {cvPreview}</span>
                ) : (
                  <>Click to upload or drag and drop</>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 pt-2">
          <input type="checkbox" required className="w-4 h-4 mt-1 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
          <label className="text-sm text-slate-600">
            I agree to the{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-700">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>
          </label>
        </div>

        <Button type="submit" variant="primary" disabled={loading || success}>
          {loading ? 'Creating Account...' : success ? 'Registration Complete!' : 'Create Account'}
        </Button>

        <div className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/instructor/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
