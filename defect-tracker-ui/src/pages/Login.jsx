import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { BugAntIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import loginImage from '../assets/login-illustration.png';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(username, password);
    if (result.success) {
      toast.success('Welcome back!');
      navigate('/dashboard');
    } else {
      toast.error(result.error);
    }
    setLoading(false);
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'dark-theme' : 'light-theme'}`} style={{ background: 'var(--bg-primary)' }}>
      {/* Theme Toggle */}
      <button 
        onClick={() => setIsDark(!isDark)}
        className="fixed top-4 right-4 p-2 rounded-lg z-50"
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
      >
        {isDark ? 
          <SunIcon className="h-5 w-5 text-yellow-400" /> : 
          <MoonIcon className="h-5 w-5 text-blue-400" />
        }
      </button>

      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-2xl" style={{ background: 'var(--accent-light)' }}>
                <BugAntIcon className="h-12 w-12" style={{ color: 'var(--accent)' }} />
              </div>
            </div>
            <h2 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Login In Portal</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Access your defect tracking dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition"
                style={{ 
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Enter your username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 transition"
                style={{ 
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)'
                }}
                placeholder="Enter your password"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-medium transition disabled:opacity-50"
              style={{ background: 'var(--accent)', color: 'white' }}
              onMouseEnter={(e) => e.target.style.background = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.target.style.background = 'var(--accent)'}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>
            Demo: <span style={{ color: 'var(--accent)' }}>john_doe</span> / <span style={{ color: 'var(--accent)' }}>password123</span>
          </p>
        </div>
      </div>

      {/* Right Side - FULL IMAGE (fills entire right half) */}
      <div className="hidden lg:flex flex-1 items-center justify-center overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
        <img 
          src={loginImage} 
          alt="Defect Management" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
};

export default Login;