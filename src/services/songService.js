import { toast } from 'react-toastify';
import { apiClient, authHeaders } from './api';
import { createSessionExpiredError } from '../utils/errors';

class SongService {
  constructor(token = '') {
    this.token = token;
  }

  setToken(token) {
    this.token = token;
  }

  get headers() {
    return authHeaders(this.token);
  }

  async fetchSongs() {
    const res = await apiClient.get('/api/admin/songs', { headers: this.headers });
    return res.data;
  }

  async uploadSong(formData) {
    const res = await apiClient.post('/api/admin/upload', formData, {
      headers: {
        ...this.headers,
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }

  async updateSong(id, updateData) {
    const res = await apiClient.put(`/api/admin/songs/${id}`, updateData, {
      headers: this.headers,
    });
    return res.data;
  }

  async deleteSong(id) {
    await apiClient.delete(`/api/admin/songs/${id}`, { headers: this.headers });
  }

  handleError(err, context) {
    const status = err.response?.status;

    if (status === 401 || status === 403) {
      throw createSessionExpiredError();
    }

    const message = err.response?.data?.message || `${context} failed.`;
    toast.error(message);
    throw err;
  }

  async run(action, context) {
    try {
      return await action();
    } catch (err) {
      this.handleError(err, context);
    }
  }
}

export default SongService;
