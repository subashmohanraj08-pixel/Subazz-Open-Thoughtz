import { useState, useEffect } from 'react';
import { adminService } from '../../services/services';
import { Loader } from '../../components/Feedback';
import { timeAgo } from '../../utils/time';

const STATUS_OPTIONS = ['pending', 'reviewed', 'action_taken', 'dismissed'];
const STATUS_STYLES = {
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  reviewed: 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
  action_taken: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
  dismissed: 'bg-gray-100 text-gray-500 dark:bg-gray-800',
};

const REASON_LABELS = {
  spam: 'Spam',
  harassment: 'Harassment',
  hate_abuse: 'Hate / abuse',
  misinformation: 'Misinformation',
  inappropriate: 'Inappropriate',
  other: 'Other',
};

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [filter, setFilter] = useState('pending');
  const [loading, setLoading] = useState(true);

  const load = async (status = filter) => {
    setLoading(true);
    try {
      const { data } = await adminService.getReports({ status: status || undefined });
      setReports(data.reports);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id, status) => {
    const reviewNote = status === 'action_taken' ? prompt('Note for this decision (optional):') || '' : '';
    await adminService.updateReport(id, { status, reviewNote });
    load(filter);
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold mb-5">Reports</h1>

      <div className="flex gap-2 mb-5">
        {['', ...STATUS_OPTIONS].map((s) => (
          <button
            key={s || 'all'}
            onClick={() => setFilter(s)}
            className={`text-sm px-3 py-1.5 rounded-full ${filter === s ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
          >
            {s ? s.replace('_', ' ') : 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r._id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm">
                    <span className="font-medium">@{r.reporter?.username}</span> reported a{' '}
                    <span className="font-medium">{r.targetType}</span> for{' '}
                    <span className="font-medium">{REASON_LABELS[r.reason]}</span>
                  </p>
                  {r.details && <p className="text-sm text-gray-500 mt-1">"{r.details}"</p>}
                  <p className="text-xs text-gray-400 mt-1">
                    Target ID: {r.targetId} · {timeAgo(r.createdAt)}
                  </p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${STATUS_STYLES[r.status]}`}>
                  {r.status.replace('_', ' ')}
                </span>
              </div>
              <div className="flex gap-1.5 mt-3">
                {STATUS_OPTIONS.filter((s) => s !== r.status).map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(r._id, s)}
                    className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    Mark {s.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {reports.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No reports found.</p>}
        </div>
      )}
    </div>
  );
}
