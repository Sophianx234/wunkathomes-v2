import FeaturedRentals from "@/components/featured-rentals";
import FeaturedSales from "@/components/featured-sales";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import Navbar from "@/components/navbar";
import SearchBar from "@/components/search-bar";

export default function Home() {
  return (
    <div className="bg-white">
      <main>
        {/* 1. The Hook: Emotional cinematic entry */}
        <Hero />
        
        {/* 2. The Tool: Immediate action without scrolling */}
        <SearchBar />
        
        {/* 3. The Product: The actual inventory taking center stage */}
        <FeaturedSales />
        <FeaturedRentals />
        
        {/* 4. The D2C Process: Explaining the digital/smart-lock advantage */}
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}