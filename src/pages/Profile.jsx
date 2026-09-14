import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { userService } from '../services/services';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import PostCard from '../components/PostCard';
import { Loader, EmptyState } from '../components/Feedback';
import { formatDate } from '../utils/time';

export default function Profile() {
  const { username } = useParams();
  const { user: me } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followBusy, setFollowBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [profileRes, postsRes] = await Promise.all([
        userService.getProfile(username),
        userService.getUserPosts(username),
      ]);
      setProfile(profileRes.data.user);
      setIsFollowing(profileRes.data.isFollowing);
      setPosts(postsRes.data.posts);
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleFollow = async () => {
    setFollowBusy(true);
    try {
      if (isFollowing) {
        await userService.unfollow(username);
        setIsFollowing(false);
        setProfile((p) => ({ ...p, followersCount: p.followersCount - 1 }));
      } else {
        await userService.follow(username);
        setIsFollowing(true);
        setProfile((p) => ({ ...p, followersCount: p.followersCount + 1 }));
      }
    } finally {
      setFollowBusy(false);
    }
  };

  if (loading) return <Loader label="Loading profile..." />;
  if (!profile) return <EmptyState icon="🔍" title="User not found" />;

  const isSelf = me?.username === username;

  return (
    <div className="page-container max-w-2xl">
      <div className="card p-6 mb-6 text-center">
        <Avatar src={profile.avatar} name={profile.displayName || profile.username} size="xl" />
        <h1 className="font-serif text-xl font-semibold mt-3">{profile.displayName || profile.username}</h1>
        <p className="text-gray-400 text-sm">@{profile.username}</p>
        {profile.bio && <p className="mt-2 text-sm max-w-md mx-auto">{profile.bio}</p>}
        <p className="text-xs text-gray-400 mt-2">Joined {formatDate(profile.createdAt)}</p>

        <div className="flex justify-center gap-6 mt-4 text-sm">
          <div>
            <p className="font-semibold">{profile.postCount}</p>
            <p className="text-gray-400 text-xs">Posts</p>
          </div>
          <div>
            <p className="font-semibold">{profile.followersCount}</p>
            <p className="text-gray-400 text-xs">Followers</p>
          </div>
          <div>
            <p className="font-semibold">{profile.followingCount}</p>
            <p className="text-gray-400 text-xs">Following</p>
          </div>
        </div>

        <div className="mt-5">
          {isSelf ? (
            <Link to="/edit-profile" className="btn-secondary">
              Edit profile
            </Link>
          ) : me ? (
            <button
              onClick={toggleFollow}
              disabled={followBusy}
              className={isFollowing ? 'btn-secondary' : 'btn-primary'}
            >
              {isFollowing ? 'Unfollow' : 'Follow'}
            </button>
          ) : null}
        </div>
      </div>

      <h2 className="font-serif text-lg font-semibold mb-3">Posts</h2>
      {posts.length === 0 ? (
        <EmptyState icon="🪶" title="No posts yet" />
      ) : (
        posts.map((p) => <PostCard key={p._id} post={p} onDeleted={(id) => setPosts((ps) => ps.filter((x) => x._id !== id))} />)
      )}
    </div>
  );
}
