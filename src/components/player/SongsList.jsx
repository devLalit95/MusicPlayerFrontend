import { useState, useMemo, useRef } from 'react';
import {
  Heart, Music2, Play, Pause,
  Search, X, ListMusic, Clock3
} from 'lucide-react';

/* ── Animated waveform for active+playing row ── */
const WaveBars = () => (
  <div className="flex items-center gap-[3px] h-4">
    {[0, 150, 300, 75].map((delay, i) => (
      <span
        key={i}
        className="inline-block w-[3px] rounded-full bg-violet-500"
        style={{
          animation: `bb-wave 0.8s ease-in-out ${delay}ms infinite alternate`,
          height: 14,
        }}
      />
    ))}
    <style>{`
      @keyframes bb-wave {
        from { transform: scaleY(0.25); }
        to   { transform: scaleY(1); }
      }
    `}</style>
  </div>
);

const SongsList = ({
  songs = [],
  currentSong,
  isPlaying,
  playSong,
  formatTime,
  isLoading = false,
}) => {
  const [query, setQuery] = useState('');
  const [likedIds, setLikedIds] = useState(new Set());
  const inputRef = useRef(null);

  const filtered = useMemo(() => {
    if (!query.trim()) return songs;
    const q = query.toLowerCase();
    return songs.filter(s =>
      s.title?.toLowerCase().includes(q) ||
      s.artist?.toLowerCase().includes(q) ||
      s.album?.toLowerCase().includes(q)
    );
  }, [songs, query]);

  const toggleLike = (e, id) => {
    e.stopPropagation();
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="relative flex flex-col h-full min-h-0 overflow-hidden
                    bg-[#0e0c20] rounded-3xl border border-violet-900/30">

      {/* ── Subtle glow ── */}
      <div className="pointer-events-none absolute top-0 right-0 w-72 h-40
                      bg-violet-800/10 blur-[60px] rounded-full" />

      {/* ── Sticky Header ── */}
      <div className="relative z-20 flex-shrink-0 px-5 pt-5 pb-4
                      border-b border-violet-900/30
                      bg-[#0e0c20]/95 backdrop-blur-sm">

        {/* Title row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center
                            bg-gradient-to-br from-violet-600 to-purple-800
                            shadow-[0_0_12px_rgba(124,58,237,0.4)]">
              <ListMusic className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Library</h2>
              <p className="text-[11px] text-violet-500/70 leading-none mt-0.5">
                {isLoading ? 'Loading…' : `${filtered.length} of ${songs.length} songs`}
              </p>
            </div>
          </div>

          {query && (
            <span className="text-[10px] text-violet-400/60 bg-violet-900/30
                             px-2 py-0.5 rounded-full border border-violet-800/30">
              {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>

        {/* ── Search box ── */}
        <div className="relative flex items-center group">
          {/* Glow ring on focus */}
          <div className="absolute inset-0 rounded-xl bg-violet-600/0
                          group-focus-within:bg-violet-600/10
                          transition-colors duration-300 -z-10 blur-sm scale-105" />

          <Search
            className="absolute left-3.5 w-3.5 h-3.5 text-violet-500/50
                       group-focus-within:text-violet-400 transition-colors duration-200"
          />

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search tracks, artists, albums…"
            className="w-full pl-9 pr-9 py-2.5
                       bg-violet-950/60 hover:bg-violet-950/80
                       border border-violet-800/30
                       hover:border-violet-700/40
                       focus:border-violet-500/60
                       focus:bg-[#1a1535]
                       focus:shadow-[0_0_0_3px_rgba(124,58,237,0.12),0_0_20px_rgba(124,58,237,0.07)]
                       rounded-xl
                       text-[13px] text-violet-100
                       placeholder:text-violet-600/50
                       outline-none
                       transition-all duration-250
                       caret-violet-400"
          />

          {/* Clear button */}
          {query ? (
            <button
              onClick={() => { setQuery(''); inputRef.current?.focus(); }}
              className="absolute right-2.5 w-5 h-5 rounded-md
                         flex items-center justify-center
                         text-violet-500/60 hover:text-violet-300
                         bg-violet-900/0 hover:bg-violet-800/40
                         transition-all duration-150"
            >
              <X className="w-3 h-3" />
            </button>
          ) : (
            <kbd className="absolute right-3 text-[10px] text-violet-600/40
                            font-mono select-none hidden sm:block">
              /
            </kbd>
          )}
        </div>

        {/* Keyboard shortcut hint */}
        <p className="text-[10px] text-violet-600/30 mt-1.5 pl-1 hidden sm:block">
          Press <span className="font-mono">/</span> to search
        </p>
      </div>

      {/* ── Column headers ── */}
      <div className="flex-shrink-0 grid grid-cols-[36px_1fr_100px_56px]
                      lg:grid-cols-[36px_1fr_1fr_80px_44px]
                      gap-2 px-5 py-2
                      text-[10px] uppercase tracking-[0.12em]
                      text-violet-600/50 font-medium
                      border-b border-violet-900/20">
        <span className="text-center">#</span>
        <span>Title</span>
        <span className="hidden lg:block">Album</span>
        <span className="flex items-center gap-1">
          <Clock3 className="w-3 h-3" />
        </span>
        <span className="hidden lg:block" />
      </div>

      {/* ── Song rows ── */}
      <div className="flex-1 overflow-y-auto min-h-0
                      scrollbar-thin scrollbar-track-transparent
                      scrollbar-thumb-violet-900/60
                      hover:scrollbar-thumb-violet-800/80
                      [scrollbar-width:thin]
                      [scrollbar-color:rgba(91,33,182,0.4)_transparent]
                      px-2 py-1.5">

        {/* Loading skeleton */}
        {isLoading && (
          <div className="space-y-1 p-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                <div className="w-5 h-3 rounded bg-violet-900/60 animate-pulse" />
                <div className="w-6 h-6 rounded-lg bg-violet-900/60 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-2.5 rounded bg-violet-900/50 animate-pulse w-2/3" />
                  <div className="h-2 rounded bg-violet-900/40 animate-pulse w-1/3" />
                </div>
                <div className="w-8 h-2.5 rounded bg-violet-900/40 animate-pulse" />
              </div>
            ))}
          </div>
        )}

        {/* Empty library */}
        {!isLoading && songs.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
            <div className="w-14 h-14 rounded-2xl bg-violet-900/30 border border-violet-800/30
                            flex items-center justify-center">
              <Music2 className="w-7 h-7 text-violet-600/50" strokeWidth={1.2} />
            </div>
            <p className="text-sm font-medium text-violet-400/60">No songs yet</p>
            <p className="text-xs text-violet-600/40">Add some music to get started</p>
          </div>
        )}

        {/* No search results */}
        {!isLoading && songs.length > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
            <div className="w-14 h-14 rounded-2xl bg-violet-900/30 border border-violet-800/30
                            flex items-center justify-center">
              <Search className="w-7 h-7 text-violet-600/50" strokeWidth={1.2} />
            </div>
            <p className="text-sm font-medium text-violet-400/60">No results</p>
            <p className="text-xs text-violet-600/40 text-center max-w-[180px]">
              Nothing matches "{query}"
            </p>
            <button
              onClick={() => setQuery('')}
              className="mt-1 px-3 py-1.5 rounded-lg text-xs font-medium
                         bg-violet-600/15 hover:bg-violet-600/25
                         text-violet-400 border border-violet-700/30
                         transition-colors duration-150"
            >
              Clear search
            </button>
          </div>
        )}

        {/* Actual list */}
        {!isLoading && filtered.map((song, index) => {
          const isActive = currentSong?.id === song.id;
          const isLiked = likedIds.has(song.id);

          return (
            <div
              key={song.id}
              onClick={() => playSong(song)}
              className={`
                group relative
                grid grid-cols-[36px_1fr_100px_56px]
                lg:grid-cols-[36px_1fr_1fr_80px_44px]
                gap-2 items-center
                px-3 py-2 mb-0.5 rounded-xl cursor-pointer
                transition-all duration-150 select-none
                ${isActive
                  ? 'bg-violet-600/[0.13] hover:bg-violet-600/[0.18]'
                  : 'hover:bg-violet-900/25'
                }
              `}
            >
              {/* Left active bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2
                                w-[3px] h-6 rounded-r-full
                                bg-gradient-to-b from-violet-500 to-purple-600" />
              )}

              {/* Index / wave */}
              <div className="flex items-center justify-center h-8">
                {isActive && isPlaying ? (
                  <WaveBars />
                ) : (
                  <div className="relative w-5 h-5 flex items-center justify-center">
                    <span className={`
                      text-[12px] font-medium tabular-nums
                      transition-all duration-150
                      group-hover:opacity-0
                      ${isActive ? 'text-violet-400' : 'text-violet-600/50'}
                    `}>
                      {index + 1}
                    </span>
                    <Play
                      className="absolute w-3 h-3 text-white
                                 opacity-0 group-hover:opacity-100
                                 transition-opacity duration-150"
                      fill="currentColor"
                    />
                  </div>
                )}
              </div>

              {/* Song info */}
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Thumb */}
                <div className={`
                  w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center
                  transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-br from-violet-700/60 to-purple-900/60 border border-violet-600/40'
                    : 'bg-violet-950/70 group-hover:bg-violet-900/50'}
                `}>
                  <Music2 className={`w-3.5 h-3.5 transition-colors duration-200
                                     ${isActive ? 'text-violet-400' : 'text-violet-600/60'}`} />
                </div>

                <div className="min-w-0">
                  <p className={`
                    text-[13px] font-medium leading-tight truncate transition-colors duration-150
                    ${isActive ? 'text-violet-300' : 'text-violet-100 group-hover:text-white'}
                  `}>
                    {song.title}
                  </p>
                  <p className="text-[11px] text-violet-500/80 truncate mt-0.5">
                    {song.artist}
                  </p>
                </div>
              </div>

              {/* Album — desktop only */}
              <p className="hidden lg:block text-[12px] text-violet-500/60 truncate">
                {song.album || '—'}
              </p>

              {/* Duration */}
              <p className="text-[12px] tabular-nums text-violet-500/60 text-center">
                {formatTime(song.durationSeconds)}
              </p>

              {/* Like — desktop only */}
              <div className="hidden lg:flex items-center justify-center">
                <button
                  onClick={e => toggleLike(e, song.id)}
                  className={`
                    w-7 h-7 rounded-lg flex items-center justify-center
                    transition-all duration-150
                    ${isLiked
                      ? 'text-rose-400 bg-rose-500/10'
                      : 'text-violet-600/0 group-hover:text-violet-500/50 hover:!text-rose-400 hover:!bg-rose-500/10'}
                  `}
                >
                  <Heart
                    className="w-3.5 h-3.5 transition-all"
                    fill={isLiked ? 'currentColor' : 'none'}
                  />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SongsList;
