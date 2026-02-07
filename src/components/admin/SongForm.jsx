import React, { useState } from "react";

const SongForm = ({ 
  onSubmit, 
  onCancel, 
  editingSong, 
  loading,
  initialData = {
    title: "",
    artist: "",
    album: "",
    durationSeconds: "",
    file: null
  }
}) => {
  const [songData, setSongData] = useState(initialData);
  const [filePreview, setFilePreview] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('audio/')) {
        alert("Please select an audio file (MP3, WAV, etc.)");
        return;
      }
      
      // Validate file size (50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert("File size must be less than 50MB");
        return;
      }

      setSongData({ ...songData, file });
      setFilePreview(file.name);

      // Auto-calculate duration if possible
      if (!editingSong && !songData.durationSeconds) {
        const audio = new Audio();
        audio.src = URL.createObjectURL(file);
        audio.onloadedmetadata = () => {
          setSongData(prev => ({ 
            ...prev, 
            durationSeconds: Math.round(audio.duration) 
          }));
        };
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!songData.title.trim() || !songData.artist.trim()) {
      alert("Please fill in title and artist!");
      return;
    }

    if (!editingSong && !songData.file) {
      alert("Please select an audio file!");
      return;
    }

    onSubmit(songData);
  };

  const handleInputChange = (field, value) => {
    setSongData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">
          {editingSong ? "Edit Song" : "Upload New Song"}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-gray-700 flex items-center space-x-1 transition-colors"
        >
          <span>← Back to Songs</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Song Title *
            </label>
            <input
              type="text"
              value={songData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="Enter song title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Artist *
            </label>
            <input
              type="text"
              value={songData.artist}
              onChange={(e) => handleInputChange('artist', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="Enter artist name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Album
            </label>
            <input
              type="text"
              value={songData.album}
              onChange={(e) => handleInputChange('album', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="Enter album name (optional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (seconds)
            </label>
            <input
              type="number"
              value={songData.durationSeconds}
              onChange={(e) => handleInputChange('durationSeconds', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
              placeholder="Duration in seconds"
              min="0"
            />
          </div>
        </div>

        {!editingSong && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Audio File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-purple-400 transition-colors cursor-pointer">
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
                required={!editingSong}
              />
              <label htmlFor="file-upload" className="cursor-pointer block">
                <div className="space-y-2">
                  <div className="text-3xl">🎵</div>
                  <div className="text-gray-600">
                    {filePreview ? (
                      <span className="text-purple-600 font-medium">{filePreview}</span>
                    ) : (
                      "Click to upload audio file (MP3, WAV, etc.)"
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Max 50MB • Supports most audio formats</div>
                </div>
              </label>
            </div>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2 shadow-lg"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>{editingSong ? "Updating..." : "Uploading..."}</span>
              </>
            ) : (
              <>
                <span>{editingSong ? "💾" : "🚀"}</span>
                <span>{editingSong ? "Update Song" : "Upload Song"}</span>
              </>
            )}
          </button>
          
          {editingSong && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default SongForm;