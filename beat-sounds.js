/**
 * StickNext Beat - Sound Generation & Audio Management (OPTIMIZED v2)
 * Modular audio system dengan konsistensi timing & harmoni yang akurat
 */

class AudioContext {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
        this.masterGain.gain.value = 0.7; // Reduced from 0.8 to prevent clipping
        this.playingNotes = new Map();
        
        // Timing reference untuk beat consistency
        this.baseTime = this.context.currentTime;
        this.bpm = 120;
        this.beatDuration = 60 / this.bpm; // seconds per beat
    }

    // Get current time dalam context
    getCurrentTime() {
        return this.context.currentTime - this.baseTime;
    }

    // Sync ke beat grid terdekat
    getNextBeatTime(beatOffset = 0) {
        const currentBeat = this.getCurrentTime() / this.beatDuration;
        const nextBeat = Math.ceil(currentBeat) + beatOffset;
        return nextBeat * this.beatDuration + this.baseTime;
    }

    createOscillatorSound(frequency, duration, type = 'sine', envelope = 'default', startTime = null) {
        const now = startTime || this.context.currentTime;
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        gainNode.connect(this.masterGain);
        oscillator.connect(gainNode);

        if (envelope === 'default') {
            // Standard ADSR envelope
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.4, now + 0.01); // Attack: 10ms
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
        } else if (envelope === 'snappy') {
            // Fast attack, fast decay for percussion-like sound
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.5, now + 0.005);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.4);
        } else if (envelope === 'pad') {
            // Smooth, sustained sound
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05);
            gainNode.gain.linearRampToValueAtTime(0.3, now + duration * 0.8);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
        } else if (envelope === 'staccato') {
            // Very short, punchy
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.45, now + 0.003);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.3);
        }

        oscillator.start(now);
        oscillator.stop(now + duration);

        return { oscillator, gainNode };
    }

    playNote(frequency, duration = 0.2, type = 'sine', envelope = 'default', delay = 0) {
        const startTime = this.context.currentTime + delay;
        const key = `${frequency}_${Date.now()}_${Math.random()}`;
        const { oscillator, gainNode } = this.createOscillatorSound(frequency, duration, type, envelope, startTime);
        this.playingNotes.set(key, { oscillator, gainNode });

        setTimeout(() => {
            this.playingNotes.delete(key);
        }, (duration + delay) * 1000);

        return key;
    }

    stopAll() {
        this.playingNotes.forEach(({ oscillator }) => {
            try {
                oscillator.stop();
            } catch (e) {}
        });
        this.playingNotes.clear();
    }

    setMasterVolume(value) {
        this.masterGain.gain.value = Math.max(0, Math.min(1, value));
    }

    getMasterVolume() {
        return this.masterGain.gain.value;
    }
}

class CharacterSound {
    constructor(characterId, name, frequency, type = 'sine', envelope = 'default', melodyBase64 = null) {
        this.characterId = characterId;
        this.name = name;
        this.frequency = frequency;
        this.type = type;
        this.envelope = envelope;
        this.isPlaying = false;
        this.melodyBase64 = melodyBase64;
        this.melodyAudioBuffer = null;
        this.source = null;
    }

    async loadMelodyBuffer(audioContext) {
        if (!this.melodyBase64 || this.melodyAudioBuffer) return;
        
        try {
            const binaryString = atob(this.melodyBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            this.melodyAudioBuffer = await audioContext.context.decodeAudioData(bytes.buffer);
        } catch (err) {
            console.error(`Failed to load melody for ${this.name}:`, err);
        }
    }

    async play(audioContext) {
        if (this.melodyBase64) {
            // Play melody dari base64
            await this.loadMelodyBuffer(audioContext);
            if (this.melodyAudioBuffer) {
                const now = audioContext.context.currentTime;
                this.source = audioContext.context.createBufferSource();
                this.source.buffer = this.melodyAudioBuffer;
                
                const gainNode = audioContext.context.createGain();
                gainNode.gain.value = 0.7;
                
                this.source.connect(gainNode);
                gainNode.connect(audioContext.masterGain);
                this.source.start(now);
                
                this.isPlaying = true;
                setTimeout(() => {
                    this.isPlaying = false;
                    if (this.source) {
                        try {
                            this.source.stop();
                        } catch (e) {}
                    }
                }, this.melodyAudioBuffer.duration * 1000);
            }
        } else {
            // Fallback ke oscillator jika tidak ada melody
            this.isPlaying = true;
            audioContext.playNote(this.frequency, 0.4, this.type, this.envelope);
            setTimeout(() => {
                this.isPlaying = false;
            }, 400);
        }
    }

    stop(audioContext) {
        this.isPlaying = false;
        if (this.source) {
            try {
                this.source.stop();
            } catch (e) {}
        }
        audioContext.stopAll();
    }
}

class BeatSoundManager {
    constructor() {
        this.audioContext = new AudioContext();
        this.characters = new Map();
        this.activeLoops = new Map(); // { characterId: { isLooping, timeout, character } }
        this.initializeCharacterSounds();
        this.playbackMode = 'simultaneous';
    }

    initializeCharacterSounds() {
        const sounds = [
            { id: 'rose', name: 'Rose', freq: 440, type: 'sine', envelope: 'pad', melody: CHARACTER_MELODIES?.rose },
            { id: 'petalina', name: 'Petalina', freq: 494, type: 'sine', envelope: 'default', melody: CHARACTER_MELODIES?.petalina },
            { id: 'nitra', name: 'Nitra', freq: 523, type: 'triangle', envelope: 'snappy', melody: CHARACTER_MELODIES?.nitra },
            { id: 'guardian', name: 'Guardian', freq: 392, type: 'square', envelope: 'default', melody: CHARACTER_MELODIES?.guardian },
            { id: 'thunder', name: 'Thunder', freq: 587, type: 'triangle', envelope: 'snappy', melody: CHARACTER_MELODIES?.thunder },
            { id: 'dash', name: 'Dash', freq: 659, type: 'sine', envelope: 'snappy', melody: CHARACTER_MELODIES?.dash },
            { id: 'tockay', name: 'Tockay', freq: 349, type: 'square', envelope: 'snappy', melody: CHARACTER_MELODIES?.tockay },
            { id: 'rail_girl', name: 'Rail Girl', freq: 784, type: 'sine', envelope: 'pad', melody: CHARACTER_MELODIES?.rail_girl }
        ];

        sounds.forEach(sound => {
            this.characters.set(sound.id, new CharacterSound(
                sound.id,
                sound.name,
                sound.freq,
                sound.type,
                sound.envelope,
                sound.melody
            ));
        });
    }

    async playCharacterSound(characterId) {
        const sound = this.characters.get(characterId);
        if (sound) {
            await sound.play(this.audioContext);
            return true;
        }
        return false;
    }

    stopCharacterSound(characterId) {
        const sound = this.characters.get(characterId);
        if (sound) {
            sound.stop(this.audioContext);
            return true;
        }
        return false;
    }

    /**
     * Start looping sound untuk character dengan rhythm interval tertentu
     * @param {string} characterId - ID character
     * @param {number} rhythmInterval - Interval dalam detik antara sound playback
     */
    startCharacterLoop(characterId, rhythmInterval) {
        // Stop existing loop jika ada
        if (this.activeLoops.has(characterId)) {
            this.stopCharacterLoop(characterId);
        }

        const sound = this.characters.get(characterId);
        if (!sound || !rhythmInterval || rhythmInterval <= 0) return false;

        // Setup loop dengan interval (playback pertama sudah dilakukan di placeCharacter/playAll)
        const scheduleNextLoop = () => {
            const timeout = setTimeout(() => {
                // Tidak perlu await di dalam loop, playback sudah async internal
                this.playCharacterSound(characterId);
                
                // Cek apakah loop masih active
                if (this.activeLoops.has(characterId)) {
                    scheduleNextLoop();
                }
            }, rhythmInterval * 1000);

            if (this.activeLoops.has(characterId)) {
                this.activeLoops.get(characterId).timeout = timeout;
            }
        };

        this.activeLoops.set(characterId, {
            isLooping: true,
            timeout: null,
            rhythmInterval: rhythmInterval
        });

        scheduleNextLoop();
        return true;
    }

    /**
     * Stop looping sound untuk character
     * @param {string} characterId - ID character
     */
    stopCharacterLoop(characterId) {
        if (this.activeLoops.has(characterId)) {
            const loop = this.activeLoops.get(characterId);
            if (loop.timeout) {
                clearTimeout(loop.timeout);
            }
            this.activeLoops.delete(characterId);
            return true;
        }
        return false;
    }

    /**
     * Check apakah character sedang looping
     * @param {string} characterId - ID character
     * @returns {boolean}
     */
    isCharacterLooping(characterId) {
        return this.activeLoops.has(characterId);
    }

    stopAllSounds() {
        this.audioContext.stopAll();
        this.characters.forEach(sound => {
            sound.isPlaying = false;
        });
        
        // Stop semua active loops
        this.activeLoops.forEach((loop, characterId) => {
            if (loop.timeout) {
                clearTimeout(loop.timeout);
            }
        });
        this.activeLoops.clear();
    }

    playMultipleSounds(characterIds) {
        characterIds.forEach(id => this.playCharacterSound(id));
    }

    getCharacterSounds() {
        return Array.from(this.characters.entries()).map(([id, sound]) => ({
            id,
            name: sound.name,
            frequency: sound.frequency,
            type: sound.type,
            isPlaying: sound.isPlaying
        }));
    }

    setMasterVolume(value) {
        this.audioContext.setMasterVolume(value);
    }

    getMasterVolume() {
        return this.audioContext.getMasterVolume();
    }
}

// Initialize global instance
window.beatSoundManager = new BeatSoundManager();
