/**
 * StickNext Beat - Character Melodies (Base64 WAV Format)
 * Setiap karakter memiliki melodi unik yang berirama dan bermelodi
 * Format: WAV PCM 16-bit, 44100 Hz, Mono, durasi ~3 detik
 */

class MelodyGenerator {
    constructor() {
        this.sampleRate = 44100;
    }

    /**
     * Generate WAV dari sequence of notes dengan durasi
     * @param {Array} noteSequence - [{frequency, duration}, ...]
     * @param {number} amplitude - Volume (0-1)
     * @returns {string} Base64 encoded WAV
     */
    generateWAV(noteSequence, amplitude = 0.6) {
        const samples = [];
        
        noteSequence.forEach(({ frequency, duration }) => {
            const numSamples = Math.floor(duration * this.sampleRate);
            for (let i = 0; i < numSamples; i++) {
                const t = i / this.sampleRate;
                // Sine wave dengan envelope ADSR sederhana
                const phase = 2 * Math.PI * frequency * t;
                const sample = Math.sin(phase) * amplitude;
                
                // Envelope: Attack (0.1s), Release (0.2s)
                let envelope = 1;
                if (t < 0.1) {
                    envelope = t / 0.1; // Attack
                } else if (t > duration - 0.2) {
                    envelope = (duration - t) / 0.2; // Release
                }
                
                samples.push(sample * envelope);
            }
        });

        // Convert ke 16-bit PCM
        const pcm = new Int16Array(samples.length);
        for (let i = 0; i < samples.length; i++) {
            pcm[i] = Math.max(-32768, Math.min(32767, samples[i] * 32767));
        }

        // Create WAV header
        const wav = this.createWAVBuffer(pcm);
        return this.bufferToBase64(wav);
    }

    createWAVBuffer(pcm) {
        const channels = 1;
        const sampleRate = this.sampleRate;
        const bytesPerSample = 2;
        const dataLength = pcm.length * bytesPerSample;

        const buffer = new ArrayBuffer(44 + dataLength);
        const view = new DataView(buffer);

        // WAV header
        const writeString = (offset, string) => {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        };

        writeString(0, 'RIFF');
        view.setUint32(4, 36 + dataLength, true);
        writeString(8, 'WAVE');
        writeString(12, 'fmt ');
        view.setUint32(16, 16, true); // fmt chunk size
        view.setUint16(20, 1, true); // PCM format
        view.setUint16(22, channels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * channels * bytesPerSample, true);
        view.setUint16(32, channels * bytesPerSample, true);
        view.setUint16(34, 8 * bytesPerSample, true);

        writeString(36, 'data');
        view.setUint32(40, dataLength, true);

        // PCM data
        let offset = 44;
        for (let i = 0; i < pcm.length; i++) {
            view.setInt16(offset, pcm[i], true);
            offset += 2;
        }

        return buffer;
    }

    bufferToBase64(buffer) {
        const bytes = new Uint8Array(buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }
}

/**
 * CHARACTER MELODIES - Setiap melodi unik dan berirama
 * Melodi dirancang untuk seamless looping
 */
const CHARACTER_MELODIES = (() => {
    const gen = new MelodyGenerator();

    return {
        // 🌹 ROSE - Melodi lembut, romantic, C major
        rose: gen.generateWAV([
            { frequency: 262, duration: 0.3 },  // C4
            { frequency: 294, duration: 0.2 },  // D4
            { frequency: 330, duration: 0.3 },  // E4
            { frequency: 262, duration: 0.2 },  // C4
            { frequency: 349, duration: 0.3 },  // F4
            { frequency: 330, duration: 0.4 },  // E4
            { frequency: 294, duration: 0.3 },  // D4
            { frequency: 262, duration: 0.2 },  // C4
        ], 0.6),

        // 🌸 PETALINA - Melodi ceria, G major
        petalina: gen.generateWAV([
            { frequency: 392, duration: 0.2 },  // G4
            { frequency: 440, duration: 0.2 },  // A4
            { frequency: 494, duration: 0.3 },  // B4
            { frequency: 523, duration: 0.2 },  // C5
            { frequency: 494, duration: 0.3 },  // B4
            { frequency: 440, duration: 0.2 },  // A4
            { frequency: 392, duration: 0.3 },  // G4
        ], 0.6),

        // ⚡ NITRA - Melodi energik, fast-paced
        nitra: gen.generateWAV([
            { frequency: 523, duration: 0.15 }, // C5
            { frequency: 587, duration: 0.15 }, // D5
            { frequency: 659, duration: 0.15 }, // E5
            { frequency: 523, duration: 0.15 }, // C5
            { frequency: 587, duration: 0.15 }, // D5
            { frequency: 659, duration: 0.15 }, // E5
            { frequency: 523, duration: 0.3 },  // C5
        ], 0.65),

        // 🛡️ GUARDIAN - Melodi dalam, penuh karakter
        guardian: gen.generateWAV([
            { frequency: 196, duration: 0.3 },  // G3
            { frequency: 220, duration: 0.2 },  // A3
            { frequency: 247, duration: 0.3 },  // B3
            { frequency: 196, duration: 0.2 },  // G3
            { frequency: 262, duration: 0.3 },  // C4
            { frequency: 247, duration: 0.3 },  // B3
            { frequency: 220, duration: 0.2 },  // A3
        ], 0.65),

        // ⚙️ THUNDER - Melodi bergetaran, industrial
        thunder: gen.generateWAV([
            { frequency: 587, duration: 0.15 }, // D5
            { frequency: 659, duration: 0.15 }, // E5
            { frequency: 587, duration: 0.15 }, // D5
            { frequency: 659, duration: 0.15 }, // E5
            { frequency: 740, duration: 0.2 },  // F#5
            { frequency: 659, duration: 0.15 }, // E5
            { frequency: 587, duration: 0.2 },  // D5
        ], 0.65),

        // 💨 DASH - Melodi cepat, menyenangkan
        dash: gen.generateWAV([
            { frequency: 659, duration: 0.2 },  // E5
            { frequency: 740, duration: 0.2 },  // F#5
            { frequency: 823, duration: 0.2 },  // G#5
            { frequency: 659, duration: 0.2 },  // E5
            { frequency: 740, duration: 0.2 },  // F#5
            { frequency: 823, duration: 0.3 },  // G#5
        ], 0.6),

        // ⏰ TOCKAY - Melodi tick-tock, rhythmic
        tockay: gen.generateWAV([
            { frequency: 349, duration: 0.15 }, // F4
            { frequency: 392, duration: 0.15 }, // G4
            { frequency: 349, duration: 0.15 }, // F4
            { frequency: 392, duration: 0.15 }, // G4
            { frequency: 440, duration: 0.2 },  // A4
            { frequency: 392, duration: 0.15 }, // G4
            { frequency: 349, duration: 0.15 }, // F4
        ], 0.6),

        // 🚂 RAIL_GIRL - Melodi tinggi, futuristik
        rail_girl: gen.generateWAV([
            { frequency: 784, duration: 0.2 },  // G5
            { frequency: 880, duration: 0.2 },  // A5
            { frequency: 784, duration: 0.2 },  // G5
            { frequency: 988, duration: 0.2 },  // B5
            { frequency: 880, duration: 0.3 },  // A5
            { frequency: 784, duration: 0.15 }, // G5
            { frequency: 698, duration: 0.15 }, // F5
        ], 0.55),
    };
})();

/**
 * CHARACTER MELODY METADATA
 */
const MELODY_INFO = {
    rose: { name: 'Rose', emoji: '🌹', tempo: 'Slow', mood: 'Romantic' },
    petalina: { name: 'Petalina', emoji: '🌸', tempo: 'Happy', mood: 'Cheerful' },
    nitra: { name: 'Nitra', emoji: '⚡', tempo: 'Fast', mood: 'Energetic' },
    guardian: { name: 'Guardian', emoji: '🛡️', tempo: 'Deep', mood: 'Powerful' },
    thunder: { name: 'Thunder', emoji: '⚙️', tempo: 'Rhythmic', mood: 'Industrial' },
    dash: { name: 'Dash', emoji: '💨', tempo: 'Quick', mood: 'Playful' },
    tockay: { name: 'Tockay', emoji: '⏰', tempo: 'Ticking', mood: 'Rhythmic' },
    rail_girl: { name: 'Rail Girl', emoji: '🚂', tempo: 'Futuristic', mood: 'Modern' },
};
