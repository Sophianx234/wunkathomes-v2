'use client'
import Image from "next/image"
import Link from "next/link"

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-bold text-lg z-50 group shrink-0">
            <div className="relative size-10">
              <Image
                fill  
                alt="WunkatHomes logo" 
                src="/images/home.png" 
                className="object-contain size-10 transition-transform" 
              />
            </div>
            <span className="pt-2 text-primary hidden sm:block tracking-tight text-zinc-800">
              Wunkat<span className="text-zinc-500">Homes</span>
            </span>
          </Link>
  )
}

export default Logo
