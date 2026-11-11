/**
 * Remova - Logika Aplikasi Utama
 * "Remove Background. Reveal Creativity."
 */

import { processBackgroundRemoval, revokeObjectUrl } from './backgroundRemoval.js';
import {
  formatBytes,
  validateImageFile,
  ToastManager,
  ComparisonSlider,
  downloadTransparentPng,
} from './ui.js';
import lucide from 'lucide';
const createIcons = lucide.createIcons || lucide.default?.createIcons;
const icons = lucide.icons || lucide.default?.icons || lucide;

// State Aplikasi
const state = {
  currentFile: null,
  currentFileName: 'remova-foto.png',
  originalImageUrl: null,
  resultBlob: null,
  resultImageUrl: null,
  isProcessing: false,
  activePreviewBg: 'transparent',
  activeViewMode: 'split',
};

// Pengelola UI
let toast;
let editorSlider = null;
let heroSlider = null;

// Referensi Elemen DOM
const elements = {
  // Navigasi
  navToggle: document.getElementById('nav-toggle'),
  navMenu: document.getElementById('nav-menu'),
  navLinks: document.querySelectorAll('.nav-link, .nav-btn'),

  // Hero Section
  heroSliderContainer: document.getElementById('hero-slider-container'),
  heroSliderDivider: document.getElementById('hero-slider-divider'),
  heroSliderBefore: document.getElementById('hero-slider-before'),
  heroSliderAfter: document.getElementById('hero-slider-after'),

  // Area Upload
  uploadSection: document.getElementById('upload-section'),
  dropZone: document.getElementById('drop-zone'),
  fileInput: document.getElementById('file-input'),
  chooseFileBtn: document.getElementById('choose-file-btn'),
  sampleCards: document.querySelectorAll('.sample-card'),

  // Kartu Staging (Foto Terpilih)
  stagingCard: document.getElementById('staging-card'),
  stagingThumb: document.getElementById('staging-thumb'),
  stagingFileName: document.getElementById('staging-file-name'),
  stagingFileSize: document.getElementById('staging-file-size'),
  btnStartProcess: document.getElementById('btn-start-process'),
  btnChangeImage: document.getElementById('btn-change-image'),
  btnClearStaging: document.getElementById('btn-clear-staging'),

  // Kartu Pemrosesan (Loading)
  processingCard: document.getElementById('processing-card'),
  progressStatusText: document.getElementById('progress-status-text'),
  progressBarFill: document.getElementById('progress-bar-fill'),
  progressPercentText: document.getElementById('progress-percent-text'),

  // Kartu Hasil (Result Editor)
  resultCard: document.getElementById('result-card'),
  resultSliderContainer: document.getElementById('result-slider-container'),
  resultSliderDivider: document.getElementById('result-slider-divider'),
  resultSliderBeforeWrapper: document.getElementById('result-slider-before-wrapper'),
  resultSliderBeforeImg: document.getElementById('result-before-img'),
  resultSliderAfterWrapper: document.getElementById('result-slider-after-wrapper'),
  resultSliderAfterImg: document.getElementById('result-after-img'),
  resultCanvasWrapper: document.getElementById('result-canvas-wrapper'),
  resultMetaInfo: document.getElementById('result-meta-info'),

  // Kontrol Mode Tampilan
  viewModeBtns: document.querySelectorAll('.btn-view-mode'),

  // Opsi Latar Belakang Pratinjau
  bgOptionBtns: document.querySelectorAll('.bg-option-btn'),

  // Tombol Aksi Akhir
  btnDownload: document.getElementById('btn-download-png'),
  btnResetAll: document.getElementById('btn-reset-all'),
};

/**
 * Inisialisasi Aplikasi Remova
 */
export function initApp() {
  toast = new ToastManager();
  initLucideIcons();
  initNavbar();
  initHeroSlider();
  initUploadHandlers();
  initResultEditorHandlers();
  initGlobalShortcuts();
}

/**
 * Render Ikon Lucide
 */
function initLucideIcons() {
  if (typeof createIcons === 'function') {
    createIcons({ icons });
  }
}

/**
 * Navbar Sticky & Menu Hamburger Mobile
 */
function initNavbar() {
  const navbar = document.getElementById('main-navbar');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      navbar?.classList.add('is-scrolled');
    } else {
      navbar?.classList.remove('is-scrolled');
    }
  });

  // Tombol Hamburger Menu Mobile
  if (elements.navToggle && elements.navMenu) {
    elements.navToggle.addEventListener('click', () => {
      const isExpanded = elements.navMenu.classList.toggle('is-open');
      elements.navToggle.classList.toggle('is-active', isExpanded);
      elements.navToggle.setAttribute('aria-expanded', isExpanded);
    });

    // Tutup menu saat klik di luar area navbar
    document.addEventListener('click', (e) => {
      if (!navbar?.contains(e.target) && elements.navMenu.classList.contains('is-open')) {
        elements.navMenu.classList.remove('is-open');
        elements.navToggle.classList.remove('is-active');
        elements.navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Smooth scroll untuk tautan navigasi
  elements.navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        e.preventDefault();
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
          if (elements.navMenu) {
            elements.navMenu.classList.remove('is-open');
            elements.navToggle?.classList.remove('is-active');
          }

          targetSection.scrollIntoView({ behavior: 'smooth' });

          if (targetId === '#upload-section') {
            setTimeout(() => {
              elements.dropZone?.classList.add('pulse-focus');
              setTimeout(() => elements.dropZone?.classList.remove('pulse-focus'), 1000);
            }, 400);
          }
        }
      }
    });
  });
}

/**
 * Inisialisasi Slider Perbandingan di Hero Section
 */
function initHeroSlider() {
  if (
    elements.heroSliderContainer &&
    elements.heroSliderDivider &&
    elements.heroSliderAfter
  ) {
    heroSlider = new ComparisonSlider({
      container: elements.heroSliderContainer,
      divider: elements.heroSliderDivider,
      beforeImageWrapper: elements.heroSliderBefore,
      afterImageWrapper: elements.heroSliderAfter,
      initialPosition: 50,
    });
  }
}

/**
 * Handler Area Upload (Drag & Drop, Pemilih File, Sampel Cepat)
 */
function initUploadHandlers() {
  const { dropZone, fileInput, chooseFileBtn, sampleCards } = elements;

  if (!dropZone || !fileInput) return;

  // Buka dialog pemilih file
  chooseFileBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    if (state.isProcessing) return;
    fileInput.click();
  });

  dropZone.addEventListener('click', (e) => {
    if (state.isProcessing) return;
    if (e.target !== chooseFileBtn && !chooseFileBtn?.contains(e.target)) {
      fileInput.click();
    }
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleSelectedFile(file);
    }
    fileInput.value = '';
  });

  // Event Drag & Drop
  ['dragenter', 'dragover'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!state.isProcessing) {
        dropZone.classList.add('is-drag-over');
      }
    });
  });

  ['dragleave', 'dragend'].forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
      dropZone.classList.remove('is-drag-over');
    });
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropZone.classList.remove('is-drag-over');

    if (state.isProcessing) return;

    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      handleSelectedFile(files[0]);
    }
  });

  // Sampel foto cepat
  sampleCards.forEach((card) => {
    card.addEventListener('click', async (e) => {
      e.stopPropagation();
      if (state.isProcessing) return;

      const src = card.getAttribute('data-sample-src');
      const name = card.getAttribute('data-sample-name') || 'sampel.jpg';
      if (!src) return;

      try {
        toast.info('Memuat sampel foto...', 2000);
        const response = await fetch(src);
        if (!response.ok) throw new Error('Tidak dapat mengambil sampel gambar');
        const blob = await response.blob();
        const file = new File([blob], name, { type: blob.type || 'image/jpeg' });
        handleSelectedFile(file);
      } catch (err) {
        console.error(err);
        toast.error('Tidak dapat memuat sampel gambar.');
      }
    });
  });

  // Aksi kartu staging
  elements.btnStartProcess?.addEventListener('click', () => {
    startRemovalProcess();
  });

  elements.btnChangeImage?.addEventListener('click', () => {
    if (state.isProcessing) return;
    fileInput.click();
  });

  elements.btnClearStaging?.addEventListener('click', () => {
    if (state.isProcessing) return;
    resetToDropzone();
  });
}

/**
 * Shortcut Global: Tempel Foto dari Clipboard (Ctrl+V)
 */
function initGlobalShortcuts() {
  window.addEventListener('paste', (e) => {
    if (state.isProcessing) return;
    const items = e.clipboardData?.items;
    if (!items) return;

    for (const item of items) {
      if (item.type.startsWith('image/')) {
        const file = item.getAsFile();
        if (file) {
          handleSelectedFile(file);
          toast.success('Foto berhasil ditempel dari clipboard!');
          break;
        }
      }
    }
  });
}

/**
 * Menangani file foto yang dipilih
 * @param {File} file
 */
function handleSelectedFile(file) {
  const validation = validateImageFile(file);
  if (!validation.valid) {
    toast.error(validation.error);
    return;
  }

  // Bersihkan URL blob sebelumnya
  cleanupPreviousImages();

  state.currentFile = file;
  state.currentFileName = file.name;
  state.originalImageUrl = URL.createObjectURL(file);

  // Perbarui Kartu Staging
  if (elements.stagingThumb) {
    elements.stagingThumb.src = state.originalImageUrl;
  }
  if (elements.stagingFileName) {
    elements.stagingFileName.textContent = file.name;
  }
  if (elements.stagingFileSize) {
    elements.stagingFileSize.textContent = formatBytes(file.size);
  }

  showView('staging');
  toast.success('Foto siap diproses. Klik "Hapus Background Sekarang"!');
}

/**
 * Jalankan Proses Penghapusan Background Otomatis
 */
async function startRemovalProcess() {
  if (!state.currentFile || state.isProcessing) return;

  state.isProcessing = true;
  showView('processing');
  setButtonsDisabled(true);

  const onProgress = ({ percent, message }) => {
    if (elements.progressBarFill) {
      elements.progressBarFill.style.width = `${percent}%`;
    }
    if (elements.progressPercentText) {
      elements.progressPercentText.textContent = `${percent}%`;
    }
    if (elements.progressStatusText) {
      elements.progressStatusText.textContent = message;
    }
  };

  try {
    const result = await processBackgroundRemoval(state.currentFile, onProgress);

    state.resultBlob = result.blob;
    state.resultImageUrl = result.objectUrl;

    // Tampilkan kartu hasil agar dimensi elemen DOM siap untuk perhitungan slider
    showView('result');

    // Siapkan editor hasil & slider perbandingan
    setupResultEditor();

    toast.success('Background berhasil dihapus!');
  } catch (error) {
    console.error('Processing error:', error);
    toast.error(error.message || 'Gagal menghapus background foto. Silakan coba kembali.');
    showView('staging');
  } finally {
    state.isProcessing = false;
    setButtonsDisabled(false);
  }
}

/**
 * Konfigurasi dan Render Result Editor
 */
function setupResultEditor() {
  const {
    resultSliderBeforeImg,
    resultSliderAfterImg,
    resultMetaInfo,
    resultSliderContainer,
    resultSliderDivider,
    resultSliderBeforeWrapper,
    resultSliderAfterWrapper,
  } = elements;

  if (resultSliderBeforeImg) {
    resultSliderBeforeImg.src = state.originalImageUrl;
  }
  if (resultSliderAfterImg) {
    resultSliderAfterImg.src = state.resultImageUrl;
  }

  // Informasi metadata file hasil
  if (resultMetaInfo && state.resultBlob) {
    resultMetaInfo.textContent = `PNG • Transparan • ${formatBytes(state.resultBlob.size)}`;
  }

  // Pengendali slider perbandingan
  if (!editorSlider && resultSliderContainer && resultSliderDivider && resultSliderAfterWrapper) {
    editorSlider = new ComparisonSlider({
      container: resultSliderContainer,
      divider: resultSliderDivider,
      beforeImageWrapper: resultSliderBeforeWrapper,
      afterImageWrapper: resultSliderAfterWrapper,
      initialPosition: 50,
    });
  } else if (editorSlider) {
    editorSlider.reset();
  }

  // Reset opsi pratinjau latar belakang dan mode tampilan
  setPreviewBackground('transparent');
  setViewMode('split');
}

/**
 * Handler Result Editor (Mode Tampilan, Pratinjau Latar, Unduh, Reset)
 */
function initResultEditorHandlers() {
  // Pengalih mode tampilan
  elements.viewModeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const mode = btn.getAttribute('data-mode');
      if (mode) setViewMode(mode);
    });
  });

  // Opsi latar belakang pratinjau (transparan, putih, hitam)
  document.querySelectorAll('.bg-option-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const bg = btn.getAttribute('data-bg');
      if (bg) setPreviewBackground(bg);
    });
  });

  // Tombol Unduh PNG Transparan
  elements.btnDownload?.addEventListener('click', () => {
    if (!state.resultBlob) {
      toast.error('Tidak ada gambar hasil untuk diunduh.');
      return;
    }

    const baseName = (state.currentFileName || 'remova-hasil')
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_');
    const downloadName = `remova-${baseName}.png`;

    downloadTransparentPng(state.resultBlob, downloadName);
    toast.success(`Berhasil mengunduh ${downloadName}!`);
  });

  // Tombol Hapus Foto Lain (Reset ke dropzone awal)
  elements.btnResetAll?.addEventListener('click', () => {
    resetToDropzone();
  });
}

/**
 * Atur Latar Belakang Pratinjau: transparent | white | black
 * @param {'transparent'|'white'|'black'} type
 */
function setPreviewBackground(type) {
  state.activePreviewBg = type;

  document.querySelectorAll('.bg-option-btn').forEach((btn) => {
    btn.classList.toggle('is-active', btn.getAttribute('data-bg') === type);
  });

  const container = elements.resultSliderContainer;
  const canvasWrapper = elements.resultCanvasWrapper;

  if (!container) return;

  if (type === 'transparent') {
    container.style.backgroundColor = '';
    container.classList.add('checkerboard-pattern');
    if (canvasWrapper) {
      canvasWrapper.style.backgroundColor = '';
      canvasWrapper.classList.add('checkerboard-pattern');
    }
  } else if (type === 'white') {
    container.style.backgroundColor = '#FFFFFF';
    container.classList.remove('checkerboard-pattern');
    if (canvasWrapper) {
      canvasWrapper.style.backgroundColor = '#FFFFFF';
      canvasWrapper.classList.remove('checkerboard-pattern');
    }
  } else if (type === 'black') {
    container.style.backgroundColor = '#0F172A';
    container.classList.remove('checkerboard-pattern');
    if (canvasWrapper) {
      canvasWrapper.style.backgroundColor = '#0F172A';
      canvasWrapper.classList.remove('checkerboard-pattern');
    }
  }
}

/**
 * Atur Mode Tampilan di Result Editor
 * @param {'split'|'result'|'original'} mode
 */
function setViewMode(mode) {
  state.activeViewMode = mode;
  elements.viewModeBtns.forEach((btn) => {
    btn.classList.toggle('is-active', btn.getAttribute('data-mode') === mode);
  });

  const {
    resultSliderContainer,
    resultSliderDivider,
    resultSliderBeforeWrapper,
    resultSliderAfterWrapper,
  } = elements;

  if (!resultSliderContainer) return;

  if (mode === 'result') {
    // Hasil Transparan Saja:
    // Sembunyikan layer foto asli agar tidak tembus pandang di belakang transparansi
    if (resultSliderBeforeWrapper) resultSliderBeforeWrapper.style.display = 'none';
    if (resultSliderAfterWrapper) {
      resultSliderAfterWrapper.style.display = 'flex';
      resultSliderAfterWrapper.style.clipPath = 'none';
    }
    if (resultSliderDivider) resultSliderDivider.style.display = 'none';
  } else if (mode === 'original') {
    // Foto Asli Saja
    if (resultSliderBeforeWrapper) {
      resultSliderBeforeWrapper.style.display = 'flex';
      resultSliderBeforeWrapper.style.clipPath = 'none';
    }
    if (resultSliderAfterWrapper) resultSliderAfterWrapper.style.display = 'none';
    if (resultSliderDivider) resultSliderDivider.style.display = 'none';
  } else {
    // Slider Perbandingan (Mode Split)
    if (resultSliderBeforeWrapper) resultSliderBeforeWrapper.style.display = 'flex';
    if (resultSliderAfterWrapper) resultSliderAfterWrapper.style.display = 'flex';
    if (resultSliderDivider) resultSliderDivider.style.display = 'flex';
    if (editorSlider) {
      editorSlider.reset();
    }
  }
}

/**
 * Tampilkan tampilan tertentu di area upload
 * @param {'dropzone'|'staging'|'processing'|'result'} view
 */
function showView(view) {
  const cards = {
    dropzone: elements.dropZone,
    staging: elements.stagingCard,
    processing: elements.processingCard,
    result: elements.resultCard,
  };

  Object.entries(cards).forEach(([key, el]) => {
    if (el) {
      if (key === view) {
        el.style.display = 'flex';
        el.classList.add('animate-fade-in');
      } else {
        el.style.display = 'none';
        el.classList.remove('animate-fade-in');
      }
    }
  });

  if (view === 'result' || view === 'staging') {
    elements.uploadSection?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

/**
 * Reset state aplikasi dan kembali ke area dropzone awal
 */
function resetToDropzone() {
  cleanupPreviousImages();
  state.currentFile = null;
  state.currentFileName = 'remova-foto.png';
  state.originalImageUrl = null;
  state.resultBlob = null;
  state.resultImageUrl = null;
  state.isProcessing = false;

  setPreviewBackground('transparent');

  if (elements.fileInput) elements.fileInput.value = '';
  showView('dropzone');
}

/**
 * Bersihkan URL blob untuk mencegah kebocoran memori browser
 */
function cleanupPreviousImages() {
  if (state.originalImageUrl && state.originalImageUrl.startsWith('blob:')) {
    revokeObjectUrl(state.originalImageUrl);
  }
  if (state.resultImageUrl && state.resultImageUrl.startsWith('blob:')) {
    revokeObjectUrl(state.resultImageUrl);
  }
}

/**
 * Nonaktifkan atau aktifkan tombol selama proses pemrosesan gambar
 * @param {boolean} disabled
 */
function setButtonsDisabled(disabled) {
  const buttonsToToggle = [
    elements.btnStartProcess,
    elements.btnChangeImage,
    elements.btnClearStaging,
    elements.chooseFileBtn,
    elements.btnDownload,
    elements.btnResetAll,
  ];

  buttonsToToggle.forEach((btn) => {
    if (btn) btn.disabled = disabled;
  });
}
