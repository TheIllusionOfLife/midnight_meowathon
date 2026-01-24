// サウンドエンジン
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.master = null;
        this.initialized = false;
    }

    init() {
        if (this.ctx) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.master = this.ctx.createGain();
            this.master.connect(this.ctx.destination);
            this.master.gain.value = 0.35;
            this.initialized = true;

            // Auto-resume on user interaction (required for iOS Safari)
            if (this.ctx.state === 'suspended') {
                const resumeAudio = () => {
                    this.resume();
                    document.removeEventListener('touchstart', resumeAudio);
                    document.removeEventListener('touchend', resumeAudio);
                    document.removeEventListener('click', resumeAudio);
                };
                document.addEventListener('touchstart', resumeAudio);
                document.addEventListener('touchend', resumeAudio);
                document.addEventListener('click', resumeAudio);
            }
        } catch (e) {
            console.warn('Audio context initialization failed:', e);
        }
    }

    resume() {
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume().catch(e => {
                console.warn('Audio resume failed:', e);
            });
        }
    }

    stopAll() {
        if (!this.ctx) return;
        try {
            if (this.ctx.state === 'running') {
                this.ctx.suspend().then(() => this.ctx.resume());
            }
        } catch (e) {}
    }

    tone(freq, dur, type = 'sine', vol = 0.3) {
        if (!this.ctx || !this.master) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.connect(gain);
            gain.connect(this.master);
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + dur);
            osc.start();
            osc.stop(this.ctx.currentTime + dur);
        } catch (e) {
            console.warn('Tone generation failed:', e);
        }
    }

    jump() {
        if (!this.ctx || !this.master) return;
        this.tone(320, 0.08);
        setTimeout(() => this.tone(480, 0.1), 30);
    }

    wallKick() {
        if (!this.ctx || !this.master) return;
        this.tone(150, 0.04, 'square', 0.2);
        setTimeout(() => this.tone(300, 0.06), 20);
        setTimeout(() => this.tone(500, 0.08), 40);
        setTimeout(() => this.tone(700, 0.06), 60);
    }

    land() {
        if (!this.ctx || !this.master) return;
        this.tone(100, 0.08, 'sine', 0.25);
        this.tone(60, 0.12, 'triangle', 0.15);
    }

    hit(intensity) {
        if (!this.ctx || !this.master) return;
        for (let i = 0; i < 3 + intensity; i++) {
            setTimeout(() => this.tone(80 + Math.random() * 150, 0.08, 'sawtooth', 0.1), i * 20);
        }
        this.tone(50, 0.2, 'sine', 0.2 + intensity * 0.05);
    }

    itemBreak(intensity = 1) {
        if (!this.ctx || !this.master) return;
        const base = 520 + Math.min(200, intensity * 40);
        this.tone(base, 0.06, 'triangle', 0.25);
        setTimeout(() => this.tone(base * 1.25, 0.07, 'triangle', 0.22), 40);
        setTimeout(() => this.tone(base * 1.5, 0.08, 'triangle', 0.2), 90);
    }

    combo(c) {
        if (!this.ctx || !this.master) return;
        const f = 400 + c * 60;
        this.tone(f, 0.08);
        setTimeout(() => this.tone(f * 1.25, 0.08), 60);
        setTimeout(() => this.tone(f * 1.5, 0.1), 120);
    }

    danger() {
        if (!this.ctx || !this.master) return;
        this.tone(120, 0.4, 'sawtooth', 0.12);
    }

    gameOver() {
        if (!this.ctx || !this.master) return;
        // BGMなし（サイレント）
    }

    clear() {
        if (!this.ctx || !this.master) return;
        [523, 659, 784, 880, 1047].forEach((f, i) => setTimeout(() => this.tone(f, 0.15), i * 80));
    }

    // 猫の鳴き声バリエーション
    meow() {
        if (!this.ctx || !this.master) return;
        // 基本の「にゃー」
        this.tone(700, 0.08);
        setTimeout(() => this.tone(900, 0.1), 60);
        setTimeout(() => this.tone(600, 0.15), 140);
    }

    meowShort() {
        if (!this.ctx || !this.master) return;
        // 短い「にゃっ」
        this.tone(800, 0.05);
        setTimeout(() => this.tone(650, 0.06), 40);
    }

    purr() {
        // ゴロゴロ（低周波の連続音）
        if (!this.ctx || !this.master) return;
        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const filter = this.ctx.createBiquadFilter();

            osc.type = 'sawtooth';
            osc.frequency.value = 25;
            filter.type = 'lowpass';
            filter.frequency.value = 200;

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.master);

            gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.5);
        } catch (e) {
            console.warn('Purr sound failed:', e);
        }
    }

    hiss() {
        // フシャー（ホワイトノイズ + 高周波）
        if (!this.ctx || !this.master) return;
        try {
            const bufferSize = this.ctx.sampleRate * 0.3;
            const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const noise = this.ctx.createBufferSource();
            const filter = this.ctx.createBiquadFilter();
            const gain = this.ctx.createGain();

            noise.buffer = buffer;
            filter.type = 'highpass';
            filter.frequency.value = 2000;

            noise.connect(filter);
            filter.connect(gain);
            gain.connect(this.master);

            gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

            noise.start();
            noise.stop(this.ctx.currentTime + 0.3);
        } catch (e) {
            console.warn('Hiss sound failed:', e);
        }
    }

    victoryMeow() {
        if (!this.ctx || !this.master) return;
        // 勝利の鳴き声（高めの「にゃーん」x3）
        this.tone(900, 0.15);
        setTimeout(() => this.tone(950, 0.15), 200);
        setTimeout(() => this.tone(1000, 0.2), 400);
    }
}

// グローバルインスタンス
const sound = new SoundEngine();
