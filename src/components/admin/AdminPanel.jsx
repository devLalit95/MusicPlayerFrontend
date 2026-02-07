import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import AdminAuth from "./AdminAuth";
import SongManager from "./SongManager";
import SongTable from "./SongTable";
import SongForm from "./SongForm";

export default function AdminPanel() {
  const [token, setToken] = useState("");
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingSong, setEditingSong] = useState(null);
  const [activeTab, setActiveTab] = useState("songs");
  
  const BASE_URL = "https://musicplayer-rc7u.onrender.com";
  const [songManager] = useState(new SongManager(BASE_URL, ""));
  const user = JSON.parse(localStorage.getItem("user"));
  const name = user?.username;


  // Update song manager when token changes
  useEffect(() => {
    if (token) {
      songManager.setToken(token);
    }
  }, [token, songManager]);

  // Auto-fetch songs when logged in
  useEffect(() => {
    if (token) {
      fetchSongs();
    }
  }, [token]);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      const songsData = await songManager.fetchSongs();
      setSongs(songsData);
    } catch (err) {
      if (err.message === "SESSION_EXPIRED") {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (jwtToken) => {
    setToken(jwtToken);
  };

  const handleLogout = () => {
    setToken("");
    setSongs([]);
    setEditingSong(null);
    setActiveTab("songs");
  };

  const handleSongUpload = async (songData) => {
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", songData.file);
      formData.append("title", songData.title);
      formData.append("artist", songData.artist);
      formData.append("album", songData.album);
      formData.append("durationSeconds", songData.durationSeconds);

      await songManager.uploadSong(formData);
      toast.success("🎵 Song uploaded successfully!");
      resetForm();
      fetchSongs();
      setActiveTab("songs");
    } catch (err) {
      if (err.message === "SESSION_EXPIRED") {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

const handleUpdateSong = async (songData) => {
  try {
    setLoading(true);

    const updateData = {};
    if (songData.title?.trim()) updateData.title = songData.title;
    if (songData.artist?.trim()) updateData.artist = songData.artist;
    if (songData.album?.trim()) updateData.album = songData.album;
    if (songData.durationSeconds != null)
      updateData.durationSeconds = Number(songData.durationSeconds);

    await songManager.updateSong(editingSong.id, updateData);

    toast.success("✅ Song updated successfully!");
    resetForm();
    fetchSongs();
    setActiveTab("songs");
  } finally {
    setLoading(false);
  }
};


  const handleDeleteSong = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) {
      return;
    }

    try {
      setLoading(true);
      await songManager.deleteSong(id);
      toast.success("🗑️ Song deleted successfully!");
      fetchSongs();
    } catch (err) {
      if (err.message === "SESSION_EXPIRED") {
        handleLogout();
      }
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (song) => {
    setEditingSong(song);
    setActiveTab("upload");
  };

  const resetForm = () => {
    setEditingSong(null);
  };

  const handleFormSubmit = (songData) => {
    if (editingSong) {
      handleUpdateSong(songData);
    } else {
      handleSongUpload(songData);
    }
  };

  const handleFormCancel = () => {
    resetForm();
    setActiveTab("songs");
  };

  const renderAdminPanel = ({ token, handleLogout }) => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              {/* <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold">M</span>
              </div> */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin</h1>
                <p className="text-sm text-gray-500">Manage Songs</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-medium text-gray-900">Welcome, <span style={{color:"#7c3aed"}}>{name || "Lalit"}</span> </div>
                {/* <div className="text-sm text-gray-500">
                  {songs.length} songs in library
                </div> */}
              </div>
              <button
                onClick={handleLogout}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors flex items-center space-x-2 shadow-sm"
              >
                <span>🚪</span>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab("songs")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "songs"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              🎵 All Songs
            </button>
            <button
              onClick={() => { resetForm(); setActiveTab("upload"); }}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "upload"
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              📤 Upload Song
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === "upload" ? (
          <SongForm
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            editingSong={editingSong}
            loading={loading}
            initialData={editingSong ? {
              title: editingSong.title,
              artist: editingSong.artist,
              album: editingSong.album || "",
              durationSeconds: editingSong.durationSeconds || "",
              file: null
            } : undefined}
          />
        ) : (
          <SongTable
            songs={songs}
            onEdit={startEditing}
            onDelete={handleDeleteSong}
            loading={loading}
          />
        )}
      </div>
    </div>
  );

  return (
    <>
      <ToastContainer 
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <AdminAuth onLogin={handleLogin} onLogout={handleLogout}>
        {renderAdminPanel}
      </AdminAuth>
    </>
  );
}