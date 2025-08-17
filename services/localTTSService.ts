export class LocalTTSService {
    private speechSynthesis: SpeechSynthesis | null = null;
    private utterance: SpeechSynthesisUtterance | null = null;
  
    constructor() {
      if ('speechSynthesis' in window) {
        this.speechSynthesis = window.speechSynthesis;
      } else {
        console.error('Speech synthesis not supported in this browser');
      }
    }
  
    speak(text: string, onEnd?: () => void) {
      if (!this.speechSynthesis) {
        console.error('Speech synthesis not available');
        return;
      }
  
      // Cancel any ongoing speech
      this.speechSynthesis.cancel();
  
      this.utterance = new SpeechSynthesisUtterance(text);
      this.utterance.rate = 1.0;
      this.utterance.pitch = 1.0;
      this.utterance.volume = 1.0;
      this.utterance.lang = 'en-US';
  
      if (onEnd) {
        this.utterance.onend = onEnd;
      }
  
      this.utterance.onstart = () => {
        console.log('TTS started speaking:', text);
      };
  
      this.utterance.onend = () => {
        console.log('TTS finished speaking');
        if (onEnd) onEnd();
      };
  
      this.utterance.onerror = (event) => {
        console.error('TTS error:', event.error);
      };
  
      this.speechSynthesis.speak(this.utterance);
    }
  
    stop() {
      if (this.speechSynthesis) {
        this.speechSynthesis.cancel();
        console.log('TTS stopped');
      }
    }
  
    isSupported() {
      return !!this.speechSynthesis;
    }
  
    isSpeaking() {
      return this.speechSynthesis ? this.speechSynthesis.speaking : false;
    }
  }