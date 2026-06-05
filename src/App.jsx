import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import AuthListener from './lib/auth/AuthListener';
import { redirectByRole } from './lib/auth/redirectByRole';

import Landing from './pages/Landing';
 import Login from './pages/Login';
import Signup from './pages/Signup';
import SellerDashboard from './pages/SellerDashboard';
import CreatorDashboard from './pages/CreatorDashboard';



/**
 * ProtectedRoute
 * Wraps a route and enforces:
 *   1. User must be authenticated
 *   2. User's role must match the `allowedRole` prop (if provided)
 */
function ProtectedRoute({ children, allowedRole }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'authorized' | 'unauthorized' | 'wrong-role'
  const [redirectTo, setRedirectTo] = useState(null);

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        setStatus('unauthorized');
        return;
      }

      if (!allowedRole) {
        setStatus('authorized');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('auth_id', session.user.id)
        .single();

      if (error || !data) {
        setStatus('unauthorized');
        return;
      }

      if (data.role !== allowedRole) {
        // Redirect to the correct dashboard instead of 403
        setRedirectTo(redirectByRole(data.role));
        setStatus('wrong-role');
        return;
      }

      setStatus('authorized');
    };

    check();
  }, [allowedRole]);

  if (status === 'loading') return null; // or a spinner
  if (status === 'unauthorized') return <Navigate to="/login" replace />;
  if (status === 'wrong-role') return <Navigate to={redirectTo} replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      {/* AuthListener must be inside BrowserRouter to use useNavigate */}
      <AuthListener />

      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} /> 
<Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected — Seller */}
        <Route
          path="/dashboard/seller"
          element={
            <ProtectedRoute allowedRole="seller">
              <SellerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Protected — Creator */}
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
  );
}
