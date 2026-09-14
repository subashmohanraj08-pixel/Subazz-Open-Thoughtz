import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/services';
import { ErrorBanner, SuccessBanner } from '../components/Feedback';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [devUrl, setDevUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);
    try {
      const { data } = await authService.forgotPassword(email);
      setMessage(data.message);
      if (data.devResetUrl) setDevUrl(data.devResetUrl);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-50 via-white to-accent-400/10 dark:from-gray-950 dark:via-gray-950 dark:to-brand-900/20">
      <div className="w-full max-w-md card p-7">
        <h2 className="font-serif text-xl font-semibold mb-1">Reset your password</h2>
        <p className="text-sm text-gray-500 mb-4">We'll send a reset link to your email.</p>
        <ErrorBanner message={error} />
        <SuccessBanner message={message} />
        {devUrl && (
          <p className="text-xs text-gray-400 mb-4 break-all">
            Dev mode link: <a className="text-brand-600" href={devUrl}>{devUrl}</a>
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            placeholder="you@example.com"
          />
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? 'Sending...' : 'Send reset link'}
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
