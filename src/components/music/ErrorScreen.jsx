// components/ErrorScreen.jsx
import React from 'react';
import './MusicPlayer.css';

const ErrorScreen = ({ error }) => {
  return (
    <div className="error-container">
      <div className="error-message">{error}</div>
      <button 
        className="retry-btn"
        onClick={() => window.location.reload()}
      >
        Try Again
      </button>
    </div>
  );
};

export default ErrorScreen;