"use client"

import { Facebook02Icon, Instagram, Linkedin02FreeIcons, TwitterIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-primary text-white px-6 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          {/* Brand & Mission */}
          <div className="md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <h3 className="font-black text-2xl tracking-tighter">WunkatHomes</h3>
            </Link>
            <p className="text-white/70 text-sm leading-relaxed pr-4">
              Exclusive, company-owned smart homes. Find your space, sign digitally, and unlock seamlessly.
            </p>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-bold mb-6 tracking-tight text-white">Company</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li>
                <Link href="/about" className="hover:text-white transition-colors duration-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/properties" className="hover:text-white transition-colors duration-300">
                  Our Properties
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition-colors duration-300">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-bold mb-6 tracking-tight text-white">Support</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li>
                <Link href="/help-center" className="hover:text-white transition-colors duration-300">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors duration-300">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition-colors duration-300">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-bold mb-6 tracking-tight text-white">Legal</h4>
            <ul className="space-y-4 text-sm text-white/70">
              <li>
                <Link href="/terms" className="hover:text-white transition-colors duration-300">
                  Tenancy Terms
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-white transition-colors duration-300">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-white transition-colors duration-300">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-white/50 font-medium">
            © 2026 WunkatHomes. All rights reserved.
          </p>
          
          {/* Social Icons */}
          <div className="flex items-center gap-6">
            <Link href="#" className="text-white/50 hover:text-white transition-colors duration-300">
              <span className="sr-only">Facebook</span>
              <HugeiconsIcon icon={Facebook02Icon} className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-white/50 hover:text-white transition-colors duration-300">
              <span className="sr-only">Twitter</span>
              <HugeiconsIcon icon={TwitterIcon} className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-white/50 hover:text-white transition-colors duration-300">
              <span className="sr-only">Instagram</span>
              <HugeiconsIcon icon={Instagram} className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-white/50 hover:text-white transition-colors duration-300">
              <span className="sr-only">LinkedIn</span>
              <HugeiconsIcon icon={Linkedin02FreeIcons} className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}