"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { usePaystackPayment } from "react-paystack"
import { toast } from "sonner" 

import { 
  ArrowLeft01Icon, 
  CheckmarkBadge01Icon,
  CreditCardIcon,
  SmartPhone01Icon,
  Loading03Icon,
  Shield01Icon
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { IProperty } from "@/components/property-card"
import { verifyPaystackPayment } from "@/actions/payment.action"

interface CheckoutClientProps {
  listing: IProperty | any;
  currentUser?: { name: string; email: string; phone: string } | null;
}

export default function CheckoutClient({ listing, currentUser }: CheckoutClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Setup default move-in date to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().split('T')[0]

  // --- State ---
  const [formData, setFormData] = useState({
    legalName: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || ""
  })
  const [moveInDate, setMoveInDate] = useState(defaultDate)
  const [isProcessing, setIsProcessing] = useState(false)

  const USD_TO_GHS_RATE = 15.00; 
  const priceInGhs = listing.price * USD_TO_GHS_RATE;

  // Paystack Configuration
  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: formData.email,
    amount: Math.round(priceInGhs * 100), 
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
    currency: "GHS", 
    metadata: {
      custom_fields: [
        {
          display_name: "Tenant Name",
          variable_name: "tenant_name",
          value: formData.legalName,
        },
        {
          display_name: "Phone Number",
          variable_name: "phone_number",
          value: formData.phone,
        },
        {
          display_name: "Property Slug",
          variable_name: "property_slug",
          value: listing.slug,
        },
        {
          display_name: "Move-In Date",
          variable_name: "move_in_date",
          value: moveInDate,
        }
      ],
    },
  }

  // Initialize the Paystack Hook
  const initializePayment = usePaystackPayment(paystackConfig)

  const formatLocation = (loc: any) => {
    if (typeof loc === 'string') return loc;
    if (loc?.area && loc?.city) return `${loc.area}, ${loc.city}`;
    if (loc?.area && loc?.region) return `${loc.area}, ${loc.region}`;
    return "Location available upon booking";
  }

  // Handle Paystack Success & Close events
  const onSuccess = async (paystackResponse: any) => {
    toast.loading("Verifying your payment securely...", { id: "payment-toast" });

    // Call the Server Action, now passing the moveInDate
    const result = await verifyPaystackPayment(
      paystackResponse.reference, 
      listing._id, 
      priceInGhs,
      moveInDate 
    );

    if (result.success) {
      toast.success(result.message, { id: "payment-toast" });
      
      setTimeout(() => {
        router.push(`/checkout/success?reference=${paystackResponse.reference}`); 
      }, 1000); 
      
    } else {
      toast.error(result.message, { id: "payment-toast" });
      setIsProcessing(false);
    }
  }

  const onClose = () => {
    setIsProcessing(false)
    toast.error("Payment cancelled. Your reservation is not complete.")
  }

  // Form Submit Handler
  const handlePayment = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.legalName || !formData.phone || !moveInDate) {
      toast.error("Please complete all required details.")
      return
    }

    setIsProcessing(true)

    // Trigger the Paystack popup
    initializePayment({
      onSuccess,
      onClose
    })
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
            Secure Your New Home
          </h1>
          <p className="text-sm font-medium text-slate-500 mb-10">
            Enter your details below to reserve this property and start your move-in process.
          </p>

          <form onSubmit={handlePayment} className="space-y-8">
            
            {/* Legal Information Section */}
            <div className="bg-white p-6 md:p-8 rounded-xl border border-slate-200 ">
              <h2 className="text-sm font-bold uppercase tracking-widest mb-6 border-b border-slate-100 pb-4">
                Tenant Details
              </h2>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Full Name (Match with your Ghana Card)
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

                {/* Move-In Date Selector */}
                <div className="pt-2">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                    Expected Move-In Date
                  </label>
                  <input 
                    required
                    type="date" 
                    min={defaultDate}
                    value={moveInDate}
                    onChange={e => setMoveInDate(e.target.value)}
                    className="w-full p-4 border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-slate-50 focus:bg-white transition-all"
                  />
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">
                    Your digital lease and Smart Lock PIN will activate at 12:00 AM on this date.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit"
              disabled={isProcessing}
              className="w-full py-5 bg-zinc-950 text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-3 disabled:opacity-70"
            >
              {isProcessing && <HugeiconsIcon icon={Loading03Icon} size={18} className="animate-spin" />}
              {isProcessing ? "Connecting to Paystack..." : `Pay $${listing.price.toLocaleString()} Securely`}
              {!isProcessing && <HugeiconsIcon icon={Shield01Icon} size={18} />}
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
                WunkatHomes does not store your payment details.
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
                <Image src={listing.images[0] || '/placeholder.jpg'} alt={listing.title} fill className="object-cover" />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  {listing.property?.propertyType?.replace('_', ' ')} • {formatLocation(listing.property?.location)}
                </span>
                <h3 className="text-sm font-black uppercase tracking-tight leading-snug">
                  {listing.title}
                </h3>
              </div>
            </div>

            {/* Price Breakdown */}
            <h4 className="text-sm font-bold uppercase tracking-widest mb-4">Payment Summary</h4>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                <span>Total Rent</span>
                <span>${listing.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                <span>Agency Fees</span>
                <span className="text-green-600 font-bold">Free (Direct to Owner)</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-bold uppercase tracking-widest text-slate-500">
                  Total Due Today
                </span>
                <span className="text-xl font-black text-black">
                  ${listing.price.toLocaleString()}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed mt-2">
                This payment instantly secures the property and locks in your reservation. You're one step closer to your new home!
              </p>
            </div>

            <div className="mt-8 flex items-start gap-3 bg-green-50 p-4 rounded-lg border border-green-100">
              <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-[10px] font-bold uppercase tracking-widest text-green-800 leading-relaxed">
                Once payment is successful, your digital Tenancy Agreement and Smart Lock PIN will be generated instantly.
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  )
}