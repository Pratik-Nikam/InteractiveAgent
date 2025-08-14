import { useCallback, useState } from "react";
import { useCustomAvatarSession } from "./useCustomAvatarSession";

export const useVoiceChat = () => {
  const [isVoiceChatLoading, setIsVoiceChatLoading] = useState(false);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const { speak } = useCustomAvatarSession();

  const startVoiceChat = useCallback(async () => {
    setIsVoiceChatLoading(true);
    try {
      // Initialize voice chat (you can add actual voice recognition here)
      setIsVoiceChatActive(true);
      console.log("Voice chat started with Max");
    } catch (error) {
      console.error("Error starting voice chat:", error);
    } finally {
      setIsVoiceChatLoading(false);
    }
  }, []);

  const stopVoiceChat = useCallback(() => {
    setIsVoiceChatActive(false);
    console.log("Voice chat stopped");
  }, []);

  return {
    isVoiceChatLoading,
    isVoiceChatActive,
    startVoiceChat,
    stopVoiceChat,
  };
};
