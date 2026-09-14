import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationService } from '../services/services';
import Avatar from './Avatar';

export default function Header() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [unread, setUnread] = useState(0);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const { data } = await notificationService.getAll();
        setUnread(data.unreadCount);
      } catch (e) {
        /* ignore */
      }
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) navigate(`/explore?q=${encodeURIComponent(query.trim())}`);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 dark:bg-gray-950/90 backdrop-blur border-b border-gray-100 dark:border-gray-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">🪶</span>
          <span className="font-serif text-lg font-semibold tracking-tight hidden sm:block">
            Subaz Open Thoughtz
          </span>
        </Link>

        <form onSubmit={handleSearch} className="flex-1 max-w-md hidden md:block">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search thoughts, people, categories..."
            className="input-field text-sm py-2"
          />
        </form>

        <nav className="flex items-center gap-1 ml-auto">
          <Link to="/" className="hidden sm:block btn-secondary !px-3 !py-2 text-sm">
            Home
          </Link>
          <Link to="/explore" className="hidden sm:block btn-secondary !px-3 !py-2 text-sm">
            Explore
          </Link>
          <Link to="/create" className="btn-primary !px-4 !py-2 text-sm">
            + Post
          </Link>

          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>

          <Link
            to="/notifications"
            className="relative h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            🔔
            {unread > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 text-[10px] flex items-center justify-center bg-accent-500 text-white rounded-full">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>

          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen((o) => !o)} className="ml-1">
              <Avatar src={user?.avatar} name={user?.displayName || user?.username} size="sm" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-52 card p-2 text-sm">
                <Link
                  to={`/profile/${user?.username}`}
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  My profile
                </Link>
                <Link
                  to="/saved"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Saved posts
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setMenuOpen(false)}
                  className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Settings
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-brand-600 dark:text-brand-300 font-medium"
                  >
                    Admin dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600"
                >
                  Log out
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
