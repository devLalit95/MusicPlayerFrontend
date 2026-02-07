import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SongTable = ({ songs, onEdit, onDelete, loading }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterArtist, setFilterArtist] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [hoveredRow, setHoveredRow] = useState(null);

  // Get unique artists for filter
  const artists = useMemo(() => {
    return [...new Set(songs.map(song => song.artist).filter(Boolean))];
  }, [songs]);

  // Filter and search songs
  const filteredSongs = useMemo(() => {
    return songs.filter(song => {
      const matchesSearch = song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (song.album && song.album.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesArtist = !filterArtist || song.artist === filterArtist;
      return matchesSearch && matchesArtist;
    });
  }, [songs, searchTerm, filterArtist]);

  // Sort songs
  const sortedSongs = useMemo(() => {
    if (!sortConfig.key) return filteredSongs;
    return [...filteredSongs].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredSongs, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(current => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const formatDuration = (seconds) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // SkeletonLoader Component
  const SkeletonLoader = () => {
    const SkeletonRow = ({ index }) => (
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.05 }}
        className="border-b border-gray-200"
      >
        <td className="px-4 py-4 md:px-6 md:py-4">
          <div className="flex items-center space-x-3">
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2"></div>
            </div>
          </div>
        </td>
        <td className="px-4 py-4 md:px-6 md:py-4 hidden md:table-cell">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
        </td>
        <td className="px-4 py-4 md:px-6 md:py-4 hidden lg:table-cell">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
        </td>
        <td className="px-4 py-4 md:px-6 md:py-4 hidden sm:table-cell">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
        </td>
        <td className="px-4 py-4 md:px-6 md:py-4">
          <div className="flex justify-end space-x-2">
            <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="w-20 h-9 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </td>
      </motion.tr>
    );

    return (
      <>
        {[...Array(6)].map((_, index) => (
          <SkeletonRow key={index} index={index} />
        ))}
      </>
    );
  };

  // Mobile Card Component
  const MobileCard = ({ song, index }) => (
    <motion.div
      variants={tableRowVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-3"
    >
      {/* Main Content - Left Aligned */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 text-base truncate mb-1">{song.title}</h3>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
            <p className="text-gray-600">{song.artist}</p>
            {song.album && (
              <>
                <span className="text-gray-400 hidden sm:inline">•</span>
                <p className="text-gray-500 truncate">{song.album}</p>
              </>
            )}
          </div>
        </div>
        <div className="text-sm text-gray-500 flex-shrink-0 ml-3">
          {formatDuration(song.durationSeconds)}
        </div>
      </div>
      
      {/* Action Buttons - Right Aligned */}
      <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
        <motion.button
          onClick={() => onEdit(song)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-lg transition-colors flex items-center space-x-2 text-sm font-medium min-w-[80px] justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>✏️</span>
          <span>Edit</span>
        </motion.button>
        <motion.button
          onClick={() => onDelete(song.id, song.title)}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2.5 rounded-lg transition-colors flex items-center space-x-2 text-sm font-medium min-w-[80px] justify-center"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span>🗑️</span>
          <span>Delete</span>
        </motion.button>
      </div>
    </motion.div>
  );

  // Table row animation variants
  const tableRowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-6">
      {/* Search and Filter Header */}
      <div className="mb-4 md:mb-6 space-y-3 md:space-y-0 md:flex md:items-center md:space-x-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search songs, artists, or albums..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 md:py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm md:text-base"
            disabled={loading}
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg">
            🔍
          </div>
        </div>
        
        {/* filter list */}


<select
  value={filterArtist}
  onChange={(e) => setFilterArtist(e.target.value)}
  className="w-full md:w-48 px-4 py-2.5 md:py-3 border border-gray-300 rounded-xl 
             focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent 
             appearance-none bg-white text-black text-sm md:text-base"
  disabled={loading}
>
  <option value="" className="filter-list">All Artists</option>
  {artists.map(artist => (
    <option key={artist} value={artist}>{artist}</option>
  ))}
</select>


      </div>

      {/* Status Bar */}
      <div className="mb-4 flex items-center justify-between text-xs md:text-sm">
        {loading ? (
          <div className="text-purple-600 font-medium flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <span>Loading songs...</span>
          </div>
        ) : (
          <p className="text-gray-600 font-medium">
            Showing {sortedSongs.length} of {songs.length} songs
          </p>
        )}
      </div>

      {/* Mobile View - Cards */}
      <div className="block md:hidden">
        {loading && songs.length === 0 ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 animate-pulse">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-8 h-4 bg-gray-200 rounded ml-3"></div>
                </div>
                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                  <div className="w-20 h-9 bg-gray-200 rounded-lg"></div>
                  <div className="w-20 h-9 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedSongs.length > 0 ? (
          <AnimatePresence mode="popLayout">
            {sortedSongs.map((song, index) => (
              <MobileCard key={song.id} song={song} index={index} />
            ))}
          </AnimatePresence>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-5xl mb-3">🎵</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {songs.length === 0 ? "No songs yet" : "No songs found"}
            </h3>
            <p className="text-sm text-gray-500">
              {songs.length === 0 ? "Start by uploading your first song to the library" : "Try adjusting your search or filter criteria"}
            </p>
          </div>
        )}
      </div>

      {/* Desktop View - Table */}
      <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left">
                  <motion.button
                    onClick={() => handleSort('title')}
                    className="flex items-center space-x-2 font-semibold text-gray-700 hover:text-purple-600 transition-colors text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Song</span>
                    <span className="text-xs">{getSortIcon('title')}</span>
                  </motion.button>
                </th>
                <th className="px-6 py-4 text-left">
                  <motion.button
                    onClick={() => handleSort('artist')}
                    className="flex items-center space-x-2 font-semibold text-gray-700 hover:text-purple-600 transition-colors text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Artist</span>
                    <span className="text-xs">{getSortIcon('artist')}</span>
                  </motion.button>
                </th>
                <th className="px-6 py-4 text-left hidden lg:table-cell">
                  <motion.button
                    onClick={() => handleSort('album')}
                    className="flex items-center space-x-2 font-semibold text-gray-700 hover:text-purple-600 transition-colors text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Album</span>
                    <span className="text-xs">{getSortIcon('album')}</span>
                  </motion.button>
                </th>
                <th className="px-6 py-4 text-left w-24">
                  <motion.button
                    onClick={() => handleSort('durationSeconds')}
                    className="flex items-center space-x-2 font-semibold text-gray-700 hover:text-purple-600 transition-colors text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span>Duration</span>
                    <span className="text-xs">{getSortIcon('durationSeconds')}</span>
                  </motion.button>
                </th>
                <th className="px-6 py-4 text-right font-semibold text-gray-700 text-sm w-48">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && songs.length === 0 ? (
                <SkeletonLoader />
              ) : loading && songs.length > 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center">
                    <div className="flex items-center justify-center space-x-3 text-purple-600">
                      <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="font-medium">Updating library...</span>
                    </div>
                  </td>
                </tr>
              ) : sortedSongs.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {sortedSongs.map((song, index) => (
                    <motion.tr
                      key={song.id}
                      variants={tableRowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      onMouseEnter={() => setHoveredRow(song.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      <td className="px-6 py-4">
                        <div className="min-w-0 flex-1">
                          <div className="font-medium text-gray-900 truncate  text-left text-sm">{song.title}</div>
                          <div className="text-xs text-gray-500 text-left">ID: {song.id}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-left text-sm text-gray-700 truncate max-w-[200px]">{song.artist}</div>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <div className="text-left text-sm text-gray-600 truncate max-w-[250px]">{song.album || "No album"}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-700 font-mono">{formatDuration(song.durationSeconds)}</div>
                      </td>
                      <td className="px-6 py-4 ">
                        <AnimatePresence>
                          {(hoveredRow === song.id || true) && (
                            <motion.div
                              initial={{ opacity: 0, x: 20 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 20 }}
                              className="flex justify-end space-x-2"
                            >
                              <motion.button
                                onClick={() => onEdit(song)}
                                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-1.5 text-sm font-medium"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <span>✏️</span>
                                <span>Edit</span>
                              </motion.button>
                              <motion.button
                                onClick={() => onDelete(song.id, song.title)}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center space-x-1.5 text-sm font-medium"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                <span>🗑️</span>
                                <span>Delete</span>
                              </motion.button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-16 text-center">
                    <div className="flex flex-col items-center">
                      <div className="text-6xl mb-4">🎵</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {songs.length === 0 ? "No songs yet" : "No songs found"}
                      </h3>
                      <p className="text-gray-500">
                        {songs.length === 0 ? "Start by uploading your first song to the library" : "Try adjusting your search or filter criteria"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SongTable;