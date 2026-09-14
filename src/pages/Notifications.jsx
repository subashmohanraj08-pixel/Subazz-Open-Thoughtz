import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/services';
import Avatar from '../components/Avatar';
import { Loader, EmptyState } from '../components/Feedback';
import { timeAgo } from '../utils/time';

const ICONS = { like: '❤️', comment: '💬', follow: '➕', mention: '📣', report_update: '🚨' };

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await notificationService.getAll();
      setNotifications(data.notifications);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const markAllRead = async () => {
    await notificationService.markAllRead();
    setNotifications((ns) => ns.map((n) => ({ ...n, isRead: true })));
  };

  const markRead = async (n) => {
    if (n.isRead) return;
    await notificationService.markRead(n._id);
    setNotifications((ns) => ns.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
  };

  return (
    <div className="page-container max-w-xl">
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-serif text-2xl font-semibold">Notifications</h1>
        {notifications.some((n) => !n.isRead) && (
          <button onClick={markAllRead} className="text-sm text-brand-600 font-medium">
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <Loader />
      ) : notifications.length === 0 ? (
        <EmptyState icon="🔔" title="No notifications yet" subtitle="Likes, comments, and follows will show up here." />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Link
              to={n.post ? `/post/${n.post._id}` : `/profile/${n.sender?.username}`}
              key={n._id}
              onClick={() => markRead(n)}
              className={`card p-4 flex items-center gap-3 ${!n.isRead ? 'border-l-4 border-l-brand-500' : ''}`}
            >
              <Avatar src={n.sender?.avatar} name={n.sender?.displayName || n.sender?.username} size="sm" />
              <div className="flex-1">
                <p className="text-sm">
                  <span className="mr-1">{ICONS[n.type] || '🔔'}</span>
                  {n.message}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{timeAgo(n.createdAt)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
