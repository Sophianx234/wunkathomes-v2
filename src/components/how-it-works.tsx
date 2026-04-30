"use client"

import { CalendarCheck, CreditCard, Search } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion"

const steps = [
  {
    icon: Search,
    number: "01",
    title: "Explore Properties",
    description:
      "Discover a curated selection of WunkatHomes rooms designed for comfort and convenience. Find the perfect space that suits your lifestyle.",
  },
  {
    icon: CalendarCheck,
    number: "02",
    title: "Book & Subscribe",
    description:
      "Choose your preferred room and subscription period. Enjoy a seamless booking process with instant confirmation and flexible renewal options.",
  },
  {
    icon: CreditCard,
    number: "03",
    title: "Make Secure Payments",
    description:
      "Complete your subscription through our secure, transparent payment system. Your comfort and trust are our priority.",
  },
];


export default function HowItWorks() {
  return (
    <section id="how" className="py-16 md:py-24 px-6 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            How It Works
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-gray-600 text-lg max-w-2xl mx-auto"
          >
            Three simple steps to find and secure your dream home.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors duration-300">
                    <HugeiconsIcon icon={Icon}  className="w-6 h-6" />
                  </div>
                  <span className="text-3xl font-bold text-gray-200 group-hover:text-gray-300">
                    {step.number}
                  </span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600 leading-relaxed">{step.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
