import { TaskType, TaskMode } from "@heygen/streaming-avatar";
import React, { useCallback, useEffect, useState } from "react";

import { Select } from "../Select";
import { Button } from "../Button";
import { SendIcon } from "../Icons";
import { Input } from "../Input";
import { useStreamingAvatarContext } from "../logic/context";

export const TextInput: React.FC = () => {
  const { avatarRef, handleStreamingTalkingMessage } = useStreamingAvatarContext();
  const [taskType, setTaskType] = useState<TaskType>(TaskType.TALK);
  const [taskMode, setTaskMode] = useState<TaskMode>(TaskMode.ASYNC);
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Function to send message to local LLM
  const sendMessageToLocalLLM = async (message: string) => {
    try {
      setIsProcessing(true);
      console.log(' Sending message to local LLM:', message);
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: [],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get response: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Local LLM response:', data.response);

      // Add local LLM response to message history as AVATAR message
      handleStreamingTalkingMessage({
        detail: {
          message: data.response,
          isComplete: true,
          type: 'avatar_talking_message',
          task_id: 'local_llm_response'
        }
      });

      // Make avatar speak the response
      if (avatarRef.current) {
        console.log('🗣️ Making avatar speak local LLM response');
        await avatarRef.current.speak({
          text: data.response,
          taskType: TaskType.TALK,
          taskMode: TaskMode.SYNC,
        });
      }

      return data.response;
    } catch (error) {
      console.error('❌ Error sending message to local LLM:', error);
      
      // Fallback: make avatar speak error message
      if (avatarRef.current) {
        await avatarRef.current.speak({
          text: "Sorry, I'm having trouble processing your request. Please try again.",
          taskType: TaskType.TALK,
          taskMode: TaskMode.SYNC,
        });
      }
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSend = useCallback(async () => {
    if (message.trim() === "" || isProcessing) {
      return;
    }

    const currentMessage = message;
    setMessage(""); // Clear input immediately

    try {
      if (taskType === TaskType.TALK) {
        // Send to local LLM instead of HeyGen
        await sendMessageToLocalLLM(currentMessage);
      } else {
        // For repeat mode, still use HeyGen directly
        if (avatarRef.current) {
          await avatarRef.current.speak({
            text: currentMessage,
            taskType: TaskType.REPEAT,
            taskMode: taskMode === TaskMode.SYNC ? TaskMode.SYNC : TaskMode.ASYNC,
          });
        }
      }
    } catch (error) {
      console.error('Error in handleSend:', error);
    }
  }, [
    message,
    isProcessing,
    taskType,
    taskMode,
    avatarRef,
    handleStreamingTalkingMessage,
  ]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter" && !isProcessing) {
        handleSend();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleSend, isProcessing]);

  return (
    <div className="flex flex-row gap-2 items-end w-full">
      <Select
        isSelected={(option) => option === taskType}
        options={Object.values(TaskType)}
        renderOption={(option) => option.toUpperCase()}
        value={taskType.toUpperCase()}
        onSelect={setTaskType}
      />
      <Select
        isSelected={(option) => option === taskMode}
        options={Object.values(TaskMode)}
        renderOption={(option) => option.toUpperCase()}
        value={taskMode.toUpperCase()}
        onSelect={setTaskMode}
      />
      <Input
        className="min-w-[500px]"
        placeholder={isProcessing ? "Processing..." : `Type something for the avatar to ${taskType === TaskType.REPEAT ? "repeat" : "respond"}...`}
        value={message}
        onChange={setMessage}
        disabled={isProcessing}
      />
      <Button 
        className="!p-2" 
        onClick={handleSend}
        disabled={isProcessing || !message.trim()}
      >
        {isProcessing ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          <SendIcon size={20} />
        )}
      </Button>
    </div>
  );
};
