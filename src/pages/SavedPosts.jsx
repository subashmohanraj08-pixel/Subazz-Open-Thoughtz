import { useState, useEffect } from 'react';
import { userService } from '../services/services';
import PostCard from '../components/PostCard';
import { Loader, EmptyState } from '../components/Feedback';

export default function SavedPosts() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userService.getSaved().then(({ data }) => setPosts(data.posts)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container max-w-2xl">
      <h1 className="font-serif text-2xl font-semibold mb-5">Saved posts</h1>
      {loading ? (
        <Loader />
      ) : posts.length === 0 ? (
        <EmptyState icon="🔖" title="Nothing saved yet" subtitle="Bookmark posts to find them here later." />
      ) : (
        posts.map((p) => <PostCard key={p._id} post={p} onDeleted={(id) => setPosts((ps) => ps.filter((x) => x._id !== id))} />)
      )}
    </div>
  );
}
