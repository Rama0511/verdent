// src/components/BannerCarousel.jsx
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import BannerCard from "./BannerCard";

// Data banners
const banners = [
  {
    id: 1,
    title: "Ayo makan sehat",
    description: "Dengan makan sayur sehat organik dari pkk agropark",
    imageSrc: "/assets/salad.png", // Tambahkan path gambar
  },
  {
    id: 2,
    title: "Ada yang baru di PKK Agropark",
    description: "Sekarang agropark ada taman buah anggur lohh",
    imageSrc: "/assets/anggur.svg",
  },
];

export default function BannerCarousel() {
  return (
    <Swiper
      modules={[Autoplay, Pagination]}
      spaceBetween={0}
      slidesPerView={1}
      pagination={{ clickable: true }}
      autoplay={{ delay: 3000 }}
      loop
    //   className="!pb-8" // Beri ruang untuk dots di bawah, kalau gapake ini dot pagination jadi ada di dalem
    >
      {banners.map((banner) => (
        <SwiperSlide key={banner.id}>
          {/* props untuk akses style dari BannerCard */}
          <BannerCard 
            title={banner.title} 
            description={banner.description} 
            imageSrc={banner.imageSrc} 
          />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}