// SpeechSynthesis (Text-to-Speech) Helper for Hebrew with Accessibility Support
class SpeechHelper {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private isSpeakingState: boolean = false;
  private onStateChangeListeners: Array<(isSpeaking: boolean) => void> = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
    }
  }

  public subscribe(listener: (isSpeaking: boolean) => void) {
    this.onStateChangeListeners.push(listener);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter((l) => l !== listener);
    };
  }

  private notify(isSpeaking: boolean) {
    this.isSpeakingState = isSpeaking;
    this.onStateChangeListeners.forEach((l) => l(isSpeaking));
  }

  public speak(text: string, rate: number = 0.92) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported in this browser environment.');
      return;
    }

    // Clean text from Markdown or special symbols
    const cleanText = text
      .replace(/[#*_`~[\]()]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanText) return;

    // Stop any active speech first
    this.stop();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'he-IL';
    utterance.rate = rate; // slightly calmer speed for ADHD/learning clarity
    utterance.pitch = 1.0;

    // Try finding a Hebrew voice if available
    const voices = this.synth.getVoices();
    const heVoice = voices.find((v) => v.lang.startsWith('he') || v.lang.includes('Hebrew'));
    if (heVoice) {
      utterance.voice = heVoice;
    }

    utterance.onstart = () => {
      this.notify(true);
    };

    utterance.onend = () => {
      this.notify(false);
      this.currentUtterance = null;
    };

    utterance.onerror = (e) => {
      console.warn('TTS Error:', e);
      this.notify(false);
      this.currentUtterance = null;
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public stop() {
    if (this.synth) {
      this.synth.cancel();
      this.notify(false);
      this.currentUtterance = null;
    }
  }

  public isSpeaking(): boolean {
    return this.isSpeakingState;
  }
}

export const speechHelper = new SpeechHelper();
