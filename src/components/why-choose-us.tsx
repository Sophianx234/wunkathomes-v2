"use client"

import { CheckCircle, Clock, Shield01FreeIcons, Smile } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { motion } from "framer-motion"

const features = [
  { icon: CheckCircle, title: "Verified Rooms", desc: "Each space listed on WunkatHomes is personally verified for quality, comfort, and authenticity." },
  { icon: Shield01FreeIcons, title: "Secure Booking", desc: "Book confidently with encrypted transactions and trusted payment gateways." },
  { icon: Clock, title: "24/7 Support", desc: "Our dedicated team is available anytime you need assistance or guidance." },
  { icon: Smile, title: "Transparent Pricing", desc: "What you see is what you pay. No hidden costs, no surprises, just clarity." },
]

export default function WhyChooseUs() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-gray-800 text-white py-24">
      {/* Soft decorative background gradient overlay */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_left,rgba(255,255,255,0.15),transparent_60%)]" />

      <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 flex flex-col md:flex-row items-center gap-16">
        {/* Left Text Section */}
        <motion.div
          className="flex-1 space-y-8"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2
            className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            Why Choose <span className="text-gray-300">WunkatHomes?</span>
          </motion.h2>

          <motion.p
            className="text-gray-400 text-lg max-w-md leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            We’re redefining how you discover and book living spaces through verified listings, secure payments,
            and an unmatched rental experience built on trust and design excellence.
          </motion.p>

          <div className="mt-10 space-y-6">
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <motion.div
                  key={i}
                  className="flex items-start gap-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 * i }}
                  viewport={{ once: true }}
                >
                  <div className="flex-shrink-0 mt-1">
                    <HugeiconsIcon icon={Icon} className="w-6 h-6 text-white bg-gray-700/30 rounded-full p-1.5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{f.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Right Side Visual */}
        <motion.div
          className="flex-1 relative"
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <div className="absolute -inset-4 bg-gradient-to-tr from-white/10 to-transparent blur-3xl rounded-full" />
          <img
            src="/c-3.jpg"
            alt="Luxury Apartment"
            className="relative z-10 w-full rounded-3xl shadow-2xl object-cover"
          />
        </motion.div>
      </div>
    </section>
  )
}
