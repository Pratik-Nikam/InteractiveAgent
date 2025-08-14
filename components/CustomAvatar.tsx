import React, { useRef, useEffect, useState } from 'react';

interface CustomAvatarProps {
  isPlaying: boolean;
  onVideoEnd?: () => void;
}

export const CustomAvatar: React.FC<CustomAvatarProps> = ({ isPlaying, onVideoEnd }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  const handleVideoEnd = () => {
    if (onVideoEnd) {
      onVideoEnd();
    }
  };

  return (
    <div className="relative w-full h-full">
      <video
        ref={videoRef}
        className="w-full h-full object-cover rounded-lg"
        muted
        playsInline
        onLoadedData={() => setIsLoaded(true)}
        onEnded={handleVideoEnd}
      >
        <source src="/max-avatar.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-800 rounded-lg">
          <div className="text-center">
            <div className="text-white text-lg font-semibold mb-2">Max</div>
            <div className="text-zinc-400">Loading...</div>
          </div>
        </div>
      )}
      
      {isPlaying && (
        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
          Max is speaking...
        </div>
      )}
    </div>
  );
};