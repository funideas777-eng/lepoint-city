// ============================================================
// 音效引擎 - Web Audio API + 震動
// ============================================================

const AudioEngine = {
  ctx: null,
  initialized: false,

  init() {
    if (this.initialized) return;
    try {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.initialized = true;
    } catch { console.warn('Web Audio 不支援'); }
  },

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  },

  playTone(freq, duration, type = 'sine', volume = 0.3) {
    if (!this.ctx) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  playSweep(startFreq, endFreq, duration, type = 'sine', volume = 0.3) {
    if (!this.ctx) return;
    this.resume();
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  },

  playNoise(duration, volume = 0.1) {
    if (!this.ctx) return;
    this.resume();
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const source = this.ctx.createBufferSource();
    const gain = this.ctx.createGain();
    source.buffer = buffer;
    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
    source.connect(gain);
    gain.connect(this.ctx.destination);
    source.start();
  },

  playSequence(notes, tempo = 150) {
    notes.forEach(([freq, dur], i) => {
      setTimeout(() => this.playTone(freq, dur / 1000, 'sine', 0.25), i * tempo);
    });
  },

  // UI 音效
  tapButton() { this.playTone(800, 0.08, 'sine', 0.15); },
  pageTransition() { this.playSweep(400, 800, 0.15, 'sine', 0.1); },
  error() { this.playSequence([[200, 200], [150, 300]], 200); },

  // GPS 音效
  enterZone() {
    this.playSequence([[523, 150], [659, 150], [784, 200]], 120);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
  },
  unlockGame() {
    this.playSequence([[523, 100], [659, 100], [784, 100], [1047, 300]], 100);
    if (navigator.vibrate) navigator.vibrate([100, 50, 100, 50, 200]);
  },

  // 遊戲音效
  countdown() { this.playTone(440, 0.15, 'square', 0.2); },
  gameStart() {
    this.playSequence([[523, 100], [659, 100], [784, 100], [1047, 200]], 80);
    if (navigator.vibrate) navigator.vibrate(200);
  },
  gameEnd() {
    this.playSequence([[784, 200], [659, 200], [523, 300]], 180);
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  },
  comboHit(combo) {
    const freq = 600 + Math.min(combo, 10) * 80;
    this.playTone(freq, 0.1, 'triangle', 0.2);
    if (navigator.vibrate) navigator.vibrate(30);
  },
  scoreUp() { this.playSweep(400, 900, 0.15, 'triangle', 0.2); },
  penalty() {
    this.playTone(150, 0.3, 'sawtooth', 0.15);
    if (navigator.vibrate) navigator.vibrate(100);
  },

  // 小遊戲專用
  snakeEat() { this.playTone(600, 0.05, 'square', 0.15); },
  snakeDie() { this.playSweep(400, 100, 0.4, 'sawtooth', 0.2); },
  cardFlip() { this.playTone(700, 0.06, 'sine', 0.15); },
  cardMatch() { this.playSequence([[800, 80], [1000, 120]], 80); },
  cardMiss() { this.playTone(300, 0.15, 'triangle', 0.1); },
  whackHit() { this.playTone(500, 0.08, 'square', 0.2); if (navigator.vibrate) navigator.vibrate(50); },
  whackMiss() { this.playNoise(0.1, 0.05); },
  quizCorrect() { this.playSequence([[523, 80], [784, 150]], 80); },
  quizWrong() { this.playTone(200, 0.3, 'sawtooth', 0.15); },

  // 拍照
  shutter() { this.playNoise(0.15, 0.2); },
  uploadSuccess() { this.playSequence([[523, 100], [784, 100], [1047, 200]], 100); },

  // 通知
  notification() {
    this.playSequence([[880, 100], [1100, 150]], 120);
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }
};
