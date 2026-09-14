import { NavLink, Outlet } from 'react-router-dom';

const LINKS = [
  { to: '/admin', label: 'Dashboard', icon: '📊', end: true },
  { to: '/admin/users', label: 'Users', icon: '👥' },
  { to: '/admin/posts', label: 'Posts', icon: '📝' },
  { to: '/admin/comments', label: 'Comments', icon: '💬' },
  { to: '/admin/reports', label: 'Reports', icon: '🚨' },
  { to: '/admin/categories', label: 'Categories', icon: '🗂️' },
];

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      <aside className="w-56 shrink-0 border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hidden sm:block">
        <div className="flex items-center gap-2 mb-6 px-2">
          <span className="text-2xl">👑</span>
          <span className="font-serif font-semibold">Admin</span>
        </div>
        <nav className="space-y-1">
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition ${
                  isActive ? 'bg-brand-600 text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              <span>{l.icon}</span> {l.label}
            </NavLink>
          ))}
          <NavLink to="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 mt-4">
            ← Back to site
          </NavLink>
        </nav>
      </aside>
      <div className="flex-1 min-w-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
