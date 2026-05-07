/* ===================================
   STICKNEXT RAIL SAGA - SCRIPT
   Advanced Gallery Functionality
   =================================== */

// ===== TOAST NOTIFICATION SYSTEM =====
function showToast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: '✓',
        error: '✗',
        info: 'ℹ',
        default: '•'
    };
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.default}</span>
        <span class="toast-text">${message}</span>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add('hide');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

class PhotoGallery {
    constructor() {
        this.allPhotos = PHOTOS;
        this.filteredPhotos = PHOTOS;
        this.currentImageIndex = 0;
        this.currentViewMode = 'grid';
        this.imageCache = new Map();
        this.loadedImages = new Set();

        this.initializeElements();
        this.initializeEventListeners();
        this.setupTouchGestures();
        this.renderGallery();
        this.setupLazyLoading();
    }

    // ===== INITIALIZATION =====
    initializeElements() {
        this.galleryGrid = document.getElementById('galleryGrid');
        this.modal = document.getElementById('imageModal');
        this.modalImage = document.getElementById('modalImage');
        this.searchInput = document.getElementById('searchInput');
        this.viewToggleButtons = document.querySelectorAll('.view-btn');
        this.photoCounter = document.getElementById('photoCounter');
    }

    initializeEventListeners() {
        // Modal controls
        document.getElementById('modalClose').addEventListener('click', () => {
            this.closeModal();
            showToast('Modal ditutup', 'info');
        });
        
        document.getElementById('modalPrev').addEventListener('click', () => {
            this.prevImage();
        });
        
        document.getElementById('modalNext').addEventListener('click', () => {
            this.nextImage();
        });

        // Search
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            this.searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchInput.blur();
            });
        }

        // View toggle
        this.viewToggleButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.toggleView(btn.dataset.view);
                showToast(`Tampilan: ${btn.dataset.view === 'grid' ? 'Grid' : 'List'}`, 'info');
            });
        });

        // Modal events
        this.modal.addEventListener('click', (e) => {
            if (e.target.id === 'imageModal') {
                this.closeModal();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Copy to clipboard
        document.getElementById('copyBtn')?.addEventListener('click', () => this.copyImageUrl());
        document.getElementById('downloadBtn')?.addEventListener('click', () => this.downloadImage());

        // Prevent body scroll when modal is open
        this.modal.addEventListener('mouseenter', () => {
            document.body.style.overflow = 'hidden';
        });
        this.modal.addEventListener('mouseleave', () => {
            if (!this.modal.classList.contains('active')) {
                document.body.style.overflow = 'auto';
            }
        });

        // Touch-friendly button feedback
        this.setupButtonFeedback();
    }

    setupButtonFeedback() {
        // Button feedback untuk semua buttons
        const buttons = document.querySelectorAll('button, a');
        buttons.forEach(btn => {
            btn.addEventListener('touchstart', function() {
                this.style.opacity = '0.8';
            });
            btn.addEventListener('touchend', function() {
                this.style.opacity = '1';
            });
        });
    }

    // ===== RENDERING =====
    renderGallery() {
        this.galleryGrid.innerHTML = '';

        if (this.filteredPhotos.length === 0) {
            this.galleryGrid.innerHTML = `
                <div class="no-results" style="grid-column: 1 / -1;">
                    <p>📸 Tidak ada foto yang cocok dengan pencarian Anda</p>
                </div>
            `;
            return;
        }

        this.filteredPhotos.forEach((photo, index) => {
            const item = document.createElement('div');
            item.className = 'gallery-item';
            item.dataset.index = index;
            item.dataset.photo = photo;

            const fileNumber = this.allPhotos.indexOf(photo) + 1;

            item.innerHTML = `
                <img 
                    data-src="${photo}" 
                    alt="Photo ${fileNumber}"
                    class="gallery-image"
                    loading="lazy"
                >
                <div class="gallery-overlay">
                    <span class="overlay-icon">🔍</span>
                    <span class="overlay-text">Lihat Ukuran Penuh</span>
                </div>
                <div class="gallery-info" style="display: none;">
                    <p><strong>Foto #${fileNumber}</strong></p>
                    <p style="font-size: 0.85rem; color: #999;">Klik untuk melihat full screen</p>
                </div>
            `;

            item.addEventListener('click', () => this.openModal(index));
            this.galleryGrid.appendChild(item);
        });

        this.updatePhotoCounter();
    }

    // ===== MODAL FUNCTIONS =====
    openModal(index) {
        this.currentImageIndex = index;
        const photo = this.filteredPhotos[index];
        this.modalImage.src = photo;

        // Preload next and previous images
        this.preloadAdjacentImages();

        this.modal.classList.add('active');
        this.updateModalInfo();
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    nextImage() {
        this.currentImageIndex = (this.currentImageIndex + 1) % this.filteredPhotos.length;
        this.modalImage.style.animation = 'none';
        setTimeout(() => {
            this.modalImage.src = this.filteredPhotos[this.currentImageIndex];
            this.modalImage.style.animation = 'zoomIn 0.3s ease';
        }, 10);
        this.preloadAdjacentImages();
        this.updateModalInfo();
    }

    prevImage() {
        this.currentImageIndex = (this.currentImageIndex - 1 + this.filteredPhotos.length) % this.filteredPhotos.length;
        this.modalImage.style.animation = 'none';
        setTimeout(() => {
            this.modalImage.src = this.filteredPhotos[this.currentImageIndex];
            this.modalImage.style.animation = 'zoomIn 0.3s ease';
        }, 10);
        this.preloadAdjacentImages();
        this.updateModalInfo();
    }

    preloadAdjacentImages() {
        const nextIndex = (this.currentImageIndex + 1) % this.filteredPhotos.length;
        const prevIndex = (this.currentImageIndex - 1 + this.filteredPhotos.length) % this.filteredPhotos.length;

        [nextIndex, prevIndex].forEach(idx => {
            const img = new Image();
            img.src = this.filteredPhotos[idx];
        });
    }

    updateModalInfo() {
        const totalInFilter = this.filteredPhotos.length;
        const currentNumber = this.currentImageIndex + 1;
        const photoName = this.filteredPhotos[this.currentImageIndex];
        const fileNumber = this.allPhotos.indexOf(photoName) + 1;

        const infoElement = document.getElementById('modalInfo');
        if (infoElement) {
            infoElement.textContent = `${currentNumber} / ${totalInFilter} • Photo #${fileNumber}`;
        }
    }

    // ===== SEARCH & FILTER =====
    handleSearch(query) {
        if (!query.trim()) {
            this.filteredPhotos = [...this.allPhotos];
        } else {
            const searchTerm = query.toLowerCase();
            // Simple search - cocok dengan nomor foto
            this.filteredPhotos = this.allPhotos.filter(photo => {
                const fileNumber = this.allPhotos.indexOf(photo) + 1;
                return fileNumber.toString().includes(searchTerm) || 
                       photo.toLowerCase().includes(searchTerm);
            });
        }

        this.currentImageIndex = 0;
        this.renderGallery();
    }

    // ===== VIEW TOGGLE =====
    toggleView(viewMode) {
        this.currentViewMode = viewMode;

        // Update button states
        this.viewToggleButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.view === viewMode) {
                btn.classList.add('active');
            }
        });

        // Update gallery display
        if (viewMode === 'grid') {
            this.galleryGrid.classList.remove('list-view');
        } else {
            this.galleryGrid.classList.add('list-view');
        }
    }

    // ===== KEYBOARD SHORTCUTS =====
    handleKeyboard(e) {
        if (!this.modal.classList.contains('active')) return;

        switch(e.key) {
            case 'ArrowRight':
                this.nextImage();
                break;
            case 'ArrowLeft':
                this.prevImage();
                break;
            case 'Escape':
                this.closeModal();
                break;
            case ' ':
                e.preventDefault();
                this.nextImage();
                break;
        }
    }

    // ===== UTILITIES =====
    updatePhotoCounter() {
        if (this.photoCounter) {
            const total = this.allPhotos.length;
            const showing = this.filteredPhotos.length;

            if (showing === total) {
                this.photoCounter.textContent = `${total} foto`;
            } else {
                this.photoCounter.textContent = `${showing} dari ${total} foto`;
            }
        }
    }

    copyImageUrl() {
        const url = this.filteredPhotos[this.currentImageIndex];
        const fullUrl = window.location.href.replace('index.html', '') + url;

        navigator.clipboard.writeText(fullUrl).then(() => {
            showToast('✓ URL berhasil dicopy ke clipboard!', 'success');
            this.triggerHaptic();
        }).catch(() => {
            showToast('✗ Gagal menggandakan URL', 'error');
        });
    }

    downloadImage() {
        const url = this.filteredPhotos[this.currentImageIndex];
        const a = document.createElement('a');
        a.href = url;
        a.download = url;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        showToast('⬇ Download dimulai...', 'success');
        this.triggerHaptic();
    }

    // ===== TOUCH & GESTURE SUPPORT =====
    setupTouchGestures() {
        let touchStartX = 0;
        let touchEndX = 0;
        let touchStartY = 0;
        let touchEndY = 0;

        this.modal.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            touchStartY = e.changedTouches[0].screenY;
        });

        this.modal.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            touchEndY = e.changedTouches[0].screenY;
            this.handleSwipe(touchStartX, touchEndX, touchStartY, touchEndY);
        });
    }

    handleSwipe(startX, endX, startY, endY) {
        const diffX = startX - endX;
        const diffY = startY - endY;

        // Jika swipe horizontal lebih signifikan daripada vertical
        if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50) {
            if (diffX > 0) {
                // Swipe kiri -> next image
                this.nextImage();
                showToast('→ Gambar berikutnya', 'info');
            } else {
                // Swipe kanan -> prev image
                this.prevImage();
                showToast('← Gambar sebelumnya', 'info');
            }
            this.triggerHaptic();
        }
    }

    // ===== HAPTIC FEEDBACK =====
    triggerHaptic(pattern = 'light') {
        if (navigator.vibrate) {
            const patterns = {
                light: 10,
                medium: 30,
                strong: 50
            };
            navigator.vibrate(patterns[pattern] || 10);
        }
    }

    // ===== LAZY LOADING =====
    setupLazyLoading() {
        const imageElements = document.querySelectorAll('[data-src]');

        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.add('loaded');
                        observer.unobserve(img);
                    }
                });
            }, {
                rootMargin: '50px'
            });

            imageElements.forEach(img => imageObserver.observe(img));
        } else {
            // Fallback untuk browser lama
            imageElements.forEach(img => {
                img.src = img.dataset.src;
            });
        }
    }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Create toast container
    createToastContainer();

    // Setup page title and meta
    document.title = GALLERY_CONFIG.title + ' - ' + GALLERY_CONFIG.subtitle;

    // Initialize gallery
    window.gallery = new PhotoGallery();

    // Add scroll-to-top functionality
    setupScrollBehavior();

    // Show welcome message
    showToast(`📸 ${GALLERY_CONFIG.totalPhotos} foto dimuat`, 'success', 2000);

    // Log initialization
    console.log(`📸 Gallery initialized with ${GALLERY_CONFIG.totalPhotos} photos`);
    console.log('💡 Tip: Gunakan swipe di mobile untuk navigate, atau arrow keys di desktop');
});

// ===== SMOOTH SCROLL BEHAVIOR =====
function setupScrollBehavior() {
    // Handle anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                document.querySelector(href).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===== UTILITY: Random order shuffle =====
function shufflePhotos() {
    window.gallery.filteredPhotos = window.gallery.filteredPhotos
        .sort(() => Math.random() - 0.5);
    window.gallery.currentImageIndex = 0;
    window.gallery.renderGallery();
}

// ===== UTILITY: Sort by filename =====
function sortPhotos(order = 'asc') {
    window.gallery.filteredPhotos = window.gallery.filteredPhotos.sort((a, b) => {
        return order === 'asc' ? a.localeCompare(b) : b.localeCompare(a);
    });
    window.gallery.currentImageIndex = 0;
    window.gallery.renderGallery();
}
