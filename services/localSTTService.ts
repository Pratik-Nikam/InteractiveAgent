declare global {
    interface Window {
      SpeechRecognition: typeof SpeechRecognition;
      webkitSpeechRecognition: typeof SpeechRecognition;
    }
  }
  
  export class LocalSTTService {
    private recognition: SpeechRecognition | null = null;
    private isListening = false;
    private onResultCallback: ((text: string) => void) | null = null;
  
    constructor() {
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      } else {
        console.error('Speech recognition not supported in this browser');
      }
    }
  
    private setupRecognition() {
      if (!this.recognition) return;
  
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.lang = 'en-US';
  
      this.recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log('STT Result:', transcript);
        if (this.onResultCallback) {
          this.onResultCallback(transcript);
        }
      };
  
      this.recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
      };
  
      this.recognition.onend = () => {
        this.isListening = false;
        console.log('Speech recognition ended');
      };
  
      this.recognition.onstart = () => {
        console.log('Speech recognition started');
      };
    }
  
    startListening(onResult: (text: string) => void) {
      if (!this.recognition) {
        throw new Error('Speech recognition not available');
      }
  
      this.onResultCallback = onResult;
      this.recognition.start();
      this.isListening = true;
    }
  
    stopListening() {
      if (this.recognition && this.isListening) {
        this.recognition.stop();
        this.isListening = false;
      }
    }
  
    isSupported() {
      return !!this.recognition;
    }
  
    getListeningState() {
      return this.isListening;
    }
  }