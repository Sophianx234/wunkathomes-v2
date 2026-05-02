
import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { 
  Location01Icon, 
  BedSingle02Icon, 
  Bathtub01Icon, 
  MaximizeIcon,
  Key01Icon,
  CheckmarkBadge01Icon,
  Calendar01Icon,
  Shield
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { inventory } from "@/lib/data"

// === Next.js 15 Async Params ===
interface PropertyPageProps {
  params: Promise<{ slug: string }>
}

// === Mock Database Fetch ===
// In production: await Listing.findOne({ slug }).populate('propertyId')
async function getListingBySlug(slug: string) {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return inventory.find((listing) => listing.slug === slug) || null
}

export default async function PropertyDetailsPage({ params }: PropertyPageProps) {
  // NEXT.JS 15: Must await params
  const { slug } = await params
  const listing = await getListingBySlug(slug)

  if (!listing) {
    notFound()
  }

  // FIXED: Check listingType instead of status
  const isRent = listing.listingType === "For_Rent"

  // UX FIX: Safe fallbacks for the image gallery. 
  // If the DB only returns 1 image, we duplicate it into the grid so the cinematic layout doesn't break or crash Next.js.
  const mainImage = listing.images[0]
  const topImage = listing.images[1] || listing.images[0]
  const bottomImage = listing.images[2] || listing.images[0]

  return (
    <main className="min-h-screen bg-white text-black pt-24 pb-32">
      
      {/* === 1. Cinematic Asymmetric Gallery === */}
      <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 mb-12 md:mb-20">
        <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 md:gap-4 h-[400px] md:h-[600px] lg:h-[700px] rounded-2xl md:rounded-[2rem] overflow-hidden">
          {/* Main Massive Image */}
          <div className="md:col-span-3 row-span-2 relative h-full w-full group overflow-hidden cursor-pointer">
            <Image 
              src={mainImage} 
              alt={listing.title} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
              priority
            />
          </div>
          {/* Top Right Image */}
          <div className="hidden md:block col-span-1 row-span-1 relative h-full w-full group overflow-hidden cursor-pointer">
            <Image 
              src={topImage} 
              alt={`${listing.title} Interior`} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
            />
          </div>
          {/* Bottom Right Image */}
          <div className="hidden md:block col-span-1 row-span-1 relative h-full w-full group overflow-hidden cursor-pointer">
            <Image 
              src={bottomImage} 
              alt={`${listing.title} Detail`} 
              fill 
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
            />
            {/* View All Overlay */}
            <div className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-colors flex items-center justify-center">
              <span className="text-white font-bold uppercase tracking-widest text-xs border border-white px-4 py-2">
                View All Media
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* === 2. Main Content & Sticky Ledger === */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        
        {/* --- Left Column: Details --- */}
        <div className="lg:col-span-8 flex flex-col">
          
          {/* Header */}
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-black text-white text-[10px] font-bold uppercase tracking-widest">
                {isRent ? 'Rental Portfolio' : 'Acquisition'}
              </span>
              <span className="flex items-center gap-1 text-slate-500 text-xs font-bold uppercase tracking-widest">
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} className="text-blue-600" />
                Verified Asset
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.1] mb-4">
              {listing.title}
            </h1>
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <HugeiconsIcon icon={Location01Icon} size={18} />
              {/* FIXED: Nested property location */}
              {listing.property.location}
            </div>
          </div>

          {/* Core Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-8 border-y border-black/10 mb-12">
            <div className="flex flex-col gap-1">
              <HugeiconsIcon icon={BedSingle02Icon} size={24} className="text-black mb-2" />
              {/* FIXED: features.bedrooms */}
              <span className="text-2xl font-black">{listing.features.bedrooms}</span>
              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Bedrooms</span>
            </div>
            <div className="flex flex-col gap-1">
              <HugeiconsIcon icon={Bathtub01Icon} size={24} className="text-black mb-2" />
              {/* FIXED: features.bathrooms */}
              <span className="text-2xl font-black">{listing.features.bathrooms}</span>
              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Bathrooms</span>
            </div>
            <div className="flex flex-col gap-1">
              <HugeiconsIcon icon={MaximizeIcon} size={24} className="text-black mb-2" />
              {/* FIXED: features.sizeSqm */}
              <span className="text-2xl font-black">{listing.features.sizeSqm}</span>
              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">Square Meters</span>
            </div>
            <div className="flex flex-col gap-1">
              {/* FIXED: smartLock.hasSmartLock */}
              {listing.smartLock.hasSmartLock ? (
                <HugeiconsIcon icon={Key01Icon} size={24} className="text-black mb-2" />
              ) : (
                <HugeiconsIcon icon={Shield} size={24} className="text-black mb-2" />
              )}
              <span className="text-2xl font-black">{listing.smartLock.hasSmartLock ? 'Tuya' : 'Secure'}</span>
              <span className="text-xs uppercase tracking-widest text-slate-500 font-bold">
                {listing.smartLock.hasSmartLock ? 'Smart Lock' : 'Access'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-12">
            <h3 className="text-xl font-black uppercase tracking-widest mb-6">The Narrative</h3>
            <p className="text-slate-600 text-lg leading-relaxed font-medium">
              {listing.description}
            </p>
          </div>

          {/* Terms & Conditions (Replacing Amenities to match Schema) */}
          {listing.terms.leaseTerm && (
            <div className="mb-12">
              <h3 className="text-xl font-black uppercase tracking-widest mb-6">Lease Protocol</h3>
              <div className="p-6 bg-slate-50 border border-slate-200">
                <span className="text-sm font-bold uppercase tracking-widest text-slate-500 block mb-1">
                  Required Term
                </span>
                <span className="text-lg font-black text-black">
                  {listing.terms.leaseTerm}
                </span>
              </div>
            </div>
          )}

        </div>

        {/* --- Right Column: Sticky Action Ledger --- */}
        <div className="lg:col-span-4 relative">
          <div className="sticky top-32 p-8 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
            
            <div className="mb-8">
              <span className="text-sm font-bold uppercase tracking-widest text-slate-500 block mb-2">
                {isRent ? 'Lease Valuation' : 'Acquisition Price'}
              </span>
              <div className="text-4xl md:text-5xl font-black tracking-tight">
                {/* FIXED: Currency is hardcoded since it's removed from schema, formatting the number */}
                ${listing.price.toLocaleString()}
                {isRent && <span className="text-xl text-slate-500 font-medium tracking-normal"> / mo</span>}
              </div>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center py-3 border-b border-black/10">
                <span className="text-sm font-medium text-slate-600">Verification</span>
                <span className="text-sm font-bold text-black">Wunkat Standard</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-black/10">
                <span className="text-sm font-medium text-slate-600">Broker Fees</span>
                <span className="text-sm font-bold text-black">$0 (Direct)</span>
              </div>
              {isRent && (
                <div className="flex justify-between items-center py-3 border-b border-black/10">
                  <span className="text-sm font-medium text-slate-600">Smart Lock Setup</span>
                  <span className="text-sm font-bold text-black">Instant upon clearing</span>
                </div>
              )}
            </div>

            {/* D2C Hybrid Payment / Booking Actions */}
            <div className="flex flex-col gap-3 mt-auto">
              {isRent ? (
                <>
                  <Link href={`/checkout/${listing.slug}?type=deposit`} className="w-full">
                    <button className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors">
                      Pay Booking Deposit
                    </button>
                  </Link>
                  <button className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs border-2 border-black hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    <HugeiconsIcon icon={Calendar01Icon} size={16} />
                    Schedule Viewing
                  </button>
                </>
              ) : (
                <>
                  <button className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-colors">
                    Request Digital Contract
                  </button>
                  <button className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs border-2 border-black hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                    <HugeiconsIcon icon={Calendar01Icon} size={16} />
                    Schedule Private Tour
                  </button>
                </>
              )}
            </div>

            <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest mt-6 font-bold leading-relaxed">
              100% Owned by WunkatHomes. <br /> Secure hybrid payments powered by Paystack.
            </p>

          </div>
        </div>

      </section>
    </main>
  )
}