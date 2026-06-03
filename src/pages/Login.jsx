import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Loader2, Mail, Lock, AlertCircle } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { profile } = await signIn(email, password);
      if (profile?.role === 'seller') {
        navigate('/seller/dashboard');
      } else if (profile?.role === 'creator') {
        navigate('/creator/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-100 rounded-full filter blur-3xl opacity-60"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-50"></div>

      <div className="w-full max-w-md bg-white border border-slate-100 shadow-2xl rounded-3xl p-8 relative z-10">
        {/* Brand Logo */}
        <div className="flex flex-col items-center space-y-3 mb-8">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sparkles className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-slate-800">
              Affili<span className="text-brand-600">fy</span>
            </span>
          </Link>
          <h2 className="text-xl font-bold text-slate-900">Welcome Back</h2>
          <p className="text-sm text-slate-500">Sign in to manage your affiliate campaigns and wallet</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl flex items-start space-x-2.5 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
              <input
                type="email"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-2xl text-slate-800 outline-none transition-all duration-200"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-slate-700 block">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-2xl text-slate-800 outline-none transition-all duration-200"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full gradient-bg hover:opacity-95 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-brand-500/20 hover:shadow-brand-500/30 flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/signup" className="text-brand-600 hover:text-brand-700 font-bold transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
