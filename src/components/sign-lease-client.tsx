"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  CheckmarkBadge01Icon,
  SignatureIcon,
  Loading03Icon,
  File02Icon,
  CheckmarkCircle01Icon,
  Alert01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { signLeaseAgreement } from "@/actions/user/lease.action";

interface SignLeaseClientProps {
  data: {
    leaseId: string;
    tenantName: string;
    totalRent: number;
    startDate: string;
    propertyTitle: string;
    propertyLocation: string;
  };
}

export default function SignLeaseClient({ data }: SignLeaseClientProps) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [typedName, setTypedName] = useState("");
  const [isSigning, setIsSigning] = useState(false);

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();

    if (typedName.trim().toLowerCase() !== data.tenantName.toLowerCase()) {
      toast.error(
        `Signature must exactly match your verified legal name: ${data.tenantName}`
      );
      return;
    }

    setIsSigning(true);

    try {
      const result = await signLeaseAgreement(data.leaseId, typedName);

      if (result.success) {
        toast.success("Tenancy Agreement successfully executed.");
        router.push("/user/leases");
      } else {
        toast.error(result.error || "Failed to execute document.");
        setIsSigning(false);
      }
    } catch (error) {
      toast.error("A network error occurred.");
      setIsSigning(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col lg:flex-row font-sans selection:bg-zinc-200 w-full overflow-x-hidden">
      
      {/* ========================================================= */}
      {/* LEFT PANE: Document Reader */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col h-[55vh] md:h-[60vh] lg:h-screen relative border-b lg:border-b-0 lg:border-r border-zinc-200 z-0 w-full min-w-0">
        
        {/* Document Header Bar */}
        <header className="h-10 md:h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-3 md:px-6 shrink-0 z-10 w-full box-border">
          <div className="flex items-center gap-1.5 md:gap-2 text-zinc-900 min-w-0">
            <span className="text-[10px] md:text-[13px] font-medium tracking-tight truncate">Tenancy Agreement</span>
          </div>
          <div className="flex items-center gap-2 shrink-0 pl-2">
            <span className="flex items-center gap-1 md:gap-1.5 text-[8px] md:text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-1.5 md:px-2 py-0.5 rounded-full whitespace-nowrap">
              <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Awaiting Signature
            </span>
          </div>
        </header>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-y-auto p-2 md:p-8 lg:p-12 bg-[#F3F4F6] w-full box-border">
          <div className="max-w-3xl mx-auto bg-white border border-zinc-200/80 p-5 md:p-10 lg:p-16 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] rounded-sm w-full box-border">
            
            <div className="text-center mb-6 md:mb-12 w-full box-border">
              <h1 className="text-[11px] md:text-xl font-bold text-zinc-900 uppercase tracking-widest border-b border-zinc-200 pb-2 md:pb-4 inline-block break-words max-w-full">
                Standard Tenancy Agreement
              </h1>
              <p className="mt-2 md:mt-4 text-[7px] md:text-[11px] uppercase tracking-widest text-zinc-400 font-medium break-words">
                Legally binding under the laws of the Republic of Ghana
              </p>
            </div>

            <div className="font-serif text-[10px] md:text-[14px] text-zinc-800 leading-relaxed md:leading-[1.8] text-justify space-y-3 md:space-y-6 w-full box-border">
              <p>
                This Tenancy Agreement is formally made and entered into on this day by and between <strong className="font-semibold">WunkatHomes Ltd.</strong> (hereinafter referred to as the "Landlord") and <strong className="font-semibold">{data.tenantName}</strong> (hereinafter referred to as the "Tenant").
              </p>

              <p>
                <strong className="font-semibold">1. The Demised Premises:</strong> The Landlord hereby agrees to let, and the Tenant agrees to take the property known as <strong className="font-semibold">{data.propertyTitle}</strong> situated at <strong className="font-semibold">{data.propertyLocation}</strong>.
              </p>

              <p>
                <strong className="font-semibold">2. Term of Tenancy:</strong> The tenancy shall officially commence on <strong className="font-semibold">{data.startDate}</strong> and shall continue strictly under the terms outlined in this digital covenant.
              </p>

              <p>
                <strong className="font-semibold">3. Rent and Consideration:</strong> The total rent consideration of <strong className="font-semibold">GHS {data.totalRent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> has been acknowledged as paid in full via secure payment gateway.
              </p>

              <p>
                <strong className="font-semibold">4. Smart Lock & Digital Access:</strong> The Tenant acknowledges that access to the Demised Premises is governed by a proprietary Tuya Smart Lock system. The Tenant covenants not to distribute, duplicate, or expose their unique digital PIN to unauthorized third parties.
              </p>

              <p>
                <strong className="font-semibold">5. Covenants of the Tenant:</strong> The Tenant agrees to keep the interior of the premises in good and tenantable repair, to use the premises strictly for residential purposes, and to permit the Landlord or their authorized agents to enter and inspect the premises upon reasonable notice.
              </p>
            </div>

            {/* Visual Signature Placeholder */}
            <div className="mt-8 md:mt-16 pt-4 md:pt-8 border-t border-zinc-100 flex justify-between w-full box-border gap-2">
              <div className="w-24 md:w-48 min-w-0">
                <p className="text-[7px] md:text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2 md:mb-4 truncate">Landlord Signature</p>
                <div className="h-6 md:h-10 border-b border-zinc-300 flex items-end pb-0.5 md:pb-1">
                  <span className="font-serif italic text-[11px] md:text-lg text-zinc-800 truncate">WunkatHomes Ltd.</span>
                </div>
              </div>
              <div className="w-24 md:w-48 min-w-0">
                <p className="text-[7px] md:text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-2 md:mb-4 truncate">Tenant Signature</p>
                <div className="h-6 md:h-10 border-b border-amber-300 flex items-end pb-0.5 md:pb-1 bg-amber-50/30 px-1 md:px-2 rounded-t-sm w-full overflow-hidden">
                  <span className="text-[7px] md:text-[11px] text-amber-600 font-medium truncate">Signature required</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT PANE: Action Panel */}
      {/* ========================================================= */}
      <div className="w-full lg:w-[420px] bg-white flex flex-col h-auto lg:h-screen z-10 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.03)] relative box-border max-w-full">
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col h-full p-4 md:p-6 lg:p-8 overflow-y-auto w-full box-border"
        >
          <div className="mb-6 md:mb-10 w-full box-border">
            <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-100 rounded-lg flex items-center justify-center mb-3 md:mb-5 border border-zinc-200">
              <span className="scale-75 md:scale-100 flex items-center">
                <HugeiconsIcon icon={SignatureIcon} size={20} className="text-zinc-700" />
              </span>
            </div>
            
            <p className="text-[10px] md:text-[13px] text-zinc-500 leading-relaxed break-words">
              Please review the document carefully. Applying your digital signature binds you to the terms and activates your property access.
            </p>
          </div>

          <form onSubmit={handleSign} className="space-y-4 md:space-y-6 mt-auto lg:mt-0 w-full box-border">
            
            {/* Standard SaaS Checkbox Row */}
            <div className="flex items-start gap-2 md:gap-3 p-3 md:p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 transition-colors w-full box-border">
              <div className="flex items-center h-4 md:h-5 mt-0.5 md:mt-0 shrink-0">
                <input
                  id="consent"
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-3 h-3 md:w-4 md:h-4 border-zinc-300 rounded text-zinc-900 focus:ring-zinc-900 cursor-pointer block m-0 appearance-none bg-white checked:bg-zinc-900 checked:border-zinc-900"
                  style={{
                    WebkitAppearance: "checkbox",
                    MozAppearance: "checkbox",
                    appearance: "checkbox"
                  }}
                />
              </div>
              <label htmlFor="consent" className="text-[9px] md:text-[12px] text-zinc-600 leading-relaxed cursor-pointer select-none break-words min-w-0 pt-0.5">
                I acknowledge that I have read the Tenancy Agreement and agree to be legally bound by its terms.
              </label>
            </div>

            {/* Clean Input Field */}
            <div className="space-y-1.5 md:space-y-2 w-full box-border">
              <label className="block text-[9px] md:text-[12px] font-medium text-zinc-700">
                Digital Signature <span className="text-zinc-400 font-normal ml-0.5">(Type your legal name)</span>
              </label>
              <div className="relative w-full min-w-0 max-w-full box-border">
                <input
                  type="text"
                  required
                  placeholder={data.tenantName}
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="block w-full min-w-0 max-w-full box-border pl-2.5 pr-2.5 md:pl-3 md:pr-3 py-2 md:py-2.5 bg-white border border-zinc-300 rounded-md md:rounded-lg text-[11px] md:text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-shadow appearance-none m-0"
                />
              </div>
            </div>

            <div className="pt-3 md:pt-4 space-y-3 md:space-y-4 border-t border-zinc-100 w-full box-border">
              <button
                type="submit"
                disabled={!agreed || !typedName || isSigning}
                className="block w-full min-w-0 max-w-full box-border h-9 md:h-11 bg-zinc-900 text-white text-[10px] md:text-[13px] font-medium rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5 md:gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm m-0"
              >
                {isSigning ? (
                  <>
                    <span className="scale-75 md:scale-100 flex items-center">
                      <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
                    </span>
                    Executing...
                  </>
                ) : (
                  <>
                    <span className="scale-75 md:scale-100 flex items-center">
                      <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} />
                    </span>
                    Sign & Complete Binding
                  </>
                )}
              </button>

              <div className="flex items-start gap-1.5 md:gap-2 text-zinc-400 w-full box-border">
                <span className="scale-75 md:scale-100 flex items-center shrink-0 mt-0.5">
                  <HugeiconsIcon icon={Alert01Icon} size={12} />
                </span>
                <p className="text-[8px] md:text-[11px] leading-tight break-words pt-0.5">
                  Upon execution, your IP address, device metadata, and timestamp will be permanently logged to ensure non-repudiation.
                </p>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}