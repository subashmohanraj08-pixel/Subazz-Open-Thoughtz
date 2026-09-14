import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/Feedback';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await register({ username: form.username, email: form.email, password: form.password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-50 via-white to-accent-400/10 dark:from-gray-950 dark:via-gray-950 dark:to-brand-900/20">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-2">🪶</div>
          <h1 className="font-serif text-3xl font-semibold">Subaz Open Thoughtz</h1>
          <p className="text-gray-500 mt-1 text-sm">Join a community that thinks out loud.</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-7 space-y-4">
          <h2 className="font-serif text-xl font-semibold">Create your account</h2>
          <ErrorBanner message={error} />
          <div>
            <label className="text-sm font-medium">Username</label>
            <input
              required
              minLength={3}
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="input-field mt-1"
              placeholder="yourname"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field mt-1"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Password</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field mt-1"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Confirm password</label>
            <input
              required
              type="password"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
              className="input-field mt-1"
            />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 font-medium">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
