import { useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { redirectByRole } from './redirectByRole';

const PUBLIC_ROUTES = ['/login', '/signup'];

export default function AuthListener() {
  const navigate = useNavigate();
  const location = useLocation();
  const pathnameRef = useRef(location.pathname);

  // Keep the ref updated with the latest pathname to avoid stale closure in effect
  pathnameRef.current = location.pathname;

  useEffect(() => {
    // Handle initial session on mount
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        await handleUserSession(session.user);
      }
    };

    initAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Handle Supabase password recovery event
        if (event === 'PASSWORD_RECOVERY') {
          navigate('/reset-password', { replace: true });
          return;
        }

        if (event === 'SIGNED_IN' && session?.user) {
          // Fallback check for password recovery flow in URL hash
          if (
            window.location.hash.includes('type=recovery') ||
            window.location.href.includes('type=recovery')
          ) {
            navigate('/reset-password', { replace: true });
            return;
          }

          await handleUserSession(session.user);
        }

        if (event === 'SIGNED_OUT') {
          navigate('/login', { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleUserSession = async (user) => {
    // Don't redirect if already on a dashboard route
    if (!PUBLIC_ROUTES.includes(pathnameRef.current)) return;

    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single();

    if (error || !data) {
      console.error('AuthListener: could not fetch user role', error);
      return;
    }

    const destination = redirectByRole(data.role);
    navigate(destination, { replace: true });
  };

  return null;
}

