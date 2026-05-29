import { useState, useEffect } from 'react';
import { Music2, LogOut, ChevronDown } from 'lucide-react';
import NowPlaying from '../components/player/NowPlaying';
import SongsList from '../components/player/SongsList';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import { useUser } from '../hooks/useUser';
import { getStoredToken } from '../utils/storage';
import '../styles/MusicPlayer.css';

function PlayerHeader({ user, showProfileDropdown, profileDropdownRef, toggleProfileDropdown, handleLogout }) {
  return (
    <header className="app-header px-4 md:px-6 py-3 md:py-4">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-accent to-accent-bright rounded-xl flex items-center justify-center shadow-lg shadow-accent/20">
            <Music2 className="w-4 h-4 md:w-5 md:h-5 text-theme-primary" />
          </div>
          <h1 className="text-lg md:text-2xl font-bold bg-gradient-to-r from-accent-soft to-accent-tint bg-clip-text text-transparent">
            BEAT BUFF
          </h1>
        </div>

        <div className="relative" ref={profileDropdownRef}>
          <button
            type="button"
            onClick={toggleProfileDropdown}
            className="flex items-center gap-2 md:gap-3 px-2 md:px-3 py-1.5 md:py-2 rounded-xl app-card-elevated hover:bg-app-hover transition-all duration-200 border border-theme"
          >
            <div className="w-7 h-7 md:w-9 md:h-9 rounded-full bg-gradient-to-br from-accent to-accent-bright flex items-center justify-center text-theme-primary text-xs md:text-sm font-semibold shadow-lg">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:block text-sm md:text-base font-medium text-theme-primary truncate max-w-[120px]">
              {user?.name}
            </span>
            <ChevronDown
              className={`w-4 h-4 text-theme-muted transition-transform duration-200 ${
                showProfileDropdown ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showProfileDropdown && (
            <div className="absolute right-0 mt-2 w-72 app-panel rounded-xl overflow-hidden z-50">
              <div className="p-4 border-b border-theme" style={{ background: 'color-mix(in srgb, var(--accent-primary) 12%, var(--bg-app-card))' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent-bright flex items-center justify-center text-theme-primary text-lg font-bold shadow-lg">
                    {user?.username?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-theme-primary font-semibold truncate">{user?.username}</div>
                    <div className="text-xs text-theme-muted truncate">{user?.email}</div>
                    <div className="mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent-tint border border-accent/30">
                      {user?.role || 'User'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-2 border-t border-theme">
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-danger/10 hover:bg-danger/20 border border-danger/20 text-left"
                >
                  <LogOut className="w-4 h-4 text-danger" />
                  <span className="text-sm text-danger font-medium">Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function MusicPlayerPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    user,
    loading,
    error: userError,
    showProfileDropdown,
    profileDropdownRef,
    toggleProfileDropdown,
    handleLogout,
  } = useUser();

  const {
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
  } = useMusicPlayer();

  useEffect(() => {
    const token = getStoredToken();
    if (token && user) {
      fetchSongs(token);
    }
  }, [user, fetchSongs]);

  if (loading || songsLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading your music...</p>
      </div>
    );
  }

  const displayError = userError || songsError;
  if (displayError) {
    return (
      <div className="error-container">
        <div className="error-message">{displayError}</div>
        <button
          type="button"
          className="retry-btn"
          onClick={() => {
            setSongsError('');
            const token = getStoredToken();
            if (token) fetchSongs(token);
          }}
        >
          Try Again
        </button>
      </div>
    );
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

      <audio
        ref={audioRef}
        src={currentSong?.fileUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={playNext}
      />
    </div>
  );
}
