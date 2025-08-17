export class LipSyncService {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private dataArray: Uint8Array | null = null;
  
    constructor() {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        this.audioContext = new AudioContext();
        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 256;
        const bufferLength = this.analyser.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);
      }
    }
  
    async speakWithLipSync(text: string, onLipSync: (intensity: number) => void) {
      if (!this.audioContext || !this.analyser) {
        console.warn('Audio context not available');
        return;
      }
  
      try {
        // Use Web Speech API for TTS
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;
  
        // Create audio source from TTS
        const audioElement = document.createElement('audio');
        audioElement.src = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
        
        // Connect to analyser
        const source = this.audioContext.createMediaElementSource(audioElement);
        source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
  
        // Start lip sync animation
        const animate = () => {
          if (!this.analyser || !this.dataArray) return;
  
          this.analyser.getByteFrequencyData(this.dataArray);
          
          // Calculate average frequency intensity
          const average = this.dataArray.reduce((a, b) => a + b) / this.dataArray.length;
          const intensity = average / 255; // Normalize to 0-1
          
          onLipSync(intensity);
          
          if (speechSynthesis.speaking) {
            requestAnimationFrame(animate);
          }
        };
  
        utterance.onstart = () => {
          animate();
        };
  
        utterance.onend = () => {
          onLipSync(0);
        };
  
        speechSynthesis.speak(utterance);
  
      } catch (error) {
        console.error('Lip sync error:', error);
      }
    }
  
    stop() {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    }
  }