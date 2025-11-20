// src/pages/ResultPage.jsx
import React, { useState, useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';

type PlantInfo = {
  id?: number;
  name?: string;
  description?: string;
};

export default function ResultPage() {
  const [plantInfo, setPlantInfo] = useState<PlantInfo | null>(null);
  const [isLoadingInfo, setIsLoadingInfo] = useState(true);

  const raw = typeof window !== 'undefined' ? sessionStorage.getItem('detectionResults') : null;
  const results = raw ? JSON.parse(raw) : null;

  const detection = results?.detections?.[0];
  const detectionId = results?.detection_id ?? null;
  const imageUrl = results?.model_image_url ? results.model_image_url : (results?.image_path ?? null);

  useEffect(() => {
    if (!detectionId) {
      setIsLoadingInfo(false);
      return;
    }

    const fetchInfo = async () => {
      try {
        const resp = await fetch(`/detection/${detectionId}`, { credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
        if (!resp.ok) {
          console.warn('Failed to fetch detection info', resp.status);
          setIsLoadingInfo(false);
          return;
        }
        const json = await resp.json();
        if (json.status === 'success') {
          setPlantInfo(json.label ?? null);
        }
      } catch (e) {
        console.error('Error fetching detection info', e);
      } finally {
        setIsLoadingInfo(false);
      }
    };

    fetchInfo();
  }, [detectionId]);

  // Handling jika 'results' tidak ada (mis. refresh halaman)
  if (!results) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold mb-4">Tidak ada data hasil</h2>
        <p className="text-black mb-6">
          Silakan kembali dan lakukan deteksi ulang.
        </p>
        <button 
          onClick={() => Inertia.visit('/detect')}
          className="bg-blue-600 text-white p-3 rounded-lg font-semibold"
        >
          Kembali ke Deteksi
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* ... (Header Anda) ... */}
      
      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        
        {/* === BAGIAN 1: HASIL DARI FASTAPI === */}
        {imageUrl ? (
          <img src={imageUrl} alt="Hasil Deteksi" className="w-full rounded-lg" />
        ) : (
          <div className="w-full h-48 flex items-center justify-center bg-gray-200 rounded-lg">
            <p className="text-black">Gambar tidak ditemukan</p>
          </div>
        )}
        
        {detection ? (
          <div>
            <h2 className="text-xl font-bold mb-1 text-black">
              Tanaman terdeteksi: "{detection.class_name}"
            </h2>
            <p className="text-black">
              Keyakinan (Confidence): {Math.round(detection.confidence * 100)}%
            </p>
          </div>
        ) : (
          <h2 className="text-xl font-bold mb-1">
            Tidak ada tanaman yang terdeteksi.
          </h2>
        )}
        
        {/* === GARIS PEMISAH === */}
        <hr className="border-gray-200" /> 

        {/* === BAGIAN 2: HASIL DARI LARAVEL (WADAH ANDA) === */}
        <div>
          <h3 className="text-lg font-semibold mb-2 text-black">Informasi Tanaman:</h3>
          
          {/* Tampilkan loading spinner selagi menunggu */}
          {isLoadingInfo ? (
            <div className="text-center text-black">
              <div className="w-6 h-6 border-4 border-dashed border-blue-500 rounded-full animate-spin mx-auto mb-2"></div>
              Memuat informasi...
            </div>
          ) : (
            // Jika sudah selesai loading, tampilkan datanya
            plantInfo ? (
              <div className="space-y-2 text-black">
                <p>
                  <span className="font-semibold">Nama: </span>
                  {plantInfo.name ?? detection?.class_name}
                </p>
                <p className="font-semibold">Deskripsi:</p>
                <div className="text-black">
                  {plantInfo.description ? (
                    plantInfo.description.split('\n').map((line, i) => (
                      <p key={i} className="mb-2">{line}</p>
                    ))
                  ) : (
                    <p>Informasi manfaat belum tersedia.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-black">Informasi tanaman tidak ditemukan di database.</div>
            )
          )}
        </div>

        {/* Tombol Kembali */}
        <button 
          onClick={() => Inertia.visit('/detect')}
          className="w-full bg-blue-600 text-white p-3 rounded-lg mt-6 font-semibold"
        >
          Kembali
        </button>
      </div>
    </div>
  );
}