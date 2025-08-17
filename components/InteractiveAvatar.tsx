import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
  TaskType,
  TaskMode,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { Button } from "./Button";
import { AvatarConfig } from "./AvatarConfig";
import { AvatarVideo } from "./AvatarSession/AvatarVideo";
import { useStreamingAvatarSession } from "./logic/useStreamingAvatarSession";
import { useVoiceChat } from "./logic/useVoiceChat";
import { StreamingAvatarProvider, StreamingAvatarSessionState, MessageSender } from "./logic";
import { useStreamingAvatarContext } from "./logic/context";
import { LoadingIcon } from "./Icons";
import { AudioInput } from "./AvatarSession/AudioInput";
import { MessageHistory } from "./AvatarSession/MessageHistory";
import { knowledgeBaseService } from "@/services/knowledgeBaseService";

import { AVATARS } from "@/app/lib/constants";

const DEFAULT_CONFIG: StartAvatarRequest = {
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

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const { messages, handleStreamingTalkingMessage } = useStreamingAvatarContext();

  const [config, setConfig] = useState<StartAvatarRequest>(DEFAULT_CONFIG);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVoiceChatMode, setIsVoiceChatMode] = useState(false);
  
  const avatarInstanceRef = useRef<any>(null);
  const mediaStream = useRef<HTMLVideoElement>(null);

  async function fetchAccessToken() {
    try {
      const response = await fetch("/api/get-access-token", {
        method: "POST",
      });
      const token = await response.text();
      console.log("Access Token:", token);
      return token;
    } catch (error) {
      console.error("Error fetching access token:", error);
      throw error;
    }
  }

  // Convert HeyGen message format to knowledge base format
  const convertMessagesToKnowledgeBaseFormat = () => {
    return messages.map(msg => ({
      role: msg.sender === MessageSender.CLIENT ? 'user' : 'assistant',
      content: msg.content
    }));
  };

  const sendMessageToLLM = async (message: string) => {
    try {
      setIsProcessing(true);
      console.log('Sending message to LLM:', message);
      
      // Convert current messages to knowledge base format
      const conversationHistory = convertMessagesToKnowledgeBaseFormat();
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get response: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('LLM response:', data.response);

      return data.response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to make avatar speak
  const makeAvatarSpeak = async (text: string) => {
    if (!avatarInstanceRef.current) {
      console.error('Avatar instance not available');
      return;
    }

    try {
      console.log('Making avatar speak:', text);
      
      await avatarInstanceRef.current.speak({
        text: text,
        taskType: TaskType.TALK,
        taskMode: TaskMode.SYNC,
      });
      console.log('Avatar spoke successfully');
      
    } catch (error) {
      console.error('Error making avatar speak:', error);
    }
  };

  // Use knowledge base for greeting - FIXED: Don't send to LLM
  const sendGreeting = async () => {
    try {
      console.log('Sending greeting from knowledge base...');
      const greeting = knowledgeBaseService.getGreeting();
      console.log('Greeting from knowledge base:', greeting);
      
      // Add greeting to message history as avatar message
      handleStreamingTalkingMessage({
        detail: {
          message: greeting,
          isComplete: true
        }
      });
      
      // Make avatar speak the greeting from knowledge base
      await makeAvatarSpeak(greeting);
      
    } catch (error) {
      console.error('Error sending greeting:', error);
    }
  };

  const startSession = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      console.log('Starting session...');
      setIsVoiceChatMode(isVoiceChat);
      
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);
      avatarInstanceRef.current = avatar;

      // Set up event listeners
      avatar.on(StreamingEvents.AVATAR_START_TALKING, (e) => {
        console.log("Avatar started talking", e);
      });
      avatar.on(StreamingEvents.AVATAR_STOP_TALKING, (e) => {
        console.log("Avatar stopped talking", e);
      });
      avatar.on(StreamingEvents.STREAM_DISCONNECTED, () => {
        console.log("Stream disconnected");
      });
      avatar.on(StreamingEvents.STREAM_READY, (event) => {
        console.log("Stream ready:", event.detail);
        
        // Send greeting immediately when stream is ready
        if (isVoiceChat) {
          console.log('Sending immediate greeting from knowledge base...');
          sendGreeting();
        }
      });

      await startAvatar(config);

      if (isVoiceChat) {
        await startVoiceChat();
      }
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });

  useUnmount(() => {
    stopAvatar();
    avatarInstanceRef.current = null;
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, stream]);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isProcessing) return;
    
    try {
      // Send to LLM and get response
      const response = await sendMessageToLLM(message);
      
      // Make avatar speak the response
      await makeAvatarSpeak(response);
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStopSession = () => {
    stopAvatar();
    setIsVoiceChatMode(false);
    avatarInstanceRef.current = null;
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col rounded-xl bg-zinc-900 overflow-hidden">
        <div className="relative w-full aspect-video overflow-hidden flex flex-col items-center justify-center">
          {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
            <AvatarVideo ref={mediaStream} />
          ) : (
            <AvatarConfig config={config} onConfigChange={setConfig} />
          )}
        </div>
        <div className="flex flex-col gap-3 items-center justify-center p-4 border-t border-zinc-700 w-full">
          {sessionState === StreamingAvatarSessionState.CONNECTED ? (
            <div className="flex flex-col gap-4 w-full">
              {/* Text Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-600 rounded-md text-white"
                  disabled={isProcessing}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                      handleSendMessage(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                />
                <Button onClick={() => {
                  const input = document.querySelector('input[placeholder="Type your message..."]') as HTMLInputElement;
                  if (input && input.value.trim()) {
                    handleSendMessage(input.value);
                    input.value = '';
                  }
                }} disabled={isProcessing}>
                  {isProcessing ? <LoadingIcon size={16} /> : 'Send'}
                </Button>
              </div>

              {/* Voice Chat Controls */}
              <div className="flex gap-2 justify-center">
                <AudioInput />
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
            </div>
          ) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
            <div className="flex flex-row gap-4">
              <Button onClick={() => startSession(true)}>
                Start Voice Chat
              </Button>
              <Button onClick={() => startSession(false)}>
                Start Text Chat
              </Button>
            </div>
          ) : (
            <LoadingIcon />
          )}
        </div>
      </div>

      {/* Original Message History Component */}
      <MessageHistory />
    </div>
  );
}

export default function InteractiveAvatarWrapper() {
  return (
    <StreamingAvatarProvider basePath={process.env.NEXT_PUBLIC_BASE_API_URL}>
      <InteractiveAvatar />
    </StreamingAvatarProvider>
  );
}
