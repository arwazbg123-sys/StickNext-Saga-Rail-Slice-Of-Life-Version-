/**
 * StickNext Beat - Sound Generation & Audio Management
 * Modular audio system untuk game musik interaktif
 */

class AudioContext {
    constructor() {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
        this.masterGain = this.context.createGain();
        this.masterGain.connect(this.context.destination);
        this.masterGain.gain.value = 0.8;
        this.playingNotes = new Map();
    }

    createOscillatorSound(frequency, duration, type = 'sine', envelope = 'default') {
        const now = this.context.currentTime;
        const oscillator = this.context.createOscillator();
        const gainNode = this.context.createGain();

        oscillator.type = type;
        oscillator.frequency.value = frequency;

        gainNode.connect(this.masterGain);
        oscillator.connect(gainNode);

        if (envelope === 'default') {
            gainNode.gain.setValueAtTime(0.3, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
        } else if (envelope === 'snappy') {
            gainNode.gain.setValueAtTime(0.4, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.5);
        } else if (envelope === 'pad') {
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + duration * 0.2);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
        }

        oscillator.start(now);
        oscillator.stop(now + duration);

        return { oscillator, gainNode };
    }

    playNote(frequency, duration = 0.2, type = 'sine', envelope = 'default') {
        const key = `${frequency}_${Date.now()}`;
        const { oscillator, gainNode } = this.createOscillatorSound(frequency, duration, type, envelope);
        this.playingNotes.set(key, { oscillator, gainNode });

        setTimeout(() => {
            this.playingNotes.delete(key);
        }, duration * 1000);
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
    constructor(characterId, name, frequency, type = 'sine', envelope = 'default') {
        this.characterId = characterId;
        this.name = name;
        this.frequency = frequency;
        this.type = type;
        this.envelope = envelope;
        this.isPlaying = false;
    }

    play(audioContext) {
        this.isPlaying = true;
        audioContext.playNote(this.frequency, 0.4, this.type, this.envelope);

        setTimeout(() => {
            this.isPlaying = false;
        }, 400);
    }

    stop(audioContext) {
        this.isPlaying = false;
        audioContext.stopAll();
    }
}

class BeatSoundManager {
    constructor() {
        this.audioContext = new AudioContext();
        this.characters = new Map();
        this.initializeCharacterSounds();
        this.playbackMode = 'simultaneous'; // 'simultaneous' or 'sequential'
    }

    initializeCharacterSounds() {
        const sounds = [
            { id: 'rose', name: 'Rose', freq: 440, type: 'sine', envelope: 'pad' },           // A4
            { id: 'petalina', name: 'Petalina', freq: 494, type: 'sine', envelope: 'default' }, // B4
            { id: 'nitra', name: 'Nitra', freq: 523, type: 'triangle', envelope: 'snappy' },    // C5
            { id: 'guardian', name: 'Guardian', freq: 392, type: 'square', envelope: 'default' }, // G4
            { id: 'thunder', name: 'Thunder', freq: 587, type: 'triangle', envelope: 'snappy' }, // D5
            { id: 'dash', name: 'Dash', freq: 659, type: 'sine', envelope: 'snappy' },          // E5
            { id: 'tockay', name: 'Tockay', freq: 349, type: 'square', envelope: 'snappy' },    // F4
            { id: 'rail_girl', name: 'Rail Girl', freq: 784, type: 'sine', envelope: 'pad' }    // G5
        ];

        sounds.forEach(sound => {
            this.characters.set(sound.id, new CharacterSound(
                sound.id,
                sound.name,
                sound.freq,
                sound.type,
                sound.envelope
            ));
        });
    }

    playCharacterSound(characterId) {
        const sound = this.characters.get(characterId);
        if (sound) {
            sound.play(this.audioContext);
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

    stopAllSounds() {
        this.audioContext.stopAll();
        this.characters.forEach(sound => {
            sound.isPlaying = false;
        });
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
