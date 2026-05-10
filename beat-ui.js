/**
 * StickNext Beat - UI & Interaction Management
 * Modular UI system untuk game musik interaktif
 */

class BeatUIManager {
    constructor() {
        this.selectedCharacters = new Set();
        this.gameState = 'idle'; // idle, playing, paused
        this.beatContainer = null;
        this.controlPanel = null;
        this.soundManager = window.beatSoundManager;
    }

    initializeUI() {
        this.createCharacterGrid();
        this.createControlPanel();
        this.setupEventListeners();
        this.attachSmartProtection();
    }

    createCharacterGrid() {
        const gridHTML = `
            <div class="beat-grid" id="beatGrid">
                ${window.beatCharacterManager.getAllCharacters().map(char => `
                    <div class="character-box" data-character-id="${char.id}">
                        <div class="character-box-inner">
                            <div class="character-visual" style="background: ${char.color}20; border: 2px solid ${char.color}; color: ${char.color};">
                                <div class="character-emoji">${char.emoji}</div>
                                <div class="character-name">${char.name}</div>
                                <div class="character-status">
                                    <span class="status-indicator"></span>
                                    <span class="status-text">Idle</span>
                                </div>
                            </div>
                            <div class="character-glow" style="box-shadow: 0 0 0 2px ${char.color}40;"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        this.beatContainer = document.getElementById('beatContainer');
        if (this.beatContainer) {
            this.beatContainer.innerHTML = gridHTML;
        }
    }

    createControlPanel() {
        const controlHTML = `
            <div class="beat-controls" id="beatControls">
                <div class="control-section">
                    <div class="control-header">🎵 BEAT CONTROLLER</div>
                    
                    <div class="control-buttons">
                        <button class="control-btn play-btn" id="playBtn" title="Play all selected">
                            ▶ Play
                        </button>
                        <button class="control-btn pause-btn" id="pauseBtn" title="Pause">
                            ⏸ Pause
                        </button>
                        <button class="control-btn stop-btn" id="stopBtn" title="Stop all">
                            ⏹ Stop
                        </button>
                        <button class="control-btn clear-btn" id="clearBtn" title="Clear selection">
                            🗑 Clear
                        </button>
                    </div>

                    <div class="control-info">
                        <div class="info-item">
                            <span class="info-label">Selected:</span>
                            <span class="info-value" id="selectedCount">0</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Playing:</span>
                            <span class="info-value" id="playingCount">0</span>
                        </div>
                    </div>

                    <div class="volume-control">
                        <label for="volumeSlider">Volume:</label>
                        <input type="range" id="volumeSlider" min="0" max="100" value="80" class="volume-slider">
                        <span class="volume-value" id="volumeValue">80%</span>
                    </div>

                    <div class="control-footer">
                        <small>Klik kotak untuk memilih, tekan Play untuk memainkan musik</small>
                    </div>
                </div>
            </div>
        `;

        const controlContainer = document.getElementById('controlContainer');
        if (controlContainer) {
            controlContainer.innerHTML = controlHTML;
        }
    }

    setupEventListeners() {
        // Character box clicks
        document.addEventListener('click', (e) => {
            const characterBox = e.target.closest('.character-box');
            if (characterBox) {
                const characterId = characterBox.dataset.characterId;
                this.toggleCharacterSelection(characterId, characterBox);
            }
        });

        // Control buttons
        document.getElementById('playBtn')?.addEventListener('click', () => this.playSelected());
        document.getElementById('pauseBtn')?.addEventListener('click', () => this.pauseAll());
        document.getElementById('stopBtn')?.addEventListener('click', () => this.stopAll());
        document.getElementById('clearBtn')?.addEventListener('click', () => this.clearSelection());

        // Volume control
        document.getElementById('volumeSlider')?.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            this.soundManager.setMasterVolume(volume);
            document.getElementById('volumeValue').textContent = e.target.value + '%';
        });
    }

    toggleCharacterSelection(characterId, element) {
        if (this.selectedCharacters.has(characterId)) {
            this.selectedCharacters.delete(characterId);
            element.classList.remove('selected');
            element.querySelector('.status-text').textContent = 'Idle';
        } else {
            this.selectedCharacters.add(characterId);
            element.classList.add('selected');
            element.querySelector('.status-text').textContent = 'Selected';
            
            // Play sound immediately on selection
            this.soundManager.playCharacterSound(characterId);
            this.updateCharacterStatus(characterId, 'Playing');
            
            setTimeout(() => {
                if (this.selectedCharacters.has(characterId)) {
                    this.updateCharacterStatus(characterId, 'Selected');
                }
            }, 400);
        }

        this.updateInfoPanel();
    }

    playSelected() {
        if (this.selectedCharacters.size === 0) {
            this.showNotification('Silakan pilih minimal 1 karakter');
            return;
        }

        this.gameState = 'playing';
        this.selectedCharacters.forEach(characterId => {
            this.soundManager.playCharacterSound(characterId);
            this.updateCharacterStatus(characterId, 'Playing');
        });

        setTimeout(() => {
            if (this.gameState === 'playing') {
                this.selectedCharacters.forEach(characterId => {
                    this.updateCharacterStatus(characterId, 'Selected');
                });
            }
        }, 400);

        this.updateInfoPanel();
    }

    pauseAll() {
        this.gameState = 'paused';
        this.soundManager.stopAllSounds();
        this.selectedCharacters.forEach(characterId => {
            this.updateCharacterStatus(characterId, 'Paused');
        });
    }

    stopAll() {
        this.gameState = 'idle';
        this.soundManager.stopAllSounds();
        this.selectedCharacters.forEach(characterId => {
            const element = document.querySelector(`[data-character-id="${characterId}"]`);
            if (element) {
                element.querySelector('.status-text').textContent = 'Selected';
            }
        });
    }

    clearSelection() {
        this.stopAll();
        this.selectedCharacters.clear();
        
        document.querySelectorAll('.character-box').forEach(box => {
            box.classList.remove('selected');
            box.querySelector('.status-text').textContent = 'Idle';
        });

        this.updateInfoPanel();
        this.showNotification('Pilihan sudah dihapus');
    }

    updateCharacterStatus(characterId, status) {
        const element = document.querySelector(`[data-character-id="${characterId}"]`);
        if (element) {
            const statusText = element.querySelector('.status-text');
            const statusIndicator = element.querySelector('.status-indicator');
            
            statusText.textContent = status;
            
            if (status === 'Playing') {
                statusIndicator.classList.add('pulse');
            } else {
                statusIndicator.classList.remove('pulse');
            }
        }
    }

    updateInfoPanel() {
        document.getElementById('selectedCount').textContent = this.selectedCharacters.size;
        document.getElementById('playingCount').textContent = this.countPlayingCharacters();
    }

    countPlayingCharacters() {
        return Array.from(this.selectedCharacters).filter(id => {
            const element = document.querySelector(`[data-character-id="${id}"]`);
            return element?.querySelector('.status-text').textContent === 'Playing';
        }).length;
    }

    showNotification(message) {
        const notif = document.createElement('div');
        notif.className = 'beat-notification';
        notif.textContent = message;
        document.body.appendChild(notif);

        setTimeout(() => notif.classList.add('show'), 10);
        setTimeout(() => {
            notif.classList.remove('show');
            setTimeout(() => notif.remove(), 300);
        }, 2000);
    }

    attachSmartProtection() {
        // Auto-integrate with SmartProtectionSystem if available
        if (window.smartProtection) {
            console.log('🛡️ SmartProtection integrated with Beat Game');
        }
    }
}

// Initialize global instance
window.beatUIManager = new BeatUIManager();
