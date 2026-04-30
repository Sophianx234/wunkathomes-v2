
import { FaHandshake, FaHome, FaLock, FaMoneyBillWave, FaSmile, FaUsers } from "react-icons/fa"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function AboutPage() {
 const values = [
  {
    icon: FaHome,
    title: "Comfort You Can Trust",
    description:
      "Every WunkatHomes room is carefully managed and maintained for a clean, safe, and comfortable stay.",
  },
  {
    icon: FaLock,
    title: "Transparent & Secure",
    description:
      "No hidden fees or surprises. Every booking and payment is handled securely for your peace of mind.",
  },
  {
    icon: FaMoneyBillWave,
    title: "Affordable Living",
    description:
      "Enjoy modern, well-kept spaces at prices that make sense. Quality living doesn’t have to be expensive.",
  },
  {
    icon: FaSmile,
    title: "Simple Experience",
    description:
      "From browsing to booking, every step is designed to be smooth and hassle-free so you can move in with confidence.",
  },
];


  return (
    <div className="min-h-screen  bg-background">
      <Header />
      <main>
        {/* About Hero */}
       <section
  className="relative bg-[url('/a-4.jpg')] bg-cover bg-center bg-no-repeat"
>
  {/* Overlay */}
  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />

  {/* Content */}
  <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-white ">
    <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight drop-shadow-lg">
      About WunkatHomes
    </h1>
    <p className="text-lg md:text-xl text-gray-200 leading-relaxed drop-shadow">
      WunkatHomes is on a mission to make quality living accessible.
We provide affordable, well-managed rooms with a seamless booking experience. no agents, no surprises.
    </p>
  </div>
</section>

        {/* Mission Statement */}
<section className="relative bg-neutral-50 py-28">
  <div className="max-w-7xl mx-auto grid md:grid-cols-2 items-center gap-16 px-6 lg:px-12">
    
    {/* Image Side */}
    <div className="relative group">
      <div className="rounded-3xl overflow-hidden shadow-2xl relative">
        <img
          src="/a-2.jpg"
          alt="Elegant interior representing WunkatHomes mission"
          className="w-full h-[600px] object-cover transform group-hover:scale-105 transition duration-700 ease-in-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>
      <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-black/5 rounded-full blur-3xl -z-10" />
    </div>

    {/* Text Side */}
    <div className="relative">
      <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
        Building Trust <br /> Through Transparency
      </h2>
      <p className="text-lg text-gray-700 leading-relaxed mb-4">
  At <span className="font-semibold text-gray-900">WunkatHomes</span>, our mission is to make quality living simple, affordable, and stress-free.  
  We provide thoughtfully designed rooms that bring comfort and convenience within reach.
</p>
<p className="text-lg text-gray-600 leading-relaxed mb-10">
  With transparent pricing, flexible bookings, and reliable service, we take the hassle out of finding your next home  
  so you can focus on what truly matters: living comfortably.
</p>

      <div className="flex items-center gap-6">
        <button className="px-8 py-3 bg-black text-white rounded-full font-medium hover:bg-gray-800 transition">
          Explore More
        </button>
        <button className="text-gray-700 hover:text-black font-medium transition">
          Our Vision →
        </button>
      </div>
    </div>

  </div>
</section>



        {/* Values */}
        <section className="py-20 md:py-32 bg-secondary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {values.map((value, idx) => {
                const Icon = value.icon
                return (
                  <Card key={idx} className="border border-border">
                    <CardHeader>
                      <Icon className="w-8 h-8 text-primary mb-4" />
                      <CardTitle>{value.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{value.description}</p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  )
}
