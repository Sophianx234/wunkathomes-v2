"use client";

import Link from "next/link";
import { 
  CheckmarkBadge01Icon, 
  File02Icon, 
  Key01Icon, 
  Building04Icon,
  ArrowRight01Icon,
  Download01Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function CheckoutSuccessPage() {
  const mockTransactionDetails = {
    propertyName: "The Glasshouse Villa",
    amountPaid: "$500.00",
    wunkatId: "WNK-8472-X9",
    expiry: "72 Hours",
  };

  return (
    // We lock the main wrapper to EXACTLY the viewport height (100dvh)
    <main className="h-[100dvh] w-full bg-slate-50 text-black p-4 md:p-8 flex items-center justify-center overflow-hidden">
      
      {/* The main card is constrained to a maximum height so it never forces a scroll on desktop */}
      <div className="w-full max-w-5xl h-full max-h-[850px] md:max-h-[600px] bg-white border-2 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row overflow-hidden">
        
        {/* === LEFT COLUMN: The Success Hook & Receipt === */}
        <div className="flex-1 p-6 md:p-10 flex flex-col justify-center items-center md:items-start text-center md:text-left bg-white">
          
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-500 shrink-0">
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={32} className="text-green-600" />
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight mb-3">
            Asset Secured
          </h1>
          <p className="text-xs md:text-sm font-medium text-slate-500 mb-8 max-w-sm leading-relaxed">
            <strong className="text-black">{mockTransactionDetails.propertyName}</strong> is exclusively reserved under your ID for {mockTransactionDetails.expiry}. It has been removed from the public marketplace.
          </p>

          {/* Compact Receipt Block */}
          <div className="w-full bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col gap-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Refundable Hold</span>
              <span className="text-base font-black text-black">{mockTransactionDetails.amountPaid}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Ledger Ref</span>
              <span className="text-xs font-bold text-black">{mockTransactionDetails.wunkatId}</span>
            </div>
            <button className="mt-2 w-full flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-black transition-colors bg-white border border-slate-200 py-2 rounded">
              <HugeiconsIcon icon={Download01Icon} size={14} /> Download Receipt
            </button>
          </div>
        </div>

        {/* === RIGHT COLUMN: The Roadmap & Action === */}
        {/* On mobile, this scrolls internally if needed. On desktop, it fits perfectly. */}
        <div className="flex-1 bg-slate-50 border-t md:border-t-0 md:border-l border-black p-6 md:p-10 flex flex-col overflow-y-auto">
          
          <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-black/10 pb-4 shrink-0">
            Your Next Steps
          </h3>
          
          {/* Compact Timeline */}
          <div className="space-y-6 mb-8 flex-grow">
            
            {/* Step 1 */}
            <div className="flex gap-4 items-start">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-black bg-black text-white shrink-0 mt-0.5">
                <HugeiconsIcon icon={File02Icon} size={14} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-1 text-black">1. Execute Digital Ledger</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Head to your dashboard to review and digitally sign your legally binding Tenancy Agreement.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4 items-start">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-slate-200 bg-white text-slate-400 shrink-0 mt-0.5">
                <HugeiconsIcon icon={Key01Icon} size={14} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-600">2. Asset Verification</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Tour the physical property using a temporary smart-lock PIN, or meet your Manager on-site.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4 items-start">
              <div className="flex items-center justify-center w-8 h-8 rounded-full border-2 border-slate-200 bg-white text-slate-400 shrink-0 mt-0.5">
                <HugeiconsIcon icon={Building04Icon} size={14} />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest mb-1 text-slate-600">3. Handover & Move-In</h4>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                  Approve the property, wire the remaining balance via your secure virtual account, and receive keys.
                </p>
              </div>
            </div>
            
          </div>

          {/* Action Area locked to bottom */}
          <div className="shrink-0 mt-auto pt-4">
            <Link href="/dashboard" className="w-full block mb-4">
              <button className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-black/20 flex items-center justify-center gap-2">
                Enter My Dashboard
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </button>
            </Link>
            
            <p className="text-[9px] text-center font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
              Escrow protected. If you decline after step 2, it is <strong className="text-green-600">100% Refunded</strong>.
            </p>
          </div>

        </div>

      </div>
    </main>
  );
}