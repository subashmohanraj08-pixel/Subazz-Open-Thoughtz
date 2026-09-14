import { useState, useEffect, useCallback } from 'react';
import { postService, categoryService } from '../services/services';
import PostCard from '../components/PostCard';
import { Loader, EmptyState } from '../components/Feedback';
import { useAuth } from '../context/AuthContext';

const SORTS = [
  { value: 'latest', label: 'Latest' },
  { value: 'trending', label: 'Trending' },
  { value: 'most_liked', label: 'Most liked' },
  { value: 'most_commented', label: 'Most commented' },
];

export default function Home() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [sort, setSort] = useState('latest');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadCategories = useCallback(async () => {
    const { data } = await categoryService.getAll();
    setCategories(data.categories);
  }, []);

  const loadFeed = useCallback(async (p = 1, s = sort, c = category) => {
    setLoading(true);
    try {
      const { data } = await postService.getFeed({ page: p, sort: s, category: c || undefined });
      setPosts(data.posts);
      setTotalPages(data.totalPages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  }, [sort, category]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadFeed(1, sort, category);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, category]);

  const loadMore = async () => {
    const { data } = await postService.getFeed({ page: page + 1, sort, category: category || undefined });
    setPosts((prev) => [...prev, ...data.posts]);
    setPage(page + 1);
  };

  const handleDeleted = (id) => setPosts((prev) => prev.filter((p) => p._id !== id));

  return (
    <div className="page-container">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-semibold">
          {user ? `Welcome back, ${user.displayName || user.username} 👋` : 'The feed'}
        </h1>
        <p className="text-gray-500 text-sm mt-1">Sometimes one small idea can change someone's entire life.</p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-5">
        {SORTS.map((s) => (
          <button
            key={s.value}
            onClick={() => setSort(s.value)}
            className={`text-sm px-4 py-1.5 rounded-full transition ${
              sort === s.value ? 'bg-brand-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
            }`}
          >
            {s.label}
          </button>
        ))}
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="ml-auto text-sm rounded-full px-3 py-1.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="max-w-2xl mx-auto">
        {loading && page === 1 ? (
          <Loader label="Loading thoughts..." />
        ) : posts.length === 0 ? (
          <EmptyState icon="🪶" title="No thoughts yet" subtitle="Be the first to share something with the world." />
        ) : (
          <>
            {posts.map((post) => (
              <PostCard key={post._id} post={post} onDeleted={handleDeleted} />
            ))}
            {page < totalPages && (
              <div className="text-center">
                <button onClick={loadMore} className="btn-secondary">
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
