// src/components/BannerCard.jsx

export default function BannerCard({ title, description, imageSrc }) {
  return (
    // Kontainer kartu utama dengan background abu-abu gelap
    <div className="bg-gray-200 rounded-2xl p-4 flex items-center h-40"> {/* Atur tinggi kartu di sini */}
      
      {/* Kolom Kiri: Teks & Ikon */}
      <div className="flex-1 pr-2"> {/* flex-1 agar mengambil sisa ruang */}
        <h2 className="text-green-600 text-xl font-bold mb-2">{title}</h2>
        <p className="text-black font-medium text-xs mb-4">{description}</p>
        
        {/* Wadah Ikon Bank */}
        <div className="flex space-x-2">
          <img src="/assets/bca.svg" alt="BCA" className="h-4" />
          <img src="/assets/bni.svg" alt="BNI" className="h-4" />
          <img src="/assets/mastercard.svg" alt="Mastercard" className="h-4" />
        </div>
      </div>
      
      {/* Kolom Kanan: Gambar */}
      <div className="w-2/5"> {/* Atur lebar gambar, misal 40% (2/5) */}
        <img 
          src={imageSrc} 
          alt="Salad" 
          className="w-full h-full object-contain" // object-contain agar gambar tidak penyok
        />
      </div>
    </div>
  );
}