import { useState } from 'react';
import {
  Play, Pause, SkipForward, SkipBack,
  Volume2, VolumeX, Shuffle, Repeat, Music2, Heart
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
  formatTime,
}) => {
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState('off');
  const [isLiked, setIsLiked] = useState(false);

  const progress = currentSong?.durationSeconds
    ? (currentTime / currentSong.durationSeconds) * 100
    : 0;

  const cycleRepeat = () => {
    const modes = ['off', 'all', 'one'];
    setRepeatMode(modes[(modes.indexOf(repeatMode) + 1) % modes.length]);
  };

  return (
    /* ── Outer shell: full height on desktop, natural height on mobile ── */
    <div className="relative flex flex-col h-auto lg:h-full min-h-0 overflow-hidden
                    bg-[#0e0c20] rounded-2xl sm:rounded-3xl border border-violet-900/30">

      {/* ── Ambient glow orbs ── */}
      <div className="pointer-events-none absolute -top-16 -left-16 w-64 h-64
                      rounded-full bg-violet-600/20 blur-[80px]" />
      <div className="pointer-events-none absolute bottom-0 right-8 w-48 h-48
                      rounded-full bg-cyan-500/10 blur-[70px]" />

      {/* ── Scrollable inner ── */}
      <div className="relative z-10 flex flex-col flex-1 p-4 sm:p-6 xl:p-8 gap-4 sm:gap-6 xl:gap-8 overflow-y-auto
                      scrollbar-none [scrollbar-width:none] [-ms-overflow-style:none]">

        {/* ── Album art ── */}
        <div className="flex justify-center">
          <div className="relative group">
            {/* Outer glow ring */}
            <div className="absolute inset-0 rounded-[24px] sm:rounded-[28px] bg-gradient-to-br
                            from-violet-600/40 to-purple-900/0 blur-lg sm:blur-xl scale-105 sm:scale-110
                            group-hover:scale-125 transition-transform duration-700" />
            {/* Art box */}
            <div className="relative w-36 h-36 min-[380px]:w-40 min-[380px]:h-40 sm:w-52 sm:h-52 xl:w-64 xl:h-64
                            rounded-[20px] sm:rounded-[24px] overflow-hidden
                            bg-gradient-to-br from-violet-950 via-[#1a0f3a] to-[#0e0c20]
                            border border-violet-700/30
                            shadow-[0_0_40px_rgba(124,58,237,0.25)]">
              {currentSong?.albumArt ? (
                <img src={currentSong.albumArt} alt={currentSong.title}
                  className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                  {/* Decorative ring */}
                  <div className="absolute inset-5 sm:inset-6 rounded-full border border-violet-700/20" />
                  <div className="absolute inset-8 sm:inset-10 rounded-full border border-violet-600/15" />
                  <Music2 className="w-10 h-10 sm:w-14 sm:h-14 text-violet-600/50" strokeWidth={1} />
                </div>
              )}
              {/* Specular highlight */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] to-transparent
                              rounded-[20px] sm:rounded-[24px] pointer-events-none" />
            </div>
            {/* Like button floating on art */}
            <button
              onClick={() => setIsLiked(!isLiked)}
              className={`absolute top-2 right-2 sm:top-3 sm:right-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center
                          backdrop-blur-sm border transition-all duration-200
                          ${isLiked
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                  : 'bg-black/30 border-white/10 text-white/40 hover:text-white/70'}`}
            >
              <Heart className="w-3.5 h-3.5" fill={isLiked ? 'currentColor' : 'none'} />
            </button>
          </div>
        </div>

        {/* ── Track info ── */}
        <div className="text-center space-y-1 sm:space-y-1.5 min-w-0">
          <p className="text-[9px] sm:text-[10px] tracking-[0.2em] uppercase text-violet-400/70 font-medium">
            Now Playing
          </p>
          <h2 className="max-w-full text-xl sm:text-2xl xl:text-3xl font-bold text-white leading-snug tracking-tight break-words">
            {currentSong?.title || 'No Track Selected'}
          </h2>
          <p className="text-xs sm:text-sm font-medium text-violet-300/80 truncate">
            {currentSong?.artist || '—'}
          </p>
          <p className="text-[11px] sm:text-xs text-violet-500/60 truncate">
            {currentSong?.album || ''}
          </p>
        </div>

        {/* ── Progress bar ── */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-[10px] sm:text-[11px] tabular-nums text-violet-400/60 w-7 sm:w-8 text-right">
              {formatTime(currentTime)}
            </span>

            {/* Track */}
            <div
              ref={progressBarRef}
              onClick={handleProgressClick}
              className="flex-1 h-1 bg-violet-950/80 rounded-full cursor-pointer group relative"
            >
              <div
                className="absolute inset-y-0 left-0 rounded-full
                           bg-gradient-to-r from-violet-600 to-purple-400
                           transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              >
                {/* Knob */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2
                                w-3.5 h-3.5 rounded-full bg-white
                                shadow-[0_0_8px_rgba(167,139,250,0.8)]
                                border-2 border-violet-400
                                opacity-0 group-hover:opacity-100
                                scale-75 group-hover:scale-100
                                transition-all duration-150" />
              </div>
            </div>

            <span className="text-[10px] sm:text-[11px] tabular-nums text-violet-400/60 w-7 sm:w-8">
              {formatTime(currentSong?.durationSeconds || 0)}
            </span>
          </div>
        </div>

        {/* ── Main controls ── */}
        <div className="flex items-center justify-center gap-1.5 min-[360px]:gap-2 sm:gap-4">
          {/* Shuffle */}
          <button
            onClick={() => setIsShuffled(!isShuffled)}
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-200
                        ${isShuffled
                ? 'bg-violet-600/20 text-violet-400'
                : 'text-violet-500/50 hover:text-violet-300 hover:bg-violet-800/20'}`}
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Prev */}
          <button
            onClick={playPrevious}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center
                       text-violet-200 hover:bg-violet-800/30 transition-all duration-200
                       active:scale-95"
          >
            <SkipBack className="w-5 h-5" fill="currentColor" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center
                       bg-gradient-to-br from-violet-500 to-purple-700
                       shadow-[0_0_28px_rgba(124,58,237,0.5)]
                       hover:shadow-[0_0_36px_rgba(124,58,237,0.65)]
                       hover:scale-105 active:scale-95
                       transition-all duration-200 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent" />
            {isPlaying
              ? <Pause className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" fill="currentColor" />
              : <Play className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10 ml-0.5" fill="currentColor" />}
          </button>

          {/* Next */}
          <button
            onClick={playNext}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center
                       text-violet-200 hover:bg-violet-800/30 transition-all duration-200
                       active:scale-95"
          >
            <SkipForward className="w-5 h-5" fill="currentColor" />
          </button>

          {/* Repeat */}
          <button
            onClick={cycleRepeat}
            className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl flex items-center justify-center transition-all duration-200
                        ${repeatMode !== 'off'
                ? 'bg-violet-600/20 text-violet-400'
                : 'text-violet-500/50 hover:text-violet-300 hover:bg-violet-800/20'}`}
          >
            <Repeat className="w-4 h-4" />
            {repeatMode === 'one' && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full
                               bg-violet-600 text-white text-[8px] font-bold
                               flex items-center justify-center">
                1
              </span>
            )}
          </button>
        </div>

        {/* ── Volume ── */}
        <div className="flex items-center gap-2 sm:gap-3 px-0 sm:px-2">
          <button
            onClick={toggleMute}
            className="text-violet-500/60 hover:text-violet-300 transition-colors flex-shrink-0"
          >
            {isMuted || volume === 0
              ? <VolumeX className="w-4 h-4" />
              : <Volume2 className="w-4 h-4" />}
          </button>

          <div className="flex-1 relative">
            <input
              type="range" min="0" max="1" step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-full h-1 rounded-full appearance-none cursor-pointer
                         [&::-webkit-slider-thumb]:appearance-none
                         [&::-webkit-slider-thumb]:w-3
                         [&::-webkit-slider-thumb]:h-3
                         [&::-webkit-slider-thumb]:rounded-full
                         [&::-webkit-slider-thumb]:bg-white
                         [&::-webkit-slider-thumb]:border-2
                         [&::-webkit-slider-thumb]:border-violet-400
                         [&::-webkit-slider-thumb]:shadow-[0_0_6px_rgba(167,139,250,0.7)]
                         [&::-webkit-slider-thumb]:cursor-pointer
                         [&::-webkit-slider-thumb]:transition-transform
                         [&::-webkit-slider-thumb]:hover:scale-125
                         [&::-moz-range-thumb]:w-3
                         [&::-moz-range-thumb]:h-3
                         [&::-moz-range-thumb]:rounded-full
                         [&::-moz-range-thumb]:bg-white
                         [&::-moz-range-thumb]:border-2
                         [&::-moz-range-thumb]:border-violet-400
                         [&::-moz-range-thumb]:cursor-pointer"
              style={{
                background: `linear-gradient(to right,
                  #7c3aed 0%,
                  #a855f7 ${(isMuted ? 0 : volume) * 100}%,
                  #1e1b35 ${(isMuted ? 0 : volume) * 100}%,
                  #1e1b35 100%)`,
              }}
            />
          </div>

          <span className="text-[10px] sm:text-[11px] tabular-nums text-violet-500/60 w-6 sm:w-7 text-right">
            {Math.round((isMuted ? 0 : volume) * 100)}
          </span>
        </div>

      </div>
    </div>
  );
};

export default NowPlaying;
