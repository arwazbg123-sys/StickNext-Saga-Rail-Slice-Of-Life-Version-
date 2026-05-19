/**
 * StickNext Beat - Character Data & Management
 * Modular karakter system untuk game musik interaktif
 */

class BeatCharacter {
    constructor(id, name, emoji, color, soundUrl, bpm = 120, rhythmInterval = 1, frequency = 440, waveform = 'sine', envelope = 'default') {
        this.id = id;
        this.name = name;
        this.emoji = emoji;
        this.color = color;
        this.soundUrl = soundUrl;
        this.bpm = bpm;
        this.rhythmInterval = rhythmInterval; // Interval dalam beat (synced dengan 120 BPM base)
        this.frequency = frequency; // Tone frequency untuk konsistensi
        this.waveform = waveform; // Waveform type
        this.envelope = envelope; // Audio envelope type
        this.isActive = false;
        this.audioElement = null;
        this.isLooping = false;
        this.loopTimeout = null;
        this.audioContext = null; // Reference ke window AudioContext
    }

    createAudioElement() {
        if (!this.audioElement) {
            this.audioElement = new Audio(this.soundUrl);
            this.audioElement.volume = 0.9;
        }
        return this.audioElement;
    }

    play(useOscillator = true) {
        this.isActive = true;
        
        // Try to use oscillator first for consistency
        if (useOscillator && window.audioContextInstance) {
            try {
                const duration = 0.2; // 200ms consistent duration
                window.audioContextInstance.playNote(
                    this.frequency,
                    duration,
                    this.waveform,
                    this.envelope
                );
                return;
            } catch (e) {
                console.warn(`Oscillator failed for ${this.name}, falling back to audio element`, e);
            }
        }

        // Fallback to audio element
        const audio = this.createAudioElement();
        audio.currentTime = 0;
        audio.play().catch(e => console.log(`Audio play error for ${this.name}:`, e));
    }

    stop() {
        this.isActive = false;
        this.isLooping = false;
        
        if (this.loopTimeout) {
            clearTimeout(this.loopTimeout);
            this.loopTimeout = null;
        }
        
        if (this.audioElement) {
            this.audioElement.pause();
            this.audioElement.currentTime = 0;
        }
    }

    togglePlay() {
        if (this.isActive) {
            this.stop();
        } else {
            this.play();
        }
    }

    getAudioDuration() {
        return this.audioElement ? this.audioElement.duration : 0.2;
    }
}

class BeatCharacterManager {
    constructor() {
        this.characters = [];
        this.activeCharacters = new Set();
        this.initializeCharacters();
    }

    initializeCharacters() {
        const characterData = [
            {
                id: 'rose',
                name: 'Rose',
                emoji: '🌹',
                color: '#ff69b4',
                soundUrl: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
                bpm: 120,
                rhythmInterval: 0.5, // Beat-synced: every 2 beats (120 BPM = 1 beat = 0.5s)
                frequency: 440,    // A4
                waveform: 'sine',
                envelope: 'pad'
            },
            {
                id: 'petalina',
                name: 'Petalina',
                emoji: '🌸',
                color: '#ff1493',
                soundUrl: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
                bpm: 120,
                rhythmInterval: 0.375, // Beat-synced: every 1.5 beats
                frequency: 554,    // C#5
                waveform: 'sine',
                envelope: 'default'
            },
            {
                id: 'nitra',
                name: 'Nitra',
                emoji: '⚡',
                color: '#00bfff',
                soundUrl: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
                bpm: 120,
                rhythmInterval: 0.25, // Beat-synced: every beat
                frequency: 659,    // E5
                waveform: 'square',
                envelope: 'snappy'
            },
            {
                id: 'guardian',
                name: 'Guardian',
                emoji: '🛡️',
                color: '#32cd32',
                soundUrl: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
                bpm: 120,
                rhythmInterval: 1.0, // Beat-synced: every 4 beats
                frequency: 330,    // E4
                waveform: 'sine',
                envelope: 'pad'
            },
            {
                id: 'thunder',
                name: 'Thunder',
                emoji: '⚙️',
                color: '#ffd700',
                soundUrl: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
                bpm: 120,
                rhythmInterval: 0.1875, // Beat-synced: every 0.75 beats
                frequency: 784,    // G5
                waveform: 'square',
                envelope: 'staccato'
            },
            {
                id: 'dash',
                name: 'Dash',
                emoji: '💨',
                color: '#00ff00',
                soundUrl: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
                bpm: 120,
                rhythmInterval: 0.75, // Beat-synced: every 3 beats
                frequency: 494,    // B4
                waveform: 'sine',
                envelope: 'snappy'
            },
            {
                id: 'tockay',
                name: 'Tockay',
                emoji: '⏰',
                color: '#ff4500',
                soundUrl: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
                bpm: 120,
                rhythmInterval: 0.375, // Beat-synced: every 1.5 beats
                frequency: 587,    // D5
                waveform: 'square',
                envelope: 'snappy'
            },
            {
                id: 'rail_girl',
                name: 'Rail Girl',
                emoji: '🚂',
                color: '#ff00ff',
                soundUrl: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
                bpm: 120,
                rhythmInterval: 0.5, // Beat-synced: every 2 beats
                frequency: 392,    // G4
                waveform: 'sine',
                envelope: 'default'
            }
        ];

        characterData.forEach(data => {
            this.characters.push(new BeatCharacter(
                data.id,
                data.name,
                data.emoji,
                data.color,
                data.soundUrl,
                data.bpm,
                data.rhythmInterval,
                data.frequency,
                data.waveform,
                data.envelope
            ));
        });
    }

    getCharacter(id) {
        return this.characters.find(char => char.id === id);
    }

    getAllCharacters() {
        return this.characters;
    }

    playCharacter(id) {
        const character = this.getCharacter(id);
        if (character) {
            character.play();
            this.activeCharacters.add(id);
            return true;
        }
        return false;
    }

    stopCharacter(id) {
        const character = this.getCharacter(id);
        if (character) {
            character.stop();
            this.activeCharacters.delete(id);
            return true;
        }
        return false;
    }

    stopAll() {
        this.characters.forEach(char => char.stop());
        this.activeCharacters.clear();
    }

    getActiveCount() {
        return this.activeCharacters.size;
    }

    isCharacterActive(id) {
        return this.activeCharacters.has(id);
    }

    getCharacterStatus() {
        return {
            total: this.characters.length,
            active: this.activeCharacters.size,
            characters: this.characters.map(char => ({
                id: char.id,
                name: char.name,
                isActive: this.isCharacterActive(char.id)
            }))
        };
    }

    // Preset untuk kombinasi karakter (future feature)
    createPreset(characterIds, name) {
        return {
            name: name,
            characterIds: characterIds,
            createdAt: new Date().toISOString()
        };
    }
}

// Initialize global instance
window.beatCharacterManager = new BeatCharacterManager();
