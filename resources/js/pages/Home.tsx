import HeroSection from "../components/hero/HeroSection";
import FeatureCard from "../components/FeatureCard";
import FeatureCardComingSoon from "../components/FeatureCardComingSoon";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center pt-4">
      <div className="w-full max-w-md">
        <HeroSection/>

        <FeatureCard />
        <FeatureCardComingSoon></FeatureCardComingSoon>
        <FeatureCardComingSoon></FeatureCardComingSoon>
        {/* <div className="p-4">
          <div className="bg-gray-300 h-32 rounded-2xl flex">
            <h3 className="center">Coming Soon</h3>
          </div>
        </div>
        <div className="p-4">
          <div className="bg-gray-300 h-32 rounded-2xl"></div>
        </div> */}
      </div>
    </main>
  );
}
