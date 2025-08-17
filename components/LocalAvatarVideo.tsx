import React, { useRef, useEffect, useState } from 'react';

interface LocalAvatarVideoProps {
  avatarConfig: {
    image: string;
    video?: string;
    lipSync: boolean;
  };
  isSpeaking: boolean;
  text?: string;
}

export const LocalAvatarVideo: React.FC<LocalAvatarVideoProps> = ({
  avatarConfig,
  isSpeaking,
  text
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentImage, setCurrentImage] = useState(avatarConfig.image);
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);

  // Lip sync animation
  useEffect(() => {
    if (!avatarConfig.lipSync || !text) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const img = new Image();
    img.src = avatarConfig.image;
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Simple lip sync animation
      const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        if (isSpeaking) {
          // Add lip sync effect (simple mouth movement)
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.fillRect(canvas.width * 0.4, canvas.height * 0.6, canvas.width * 0.2, canvas.height * 0.1);
        }
        
        if (isSpeaking) {
          requestAnimationFrame(animate);
        }
      };
      
      animate();
    };
  }, [isSpeaking, text, avatarConfig]);

  // Video playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !avatarConfig.video) return;

    if (isSpeaking) {
      video.currentTime = 0;
      video.play().catch(console.error);
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isSpeaking, avatarConfig.video]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      {avatarConfig.video && isVideoLoaded ? (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          muted
          loop
          playsInline
        >
          <source src={avatarConfig.video} type="video/mp4" />
        </video>
      ) : (
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain"
        />
      )}
      
      {/* Fallback image */}
      {!avatarConfig.video && (
        <img
          src={currentImage}
          alt="Avatar"
          className="w-full h-full object-contain"
        />
      )}
    </div>
  );
};