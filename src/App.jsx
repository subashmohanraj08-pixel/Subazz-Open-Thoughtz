import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

import Home from './pages/Home';
import Explore from './pages/Explore';
import CreatePost from './pages/CreatePost';
import PostDetails from './pages/PostDetails';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Notifications from './pages/Notifications';
import SavedPosts from './pages/SavedPosts';
import Settings from './pages/Settings';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminPosts from './pages/admin/AdminPosts';
import AdminComments from './pages/admin/AdminComments';
import AdminReports from './pages/admin/AdminReports';
import AdminCategories from './pages/admin/AdminCategories';

function AppShell({ children }) {
  return <Layout>{children}</Layout>;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Public auth pages */}
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/admin/login" element={user ? <Navigate to="/admin" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Main app - browsing is public, actions require login */}
      <Route path="/" element={<AppShell><Home /></AppShell>} />
      <Route path="/explore" element={<AppShell><Explore /></AppShell>} />
      <Route path="/post/:id" element={<AppShell><PostDetails /></AppShell>} />
      <Route path="/profile/:username" element={<AppShell><Profile /></AppShell>} />

      <Route
        path="/create"
        element={
          <ProtectedRoute>
            <AppShell><CreatePost /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-post/:id"
        element={
          <ProtectedRoute>
            <AppShell><CreatePost /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/edit-profile"
        element={
          <ProtectedRoute>
            <AppShell><EditProfile /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <AppShell><Notifications /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/saved"
        element={
          <ProtectedRoute>
            <AppShell><SavedPosts /></AppShell>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AppShell><Settings /></AppShell>
          </ProtectedRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="posts" element={<AdminPosts />} />
        <Route path="comments" element={<AdminComments />} />
        <Route path="reports" element={<AdminReports />} />
        <Route path="categories" element={<AdminCategories />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
