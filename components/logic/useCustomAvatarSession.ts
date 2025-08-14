import { useCallback, useRef, useState } from "react";
import { useStreamingAvatarContext } from "./context";

export enum CustomAvatarState {
  INACTIVE = "inactive",
  CONNECTED = "connected",
  SPEAKING = "speaking",
}

export const useCustomAvatarSession = () => {
  const { handleUserTalkingMessage, handleStreamingTalkingMessage, handleEndMessage } = useStreamingAvatarContext();
  const [avatarState, setAvatarState] = useState<CustomAvatarState>(CustomAvatarState.INACTIVE);
  const [isPlaying, setIsPlaying] = useState(false);
  const speakTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startSession = useCallback(() => {
    setAvatarState(CustomAvatarState.CONNECTED);
    console.log("Max avatar session started");
  }, []);

  const stopSession = useCallback(() => {
    setAvatarState(CustomAvatarState.INACTIVE);
    setIsPlaying(false);
    if (speakTimeoutRef.current) {
      clearTimeout(speakTimeoutRef.current);
    }
    console.log("Max avatar session stopped");
  }, []);

  const speak = useCallback((text: string) => {
    console.log("Max speaking:", text);
    setIsPlaying(true);
    setAvatarState(CustomAvatarState.SPEAKING);

    // Simulate speaking duration (you can adjust this)
    const speakDuration = Math.max(2000, text.length * 100); // Minimum 2 seconds

    speakTimeoutRef.current = setTimeout(() => {
      setIsPlaying(false);
      setAvatarState(CustomAvatarState.CONNECTED);
      console.log("Max finished speaking");
    }, speakDuration);
  }, []);

  return {
    avatarState,
    isPlaying,
    startSession,
    stopSession,
    speak,
  };
};