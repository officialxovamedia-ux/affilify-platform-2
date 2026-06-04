import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { redirectByRole } from './redirectByRole';

const PUBLIC_ROUTES = ['/login', '/signup'];

export default function AuthListener() {
  const navigate = useNavigate();
  const location = useLocation();

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
        if (event === 'SIGNED_IN' && session?.user) {
          await handleUserSession(session.user);
        }

        if (event === 'SIGNED_OUT') {
          navigate('/login', { replace: true });
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleUserSession = async (user) => {
    // Don't redirect if already on a dashboard route
    if (!PUBLIC_ROUTES.includes(location.pathname)) return;

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
