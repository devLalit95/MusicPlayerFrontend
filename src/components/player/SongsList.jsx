import React, { useState, useMemo } from 'react';
import { Heart, Maximize2, Minimize2, Music2, Play, Pause, Search, X } from 'lucide-react';

const SongsList = ({ 
  songs = [], 
  currentSong, 
  isPlaying, 
  playSong, 
  formatTime, 
  isFullscreen, 
  toggleFullscreen,
  isLoading = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter songs based on search query
  const filteredSongs = useMemo(() => {
    if (!searchQuery.trim()) return songs;
    
    const query = searchQuery.toLowerCase();
    return songs.filter(song => 
      song.title?.toLowerCase().includes(query) ||
      song.artist?.toLowerCase().includes(query) ||
      song.album?.toLowerCase().includes(query)
    );
  }, [songs, searchQuery]);

  const clearSearch = () => setSearchQuery('');

  return (
    <div className="app-panel-gradient text-theme-primary rounded-xl overflow-hidden flex flex-col h-[calc(100vh-2rem)] md:h-auto md:max-h-[80vh]">
      {/* Header */}
      <div className="flex-shrink-0 sticky top-0 z-10 app-sticky-header px-4 md:px-6 py-3 md:py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-accent to-accent-bright rounded-lg flex items-center justify-center">
              <Music2 className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div>
              <h2 className="text-lg md:text-xl font-bold">Your Library</h2>
              <p className="text-xs md:text-sm text-theme-muted">
                {isLoading ? 'Loading...' : `${filteredSongs.length} ${filteredSongs.length === 1 ? 'song' : 'songs'}`}
              </p>
            </div>
          </div>
          <button
            onClick={toggleFullscreen}
            className="p-1.5 md:p-2 hover:bg-app-elevated rounded-lg transition-colors"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 md:w-5 md:h-5" /> : <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />}
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-theme-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title, artist, or album..."
            className="app-input w-full rounded-lg pl-10 pr-10 py-2 text-sm text-theme-primary  focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-app-hover rounded-full transition-colors"
              aria-label="Clear search"
            >
              <X className="w-3 h-3 text-theme-muted" />
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="px-4 py-2 md:py-3 mb-1">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-app-elevated rounded animate-pulse"></div>
                <div className="w-8 h-8 md:w-10 md:h-10 bg-app-elevated rounded animate-pulse"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-app-elevated rounded w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-app-elevated rounded w-1/2 animate-pulse"></div>
                </div>
                <div className="hidden md:block w-32 h-3 bg-app-elevated rounded animate-pulse"></div>
                <div className="w-10 h-3 bg-app-elevated rounded animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : songs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 md:py-20 px-6">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-app-elevated rounded-full flex items-center justify-center mb-4">
            <Music2 className="w-8 h-8 md:w-10 md:h-10 text-theme-disabled" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">No songs yet</h3>
          <p className="text-sm md:text-base text-theme-muted text-center">Add some music to get started</p>
        </div>
      ) : filteredSongs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 md:py-20 px-6">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-app-elevated rounded-full flex items-center justify-center mb-4">
            <Search className="w-8 h-8 md:w-10 md:h-10 text-theme-disabled" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold mb-2">No results found</h3>
          <p className="text-sm md:text-base text-theme-muted text-center mb-4">
            No songs match "{searchQuery}"
          </p>
          <button
            onClick={clearSearch}
            className="px-4 py-2 bg-accent/20 hover:bg-accent/30 text-accent-soft rounded-lg transition-colors text-sm font-medium"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          {/* Column Headers - Desktop only */}
          <div className="flex-shrink-0 hidden md:grid grid-cols-[40px_1fr_1fr_80px_60px] gap-4 px-6 py-2 text-xs text-theme-muted border-b border-accent/50">
            <div className="text-center">#</div>
            <div>Title</div>
            <div>Album</div>
            <div className="text-center">Duration</div>
            <div></div>
          </div>

          {/* Songs List */}
          <div className="flex-1 overflow-y-auto px-2 py-2 scrollbar-thin scrollbar-thumb-elevated scrollbar-track-transparent">
            {filteredSongs.map((song, index) => {
              const isActive = currentSong?.id === song.id;
              
              return (
                <div
                  key={song.id}
                  onClick={() => playSong(song)}
                  className={`
                    group relative grid grid-cols-[32px_1fr_auto] md:grid-cols-[40px_1fr_1fr_80px_60px] 
                    gap-2 md:gap-4 px-3 md:px-4 py-2 md:py-3 mb-1 rounded-lg cursor-pointer transition-all
                    ${isActive 
                      ? 'app-row-active' 
                      : 'app-row hover:bg-app-hover'
                    }
                  `}
                >
                  {/* Song Number / Playing Indicator */}
                  <div className="flex items-center justify-center">
                    {isActive && isPlaying ? (
                      <div className="flex items-center gap-0.5">
                        <span className="w-0.5 md:w-1 h-2 md:h-3 bg-accent rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-0.5 md:w-1 h-3 md:h-4 bg-accent rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-0.5 md:w-1 h-1.5 md:h-2 bg-accent rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    ) : (
                      <div className="relative w-4 h-4 md:w-5 md:h-5 flex items-center justify-center">
                        <span className={`
                          transition-opacity text-xs md:text-sm font-medium
                          ${isActive ? 'text-accent-soft' : 'text-theme-muted group-hover:opacity-0'}
                        `}>
                          {index + 1}
                        </span>
                        <Play 
                          className="absolute inset-0 w-3 h-3 md:w-4 md:h-4 m-auto opacity-0 group-hover:opacity-100 transition-opacity text-theme-primary" 
                          fill="currentColor"
                        />
                      </div>
                    )}
                  </div>

                  {/* Song Info */}
                  <div className="flex items-center gap-2 md:gap-3 min-w-0">
                    <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-elevated to-card rounded flex items-center justify-center flex-shrink-0">
                      <Music2 className="w-4 h-4 md:w-5 md:h-5 text-theme-muted" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`
                        text-sm md:text-base font-medium truncate
                        ${isActive ? 'text-accent-soft' : 'text-theme-primary'}
                      `}>
                        {song.title}
                      </div>
                      <div className="text-xs md:text-sm text-theme-muted truncate">
                        {song.artist}
                      </div>
                    </div>
                  </div>

                  {/* Album - Hidden on mobile */}
                  <div className="hidden md:flex items-center text-sm text-theme-muted truncate">
                    {song.album}
                  </div>

                  {/* Duration */}
                  <div className="flex items-center justify-center text-xs md:text-sm text-theme-muted">
                    {formatTime(song.durationSeconds)}
                  </div>

                  {/* Favorite Button */}
                  <div className="hidden md:flex items-center justify-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Add favorite functionality here
                      }}
                      className="p-2 hover:bg-app-hover/50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                      aria-label="Add to favorites"
                    >
                      <Heart className="w-4 h-4 hover:text-danger transition-colors" />
                    </button>
                  </div>

                  {/* Active Song Indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 md:w-1 h-6 md:h-8 bg-gradient-to-b from-accent to-accent-bright rounded-r-full"></div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default SongsList;