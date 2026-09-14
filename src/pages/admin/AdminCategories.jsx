import { useState, useEffect } from 'react';
import { categoryService } from '../../services/services';
import { Loader } from '../../components/Feedback';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', emoji: '💡', description: '' });
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await categoryService.getAll();
      setCategories(data.categories);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const resetForm = () => {
    setForm({ name: '', emoji: '💡', description: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    if (editingId) {
      await categoryService.update(editingId, form);
    } else {
      await categoryService.create(form);
    }
    resetForm();
    load();
  };

  const startEdit = (c) => {
    setEditingId(c._id);
    setForm({ name: c.name, emoji: c.emoji, description: c.description || '' });
  };

  const remove = async (id) => {
    if (!confirm('Delete this category? Posts in it will keep their reference removed.')) return;
    await categoryService.delete(id);
    load();
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold mb-5">Categories</h1>

      <form onSubmit={handleSubmit} className="card p-5 mb-6 grid grid-cols-1 sm:grid-cols-[80px_1fr_1fr_auto] gap-3 items-start">
        <input
          value={form.emoji}
          onChange={(e) => setForm({ ...form, emoji: e.target.value })}
          className="input-field text-center"
          placeholder="💡"
        />
        <input
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="input-field"
          placeholder="Category name"
          required
        />
        <input
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="input-field"
          placeholder="Description (optional)"
        />
        <div className="flex gap-2">
          <button className="btn-primary">{editingId ? 'Save' : 'Add'}</button>
          {editingId && (
            <button type="button" onClick={resetForm} className="btn-secondary">
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <Loader />
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {categories.map((c) => (
            <div key={c._id} className="card p-4 flex items-center justify-between">
              <div>
                <p className="font-medium">
                  {c.emoji} {c.name}
                </p>
                {c.description && <p className="text-xs text-gray-400 mt-0.5">{c.description}</p>}
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => startEdit(c)} className="text-xs px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                  Edit
                </button>
                <button onClick={() => remove(c._id)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 dark:bg-red-950">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
