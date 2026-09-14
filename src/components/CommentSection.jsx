import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import { useAuth } from '../context/AuthContext';
import { postService, commentService } from '../services/services';
import { timeAgo } from '../utils/time';
import { Loader } from './Feedback';

export default function CommentSection({ postId, onCountChange }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [posting, setPosting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await postService.getComments(postId);
      setComments(data.comments);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [postId]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setPosting(true);
    try {
      const { data } = await postService.addComment(postId, text);
      setComments((c) => [data.comment, ...c]);
      setText('');
      onCountChange?.(1);
    } finally {
      setPosting(false);
    }
  };

  const startEdit = (comment) => {
    setEditingId(comment._id);
    setEditText(comment.content);
  };

  const saveEdit = async (id) => {
    const { data } = await commentService.update(id, editText);
    setComments((cs) => cs.map((c) => (c._id === id ? data.comment : c)));
    setEditingId(null);
  };

  const removeComment = async (id) => {
    if (!confirm('Delete this comment?')) return;
    await commentService.delete(id);
    setComments((cs) => cs.filter((c) => c._id !== id));
    onCountChange?.(-1);
  };

  return (
    <div className="mt-4">
      {user ? (
        <form onSubmit={submitComment} className="flex gap-2 mb-4">
          <Avatar src={user.avatar} name={user.displayName || user.username} size="sm" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Add a thoughtful comment..."
            className="input-field text-sm py-2"
          />
          <button className="btn-primary !px-4 !py-2 text-sm" disabled={posting}>
            Post
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500 mb-4">
          <Link to="/login" className="text-brand-600 font-medium">
            Log in
          </Link>{' '}
          to join the conversation.
        </p>
      )}

      {loading ? (
        <Loader label="Loading comments..." />
      ) : comments.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-6">No comments yet. Be the first to share your thoughts.</p>
      ) : (
        <div className="space-y-4">
          {comments.map((c) => {
            const isOwner = user && c.author?._id === user.id;
            const canModify = isOwner || user?.role === 'admin';
            return (
              <div key={c._id} className="flex gap-3">
                <Avatar src={c.author?.avatar} name={c.author?.displayName || c.author?.username} size="sm" />
                <div className="flex-1">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-sm">{c.author?.displayName || c.author?.username}</p>
                      <span className="text-xs text-gray-400">
                        {timeAgo(c.createdAt)} {c.isEdited && '· edited'}
                      </span>
                    </div>
                    {editingId === c._id ? (
                      <div className="mt-1 flex gap-2">
                        <input
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="input-field text-sm py-1.5"
                        />
                        <button onClick={() => saveEdit(c._id)} className="text-brand-600 text-sm font-medium">
                          Save
                        </button>
                        <button onClick={() => setEditingId(null)} className="text-gray-400 text-sm">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <p className="text-sm mt-0.5">{c.content}</p>
                    )}
                  </div>
                  {canModify && editingId !== c._id && (
                    <div className="flex gap-3 mt-1 ml-3 text-xs text-gray-400">
                      {isOwner && (
                        <button onClick={() => startEdit(c)} className="hover:text-brand-600">
                          Edit
                        </button>
                      )}
                      <button onClick={() => removeComment(c._id)} className="hover:text-red-500">
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
