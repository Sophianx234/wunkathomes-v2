import Cta from "@/components/cta";
import FeaturedHomes from "@/components/featured-homes";
import FeaturedSales from "@/components/featured-sales";
import Footer from "@/components/footer";
import Hero from "@/components/hero";
import HowItWorks from "@/components/how-it-works";
import Navbar from "@/components/navbar";
import NewsLetter from "@/components/news-letter";
import PopularLocations from "@/components/popular-locations";
import SearchBar from "@/components/search-bar";
import Testimonials from "@/components/testimonials";
import WhyChooseUs from "@/components/why-choose-us";

export default function Home() {
  return (
    <div className="">
      <Navbar />
      <main>
        <Hero />
        <SearchBar/>
        <FeaturedSales/>
        <HowItWorks/>
        <FeaturedHomes/>
        <PopularLocations/>
        <WhyChooseUs/>
        <Testimonials/>
        <Cta/>
        <NewsLetter/>
      </main>
      <Footer/>
    </div>
  );
}
