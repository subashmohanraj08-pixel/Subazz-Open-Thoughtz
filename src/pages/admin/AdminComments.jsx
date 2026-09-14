import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/services';
import { Loader } from '../../components/Feedback';
import { timeAgo } from '../../utils/time';

export default function AdminComments() {
  const [comments, setComments] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async (p = 1) => {
    setLoading(true);
    try {
      const { data } = await adminService.getComments({ page: p });
      setComments(data.comments);
      setTotalPages(data.totalPages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1);
  }, []);

  const remove = async (id) => {
    if (!confirm('Delete this comment?')) return;
    await adminService.deleteComment(id);
    load(page);
  };

  const edit = async (comment) => {
    const content = prompt('Edit comment:', comment.content);
    if (content === null || content.trim() === comment.content) return;
    await adminService.updateComment(comment._id, content);
    load(page);
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold mb-5">Comment management</h1>

      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-2">
          {comments.map((c) => (
            <div key={c._id} className="card p-4 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm">{c.content}</p>
                <p className="text-xs text-gray-400 mt-1">
                  by @{c.author?.username} · {timeAgo(c.createdAt)} ·{' '}
                  {c.post && (
                    <Link to={`/post/${c.post._id}`} className="text-brand-600">
                      view post
                    </Link>
                  )}
                </p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => edit(c)} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                  Edit
                </button>
                <button onClick={() => remove(c._id)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 dark:bg-red-950">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {comments.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No comments found.</p>}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => load(i + 1)}
              className={`h-8 w-8 rounded-full text-sm ${page === i + 1 ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
