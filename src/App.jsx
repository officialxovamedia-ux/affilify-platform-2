import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import SellerDashboard from './pages/SellerDashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import CreateCampaign from './pages/CreateCampaign';
import { Loader2 } from 'lucide-react';

// Route protector component
function ProtectedRoute({ children, allowedRole }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-brand-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRole && profile?.role !== allowedRole) {
    // If user has a different role, send them to their corresponding dashboard
    if (profile?.role === 'seller') {
      return <Navigate to="/seller/dashboard" replace />;
    } else if (profile?.role === 'creator') {
      return <Navigate to="/creator/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Seller Routes */}
          <Route 
            path="/seller/dashboard" 
            element={
              <ProtectedRoute allowedRole="seller">
                <SellerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/seller/create-campaign" 
            element={
              <ProtectedRoute allowedRole="seller">
                <CreateCampaign />
              </ProtectedRoute>
            } 
          />

          {/* Creator Routes */}
          <Route 
            path="/creator/dashboard" 
            element={
              <ProtectedRoute allowedRole="creator">
                <CreatorDashboard />
              </ProtectedRoute>
            } 
          />

          {/* Catch-all redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
