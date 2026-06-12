import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import { useAuth, AuthProvider } from './contexts/AuthContext';
import AuthListener from './lib/auth/AuthListener';
import { redirectByRole } from './lib/auth/redirectByRole';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import SellerDashboard from './pages/SellerDashboard';
import CreatorDashboard from './pages/CreatorDashboard';
import CreateCampaign from './pages/CreateCampaign';
import PendingApproval from './pages/PendingApproval';
import RejectedPage from './pages/RejectedPage';
import SuspendedPage from './pages/SuspendedPage';
import BannedPage from './pages/BannedPage';
import { Loader2 } from 'lucide-react';

function ProtectedRoute({ children, allowedRole }) {
  const { loading: authLoading, user } = useAuth();
  const [status, setStatus] = useState('loading');
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    if (authLoading) return;

    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setStatus('unauthorized');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('role, status')
        .eq('auth_id', session.user.id)
        .single();

      if (error || !data) {
        setStatus('unauthorized');
        return;
      }

      // Status check — approval workflow
      if (data.status === 'pending') {
        setStatus('pending');
        return;
      }
      if (data.status === 'rejected') {
        setStatus('rejected');
        return;
      }
      if (data.status === 'suspended') {
        setStatus('suspended');
        return;
      }
      if (data.status === 'banned') {
        setStatus('banned');
        return;
      }

      // Role check
      if (!allowedRole) {
        setStatus('authorized');
        return;
      }
      if (data.role !== allowedRole) {
        setRedirectTo(redirectByRole(data.role));
        setStatus('wrong-role');
        return;
      }

      setStatus('authorized');
    };

    check();
  }, [allowedRole, authLoading]);

  if (authLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
      </div>
    );
  }

  if (status === 'unauthorized')  return <Navigate to="/login" replace />;
  if (status === 'pending')       return <Navigate to="/pending-approval" replace />;
  if (status === 'rejected')      return <Navigate to="/rejected" replace />;
  if (status === 'suspended')     return <Navigate to="/suspended" replace />;
  if (status === 'banned')        return <Navigate to="/banned" replace />;
  if (status === 'wrong-role')    return <Navigate to={redirectTo} replace />;

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthListener />
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
<Route path="/reset-password" element={<ResetPassword />} />
          {/* Status routes */}
          <Route path="/pending-approval" element={<PendingApproval />} />
          <Route path="/rejected" element={<RejectedPage />} />
          <Route path="/suspended" element={<SuspendedPage />} />
          <Route path="/banned" element={<BannedPage />} />

          {/* Protected routes */}
          <Route
            path="/dashboard/seller"
            element={
              <ProtectedRoute allowedRole="seller">
                <SellerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
  path="/dashboard/seller/create-campaign"
  element={
    <ProtectedRoute allowedRole="seller">
      <CreateCampaign />
    </ProtectedRoute>
  }
/>
          <Route
            path="/dashboard/creator"
            element={
              <ProtectedRoute allowedRole="creator">
                <CreatorDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}