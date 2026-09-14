import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { postService } from '../services/services';
import PostCard from '../components/PostCard';
import CommentSection from '../components/CommentSection';
import { Loader, EmptyState } from '../components/Feedback';

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await postService.getById(id);
      setPost(data.post);
    } catch (err) {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleDeleted = () => navigate('/');

  const handleCountChange = (delta) => {
    setPost((p) => (p ? { ...p, commentsCount: p.commentsCount + delta } : p));
  };

  if (loading) return <Loader label="Loading post..." />;
  if (notFound || !post)
    return <EmptyState icon="🔍" title="Post not found" subtitle="It may have been removed or hidden." />;

  return (
    <div className="page-container max-w-2xl">
      <PostCard post={post} detailed onDeleted={handleDeleted} />
      <div className="card p-5">
        <h3 className="font-serif font-semibold mb-2">Comments</h3>
        <CommentSection postId={post._id} onCountChange={handleCountChange} />
      </div>
    </div>
  );
}
