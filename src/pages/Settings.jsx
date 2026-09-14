import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="page-container max-w-lg">
      <h1 className="font-serif text-2xl font-semibold mb-6">Settings</h1>

      <div className="card p-5 mb-4 space-y-4">
        <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide">Account</h2>
        <div className="flex items-center justify-between">
          <span>Username</span>
          <span className="text-gray-500">@{user?.username}</span>
        </div>
        <div className="flex items-center justify-between">
          <span>Email</span>
          <span className="text-gray-500">{user?.email}</span>
        </div>
        <Link to="/edit-profile" className="btn-secondary inline-block">
          Edit profile
        </Link>
      </div>

      <div className="card p-5 mb-4">
        <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Appearance</h2>
        <div className="flex items-center justify-between">
          <span>{theme === 'dark' ? '🌙 Dark mode' : '☀️ Light mode'}</span>
          <button onClick={toggleTheme} className="btn-secondary">
            Switch to {theme === 'dark' ? 'light' : 'dark'}
          </button>
        </div>
      </div>

      <div className="card p-5">
        <h2 className="font-semibold text-sm text-gray-500 uppercase tracking-wide mb-3">Session</h2>
        <button onClick={logout} className="btn-danger">
          Log out
        </button>
      </div>
    </div>
  );
}
