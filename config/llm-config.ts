export interface LLMConfig {
    // Ollama Configuration
    ollama: {
      baseUrl: string;
      model: string;
      temperature: number;
      maxTokens: number;
      topP: number;
      stopSequences: string[];
    };
    
    // Knowledge Base Configuration
    knowledgeBase: {
      enabled: boolean;
      filePath: string;
      persona: string;
      introduction: string;
      conversationStarters: string[];
      rules: string[];
      promptTemplate: string;
    };
    
    // Avatar Configuration
    avatar: {
      defaultAvatarId: string;
      voiceSettings: {
        rate: number;
        emotion: string;
        model: string;
      };
      language: string;
    };
  }
  
  // Default Configuration
  export const defaultLLMConfig: LLMConfig = {
    ollama: {
      baseUrl: "http://localhost:11434",
      model: "tinyllama",
      temperature: 0.2,
      maxTokens: 30,
      topP: 0.8,
      stopSequences: ['\n\n', 'User:', 'Assistant:', 'Human:', 'AI:']
    },
    
    knowledgeBase: {
      enabled: true,
      filePath: "/config/knowledge-base.json",
      persona: "You are a helpful AI assistant with a friendly personality.",
      introduction: "Hello! I'm your AI assistant. How can I help you today?",
      conversationStarters: [
        "What would you like to know?",
        "How can I assist you?",
        "Is there anything specific you'd like to discuss?"
      ],
      rules: [
        "Always be helpful and friendly",
        "Keep responses concise and clear",
        "Ask follow-up questions when appropriate"
      ],
      promptTemplate: "You are {persona}. {rules}. Current conversation: {history}. User: {message}. Assistant:"
    },
    
    avatar: {
      defaultAvatarId: "Ann_Therapist_public",
      voiceSettings: {
        rate: 1.5,
        emotion: "EXCITED",
        model: "eleven_flash_v2_5"
      },
      language: "en"
    }
  };
  
  // Load configuration from environment or use defaults
  export function getLLMConfig(): LLMConfig {
    return {
      ollama: {
        baseUrl: process.env.OLLAMA_BASE_URL || defaultLLMConfig.ollama.baseUrl,
        model: process.env.OLLAMA_MODEL || defaultLLMConfig.ollama.model,
        temperature: parseFloat(process.env.OLLAMA_TEMPERATURE || defaultLLMConfig.ollama.temperature.toString()),
        maxTokens: parseInt(process.env.OLLAMA_MAX_TOKENS || defaultLLMConfig.ollama.maxTokens.toString()),
        topP: parseFloat(process.env.OLLAMA_TOP_P || defaultLLMConfig.ollama.topP.toString()),
        stopSequences: process.env.OLLAMA_STOP_SEQUENCES ? 
          process.env.OLLAMA_STOP_SEQUENCES.split(',') : 
          defaultLLMConfig.ollama.stopSequences
      },
      
      knowledgeBase: {
        enabled: process.env.KNOWLEDGE_BASE_ENABLED === 'true' || defaultLLMConfig.knowledgeBase.enabled,
        filePath: process.env.KNOWLEDGE_BASE_PATH || defaultLLMConfig.knowledgeBase.filePath,
        persona: process.env.KNOWLEDGE_BASE_PERSONA || defaultLLMConfig.knowledgeBase.persona,
        introduction: process.env.KNOWLEDGE_BASE_INTRODUCTION || defaultLLMConfig.knowledgeBase.introduction,
        conversationStarters: process.env.KNOWLEDGE_BASE_STARTERS ? 
          process.env.KNOWLEDGE_BASE_STARTERS.split('|') : 
          defaultLLMConfig.knowledgeBase.conversationStarters,
        rules: process.env.KNOWLEDGE_BASE_RULES ? 
          process.env.KNOWLEDGE_BASE_RULES.split('|') : 
          defaultLLMConfig.knowledgeBase.rules,
        promptTemplate: process.env.KNOWLEDGE_BASE_PROMPT_TEMPLATE || defaultLLMConfig.knowledgeBase.promptTemplate
      },
      
      avatar: {
        defaultAvatarId: process.env.DEFAULT_AVATAR_ID || defaultLLMConfig.avatar.defaultAvatarId,
        voiceSettings: {
          rate: parseFloat(process.env.AVATAR_VOICE_RATE || defaultLLMConfig.avatar.voiceSettings.rate.toString()),
          emotion: process.env.AVATAR_VOICE_EMOTION || defaultLLMConfig.avatar.voiceSettings.emotion,
          model: process.env.AVATAR_VOICE_MODEL || defaultLLMConfig.avatar.voiceSettings.model
        },
        language: process.env.AVATAR_LANGUAGE || defaultLLMConfig.avatar.language
      }
    };
  }