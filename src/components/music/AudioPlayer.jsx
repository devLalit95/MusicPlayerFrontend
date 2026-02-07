// components/AudioPlayer.jsx
import React from 'react';

const AudioPlayer = ({ audioRef, currentSong, onTimeUpdate, onEnded }) => {
  return (
    <audio
      ref={audioRef}
      src={currentSong?.fileUrl}
      onTimeUpdate={onTimeUpdate}
      onEnded={onEnded}
      onError={(e) => {
        console.error('Audio error:', e);
      }}
      onLoadedMetadata={() => {
        // Reset time when new song loads
        const event = new Event('timeupdate');
        audioRef.current?.dispatchEvent(event);
      }}
    />
  );
};

export default AudioPlayer;