"use client"

import { Quote, Star } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { motion } from "framer-motion"

const testimonials = [
  {
    id: 1,
    name: "Sarah Johnson",
    role: "Tenant at WunkatHomes",
    quote:
      "Booking my room was so simple, and renewing my stay took just a few clicks. WunkatHomes made everything stress-free and reliable.",
    rating: 5,
    avatar: "/professional-woman-avatar.jpg",
  },
  {
    id: 2,
    name: "Michael Chen",
    role: "Long-term Resident",
    quote:
      "I’ve been staying with WunkatHomes for over a year. The spaces are well-maintained, affordable, and the renewal process couldn’t be easier.",
    rating: 5,
    avatar: "/professional-man-avatar.jpg",
  },
  {
    id: 3,
    name: "Emma Rodriguez",
    role: "Student Renter",
    quote:
      "WunkatHomes helped me find a comfortable and safe place near my campus. Transparent pricing, quick support — everything just works.",
    rating: 5,
    avatar: "/professional-woman-avatar-2.jpg",
  },
];


export default function Testimonials() {
  return (
    <section id="testimonials" className="py-16 md:py-24 px-6 bg-zinc-50/50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true, amount: 0.2 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-4">What Our Users Say</h2>
          <p className="text-zinc-600 text-lg">Thousands of happy renters trust HomesWunkat.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
           <motion.div
  key={testimonial.id}
  className="bg-white p-8 rounded-lg shadow-sm hover:shadow-sm transition-shadow duration-300 flex flex-col justify-between min-h-[320px]" // 👈 key line
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, delay: index * 0.2 }}
  viewport={{ once: true, amount: 0.2 }}
>
  <div>
    <div className="flex items-center gap-1 mb-4">
      {[...Array(testimonial.rating)].map((_, i) => (
        <HugeiconsIcon icon={Star} key={i} className="w-4 h-4 text-zinc-800" />
      ))}
    </div>

    <div className="flex items-start gap-3 mb-6">
      <HugeiconsIcon icon={Quote} className="w-5 h-5 text-zinc-300 flex-shrink-0 mt-1" />
      <p className="text-zinc-700 leading-relaxed">{testimonial.quote}</p>
    </div>
  </div>

  <div className="flex items-center gap-3 border-t border-zinc-200/60 pt-6 mt-auto">
    <img
      src={`/images/${testimonial.avatar}` || "/placeholder.svg"}
      alt={testimonial.name}
      className="w-12 h-12 rounded-full object-cover"
    />
    <div>
      <p className="font-semibold text-zinc-900">{testimonial.name}</p>
      <p className="text-sm text-zinc-600">{testimonial.role}</p>
    </div>
  </div>
</motion.div>

          ))}
        </div>
      </div>
    </section>
  )
}
