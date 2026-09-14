import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { authService } from '../services/services';
import { ErrorBanner } from '../components/Feedback';

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token') || '';
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      alert('Password reset successfully. Please log in.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Reset link is invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-50 via-white to-accent-400/10 dark:from-gray-950 dark:via-gray-950 dark:to-brand-900/20">
      <div className="w-full max-w-md card p-7">
        <h2 className="font-serif text-xl font-semibold mb-1">Set a new password</h2>
        <ErrorBanner message={error} />
        {!token && <p className="text-sm text-red-500 mb-3">No reset token found in the URL.</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="password"
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
            placeholder="New password"
          />
          <input
            required
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="input-field"
            placeholder="Confirm new password"
          />
          <button className="btn-primary w-full" disabled={loading || !token}>
            {loading ? 'Resetting...' : 'Reset password'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-5">
          <Link to="/login" className="text-brand-600 font-medium">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
