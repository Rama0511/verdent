import { Link } from "@inertiajs/react";

export default function FeatureCardComingSoon() {
  return (
    <div className="p-4">
      <div className="bg-yellow-500 text-white rounded-2xl p-5 flex flex-col items-start relative overflow-hidden">
        <h3 className="text-lg font-medium">
          Coming Soon
        </h3>
        {/* <button className="bg-yellow-400 text-gray-900 font-semibold px-4 py-2 rounded-xl mt-4">
          Coba Sekarang
        </button> */}
        <Link 
          to="/" // cek App.jsx unutk melihat route
          className="inline-block bg-white text-blue-700 px-5 py-2 rounded-lg font-bold hover:bg-gray-100 transitionz-10 relative"
        >
          Segera
        </Link>
        <div className="absolute bottom-0 right-0 opacity-30">
          <svg width="80" height="80" viewBox="0 0 100 100">
            <rect width="100" height="100" fill="white" />
          </svg>
        </div>
      </div>
    </div>
  );
}
