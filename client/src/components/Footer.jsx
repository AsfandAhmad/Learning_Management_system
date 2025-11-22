import { useState } from 'react';
import Modal from './ui/Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import { authAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Footer() {
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.loginAdmin({ email, password });
      login(response.data.token);
      setIsAdminModalOpen(false);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <footer className="w-full py-8 border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold shadow-md">
                P
              </div>
              <span className="font-bold text-2xl text-blue-600">Parhayi Likhai</span>
            </div>
            
            <div className="flex gap-6">
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">About</a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Privacy</a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Terms</a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-blue-600 transition-colors">Contact</a>
              <button 
                onClick={() => setIsAdminModalOpen(true)}
                className="text-sm font-medium text-slate-400 hover:text-blue-600 transition-colors"
              >
                Admin
              </button>
            </div>
          </div>
          
          <div className="pt-6 mt-6 border-t border-slate-200 text-center">
            <p className="text-sm text-slate-500">© {new Date().getFullYear()} Parhayi Likhai. Built with ❤️ for learning</p>
          </div>
        </div>
      </footer>

      <Modal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
        title="Admin Login"
        size="sm"
      >
        <form onSubmit={handleAdminLogin}>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}
          
          <Input
            type="email"
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="admin@gmail.com"
          />
          
          <Input
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="••••••••"
          />
          
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </Button>
        </form>
      </Modal>
    </>
  );
}
