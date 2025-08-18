import { NextRequest, NextResponse } from 'next/server';
import { getLLMConfig } from '@/config/llm-config';
import { knowledgeBaseService } from '@/services/knowledgeBaseService';

// Function to clean and truncate response for avatar speech
function cleanResponse(text: string): string {
  let cleaned = text.trim();
  
  // Remove any continuation patterns
  const stopPatterns = ['\n\n', 'User:', 'Assistant:', 'Human:', 'AI:', '\nUser', '\nAssistant'];
  for (const pattern of stopPatterns) {
    const index = cleaned.indexOf(pattern);
    if (index > 0) {
      cleaned = cleaned.substring(0, index).trim();
    }
  }
  
  // Limit to appropriate length for avatar speech (wealth management responses can be longer)
  if (cleaned.length > 150) {
    cleaned = cleaned.substring(0, 150).trim();
    // Try to end at a sentence
    const lastPeriod = cleaned.lastIndexOf('.');
    const lastExclamation = cleaned.lastIndexOf('!');
    const lastQuestion = cleaned.lastIndexOf('?');
    const lastEnd = Math.max(lastPeriod, lastExclamation, lastQuestion);
    
    if (lastEnd > 80) {
      cleaned = cleaned.substring(0, lastEnd + 1);
    }
  }
  
  return cleaned;
}

// Add this function to add a marker
function addResponseMarker(text: string, model: string): string {
  return `[${model}] ${text}`;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const { message, conversationHistory = [] } = await request.json();
    const config = getLLMConfig();

    console.log('Received message:', message);
    console.log('Using model:', config.ollama.model);

    // Generate prompt using knowledge base
    const fullPrompt = await knowledgeBaseService.generatePrompt(message, conversationHistory);
    console.log('Generated prompt with knowledge base:', fullPrompt);

    // Call Ollama API with configuration
    const response = await fetch(`${config.ollama.baseUrl}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: config.ollama.model,
        prompt: fullPrompt,
        stream: false,
        options: {
          temperature: config.ollama.temperature,
          top_p: config.ollama.topP,
          max_tokens: config.ollama.maxTokens,
          num_predict: config.ollama.maxTokens,
          stop: config.ollama.stopSequences,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama API error: ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Raw LLM response:', data.response);
    
    // Clean and process the response
    const cleanResponseText = cleanResponse(data.response);
    console.log('Cleaned response:', cleanResponseText);
    
    // Add marker to show it's from local LLM
    const markedResponse = addResponseMarker(cleanResponseText, config.ollama.model);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log(`Response time: ${responseTime}ms`);
    
    return NextResponse.json({
      response: markedResponse,
      model: config.ollama.model,
      responseTime: responseTime,
      conversationHistory: [
        ...conversationHistory,
        { role: 'user', content: message },
        { role: 'assistant', content: markedResponse }
      ]
    });

  } catch (error) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Failed to get response from LLM', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}