import Header from "./Header";
import BannerCarousel from "./carousel/BannerCarousel";

export default function HeroSection() {
  return (
    <section className="relative w-full max-w-screen-2xl pb-6 mx-auto px-4 pt-4 transition-all duration-300 bg-gray-900">
        <div className="rounded-3xl overflow-hidden bg-linear-to-b"> 
            <Header />
            <div className="mt-2">
                <BannerCarousel />
            </div>
        </div>
    </section>
  );
}
