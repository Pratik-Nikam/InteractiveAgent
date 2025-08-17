import { useState, useRef, useEffect } from 'react';
import { useStreamingAvatarSession } from './logic/useStreamingAvatarSession';
import { useVoiceChat } from './logic/useVoiceChat';
import { Button } from './Button';
import { AvatarConfig } from './AvatarConfig';
import { AvatarVideo } from './AvatarSession/AvatarVideo';
import { LocalAvatarVideo } from './LocalAvatarVideo';
import { AvatarSelector } from './AvatarSelector';
import { LoadingIcon, MicIcon, MicOffIcon } from './Icons';
import { AVATARS, CUSTOM_AVATARS } from '@/app/lib/constants';
import { AvatarQuality, VoiceEmotion, ElevenLabsModel, STTProvider, VoiceChatTransport, StreamingEvents } from '@heygen/streaming-avatar';
import { StreamingAvatarProvider, StreamingAvatarSessionState } from './logic';
import { LipSyncService } from '@/services/lipSyncService';
import { ConfigManager } from './ConfigManager';

const DEFAULT_CONFIG = {
  quality: AvatarQuality.Low,
  avatarName: AVATARS[0].avatar_id,
  knowledgeId: undefined,
  voice: {
    rate: 1.5,
    emotion: VoiceEmotion.EXCITED,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "en",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

function LocalInteractiveAvatarInner() {
  const { 
    initAvatar, 
    startAvatar, 
    stopAvatar, 
    sessionState, 
    stream 
  } = useStreamingAvatarSession();
  
  const { startVoiceChat, stopVoiceChat, isVoiceChatActive, isVoiceChatLoading } = useVoiceChat();
  
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATARS[0].avatar_id);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Added missing isLoading state
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaStream = useRef<HTMLVideoElement>(null);
  const lipSyncService = useRef<LipSyncService>(new LipSyncService());

  const isCustomAvatar = CUSTOM_AVATARS[selectedAvatar as keyof typeof CUSTOM_AVATARS];

  const fetchAccessToken = async () => {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch access token');
      }
      
      const token = await response.text();
      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  };

  const sendMessageToTinyLLaMA = async (message: string) => {
    try {
      setIsProcessing(true);
      console.log('Sending message to TinyLLaMA:', message);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: messages,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get response: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      setMessages(data.conversationHistory);
      console.log('TinyLLaMA response:', data.response);

      // Handle lip sync for custom avatar
      if (isCustomAvatar && isCustomAvatar.lipSync) {
        setIsSpeaking(true);
        lipSyncService.current.speakWithLipSync(data.response, (intensity) => {
          // Lip sync intensity callback
          console.log('Lip sync intensity:', intensity);
        });
        
        // Stop speaking after a reasonable time
        setTimeout(() => {
          setIsSpeaking(false);
        }, data.response.length * 100); // Rough estimate
      }

      return data.response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartSession = async () => {
    try {
      setError(null);
      setIsLoading(true); // Set loading state
      console.log('Starting local avatar session...');
      
      if (isCustomAvatar) {
        // For custom avatar, just set up the session without HeyGen
        console.log('Using custom avatar:', isCustomAvatar.name);
        // Simulate a small delay for custom avatar
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // For HeyGen avatars, use the original flow
        const token = await fetchAccessToken();
        const avatar = initAvatar(token);
        
        avatar.on(StreamingEvents.STREAM_READY, (event) => {
          console.log('Avatar stream ready');
        });
        
        avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
          console.log('Avatar started talking');
        });
        
        avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
          console.log('Avatar stopped talking');
        });

        await startAvatar(config);
      }
    } catch (error) {
      console.error('Error starting session:', error);
      setError(error instanceof Error ? error.message : 'Failed to start session');
    } finally {
      setIsLoading(false); // Clear loading state
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isProcessing) return;
    
    try {
      setError(null);
      const response = await sendMessageToTinyLLaMA(inputMessage);
      setInputMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setError(error instanceof Error ? error.message : 'Failed to send message');
    }
  };

  const handleStartVoiceChat = async () => {
    try {
      setError(null);
      await startVoiceChat();
    } catch (error) {
      console.error('Error starting voice chat:', error);
      setError(error instanceof Error ? error.message : 'Failed to start voice chat');
    }
  };

  const handleStopSession = async () => {
    try {
      stopVoiceChat();
      lipSyncService.current.stop();
      await stopAvatar();
      setMessages([]);
      setIsSpeaking(false);
      setError(null);
    } catch (error) {
      console.error('Error stopping session:', error);
      setError(error instanceof Error ? error.message : 'Failed to stop session');
    }
  };

  const handleAvatarChange = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    setConfig(prev => ({ ...prev, avatarName: avatarId }));
  };

  // Handle video stream for HeyGen avatars
  useEffect(() => {
    if (stream && mediaStream.current && !isCustomAvatar) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [stream, isCustomAvatar]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col rounded-xl bg-zinc-900 overflow-hidden">
        <div className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center">
          {sessionState !== StreamingAvatarSessionState.INACTIVE || isCustomAvatar ? (
            isCustomAvatar ? (
              <LocalAvatarVideo
                avatarConfig={isCustomAvatar}
                isSpeaking={isSpeaking}
                text={messages[messages.length - 1]?.content}
              />
            ) : (
              <AvatarVideo ref={mediaStream} />
            )
          ) : (
            <AvatarSelector
              selectedAvatar={selectedAvatar}
              onAvatarChange={handleAvatarChange}
            />
          )}
        </div>
        
        <div className="flex flex-col gap-3 items-center justify-center p-4 border-t border-zinc-700 w-full">
          {(sessionState === StreamingAvatarSessionState.CONNECTED || isCustomAvatar) ? (
            <div className="flex flex-col gap-4 w-full">
              {/* Text Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white"
                  disabled={isProcessing}
                />
                <Button onClick={handleSendMessage} disabled={isProcessing}>
                  {isProcessing ? <LoadingIcon size={16} /> : 'Send'}
                </Button>
              </div>

              {/* Voice Chat Controls */}
              <div className="flex gap-2 justify-center">
                {isVoiceChatActive ? (
                  <Button onClick={stopVoiceChat} variant="destructive">
                    <MicOffIcon size={16} className="mr-2" />
                    Stop Voice Chat
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStartVoiceChat} 
                    disabled={isVoiceChatLoading || isProcessing}
                  >
                    <MicIcon size={16} className="mr-2" />
                    Start Voice Chat
                  </Button>
                )}
                <Button onClick={handleStopSession} variant="destructive">
                  Stop Session
                </Button>
              </div>

              {/* Status Indicators */}
              {isProcessing && (
                <div className="text-blue-400 flex items-center gap-2">
                  <LoadingIcon size={12} className="animate-spin" />
                  Processing message...
                </div>
              )}
              {isSpeaking && (
                <div className="text-green-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  Speaking...
                </div>
              )}
            </div>
          ) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
            <Button onClick={handleStartSession} disabled={isLoading}>
              {isLoading ? <LoadingIcon size={16} className="mr-2" /> : null}
              Start Avatar Session
            </Button>
          ) : (
            <LoadingIcon />
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-900 border border-red-600 rounded-xl p-4">
          <h3 className="text-red-200 font-semibold mb-2">Error</h3>
          <p className="text-red-100">{error}</p>
        </div>
      )}

      {/* Message History */}
      {messages.length > 0 && (
        <div className="bg-zinc-900 rounded-xl p-4 max-h-64 overflow-y-auto">
          <h3 className="text-white font-semibold mb-2">Conversation History</h3>
          <div className="space-y-2">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`p-2 rounded ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white ml-4' 
                    : 'bg-green-600 text-white mr-4'
                }`}
              >
                <strong>{msg.role === 'user' ? 'You' : 'TinyLLaMA'}:</strong> {msg.content}
              </div>
            ))}
          </div>
        </div>
      )}
      <ConfigManager />
    </div>
  );
}

export default function LocalInteractiveAvatar() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <LocalInteractiveAvatarInner />
    </StreamingAvatarProvider>
  );
}