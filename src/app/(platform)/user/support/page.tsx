"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  Search01Icon, 
  ArrowDown01Icon, 
  ArrowRight01Icon,
  UserCircleIcon, 
  CreditCardPosIcon, 
  File01Icon, 
  Wrench01Icon,
  Call02Icon,
  Mail01Icon,
  Home09Icon
} from "@hugeicons/core-free-icons"

// --- Mock Data Tailored to Property Management ---
const supportCategories = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: UserCircleIcon,
    description: "Account setup, saving homes, and scheduling tours."
  },
  {
    id: "payments",
    title: "Payments & Rent",
    icon: CreditCardPosIcon,
    description: "Invoices, payment methods, and auto-pay setup."
  },
  {
    id: "leasing",
    title: "Leases & Contracts",
    icon: File01Icon,
    description: "Signing, renewing, or terminating your lease."
  },
  {
    id: "maintenance",
    title: "Maintenance",
    icon: Wrench01Icon,
    description: "Submitting requests and emergency contacts."
  }
]

const faqs = [
  {
    question: "How do I pay my rent online?",
    answer: "You can pay your rent directly through the 'Payments' tab in your dashboard. We accept major credit cards, debit cards, and direct bank transfers (ACH). You can also set up Auto-Pay to ensure you never miss a deadline."
  },
  {
    question: "How secure is my payment and personal information?",
    answer: "Your security is our top priority. All payment transactions are encrypted using bank-level AES-256 encryption and processed through certified third-party payment gateways. We do not store your raw credit card numbers on our servers."
  },
  {
    question: "How do I submit a maintenance request?",
    answer: "Log into your account, navigate to your active lease, and click 'Request Maintenance'. Please provide a detailed description of the issue and attach photos if possible. Our team aims to respond to all non-emergency requests within 24 hours."
  },
  {
    question: "What happens if I need to break my lease early?",
    answer: "Breaking a lease early is subject to the terms outlined in your specific contract. Typically, this involves a notice period and an early termination fee. Please contact your property manager directly through the portal to discuss your options."
  },
  {
    question: "How do I schedule a tour for a property?",
    answer: "Navigate to the property listing you are interested in and click the 'Schedule a Tour' button. You can select an available date and time that works best for you. A confirmation will be sent to your email and WhatsApp."
  }
]

export default function HelpAndSupportPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("payments") // Default active tab
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(1) // Open second FAQ by default

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-24">
      
      {/* --- HERO & SEARCH SECTION --- */}
      <section className="bg-white border-b border-slate-200 pt-16 pb-20 px-4 relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-slate-100/50 rounded-full blur-3xl -z-10 pointer-events-none" />
        
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Hello, how can we help?
          </h1>
          <p className="text-slate-500 text-lg mb-10">
            Search our knowledge base or browse categories below.
          </p>

          <form 
            onSubmit={(e) => e.preventDefault()} 
            className="relative max-w-2xl mx-auto flex items-center bg-white border border-slate-200 rounded-2xl shadow-sm p-1.5 focus-within:ring-2 focus-within:ring-zinc-950/20 focus-within:border-zinc-950 transition-all"
          >
            <div className="pl-4 pr-2 text-slate-400">
              <HugeiconsIcon icon={Search01Icon} size={20} />
            </div>
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask a question... (e.g. 'How to pay rent')"
              className="w-full py-3 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none text-[15px]"
            />
            <button 
              type="submit"
              className="bg-zinc-950 hover:bg-zinc-800 text-white px-6 py-3 rounded-xl font-medium transition-colors shrink-0"
            >
              Search
            </button>
          </form>
          
          <p className="text-xs text-slate-400 mt-6 uppercase tracking-wider font-semibold">
            Or choose a category to quickly find the help you need
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        
        {/* --- CATEGORY CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {supportCategories.map((category) => {
            const isActive = activeCategory === category.id
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex flex-col items-center text-center p-6 rounded-2xl bg-white border transition-all duration-200 ${
                  isActive 
                    ? "border-zinc-950 shadow-md ring-1 ring-zinc-950 scale-105" 
                    : "border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md hover:-translate-y-1"
                }`}
              >
                <div className={`p-3 rounded-full mb-4 transition-colors ${
                  isActive ? "bg-zinc-950 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  <HugeiconsIcon icon={category.icon} size={24} />
                </div>
                <h3 className={`font-semibold text-[15px] mb-2 ${isActive ? "text-zinc-950" : "text-slate-800"}`}>
                  {category.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {category.description}
                </p>
              </button>
            )
          })}
        </div>

        {/* --- FAQ ACCORDION SECTION --- */}
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 md:p-12 mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">Frequently Asked Questions</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Everything you need to know about managing your home, payments, and account on WunkatHomes.
            </p>
          </div>

          <div className="max-w-3xl mx-auto divide-y divide-slate-100">
            {faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index
              
              return (
                <div key={index} className="py-2">
                  <button
                    onClick={() => toggleFaq(index)}
                    className="flex w-full items-center justify-between py-4 text-left focus:outline-none group"
                  >
                    <span className={`font-medium pr-4 transition-colors ${isOpen ? "text-zinc-950" : "text-slate-700 group-hover:text-zinc-950"}`}>
                      {faq.question}
                    </span>
                    <div className={`p-1 rounded-full border transition-all duration-300 shrink-0 flex items-center justify-center ${
                      isOpen ? "bg-zinc-950 border-zinc-950 text-white" : "bg-white border-slate-200 text-slate-400 group-hover:border-slate-300"
                    }`}>
                      <HugeiconsIcon 
                        icon={ArrowDown01Icon} 
                        size={16} 
                        className={`transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`} 
                      />
                    </div>
                  </button>
                  
                  {/* Framer Motion for buttery smooth height expansion */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <p className="pb-6 text-[15px] leading-relaxed text-slate-600 pr-12">
                          {faq.answer}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </section>

        {/* --- BOTTOM CONTACT SECTION --- */}
        <section className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">You still have a question?</h2>
          <p className="text-slate-500 mb-10 max-w-lg mx-auto">
            If you cannot find the answer to your question in our FAQ, you can always contact us. We will answer you shortly!
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            
            {/* Phone Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-4">
                <HugeiconsIcon icon={Call02Icon} size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">+ (233) 000-000-000</h3>
              <p className="text-sm text-slate-500 mb-4">We are always happy to help.</p>
              <button className="text-sm font-semibold text-zinc-950 flex items-center gap-1 hover:underline underline-offset-4">
                Call us now <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </button>
            </div>

            {/* Email Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center hover:shadow-md transition-shadow">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 mb-4">
                <HugeiconsIcon icon={Mail01Icon} size={24} />
              </div>
              <h3 className="font-bold text-slate-900 text-lg mb-1">support@wunkathomes.com</h3>
              <p className="text-sm text-slate-500 mb-4">The best way to get an answer faster.</p>
              <button className="text-sm font-semibold text-zinc-950 flex items-center gap-1 hover:underline underline-offset-4">
                Send an email <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </button>
            </div>

          </div>
        </section>

      </div>
    </div>
  )
}
