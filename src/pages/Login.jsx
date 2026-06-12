import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { redirectByRole } from '../lib/auth/redirectByRole';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Fetch role and redirect
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', data.user.id)
      .single();

    if (dbError || !userData) {
      setError('Could not fetch your account details. Please try again.');
      setLoading(false);
      return;
    }

    navigate(redirectByRole(userData.role), { replace: true });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to Affilify</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            style={styles.input}
          />

          <label style={styles.label}>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            style={styles.input}
          />

          {error && <p style={styles.error}>{error}</p>}
          <div style={{ textAlign: 'right', marginBottom: '10px' }}>
  <button
    type="button"
    onClick={async () => {
      const email = prompt('Enter your email address');

      if (!email) return;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        alert(error.message);
      } else {
        alert('Password reset email sent!');
      }
    }}
    style={{
      background: 'none',
      border: 'none',
      color: '#6366f1',
      cursor: 'pointer',
      fontSize: '0.875rem',
    }}
  >
    Forgot Password?
  </button>
</div>

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/signup" style={styles.link}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f9fafb',
  },
  card: {
    background: '#fff',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    width: '100%',
    maxWidth: '400px',
  },
  title: { margin: 0, fontSize: '1.75rem', fontWeight: 700, color: '#111' },
  subtitle: { margin: '0.4rem 0 1.5rem', color: '#6b7280', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column', gap: '0.5rem' },
  label: { fontSize: '0.875rem', fontWeight: 500, color: '#374151' },
  input: {
    padding: '0.6rem 0.8rem',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    fontSize: '0.95rem',
    marginBottom: '0.5rem',
    outline: 'none',
  },
  error: { color: '#ef4444', fontSize: '0.875rem', margin: '0.25rem 0' },
  button: {
    marginTop: '0.75rem',
    padding: '0.7rem',
    background: '#6366f1',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  footer: { marginTop: '1.25rem', textAlign: 'center', fontSize: '0.875rem', color: '#6b7280' },
  link: { color: '#6366f1', fontWeight: 500, textDecoration: 'none' },
};
