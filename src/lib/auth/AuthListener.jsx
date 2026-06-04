import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabase';
import { redirectByRole } from './redirectByRole';

export default function AuthListener() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Handle automatic redirect upon SIGNED_IN event
      if (event === 'SIGNED_IN' && session?.user) {
        const publicPaths = ['/', '/login', '/signup'];
        if (publicPaths.includes(location.pathname)) {
          await redirectByRole(session.user, navigate);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  return null;
}
