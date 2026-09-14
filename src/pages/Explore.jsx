import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { postService, userService, categoryService } from '../services/services';
import PostCard from '../components/PostCard';
import Avatar from '../components/Avatar';
import { Loader, EmptyState } from '../components/Feedback';

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const initialQ = params.get('q') || '';
  const [query, setQuery] = useState(initialQ);
  const [tab, setTab] = useState('posts');
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    categoryService.getAll().then(({ data }) => setCategories(data.categories));
  }, []);

  const runSearch = async (q) => {
    setLoading(true);
    try {
      const [postsRes, usersRes] = await Promise.all([postService.search(q), userService.search(q)]);
      setPosts(postsRes.data.posts);
      setUsers(usersRes.data.users);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQ) runSearch(initialQ);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQ]);

  const handleSearch = (e) => {
    e.preventDefault();
    setParams(query ? { q: query } : {});
    runSearch(query);
  };

  return (
    <div className="page-container max-w-2xl">
      <h1 className="font-serif text-2xl font-semibold mb-4">Explore</h1>

      <form onSubmit={handleSearch} className="mb-5">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search thoughts, people, categories..."
          className="input-field"
        />
      </form>

      {!query && (
        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((c) => (
            <Link
              key={c._id}
              to={`/?category=${c._id}`}
              className="text-sm px-4 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-brand-100 dark:hover:bg-brand-900 transition"
            >
              {c.emoji} {c.name}
            </Link>
          ))}
        </div>
      )}

      {query && (
        <>
          <div className="flex gap-2 mb-5">
            <button
              onClick={() => setTab('posts')}
              className={`text-sm px-4 py-1.5 rounded-full ${tab === 'posts' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
            >
              Posts ({posts.length})
            </button>
            <button
              onClick={() => setTab('people')}
              className={`text-sm px-4 py-1.5 rounded-full ${tab === 'people' ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800'}`}
            >
              People ({users.length})
            </button>
          </div>

          {loading ? (
            <Loader label="Searching..." />
          ) : tab === 'posts' ? (
            posts.length === 0 ? (
              <EmptyState icon="🔍" title="No posts found" />
            ) : (
              posts.map((p) => <PostCard key={p._id} post={p} />)
            )
          ) : users.length === 0 ? (
            <EmptyState icon="🔍" title="No people found" />
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <Link key={u._id} to={`/profile/${u.username}`} className="card p-4 flex items-center gap-3">
                  <Avatar src={u.avatar} name={u.displayName || u.username} />
                  <div>
                    <p className="font-semibold">{u.displayName || u.username}</p>
                    <p className="text-xs text-gray-400">@{u.username}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
