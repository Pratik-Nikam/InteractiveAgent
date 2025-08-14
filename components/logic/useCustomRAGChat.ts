import { TaskType, TaskMode } from "@heygen/streaming-avatar";
import { useCallback } from "react";
import { useStreamingAvatarContext } from "./context";

export const useCustomRAGChat = () => {
  const { avatarRef } = useStreamingAvatarContext();

  const sendRAGMessage = useCallback(async (question: string) => {
    if (!avatarRef.current) {
      console.error('Avatar not initialized');
      return;
    }

    try {
      console.log('📝 TEXT RAG: Sending question:', question);
      
      // Call RAG API
      const response = await fetch('/api/rag-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question }),
      });
      
      if (!response.ok) {
        throw new Error(`RAG API error: ${response.status}`);
      }
      
      const { answer, source, confidence } = await response.json();
      
      // Log source information
      console.log('📝 TEXT RAG: Answer source:', source);
      console.log('📝 TEXT RAG: Confidence:', confidence + '%');
      console.log('📝 TEXT RAG: RAG answer:', answer);
      
      // Add source indicator to the answer
      const sourceIndicator = source !== 'fallback' && source !== 'no_match' && source !== 'error' 
        ? ` [Source: ${source}, Confidence: ${confidence}%]`
        : '';
      
      const finalAnswer = answer + sourceIndicator;
      
      // Make avatar speak the RAG response
      avatarRef.current.speak({
        text: finalAnswer,
        taskType: TaskType.TALK,
        taskMode: TaskMode.ASYNC,
      });
    } catch (error) {
      console.error(' TEXT RAG: Error in RAG chat:', error);
      
      // Fallback response
      avatarRef.current.speak({
        text: "I'm sorry, I encountered an error while processing your question. Please try again.",
        taskType: TaskType.TALK,
        taskMode: TaskMode.ASYNC,
      });
    }
  }, [avatarRef]);

  return { sendRAGMessage };
};