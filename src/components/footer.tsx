"use client"

import { Facebook02Icon, Instagram, Linkedin02FreeIcons, TwitterIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 px-6 py-12 md:py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="font-bold text-white mb-4">HomesWunkat</h3>
            <p className="text-sm leading-relaxed">
              Making home renting simple, transparent, and accessible to everyone.
            </p>
          </div>

          <div>
  <h4 className="font-semibold text-white mb-4">Company</h4>
  <ul className="space-y-2 text-sm">
    <li>
      <Link href="/about" className="hover:text-white transition-colors">
        About Us
      </Link>
    </li>
    <li>
      <Link href="/blog" className="hover:text-white transition-colors">
        Blog
      </Link>
    </li>
    <li>
      <Link href="/careers" className="hover:text-white transition-colors">
        Careers
      </Link>
    </li>
  </ul>
</div>

<div>
  <h4 className="font-semibold text-white mb-4">Support</h4>
  <ul className="space-y-2 text-sm">
    <li>
      <Link href="/help-center" className="hover:text-white transition-colors">
        Help Center
      </Link>
    </li>
    <li>
      <Link href="/contact" className="hover:text-white transition-colors">
        Contact
      </Link>
    </li>
    <li>
      <Link href="/faq" className="hover:text-white transition-colors">
        FAQ
      </Link>
    </li>
  </ul>
</div>

<div>
  <h4 className="font-semibold text-white mb-4">Legal</h4>
  <ul className="space-y-2 text-sm">
    <li>
      <Link href="/terms" className="hover:text-white transition-colors">
        Terms
      </Link>
    </li>
    <li>
      <Link href="/privacy" className="hover:text-white transition-colors">
        Privacy
      </Link>
    </li>
    <li>
      <Link href="/cookies" className="hover:text-white transition-colors">
        Cookies
      </Link>
    </li>
  </ul>
</div>

        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-gray-400">© 2025 HomesWunkat. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="#" className="hover:text-white transition-colors">
                <HugeiconsIcon icon={Facebook02Icon}  className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <HugeiconsIcon icon={TwitterIcon} className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <HugeiconsIcon icon={Instagram} className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <HugeiconsIcon icon={Linkedin02FreeIcons} className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
