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
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { useVoiceChat } from "./logic/useVoiceChat";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { LoadingIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";
import { TextInput } from "./AvatarSession/TextInput";
import { AudioInput } from "./AvatarSession/AudioInput";
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

  const [config, setConfig] = useState<StartAvatarRequest>(DEFAULT_CONFIG);
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [isVoiceChatMode, setIsVoiceChatMode] = useState(false);
  
  // Use ref instead of state for avatar instance to avoid timing issues
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

  const sendMessageToLLM = async (message: string) => {
    try {
      setIsProcessing(true);
      console.log('Sending message to LLM:', message);
      
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
      console.log('LLM response:', data.response);

      return data.response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // FIXED: Use the correct HeyGen API method
  const sendTextToAvatar = async (text: string) => {
    if (!avatarInstanceRef.current) {
      console.error('Avatar instance not available');
      return;
    }

    try {
      console.log('Sending text to avatar for speech:', text);
      
      // Use the correct HeyGen speak method
      await avatarInstanceRef.current.speak({
        text: text,
        taskType: TaskType.TALK,
        taskMode: TaskMode.SYNC,
      });
      console.log('Text sent to avatar successfully');
      
    } catch (error) {
      console.error('Error sending text to avatar:', error);
    }
  };

  const sendGreeting = async () => {
    try {
      console.log('Sending greeting...');
      const greeting = knowledgeBaseService.getGreeting();
      console.log('Greeting message:', greeting);
      
      // Add greeting to messages immediately
      setMessages(prev => [...prev, { role: 'assistant', content: greeting }]);
      
      // Send greeting to LLM to get a response
      const response = await sendMessageToLLM(greeting);
      console.log('Greeting response from LLM:', response);
      
      // Send the response to avatar for speech
      await sendTextToAvatar(response);
      
    } catch (error) {
      console.error('Error sending greeting:', error);
    }
  };

  const startSessionV2 = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      setIsVoiceChatMode(isVoiceChat);
      setHasGreeted(false);
      
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);
      avatarInstanceRef.current = avatar; // Store avatar instance in ref

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
        console.log(">>>>> Stream ready:", event.detail);
        // Send greeting immediately when stream is ready
        if (isVoiceChat && !hasGreeted) {
          setTimeout(() => {
            sendGreeting();
            setHasGreeted(true);
          }, 2000); // Increased delay to ensure avatar is fully ready
        }
      });
      avatar.on(StreamingEvents.USER_START, (event) => {
        console.log(">>>>> User started talking:", event);
      });
      avatar.on(StreamingEvents.USER_STOP, (event) => {
        console.log(">>>>> User stopped talking:", event);
      });
      avatar.on(StreamingEvents.USER_END_MESSAGE, (event) => {
        console.log(">>>>> User end message:", event);
      });
      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
        console.log(">>>>> User talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event) => {
        console.log(">>>>> Avatar talking message:", event);
      });
      avatar.on(StreamingEvents.AVATAR_END_MESSAGE, (event) => {
        console.log(">>>>> Avatar end message:", event);
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
      // Add user message to UI
      setMessages(prev => [...prev, { role: 'user', content: message }]);
      
      // Send to LLM and get response
      const response = await sendMessageToLLM(message);
      
      // Add LLM response to UI
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
      
      // Send the response to avatar for speech synthesis
      await sendTextToAvatar(response);
      
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleStopSession = () => {
    stopAvatar();
    setMessages([]);
    setHasGreeted(false);
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
              {isVoiceChatMode && !hasGreeted && (
                <div className="text-yellow-400 flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  Preparing greeting...
                </div>
              )}
            </div>
          ) : sessionState === StreamingAvatarSessionState.INACTIVE ? (
            <div className="flex flex-row gap-4">
              <Button onClick={() => startSessionV2(true)}>
                Start Voice Chat
              </Button>
              <Button onClick={() => startSessionV2(false)}>
                Start Text Chat
              </Button>
            </div>
          ) : (
            <LoadingIcon />
          )}
        </div>
      </div>

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
                <strong>{msg.role === 'user' ? 'You' : 'Max (Wealth Manager)'}:</strong> {msg.content}
              </div>
            ))}
          </div>
        </div>
      )}
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
