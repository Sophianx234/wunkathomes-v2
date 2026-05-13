"use client"

import { useState, useEffect, use } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { 
  ArrowLeft01Icon, 
  Shield01Icon, 
  LockKeyIcon, 
  CheckmarkBadge01Icon,
  CreditCardIcon,
  SmartPhone01Icon
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { inventory } from "@/lib/data" 

// NEXT.JS 15 FIX: Type params as a Promise
interface CheckoutPageProps {
  params: Promise<{ slug: string }>
}

export default function CheckoutPage(props: CheckoutPageProps) {
  // NEXT.JS 15 FIX: Unwrap the params promise using React.use()
  const params = use(props.params)
  const slug = params.slug

  const searchParams = useSearchParams()
  const type = searchParams.get('type') 

  // --- State ---
  const [listing, setListing] = useState<any>(null)
  const [formData, setFormData] = useState({
    legalName: "",
    email: "",
    phone: ""
  })
  const [isProcessing, setIsProcessing] = useState(false)

  // Fetch listing using the unwrapped slug
  useEffect(() => {
    const found = inventory.find(item => item.slug === slug)
    setListing(found)
  }, [slug])

  if (!listing) return <div className="min-h-screen flex items-center justify-center font-black uppercase tracking-widest text-sm text-slate-500">Loading Ledger...</div>

  const isRent = listing.listingType === "For_Rent"
  
  // Calculate the deposit
  const depositAmount = isRent ? 500 : listing.price * 0.05
  const remainingBalance = listing.price - depositAmount

  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)

    // Mocking network delay for Paystack initialization
    setTimeout(() => {
      alert(`Paystack Modal Triggered for ${formData.email}. Amount: $${depositAmount}`)
      setIsProcessing(false)
    }, 1500)
  }

  return (
    <main className="min-h-screen bg-slate-50 text-black py-12 md:py-24 px-4 sm:px-6 lg:px-8">
      
      {/* Top Nav */}
      <div className="max-w-6xl mx-auto mb-10">
        <Link href={`/properties/${listing.slug}`} className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-black transition-colors">
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Return to Property
        </Link>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        
        {/* --- LEFT COLUMN: Form & Payment --- */}
        <div className="lg:col-span-7 flex flex-col">
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">
            Secure Your Asset
          </h1>
          <p className="text-sm font-medium text-slate-500 mb-10">
            Complete the ledger below to place a 72-hour hold on this property.
          </p>

          <form onSubmit={handlePayment} className="space-y-8">
            
            {/* Legal Information Section */}
            <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                Digital Contract Details
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Full Legal Name (As shown on ID)
                  </label>
                  <input 
                    required
                    type="text" 
                    value={formData.legalName}
                    onChange={e => setFormData({...formData, legalName: e.target.value})}
                    className="w-full p-4 border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-slate-50 focus:bg-white transition-all"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Email Address
                    </label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full p-4 border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-slate-50 focus:bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                      WhatsApp Number
                    </label>
                    <input 
                      required
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="w-full p-4 border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-slate-50 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isProcessing}
              className="w-full py-5 bg-black text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-slate-800 transition-colors shadow-xl shadow-black/20 flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isProcessing ? "Initializing Secure Ledger..." : `Pay $${depositAmount.toLocaleString()} via Paystack`}
              {!isProcessing && <HugeiconsIcon icon={LockKeyIcon} size={18} />}
            </button>

            {/* Trust Badges */}
            <div className="flex flex-col items-center gap-4 mt-6">
              <div className="flex items-center gap-6 text-slate-400">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                  <HugeiconsIcon icon={CreditCardIcon} size={16} /> Card
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                  <HugeiconsIcon icon={SmartPhone01Icon} size={16} /> Mobile Money
                </span>
              </div>
              <p className="text-[10px] text-center font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                Payments are processed securely via Paystack. <br/> 
                WunkatHomes does not store your card details.
              </p>
            </div>
          </form>
        </div>

        {/* --- RIGHT COLUMN: Order Summary --- */}
        <div className="lg:col-span-5">
          <div className="sticky top-12 bg-white p-6 md:p-8 rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            
            {/* Property Preview Card */}
            <div className="flex gap-4 mb-8 pb-8 border-b border-slate-100">
              <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-100">
                <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  {listing.property.propertyType} • {listing.property.location}
                </span>
                <h3 className="text-sm font-black uppercase tracking-tight leading-snug">
                  {listing.title}
                </h3>
              </div>
            </div>

            {/* Price Breakdown */}
            <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Financial Ledger</h4>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                <span>{isRent ? 'Annual Rent Valuation' : 'Asset Price'}</span>
                <span>${listing.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                <span>Broker Commissions</span>
                <span className="text-green-600 font-bold">$0.00</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Due Today (Refundable Hold)
                </span>
                <span className="text-xl font-black text-black">
                  ${depositAmount.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-2">
                This deposit secures the asset for 72 hours. If you decline the property after physical inspection, this amount is instantly refunded.
              </p>
            </div>

            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                Remaining Balance
              </span>
              <span className="text-sm font-black text-slate-400">
                ${remainingBalance.toLocaleString()}
              </span>
            </div>

            <div className="mt-8 flex items-start gap-3 bg-green-50 p-4 rounded-lg border border-green-100">
              <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-green-800 leading-relaxed">
                Your digital tenancy agreement will be generated automatically after payment clearance.
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  )
}