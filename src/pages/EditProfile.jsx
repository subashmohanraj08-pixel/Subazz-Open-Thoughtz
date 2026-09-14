import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/services';
import Avatar from '../components/Avatar';
import { ErrorBanner, SuccessBanner } from '../components/Feedback';

export default function EditProfile() {
  const { user, updateLocalUser } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAvatar = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const { data } = await userService.uploadAvatar(formData);
        updateLocalUser({ avatar: data.avatar });
      }
      const { data } = await userService.updateMe({ displayName, bio });
      updateLocalUser({ displayName: data.user.displayName, bio: data.user.bio });
      setSuccess('Profile updated.');
      setTimeout(() => navigate(`/profile/${user.username}`), 800);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container max-w-lg">
      <h1 className="font-serif text-2xl font-semibold mb-6">Edit profile</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <ErrorBanner message={error} />
        <SuccessBanner message={success} />

        <div className="flex items-center gap-4">
          <Avatar src={avatarPreview} name={displayName || user?.username} size="lg" />
          <label className="btn-secondary cursor-pointer text-sm">
            Change photo
            <input type="file" accept="image/*" onChange={handleAvatar} className="hidden" />
          </label>
        </div>

        <div>
          <label className="text-sm font-medium">Display name</label>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input-field mt-1" />
        </div>
        <div>
          <label className="text-sm font-medium">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={300}
            rows={4}
            className="input-field mt-1 resize-none"
          />
          <p className="text-xs text-gray-400 text-right">{bio.length}/300</p>
        </div>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">
            Cancel
          </button>
          <button className="btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
