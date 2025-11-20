import React from 'react';

export default function LogoutButton({ redirectTo = '/' }: { redirectTo?: string }) {
  const doLogout = async () => {
    try {
      const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
      const headers: Record<string, string> = { 'X-Requested-With': 'XMLHttpRequest' };
      if (meta) headers['X-CSRF-TOKEN'] = meta.content;

      const res = await fetch('/logout', {
        method: 'POST',
        credentials: 'same-origin',
        headers,
      });

      // On success redirect to provided path
      if (res.ok) {
        window.location.href = redirectTo;
      } else {
        console.error('Logout failed', res.status);
        window.location.href = redirectTo;
      }
    } catch (e) {
      console.error(e);
      window.location.href = redirectTo;
    }
  };

  return (
    <button onClick={doLogout} className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700">
      Logout
    </button>
  );
}
