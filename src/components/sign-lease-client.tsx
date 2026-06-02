"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  CheckmarkBadge01Icon,
  SignatureIcon,
  Shield02Icon,
  Loading03Icon,
  File02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { signLeaseAgreement } from "@/actions/user/lease.action"; // Import the action we just made

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
        `Signature must exactly match your verified legal name: ${data.tenantName}`,
      );
      return;
    }

    setIsSigning(true);

    try {
      const result = await signLeaseAgreement(data.leaseId, typedName);

      if (result.success) {
        toast.success("Tenancy Agreement officially signed.");
        // Redirecting instantly transfers them to the Active Dashboard
        router.push("/user/dashboard");
      } else {
        toast.error(result.error || "Failed to sign document.");
        setIsSigning(false);
      }
    } catch (error) {
      toast.error("A network error occurred.");
      setIsSigning(false);
    }
  };

  return (
    <div className=" w-screen bg-zinc-100 flex flex-col md:flex-row">
      {/* ========================================================= */}
      {/* LEFT PANE: The Document Reader */}
      {/* ========================================================= */}
      <div className=" md:w-3/5 w-full  md:h-full no-scrollbar p-4 md:p-8 flex flex-col">
        <div className="flex items-center gap-3 mb-6 shrink-0">
          <div>
            <h1 className="text-lg font-black tracking-tight text-zinc-900 uppercase">
              WunkatHomes Digital Lease
            </h1>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
              Document ID: {data.leaseId.slice(-8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* The "Paper" Container */}
        <div className="flex-1 bg-white rounded-xl  border border-zinc-200 overflow-hidden relative flex flex-col">
          <div className="overflow-y-auto p-8 md:p-12 font-serif text-zinc-800 no-scrollbar leading-relaxed text-sm md:text-base text-justify">
            <h2 className="text-2xl font-bold text-center mb-8 uppercase tracking-widest border-b-2 border-zinc-900 pb-4 inline-block mx-auto w-full">
              Standard Tenancy Agreement
            </h2>

            <p className="mb-6 font-sans text-xs uppercase tracking-widest text-zinc-400 font-bold">
              This digital contract is securely generated and bound by the laws
              of the Republic of Ghana.
            </p>

            <div className="space-y-6">
              <p>
                This Tenancy Agreement is formally made and entered into on this
                day between <strong>WunkatHomes Ltd.</strong> (hereinafter
                referred to as the "Landlord") and{" "}
                <strong>{data.tenantName}</strong> (hereinafter referred to as
                the "Tenant").
              </p>

              <p>
                <strong>1. The Demised Premises:</strong> The Landlord hereby
                agrees to let, and the Tenant agrees to take the property known
                as <strong>{data.propertyTitle}</strong> situated at{" "}
                <strong>{data.propertyLocation}</strong>.
              </p>

              <p>
                <strong>2. Term of Tenancy:</strong> The tenancy shall
                officially commence on <strong>{data.startDate}</strong> and
                shall continue strictly under the terms outlined in this digital
                covenant.
              </p>

              <p>
                <strong>3. Rent and Consideration:</strong> The total rent
                consideration of{" "}
                <strong>
                  GHS{" "}
                  {data.totalRent.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </strong>{" "}
                has been acknowledged as paid in full via secure payment
                gateway.
              </p>

              <p>
                <strong>4. Smart Lock & Digital Access:</strong> The Tenant
                acknowledges that access to the Demised Premises is governed by
                a proprietary Tuya Smart Lock system. The Tenant covenants not
                to distribute, duplicate, or expose their unique digital PIN to
                unauthorized third parties.
              </p>

              <p>
                <strong>5. Covenants of the Tenant:</strong> The Tenant agrees
                to keep the interior of the premises in good and tenantable
                repair, to use the premises strictly for residential purposes,
                and to permit the Landlord or their authorized agents to enter
                and inspect the premises upon reasonable notice.
              </p>
            </div>

            {/* Scroll Spacer */}
            <div className="h-20" />
          </div>

          {/* Gradient Fade for visual scroll cue */}
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none" />
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT PANE: The Secure Signing Terminal */}
      {/* ========================================================= */}
      <div className="w-full md:w-2/5 lg:w-1/3 bg-zinc-950 text-white flex flex-col justify-center p-8 lg:p-12 shadow-2xl relative z-10 ">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="max-w-sm w-full mx-auto flex flex-col h-full"
        >
          <div className="mb-12 mt-auto">
            <h3 className="text-2xl font-black uppercase tracking-tight mb-2">
              Sign Lease
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
              Your identity has been verified. Review the document carefully.
              Applying your digital signature finalizes the lease and generates
              your property access keys.
            </p>
          </div>

          <form onSubmit={handleSign} className="space-y-8 mb-auto">
            {/* Consent Checkbox */}
            <label className="flex items-start gap-4 cursor-pointer group p-4 border border-zinc-800 rounded-xl hover:bg-zinc-900 transition-colors">
              <div className="relative flex items-center justify-center mt-1 shrink-0">
                <input
                  type="checkbox"
                  required
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="peer appearance-none w-5 h-5 border-2 border-zinc-600 rounded bg-zinc-950 focus:ring-2 focus:ring-primary/50 checked:bg-primary checked:border-primary transition-all cursor-pointer"
                />
                <HugeiconsIcon
                  icon={CheckmarkBadge01Icon}
                  size={14}
                  className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none"
                />
              </div>
              <span className="text-xs font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors leading-relaxed">
                I acknowledge that I have read the Tenancy Agreement and agree
                to be legally bound by its terms and conditions.
              </span>
            </label>

            {/* Typed Signature Input */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-3">
                Digital Signature (Type your legal name)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HugeiconsIcon
                    icon={SignatureIcon}
                    size={18}
                    className="text-zinc-600"
                  />
                </div>
                <input
                  type="text"
                  required
                  placeholder={data.tenantName}
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="w-full pl-12 p-4 bg-zinc-900 border border-zinc-800 rounded-xl text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all font-medium placeholder:text-zinc-700"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!agreed || !typedName || isSigning}
              className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed"
            >
              {isSigning ? (
                <>
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    size={16}
                    className="animate-spin"
                  />
                  Securing Ledger...
                </>
              ) : (
                <>
                  Sign & Generate Keys
                  <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} />
                </>
              )}
            </button>

            {/* Legal Footnote */}
            <p className="text-[9px] text-center font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">
              Upon submission, your IP Address and device metadata will be
              permanently recorded to ensure cryptographic non-repudiation.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
