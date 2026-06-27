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
import { verifyPaystackPayment } from "@/actions/user/payment.action"
import { LoginModal } from "@/components/login-modal"

interface CheckoutClientProps {
  listing: IProperty | any;
  currentUser?: {id:string; name: string; email: string; phone: string } | null;
}

export default function CheckoutClient({ listing, currentUser }: CheckoutClientProps) {
  const searchParams = useSearchParams()
  const router = useRouter()
    console.log("Listing:", listing) 

  
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

  const priceInGhs = listing.price ;

  // Paystack Configuration
  const paystackConfig = {
    reference: new Date().getTime().toString(),
    email: formData.email,
    amount: Math.round(priceInGhs * 100), 
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
    currency: "GHS", 
    metadata: {
      userId: currentUser?.id, 
      listingId: listing.id,
      moveInDate: moveInDate,
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

    const result = await verifyPaystackPayment(
      paystackResponse.reference, 
      listing.id, 
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
    initializePayment({
      onSuccess,
      onClose
    })
  }

  return (
    <main className="min-h-screen bg-zinc-50/50 text-black py-6 md:py-24 px-2 md:px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      
      {/* Top Nav */}
      <div className="max-w-6xl mx-auto mb-5 md:mb-10 px-2 md:px-0">
        <Link href={`/properties/${listing.slug}`} className="inline-flex items-center gap-1 md:gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors">
          <span className="scale-75 md:scale-100 flex items-center">
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          </span>
          Return to Property
        </Link>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-20 px-2 md:px-0">
        
        {/* --- LEFT COLUMN: Form & Payment --- */}
        <div className="lg:col-span-7 flex flex-col">
          <h1 className="text-xl md:text-4xl font-black uppercase tracking-tight mb-1 md:mb-2">
            Secure Your New Home
          </h1>
          <p className="text-xs md:text-sm font-medium text-zinc-500 mb-5 md:mb-10">
            Enter your details below to reserve this property and start your move-in process.
          </p>

          <form onSubmit={handlePayment} className="space-y-4 md:space-y-8 w-full max-w-full box-border">
            
            {/* Legal Information Section */}
            <div className="bg-white p-3 md:p-8 rounded-lg border border-zinc-200/60 w-full max-w-full box-border">
              <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest mb-3 md:mb-6 border-b border-zinc-200/60 pb-2 md:pb-4">
                Tenant Details
              </h2>
              
              <div className="space-y-2.5 md:space-y-5 w-full max-w-full box-border">
                <div className="w-full min-w-0 max-w-full box-border">
                  <label className="block text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1 md:mb-2">
                    Full Name (Match with your Ghana Card)
                  </label>
                  <input 
                    required
                    type="text" 
                    value={formData.legalName}
                    onChange={e => setFormData({...formData, legalName: e.target.value})}
                    className="block w-full min-w-0 max-w-full box-border m-0 p-2 md:p-4 border border-slate-300 rounded-lg text-xs md:text-sm font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-zinc-50/50 focus:bg-white transition-all appearance-none"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-5 w-full max-w-full box-border">
                  <div className="w-full min-w-0 max-w-full box-border">
                    <label className="block text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1 md:mb-2">
                      Email Address
                    </label>
                    <input 
                      required
                      type="email" 
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="block w-full min-w-0 max-w-full box-border m-0 p-2 md:p-4 border border-slate-300 rounded-lg text-xs md:text-sm font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-zinc-50/50 focus:bg-white transition-all appearance-none"
                    />
                  </div>
                  <div className="w-full min-w-0 max-w-full box-border">
                    <label className="block text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1 md:mb-2">
                      WhatsApp Number
                    </label>
                    <input 
                      required
                      type="tel" 
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                      className="block w-full min-w-0 max-w-full box-border m-0 p-2 md:p-4 border border-slate-300 rounded-lg text-xs md:text-sm font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-zinc-50/50 focus:bg-white transition-all appearance-none"
                    />
                  </div>
                </div>

                {/* Move-In Date Selector */}
                <div className="pt-1 md:pt-2 w-full min-w-0 max-w-full box-border">
                  <label className="block text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1 md:mb-2">
                    Expected Move-In Date
                  </label>
                  <input 
                    required
                    type="date" 
                    min={defaultDate}
                    value={moveInDate}
                    onChange={e => setMoveInDate(e.target.value)}
                    className="block w-full min-w-0 max-w-full box-border m-0 p-2 md:p-4 border border-slate-300 rounded-lg text-xs md:text-sm font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-zinc-50/50 focus:bg-white transition-all appearance-none"
                  />
                  <p className="text-[8px] md:text-[10px] text-zinc-400 mt-1 md:mt-2 font-medium break-words">
                    Your digital lease and Smart Lock PIN will activate at 12:00 AM on this date.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            {currentUser ? (
              <button 
                type="submit"
                disabled={isProcessing}
                className="block w-full min-w-0 max-w-full box-border py-2.5 md:py-5 bg-zinc-950 text-white font-black uppercase tracking-widest text-[10px] md:text-sm rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5 md:gap-3 disabled:opacity-70 m-0"
              >
                {isProcessing && (
                  <span className="scale-75 md:scale-100 flex items-center">
                    <HugeiconsIcon icon={Loading03Icon} size={18} className="animate-spin" />
                  </span>
                )}
                {isProcessing ? "Connecting..." : `Pay $${listing.price.toLocaleString()} Securely`}
                {!isProcessing && (
                  <span className="scale-75 md:scale-100 flex items-center">
                     <HugeiconsIcon icon={Shield01Icon} size={18} />
                  </span>
                )}
              </button>
            ) : (
              <LoginModal>
                <button 
                  type="button"
                  className="block w-full min-w-0 max-w-full box-border py-2.5 md:py-5 bg-zinc-950 text-white font-black uppercase tracking-widest text-[10px] md:text-sm rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5 md:gap-3 m-0"
                >
                  Log in to Pay ${listing.price.toLocaleString()} Securely
                  <span className="scale-75 md:scale-100 flex items-center">
                     <HugeiconsIcon icon={Shield01Icon} size={18} />
                  </span>
                </button>
              </LoginModal>
            )}

            {/* Trust Badges */}
            <div className="flex flex-col items-center gap-2 md:gap-4 mt-3 md:mt-6 w-full box-border">
              <div className="flex items-center gap-3 md:gap-6 text-zinc-400">
                <span className="flex items-center gap-1 md:gap-1.5 text-[9px] md:text-xs font-bold uppercase tracking-widest">
                  <span className="scale-75 md:scale-100 flex items-center">
                     <HugeiconsIcon icon={CreditCardIcon} size={16} />
                  </span>
                  Card
                </span>
                <span className="flex items-center gap-1 md:gap-1.5 text-[9px] md:text-xs font-bold uppercase tracking-widest">
                  <span className="scale-75 md:scale-100 flex items-center">
                     <HugeiconsIcon icon={SmartPhone01Icon} size={16} />
                  </span>
                  Mobile Money
                </span>
              </div>
              <p className="text-[8px] md:text-[10px] text-center font-bold text-zinc-500 uppercase tracking-widest leading-relaxed break-words px-2">
                Payments are processed securely via Paystack. <br/> 
                WunkatHomes does not store your payment details.
              </p>
            </div>
          </form>
        </div>

        {/* --- RIGHT COLUMN: Order Summary --- */}
        <div className="lg:col-span-5 w-full box-border">
          <div className="sticky top-6 md:top-12 bg-white p-3 md:p-8 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full box-border">
            
            {/* Property Preview Card */}
            <div className="flex gap-2 md:gap-4 mb-4 md:mb-8 pb-4 md:pb-8 border-b border-zinc-200/60 w-full box-border">
              <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-lg overflow-hidden shrink-0 bg-zinc-100/50">
                <Image src={listing?.images?.[0] || '/a-1.jpg'} alt={listing?.title}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                
                fill className="object-cover" />
              </div>
              <div className="flex flex-col justify-center min-w-0 pr-2">
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-0.5 md:mb-1 truncate">
                  {listing?.property?.propertyType?.replace('_', ' ')} • {formatLocation(listing?.property?.location)}
                </span>
                <h3 className="text-xs md:text-sm font-black uppercase tracking-tight leading-snug break-words line-clamp-2">
                  {listing?.title}
                </h3>
              </div>
            </div>

            {/* Price Breakdown */}
            <h4 className="text-xs md:text-sm font-bold uppercase tracking-widest mb-2 md:mb-4">Payment Summary</h4>
            
            <div className="space-y-2 md:space-y-4 mb-3 md:mb-6 w-full box-border">
              <div className="flex justify-between items-center text-xs md:text-sm font-medium text-zinc-600">
                <span>Total Rent</span>
                <span>${listing.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs md:text-sm font-medium text-zinc-600">
                <span>Agency Fees</span>
                <span className="text-green-600 font-bold text-[10px] md:text-sm">Free</span>
              </div>
            </div>

            <div className="p-2 md:p-4 bg-zinc-50/50 border border-zinc-200/60 rounded-lg mb-3 md:mb-6 w-full box-border">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Total Due
                </span>
                <span className="text-lg md:text-xl font-black text-black">
                  ${listing.price.toLocaleString()}
                </span>
              </div>
              <p className="text-[8px] md:text-[10px] text-zinc-500 font-medium leading-relaxed mt-1 md:mt-2 break-words">
                This payment instantly secures the property and locks in your reservation.
              </p>
            </div>

            <div className="mt-4 md:mt-8 flex items-start gap-1.5 md:gap-3 bg-green-50 p-2 md:p-4 rounded-lg border border-green-100 w-full box-border">
              <span className="scale-75 md:scale-100 shrink-0 mt-0.5 flex items-center">
                 <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} className="text-green-600" />
              </span>
              <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-green-800 leading-relaxed break-words">
                Once payment is successful, your digital Tenancy Agreement and Smart Lock PIN will be generated instantly.
              </p>
            </div>

          </div>
        </div>

      </div>
    </main>
  )
}
