"use client"

import Image from "next/image"
import { motion } from "framer-motion"

// --- Warm, approachable team descriptions ---
const team = [
  {
    id: "01",
    name: "Sophian Abdul Rahman",
    role: "Founder & CEO",
    focus: "Platform Vision",
    description: "Dedicated to building a platform that makes finding, booking, and securing your home completely effortless.",
    image: "https://images.unsplash.com/photo-1556157382-97eda2d62296?q=80&w=2070&auto=format&fit=crop"
  },
  {
    id: "02",
    name: "Elena Rostova",
    role: "Head of Guest Experience",
    focus: "Home Quality",
    description: "Ensures every property meets our strict standards for comfort, design, and safety before you ever step through the door.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=2069&auto=format&fit=crop"
  },
  {
    id: "03",
    name: "David Chen",
    role: "Head of Engineering",
    focus: "Smart Access",
    description: "Builds the smart-home systems that keep your space secure and make your digital move-in process feel like magic.",
    image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: "04",
    name: "Sarah Jenkins",
    role: "Head of Trust & Safety",
    focus: "Secure Agreements",
    description: "Simplifies the complex world of real estate, ensuring your digital leases are secure, straightforward, and easy to understand.",
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=2061&auto=format&fit=crop"
  }
]

export default function TheTeam() {
  return (
    <section className="bg-[#050505] text-white py-24 relative overflow-hidden">
      
      {/* Subtle Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/[0.02] blur-[100px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* === Minimal Header === */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex items-center gap-3 mb-10 md:mb-16"
        >
          <div className="h-[1px] w-8 bg-white/30" />
          <span className="uppercase tracking-[0.3em] text-[10px] md:text-xs font-semibold text-white/50">
            Our Team
          </span>
        </motion.div>

        {/* === The Hairline Roster Grid === */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-white/10 rounded-2xl md:rounded-[2rem] overflow-hidden shadow-2xl"
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
                  unoptimized
                  className="object-cover object-top grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700 ease-out"
                />
              </div>

              {/* === Gradient Overlay === */}
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

                  {/* Smooth Dropdown Description */}
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
