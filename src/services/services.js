import api from './api';

export const authService = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, newPassword) => api.post('/auth/reset-password', { token, newPassword }),
};

export const userService = {
  getProfile: (username) => api.get(`/users/${username}`),
  updateMe: (data) => api.put('/users/me', data),
  uploadAvatar: (formData) =>
    api.post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  follow: (username) => api.post(`/users/${username}/follow`),
  unfollow: (username) => api.delete(`/users/${username}/follow`),
  getUserPosts: (username, page = 1) => api.get(`/users/${username}/posts?page=${page}`),
  getSaved: () => api.get('/users/me/saved'),
  search: (q) => api.get(`/users/search?q=${encodeURIComponent(q)}`),
};

export const postService = {
  getFeed: (params = {}) => api.get('/posts', { params }),
  search: (q) => api.get(`/posts/search?q=${encodeURIComponent(q)}`),
  getById: (id) => api.get(`/posts/${id}`),
  create: (formData) => api.post('/posts', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update: (id, formData) => api.put(`/posts/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  delete: (id) => api.delete(`/posts/${id}`),
  like: (id) => api.post(`/posts/${id}/like`),
  unlike: (id) => api.delete(`/posts/${id}/like`),
  save: (id) => api.post(`/posts/${id}/save`),
  unsave: (id) => api.delete(`/posts/${id}/save`),
  share: (id) => api.post(`/posts/${id}/share`),
  getComments: (postId, page = 1) => api.get(`/posts/${postId}/comments?page=${page}`),
  addComment: (postId, content) => api.post(`/posts/${postId}/comments`, { content }),
};

export const commentService = {
  update: (id, content) => api.put(`/comments/${id}`, { content }),
  delete: (id) => api.delete(`/comments/${id}`),
};

export const notificationService = {
  getAll: () => api.get('/notifications'),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
};

export const categoryService = {
  getAll: () => api.get('/categories'),
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const reportService = {
  create: (data) => api.post('/reports', data),
  mine: () => api.get('/reports/mine'),
};

export const adminService = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params = {}) => api.get('/admin/users', { params }),
  getUser: (id) => api.get(`/admin/users/${id}`),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  suspendUser: (id) => api.put(`/admin/users/${id}/suspend`),
  blockUser: (id) => api.put(`/admin/users/${id}/block`),
  reactivateUser: (id) => api.put(`/admin/users/${id}/reactivate`),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getPosts: (params = {}) => api.get('/admin/posts', { params }),
  updatePost: (id, data) => api.put(`/admin/posts/${id}`, data),
  hidePost: (id, reason) => api.put(`/admin/posts/${id}/hide`, { reason }),
  unhidePost: (id) => api.put(`/admin/posts/${id}/unhide`),
  deletePost: (id) => api.delete(`/admin/posts/${id}`),
  getComments: (params = {}) => api.get('/admin/comments', { params }),
  updateComment: (id, content) => api.put(`/admin/comments/${id}`, { content }),
  deleteComment: (id) => api.delete(`/admin/comments/${id}`),
  getReports: (params = {}) => api.get('/admin/reports', { params }),
  updateReport: (id, data) => api.put(`/admin/reports/${id}`, data),
};
