// audio.js - Procedural Web Audio System for Turbo Flash Racer
class AudioManager {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.musicEnabled = true;
    this.isInitialized = false;

    // Sound nodes
    this.engineOsc = null;
    this.engineOsc2 = null;
    this.engineFilter = null;
    this.engineGain = null;

    this.driftNoise = null;
    this.driftFilter = null;
    this.driftGain = null;

    this.nitroGain = null;
    this.nitroFilter = null;

    // Music tracker state
    this.musicInterval = null;
    this.musicStep = 0;
    this.bpm = 132;
  }

  init() {
    if (this.isInitialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
      this.initEngineSound();
      this.initDriftSound();
      this.initNitroSound();
      this.isInitialized = true;
    } catch (e) {
      console.warn("Web Audio not supported or blocked", e);
    }
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      if (this.engineGain) this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);
      if (this.driftGain) this.driftGain.gain.setValueAtTime(0, this.ctx.currentTime);
      if (this.nitroGain) this.nitroGain.gain.setValueAtTime(0, this.ctx.currentTime);
      this.stopMusic();
    } else {
      if (this.musicEnabled) this.startMusic();
    }
    return this.isMuted;
  }

  toggleMusic() {
    this.musicEnabled = !this.musicEnabled;
    if (this.musicEnabled && !this.isMuted) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
    return this.musicEnabled;
  }

  // --- ENGINE SYNTHESIS ---
  initEngineSound() {
    if (!this.ctx) return;
    this.engineOsc = this.ctx.createOscillator();
    this.engineOsc.type = 'sawtooth';
    this.engineOsc.frequency.setValueAtTime(45, this.ctx.currentTime);

    this.engineOsc2 = this.ctx.createOscillator();
    this.engineOsc2.type = 'triangle';
    this.engineOsc2.frequency.setValueAtTime(22.5, this.ctx.currentTime);

    this.engineFilter = this.ctx.createBiquadFilter();
    this.engineFilter.type = 'lowpass';
    this.engineFilter.frequency.setValueAtTime(300, this.ctx.currentTime);
    this.engineFilter.Q.setValueAtTime(4, this.ctx.currentTime);

    this.engineGain = this.ctx.createGain();
    this.engineGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.engineOsc.connect(this.engineFilter);
    this.engineOsc2.connect(this.engineFilter);
    this.engineFilter.connect(this.engineGain);
    this.engineGain.connect(this.ctx.destination);

    this.engineOsc.start();
    this.engineOsc2.start();
  }

  updateEngine(speedRatio, isAccelerating) {
    if (!this.ctx || this.isMuted || !this.engineOsc) return;
    const now = this.ctx.currentTime;
    const baseFreq = 48;
    const maxFreq = 260;
    const targetFreq = baseFreq + (speedRatio * (maxFreq - baseFreq)) + (isAccelerating ? 25 : 0);
    
    this.engineOsc.frequency.setTargetAtTime(targetFreq, now, 0.08);
    this.engineOsc2.frequency.setTargetAtTime(targetFreq * 0.5, now, 0.08);
    
    const filterFreq = 250 + speedRatio * 800 + (isAccelerating ? 200 : 0);
    this.engineFilter.frequency.setTargetAtTime(filterFreq, now, 0.08);

    const targetGain = 0.08 + speedRatio * 0.12 + (isAccelerating ? 0.05 : 0);
    this.engineGain.gain.setTargetAtTime(targetGain, now, 0.05);
  }

  stopEngine() {
    if (this.engineGain && this.ctx) {
      this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.1);
    }
  }

  // --- DRIFT TIRE SCREECH ---
  initDriftSound() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    this.driftNoise = this.ctx.createBufferSource();
    this.driftNoise.buffer = buffer;
    this.driftNoise.loop = true;

    this.driftFilter = this.ctx.createBiquadFilter();
    this.driftFilter.type = 'bandpass';
    this.driftFilter.frequency.setValueAtTime(1100, this.ctx.currentTime);
    this.driftFilter.Q.setValueAtTime(5, this.ctx.currentTime);

    this.driftGain = this.ctx.createGain();
    this.driftGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.driftNoise.connect(this.driftFilter);
    this.driftFilter.connect(this.driftGain);
    this.driftGain.connect(this.ctx.destination);

    this.driftNoise.start();
  }

  setDriftIntensity(intensity) {
    if (!this.ctx || this.isMuted || !this.driftGain) return;
    const now = this.ctx.currentTime;
    const clamped = Math.max(0, Math.min(1, intensity));
    const targetGain = clamped * 0.15;
    this.driftGain.gain.setTargetAtTime(targetGain, now, 0.04);
    if (clamped > 0) {
      this.driftFilter.frequency.setTargetAtTime(900 + clamped * 600, now, 0.05);
    }
  }

  // --- NITRO SOUND ---
  initNitroSound() {
    if (!this.ctx) return;
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.8;
    }

    const nitroSource = this.ctx.createBufferSource();
    nitroSource.buffer = buffer;
    nitroSource.loop = true;

    this.nitroFilter = this.ctx.createBiquadFilter();
    this.nitroFilter.type = 'lowpass';
    this.nitroFilter.frequency.setValueAtTime(800, this.ctx.currentTime);

    this.nitroGain = this.ctx.createGain();
    this.nitroGain.gain.setValueAtTime(0, this.ctx.currentTime);

    nitroSource.connect(this.nitroFilter);
    this.nitroFilter.connect(this.nitroGain);
    this.nitroGain.connect(this.ctx.destination);

    nitroSource.start();
  }

  setNitroActive(active) {
    if (!this.ctx || this.isMuted || !this.nitroGain) return;
    const now = this.ctx.currentTime;
    this.nitroGain.gain.setTargetAtTime(active ? 0.22 : 0, now, 0.06);
    this.nitroFilter.frequency.setTargetAtTime(active ? 1800 : 500, now, 0.08);
  }

  // --- SFX ONE-SHOTS ---
  playCrash(intensity = 0.5) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);

    gain.gain.setValueAtTime(0.3 * intensity, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);

    const bufferSize = Math.floor(this.ctx.sampleRate * 0.2);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.25 * intensity, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.ctx.destination);
    noise.start(now);
    noise.stop(now + 0.2);
  }

  playBoostPad() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.exponentialRampToValueAtTime(900, now + 0.35);

    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  playCountdown(isGo = false) {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';

    const freq = isGo ? 880 : 440;
    const duration = isGo ? 0.6 : 0.25;

    osc.frequency.setValueAtTime(freq, now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  playLapBeep() {
    if (!this.ctx || this.isMuted) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now);
    osc.frequency.setValueAtTime(659.25, now + 0.1);
    osc.frequency.setValueAtTime(783.99, now + 0.2);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  }

  // --- PROCEDURAL RETRO ARCADE CHIPTUNE MUSIC ---
  startMusic() {
    if (!this.ctx || this.isMuted || !this.musicEnabled) return;
    this.stopMusic();

    const bassNotes = [
      110.00, 110.00, 130.81, 146.83,
      110.00, 110.00, 164.81, 146.83,
      98.00,  98.00,  123.47, 146.83,
      116.54, 116.54, 130.81, 146.83
    ];

    const leadNotes = [
      440.00, 0, 523.25, 587.33, 659.25, 0, 587.33, 523.25,
      440.00, 0, 392.00, 440.00, 523.25, 587.33, 659.25, 0
    ];

    const stepDuration = (60 / this.bpm) / 4;
    this.musicStep = 0;

    this.musicInterval = setInterval(() => {
      if (this.isMuted || !this.musicEnabled || !this.ctx) return;
      const now = this.ctx.currentTime;

      if (this.musicStep % 2 === 0) {
        const noteIdx = Math.floor(this.musicStep / 2) % bassNotes.length;
        const freq = bassNotes[noteIdx];
        if (freq > 0) {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.8);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + stepDuration * 1.8);
        }
      }

      const leadFreq = leadNotes[this.musicStep % leadNotes.length];
      if (leadFreq > 0) {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(leadFreq, now);

        gain.gain.setValueAtTime(0.04, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 1.2);

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1400, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + stepDuration * 1.2);
      }

      const isSnare = (this.musicStep % 8 === 4);
      const isHat = (this.musicStep % 2 === 1);

      if (isSnare || isHat) {
        const bufLen = Math.floor(this.ctx.sampleRate * (isSnare ? 0.08 : 0.02));
        const buf = this.ctx.createBuffer(1, bufLen, this.ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < bufLen; i++) d[i] = Math.random() * 2 - 1;

        const noise = this.ctx.createBufferSource();
        noise.buffer = buf;
        const filt = this.ctx.createBiquadFilter();
        filt.type = isSnare ? 'lowpass' : 'highpass';
        filt.frequency.setValueAtTime(isSnare ? 1000 : 7000, now);

        const drumGain = this.ctx.createGain();
        drumGain.gain.setValueAtTime(isSnare ? 0.08 : 0.02, now);
        drumGain.gain.exponentialRampToValueAtTime(0.001, now + (isSnare ? 0.08 : 0.02));

        noise.connect(filt);
        filt.connect(drumGain);
        drumGain.connect(this.ctx.destination);
        noise.start(now);
        noise.stop(now + (isSnare ? 0.08 : 0.02));
      }

      this.musicStep++;
    }, stepDuration * 1000);
  }

  stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

window.audio = new AudioManager();
