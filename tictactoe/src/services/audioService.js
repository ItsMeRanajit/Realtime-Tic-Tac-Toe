class AudioService {
  constructor() {
    this.ctx = null;
    this.muted = false;

    if (typeof window !== "undefined") {
      const savedMute = localStorage.getItem("tictactoe_muted");
      this.muted = savedMute === "true";
    }
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  isMuted() {
    return this.muted;
  }

  toggleMute() {
    this.muted = !this.muted;
    if (typeof window !== "undefined") {
      localStorage.setItem("tictactoe_muted", String(this.muted));
    }
    return this.muted;
  }

  playTone(freq, type = "sine", duration = 0.1, gainVal = 0.15) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Audio playback failed or blocked
    }
  }

  playMove(symbol = "X") {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;
      const baseFreq = symbol === "X" ? 520 : 440;
      this.playTone(baseFreq, "triangle", 0.08, 0.2);
    } catch {
      // Ignore
    }
  }

  playClick() {
    this.playTone(600, "sine", 0.04, 0.1);
  }

  playMatchFound() {
    if (this.muted) return;
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, "sine", 0.18, 0.15);
      }, idx * 90);
    });
  }

  playWin() {
    if (this.muted) return;
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, "triangle", 0.28, 0.2);
      }, idx * 110);
    });
  }

  playLoss() {
    if (this.muted) return;
    const notes = [392, 349.23, 311.13, 261.63];
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, "sawtooth", 0.22, 0.12);
      }, idx * 130);
    });
  }

  playDraw() {
    if (this.muted) return;
    this.playTone(350, "sine", 0.25, 0.15);
    setTimeout(() => this.playTone(350, "sine", 0.25, 0.15), 180);
  }

  playChat() {
    this.playTone(880, "sine", 0.06, 0.1);
  }

  playReaction() {
    this.playTone(720, "triangle", 0.1, 0.12);
  }
}

export const sound = new AudioService();
