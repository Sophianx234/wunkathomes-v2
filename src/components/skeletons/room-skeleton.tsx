import { motion } from "framer-motion"

export default function RoomSkeleton({ index }: { index: number }) {
  return (
    <motion.div
      className="bg-white rounded-lg overflow-hidden shadow-sm animate-pulse cursor-pointer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.1 }}
    >
      {/* Image placeholder */}
      <div className="relative overflow-hidden h-48 bg-zinc-200" />

      {/* Content placeholder */}
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="h-6 w-20 bg-zinc-300 rounded"></div>
            <div className="h-4 w-10 bg-zinc-300 rounded"></div>
          </div>
          <div className="h-6 w-12 bg-zinc-300 rounded-full"></div>
        </div>

        <div>
          <div className="h-5 w-32 bg-zinc-300 rounded mb-1"></div>
          <div className="h-4 w-48 bg-zinc-200 rounded"></div>
        </div>

        <div className="flex gap-4 pt-2 border-t border-zinc-200/60">
          <div className="h-4 w-16 bg-zinc-300 rounded"></div>
          <div className="h-4 w-16 bg-zinc-300 rounded"></div>
        </div>

        <div className="h-3 w-24 bg-zinc-300 rounded"></div>
      </div>
    </motion.div>
  )
}
