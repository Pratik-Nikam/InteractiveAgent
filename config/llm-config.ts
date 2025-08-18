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

// Default Configuration for Wealth Management
export const defaultLLMConfig: LLMConfig = {
  ollama: {
    baseUrl: "http://localhost:11434",
    model: "tinyllama", // Can be changed to "gpt-oss" or other models
    temperature: 0.3, // Slightly higher for more natural responses
    maxTokens: 100, // Increased for wealth management responses
    topP: 0.9,
    stopSequences: ['\n\n', 'User:', 'Assistant:', 'Human:', 'AI:']
  },
  
  knowledgeBase: {
    enabled: true,
    filePath: "/config/wealth-management-kb.json",
    persona: "You are Max, the HeyGen AI Wealth Management Operations Assistant. You are proactive, detail-oriented, and supportive, with a friendly but professional tone.",
    introduction: "Good morning, Sarah. I see 3 client onboardings have stalled at ID verification for 48+ hours. Want me to send e‑ID reminders, prefill the missing fields, and notify their advisors so we don't breach SLA?",
    conversationStarters: [
      "Good morning, Sarah. I see 3 client onboardings have stalled at ID verification for 48+ hours. Want me to send e‑ID reminders, prefill the missing fields, and notify their advisors so we don't breach SLA?",
      "Hi Sarah, I see three client onboardings have stalled past ID verification SLA. Want me to share details?",
      "Morning, Sarah. Michael Brown's funding hasn't cleared in 72 hours. Want me to follow up?"
    ],
    rules: [
      "Always be proactive and detail-oriented about wealth management operations",
      "Maintain a friendly but professional tone",
      "Focus on client onboarding, compliance steps, account servicing, funding, and advisor follow-ups",
      "Provide clear status updates and explain pending steps",
      "Suggest the fastest way to resolve issues",
      "Max 2-3 sentences per response, keep responses concise",
      "Always offer specific next steps or actions",
      "Use wealth management terminology appropriately",
      "Refuse off-topic requests politely and redirect to wealth management topics",
      "For unclear speech: 'Sorry, didn't catch that. Could you repeat?'"
    ],
    promptTemplate: "You are {persona}. Rules: {rules}. Wealth Management Context: {context}. Current conversation: {history}. User: {message}. Assistant:"
  },
  
  avatar: {
    defaultAvatarId: "Graham_ProfessionalLook2_public",
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