/**
 * AdminStorage - Modular class untuk mengelola pesan dan data admin
 * Menyimpan data di localStorage dengan enkripsi sederhana
 */
class AdminStorage {
    constructor() {
        this.storageKey = 'sticknext_messages';
        this.settingsKey = 'sticknext_admin_settings';
        this.serviceCodeKey = 'sticknext_service_code';
        this.unlockedKey = 'sticknext_admin_unlocked';
        this.defaultPassword = 'sticknext2026'; // Password default - UBAH SESUAI KEBUTUHAN
        this.defaultServiceCode = 'PhotoVault'; // Service code - UBAH SESUAI KEBUTUHAN (case-sensitive)
        
        // Hidden pages service codes - UBAH SESUAI KEBUTUHAN
        this.hiddenPagesCode = {
            'gallery': 'GalleryX84R',      // Hidden premium gallery
            'exclusive': 'ExclusiveX2026', // Hidden exclusive content
            'analytics': 'StatsX84R'       // Hidden analytics dashboard
        };
        
        // FORCE INITIALIZE on constructor
        this.initializeAdminSettings();
    }

    /**
     * Verify service code
     */
    verifyServiceCode(code) {
        const settings = this.getAdminSettings();
        return code === settings.serviceCode;
    }

    /**
     * Set session as unlocked (valid for this browser session)
     */
    setSessionUnlocked() {
        const timestamp = Date.now();
        sessionStorage.setItem(this.unlockedKey, 'true');
        sessionStorage.setItem('sticknext_unlock_time', timestamp.toString());
        console.log('✓ Session unlocked at:', new Date(timestamp).toLocaleTimeString());
    }

    /**
     * Check if session is unlocked
     */
    isSessionUnlocked() {
        const unlocked = sessionStorage.getItem(this.unlockedKey) === 'true';
        const timestamp = sessionStorage.getItem('sticknext_unlock_time');
        
        if (!unlocked || !timestamp) {
            return false;
        }
        
        // Verify timestamp exists (anti-tampering)
        return unlocked && !!timestamp;
    }

    /**
     * Clear session unlock
     */
    clearSessionUnlock() {
        sessionStorage.removeItem(this.unlockedKey);
        sessionStorage.removeItem('sticknext_unlock_time');
        console.log('✓ Session unlock cleared');
    }

    /**
     * Add message to storage
     */
    addMessage(messageData) {
        try {
            const messages = this.getAllMessages();
            messages.push({
                ...messageData,
                id: messageData.id || Date.now(),
                read: false,
                createdAt: messageData.timestamp || new Date().toISOString()
            });
            localStorage.setItem(this.storageKey, JSON.stringify(messages));
            return true;
        } catch (error) {
            console.error('Error adding message:', error);
            return false;
        }
    }

    /**
     * Get all messages
     */
    getAllMessages() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error retrieving messages:', error);
            return [];
        }
    }

    /**
     * Get message by ID
     */
    getMessageById(id) {
        const messages = this.getAllMessages();
        return messages.find(msg => msg.id === id);
    }

    /**
     * Mark message as read
     */
    markAsRead(id) {
        try {
            const messages = this.getAllMessages();
            const message = messages.find(msg => msg.id === id);
            if (message) {
                message.read = true;
                localStorage.setItem(this.storageKey, JSON.stringify(messages));
            }
            return true;
        } catch (error) {
            console.error('Error marking as read:', error);
            return false;
        }
    }

    /**
     * Delete message
     */
    deleteMessage(id) {
        try {
            const messages = this.getAllMessages().filter(msg => msg.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(messages));
            return true;
        } catch (error) {
            console.error('Error deleting message:', error);
            return false;
        }
    }

    /**
     * Clear all messages
     */
    clearAllMessages() {
        try {
            if (confirm('Apakah Anda yakin ingin menghapus SEMUA pesan? Tindakan ini tidak dapat dibatalkan.')) {
                localStorage.removeItem(this.storageKey);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error clearing messages:', error);
            return false;
        }
    }

    /**
     * Export messages as JSON
     */
    exportMessages() {
        const messages = this.getAllMessages();
        const dataStr = JSON.stringify(messages, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `messages-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
    }

    /**
     * Get unread message count
     */
    getUnreadCount() {
        const messages = this.getAllMessages();
        return messages.filter(msg => !msg.read).length;
    }

    /**
     * Search messages
     */
    searchMessages(query) {
        const messages = this.getAllMessages();
        const lowerQuery = query.toLowerCase();
        return messages.filter(msg => 
            msg.name.toLowerCase().includes(lowerQuery) ||
            msg.email.toLowerCase().includes(lowerQuery) ||
            msg.phone.toLowerCase().includes(lowerQuery) ||
            msg.subject.toLowerCase().includes(lowerQuery) ||
            msg.message.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Verify admin password
     */
    verifyPassword(password) {
        // Simple password verification - untuk keamanan lebih baik, gunakan hash
        const adminSettings = this.getAdminSettings();
        return password === adminSettings.password;
    }

    /**
     * Get admin settings
     */
    getAdminSettings() {
        try {
            const data = localStorage.getItem(this.settingsKey);
            
            if (data) {
                const settings = JSON.parse(data);
                
                // Ensure all required fields exist
                if (!settings.password) settings.password = this.defaultPassword;
                if (!settings.serviceCode) settings.serviceCode = this.defaultServiceCode;
                
                return settings;
            }
            
            // Fallback: create and save default
            const defaultSettings = {
                password: this.defaultPassword,
                serviceCode: this.defaultServiceCode,
                createdAt: new Date().toISOString()
            };
            localStorage.setItem(this.settingsKey, JSON.stringify(defaultSettings));
            return defaultSettings;
            
        } catch (error) {
            console.error('Error getting admin settings:', error);
            // Return default if error
            return {
                password: this.defaultPassword,
                serviceCode: this.defaultServiceCode,
                createdAt: new Date().toISOString()
            };
        }
    }

    /**
     * Initialize admin settings if not exist
     */
    initializeAdminSettings() {
        try {
            const existing = localStorage.getItem(this.settingsKey);
            
            if (!existing) {
                const defaultSettings = {
                    password: this.defaultPassword,
                    serviceCode: this.defaultServiceCode,
                    createdAt: new Date().toISOString()
                };
                localStorage.setItem(this.settingsKey, JSON.stringify(defaultSettings));
                console.log('✓ Admin settings initialized:', defaultSettings);
            } else {
                // Verify existing data has serviceCode
                const data = JSON.parse(existing);
                if (!data.serviceCode) {
                    data.serviceCode = this.defaultServiceCode;
                    localStorage.setItem(this.settingsKey, JSON.stringify(data));
                    console.log('✓ Admin settings updated with serviceCode');
                }
            }
        } catch (error) {
            console.error('Error initializing admin settings:', error);
            // Force reset if corrupted
            try {
                const defaultSettings = {
                    password: this.defaultPassword,
                    serviceCode: this.defaultServiceCode,
                    createdAt: new Date().toISOString()
                };
                localStorage.setItem(this.settingsKey, JSON.stringify(defaultSettings));
                console.log('✓ Admin settings force reset');
            } catch (e) {
                console.error('Critical error in admin initialization:', e);
            }
        }
    }

    /**
     * Change admin password
     */
    changePassword(oldPassword, newPassword) {
        try {
            if (!this.verifyPassword(oldPassword)) {
                return { success: false, message: 'Password lama tidak sesuai' };
            }
            if (newPassword.length < 6) {
                return { success: false, message: 'Password baru minimal 6 karakter' };
            }
            const settings = this.getAdminSettings();
            settings.password = newPassword;
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return { success: true, message: 'Password berhasil diubah' };
        } catch (error) {
            return { success: false, message: 'Gagal mengubah password' };
        }
    }

    /**
     * Change service code
     */
    changeServiceCode(newCode) {
        try {
            if (newCode.length < 3) {
                return { success: false, message: 'Service code minimal 3 karakter' };
            }
            const settings = this.getAdminSettings();
            settings.serviceCode = newCode;
            localStorage.setItem(this.settingsKey, JSON.stringify(settings));
            return { success: true, message: 'Service code berhasil diubah' };
        } catch (error) {
            return { success: false, message: 'Gagal mengubah service code' };
        }
    }

    /**
     * Format date untuk display
     */
    formatDate(isoString) {
        const date = new Date(isoString);
        return date.toLocaleString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Verify hidden page service code
     */
    verifyHiddenPageCode(pageType, code) {
        if (!this.hiddenPagesCode[pageType]) {
            return false;
        }
        return code === this.hiddenPagesCode[pageType];
    }

    /**
     * Set session for hidden page
     */
    setHiddenPageSession(pageType) {
        const timestamp = Date.now();
        sessionStorage.setItem(`sticknext_${pageType}_unlocked`, 'true');
        sessionStorage.setItem(`sticknext_${pageType}_unlock_time`, timestamp.toString());
        console.log(`✓ ${pageType} session unlocked at:`, new Date(timestamp).toLocaleTimeString());
    }

    /**
     * Check if hidden page session is unlocked
     */
    isHiddenPageUnlocked(pageType) {
        const unlocked = sessionStorage.getItem(`sticknext_${pageType}_unlocked`) === 'true';
        const timestamp = sessionStorage.getItem(`sticknext_${pageType}_unlock_time`);
        
        if (!unlocked || !timestamp) {
            return false;
        }
        
        // Verify timestamp exists (anti-tampering)
        return unlocked && !!timestamp;
    }

    /**
     * Clear hidden page session
     */
    clearHiddenPageSession(pageType) {
        sessionStorage.removeItem(`sticknext_${pageType}_unlocked`);
        sessionStorage.removeItem(`sticknext_${pageType}_unlock_time`);
        console.log(`✓ ${pageType} session cleared`);
    }

    /**
     * Get all hidden page codes (for debugging console only)
     */
    getHiddenPagesCodes() {
        return this.hiddenPagesCode;
    }
}

// Initialize admin storage on page load
const adminStorageInstance = new AdminStorage();
console.log('✓ AdminStorage instance created and initialized');

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        adminStorageInstance.initializeAdminSettings();
        console.log('✓ AdminStorage re-initialized on DOMContentLoaded');
    });
}
