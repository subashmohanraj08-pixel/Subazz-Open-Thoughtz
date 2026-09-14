import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/services';
import { Loader } from '../../components/Feedback';

export default function AdminPosts() {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [filterHidden, setFilterHidden] = useState(false);

  const load = async (p = 1, hidden = filterHidden) => {
    setLoading(true);
    try {
      const { data } = await adminService.getPosts({ page: p, hidden: hidden || undefined });
      setPosts(data.posts);
      setTotalPages(data.totalPages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, filterHidden);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterHidden]);

  const toggleHide = async (post) => {
    if (post.isHidden) await adminService.unhidePost(post._id);
    else {
      const reason = prompt('Reason for hiding this post (optional):') || '';
      await adminService.hidePost(post._id, reason);
    }
    load(page, filterHidden);
  };

  const remove = async (id) => {
    if (!confirm('Permanently delete this post?')) return;
    await adminService.deletePost(id);
    load(page, filterHidden);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="font-serif text-2xl font-semibold">Post management</h1>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={filterHidden} onChange={(e) => setFilterHidden(e.target.checked)} />
          Show hidden only
        </label>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="space-y-3">
          {posts.map((p) => (
            <div key={p._id} className="card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <Link to={`/post/${p._id}`} className="font-medium hover:text-brand-600 line-clamp-1">
                    {p.title || p.content.slice(0, 60)}
                  </Link>
                  <p className="text-xs text-gray-400 mt-0.5">
                    by @{p.author?.username} · {p.likesCount} likes · {p.commentsCount} comments
                    {p.isHidden && <span className="ml-2 text-red-500">HIDDEN</span>}
                  </p>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{p.content}</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <button onClick={() => toggleHide(p)} className="text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-600 dark:bg-yellow-950">
                    {p.isHidden ? 'Unhide' : 'Hide'}
                  </button>
                  <button onClick={() => remove(p._id)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 dark:bg-red-950">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          {posts.length === 0 && <p className="text-sm text-gray-400 text-center py-8">No posts found.</p>}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => load(i + 1, filterHidden)}
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
