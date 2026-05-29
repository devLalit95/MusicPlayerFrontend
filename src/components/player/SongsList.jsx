import { useState, useMemo, useRef, useEffect } from 'react';
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

const searchText = (value) => String(value ?? '').toLowerCase();

const songMatchesQuery = (song, query) => (
  searchText(song.title).includes(query) ||
  searchText(song.artist).includes(query) ||
  searchText(song.album).includes(query)
);

const HighlightText = ({ text, query, fallback = '' }) => {
  const value = String(text || fallback);
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) return value;

  const lowerValue = value.toLowerCase();
  const parts = [];
  let cursor = 0;
  let matchIndex = lowerValue.indexOf(normalizedQuery, cursor);

  while (matchIndex !== -1) {
    if (matchIndex > cursor) {
      parts.push({ text: value.slice(cursor, matchIndex), isMatch: false });
    }

    parts.push({
      text: value.slice(matchIndex, matchIndex + normalizedQuery.length),
      isMatch: true,
    });

    cursor = matchIndex + normalizedQuery.length;
    matchIndex = lowerValue.indexOf(normalizedQuery, cursor);
  }

  if (cursor < value.length) {
    parts.push({ text: value.slice(cursor), isMatch: false });
  }

  if (parts.length === 0) return value;

  return (
    <>
      {parts.map((part, index) => (
        part.isMatch ? (
          <mark
            key={`${part.text}-${index}`}
            className="rounded bg-cyan-400/20 px-0.5 text-cyan-100 ring-1 ring-cyan-300/20 animate-[bb-highlight_500ms_ease-out]"
          >
            {part.text}
          </mark>
        ) : (
          <span key={`${part.text}-${index}`}>{part.text}</span>
        )
      ))}
    </>
  );
};

const SongsList = ({
  songs = [],
  currentSong,
  isPlaying,
  playSong,
  formatTime,
  isLoading = false,
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [likedIds, setLikedIds] = useState(new Set());
  const inputRef = useRef(null);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setDebouncedQuery('');
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(trimmedQuery);
    }, 500);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const activeQuery = debouncedQuery.trim();
  const normalizedQuery = activeQuery.toLowerCase();
  const hasActiveSearch = normalizedQuery.length > 0;
  const isSearchPending = query.trim().length > 0 && query.trim() !== activeQuery;

  const { rankedSongs, matchedCount } = useMemo(() => {
    if (!normalizedQuery) {
      return {
        rankedSongs: songs.map((song, originalIndex) => ({
          song,
          originalIndex,
          isSearchMatch: false,
        })),
        matchedCount: songs.length,
      };
    }

    const matches = [];
    const rest = [];

    songs.forEach((song, originalIndex) => {
      const item = {
        song,
        originalIndex,
        isSearchMatch: songMatchesQuery(song, normalizedQuery),
      };

      if (item.isSearchMatch) {
        matches.push(item);
      } else {
        rest.push(item);
      }
    });

    return {
      rankedSongs: [...matches, ...rest],
      matchedCount: matches.length,
    };
  }, [songs, normalizedQuery]);

  const toggleLike = (e, id) => {
    e.stopPropagation();
    setLikedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="relative flex flex-col h-full min-h-[380px] sm:min-h-[440px] lg:min-h-0 overflow-hidden
                    bg-[#0e0c20] rounded-3xl border border-violet-900/30">
      <style>{`
        @keyframes bb-search-row-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes bb-highlight {
          from { background-color: rgba(34, 211, 238, 0.36); }
          to { background-color: rgba(34, 211, 238, 0.2); }
        }
      `}</style>

      {/* ── Subtle glow ── */}
      <div className="pointer-events-none absolute top-0 right-0 w-72 h-40
                      bg-violet-800/10 blur-[60px] rounded-full" />

      {/* ── Sticky Header ── */}
      <div className="relative z-20 flex-shrink-0 px-3 sm:px-5 pt-4 sm:pt-5 pb-4
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
                {isLoading
                  ? 'Loading…'
                  : hasActiveSearch
                    ? `${matchedCount} match${matchedCount !== 1 ? 'es' : ''} in ${songs.length} songs`
                    : `${songs.length} songs`}
              </p>
            </div>
          </div>

          {query.trim() && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors duration-200
                             ${isSearchPending
                ? 'text-cyan-300/80 bg-cyan-500/10 border-cyan-400/20'
                : 'text-violet-400/70 bg-violet-900/30 border-violet-800/30'}`}>
              {isSearchPending
                ? 'Searching…'
                : `${matchedCount} match${matchedCount !== 1 ? 'es' : ''}`}
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
      <div className="flex-shrink-0 grid grid-cols-[28px_minmax(0,1fr)_44px]
                      sm:grid-cols-[32px_minmax(0,1fr)_56px]
                      lg:grid-cols-[36px_minmax(0,1.4fr)_minmax(0,1fr)_80px_44px]
                      gap-2 px-3 sm:px-5 py-2
                      text-[10px] uppercase tracking-[0.12em]
                      text-violet-600/50 font-medium
                      border-b border-violet-900/20">
        <span className="text-center">#</span>
        <span>Title</span>
        <span className="hidden lg:block">Album</span>
        <span className="flex items-center justify-end lg:justify-start gap-1">
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

        {/* Actual list */}
        {!isLoading && rankedSongs.map(({ song, isSearchMatch }, index) => {
          const isActive = currentSong?.id === song.id;
          const isLiked = likedIds.has(song.id);

          return (
            <div
              key={`${song.id}-${activeQuery}`}
              onClick={() => playSong(song)}
              style={{
                animation: hasActiveSearch
                  ? `bb-search-row-in 220ms ease-out ${Math.min(index, 10) * 24}ms both`
                  : undefined,
              }}
              className={`
                group relative
                grid grid-cols-[28px_minmax(0,1fr)_44px]
                sm:grid-cols-[32px_minmax(0,1fr)_56px]
                lg:grid-cols-[36px_minmax(0,1.4fr)_minmax(0,1fr)_80px_44px]
                gap-2 items-center
                px-2.5 sm:px-3 py-2.5 sm:py-2 mb-0.5 rounded-xl cursor-pointer
                transition-all duration-200 select-none
                ${isActive
                  ? 'bg-violet-600/[0.13] hover:bg-violet-600/[0.18]'
                  : isSearchMatch
                    ? 'bg-cyan-400/[0.06] ring-1 ring-cyan-300/10 hover:bg-cyan-400/[0.1]'
                    : hasActiveSearch
                      ? 'opacity-55 hover:opacity-90 hover:bg-violet-900/20'
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
              <div className="flex items-center justify-center h-9 sm:h-8">
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
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                {/* Thumb */}
                <div className={`
                  w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex-shrink-0 flex items-center justify-center
                  transition-all duration-200
                  ${isActive
                    ? 'bg-gradient-to-br from-violet-700/60 to-purple-900/60 border border-violet-600/40'
                    : 'bg-violet-950/70 group-hover:bg-violet-900/50'}
                `}>
                  <Music2 className={`w-3.5 h-3.5 transition-colors duration-200
                                     ${isActive ? 'text-violet-400' : 'text-violet-600/60'}`} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className={`
                    text-[13px] font-medium leading-snug break-words sm:truncate transition-colors duration-150
                    ${isActive ? 'text-violet-300' : isSearchMatch ? 'text-cyan-50' : 'text-violet-100 group-hover:text-white'}
                  `}>
                    <HighlightText text={song.title} query={activeQuery} fallback="Untitled track" />
                  </p>
                  <p className="text-[11px] text-violet-500/80 truncate mt-0.5">
                    <HighlightText text={song.artist} query={activeQuery} fallback="Unknown artist" />
                    {hasActiveSearch && song.album && (
                      <span className="lg:hidden text-violet-600/70">
                        {' · '}
                        <HighlightText text={song.album} query={activeQuery} />
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Album — desktop only */}
              <p className="hidden lg:block text-[12px] text-violet-500/60 truncate">
                <HighlightText text={song.album} query={activeQuery} fallback="—" />
              </p>

              {/* Duration */}
              <p className="text-[11px] sm:text-[12px] tabular-nums text-violet-500/60 text-right lg:text-center justify-self-end lg:justify-self-auto">
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
