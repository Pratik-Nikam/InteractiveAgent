import StreamingAvatar, { StartAvatarRequest } from '@heygen/streaming-avatar';
import { LocalSTTService } from './localSTTService';
import { LocalTTSService } from './localTTSService';

export class LocalAvatarService {
  private avatar: StreamingAvatar | null = null;
  private sttService: LocalSTTService;
  private ttsService: LocalTTSService;
  private conversationHistory: Array<{ role: string; content: string }> = [];
  private isProcessing = false;

  constructor(token: string, basePath?: string) {
    // Initialize HeyGen avatar for visualization only
    this.avatar = new StreamingAvatar({
      token,
      basePath: basePath || process.env.NEXT_PUBLIC_BASE_API_URL,
    });

    // Initialize local STT and TTS services
    this.sttService = new LocalSTTService();
    this.ttsService = new LocalTTSService();
  }

  async startAvatar(config: StartAvatarRequest) {
    if (!this.avatar) throw new Error('Avatar not initialized');
    
    // Start the avatar for visualization
    await this.avatar.createStartAvatar(config);
    
    // Set up event listeners
    this.avatar.on('stream_ready', (event) => {
      console.log('Avatar stream ready');
    });
    
    return this.avatar;
  }

  async sendTextMessage(message: string) {
    if (this.isProcessing) {
      console.log('Already processing a message, skipping...');
      return;
    }

    try {
      this.isProcessing = true;
      console.log('Sending text message to TinyLLaMA:', message);
      
      // Send message to local TinyLLaMA API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationHistory: this.conversationHistory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to get response from local API: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      
      // Update conversation history
      this.conversationHistory = data.conversationHistory;

      console.log('TinyLLaMA response received:', data.response);

      // Make the avatar speak the response using local TTS
      this.ttsService.speak(data.response);

      return data.response;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    } finally {
      this.isProcessing = false;
    }
  }

  startVoiceChat(onUserSpeech: (text: string) => void) {
    if (!this.sttService.isSupported()) {
      throw new Error('Speech recognition not supported');
    }

    console.log('Starting voice chat...');
    this.sttService.startListening(async (text) => {
      console.log('User said:', text);
      
      // Call the callback with the transcribed text
      onUserSpeech(text);
      
      // Automatically send to TinyLLaMA and get response
      try {
        const response = await this.sendTextMessage(text);
        console.log('TinyLLaMA response:', response);
      } catch (error) {
        console.error('Error processing voice message:', error);
      }
    });
  }

  stopVoiceChat() {
    console.log('Stopping voice chat...');
    this.sttService.stopListening();
    this.ttsService.stop();
  }

  async stopAvatar() {
    this.stopVoiceChat();
    if (this.avatar) {
      await this.avatar.stopAvatar();
      this.avatar = null;
    }
    this.conversationHistory = [];
    console.log('Avatar stopped');
  }

  // Get conversation history
  getConversationHistory() {
    return this.conversationHistory;
  }

  // Check if services are supported
  isSTTSupported() {
    return this.sttService.isSupported();
  }

  isTTSSupported() {
    return this.ttsService.isSupported();
  }

  // Get processing state
  getProcessingState() {
    return this.isProcessing;
  }

  // Get STT listening state
  getSTTListeningState() {
    return this.sttService.getListeningState();
  }

  // Get TTS speaking state
  getTTSSpeakingState() {
    return this.ttsService.isSpeaking();
  }
}