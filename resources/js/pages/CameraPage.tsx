// src/pages/CameraPage.jsx
import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { Inertia } from '@inertiajs/inertia';

// Helper function untuk mengubah base64 ke File
function dataURLtoFile(dataurl, filename) {
  let arr = dataurl.split(','),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

export default function CameraPage() {
  const webcamRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fungsi untuk mengambil gambar
  const capture = useCallback(async () => {
    setIsLoading(true);
    const imageSrcBase64 = webcamRef.current?.getScreenshot();

    if (!imageSrcBase64) {
      alert('Gagal menangkap gambar dari kamera');
      setIsLoading(false);
      return;
    }

    // 1. Ubah base64 string menjadi File object
    const imageFile = dataURLtoFile(imageSrcBase64, 'detection-image.jpg');

    // 2. Buat FormData untuk dikirim ke API
    const formData = new FormData();
    formData.append('file', imageFile); // 'file' harus cocok dengan nama di FastAPI

    // 3. Kirim ke Backend FastAPI
    try {
      // POST to our Laravel controller which proxies to the ML model
      const headers: Record<string, string> = { 'X-Requested-With': 'XMLHttpRequest' };
      const meta = document.querySelector('meta[name="csrf-token"]');
      if (meta) headers['X-CSRF-TOKEN'] = meta.getAttribute('content') || '';

      const response = await fetch('/predict', {
        method: 'POST',
        headers,
        body: formData,
        credentials: 'same-origin',
      });

      if (!response.ok) {
        throw new Error('Gagal mengirim gambar ke server');
      }

      const data = await response.json();

      // Normalize and store for ResultPage
      const toStore = {
        detections: Array.isArray(data.result) ? data.result : (data.result?.detections ?? []),
        image_path: data.image_path ?? null,
        model_image_url: data.model_image_url ?? null,
        detection_id: data.detection_id ?? null,
      };

      try {
        sessionStorage.setItem('detectionResults', JSON.stringify(toStore));
      } catch (e) {
        console.error('Could not save detection results to sessionStorage', e);
      }
      Inertia.visit('/result');

    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      alert('Terjadi kesalahan saat mengirim gambar: ' + msg);
    } finally {
      setIsLoading(false);
    }
  }, [webcamRef]);

  return (
    <div className="relative w-full min-h-screen bg-black flex flex-col justify-center items-center">
      {/* Tampilan Kamera Fullscreen */}
      <Webcam
        audio={false}
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        className="w-full h-full object-cover"
        videoConstraints={{ facingMode: 'environment' }} // 'environment' untuk kamera belakang
      />

      {/* Tombol Shutter (di atas kamera) */}
      <div className="absolute bottom-10 z-10">
        <button
          onClick={capture}
          disabled={isLoading}
          className="
            w-20 h-20 rounded-full bg-white 
            flex items-center justify-center
            border-4 border-gray-400
            disabled:opacity-50
          "
        >
          {/* Lingkaran dalam tombol shutter */}
          {isLoading ? (
            <div className="w-8 h-8 border-4 border-dashed border-blue-500 rounded-full animate-spin"></div>
          ) : (
            <div className="w-18 h-18 rounded-full bg-white"></div>
          )}
        </button>
      </div>
      
      {/* (Opsional) Tombol kembali */}
      {/* ...tambahkan tombol kembali di pojok kiri atas jika perlu... */}
    </div>
  );
}