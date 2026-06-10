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
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col lg:flex-row font-sans selection:bg-zinc-200">
      
      {/* ========================================================= */}
      {/* LEFT PANE: Document Reader */}
      {/* ========================================================= */}
      <div className="flex-1 flex flex-col h-[60vh] lg:h-screen relative border-r border-zinc-200 z-0">
        
        {/* Document Header Bar */}
        <header className="h-14 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-2 text-zinc-900">
            <span className="text-[13px] font-medium tracking-tight">Tenancy Agreement</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Awaiting Signature
            </span>
          </div>
        </header>

        {/* Scrollable Document Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12 bg-[#F3F4F6]">
          <div className="max-w-3xl mx-auto bg-white border border-zinc-200/80 p-10 md:p-16 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] rounded-sm">
            
            <div className="text-center mb-12">
              <h1 className="text-xl font-bold text-zinc-900 uppercase tracking-widest border-b border-zinc-200 pb-4 inline-block">
                Standard Tenancy Agreement
              </h1>
              <p className="mt-4 text-[11px] uppercase tracking-widest text-zinc-400 font-medium">
                Legally binding under the laws of the Republic of Ghana
              </p>
            </div>

            <div className="font-serif text-[14px] text-zinc-800 leading-[1.8] text-justify space-y-6">
              <p>
                This Tenancy Agreement is formally made and entered into on this day by and between <strong>WunkatHomes Ltd.</strong> (hereinafter referred to as the "Landlord") and <strong>{data.tenantName}</strong> (hereinafter referred to as the "Tenant").
              </p>

              <p>
                <strong>1. The Demised Premises:</strong> The Landlord hereby agrees to let, and the Tenant agrees to take the property known as <strong>{data.propertyTitle}</strong> situated at <strong>{data.propertyLocation}</strong>.
              </p>

              <p>
                <strong>2. Term of Tenancy:</strong> The tenancy shall officially commence on <strong>{data.startDate}</strong> and shall continue strictly under the terms outlined in this digital covenant.
              </p>

              <p>
                <strong>3. Rent and Consideration:</strong> The total rent consideration of <strong>GHS {data.totalRent.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> has been acknowledged as paid in full via secure payment gateway.
              </p>

              <p>
                <strong>4. Smart Lock & Digital Access:</strong> The Tenant acknowledges that access to the Demised Premises is governed by a proprietary Tuya Smart Lock system. The Tenant covenants not to distribute, duplicate, or expose their unique digital PIN to unauthorized third parties.
              </p>

              <p>
                <strong>5. Covenants of the Tenant:</strong> The Tenant agrees to keep the interior of the premises in good and tenantable repair, to use the premises strictly for residential purposes, and to permit the Landlord or their authorized agents to enter and inspect the premises upon reasonable notice.
              </p>
            </div>

            {/* Visual Signature Placeholder */}
            <div className="mt-16 pt-8 border-t border-zinc-100 flex justify-between">
              <div className="w-48">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-4">Landlord Signature</p>
                <div className="h-10 border-b border-zinc-300 flex items-end pb-1">
                  <span className="font-serif italic text-lg text-zinc-800">WunkatHomes Ltd.</span>
                </div>
              </div>
              <div className="w-48">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-4">Tenant Signature</p>
                <div className="h-10 border-b border-amber-300 flex items-end pb-1 bg-amber-50/30 px-2 rounded-t-sm">
                  <span className="text-[11px] text-amber-600 font-medium">Signature required</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT PANE: Action Panel */}
      {/* ========================================================= */}
      <div className="w-full lg:w-[420px] bg-white flex flex-col h-auto lg:h-screen z-10 shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.03)] relative">
        <motion.div
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col h-full p-6 md:p-8 overflow-y-auto"
        >
          <div className="mb-10">
            <div className="w-10 h-10 bg-zinc-100 rounded-lg flex items-center justify-center mb-5 border border-zinc-200">
              <HugeiconsIcon icon={SignatureIcon} size={20} className="text-zinc-700" />
            </div>
            
            <p className="text-[13px] text-zinc-500 leading-relaxed">
              Please review the document carefully. Applying your digital signature binds you to the terms and activates your property access.
            </p>
          </div>

          <form onSubmit={handleSign} className="space-y-6 mt-auto lg:mt-0">
            
            {/* Standard SaaS Checkbox Row */}
            <div className="flex items-start gap-3 p-4 rounded-xl border border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
              <div className="flex items-center h-5 mt-0.5">
                <input
                  id="consent"
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="w-4 h-4 border-zinc-300 rounded text-zinc-900 focus:ring-zinc-900 cursor-pointer"
                />
              </div>
              <label htmlFor="consent" className="text-[12px] text-zinc-600 leading-relaxed cursor-pointer select-none">
                I acknowledge that I have read the Tenancy Agreement and agree to be legally bound by its terms.
              </label>
            </div>

            {/* Clean Input Field */}
            <div className="space-y-2">
              <label className="block text-[12px] font-medium text-zinc-700">
                Digital Signature <span className="text-zinc-400 font-normal">(Type your legal name)</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  placeholder={data.tenantName}
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="w-full pl-3 pr-3 py-2.5 bg-white border border-zinc-300 rounded-lg text-[14px] text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            <div className="pt-4 space-y-4 border-t border-zinc-100">
              <button
                type="submit"
                disabled={!agreed || !typedName || isSigning}
                className="w-full h-11 bg-zinc-900 text-white text-[13px] font-medium rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSigning ? (
                  <>
                    <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
                    Executing...
                  </>
                ) : (
                  <>
                    <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} />
                    Sign & Complete Binding
                  </>
                )}
              </button>

              <div className="flex items-start gap-2 text-zinc-400">
                <HugeiconsIcon icon={Alert01Icon} size={12} className="shrink-0 mt-0.5" />
                <p className="text-[11px] leading-tight">
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