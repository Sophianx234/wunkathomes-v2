import { 
  File02Icon, 
  Key01Icon, 
  Shield01Icon, 
  ArrowRight01Icon 
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

interface WunkatProtocolProps {
  isRent: boolean;
}

export default function ThingsToKnow({ isRent }: WunkatProtocolProps) {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 border-t border-black/10">
      <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-8">
        Things To Know Before You {isRent ? "Rent" : "Buy"}
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
        
        {/* Column 1: Transaction / Lease Terms */}
        <div className="flex flex-col items-start">
          <div className="mb-4 text-black">
            <HugeiconsIcon icon={File02Icon} size={24} />
          </div>
          <h3 className="font-bold text-base mb-2 uppercase tracking-tight text-black">
            Transaction Terms
          </h3>
          <div className="text-slate-500 text-[13px] md:text-sm leading-relaxed  font-medium flex-1">
            {isRent ? (
              <>
                <p className="">Booking deposits secure the asset exclusively for 72 hours.</p>
                <p>Digital tenancy agreements must be signed via your dashboard.</p>
                <p>First month and security balance required before hybrid lock activation.</p>
              </>
            ) : (
              <>
                <p>A 5% digital deposit initiates the acquisition lock on this asset.</p>
                <p>Proof of funds required within 48 hours of reservation.</p>
                <p>Seamless title transfer via the Wunkat Legal Ledger.</p>
              </>
            )}
          </div>
          <button className="mt-5 text-[10px] font-bold uppercase tracking-widest border-b-[1.5px] border-black pb-0.5 hover:text-slate-500 hover:border-slate-500 transition-colors flex items-center gap-1.5 group">
            Read Policy <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Column 2: Smart Lock Integration */}
        <div className="flex flex-col items-start">
          <div className="mb-4 text-black">
            <HugeiconsIcon icon={Key01Icon} size={24} />
          </div>
          <h3 className="font-bold text-base mb-2 uppercase tracking-tight text-black">
            Access Infrastructure
          </h3>
          <div className="text-slate-500 text-[13px] md:text-sm leading-relaxed space-y-2 font-medium flex-1">
            <p>Zero physical key handovers.</p>
            <p>Your unique Tuya smart-lock PIN is encrypted and generated instantly upon payment clearance.</p>
            <p>Temporary contractor or guest PINs are managed directly from your user dashboard.</p>
          </div>
          <button className="mt-5 text-[10px] font-bold uppercase tracking-widest border-b-[1.5px] border-black pb-0.5 hover:text-slate-500 hover:border-slate-500 transition-colors flex items-center gap-1.5 group">
            View Integration <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Column 3: Asset Safety & Verification */}
        <div className="flex flex-col items-start">
          <div className="mb-4 text-black">
            <HugeiconsIcon icon={Shield01Icon} size={24} />
          </div>
          <h3 className="font-bold text-base mb-2 uppercase tracking-tight text-black">
            Asset Verification
          </h3>
          <div className="text-slate-500 text-[13px] md:text-sm leading-relaxed space-y-2 font-medium flex-1">
            <p>100% Owned & Managed by WunkatHomes.</p>
            <p>Absolutely no third-party landlords or broker interference.</p>
            <p>24/7 exterior perimeter surveillance active on premises for your security.</p>
          </div>
          <button className="mt-5 text-[10px] font-bold uppercase tracking-widest border-b-[1.5px] border-black pb-0.5 hover:text-slate-500 hover:border-slate-500 transition-colors flex items-center gap-1.5 group">
            Security Ledger <HugeiconsIcon icon={ArrowRight01Icon} size={12} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

      </div>
    </section>
  )
}