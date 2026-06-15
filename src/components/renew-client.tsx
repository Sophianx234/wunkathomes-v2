"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { usePaystackPayment } from "react-paystack";
import { toast } from "sonner";

import {
  ArrowLeft01Icon,
  CreditCardIcon,
  SmartPhone01Icon,
  Loading03Icon,
  Shield01Icon,
  Calendar01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
// Note: You will need to create this action to process the renewal!
import { processLeaseRenewal } from "@/actions/user/payment.action";

interface RenewClientProps {
  data: {
    leaseId: string;
    rentAmount: number;
    currentEndDate: string;
    user: { id: string; name: string; email: string; phone: string };
    listing: {
      title: string;
      price: number;
      image: string;
      propertyType: string;
    };
  };
}

export default function RenewClient({ data }: RenewClientProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  // Paystack Configuration for Renewal
  const paystackConfig = {
    reference: `RENEW_${new Date().getTime().toString()}`,
    email: data.user.email,
    amount: Math.round(data.rentAmount * 100),
    publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
    currency: "GHS",
    metadata: {
      isRenewal: true, // Flag this for your webhook!
      userId: data.user.id,
      leaseId: data.leaseId,
      custom_fields: [
        {
          display_name: "Tenant Name",
          variable_name: "tenant_name",
          value: data.user.name,
        },
        {
          display_name: "Renewal For",
          variable_name: "property",
          value: data.listing.title,
        },
      ],
    },
  };

  const initializePayment = usePaystackPayment(paystackConfig);

  const onSuccess = async (paystackResponse: any) => {
    toast.loading("Processing your renewal...", { id: "renew-toast" });

    // Server action to update the Lease endDate
    const result = await processLeaseRenewal(
      paystackResponse.reference,
      data.leaseId,
      data.rentAmount,
    );

    if (result.success) {
      toast.success("Lease successfully renewed!", { id: "renew-toast" });
      setTimeout(() => {
        router.push(
          `/checkout/success?reference=${paystackResponse.reference}`,
        );
      }, 1000);
    } else {
      toast.error(result.message, { id: "renew-toast" });
      setIsProcessing(false);
    }
  };

  const onClose = () => {
    setIsProcessing(false);
    toast.error("Renewal payment cancelled.");
  };

  const handlePayment = () => {
    setIsProcessing(true);
    initializePayment({ onSuccess, onClose });
  };

  return (
    <main className="min-h-screen bg-slate-50 text-black py-12 md:py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto mb-10">
        <Link
          href={`/user/dashboard`}
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-black transition-colors"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2 text-center">
          Renew Your Lease
        </h1>
        <p className="text-sm font-medium text-slate-500 mb-10 text-center">
          Instantly extend your stay at {data.listing.title}.
        </p>

        <div className="bg-white p-6 md:p-8 rounded-xl border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {/* Property Preview */}
          <div className="flex gap-4 mb-8 pb-8 border-b border-slate-100">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden shrink-0 bg-slate-100">
              <Image
                src={data.listing.image}
                alt={data.listing.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                {data.listing.propertyType.replace("_", " ")}
              </span>
              <h3 className="text-lg font-black uppercase tracking-tight leading-snug">
                {data.listing.title}
              </h3>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">
                <HugeiconsIcon
                  icon={Calendar01Icon}
                  className="text-primary"
                  size={20}
                />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Current Expiry
                </p>
                <p className="font-bold text-slate-900">
                  {data.currentEndDate}
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center mb-6">
            <span className="text-sm font-bold uppercase tracking-widest text-slate-500">
              Renewal Amount
            </span>
            <span className="text-3xl font-black text-black">
              GHS {data.rentAmount.toLocaleString()}
            </span>
          </div>

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="w-full py-5 bg-zinc-950 text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-3 disabled:opacity-70"
          >
            {isProcessing && (
              <HugeiconsIcon
                icon={Loading03Icon}
                size={18}
                className="animate-spin"
              />
            )}
            {isProcessing
              ? "Processing..."
              : `Pay GHS ${data.rentAmount.toLocaleString()} to Renew`}
          </button>

          <div className="flex flex-col items-center gap-4 mt-6">
            <div className="flex items-center gap-6 text-slate-400">
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                <HugeiconsIcon icon={CreditCardIcon} size={16} /> Card
              </span>
              <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest">
                <HugeiconsIcon icon={SmartPhone01Icon} size={16} /> Mobile Money
              </span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
