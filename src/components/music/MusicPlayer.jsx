// MusicPlayer.jsx
import React, { useState, useEffect } from 'react';
import PlayerHeader from './PlayerHeader';
import NowPlaying from './NowPlaying';
import SongsList from './SongsList';
import AudioPlayer from './AudioPlayer';
import LoadingScreen from './LoadingScreen';
import ErrorScreen from './ErrorScreen';
import { useMusicPlayer } from './hooks/useMusicPlayer';
import { useUser } from './hooks/useUser';
import './MusicPlayer.css';

const MusicPlayer = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  const {
    user,
    loading,
    error,
    showProfileDropdown,
    profileDropdownRef,
    toggleProfileDropdown,
    handleLogout
  } = useUser();
  
  const {
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
  } = useMusicPlayer();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      fetchSongs(token);
    }
  }, [user, fetchSongs]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} />;
  }

  return (
    <div className={`music-player ${isFullscreen ? 'fullscreen' : ''}`}>
      <PlayerHeader
        user={user}
        showProfileDropdown={showProfileDropdown}
        profileDropdownRef={profileDropdownRef}
        toggleProfileDropdown={toggleProfileDropdown}
        handleLogout={handleLogout}
      />

      <div className="player-container">
        <main className="main-content">
          {currentSong && (
            <NowPlaying
              currentSong={currentSong}
              isPlaying={isPlaying}
              currentTime={currentTime}
              volume={volume}
              isMuted={isMuted}
              progressBarRef={progressBarRef}
              togglePlay={togglePlay}
              playNext={playNext}
              playPrevious={playPrevious}
              handleProgressClick={handleProgressClick}
              handleVolumeChange={handleVolumeChange}
              toggleMute={toggleMute}
              toggleFullscreen={() => setIsFullscreen(!isFullscreen)}
              isFullscreen={isFullscreen}
              formatTime={formatTime}
            />
          )}

          <SongsList
            songs={songs}
            currentSong={currentSong}
            isPlaying={isPlaying}
            playSong={playSong}
            formatTime={formatTime}
            isFullscreen={isFullscreen}
            toggleFullscreen={() => setIsFullscreen(!isFullscreen)}
          />
        </main>
      </div>

      <AudioPlayer
        audioRef={audioRef}
        currentSong={currentSong}
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
      />
    </div>
  );
};

export default MusicPlayer;