import React, { useEffect, useState } from 'react';
import LogoutButton from '../components/LogoutButton';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register required chart.js components once
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

type CountItem = { label: string; count: number };
type DailyCount = { date: string; count: number };
type DetectionItem = {
  id: number;
  created_at: string;
  user?: { email?: string } | null;
  label?: { name?: string } | null;
  confidence?: number | null;
  image_path?: string | null;
  result_image_path?: string | null;
  raw_result?: { output_path?: string; result?: { output_path?: string } } | null;
};

export default function AdminMonitor() {
  const [counts, setCounts] = useState<CountItem[]>([]);
  const [dailyCounts, setDailyCounts] = useState<DailyCount[]>([]);
  const [detections, setDetections] = useState<{ data: DetectionItem[]; prev_page_url?: string | null; next_page_url?: string | null; current_page?: number }>({ data: [], prev_page_url: null, next_page_url: null, current_page: 1 });
  const [loading, setLoading] = useState(true);

  const fetchData = async (page = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`/admin/detections?page=${page}`, { credentials: 'same-origin', headers: { 'X-Requested-With': 'XMLHttpRequest' } });
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json();
      if (json.status === 'success') {
        setCounts(json.counts || []);
        setDetections(json.detections);
        setDailyCounts(json.daily_counts || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const chartData = {
    labels: counts.map((c) => c.label),
    datasets: [
      {
        label: 'Detections',
        data: counts.map((c) => c.count),
        backgroundColor: 'rgba(54, 162, 235, 0.8)'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    }
  } as const;

  const dailyChartData = {
    labels: dailyCounts.map((d) => d.date),
    datasets: [
      {
        label: 'Total detections',
        data: dailyCounts.map((d) => d.count),
        borderColor: 'rgba(99, 102, 241, 0.9)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        tension: 0.2,
        fill: true,
        pointRadius: 3,
      }
    ]
  };

  const dailyChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }
    }
  } as const;

  const badgeColors = [
    'bg-blue-600', 'bg-green-600', 'bg-yellow-500', 'bg-red-600', 'bg-indigo-600', 'bg-pink-500'
  ];

  const badgeClass = (idx: number) => `${badgeColors[idx % badgeColors.length]} text-white px-2 py-0.5 rounded text-sm font-medium`;

  const MODEL_HOST = 'https://fastapi.adminmonitoringanak.my.id';

  const getModelImageUrl = (d: DetectionItem): string | null => {
    const out = d.raw_result?.output_path ?? d.raw_result?.result?.output_path;
    if (!out) return null;
    if (/^https?:\/\//.test(out)) return out as string;
    const path = (out as string).replace(/^\/+/, '');
    return `${MODEL_HOST}/${path}`;
  };

  const [modalImages, setModalImages] = useState<{ original: string | null; result: string | null } | null>(null);

  const openImage = (d: DetectionItem, type: 'original' | 'result') => {
    if (type === 'original' && d.image_path) {
      setModalImages({ original: d.image_path, result: null });
    } else if (type === 'result' && d.result_image_path) {
      setModalImages({ original: null, result: d.result_image_path });
    }
  };

  // close modal on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalImages(null);
    };
    if (modalImages) document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [modalImages]);

  return (
    <div className="min-h-screen p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Admin Monitoring</h1>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2 flex items-center gap-2"> 
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 002-2V7H3v12a2 2 0 002 2z"></path></svg>
            Daily Summary
          </h2>
          {loading ? (<div>Loading...</div>) : (
            <div style={{ height: 280 }}>
              <Line data={dailyChartData} options={dailyChartOptions} redraw />
            </div>
          )}
        </div>

        <div className="bg-white p-4 rounded shadow">
          <h2 className="font-semibold mb-2 flex items-center gap-2"> 
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 7h18M3 12h18M3 17h18"></path></svg>
            Detections by Label
          </h2>
          {loading ? (<div>Loading...</div>) : (
            <div style={{ height: 280 }}>
              <Bar data={chartData} options={chartOptions} redraw />
            </div>
          )}
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <h2 className="font-semibold mb-2 flex items-center gap-2"> 
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h4l3 9 4-18 3 9h4"></path></svg>
          History
        </h2>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {detections.data && detections.data.map((d: DetectionItem, idx: number) => (
                <tr key={d.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-700 flex items-center gap-2"><svg className="w-4 h-4 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12A9 9 0 1112 3a9 9 0 019 9z"></path></svg>{new Date(d.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{d.user?.email ?? '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    {d.label ? (
                      <span className={badgeClass(idx)}>{d.label.name}</span>
                    ) : <span className="text-gray-500">-</span>}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{typeof d.confidence === 'number' ? (d.confidence * 100).toFixed(1) + '%' : '-'}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      {d.image_path && (
                        <button onClick={() => openImage(d, 'original')} className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                          Asli
                        </button>
                      )}
                      {d.result_image_path && (
                        <button onClick={() => openImage(d, 'result')} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                          Hasil
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div />
          <div>
            {detections.prev_page_url && <button onClick={() => fetchData((detections.current_page ?? 1) - 1)} className="px-3 py-1 mr-2 border rounded">Prev</button>}
            {detections.next_page_url && <button onClick={() => fetchData((detections.current_page ?? 1) + 1)} className="px-3 py-1 border rounded">Next</button>}
          </div>
        </div>
      </div>
      {modalImages && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setModalImages(null)}>
          <div className="max-w-[90vw] max-h-[90vh] bg-white rounded-lg p-6" onClick={(e) => e.stopPropagation()}>
            {modalImages.original && (
              <div>
                <h3 className="font-semibold mb-3 text-gray-700 text-center">Gambar Asli</h3>
                <img src={modalImages.original} alt="Original" className="w-auto h-auto rounded shadow object-contain" style={{ maxHeight: '70vh', maxWidth: '80vw' }} />
              </div>
            )}
            {modalImages.result && (
              <div>
                <h3 className="font-semibold mb-3 text-gray-700 text-center">Gambar Hasil Deteksi</h3>
                <img src={modalImages.result} alt="Result" className="w-auto h-auto rounded shadow object-contain" style={{ maxHeight: '70vh', maxWidth: '80vw' }} />
              </div>
            )}
            <div className="mt-4 text-center">
              <button onClick={() => setModalImages(null)} className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
