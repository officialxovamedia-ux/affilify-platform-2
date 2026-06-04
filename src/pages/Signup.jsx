import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Sparkles, Loader2, Mail, Lock, Building2, Globe, User, Tag, FileText, AlertCircle } from 'lucide-react';

export default function Signup() {
  const [searchParams] = useSearchParams();
  const [role, setRole] = useState('creator'); // 'creator' or 'seller'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Seller fields
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');

  // Creator fields
  const [fullName, setFullName] = useState('');
  const [handle, setHandle] = useState('');
  const [bio, setBio] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signUp } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'seller' || roleParam === 'creator') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const additionalData = role === 'seller' 
      ? { companyName, website } 
      : { fullName, handle, bio };

    try {
      await signUp(email, password, role, additionalData);
      if (role === 'seller') {
        navigate('/dashboard/seller');
      } else {
        navigate('/dashboard/creator');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to create account. Please check inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-100 rounded-full filter blur-3xl opacity-60"></div>
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-100 rounded-full filter blur-3xl opacity-50"></div>

      <div className="w-full max-w-lg bg-white border border-slate-100 shadow-2xl rounded-3xl p-8 relative z-10 my-8">
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
          <h2 className="text-xl font-bold text-slate-900">Create Your Account</h2>
          <p className="text-sm text-slate-500 text-center">Join Affilify to launch campaigns or monetize your channels</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl flex items-start space-x-2.5 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Role Selector Tabs */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            type="button"
            onClick={() => setRole('creator')}
            className={`p-4 rounded-2xl border text-center flex flex-col items-center space-y-2 transition-all duration-200 ${
              role === 'creator'
                ? 'border-brand-500 bg-brand-50/50 shadow-md shadow-brand-500/5 text-brand-900 font-bold'
                : 'border-slate-200 hover:border-slate-300 text-slate-600'
            }`}
          >
            <User className={`w-6 h-6 ${role === 'creator' ? 'text-brand-600' : 'text-slate-400'}`} />
            <span className="text-sm">I'm a Creator</span>
          </button>
          
          <button
            type="button"
            onClick={() => setRole('seller')}
            className={`p-4 rounded-2xl border text-center flex flex-col items-center space-y-2 transition-all duration-200 ${
              role === 'seller'
                ? 'border-brand-500 bg-brand-50/50 shadow-md shadow-brand-500/5 text-brand-900 font-bold'
                : 'border-slate-200 hover:border-slate-300 text-slate-600'
            }`}
          >
            <Building2 className={`w-6 h-6 ${role === 'seller' ? 'text-brand-600' : 'text-slate-400'}`} />
            <span className="text-sm">I'm a Seller / Brand</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
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
            <label className="text-sm font-bold text-slate-700 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
              <input
                type="password"
                required
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-2xl text-slate-800 outline-none transition-all duration-200"
                placeholder="Minimum 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <hr className="border-slate-100 my-4" />

          {/* Conditional Role Fields */}
          {role === 'seller' ? (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">Company / Brand Name</label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-2xl text-slate-800 outline-none transition-all duration-200"
                    placeholder="Enter brand name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">Website URL</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                  <input
                    type="url"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-2xl text-slate-800 outline-none transition-all duration-200"
                    placeholder="https://example.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-2xl text-slate-800 outline-none transition-all duration-200"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">Social Media Handle</label>
                <div className="relative">
                  <Tag className="absolute left-4 top-3.5 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    required
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-2xl text-slate-800 outline-none transition-all duration-200"
                    placeholder="@janedoe"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block">Short Bio</label>
                <div className="relative">
                  <FileText className="absolute left-4 top-3 text-slate-400 w-5 h-5" />
                  <textarea
                    rows="3"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-brand-500 focus:bg-white rounded-2xl text-slate-800 outline-none transition-all duration-200"
                    placeholder="Tell brands about your social channels..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 gradient-bg hover:opacity-95 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-brand-500/20 hover:shadow-brand-500/30 flex items-center justify-center space-x-2 transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none disabled:shadow-none"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Account...</span>
              </>
            ) : (
              <span>Create Account</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 hover:text-brand-700 font-bold transition-colors">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
