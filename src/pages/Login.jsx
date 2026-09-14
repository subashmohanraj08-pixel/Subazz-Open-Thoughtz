import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ErrorBanner } from '../components/Feedback';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ emailOrUsername: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.emailOrUsername, form.password);
      navigate(location.state?.from?.pathname || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
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
          <p className="text-gray-500 mt-1 text-sm">Think Open. Share Freely. Inspire the World.</p>
        </div>

        <form onSubmit={handleSubmit} className="card p-7 space-y-4">
          <h2 className="font-serif text-xl font-semibold">Welcome back</h2>
          <ErrorBanner message={error} />
          <div>
            <label className="text-sm font-medium">Email or username</label>
            <input
              required
              value={form.emailOrUsername}
              onChange={(e) => setForm({ ...form, emailOrUsername: e.target.value })}
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
              placeholder="••••••••"
            />
            <Link to="/forgot-password" className="text-xs text-brand-600 hover:underline mt-1 inline-block">
              Forgot password?
            </Link>
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          New here?{' '}
          <Link to="/register" className="text-brand-600 font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
