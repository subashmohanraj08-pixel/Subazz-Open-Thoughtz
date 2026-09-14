import { useState, useEffect } from 'react';
import { adminService } from '../../services/services';
import { Loader } from '../../components/Feedback';
import Avatar from '../../components/Avatar';

const STATUS_STYLES = {
  active: 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
  suspended: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
  blocked: 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400',
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const load = async (p = 1, query = q) => {
    setLoading(true);
    try {
      const { data } = await adminService.getUsers({ page: p, q: query });
      setUsers(data.users);
      setTotalPages(data.totalPages);
      setPage(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(1, '');
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    load(1, q);
  };

  const act = async (fn, id, confirmMsg) => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    await fn(id);
    load(page, q);
  };

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold mb-5">User management</h1>

      <form onSubmit={handleSearch} className="mb-4 flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by username or email" className="input-field" />
        <button className="btn-secondary">Search</button>
      </form>

      {loading ? (
        <Loader />
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-gray-400 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Posts</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-gray-50 dark:border-gray-900 last:border-0">
                  <td className="p-3 flex items-center gap-2">
                    <Avatar src={u.avatar} name={u.displayName || u.username} size="sm" />
                    <div>
                      <p className="font-medium">{u.displayName || u.username}</p>
                      <p className="text-xs text-gray-400">@{u.username}</p>
                    </div>
                  </td>
                  <td className="p-3">{u.role}</td>
                  <td className="p-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[u.status]}`}>{u.status}</span>
                  </td>
                  <td className="p-3">{u.postCount}</td>
                  <td className="p-3">
                    <div className="flex gap-1.5 justify-end flex-wrap">
                      {u.status !== 'active' && (
                        <button onClick={() => act(adminService.reactivateUser, u._id)} className="text-xs px-2 py-1 rounded bg-green-50 text-green-600 dark:bg-green-950">
                          Reactivate
                        </button>
                      )}
                      {u.status !== 'suspended' && (
                        <button onClick={() => act(adminService.suspendUser, u._id)} className="text-xs px-2 py-1 rounded bg-yellow-50 text-yellow-600 dark:bg-yellow-950">
                          Suspend
                        </button>
                      )}
                      {u.status !== 'blocked' && (
                        <button onClick={() => act(adminService.blockUser, u._id)} className="text-xs px-2 py-1 rounded bg-red-50 text-red-600 dark:bg-red-950">
                          Block
                        </button>
                      )}
                      <button
                        onClick={() => act(adminService.deleteUser, u._id, `Permanently delete @${u.username} and all their content?`)}
                        className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-600 dark:bg-gray-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => load(i + 1, q)}
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
