/**
 * Remova - Engine Penghapus Background Otomatis
 * Ditenagai oleh @imgly/background-removal
 * Pemrosesan lokal langsung di browser pengguna menggunakan WebAssembly dan Web Workers.
 * Dilengkapi fitur Lazy Loading untuk kecepatan muat awal maksimal.
 */

let removeBackgroundFn = null;
let isModelPreloaded = false;

/**
 * Memuat modul @imgly/background-removal secara dinamis (on-demand)
 */
async function getRemoveBackground() {
  if (!removeBackgroundFn) {
    const mod = await import('@imgly/background-removal');
    removeBackgroundFn = mod.removeBackground || mod.default?.removeBackground || mod.default;
  }
  return removeBackgroundFn;
}

/**
 * Proses penghapusan background otomatis
 * @param {File|Blob|string} imageSource - File, blob, atau URL gambar yang akan diproses
 * @param {Function} onProgress - Callback update progress: ({ stage, percent, message })
 * @returns {Promise<{ blob: Blob, objectUrl: string }>}
 */
export async function processBackgroundRemoval(imageSource, onProgress = () => {}) {
  try {
    onProgress({
      stage: 'init',
      percent: 5,
      message: isModelPreloaded
        ? 'Mempersiapkan sistem pemrosesan...'
        : 'Memuat sistem pemrosesan cerdas...',
    });

    // Memuat library secara dinamis
    const removeBackground = await getRemoveBackground();

    onProgress({
      stage: 'loading-model',
      percent: 15,
      message: 'Mempersiapkan model komputasi...',
    });

    const config = {
      model: 'medium', // isnet_fp16 (Akurat & cepat)
      output: {
        format: 'image/png',
        quality: 1.0,
      },
      debug: false,
      progress: (key, current, total) => {
        let percent = 20;
        let message = 'Sedang memproses gambar...';

        if (typeof key === 'string' && key.startsWith('fetch:')) {
          const fileName = key.replace('fetch:', '').split('/').pop() || 'aset model';
          if (total && total > 0) {
            const downloadPercent = Math.min(Math.round((current / total) * 100), 100);
            percent = 20 + Math.round(downloadPercent * 0.45); // 20% sampai 65%
            message = `Mengunduh ${fileName} (${downloadPercent}%)...`;
          } else {
            percent = 40;
            message = `Mengambil data ${fileName}...`;
          }
        } else if (typeof key === 'string' && (key.includes('compute') || key.includes('inference'))) {
          percent = 70;
          message = 'Mendeteksi subjek dan memisahkan latar belakang...';
        } else {
          percent = 85;
          message = 'Menerapkan lapisan transparansi alpha...';
        }

        onProgress({ stage: 'progress', percent, message });
      },
    };

    onProgress({
      stage: 'inference',
      percent: 70,
      message: 'Mendeteksi subjek dan menghapus latar belakang...',
    });

    // Jalankan inferensi penghapusan background
    const resultBlob = await removeBackground(imageSource, config);

    isModelPreloaded = true;

    onProgress({
      stage: 'finalizing',
      percent: 95,
      message: 'Menghasilkan file PNG transparan resolusi tinggi...',
    });

    const objectUrl = URL.createObjectURL(resultBlob);

    onProgress({
      stage: 'complete',
      percent: 100,
      message: 'Background berhasil dihapus!',
    });

    return {
      blob: resultBlob,
      objectUrl,
    };
  } catch (error) {
    console.error('Remova Engine Error:', error);
    throw new Error(
      error?.message ||
        'Tidak dapat memproses gambar. Pastikan gambar Anda jelas dan coba kembali.'
    );
  }
}

/**
 * Membersihkan URL blob untuk mencegah kebocoran memori
 * @param {string} url
 */
export function revokeObjectUrl(url) {
  if (url && typeof url === 'string' && url.startsWith('blob:')) {
    try {
      URL.revokeObjectURL(url);
    } catch (e) {
      // Ignore
    }
  }
}
