import {
  AvatarQuality,
  StreamingEvents,
  VoiceChatTransport,
  VoiceEmotion,
  StartAvatarRequest,
  STTProvider,
  ElevenLabsModel,
} from "@heygen/streaming-avatar";
import { useEffect, useRef, useState } from "react";
import { useMemoizedFn, useUnmount } from "ahooks";

import { Button } from "./Button";
import { AvatarConfig } from "./AvatarConfig";
import { CustomAvatar } from "./CustomAvatar";
import { useCustomAvatarSession, CustomAvatarState } from "./logic/useCustomAvatarSession";
import { AvatarControls } from "./AvatarSession/AvatarControls";
import { useVoiceChat } from "./logic/useVoiceChat";
import { StreamingAvatarProvider, StreamingAvatarSessionState } from "./logic";
import { LoadingIcon } from "./Icons";
import { MessageHistory } from "./AvatarSession/MessageHistory";
import { DocumentUpload } from "./DocumentUpload";

import { AVATARS } from "@/app/lib/constants";

const DEFAULT_CONFIG: StartAvatarRequest = {
  quality: AvatarQuality.Low,
  avatarName: "Max", // Changed to Max
  knowledgeId: undefined,
  voice: {
    rate: 1.0,
    emotion: VoiceEmotion.NEUTRAL,
    model: ElevenLabsModel.eleven_flash_v2_5,
  },
  language: "en",
  voiceChatTransport: VoiceChatTransport.WEBSOCKET,
  sttSettings: {
    provider: STTProvider.DEEPGRAM,
  },
};

function InteractiveAvatar() {
  const { avatarState, isPlaying, startSession, stopSession, speak } = useCustomAvatarSession();
  const { startVoiceChat } = useVoiceChat();

  const [config, setConfig] = useState<StartAvatarRequest>(DEFAULT_CONFIG);
  const [useCustomAvatar, setUseCustomAvatar] = useState(true);

  const startSessionV2 = useMemoizedFn(async (isVoiceChat: boolean) => {
    try {
      console.log("Starting Max avatar session");
      startSession();

      if (isVoiceChat) {
        await startVoiceChat();
      }
    } catch (error) {
      console.error("Error starting Max session:", error);
    }
  });

  useUnmount(() => {
    stopSession();
  });

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex flex-col rounded-xl bg-zinc-900 overflow-hidden">
        <div className={`relative overflow-hidden flex flex-col items-center justify-center ${
          avatarState !== CustomAvatarState.INACTIVE 
            ? "w-80 h-60 mx-auto my-4 border border-zinc-700 rounded-lg" 
            : "w-full aspect-video"
        }`}>
          {avatarState !== CustomAvatarState.INACTIVE ? (
            <CustomAvatar 
              isPlaying={isPlaying}
              onVideoEnd={() => {
                setIsPlaying(false);
              }}
            />
          ) : (
            <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto p-6">
              <div className="text-center mb-4">
                <h1 className="text-2xl font-bold text-white mb-2">Max</h1>
                <p className="text-zinc-400">AI Wealth Management Assistant</p>
              </div>
              <div className="flex items-center gap-4 mb-4">
                <label className="text-white text-sm">Use Custom Avatar:</label>
                <input
                  type="checkbox"
                  checked={useCustomAvatar}
                  onChange={(e) => setUseCustomAvatar(e.target.checked)}
                  className="w-4 h-4"
                />
              </div>
              <AvatarConfig config={config} onConfigChange={setConfig} />
              <DocumentUpload />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 items-center justify-center p-4 border-t border-zinc-700 w-full">
          {avatarState === CustomAvatarState.CONNECTED || avatarState === CustomAvatarState.SPEAKING ? (
            <AvatarControls />
          ) : avatarState === CustomAvatarState.INACTIVE ? (
            <div className="flex flex-row gap-4">
              <Button onClick={() => startSessionV2(true)}>
                Start Voice Chat with Max
              </Button>
              <Button onClick={() => startSessionV2(false)}>
                Start Text Chat with Max
              </Button>
            </div>
          ) : (
            <LoadingIcon />
          )}
        </div>
      </div>
      {(avatarState === CustomAvatarState.CONNECTED || avatarState === CustomAvatarState.SPEAKING) && (
        <MessageHistory />
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