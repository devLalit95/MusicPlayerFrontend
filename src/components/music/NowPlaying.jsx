import React, { useState, useRef } from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Volume2, 
  VolumeX, 
  Shuffle, 
  Repeat,
  Music2,
  Maximize2,
  Minimize2
} from 'lucide-react';

const NowPlaying = ({
  currentSong,
  isPlaying,
  currentTime,
  volume,
  isMuted,
  progressBarRef,
  togglePlay,
  playNext,
  playPrevious,
  handleProgressClick,
  handleVolumeChange,
  toggleMute,
  toggleFullscreen,
  isFullscreen,
  formatTime
}) => {
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off'); // 'off', 'all', 'one'

  const progress = currentSong?.durationSeconds 
    ? (currentTime / currentSong.durationSeconds) * 100 
    : 0;

  return (
    <section className="bg-gradient-to-b from-zinc-900 to-black text-white rounded-xl shadow-2xl overflow-hidden">
      {/* Album Art & Track Info */}
      <div className="p-6 md:p-8">
        <div className="flex flex-col items-center">
          {/* Album Art */}
          <div className="relative group mb-6">
            <div className="w-64 h-64 md:w-80 md:h-80 rounded-2xl bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-purple-500/20 flex items-center justify-center shadow-2xl shadow-purple-500/20 backdrop-blur-sm border border-zinc-800">
              {currentSong?.albumArt ? (
                <img 
                  src={currentSong.albumArt} 
                  alt={currentSong.title}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <div className="text-center">
                  <Music2 className="w-24 h-24 md:w-32 md:h-32 text-zinc-600 mx-auto mb-4" />
                  <span className="text-6xl md:text-7xl font-bold text-zinc-700">
                    {currentSong?.artist?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
              )}
            </div>
            
            {/* Vinyl Effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>

          {/* Track Info */}
          <div className="text-center mb-6 w-full max-w-md">
            <h2 className="text-2xl md:text-3xl font-bold mb-2 truncate bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              {currentSong?.title || 'No Track Playing'}
            </h2>
            <p className="text-base md:text-lg text-zinc-400 mb-1 truncate">
              {currentSong?.artist || 'Unknown Artist'}
            </p>
            <p className="text-sm text-zinc-500 truncate">
              {currentSong?.album || 'Unknown Album'}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <span className="text-xs md:text-sm text-zinc-400 font-medium min-w-[40px] text-right">
              {formatTime(currentTime)}
            </span>
            
            <div 
              className="flex-1 h-2 bg-zinc-800 rounded-full cursor-pointer group relative overflow-hidden"
              ref={progressBarRef}
              onClick={handleProgressClick}
            >
              {/* Progress Fill */}
              <div 
                className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-100"
                style={{ width: `${progress}%` }}
              >
                {/* Animated Glow */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg shadow-purple-500/50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              
              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
            </div>
            
            <span className="text-xs md:text-sm text-zinc-400 font-medium min-w-[40px]">
              {formatTime(currentSong?.durationSeconds || 0)}
            </span>
          </div>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-4 md:gap-6 mb-6">
          {/* Shuffle */}
          <button
            onClick={() => setIsShuffled(!isShuffled)}
            className={`p-2 md:p-3 rounded-full transition-all duration-200 ${
              isShuffled 
                ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            aria-label="Shuffle"
          >
            <Shuffle className="w-4 h-4 md:w-5 md:h-5" />
          </button>

          {/* Previous */}
          <button
            onClick={playPrevious}
            className="p-3 md:p-4 rounded-full text-white hover:bg-zinc-800 transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Previous"
          >
            <SkipBack className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="p-5 md:p-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-110 active:scale-95"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6 md:w-8 md:h-8" fill="currentColor" />
            ) : (
              <Play className="w-6 h-6 md:w-8 md:h-8 ml-1" fill="currentColor" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={playNext}
            className="p-3 md:p-4 rounded-full text-white hover:bg-zinc-800 transition-all duration-200 hover:scale-110 active:scale-95"
            aria-label="Next"
          >
            <SkipForward className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" />
          </button>

          {/* Repeat */}
          <button
            onClick={() => {
              const modes = ['off', 'all', 'one'];
              const currentIndex = modes.indexOf(repeatMode);
              setRepeatMode(modes[(currentIndex + 1) % modes.length]);
            }}
            className={`p-2 md:p-3 rounded-full transition-all duration-200 relative ${
              repeatMode !== 'off'
                ? 'bg-purple-500/20 text-purple-400 hover:bg-purple-500/30' 
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
            aria-label="Repeat"
          >
            <Repeat className="w-4 h-4 md:w-5 md:h-5" />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center text-[10px] font-bold">
                1
              </span>
            )}
          </button>
        </div>

        {/* Volume Control & Fullscreen */}
        <div className="flex items-center justify-between gap-4">
          {/* Volume Control */}
          <div className="flex items-center gap-3 flex-1 max-w-xs">
            <button
              onClick={toggleMute}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all duration-200"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            
            <div className="flex-1 relative group">
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer 
                  [&::-webkit-slider-thumb]:appearance-none 
                  [&::-webkit-slider-thumb]:w-3 
                  [&::-webkit-slider-thumb]:h-3 
                  [&::-webkit-slider-thumb]:rounded-full 
                  [&::-webkit-slider-thumb]:bg-white 
                  [&::-webkit-slider-thumb]:shadow-lg
                  [&::-webkit-slider-thumb]:shadow-purple-500/50
                  [&::-webkit-slider-thumb]:cursor-pointer
                  [&::-webkit-slider-thumb]:transition-all
                  [&::-webkit-slider-thumb]:hover:scale-125
                  [&::-moz-range-thumb]:w-3 
                  [&::-moz-range-thumb]:h-3 
                  [&::-moz-range-thumb]:rounded-full 
                  [&::-moz-range-thumb]:bg-white 
                  [&::-moz-range-thumb]:border-0
                  [&::-moz-range-thumb]:shadow-lg
                  [&::-moz-range-thumb]:shadow-purple-500/50
                  [&::-moz-range-thumb]:cursor-pointer
                  [&::-moz-range-thumb]:transition-all
                  [&::-moz-range-thumb]:hover:scale-125"
                style={{
                  background: `linear-gradient(to right, 
                    rgb(168 85 247) 0%, 
                    rgb(236 72 153) ${(isMuted ? 0 : volume) * 100}%, 
                    rgb(39 39 42) ${(isMuted ? 0 : volume) * 100}%, 
                    rgb(39 39 42) 100%)`
                }}
              />
            </div>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-full transition-all duration-200"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5" />
            ) : (
              <Maximize2 className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
};

export default NowPlaying;