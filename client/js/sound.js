// Web Audio API Sound Synthesizer - 100% Code-based, No external assets needed
class SoundManager {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.volume = 0.3;
    
    // Load preference from localStorage
    const saved = localStorage.getItem('minigame_sound_enabled');
    if (saved !== null) {
      this.enabled = saved === 'true';
    }
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('minigame_sound_enabled', this.enabled);
    if (this.enabled) {
      this.init();
      this.playBeep(600, 'sine', 0.1);
    }
    return this.enabled;
  }

  // Low level tone generator
  playBeep(freq, type = 'sine', duration = 0.1, gainVal = null) {
    if (!this.enabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      const actualGain = gainVal !== null ? gainVal : this.volume;
      gain.gain.setValueAtTime(actualGain, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      // AudioContext policy catch
    }
  }

  // Pre-configured sound effects
  click() {
    this.playBeep(800, 'sine', 0.05, this.volume * 0.4);
  }

  placePiece() {
    // Caro piece placement: wooden thud
    if (!this.enabled) return;
    try {
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.7, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch (e) {}
  }

  eatFood() {
    // Snake eat chime
    if (!this.enabled) return;
    try {
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);

      gain.gain.setValueAtTime(this.volume * 0.6, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(now + 0.13);
    } catch (e) {}
  }

  bonus() {
    // Golden apple or high combo
    if (!this.enabled) return;
    try {
      this.init();
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        setTimeout(() => {
          this.playBeep(freq, 'triangle', 0.12, this.volume * 0.6);
        }, idx * 60);
      });
    } catch (e) {}
  }

  merge2048(val) {
    // Pitch scales with merged value
    const baseFreq = 260 + Math.min(Math.log2(val || 2) * 80, 1000);
    this.playBeep(baseFreq, 'sine', 0.08, this.volume * 0.5);
  }

  tick() {
    // Wheel ticker
    this.playBeep(1200, 'square', 0.02, this.volume * 0.25);
  }

  win() {
    // Victory fanfare
    if (!this.enabled) return;
    const melody = [
      { f: 523, d: 0.12 },
      { f: 659, d: 0.12 },
      { f: 784, d: 0.12 },
      { f: 1046, d: 0.35 }
    ];
    melody.forEach((note, i) => {
      setTimeout(() => {
        this.playBeep(note.f, 'triangle', note.d, this.volume * 0.7);
      }, i * 130);
    });
  }

  gameOver() {
    // Game over sound
    if (!this.enabled) return;
    const melody = [
      { f: 440, d: 0.15 },
      { f: 415, d: 0.15 },
      { f: 392, d: 0.15 },
      { f: 349, d: 0.4 }
    ];
    melody.forEach((note, i) => {
      setTimeout(() => {
        this.playBeep(note.f, 'sawtooth', note.d, this.volume * 0.4);
      }, i * 150);
    });
  }

  coin() {
    // Coin reward chime
    this.playBeep(987.77, 'sine', 0.08, this.volume * 0.5);
    setTimeout(() => {
      this.playBeep(1318.51, 'sine', 0.2, this.volume * 0.6);
    }, 80);
  }
}

window.sound = new SoundManager();
