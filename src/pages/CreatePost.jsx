import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { postService, categoryService } from '../services/services';
import { ErrorBanner } from '../components/Feedback';

export default function CreatePost() {
  const navigate = useNavigate();
  const { id } = useParams(); // present when editing
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    categoryService.getAll().then(({ data }) => setCategories(data.categories));
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    postService.getById(id).then(({ data }) => {
      const p = data.post;
      setTitle(p.title || '');
      setContent(p.content);
      setCategory(p.category?._id || '');
      if (p.image) setImagePreview(p.image);
    });
  }, [id, isEdit]);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please write your thought before publishing.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (title) formData.append('title', title);
      if (category) formData.append('category', category);
      if (imageFile) formData.append('image', imageFile);
      if (videoFile) formData.append('video', videoFile);

      if (isEdit) {
        const { data } = await postService.update(id, formData);
        navigate(`/post/${data.post._id}`);
      } else {
        const { data } = await postService.create(formData);
        navigate(`/post/${data.post._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Could not publish your post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-2xl">
      <h1 className="font-serif text-2xl font-semibold mb-1">{isEdit ? 'Edit your post' : 'Share a thought'}</h1>
      <p className="text-gray-500 text-sm mb-6">
        "Sometimes one small idea can change someone's entire life."
      </p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <ErrorBanner message={error} />

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title (optional)"
          className="input-field"
        />

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind?"
          rows={6}
          maxLength={5000}
          className="input-field resize-none"
        />
        <p className="text-xs text-gray-400 text-right">{content.length}/5000</p>

        <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
          <option value="">No category</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.emoji} {c.name}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-3">
          <label className="btn-secondary text-center cursor-pointer">
            🖼️ {imageFile ? imageFile.name.slice(0, 14) + '...' : 'Add image'}
            <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
          </label>
          <label className="btn-secondary text-center cursor-pointer">
            🎥 {videoFile ? videoFile.name.slice(0, 14) + '...' : 'Add video'}
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              className="hidden"
            />
          </label>
        </div>

        {imagePreview && <img src={imagePreview} alt="preview" className="rounded-xl max-h-72 object-cover w-full" />}

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button className="btn-primary" disabled={loading}>
            {loading ? 'Publishing...' : isEdit ? 'Save changes' : 'Publish thought'}
          </button>
        </div>
      </form>
    </div>
  );
}
