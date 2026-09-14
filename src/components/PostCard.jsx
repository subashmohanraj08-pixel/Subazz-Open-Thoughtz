import { useState } from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';
import { postService, reportService } from '../services/services';
import { timeAgo } from '../utils/time';
import ReportModal from './ReportModal';

export default function PostCard({ post, onUpdated, onDeleted, detailed = false }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(post.isLikedByMe);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [showMenu, setShowMenu] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [busy, setBusy] = useState(false);

  // Mirrors the backend's ownership rule for UI purposes only - the real
  // enforcement lives server-side in requireOwnershipOrAdmin.
  const isOwner = user && post.author?._id === user.id;
  const isAdmin = user?.role === 'admin';
  const canModify = isOwner || isAdmin;

  const toggleLike = async () => {
    if (!user) return;
    setBusy(true);
    try {
      if (liked) {
        const { data } = await postService.unlike(post._id);
        setLiked(false);
        setLikesCount(data.likesCount);
      } else {
        const { data } = await postService.like(post._id);
        setLiked(true);
        setLikesCount(data.likesCount);
      }
    } finally {
      setBusy(false);
    }
  };

  const handleShare = async () => {
    const { data } = await postService.share(post._id);
    if (navigator.clipboard) await navigator.clipboard.writeText(data.shareUrl);
    alert('Link copied to clipboard!');
  };

  const handleSave = async () => {
    await postService.save(post._id);
    alert('Saved to your bookmarks.');
  };

  const handleDelete = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    await postService.delete(post._id);
    onDeleted?.(post._id);
  };

  return (
    <article className="card p-5 mb-4">
      <div className="flex items-start justify-between">
        <Link to={`/profile/${post.author?.username}`} className="flex items-center gap-3 group">
          <Avatar src={post.author?.avatar} name={post.author?.displayName || post.author?.username} />
          <div>
            <p className="font-semibold group-hover:text-brand-600 transition">
              {post.author?.displayName || post.author?.username}
            </p>
            <p className="text-xs text-gray-400">
              @{post.author?.username} · {timeAgo(post.createdAt)}
              {post.category && ` · ${post.category.emoji} ${post.category.name}`}
            </p>
          </div>
        </Link>

        <div className="relative">
          <button
            onClick={() => setShowMenu((s) => !s)}
            className="h-8 w-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center text-gray-400"
          >
            ⋯
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-44 card p-1.5 text-sm z-10">
              {canModify && (
                <>
                  <Link
                    to={`/edit-post/${post._id}`}
                    className="block px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    Edit post
                  </Link>
                  <button
                    onClick={handleDelete}
                    className="w-full text-left px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/50 text-red-600"
                  >
                    Delete post
                  </button>
                </>
              )}
              {!isOwner && (
                <button
                  onClick={() => {
                    setShowMenu(false);
                    setShowReport(true);
                  }}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  Report
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <Link to={`/post/${post._id}`}>
        {post.title && <h3 className="font-serif text-lg font-semibold mt-3">{post.title}</h3>}
        <p className={`mt-2 whitespace-pre-wrap ${detailed ? 'text-base' : 'text-sm'}`}>{post.content}</p>
      </Link>

      {post.image && (
        <img src={post.image} alt="" className="mt-3 rounded-xl w-full max-h-[480px] object-cover" />
      )}
      {post.video && (
        <video src={post.video} controls className="mt-3 rounded-xl w-full max-h-[480px]" />
      )}

      <div className="flex items-center gap-1 mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500">
        <button
          onClick={toggleLike}
          disabled={busy || !user}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
            liked ? 'text-accent-500' : ''
          }`}
        >
          {liked ? '❤️' : '🤍'} {likesCount}
        </button>
        <Link
          to={`/post/${post._id}`}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          💬 {post.commentsCount}
        </Link>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition"
        >
          🔗 Share
        </button>
        <button
          onClick={handleSave}
          disabled={!user}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition ml-auto"
        >
          🔖 Save
        </button>
      </div>

      {showReport && (
        <ReportModal
          targetType="post"
          targetId={post._id}
          onClose={() => setShowReport(false)}
        />
      )}
    </article>
  );
}
