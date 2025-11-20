import { useEffect } from 'react';
import { Inertia } from '@inertiajs/inertia';

export default function Splash() {
  useEffect(() => {
    const t = setTimeout(() => {
      Inertia.visit('/login');
    }, 3000);

    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-t-4 border-gray-200 rounded-full animate-spin border-blue-500" />
        <div className="text-gray-700">Memuat...</div>
      </div>
    </div>
  );
}
