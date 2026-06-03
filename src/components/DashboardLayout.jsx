import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Sparkles, Menu, X, LogOut, Wallet, User,
  Target, Tag, ShoppingBag, Receipt, Compass, TrendingUp
} from 'lucide-react';

export default function DashboardLayout({ children, role, activeSection, setActiveSection }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const sellerMenuItems = [
    { id: 'campaigns', label: 'Campaigns', icon: Target },
    { id: 'promo_codes', label: 'Promo Codes', icon: Tag },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];

  const creatorMenuItems = [
    { id: 'browse', label: 'Browse Campaigns', icon: Compass },
    { id: 'my_codes', label: 'My Promo Codes', icon: Tag },
    { id: 'earnings', label: 'Earnings & Stats', icon: TrendingUp },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];

  const menuItems = role === 'seller' ? sellerMenuItems : creatorMenuItems;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-800">
            Affili<span className="text-brand-600">fy</span>
          </span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 text-slate-600 hover:text-brand-600 bg-slate-50 rounded-xl"
        >
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {/* Mobile Menu Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 md:hidden flex justify-end">
          <div className="w-64 bg-white h-full p-6 flex flex-col justify-between border-l border-slate-100 shadow-2xl animate-slide-in">
            <div>
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                    <Sparkles className="text-white w-5 h-5" />
                  </div>
                  <span className="text-lg font-bold text-slate-800">Affilify</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1.5 text-slate-500 hover:bg-slate-50 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User Bio Card Mobile */}
              <div className="p-4 bg-brand-50/50 rounded-2xl border border-brand-100 mb-6">
                <div className="text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
                  {role === 'seller' ? 'Seller Account' : 'Creator Account'}
                </div>
                <div className="font-extrabold text-slate-850 truncate">
                  {profile?.details?.company_name || profile?.details?.full_name || profile?.email}
                </div>
                <div className="text-xs text-slate-500 truncate mt-0.5">{profile?.email}</div>
              </div>

              {/* Nav Items Mobile */}
              <nav className="space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSection === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSection(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                        isActive 
                          ? 'gradient-bg text-white shadow-md shadow-brand-500/10 font-semibold' 
                          : 'text-slate-600 hover:bg-slate-50 hover:text-brand-600'
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Logout Mobile */}
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden md:flex flex-col justify-between w-64 bg-white border-r border-slate-150 h-screen sticky top-0 px-6 py-8 flex-shrink-0">
        <div>
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2.5 mb-8 px-2">
            <div className="w-9 h-9 rounded-xl gradient-bg flex items-center justify-center shadow-lg shadow-brand-500/20">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <span className="text-2xl font-black text-slate-800 tracking-tight">
              Affili<span className="text-brand-600">fy</span>
            </span>
          </Link>

          {/* User Bio Card */}
          <div className="p-4 bg-brand-50/50 rounded-2xl border border-brand-100 mb-6 mx-1">
            <div className="text-[10px] font-bold text-brand-600 uppercase tracking-widest mb-1">
              {role === 'seller' ? 'Seller Account' : 'Creator Account'}
            </div>
            <div className="font-extrabold text-slate-800 text-sm truncate">
              {profile?.details?.company_name || profile?.details?.full_name || 'My Brand'}
            </div>
            <div className="text-xs text-slate-500 truncate mt-0.5">{profile?.email}</div>
          </div>

          {/* Sidebar Menu Items */}
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                    isActive 
                      ? 'gradient-bg text-white shadow-md shadow-brand-500/10 font-semibold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-brand-600'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Logout button at bottom */}
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-4 py-3 rounded-xl text-left text-rose-600 hover:bg-rose-50 transition-colors mx-1 font-medium"
        >
          <LogOut className="w-5 h-5" />
          <span>Log Out</span>
        </button>
      </aside>

      {/* Main Dashboard Container */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top bar for wallet summary */}
        <div className="bg-white border-b border-slate-100 py-4 px-6 md:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-black text-slate-900 capitalize">
            {activeSection.replace('_', ' ')}
          </h1>
          
          {/* Top Info Bar */}
          <div className="flex items-center gap-4">
            {profile?.wallet && (
              <div className="flex items-center space-x-3.5 bg-slate-50 border border-slate-200 px-4 py-2 rounded-2xl">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Wallet className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase leading-none">Wallet Balance</div>
                  <div className="font-extrabold text-slate-800 text-sm mt-0.5">
                    ${profile.wallet.balance?.toFixed(2) || '0.00'} 
                    <span className="text-[10px] text-slate-400 font-medium ml-1">
                      (${profile.wallet.pending_balance?.toFixed(2) || '0.00'} pending)
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Main Content Area */}
        <div className="p-6 md:p-8 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
