import { useState, useCallback, useRef } from 'react';
import { LocalAvatarService } from '@/services/localAvatarService';
import { StartAvatarRequest } from '@heygen/streaming-avatar';

export const useLocalAvatarSession = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceChatActive, setIsVoiceChatActive] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSTTListening, setIsSTTListening] = useState(false);
  const [isTTSSpeaking, setIsTTSSpeaking] = useState(false);
  const avatarServiceRef = useRef<LocalAvatarService | null>(null);

  const initAvatar = useCallback(async (token: string) => {
    try {
      console.log('Initializing local avatar service...');
      avatarServiceRef.current = new LocalAvatarService(token);
      return avatarServiceRef.current;
    } catch (error) {
      console.error('Error initializing avatar:', error);
      throw error;
    }
  }, []);

  const startAvatar = useCallback(async (config: StartAvatarRequest) => {
    if (!avatarServiceRef.current) {
      throw new Error('Avatar not initialized');
    }

    setIsLoading(true);
    try {
      console.log('Starting avatar with config:', config);
      await avatarServiceRef.current.startAvatar(config);
      setIsConnected(true);
      console.log('Avatar started successfully');
    } catch (error) {
      console.error('Error starting avatar:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendTextMessage = useCallback(async (message: string) => {
    if (!avatarServiceRef.current || !isConnected) {
      throw new Error('Avatar not connected');
    }

    if (isProcessing) {
      console.log('Already processing a message, please wait...');
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Sending text message:', message);
      const response = await avatarServiceRef.current.sendTextMessage(message);
      
      setMessages(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: response }
      ]);

      return response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, isProcessing]);

  const startVoiceChat = useCallback(() => {
    if (!avatarServiceRef.current || !isConnected) {
      throw new Error('Avatar not connected');
    }

    if (!avatarServiceRef.current.isSTTSupported()) {
      throw new Error('Speech recognition not supported');
    }

    console.log('Starting voice chat...');
    setIsVoiceChatActive(true);
    setIsSTTListening(true);
    
    avatarServiceRef.current.startVoiceChat(async (userText) => {
      console.log('Voice input received:', userText);
      
      // Add user message to UI
      setMessages(prev => [...prev, { role: 'user', content: userText }]);
      
      // Process with TinyLLaMA
      try {
        const response = await avatarServiceRef.current!.sendTextMessage(userText);
        setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      } catch (error) {
        console.error('Error processing voice message:', error);
      }
    });
  }, [isConnected]);

  const stopVoiceChat = useCallback(() => {
    if (avatarServiceRef.current) {
      avatarServiceRef.current.stopVoiceChat();
    }
    setIsVoiceChatActive(false);
    setIsSTTListening(false);
    console.log('Voice chat stopped');
  }, []);

  const stopAvatar = useCallback(async () => {
    if (avatarServiceRef.current) {
      await avatarServiceRef.current.stopAvatar();
      avatarServiceRef.current = null;
    }
    setIsConnected(false);
    setIsVoiceChatActive(false);
    setIsSTTListening(false);
    setIsTTSSpeaking(false);
    setMessages([]);
    console.log('Avatar session stopped');
  }, []);

  // Update states based on service states
  const updateStates = useCallback(() => {
    if (avatarServiceRef.current) {
      setIsProcessing(avatarServiceRef.current.getProcessingState());
      setIsSTTListening(avatarServiceRef.current.getSTTListeningState());
      setIsTTSSpeaking(avatarServiceRef.current.getTTSSpeakingState());
    }
  }, []);

  return {
    isConnected,
    isLoading,
    isVoiceChatActive,
    isProcessing,
    isSTTListening,
    isTTSSpeaking,
    messages,
    initAvatar,
    startAvatar,
    sendTextMessage,
    startVoiceChat,
    stopVoiceChat,
    stopAvatar,
    updateStates,
    isSTTSupported: avatarServiceRef.current?.isSTTSupported() || false,
    isTTSSupported: avatarServiceRef.current?.isTTSSupported() || false,
  };
};