import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    ChevronLeft,
    Heart,
    Plus,
    Pencil,
    Search,
    Trash2,
} from 'lucide-react';
import { useUser } from '../hooks/useUser';
import UserService from '../services/userService';
import { apiClient, authHeaders } from '../services/api';
import { getStoredToken, getStoredUser, setAuthSession } from '../utils/storage';
import { getApiErrorMessage, isSessionExpiredError } from '../utils/errors';

/* ----------------------------------------------------------------------- */
/*  Shared shell                                                            */
/* ----------------------------------------------------------------------- */

const CARD =
    'rounded-[6px] border border-violet-900/40 bg-[#0e0c20]/90 shadow-[0_0_40px_rgba(78,63,186,0.14)]';

/* ----------------------------------------------------------------------- */
/*  Premium skeleton primitives                                             */
/* ----------------------------------------------------------------------- */

function Shimmer({ className = '' }) {
    return (
        <div className={`relative overflow-hidden rounded-[6px] bg-[#16143a] ${className}`}>
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-violet-500/15 to-transparent" />
        </div>
    );
}

function SkeletonRow({ withAction = true }) {
    return (
        <div className="flex items-center justify-between gap-3 rounded-[6px] border border-violet-900/40 bg-[#0b0a1f] p-4">
            <div className="flex-1 space-y-2">
                <Shimmer className="h-3.5 w-2/5" />
                <Shimmer className="h-3 w-1/4" />
            </div>
            {withAction && <Shimmer className="h-8 w-20" />}
        </div>
    );
}

function SkeletonProfileForm() {
    return (
        <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <Shimmer className="h-3 w-16" />
                    <Shimmer className="h-11 w-full" />
                </div>
                <div className="space-y-2">
                    <Shimmer className="h-3 w-12" />
                    <Shimmer className="h-11 w-full" />
                </div>
            </div>
            <div className="space-y-2">
                <Shimmer className="h-3 w-24" />
                <Shimmer className="h-11 w-full" />
            </div>
            <Shimmer className="h-11 w-32" />
        </div>
    );
}

function SkeletonList({ count = 3, withAction = true }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonRow key={i} withAction={withAction} />
            ))}
        </div>
    );
}

/* Spinner reserved for inline / in-button busy states only */
function Spinner({ className = 'h-4 w-4' }) {
    return (
        <span
            className={`inline-block animate-spin rounded-full border-2 border-cyan-300/30 border-t-cyan-300 ${className}`}
        />
    );
}

/* ----------------------------------------------------------------------- */
/*  Page                                                                     */
/* ----------------------------------------------------------------------- */

export default function ProfilePage() {
    const navigate = useNavigate();
    const { user, loading, error, handleLogout } = useUser();
    const token = getStoredToken();
    const userService = new UserService(token ?? '');

    const [activeTab, setActiveTab] = useState('profile');
    const [profileForm, setProfileForm] = useState({ username: '', email: '', password: '' });
    const [profileFetching, setProfileFetching] = useState(true);
    const [profileSaving, setProfileSaving] = useState(false);
    const [likedSongs, setLikedSongs] = useState([]);
    const [likedLoading, setLikedLoading] = useState(true);
    const [likeActionSongId, setLikeActionSongId] = useState(null);
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylistId, setSelectedPlaylistId] = useState(null);
    const [playlistLoading, setPlaylistLoading] = useState(true);
    const [playlistForm, setPlaylistForm] = useState({ name: '', description: '' });
    const [allSongs, setAllSongs] = useState([]);
    const [songsLoading, setSongsLoading] = useState(true);
    const [songSearch, setSongSearch] = useState('');
    const [updatingPlaylist, setUpdatingPlaylist] = useState(false);
    const [playlistActionId, setPlaylistActionId] = useState(null);

    const selectedPlaylist = playlists.find((playlist) => playlist.id === selectedPlaylistId);

    useEffect(() => {
        if (!token) return;
        let isMounted = true;

        const fetchProfile = async () => {
            setProfileFetching(true);
            try {
                const profile = await userService.getProfile();
                if (!isMounted) return;
                setProfileForm({ username: profile.username || '', email: profile.email || '', password: '' });
            } catch (err) {
                if (isMounted && isSessionExpiredError(err)) {
                    handleLogout();
                }
            } finally {
                if (isMounted) setProfileFetching(false);
            }
        };

        const fetchLiked = async () => {
            setLikedLoading(true);
            try {
                const songs = await userService.getLikedSongs();
                if (!isMounted) return;
                setLikedSongs(Array.isArray(songs) ? songs : []);
            } catch (err) {
                if (isMounted && isSessionExpiredError(err)) {
                    handleLogout();
                }
            } finally {
                if (isMounted) setLikedLoading(false);
            }
        };

        const fetchPlaylists = async () => {
            setPlaylistLoading(true);
            try {
                const data = await userService.fetchPlaylists();
                if (!isMounted) return;
                const playlistArray = Array.isArray(data) ? data : [];
                setPlaylists(playlistArray);
                if (!selectedPlaylistId && playlistArray.length > 0) {
                    setSelectedPlaylistId(playlistArray[0].id);
                }
            } catch (err) {
                if (isMounted && isSessionExpiredError(err)) {
                    handleLogout();
                }
            } finally {
                if (isMounted) setPlaylistLoading(false);
            }
        };

        const fetchSongs = async () => {
            setSongsLoading(true);
            try {
                const response = await apiClient.get('/api/songs', { headers: authHeaders(token) });
                if (!isMounted) return;
                setAllSongs(Array.isArray(response.data) ? response.data : []);
            } catch (err) {
                if (isMounted && isSessionExpiredError(err)) {
                    handleLogout();
                }
            } finally {
                if (isMounted) setSongsLoading(false);
            }
        };

        fetchProfile();
        fetchLiked();
        fetchPlaylists();
        fetchSongs();

        return () => {
            isMounted = false;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [token, handleLogout]);

    const handleProfileChange = (event) => {
        const { name, value } = event.target;
        setProfileForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleProfileSubmit = async (event) => {
        event.preventDefault();
        if (!token) return;

        setProfileSaving(true);
        try {
            const updated = await userService.updateProfile({
                username: profileForm.username,
                email: profileForm.email,
                password: profileForm.password || undefined,
            });

            const storedUser = getStoredUser() || {};
            setAuthSession(token, { ...storedUser, ...updated });
            toast.success('Profile updated successfully.');
            setProfileForm((prev) => ({ ...prev, password: '' }));
        } catch (err) {
            if (isSessionExpiredError(err)) {
                handleLogout();
            } else {
                toast.error(getApiErrorMessage(err, 'Unable to update profile.'));
            }
        } finally {
            setProfileSaving(false);
        }
    };

    const handleToggleLike = async (songId) => {
        if (!token) return;
        setLikeActionSongId(songId);

        const isAlreadyLiked = likedSongs.some((song) => song.id === songId);

        try {
            if (isAlreadyLiked) {
                await userService.dislikeSong(songId);
                setLikedSongs((prev) => prev.filter((song) => song.id !== songId));
            } else {
                await userService.likeSong(songId);
                const likedSong = allSongs.find((song) => song.id === songId);
                if (likedSong) setLikedSongs((prev) => [likedSong, ...prev]);
            }
        } catch (err) {
            if (isSessionExpiredError(err)) {
                handleLogout();
            }
        } finally {
            setLikeActionSongId(null);
        }
    };

    const handleCreatePlaylist = async (event) => {
        event.preventDefault();
        if (!token || !playlistForm.name.trim()) return;

        setUpdatingPlaylist(true);
        try {
            const created = await userService.createPlaylist({
                name: playlistForm.name.trim(),
                description: playlistForm.description.trim(),
            });
            setPlaylists((prev) => [created, ...prev]);
            setSelectedPlaylistId(created.id);
            setPlaylistForm({ name: '', description: '' });
            toast.success('Playlist created successfully.');
        } catch (err) {
            if (isSessionExpiredError(err)) {
                handleLogout();
            } else {
                toast.error(getApiErrorMessage(err, 'Unable to create playlist.'));
            }
        } finally {
            setUpdatingPlaylist(false);
        }
    };

    const handleDeletePlaylist = async (playlistId) => {
        if (!token || !window.confirm('Delete this playlist?')) return;
        setPlaylistActionId(playlistId);

        try {
            await userService.deletePlaylist(playlistId);
            setPlaylists((prev) => prev.filter((playlist) => playlist.id !== playlistId));
            if (selectedPlaylistId === playlistId) {
                setSelectedPlaylistId(null);
            }
            toast.success('Playlist deleted.');
        } catch (err) {
            if (isSessionExpiredError(err)) {
                handleLogout();
            } else {
                toast.error(getApiErrorMessage(err, 'Unable to delete playlist.'));
            }
        } finally {
            setPlaylistActionId(null);
        }
    };

    const handlePlaylistUpdate = async (event) => {
        event.preventDefault();
        if (!token || !selectedPlaylist) return;

        setUpdatingPlaylist(true);
        try {
            const updated = await userService.updatePlaylist(selectedPlaylist.id, {
                name: playlistForm.name.trim() || selectedPlaylist.name,
                description: playlistForm.description.trim() || selectedPlaylist.description,
            });
            setPlaylists((prev) => prev.map((playlist) => (playlist.id === updated.id ? updated : playlist)));
            setPlaylistForm({ name: '', description: '' });
            toast.success('Playlist updated.');
        } catch (err) {
            if (isSessionExpiredError(err)) {
                handleLogout();
            } else {
                toast.error(getApiErrorMessage(err, 'Unable to update playlist.'));
            }
        } finally {
            setUpdatingPlaylist(false);
        }
    };

    const handleAddSongToPlaylist = async (songId) => {
        if (!token || !selectedPlaylist) return;

        try {
            const updated = await userService.addSongToPlaylist(selectedPlaylist.id, songId);
            setPlaylists((prev) => prev.map((playlist) => (playlist.id === updated.id ? updated : playlist)));
            toast.success('Song added to playlist.');
        } catch (err) {
            if (isSessionExpiredError(err)) {
                handleLogout();
            }
        }
    };

    const handleRemoveSongFromPlaylist = async (songId) => {
        if (!token || !selectedPlaylist) return;

        try {
            const updated = await userService.removeSongFromPlaylist(selectedPlaylist.id, songId);
            setPlaylists((prev) => prev.map((playlist) => (playlist.id === updated.id ? updated : playlist)));
            toast.success('Song removed from playlist.');
        } catch (err) {
            if (isSessionExpiredError(err)) {
                handleLogout();
            }
        }
    };

    const filteredSongs = songSearch.trim()
        ? allSongs.filter((song) =>
            [song.title, song.artist, song.album].some((field) =>
                String(field || '').toLowerCase().includes(songSearch.trim().toLowerCase()),
            ),
        )
        : allSongs;

    const playlistSongs = selectedPlaylist?.songs || [];

    if (loading) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#070619]">
                <Spinner className="h-9 w-9 border-[3px]" />
                <p className="text-sm text-violet-400">Loading profile…</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#070619] px-6 text-center">
                <div className="rounded-[6px] border border-rose-900/50 bg-rose-950/20 px-5 py-4 text-rose-300">
                    {error}
                </div>
                <button
                    type="button"
                    className="rounded-[6px] bg-cyan-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-400"
                    onClick={() => navigate('/login')}
                >
                    Go to login
                </button>
            </div>
        );
    }

    return (
        <div className="app-page-profile min-h-screen bg-[#070619] text-white">
            <style>{`
                @keyframes shimmer { 100% { transform: translateX(100%); } }
            `}</style>
            <ToastContainer position="top-right" autoClose={3000} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
                <button
                    type="button"
                    onClick={() => navigate('/music')}
                    className="inline-flex items-center gap-2 text-sm text-cyan-300 transition hover:text-white"
                >
                    <ChevronLeft className="w-4 h-4" /> Back to player
                </button>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] xl:grid-cols-[minmax(0,1fr)_400px]">
                    {/* ---------------------------------------------------- */}
                    {/* Left column                                          */}
                    {/* ---------------------------------------------------- */}
                    <div className="min-w-0 space-y-4">
                        <div className={`${CARD} p-6`}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                                <div>
                                    <h1 className="text-2xl font-bold text-white">Your profile</h1>
                                    <p className="text-sm text-violet-400">
                                        Update account details, view saved music, and manage playlists.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="rounded-[6px] px-4 py-2 bg-rose-500/10 text-rose-400 text-sm font-medium transition hover:bg-rose-500/20"
                                >
                                    Logout
                                </button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {['profile', 'liked', 'playlists'].map((tab) => (
                                    <button
                                        key={tab}
                                        type="button"
                                        onClick={() => setActiveTab(tab)}
                                        className={`rounded-[6px] px-4 py-2 text-sm font-medium transition ${activeTab === tab
                                                ? 'bg-cyan-500 text-white'
                                                : 'bg-slate-950/70 text-slate-300 hover:bg-slate-900/90'
                                            }`}
                                    >
                                        {tab === 'profile' ? 'Profile' : tab === 'liked' ? 'Liked Songs' : 'Playlists'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {activeTab === 'profile' && (
                            <div className={`${CARD} p-6`}>
                                <h2 className="text-xl font-semibold text-white mb-4">Account details</h2>

                                {profileFetching ? (
                                    <SkeletonProfileForm />
                                ) : (
                                    <form className="space-y-4" onSubmit={handleProfileSubmit}>
                                        <div className="grid gap-4 sm:grid-cols-2">
                                            <label className="block">
                                                <span className="text-sm text-violet-300">Username</span>
                                                <input
                                                    name="username"
                                                    value={profileForm.username}
                                                    onChange={handleProfileChange}
                                                    className="mt-2 w-full rounded-[6px] border border-violet-800/80 bg-[#11102e] px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                                />
                                            </label>
                                            <label className="block">
                                                <span className="text-sm text-violet-300">Email</span>
                                                <input
                                                    name="email"
                                                    value={profileForm.email}
                                                    onChange={handleProfileChange}
                                                    className="mt-2 w-full rounded-[6px] border border-violet-800/80 bg-[#11102e] px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                                />
                                            </label>
                                        </div>

                                        <label className="block">
                                            <span className="text-sm text-violet-300">New password</span>
                                            <input
                                                type="password"
                                                name="password"
                                                value={profileForm.password}
                                                onChange={handleProfileChange}
                                                placeholder="Leave blank to keep current password"
                                                autoComplete="new-password"
                                                className="mt-2 w-full rounded-[6px] border border-violet-800/80 bg-[#11102e] px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                            />
                                        </label>

                                        <button
                                            type="submit"
                                            disabled={profileSaving}
                                            className="inline-flex items-center gap-2 rounded-[6px] bg-cyan-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
                                        >
                                            {profileSaving && <Spinner className="h-4 w-4 border-white/30 border-t-white" />}
                                            {profileSaving ? 'Saving…' : 'Save profile'}
                                        </button>
                                    </form>
                                )}
                            </div>
                        )}

                        {activeTab === 'liked' && (
                            <div className={`${CARD} p-6`}>
                                <div className="flex items-center justify-between gap-4 mb-4">
                                    <div>
                                        <h2 className="text-xl font-semibold text-white">Liked songs</h2>
                                        <p className="text-sm text-violet-400">Songs you have saved from the library.</p>
                                    </div>
                                    {!likedLoading && (
                                        <div className="text-xs text-violet-500">{likedSongs.length} saved</div>
                                    )}
                                </div>

                                {likedLoading ? (
                                    <SkeletonList count={4} />
                                ) : likedSongs.length === 0 ? (
                                    <div className="rounded-[6px] border border-violet-800/60 bg-[#0b0a1f] p-8 text-center text-violet-500">
                                        No liked songs yet. Play a track and tap the heart to save it.
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {likedSongs.map((song) => (
                                            <div
                                                key={song.id}
                                                className="flex flex-col gap-3 rounded-[6px] border border-violet-800/60 bg-[#0b0a1f] p-4 transition hover:border-violet-700/70 sm:flex-row sm:items-center sm:justify-between"
                                            >
                                                <div>
                                                    <div className="text-sm font-semibold text-white">{song.title}</div>
                                                    <div className="text-xs text-violet-400">
                                                        {song.artist} · {song.album || 'Single'}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggleLike(song.id)}
                                                    disabled={likeActionSongId === song.id}
                                                    className="inline-flex items-center gap-2 rounded-[6px] border border-violet-800/80 bg-[#11102e] px-3 py-2 text-sm text-violet-200 transition hover:bg-violet-900/80 disabled:cursor-not-allowed disabled:opacity-70"
                                                >
                                                    {likeActionSongId === song.id ? (
                                                        <Spinner className="h-4 w-4" />
                                                    ) : (
                                                        <Heart className="w-4 h-4 text-rose-400" />
                                                    )}
                                                    {likeActionSongId === song.id ? 'Removing' : 'Remove'}
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ---------------------------------------------------- */}
                    {/* Right column                                         */}
                    {/* ---------------------------------------------------- */}
                    <div className="min-w-0 space-y-4 lg:sticky lg:top-8 lg:max-h-[calc(100vh-4rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
                        <div className={`${CARD} p-6`}>
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-white">Playlists</h2>
                                    <p className="text-sm text-violet-400">Create and manage your playlists.</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('playlists')}
                                    className={`rounded-[6px] px-3 py-2 text-sm font-medium transition ${activeTab === 'playlists'
                                            ? 'bg-cyan-500 text-white'
                                            : 'bg-slate-950/60 text-slate-300 hover:bg-slate-900/90'
                                        }`}
                                >
                                    Manage
                                </button>
                            </div>

                            <form onSubmit={handleCreatePlaylist} className="space-y-4">
                                <div>
                                    <label className="block text-sm text-violet-300">Playlist name</label>
                                    <input
                                        name="name"
                                        value={playlistForm.name}
                                        onChange={(e) => setPlaylistForm((prev) => ({ ...prev, name: e.target.value }))}
                                        className="mt-2 w-full rounded-[6px] border border-violet-800/80 bg-[#11102e] px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                        placeholder="Chill beats"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-violet-300">Description</label>
                                    <textarea
                                        name="description"
                                        value={playlistForm.description}
                                        onChange={(e) => setPlaylistForm((prev) => ({ ...prev, description: e.target.value }))}
                                        rows={3}
                                        className="mt-2 w-full rounded-[6px] border border-violet-800/80 bg-[#11102e] px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                                        placeholder="A playlist for my favorite songs"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={updatingPlaylist}
                                    className="inline-flex items-center gap-2 rounded-[6px] bg-cyan-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
                                >
                                    {updatingPlaylist ? <Spinner className="h-4 w-4 border-white/30 border-t-white" /> : <Plus className="w-4 h-4" />}
                                    Create playlist
                                </button>
                            </form>
                        </div>

                        <div className={`${CARD} p-6`}>
                            <div className="flex items-center justify-between gap-4 mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Your playlists</h3>
                                    <p className="text-sm text-violet-400">Tap a playlist to inspect its songs.</p>
                                </div>
                                {!playlistLoading && (
                                    <span className="text-xs text-violet-500">{playlists.length} total</span>
                                )}
                            </div>

                            {playlistLoading ? (
                                <SkeletonList count={3} withAction={false} />
                            ) : playlists.length === 0 ? (
                                <div className="rounded-[6px] border border-violet-800/60 bg-[#0b0a1f] p-6 text-center text-violet-500">
                                    No playlists yet. Create one to start adding songs.
                                </div>
                            ) : (
                                <div className="max-h-[340px] space-y-3 overflow-y-auto pr-1">
                                    {playlists.map((playlist) => (
                                        <button
                                            key={playlist.id}
                                            type="button"
                                            onClick={() => setSelectedPlaylistId(playlist.id)}
                                            className={`w-full rounded-[6px] border p-4 text-left transition ${playlist.id === selectedPlaylistId
                                                    ? 'border-cyan-500 bg-cyan-500/10'
                                                    : 'border-violet-800/60 bg-[#0b0a1f] hover:border-violet-600/80'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                <div>
                                                    <div className="text-sm font-semibold text-white">{playlist.name}</div>
                                                    <div className="text-xs text-violet-500 mt-1">
                                                        {playlist.songs?.length || 0} songs
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        handleDeletePlaylist(playlist.id);
                                                    }}
                                                    disabled={playlistActionId === playlist.id}
                                                    className="rounded-[6px] p-2 text-violet-400 transition hover:bg-violet-900/40 disabled:opacity-50"
                                                >
                                                    {playlistActionId === playlist.id ? (
                                                        <Spinner className="h-4 w-4" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedPlaylist && (
                            <div className={`${CARD} p-6`}>
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">{selectedPlaylist.name}</h3>
                                        <p className="text-sm text-violet-400">
                                            {selectedPlaylist.description || 'No description yet.'}
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setPlaylistForm({
                                                name: selectedPlaylist.name,
                                                description: selectedPlaylist.description || '',
                                            })
                                        }
                                        className="inline-flex items-center gap-2 rounded-[6px] border border-violet-800/80 bg-[#11102e] px-3 py-2 text-sm text-violet-200 transition hover:bg-violet-900/40"
                                    >
                                        <Pencil className="w-4 h-4" /> Edit
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="rounded-[6px] border border-violet-800/70 bg-[#0b0a1f] p-4 text-sm text-violet-400">
                                        {playlistSongs.length > 0 ? (
                                            <div className="space-y-3">
                                                {playlistSongs.map((song) => (
                                                    <div
                                                        key={song.id}
                                                        className="flex items-center justify-between gap-3 rounded-[6px] border border-violet-900/50 bg-[#11102e] p-3"
                                                    >
                                                        <div>
                                                            <div className="text-sm font-medium text-white">{song.title}</div>
                                                            <div className="text-xs text-violet-500">
                                                                {song.artist} · {song.album || 'Single'}
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveSongFromPlaylist(song.id)}
                                                            className="rounded-[6px] border border-violet-800/80 bg-[#13102b] px-3 py-2 text-xs text-violet-200 transition hover:bg-violet-900/40"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-violet-500">No songs in this playlist yet.</div>
                                        )}
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-3">
                                            <div>
                                                <p className="text-sm font-semibold text-white">Add songs</p>
                                                <p className="text-xs text-violet-400">
                                                    Search the library and add tracks to this playlist.
                                                </p>
                                            </div>
                                            {!songsLoading && (
                                                <span className="text-xs text-violet-500">{filteredSongs.length} tracks</span>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-500" />
                                            <input
                                                value={songSearch}
                                                onChange={(event) => setSongSearch(event.target.value)}
                                                placeholder="Search songs..."
                                                className="w-full rounded-[6px] border border-violet-800/80 bg-[#11102e] px-11 py-3 text-white outline-none transition focus:border-cyan-400"
                                            />
                                        </div>
                                        <div className="max-h-72 overflow-y-auto space-y-3 pr-1">
                                            {songsLoading ? (
                                                <SkeletonList count={3} withAction />
                                            ) : filteredSongs.length === 0 ? (
                                                <div className="text-violet-500">No matching songs found.</div>
                                            ) : (
                                                filteredSongs.slice(0, 10).map((song) => (
                                                    <div
                                                        key={song.id}
                                                        className="flex items-center justify-between gap-3 rounded-[6px] border border-violet-900/50 bg-[#11102e] p-3"
                                                    >
                                                        <div>
                                                            <div className="text-sm text-white">{song.title}</div>
                                                            <div className="text-xs text-violet-500">{song.artist}</div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleAddSongToPlaylist(song.id)}
                                                            className="rounded-[6px] border border-violet-800/80 bg-[#13102b] px-3 py-2 text-xs text-violet-200 transition hover:bg-violet-900/40"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}