/**
 * StickNext Beat - Character Data & Management
 * Modular karakter system untuk game musik interaktif
 */

class BeatCharacter {
    constructor(id, name, emoji, color, soundUrl, bpm = 120) {
        this.id = id;
        this.name = name;
        this.emoji = emoji;
        this.color = color;
        this.soundUrl = soundUrl;
        this.bpm = bpm;
        this.isActive = false;
        this.audioElement = null;
    }

    createAudioElement() {
        if (!this.audioElement) {
            this.audioElement = new Audio(this.soundUrl);
            this.audioElement.volume = 1;
        }
        return this.audioElement;
    }

    play() {
        this.isActive = true;
        const audio = this.createAudioElement();
        audio.currentTime = 0;
        audio.play().catch(e => console.log(`Audio play error for ${this.name}:`, e));
    }

    stop() {
        this.isActive = false;
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
        return this.audioElement ? this.audioElement.duration : 0;
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
                bpm: 120
            },
            {
                id: 'petalina',
                name: 'Petalina',
                emoji: '🌸',
                color: '#ff1493',
                soundUrl: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
                bpm: 115
            },
            {
                id: 'nitra',
                name: 'Nitra',
                emoji: '⚡',
                color: '#00bfff',
                soundUrl: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
                bpm: 130
            },
            {
                id: 'guardian',
                name: 'Guardian',
                emoji: '🛡️',
                color: '#32cd32',
                soundUrl: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
                bpm: 100
            },
            {
                id: 'thunder',
                name: 'Thunder',
                emoji: '⚙️',
                color: '#ffd700',
                soundUrl: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
                bpm: 140
            },
            {
                id: 'dash',
                name: 'Dash',
                emoji: '💨',
                color: '#00ff00',
                soundUrl: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
                bpm: 125
            },
            {
                id: 'tockay',
                name: 'Tockay',
                emoji: '⏰',
                color: '#ff4500',
                soundUrl: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
                bpm: 110
            },
            {
                id: 'rail_girl',
                name: 'Rail Girl',
                emoji: '🚂',
                color: '#ff00ff',
                soundUrl: 'data:audio/wav;base64,UklGRiYAAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIAAAAAAA==',
                bpm: 135
            }
        ];

        characterData.forEach(data => {
            this.characters.push(new BeatCharacter(
                data.id,
                data.name,
                data.emoji,
                data.color,
                data.soundUrl,
                data.bpm
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
