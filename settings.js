/* ===================================
   STICKNEXT RAIL SAGA - SETTINGS
   Theme & Preference Management
   =================================== */

class ThemeManager {
    constructor() {
        this.themes = {
            light: {
                name: 'Light',
                colors: {
                    primaryBg: '#fafaf8',
                    secondaryBg: '#ffffff',
                    textPrimary: '#1a1a1a',
                    textSecondary: '#666666',
                    textTertiary: '#888888',
                    borderColor: '#e8e8e0',
                },
            },
            dark: {
                name: 'Dark',
                colors: {
                    primaryBg: '#0f0f0f',
                    secondaryBg: '#1a1a1a',
                    textPrimary: '#ffffff',
                    textSecondary: '#e0e0e0',
                    textTertiary: '#b0b0b0',
                    borderColor: '#333333',
                },
            },
            gray: {
                name: 'Gray',
                colors: {
                    primaryBg: '#f5f5f5',
                    secondaryBg: '#e8e8e8',
                    textPrimary: '#2a2a2a',
                    textSecondary: '#555555',
                    textTertiary: '#777777',
                    borderColor: '#d0d0d0',
                },
            },
        };

        this.defaults = {
            theme: 'light',
            fontSize: 100, // percentage
            spacing: 100, // percentage
            customColor: null,
        };

        this.settings = this.loadSettings();
        this.initializeTheme();
    }

    // ===== STORAGE =====
    loadSettings() {
        const saved = localStorage.getItem('gallerySettings');
        if (!saved) {
            localStorage.setItem('gallerySettings', JSON.stringify(this.defaults));
            return { ...this.defaults };
        }
        return JSON.parse(saved);
    }

    saveSettings() {
        localStorage.setItem('gallerySettings', JSON.stringify(this.settings));
    }

    // ===== THEME APPLICATION =====
    initializeTheme() {
        this.applyTheme(this.settings.theme);
        this.applyFontSize(this.settings.fontSize);
        this.applySpacing(this.settings.spacing);
    }

    applyTheme(themeName) {
        const theme = this.themes[themeName];
        if (!theme) return;

        const root = document.documentElement;
        
        Object.entries(theme.colors).forEach(([key, value]) => {
            const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
            root.style.setProperty(cssVar, value);
        });

        this.settings.theme = themeName;
        this.saveSettings();

        // Update active button
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === themeName) {
                btn.classList.add('active');
            }
        });
    }

    applyFontSize(percentage) {
        const root = document.documentElement;
        root.style.fontSize = (16 * percentage / 100) + 'px';
        
        this.settings.fontSize = percentage;
        this.saveSettings();

        // Update slider display
        const slider = document.getElementById('fontSizeSlider');
        if (slider) {
            slider.value = percentage;
        }
        const display = document.getElementById('fontSizeDisplay');
        if (display) {
            display.textContent = percentage + '%';
        }
    }

    applySpacing(percentage) {
        const root = document.documentElement;
        root.style.setProperty('--spacing-factor', percentage / 100);
        
        this.settings.spacing = percentage;
        this.saveSettings();

        // Update slider display
        const slider = document.getElementById('spacingSlider');
        if (slider) {
            slider.value = percentage;
        }
        const display = document.getElementById('spacingDisplay');
        if (display) {
            display.textContent = percentage + '%';
        }
    }

    // ===== CUSTOM COLOR =====
    setCustomTheme(primaryBg, secondaryBg, textPrimary, textSecondary, textTertiary, borderColor) {
        const root = document.documentElement;
        
        root.style.setProperty('--primary-bg', primaryBg);
        root.style.setProperty('--secondary-bg', secondaryBg);
        root.style.setProperty('--text-primary', textPrimary);
        root.style.setProperty('--text-secondary', textSecondary);
        root.style.setProperty('--text-tertiary', textTertiary);
        root.style.setProperty('--border-color', borderColor);

        this.settings.theme = 'custom';
        this.settings.customColor = {
            primaryBg,
            secondaryBg,
            textPrimary,
            textSecondary,
            textTertiary,
            borderColor,
        };
        this.saveSettings();

        // Mark custom as active
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        const customBtn = document.querySelector('[data-theme="custom"]');
        if (customBtn) {
            customBtn.classList.add('active');
        }
    }

    // ===== RESTORE CUSTOM =====
    restoreCustomTheme() {
        if (this.settings.customColor) {
            const colors = this.settings.customColor;
            this.setCustomTheme(
                colors.primaryBg,
                colors.secondaryBg,
                colors.textPrimary,
                colors.textSecondary,
                colors.textTertiary,
                colors.borderColor
            );
        }
    }
}

// ===== SETTINGS UI MANAGER =====
class SettingsUI {
    constructor(themeManager) {
        this.themeManager = themeManager;
        this.initializeUI();
    }

    initializeUI() {
        this.createSettingsButton();
        this.createSettingsPanel();
        this.attachEventListeners();
    }

    createSettingsButton() {
        if (document.getElementById('settingsBtn')) return;

        const btn = document.createElement('button');
        btn.id = 'settingsBtn';
        btn.className = 'settings-btn';
        btn.title = 'Pengaturan';
        btn.innerHTML = '⚙️';
        btn.setAttribute('aria-label', 'Buka pengaturan');

        document.body.appendChild(btn);
    }

    createSettingsPanel() {
        if (document.getElementById('settingsPanel')) return;

        const panel = document.createElement('div');
        panel.id = 'settingsPanel';
        panel.className = 'settings-panel';
        panel.innerHTML = `
            <div class="settings-content">
                <div class="settings-header">
                    <h2>Pengaturan</h2>
                    <button class="settings-close" id="settingsClose">✕</button>
                </div>

                <!-- Theme Selection -->
                <div class="settings-section">
                    <h3>Tema</h3>
                    <div class="theme-grid">
                        <button class="theme-btn ${this.themeManager.settings.theme === 'light' ? 'active' : ''}" data-theme="light" title="Terang">
                            <span class="theme-preview light"></span>
                            <span>Terang</span>
                        </button>
                        <button class="theme-btn ${this.themeManager.settings.theme === 'dark' ? 'active' : ''}" data-theme="dark" title="Gelap">
                            <span class="theme-preview dark"></span>
                            <span>Gelap</span>
                        </button>
                        <button class="theme-btn ${this.themeManager.settings.theme === 'gray' ? 'active' : ''}" data-theme="gray" title="Abu-abu">
                            <span class="theme-preview gray"></span>
                            <span>Abu-abu</span>
                        </button>
                        <button class="theme-btn ${this.themeManager.settings.theme === 'custom' ? 'active' : ''}" data-theme="custom" title="Custom">
                            <span class="theme-preview custom"></span>
                            <span>Custom</span>
                        </button>
                    </div>
                </div>

                <!-- Font Size -->
                <div class="settings-section">
                    <h3>Ukuran Font</h3>
                    <div class="slider-group">
                        <input type="range" id="fontSizeSlider" min="80" max="150" value="${this.themeManager.settings.fontSize}" class="settings-slider">
                        <span id="fontSizeDisplay" class="slider-display">${this.themeManager.settings.fontSize}%</span>
                    </div>
                    <p class="settings-hint">80% - 150%</p>
                </div>

                <!-- Spacing -->
                <div class="settings-section">
                    <h3>Jarak Spasi</h3>
                    <div class="slider-group">
                        <input type="range" id="spacingSlider" min="80" max="150" value="${this.themeManager.settings.spacing}" class="settings-slider">
                        <span id="spacingDisplay" class="slider-display">${this.themeManager.settings.spacing}%</span>
                    </div>
                    <p class="settings-hint">80% - 150%</p>
                </div>

                <!-- Custom Color Picker -->
                <div class="settings-section" id="customColorSection" style="display: ${this.themeManager.settings.theme === 'custom' ? 'block' : 'none'};">
                    <h3>Warna Custom</h3>
                    
                    <div class="color-input-group">
                        <label>Latar Belakang Utama</label>
                        <input type="color" id="customPrimaryBg" value="${this.themeManager.settings.customColor?.primaryBg || '#fafaf8'}">
                    </div>

                    <div class="color-input-group">
                        <label>Latar Belakang Sekunder</label>
                        <input type="color" id="customSecondaryBg" value="${this.themeManager.settings.customColor?.secondaryBg || '#ffffff'}">
                    </div>

                    <div class="color-input-group">
                        <label>Teks Utama</label>
                        <input type="color" id="customTextPrimary" value="${this.themeManager.settings.customColor?.textPrimary || '#1a1a1a'}">
                    </div>

                    <div class="color-input-group">
                        <label>Teks Sekunder</label>
                        <input type="color" id="customTextSecondary" value="${this.themeManager.settings.customColor?.textSecondary || '#666666'}">
                    </div>

                    <div class="color-input-group">
                        <label>Teks Tersier</label>
                        <input type="color" id="customTextTertiary" value="${this.themeManager.settings.customColor?.textTertiary || '#888888'}">
                    </div>

                    <div class="color-input-group">
                        <label>Warna Border</label>
                        <input type="color" id="customBorderColor" value="${this.themeManager.settings.customColor?.borderColor || '#e8e8e0'}">
                    </div>

                    <button id="applyCustomColors" class="apply-btn">Terapkan Warna Custom</button>
                </div>

                <!-- Reset Button -->
                <div class="settings-section">
                    <button id="resetSettings" class="reset-btn">🔄 Reset Pengaturan Default</button>
                </div>

                <div class="settings-footer">
                    <p>Pengaturan disimpan otomatis</p>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
    }

    attachEventListeners() {
        // Settings toggle
        const settingsBtn = document.getElementById('settingsBtn');
        const settingsPanel = document.getElementById('settingsPanel');
        const settingsClose = document.getElementById('settingsClose');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                settingsPanel.classList.toggle('active');
            });
        }

        if (settingsClose) {
            settingsClose.addEventListener('click', () => {
                settingsPanel.classList.remove('active');
            });
        }

        // Close on backdrop click
        settingsPanel.addEventListener('click', (e) => {
            if (e.target === settingsPanel) {
                settingsPanel.classList.remove('active');
            }
        });

        // Theme buttons
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                if (theme === 'custom') {
                    document.getElementById('customColorSection').style.display = 'block';
                    this.themeManager.restoreCustomTheme();
                } else {
                    document.getElementById('customColorSection').style.display = 'none';
                    this.themeManager.applyTheme(theme);
                }
            });
        });

        // Font size slider
        const fontSizeSlider = document.getElementById('fontSizeSlider');
        if (fontSizeSlider) {
            fontSizeSlider.addEventListener('input', (e) => {
                this.themeManager.applyFontSize(parseInt(e.target.value));
            });
        }

        // Spacing slider
        const spacingSlider = document.getElementById('spacingSlider');
        if (spacingSlider) {
            spacingSlider.addEventListener('input', (e) => {
                this.themeManager.applySpacing(parseInt(e.target.value));
            });
        }

        // Custom color apply
        const applyBtn = document.getElementById('applyCustomColors');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const primaryBg = document.getElementById('customPrimaryBg').value;
                const secondaryBg = document.getElementById('customSecondaryBg').value;
                const textPrimary = document.getElementById('customTextPrimary').value;
                const textSecondary = document.getElementById('customTextSecondary').value;
                const textTertiary = document.getElementById('customTextTertiary').value;
                const borderColor = document.getElementById('customBorderColor').value;

                this.themeManager.setCustomTheme(
                    primaryBg,
                    secondaryBg,
                    textPrimary,
                    textSecondary,
                    textTertiary,
                    borderColor
                );

                alert('Warna custom telah diterapkan!');
            });
        }

        // Reset settings
        const resetBtn = document.getElementById('resetSettings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (confirm('Apakah Anda yakin ingin mereset semua pengaturan ke default?')) {
                    localStorage.removeItem('gallerySettings');
                    location.reload();
                }
            });
        }
    }
}

// ===== INITIALIZE =====
let themeManager, settingsUI;

document.addEventListener('DOMContentLoaded', () => {
    themeManager = new ThemeManager();
    settingsUI = new SettingsUI(themeManager);

    // Log initialization
    console.log('⚙️ Settings manager initialized');
    console.log('Current theme:', themeManager.settings.theme);
});

// Make globally available
window.themeManager = () => themeManager;
