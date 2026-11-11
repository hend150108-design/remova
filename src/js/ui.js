/**
 * Remova - Utilitas UI & Pengendali Interaktif
 */

/**
 * Format ukuran byte menjadi format yang mudah dibaca (misal 2.4 MB)
 * @param {number} bytes
 * @returns {string}
 */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Validasi file gambar berdasarkan tipe dan ukuran
 * @param {File} file
 * @param {number} maxSizeBytes
 * @returns {{ valid: boolean, error?: string }}
 */
export function validateImageFile(file, maxSizeBytes = 15 * 1024 * 1024) {
  if (!file) {
    return { valid: false, error: 'Tidak ada file yang dipilih.' };
  }

  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const isTypeValid =
    validTypes.includes(file.type.toLowerCase()) ||
    /\.(jpe?g|png|webp)$/i.test(file.name);

  if (!isTypeValid) {
    return {
      valid: false,
      error: 'Format tidak didukung. Harap unggah foto berekstensi JPG, JPEG, PNG, atau WebP.',
    };
  }

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `Ukuran file melebihi batas ${formatBytes(maxSizeBytes)}. Silakan pilih foto dengan ukuran lebih kecil.`,
    };
  }

  return { valid: true };
}

/**
 * Sistem Notifikasi Toast Interaktif
 */
export class ToastManager {
  constructor(containerId = 'toast-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = containerId;
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  }

  /**
   * Tampilkan pesan toast
   * @param {string} message
   * @param {'success'|'error'|'info'} type
   * @param {number} durationMs
   */
  show(message, type = 'info', durationMs = 4000) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    if (type === 'success') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`;
    } else if (type === 'error') {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;
    } else {
      iconSvg = `<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-content">
        ${iconSvg}
        <span class="toast-message">${escapeHtml(message)}</span>
      </div>
      <button class="toast-close" aria-label="Tutup notifikasi">&times;</button>
    `;

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.add('toast-leaving');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 250);
    };

    closeBtn.addEventListener('click', dismiss);
    this.container.appendChild(toast);

    if (durationMs > 0) {
      setTimeout(dismiss, durationMs);
    }
  }

  success(msg, duration) {
    this.show(msg, 'success', duration);
  }

  error(msg, duration) {
    this.show(msg, 'error', duration);
  }

  info(msg, duration) {
    this.show(msg, 'info', duration);
  }
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Pengendali Slider Perbandingan Sebelum & Sesudah (Before-After)
 * Memotong (clip) layer Sebelum dan Sesudah secara bersamaan agar background asli tidak tembus pandang.
 */
export class ComparisonSlider {
  constructor({ container, divider, beforeImageWrapper, afterImageWrapper, initialPosition = 50 }) {
    this.container = container;
    this.divider = divider;
    this.beforeImageWrapper = beforeImageWrapper;
    this.afterImageWrapper = afterImageWrapper;
    this.position = initialPosition;
    this.isDragging = false;

    if (!this.container || !this.divider || !this.afterImageWrapper) return;

    this.initEvents();
    this.setPosition(initialPosition);
  }

  initEvents() {
    const startDrag = (e) => {
      e.preventDefault();
      this.isDragging = true;
      this.container.classList.add('is-dragging');
    };

    const stopDrag = () => {
      if (this.isDragging) {
        this.isDragging = false;
        this.container.classList.remove('is-dragging');
      }
    };

    const moveDrag = (clientX) => {
      if (!this.isDragging) return;
      const rect = this.container.getBoundingClientRect();
      if (rect.width <= 0) return;
      const x = clientX - rect.left;
      let percent = (x / rect.width) * 100;
      percent = Math.max(0, Math.min(100, percent));
      this.setPosition(percent);
    };

    // Mouse events
    this.divider.addEventListener('mousedown', startDrag);
    this.container.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      moveDrag(e.clientX);
    });

    window.addEventListener('mouseup', stopDrag);
    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        moveDrag(e.clientX);
      }
    });

    // Touch events untuk mobile & tablet
    this.divider.addEventListener('touchstart', (e) => {
      this.isDragging = true;
      this.container.classList.add('is-dragging');
    }, { passive: true });

    this.container.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        this.isDragging = true;
        moveDrag(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchend', stopDrag);
    window.addEventListener('touchcancel', stopDrag);
    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length > 0) {
        moveDrag(e.touches[0].clientX);
      }
    }, { passive: true });

    // Aksesibilitas keyboard (panah kiri & kanan)
    this.divider.setAttribute('tabindex', '0');
    this.divider.setAttribute('role', 'slider');
    this.divider.setAttribute('aria-label', 'Slider pembanding sebelum dan sesudah');
    this.divider.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        this.setPosition(Math.max(0, this.position - 5));
      } else if (e.key === 'ArrowRight') {
        this.setPosition(Math.min(100, this.position + 5));
      }
    });
  }

  /**
   * Set posisi slider (0% sampai 100%)
   * @param {number} percent
   */
  setPosition(percent) {
    this.position = percent;
    this.divider.style.left = `${percent}%`;
    this.divider.setAttribute('aria-valuenow', Math.round(percent));

    // Bagian KIRI divider: Menampilkan gambar ASLI (Sebelum)
    if (this.beforeImageWrapper) {
      this.beforeImageWrapper.style.clipPath = `polygon(0 0, ${percent}% 0, ${percent}% 100%, 0 100%)`;
    }

    // Bagian KANAN divider: Menampilkan hasil TRANSPARAN (Sesudah) di atas pola checkerboard
    if (this.afterImageWrapper) {
      this.afterImageWrapper.style.clipPath = `polygon(${percent}% 0, 100% 0, 100% 100%, ${percent}% 100%)`;
    }
  }

  reset() {
    this.setPosition(50);
  }
}

/**
 * Fungsi untuk mengunduh Blob hasil olahan sebagai file PNG transparan
 * @param {Blob|string} blobOrUrl
 * @param {string} fileName
 */
export function downloadTransparentPng(blobOrUrl, fileName = 'remova-hasil.png') {
  let downloadUrl = blobOrUrl;
  let shouldRevoke = false;

  if (blobOrUrl instanceof Blob) {
    downloadUrl = URL.createObjectURL(blobOrUrl);
    shouldRevoke = true;
  }

  const anchor = document.createElement('a');
  anchor.href = downloadUrl;
  anchor.download = fileName.endsWith('.png') ? fileName : `${fileName}.png`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);

  if (shouldRevoke) {
    setTimeout(() => {
      URL.revokeObjectURL(downloadUrl);
    }, 1000);
  }
}
