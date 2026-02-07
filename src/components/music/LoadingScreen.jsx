// components/LoadingScreen.jsx
import React from 'react';
import './MusicPlayer.css';

const LoadingScreen = () => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Loading your music...</p>
    </div>
  );
};

export default LoadingScreen;