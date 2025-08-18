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
import { StreamingAvatarSessionState, StreamingAvatarProvider, useStreamingAvatarContext } from "./logic";
import { LoadingIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";
import { knowledgeBaseService } from "@/services/knowledgeBaseService";

import { AVATARS } from "@/app/lib/constants";

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.Low,
  avatarName: "Graham_ProfessionalLook2_public",
  // Remove knowledgeId completely to disable HeyGen's knowledge base
  // knowledgeId: "430fa95b3e874f0eb25e839c8499a9e0",
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
  // Add this to disable automatic responses
  // disableAutoResponse: true, // This might not exist
};

function InteractiveAvatar() {
  const { initAvatar, startAvatar, stopAvatar, sessionState, stream } =
    useStreamingAvatarSession();
  const { startVoiceChat } = useVoiceChat();
  const { avatarRef, handleStreamingTalkingMessage } = useStreamingAvatarContext();

  const [config, setConfig] = useState<StartAvatarRequest>(DEFAULT_CONFIG);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponseSource, setLastResponseSource] = useState<string>('');
  const [responseInfo, setResponseInfo] = useState<{
    source: string;
    model: string;
    time: number;
  } | null>(null);

  // Add this state to track if we're using local LLM
  const [isLocalLLMProcessing, setIsLocalLLMProcessing] = useState(false);

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

  // Function to send message to local LLM
  const sendMessageToLocalLLM = async (message: string) => {
    try {
      setIsProcessing(true);
      console.log('Sending message to local LLM:', message);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: [], // You can add conversation history here if needed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get response: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('Local LLM response:', data.response);
      
      // Set response info
      setResponseInfo({
        source: 'Local LLM',
        model: data.model || 'unknown',
        time: data.responseTime || 0
      });

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
    if (!avatarRef.current) {
      console.error('Avatar instance not available');
      return;
    }

    try {
      console.log('Making avatar speak:', text);
      
      await avatarRef.current.speak({
        text: text,
        taskType: TaskType.TALK,
        taskMode: TaskMode.SYNC,
      });
      console.log('Avatar spoke successfully');
      
    } catch (error) {
      console.error('Error making avatar speak:', error);
    }
  };

  // Fix the sendGreeting function
  const sendGreeting = async () => {
    try {
      console.log('Sending greeting from local knowledge base...');
      const greeting = knowledgeBaseService.getGreeting();
      console.log('Greeting from knowledge base:', greeting);
      
      // Add greeting to message history - Fix the type issue
      handleStreamingTalkingMessage({
        detail: {
          message: greeting,
          isComplete: true,
          type: StreamingEvents.AVATAR_TALKING_MESSAGE, // Fix: Use proper enum
          task_id: 'greeting'
        }
      });
      
      // Make avatar speak the greeting
      await makeAvatarSpeak(greeting);
      
    } catch (error) {
      console.error('Error sending greeting:', error);
    }
  };

  const startSessionV2 = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      const newToken = await fetchAccessToken();
      const avatar = initAvatar(newToken);

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
      });
      // Add this to prevent HeyGen from processing voice input
      avatar.on(StreamingEvents.USER_START, (event) => {
        console.log(">>>>> User started talking:", event);
        // We could potentially mute HeyGen's processing here
      });
      avatar.on(StreamingEvents.USER_STOP, (event) => {
        console.log(">>>>> User stopped talking:", event);
        // We could potentially prevent HeyGen from processing here
      });
      // Add this to prevent HeyGen from processing text input
      avatar.on(StreamingEvents.USER_END_MESSAGE, async (event) => {
        console.log(">>>>> User end message:", event);
        
        // Intercept voice input and send to local LLM
        if (event.detail && event.detail.message) {
          console.log('🎤 Voice input detected:', event.detail.message);
          
          // Set flag to prevent HeyGen from responding
          setIsLocalLLMProcessing(true);
          
          try {
            // Send to local LLM
            const response = await sendMessageToLocalLLM(event.detail.message);
            console.log('✅ Voice processed by local LLM:', response);
            
            // Add local LLM response to message history as AVATAR message
            handleStreamingTalkingMessage({
              detail: {
                message: response,
                isComplete: true,
                type: StreamingEvents.AVATAR_TALKING_MESSAGE,
                task_id: 'local_llm_voice_response'
              }
            });
            
            // Make avatar speak the local LLM response
            if (avatarRef.current) {
              console.log('🗣️ Making avatar speak local LLM response');
              await avatarRef.current.speak({
                text: response,
                taskType: TaskType.TALK,
                taskMode: TaskMode.SYNC,
              });
            }
          } catch (error) {
            console.error('❌ Error processing voice input:', error);
            
            // Fallback: make avatar speak error message
            if (avatarRef.current) {
              await avatarRef.current.speak({
                text: "Sorry, I'm having trouble processing your request. Please try again.",
                taskType: TaskType.TALK,
                taskMode: TaskMode.SYNC,
              });
            }
          } finally {
            setIsLocalLLMProcessing(false);
          }
        }
      });
      avatar.on(StreamingEvents.USER_TALKING_MESSAGE, (event) => {
        console.log(">>>>> User talking message:", event);
      });
      // Prevent HeyGen's automatic responses when we're using local LLM
      avatar.on(StreamingEvents.AVATAR_TALKING_MESSAGE, (event) => {
        console.log(">>>>> Avatar talking message:", event);
        
        // If we're processing with local LLM, don't let HeyGen respond
        if (isLocalLLMProcessing) {
          console.log('🚫 Blocking HeyGen automatic response - using local LLM');
          // We could potentially cancel the event here if needed
        }
      });
      avatar.on(StreamingEvents.AVATAR_END_MESSAGE, (event) => {
        console.log(">>>>> Avatar end message:", event);
      });

      await startAvatar(config);

      if (isVoiceChat) {
        await startVoiceChat();
        
        // Send greeting from local knowledge base after session is established
        setTimeout(async () => {
          await sendGreeting();
        }, 3000); // 3 second delay to ensure session is ready
      }
    } catch (error) {
      console.error("Error starting avatar session:", error);
    }
  });

  useUnmount(() => {
    stopAvatar();
  });

  useEffect(() => {
    if (stream && mediaStream.current) {
      mediaStream.current.srcObject = stream;
      mediaStream.current.onloadedmetadata = () => {
        mediaStream.current!.play();
      };
    }
  }, [mediaStream, stream]);

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col rounded-xl bg-zinc-900 overflow-hidden">
        <div className="relative overflow-visible flex flex-col items-center justify-center w-full max-w-md mx-auto my-4 border border-zinc-700 rounded-lg">
          {sessionState !== StreamingAvatarSessionState.INACTIVE ? (
            // keep video in a consistent portrait/iPhone-like box
            <div className="w-full h-[70vh] max-h-[80vh] sm:h-[60vh] sm:max-h-[70vh]">
              <AvatarVideo ref={mediaStream} />
            </div>
          ) : (
            // config panel scrolls inside the same sized container so fields are not cut
            <div className="flex flex-col gap-6 w-full max-h-[70vh] overflow-auto p-6">
              <AvatarConfig config={config} onConfigChange={setConfig} />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 items-center justify-center p-4 border-t border-zinc-700 w-full">
          {sessionState === StreamingAvatarSessionState.CONNECTED ? (
            <AvatarControls />
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
      {sessionState === StreamingAvatarSessionState.CONNECTED && (
        <MessageHistory />
      )}
      {responseInfo && (
        <div className="text-xs text-green-400 mt-2 p-2 bg-green-900 rounded">
          <div>✅ Response from: {responseInfo.source}</div>
          <div>🤖 Model: {responseInfo.model}</div>
          <div>⏱️ Time: {responseInfo.time}ms</div>
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
