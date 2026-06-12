import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { redirectByRole } from '../lib/auth/redirectByRole';

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('creator');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
  e.preventDefault();

  setError('');
  setLoading(true);

  try {
    await signUp(
      email,
      password,
      role,
      {}
    );

    navigate('/pending-approval');

  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Create your account</h1>
        <p style={styles.subtitle}>Join Affilify as a seller or creator</p>

        <form onSubmit={handleSignup} style={styles.form}>
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
            placeholder="Min. 6 characters"
            required
            minLength={6}
            style={styles.input}
          />

          <label style={styles.label}>I am a…</label>
          <div style={styles.roleGroup}>
            {['creator', 'seller'].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                style={{
                  ...styles.roleBtn,
                  ...(role === r ? styles.roleBtnActive : {}),
                }}
              >
                {r === 'creator' ? '🎥 Creator' : '🛒 Seller'}
              </button>
            ))}
          </div>

          {error && <p style={styles.error}>{error}</p>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Creating account…' : 'Sign Up'}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={styles.link}>Sign in</Link>
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
  roleGroup: { display: 'flex', gap: '0.75rem', margin: '0.25rem 0 0.75rem' },
  roleBtn: {
    flex: 1,
    padding: '0.6rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    background: '#fff',
    fontSize: '0.9rem',
    fontWeight: 500,
    cursor: 'pointer',
    color: '#374151',
    transition: 'all 0.15s',
  },
  roleBtnActive: {
    border: '2px solid #6366f1',
    background: '#eef2ff',
    color: '#4f46e5',
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
