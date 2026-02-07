// hooks/useMusicPlayer.js
import { useState, useRef, useCallback } from 'react';
import axios from 'axios';

export const useMusicPlayer = () => {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);

  const fetchSongs = useCallback(async (token) => {
    try {
      const response = await axios.get('https://musicplayer-rc7u.onrender.com/api/songs', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setSongs(response.data);
      if (response.data.length > 0) {
        setCurrentSong(response.data[0]);
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      throw error;
    }
  }, []);

  const togglePlay = useCallback(() => {
    if (!currentSong || !audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(error => {
        console.error('Error playing audio:', error);
      });
    }
    setIsPlaying(!isPlaying);
  }, [currentSong, isPlaying]);

  const playSong = useCallback((song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    
    setTimeout(() => {
      audioRef.current?.play().catch(error => {
        console.error('Error playing song:', error);
        setIsPlaying(false);
      });
    }, 0);
  }, []);

  const playNext = useCallback(() => {
    if (songs.length === 0) return;
    
    const currentIndex = songs.findIndex(song => song.id === currentSong?.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    playSong(songs[nextIndex]);
  }, [songs, currentSong, playSong]);

  const playPrevious = useCallback(() => {
    if (songs.length === 0) return;
    
    const currentIndex = songs.findIndex(song => song.id === currentSong?.id);
    const prevIndex = currentIndex === 0 ? songs.length - 1 : currentIndex - 1;
    playSong(songs[prevIndex]);
  }, [songs, currentSong, playSong]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleProgressClick = useCallback((e) => {
    if (progressBarRef.current && audioRef.current && audioRef.current.duration) {
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
    if (isNaN(seconds)) return '0:00';
    
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
    formatTime
  };
};