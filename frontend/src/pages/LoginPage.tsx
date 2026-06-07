import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { authService } from '../services/authService';
import { Briefcase, AlertCircle } from 'lucide-react';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await authService.login({ email, password });
      const { user, accessToken, refreshToken } = data;
      setAuth(user, accessToken, refreshToken);

      // Determine initial redirect
      let target = from;
      if (from === '/dashboard' || from === '/') {
        const perms = user.permissions || [];
        if (!perms.includes('reports:view')) {
          if (perms.includes('projects:read')) target = '/projects';
          else if (perms.includes('tasks:read')) target = '/tasks';
          else if (perms.includes('users:manage')) target = '/users';
          else target = '/profile';
        }
      }

      navigate(target, { replace: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Briefcase size={32} />
        </div>
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Welcome Back</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">Enter your details to access your dashboard</p>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100 dark:border-red-900/30 flex items-center gap-2">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="text-left space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:text-white transition-all"
            />
          </div>
          
          <div>
            <div className="flex justify-between mb-1.5">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Password</label>
              <a href="#" className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline">Forgot password?</a>
            </div>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 dark:text-white transition-all"
            />
          </div>
          
          <button 
            type="submit" 
            className="w-full p-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold shadow-lg shadow-purple-500/20 disabled:opacity-50 transition-all transform active:scale-[0.98]" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        
        <p className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          Don't have an account? <a href="/signup" className="text-purple-600 dark:text-purple-400 font-bold hover:underline">Create an account</a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
