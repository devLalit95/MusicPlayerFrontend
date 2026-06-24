import { useState, useEffect, useCallback, useMemo } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Search, RefreshCw, Trash2, AlertCircle } from 'lucide-react';

import SongService from '../services/songService';
import SongTable from '../components/admin/SongTable';
import SongForm from '../components/admin/SongForm';
import { apiClient, authHeaders } from '../services/api';
import { getApiErrorMessage, isSessionExpiredError } from '../utils/errors';
import {
  clearAdminToken,
  getAdminToken,
  getStoredUser,
  setAdminToken,
} from '../utils/storage';

function AdminLoginForm({ onLogin }) {
  const [loginData, setLoginData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e?.preventDefault();
    if (!loginData.username || !loginData.password) {
      toast.error('Please enter both username and password');
      return;
    }

    try {
      setLoading(true);
      const { data } = await apiClient.post('/api/auth/login', loginData);
      const jwtToken = data?.token;

      if (!jwtToken) {
        toast.error('Authentication failed. No token received.');
        return;
      }

      setAdminToken(jwtToken);
      onLogin(jwtToken);
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Authentication failed.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-page-auth flex items-center justify-center p-4">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-md app-auth-card backdrop-blur-xl rounded-2xl p-8"
      >
        <h1 className="text-3xl font-bold text-theme-primary mb-2 text-center">Admin Sign In</h1>
        <p className="text-theme-muted text-sm text-center mb-8">Manage songs and users</p>

        <div className="space-y-4">
          <div>
            <label className="block text-theme-secondary text-sm font-medium mb-2 text-left">Username</label>
            <input
              type="text"
              value={loginData.username}
              onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
              className="w-full px-4 py-3 app-input w-full rounded-lg  focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Enter your username"
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-theme-secondary text-sm font-medium mb-2 text-left">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 app-input w-full rounded-lg  focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Enter your password"
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 px-3 text-theme-muted text-sm"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="app-btn-primary w-full mt-6 font-semibold py-3 rounded-lg"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}

function AdminUsersSection() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, activeUsers: 0, newUsersThisMonth: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const usersPerPage = 10;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      if (!token) {
        toast.error('Session expired. Please sign in again.');
        return;
      }

      const { data } = await apiClient.get('/api/admin/users', { headers: authHeaders(token) });
      const usersList = Array.isArray(data) ? data : [];
      setUsers(usersList);

      const now = new Date();
      const newUsersCount = usersList.filter((u) => {
        const d = new Date(u.createdAt);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      }).length;

      setStats({
        totalUsers: usersList.length,
        activeUsers: usersList.filter((u) => u.status === 'active').length,
        newUsersThisMonth: newUsersCount,
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load users.'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeleteUser = async (userId) => {
    setDeletingUserId(userId);
    try {
      const token = getAdminToken();
      if (!token) return;

      await apiClient.delete(`/api/admin/users/${userId}`, { headers: authHeaders(token) });
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setStats((prev) => ({ ...prev, totalUsers: prev.totalUsers - 1 }));
      toast.success('User deleted');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete user.'));
    } finally {
      setDeletingUserId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.id?.toString().includes(searchTerm)
  );

  const indexOfLast = currentPage * usersPerPage;
  const indexOfFirst = indexOfLast - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-app-card rounded-xl p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-danger" />
              <h3 className="text-lg font-bold text-theme-primary">Delete user?</h3>
            </div>
            <p className="text-theme-muted mb-6">
              Remove <strong>{deleteTarget.username}</strong> ({deleteTarget.email})? This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2 bg-elevated rounded-lg text-theme-secondary font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(deleteTarget.id)}
                disabled={deletingUserId === deleteTarget.id}
                className="flex-1 py-2 bg-danger text-theme-primary rounded-lg font-medium disabled:opacity-50"
              >
                {deletingUserId === deleteTarget.id ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-app-card rounded-xl p-5 border shadow-sm">
          <p className="text-sm text-theme-muted">Total Users</p>
          <p className="text-3xl font-bold text-theme-primary">{stats.totalUsers}</p>
        </div>
        <div className="bg-app-card rounded-xl p-5 border shadow-sm">
          <p className="text-sm text-theme-muted">Active Users</p>
          <p className="text-3xl font-bold text-success">{stats.activeUsers}</p>
        </div>
        <div className="bg-app-card rounded-xl p-5 border shadow-sm">
          <p className="text-sm text-theme-muted">New This Month</p>
          <p className="text-3xl font-bold text-cyan">{stats.newUsersThisMonth}</p>
        </div>
      </div>

      <div className="bg-app-card rounded-xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-theme-primary">Registered Users</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="w-4 h-4 text-theme-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-2 border rounded-lg text-sm"
              />
            </div>
            <button
              type="button"
              onClick={fetchUsers}
              className="p-2 border rounded-lg hover:bg-app-hover"
              title="Refresh"
            >
              <RefreshCw className="w-5 h-5 text-theme-muted" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-app-card text-left text-xs uppercase text-theme-muted">
              <tr>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {currentUsers.length > 0 ? (
                currentUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-app-hover">
                    <td className="px-4 py-3 font-medium text-theme-primary">{u.username || 'Unknown'}</td>
                    <td className="px-4 py-3 text-theme-muted">{u.email || 'N/A'}</td>
                    <td className="px-4 py-3 text-theme-muted">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3 capitalize text-theme-muted">{u.role || 'user'}</td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(u)}
                        disabled={deletingUserId === u.id}
                        className="p-2 text-danger hover:bg-danger/10 rounded-lg disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-theme-muted">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t flex justify-between items-center text-sm text-theme-muted">
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [token, setToken] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [activeTab, setActiveTab] = useState('songs');

  const songService = useMemo(() => new SongService(''), []);
  const name = getStoredUser()?.username ?? 'Admin';

  useEffect(() => {
    const saved = getAdminToken();
    if (saved) {
      setToken(saved);
      setLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (token) songService.setToken(token);
  }, [token, songService]);

  const handleLogout = useCallback(() => {
    setToken('');
    setLoggedIn(false);
    setSongs([]);
    setEditingSong(null);
    setActiveTab('songs');
    clearAdminToken();
    toast.info('Logged out');
  }, []);

  const fetchSongs = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await songService.fetchSongs();
      setSongs(Array.isArray(data) ? data : []);
    } catch (err) {
      if (isSessionExpiredError(err)) handleLogout();
    } finally {
      setLoading(false);
    }
  }, [token, songService, handleLogout]);

  useEffect(() => {
    if (token) fetchSongs();
  }, [token, fetchSongs]);

  const resetForm = () => setEditingSong(null);

  const handleSongUpload = async (songData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('file', songData.file);
      formData.append('title', songData.title);
      formData.append('artist', songData.artist);
      formData.append('album', songData.album);
      formData.append('durationSeconds', songData.durationSeconds);
      await songService.uploadSong(formData);
      toast.success('Song uploaded');
      resetForm();
      fetchSongs();
      setActiveTab('songs');
    } catch (err) {
      if (isSessionExpiredError(err)) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSong = async (songData) => {
    try {
      setLoading(true);
      const updateData = {};
      if (songData.title?.trim()) updateData.title = songData.title;
      if (songData.artist?.trim()) updateData.artist = songData.artist;
      if (songData.album?.trim()) updateData.album = songData.album;
      if (songData.durationSeconds != null) updateData.durationSeconds = Number(songData.durationSeconds);
      await songService.updateSong(editingSong.id, updateData);
      toast.success('Song updated');
      resetForm();
      fetchSongs();
      setActiveTab('songs');
    } catch (err) {
      if (isSessionExpiredError(err)) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSong = async (id, title) => {
    if (!window.confirm(`Delete "${title}"?`)) return;
    try {
      setLoading(true);
      await songService.deleteSong(id);
      toast.success('Song deleted');
      fetchSongs();
    } catch (err) {
      if (isSessionExpiredError(err)) handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (jwtToken) => {
    setToken(jwtToken);
    setLoggedIn(true);
  };

  if (!loggedIn) {
    return (
      <>
        <ToastContainer position="top-right" autoClose={3000} />
        <AdminLoginForm onLogin={handleLogin} />
      </>
    );
  }

  const tabs = [
    { id: 'songs', label: 'All Songs' },
    { id: 'upload', label: 'Upload Song' },
    { id: 'users', label: 'Users' },
  ];

  return (
    <div className="app-admin-page">
      <ToastContainer position="top-right" autoClose={3000} />

      <div className="app-admin-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-theme-primary">Admin</h1>
            <p className="text-sm text-theme-muted">Songs &amp; users</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-theme-secondary">
              Welcome, <span className="text-accent font-medium">{name}</span>
            </span>
            <button
              type="button"
              onClick={handleLogout}
              className="app-btn-ghost font-medium py-2 px-4 rounded-xl"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="app-admin-tabs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (tab.id === 'upload') resetForm();
                setActiveTab(tab.id);
              }}
              className={`py-4 border-b-2 text-sm font-medium ${activeTab === tab.id
                  ? 'border-accent text-accent'
                  : 'border-transparent text-theme-muted hover:text-theme-secondary'
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {activeTab === 'upload' ? (
          <SongForm
            onSubmit={editingSong ? handleUpdateSong : handleSongUpload}
            onCancel={() => {
              resetForm();
              setActiveTab('songs');
            }}
            editingSong={editingSong}
            loading={loading}
            initialData={
              editingSong
                ? {
                  title: editingSong.title,
                  artist: editingSong.artist,
                  album: editingSong.album || '',
                  durationSeconds: editingSong.durationSeconds || '',
                  file: null,
                }
                : undefined
            }
          />
        ) : activeTab === 'users' ? (
          <AdminUsersSection />
        ) : (
          <SongTable
            songs={songs}
            onEdit={(song) => {
              setEditingSong(song);
              setActiveTab('upload');
            }}
            onDelete={handleDeleteSong}
            loading={loading}
          />
        )}
      </div>
    </div>
  );
}
