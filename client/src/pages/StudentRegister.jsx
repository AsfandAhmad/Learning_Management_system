import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { authAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';

export default function StudentRegister() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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
      const response = await authAPI.registerStudent(registerData);
      login(response.data.token);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="Student Registration" 
      subtitle="Join thousands of students learning together"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          name="fullName"
          placeholder="John Doe"
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

        <div className="flex items-start gap-2 pt-2">
          <input type="checkbox" required className="w-4 h-4 mt-1 text-blue-600 rounded border-slate-300 focus:ring-blue-500" />
          <label className="text-sm text-slate-600">
            I agree to the{' '}
            <Link to="/terms" className="text-blue-600 hover:text-blue-700">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-blue-600 hover:text-blue-700">Privacy Policy</Link>
          </label>
        </div>

        <Button type="submit" variant="primary" disabled={loading}>
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>

        <div className="text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/student/login" className="text-blue-600 hover:text-blue-700 font-semibold">
            Sign In
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
