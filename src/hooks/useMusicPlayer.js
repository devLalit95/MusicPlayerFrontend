import { useState, useRef, useCallback } from 'react';
import { apiClient, authHeaders } from '../services/api';
import { getApiErrorMessage } from '../utils/errors';

export function useMusicPlayer() {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [songsError, setSongsError] = useState('');
  const [songsLoading, setSongsLoading] = useState(false);

  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  const fetchSongs = useCallback(async (token) => {
    if (!token) {
      setSongsError('Authentication required. Please sign in again.');
      return;
    }

    setSongsLoading(true);
    setSongsError('');

    try {
      const response = await apiClient.get('/api/songs', {
        headers: authHeaders(token),
      });

      const list = Array.isArray(response.data) ? response.data : [];
      setSongs(list);
      setCurrentSong(list.length > 0 ? list[0] : null);
    } catch (err) {
      setSongsError(getApiErrorMessage(err, 'Failed to load songs.'));
      setSongs([]);
      setCurrentSong(null);
    } finally {
      setSongsLoading(false);
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentSong || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setSongsError('Unable to play this track. The audio file may be unavailable.');
          setIsPlaying(false);
        });
    }
  }, [currentSong, isPlaying]);

  const playSong = useCallback((song) => {
    setCurrentSong(song);
    setIsPlaying(true);

    queueMicrotask(() => {
      audioRef.current
        ?.play()
        .catch(() => {
          setSongsError('Unable to play this track. The audio file may be unavailable.');
          setIsPlaying(false);
        });
    });
  }, []);

  const playNext = useCallback(() => {
    if (songs.length === 0) return;

    const currentIndex = songs.findIndex((song) => song.id === currentSong?.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    playSong(songs[nextIndex]);
  }, [songs, currentSong, playSong]);

  const playPrevious = useCallback(() => {
    if (songs.length === 0) return;

    const currentIndex = songs.findIndex((song) => song.id === currentSong?.id);
    const prevIndex = currentIndex <= 0 ? songs.length - 1 : currentIndex - 1;
    playSong(songs[prevIndex]);
  }, [songs, currentSong, playSong]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleProgressClick = useCallback((e) => {
    if (progressBarRef.current && audioRef.current?.duration) {
      const progressBar = progressBarRef.current;
      const rect = progressBar.getBoundingClientRect();
      const clickPosition = (e.clientX - rect.left) / progressBar.offsetWidth;
      const newTime = clickPosition * audioRef.current.duration;

      audioRef.current.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, []);

  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? volume : 0;
      setIsMuted(!isMuted);
    }
  }, [isMuted, volume]);

  const formatTime = useCallback((seconds) => {
    if (Number.isNaN(seconds)) return '0:00';

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }, []);

  return {
    songs,
    currentSong,
    isPlaying,
    currentTime,
    volume,
    isMuted,
    songsError,
    songsLoading,
    audioRef,
    progressBarRef,
    fetchSongs,
    togglePlay,
    playSong,
    playNext,
    playPrevious,
    handleTimeUpdate,
    handleProgressClick,
    handleVolumeChange,
    toggleMute,
    formatTime,
    setSongsError,
  };
}
