"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Envelope } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function NewsLetter() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus("");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        const data = await res.json();
        setStatus(data.message);
        setEmail("");
      } else {
        setStatus("Failed to subscribe. Try again.");
      }
    } catch (err) {
      setStatus("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative bg-white overflow-hidden">
      <div className="grid md:grid-cols-2">
        {/* Left Image Section */}
        <motion.div
          className="relative h-[400px] md:h-auto"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <img
            src="/c-1.jpg"
            alt="Elegant modern home exterior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
          <motion.div
            className="absolute bottom-6 left-6 text-white md:hidden"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-semibold">Luxury Meets Lifestyle</h3>
            <p className="text-sm text-gray-200">
              Curated spaces, crafted for comfort.
            </p>
          </motion.div>
        </motion.div>

        {/* Right Content Section */}
        <div className="flex items-center justify-center px-8 md:px-16 py-20 bg-gray-50 relative overflow-hidden">
          <motion.div
            className="max-w-md text-center md:text-left space-y-8 relative z-10"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.3 }}
          >
            {/* Subheading */}
            <motion.div
              className="inline-flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-full text-sm uppercase tracking-wide"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <HugeiconsIcon icon={Envelope} className="w-4 h-4" />
              <span>Join Our Community</span>
            </motion.div>

            {/* Heading */}
            <motion.h2
              className="text-4xl md:text-5xl font-semibold leading-tight text-gray-900"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              Get Exclusive <br />
              <span className="font-light text-gray-700">
                Real Estate Insights
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-gray-600 text-lg leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              Receive exclusive updates on new properties, market insights, and
              smart investment opportunities from WunkatHomes.
            </motion.p>

            {/* Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-3"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1 px-5 py-4 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400 bg-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full bg-primary text-white font-medium hover:bg-gray-900 transition-all duration-300"
              >
                {loading ? "Subscribing..." : "Subscribe"}
                <HugeiconsIcon
                  icon={ArrowRight}
                  className="w-4 h-4 transform transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </motion.form>

            {/* Status */}
            <motion.p
              className={`text-sm mt-2 pl-4 ${
                status.includes("successfully")
                  ? "text-green-600"
                  : "text-red-600"
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: status ? 1 : 0 }}
              transition={{ duration: 0.5 }}
            >
              {status} {status.includes("successfully") ? "🎉" : ""}
            </motion.p>

            {/* Note */}
            <motion.p
              className="text-xs text-gray-500"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
            >
              We respect your privacy. Unsubscribe anytime.
            </motion.p>
          </motion.div>

          {/* Decorative Glow */}
          <motion.div
            className="absolute top-10 right-10 w-24 h-24 bg-gradient-to-tr from-gray-200 to-transparent rounded-full blur-2xl opacity-40"
            animate={{ y: [0, -10, 0], opacity: [0.4, 0.6, 0.4] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </section>
  );
}
