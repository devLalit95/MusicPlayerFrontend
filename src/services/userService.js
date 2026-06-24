import { toast } from 'react-toastify';
import { apiClient, authHeaders } from './api';
import { createSessionExpiredError } from '../utils/errors';

class UserService {
    constructor(token = '') {
        this.token = token;
    }

    setToken(token) {
        this.token = token;
    }

    get headers() {
        return authHeaders(this.token);
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

    async getProfile() {
        return this.run(async () => {
            const res = await apiClient.get('/api/user/profile', { headers: this.headers });
            let payload = res.data;

            // Normalize common response wrappers
            if (payload && typeof payload === 'object') {
                if (payload.data) payload = payload.data;
                if (payload.profile) payload = payload.profile;
                if (payload.user) payload = payload.user;
            }

            // Ensure minimal shape
            const normalized = {
                id: payload?.id ?? payload?._id ?? null,
                username: payload?.username ?? payload?.name ?? '',
                email: payload?.email ?? '',
                role: payload?.role ?? 'USER',
                createdAt: payload?.createdAt ?? payload?.created_at ?? null,
            };

            return normalized;
        }, 'Fetching profile');
    }

    async updateProfile(profileData) {
        return this.run(async () => {
            const res = await apiClient.put('/api/user/profile', profileData, { headers: this.headers });
            return res.data;
        }, 'Updating profile');
    }

    async getLikedSongs() {
        return this.run(async () => {
            const candidates = [
                '/api/user/profile/liked-songs',
                '/api/user/liked-songs',
                '/api/user/likes',
                '/api/user/songs/liked',
            ];

            for (const path of candidates) {
                try {
                    const res = await apiClient.get(path, { headers: this.headers });
                    let payload = res.data;

                    if (payload && typeof payload === 'object') {
                        if (payload.data) payload = payload.data;
                        if (payload.likedSongs) payload = payload.likedSongs;
                        if (payload.songs) payload = payload.songs;
                    }

                    return Array.isArray(payload) ? payload : [];
                } catch (err) {
                    // try next candidate on 404, rethrow other errors
                    if (err.response?.status === 404) continue;
                    throw err;
                }
            }

            return [];
        }, 'Loading liked songs');
    }

    async getFrequentSongs() {
        return this.run(async () => {
            const res = await apiClient.get('/api/user/profile/frequent-songs', { headers: this.headers });
            return res.data;
        }, 'Loading frequent songs');
    }

    async likeSong(songId) {
        return this.run(async () => {
            await apiClient.post(`/api/user/songs/${songId}/like`, null, { headers: this.headers });
        }, 'Liking song');
    }

    async dislikeSong(songId) {
        return this.run(async () => {
            await apiClient.delete(`/api/user/songs/${songId}/like`, { headers: this.headers });
        }, 'Removing like');
    }

    async listenSong(songId) {
        return this.run(async () => {
            const res = await apiClient.post(`/api/user/songs/${songId}/listen`, null, { headers: this.headers });
            return res.data;
        }, 'Recording play');
    }

    async fetchPlaylists() {
        return this.run(async () => {
            const res = await apiClient.get('/api/user/playlists', { headers: this.headers });
            return res.data;
        }, 'Loading playlists');
    }

    async getPlaylist(playlistId) {
        return this.run(async () => {
            const res = await apiClient.get(`/api/user/playlists/${playlistId}`, { headers: this.headers });
            return res.data;
        }, 'Loading playlist');
    }

    async createPlaylist(playlistData) {
        return this.run(async () => {
            const res = await apiClient.post('/api/user/playlists', playlistData, { headers: this.headers });
            return res.data;
        }, 'Creating playlist');
    }

    async updatePlaylist(playlistId, playlistData) {
        return this.run(async () => {
            const res = await apiClient.put(`/api/user/playlists/${playlistId}`, playlistData, { headers: this.headers });
            return res.data;
        }, 'Updating playlist');
    }

    async deletePlaylist(playlistId) {
        return this.run(async () => {
            await apiClient.delete(`/api/user/playlists/${playlistId}`, { headers: this.headers });
        }, 'Deleting playlist');
    }

    async addSongToPlaylist(playlistId, songId) {
        return this.run(async () => {
            const res = await apiClient.post(`/api/user/playlists/${playlistId}/songs/${songId}`, null, {
                headers: this.headers,
            });
            return res.data;
        }, 'Adding song to playlist');
    }

    async removeSongFromPlaylist(playlistId, songId) {
        return this.run(async () => {
            const res = await apiClient.delete(`/api/user/playlists/${playlistId}/songs/${songId}`, {
                headers: this.headers,
            });
            return res.data;
        }, 'Removing song from playlist');
    }

    async searchPlaylists(name) {
        return this.run(async () => {
            const res = await apiClient.get('/api/user/playlists/search', {
                headers: this.headers,
                params: { name },
            });
            return res.data;
        }, 'Searching playlists');
    }
}

export default UserService;
