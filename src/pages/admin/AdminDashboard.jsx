import { useState, useEffect } from 'react';
import { adminService } from '../../services/services';
import { Loader } from '../../components/Feedback';

const CARDS = [
  { key: 'totalUsers', label: 'Total users', icon: '👥', color: 'from-brand-500 to-brand-700' },
  { key: 'totalPosts', label: 'Total posts', icon: '📝', color: 'from-accent-400 to-accent-500' },
  { key: 'totalComments', label: 'Total comments', icon: '💬', color: 'from-blue-400 to-blue-600' },
  { key: 'totalLikes', label: 'Total likes', icon: '❤️', color: 'from-pink-400 to-pink-600' },
  { key: 'pendingReports', label: 'Pending reports', icon: '🚨', color: 'from-red-400 to-red-600' },
  { key: 'suspendedUsers', label: 'Suspended/blocked', icon: '⛔', color: 'from-gray-400 to-gray-600' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [chart, setChart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStats().then(({ data }) => {
      setStats(data.stats);
      setChart(data.postsLast7Days);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader label="Loading statistics..." />;

  const maxCount = Math.max(1, ...chart.map((c) => c.count));

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold mb-6">Platform overview</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {CARDS.map((c) => (
          <div key={c.key} className="card p-5">
            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br ${c.color} text-white text-lg mb-2`}>
              {c.icon}
            </div>
            <p className="text-2xl font-bold">{stats[c.key] ?? 0}</p>
            <p className="text-xs text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-4">Posts created (last 7 days)</h2>
        <div className="flex items-end gap-3 h-32">
          {chart.length === 0 && <p className="text-sm text-gray-400">No post activity yet.</p>}
          {chart.map((c) => (
            <div key={c._id} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full bg-gradient-to-t from-brand-500 to-accent-500 rounded-t-md"
                style={{ height: `${(c.count / maxCount) * 100}%`, minHeight: 4 }}
              />
              <span className="text-[10px] text-gray-400">{c._id.slice(5)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
