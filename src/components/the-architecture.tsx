"use client"

import Image from "next/image"
import { motion } from "framer-motion"

// --- Leadership Dossier Data ---
const team = [
  {
    id: "01",
    name: "Sophian Abdul Rahman",
    role: "Founder & Chief Architect",
    focus: "Infrastructure & Product Vision",
    description: "Architected the WunkatHomes D2C platform and the proprietary ledger. Engineered the digital acquisition flow to completely eliminate third-party friction.",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "02",
    name: "Elena Rostova",
    role: "VP of Acquisitions",
    focus: "Portfolio & Quality Control",
    description: "Oversees the acquisition and verification of 100% of our properties. Ensures every asset meets the strict Wunkat Standard before hitting the platform.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2069&auto=format&fit=crop"
  },
  {
    id: "03",
    name: "David Chen",
    role: "Head of Infrastructure",
    focus: "IoT & Tuya Integration",
    description: "Leads the hardware-to-software bridge. Responsible for the seamless generation and encrypted delivery of Tuya smart-lock PINs the moment a lease clears.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: "04",
    name: "Sarah Jenkins",
    role: "Director of Legal",
    focus: "Digital Tenancy Agreements",
    description: "Transformed archaic real estate law into instantaneous, legally binding digital contracts that users can sign securely from their mobile devices.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2061&auto=format&fit=crop"
  }
]

export default function TheArchitects() {
  return (
    <section className="bg-[#050505] text-white py-24 md:py-32 relative overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.02] blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* === Editorial Header === */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-10 mb-16 md:mb-24">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="h-[1px] w-8 bg-white/30" />
              <span className="uppercase tracking-[0.3em] text-[10px] md:text-xs font-semibold text-white/50">
                The Architects
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-[1.1]">
              The operators behind <br className="hidden md:block" />
              <span className="text-white/40 italic font-light tracking-normal">the infrastructure.</span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="text-sm md:text-base text-white/50 font-light leading-relaxed max-w-sm md:text-right"
          >
            A multi-disciplinary team of software engineers, real estate veterans, and legal experts dedicated to erasing the middleman.
          </motion.p>
        </div>

        {/* === The Hairline Roster Grid === */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-white/15 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl"
        >
          {team.map((member) => (
            <div
              key={member.id}
              className="group relative bg-[#0a0a0a] flex flex-col h-[500px] md:h-[600px] overflow-hidden"
            >
              
              {/* === Background Image Layer === */}
              <div className="absolute inset-0 w-full h-full">
                <Image 
                  src={member.image} 
                  alt={member.name} 
                  fill 
                  className="object-cover object-top grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                />
              </div>

              {/* === Gradient Overlay === */}
              {/* Ensures text is ALWAYS readable, darkening further on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-500" />

              {/* === Content Layer === */}
              <div className="relative z-10 flex flex-col justify-between h-full p-8 md:p-10">
                
                {/* Top: ID Number */}
                <div className="self-end text-xs font-black tracking-widest text-white/30 group-hover:text-white transition-colors duration-500">
                  {member.id}
                </div>

                {/* Bottom: Text Content */}
                <div className="flex flex-col transform transition-transform duration-500 ease-out translate-y-2 group-hover:translate-y-0">
                  
                  {/* Focus Tag */}
                  <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/50 mb-3 group-hover:text-white/80 transition-colors duration-500">
                    {member.focus}
                  </div>
                  
                  {/* Name & Role */}
                  <h3 className="text-2xl md:text-3xl font-medium tracking-tight text-white mb-1">
                    {member.name}
                  </h3>
                  <p className="text-sm font-medium text-white/60 group-hover:text-white/80 transition-colors duration-500">
                    {member.role}
                  </p>

                  {/* 
                    The UX Fix: CSS Grid Expansion 
                    This creates a perfectly smooth layout shift without absolute positioning 
                  */}
                  <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-in-out">
                    <div className="overflow-hidden">
                      <p className="pt-4 text-sm font-light text-white/70 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                        {member.description}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          ))}
        </motion.div>

      </div>
    </section>
  )
}