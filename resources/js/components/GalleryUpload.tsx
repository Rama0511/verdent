// src/components/GalleryUpload.tsx

import { useRef, useState, ChangeEvent } from 'react';
import { Inertia } from '@inertiajs/inertia';
import { PhotoIcon } from '@heroicons/react/24/solid';

export default function GalleryUpload() {
  // no react-router here; use Inertia for navigation
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 1. Pindahkan fungsi handleFileSelect ke sini
  const handleFileSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target?.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // POST to our Laravel controller which will proxy to the ML model and save the detection
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
        const errorText = await response.text();
        console.error('Server response:', response.status, errorText);
        throw new Error('Gagal mengirim gambar ke server: ' + response.status);
      }
      const data = await response.json();
      console.log('Prediction response:', data);
      if (data.status !== 'success') throw new Error('API gagal memproses');

      // Normalize storage shape expected by ResultPage (uses results.detections[0])
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
      setIsLoading(false);
      Inertia.visit('/result');

      } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : String(err);
      alert('Terjadi kesalahan: ' + msg);
      setIsLoading(false); // Set loading false hanya jika gagal
    }
  };

  // 2. Pindahkan semua JSX yang berhubungan ke sini
  return (
    <>
      {/* Tombol Galeri */}
      <button 
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="flex-1 flex flex-col items-center justify-center p-6 bg-white border border-gray-200 rounded-xl shadow-lg hover:bg-gray-50 transition disabled:opacity-50"
      >
        <PhotoIcon className="h-12 w-12 text-blue-500 mb-2" />
        <span className="font-medium text-gray-700">Galeri</span>
      </button>

      {/* Input Tersembunyi */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/png, image/jpeg"
        className="hidden"
      />

      {/* Overlay Loading */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="w-16 h-16 border-8 border-dashed border-white rounded-full animate-spin"></div>
        </div>
      )}
    </>
  );
}