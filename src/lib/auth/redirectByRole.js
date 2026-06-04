import { supabase } from '../supabase';

/**
 * Fetches the user's role from the 'users' table matching 'auth_id' with 'user.id' (auth.uid()),
 * and navigates to the appropriate dashboard.
 * 
 * @param {object} user - The Supabase auth user object
 * @param {function} navigate - The useNavigate hook function
 */
export async function redirectByRole(user, navigate) {
  if (!user) return;
  try {
    const { data, error } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching role in redirectByRole:', error);
      return;
    }

    if (data?.role === 'seller') {
      navigate('/dashboard/seller', { replace: true });
    } else if (data?.role === 'creator') {
      navigate('/dashboard/creator', { replace: true });
    } else {
      console.warn('Unknown role or role not set:', data?.role);
      navigate('/', { replace: true });
    }
  } catch (err) {
    console.error('Failed to redirect by role:', err);
  }
}
