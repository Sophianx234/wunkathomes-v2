"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { createManualRenewalPaymentAction } from "@/actions/user/payment.action";

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
      roomType?: string;
      listingType?: string;
    };
    existingPendingRenewal?: {
      reference: string;
      amount: number;
    } | null;
  };
}

const BANK_DETAILS = {
  bankName: "Stanbic Bank Ghana",
  accountName: "Wunkat Homes Limited",
  accountNumber: "0140 1234 5678 90",
  branch: "Airport City, Accra",
  swiftCode: "SBICGHAC",
};

const MOMO_DETAILS = {
  network: "MTN Mobile Money & Telecel Cash",
  merchantName: "Wunkat Homes Limited",
  merchantId: "982341",
  phone: "024 123 4567",
};

const BUSINESS_WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "233241234567";

export default function RenewClient({ data }: RenewClientProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const isRent = data.listing.listingType !== "Sale" && data.listing.listingType !== "For_Sale";
  const roomType = data.listing.roomType || "Empty"; 
  const [rentDuration, setRentDuration] = useState<number>(roomType === 'Furnished' ? 1 : 3);
  
  const basePrice = data.listing.price || 0;
  const finalTotal = isRent ? basePrice * rentDuration : basePrice;

  const [step, setStep] = useState<"configure" | "instructions">(
    data.existingPendingRenewal ? "instructions" : "configure"
  );
  const [bookingReference, setBookingReference] = useState<string>(
    data.existingPendingRenewal?.reference || ""
  );
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "momo">("bank");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleProceedToPayment = async () => {
    setIsProcessing(true);
    try {
      const res = await createManualRenewalPaymentAction(data.leaseId, rentDuration);
      if (res.success && res.reference) {
        setBookingReference(res.reference);
        setStep("instructions");
        toast.success("Renewal recorded! Please complete your transfer.");
      } else {
        toast.error(res.message || "Failed to initiate renewal.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Construct Pre-filled WhatsApp message (no emojis, guaranteed %0A line breaks)
  const whatsappLines = [
    "Hello Wunkat Homes, I have made payment to renew my lease.",
    "",
    `Booking Ref: ${bookingReference}`,
    `Property: ${data.listing.title}`,
    `Tenant Name: ${data.user.name}`,
    `Amount: GHS ${finalTotal.toLocaleString()}`,
    `Extension: ${rentDuration} ${roomType === 'Furnished' ? 'Day(s)' : 'Month(s)'}`,
    "",
    "Attached is my payment transfer receipt/screenshot."
  ];
  const whatsappMessage = whatsappLines.map(line => encodeURIComponent(line)).join("%0A");
  const whatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`;

  const handleConfirmedReceipt = () => {
    toast.success("Renewal recorded! Redirecting to confirmation receipt...");
    router.push(`/checkout/success?reference=${bookingReference}`);
  };

  return (
    <main className="min-h-screen bg-zinc-50/50 text-black py-10 md:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto mb-6">
        <Link
          href="/user/dashboard"
          className="inline-flex items-center gap-2 text-xs font-medium text-zinc-500 hover:text-black transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-zinc-950 mb-1.5">
            Renew Your Lease
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Extend your stay at {data.listing.title}.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden p-6 sm:p-8">
          {/* Property Summary Header */}
          <div className="flex items-center gap-4 pb-6 mb-6 border-b border-zinc-100">
            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-zinc-100">
              <Image
                src={data.listing.image}
                alt={data.listing.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block mb-0.5">
                {data.listing.propertyType.replace(/_/g, " ")}
              </span>
              <h2 className="text-base sm:text-lg font-semibold text-zinc-900 truncate">
                {data.listing.title}
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                Current Expiration: <span className="font-medium text-zinc-800">{data.currentEndDate}</span>
              </p>
            </div>
          </div>

          {step === "configure" ? (
            /* PHASE 1: DURATION SELECTION */
            <div className="space-y-6">
              {isRent && (
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-2">
                    Renewal Duration ({roomType === 'Furnished' ? 'Days' : 'Months'})
                  </label>
                  {roomType === 'Furnished' ? (
                    <input 
                      type="number" 
                      min={1}
                      value={rentDuration}
                      onChange={e => setRentDuration(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-full h-11 px-3.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900"
                    />
                  ) : (
                    <select
                      value={rentDuration}
                      onChange={e => setRentDuration(parseInt(e.target.value))}
                      className="w-full h-11 px-3.5 border border-zinc-200 rounded-xl text-sm font-medium focus:outline-none focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 cursor-pointer bg-white"
                    >
                      <option value={1}>1 Month Extension</option>
                      <option value={3}>3 Months Extension</option>
                      <option value={6}>6 Months Extension</option>
                      <option value={12}>1 Year (12 Months) Extension</option>
                    </select>
                  )}
                </div>
              )}

              {/* Amount Breakdown */}
              <div className="rounded-xl bg-zinc-50 border border-zinc-100 p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center text-zinc-500">
                  <span>Monthly Rate</span>
                  <span>GHS {basePrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-500">
                  <span>Duration</span>
                  <span>{rentDuration} {roomType === 'Furnished' ? 'Day(s)' : 'Month(s)'}</span>
                </div>
                <div className="pt-2 border-t border-zinc-200/60 flex justify-between items-baseline">
                  <span className="font-semibold text-zinc-900 text-sm">Total Renewal Amount</span>
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950">
                    GHS {finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Proceed Button */}
              <button
                type="button"
                onClick={handleProceedToPayment}
                disabled={isProcessing}
                className="w-full h-12 bg-zinc-900 hover:bg-black text-white text-xs sm:text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-transform duration-160 ease-out active:scale-[0.98] disabled:opacity-60 cursor-pointer shadow-xs"
              >
                {isProcessing ? "Preparing Instructions..." : "Proceed to Payment Instructions"}
              </button>
            </div>
          ) : (
            /* PHASE 2: PAYMENT INSTRUCTIONS */
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setStep("configure")}
                  className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 font-medium transition-colors"
                >
                  <ArrowLeft size={12} />
                  Change Duration
                </button>
                <span className="text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full">
                  Awaiting Transfer
                </span>
              </div>

              {/* Reference & Amount Card */}
              <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-3 mb-3 border-b border-zinc-200/60">
                  <div>
                    <span className="text-[11px] font-medium text-zinc-500 block mb-0.5">Amount to Pay</span>
                    <span className="text-2xl font-bold tracking-tight text-zinc-950">
                      GHS {finalTotal.toLocaleString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-zinc-500 block mb-0.5">Booking Reference</span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-zinc-900 bg-white border border-zinc-200 px-2.5 py-1 rounded-md">
                        {bookingReference}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(bookingReference, "ref")}
                        className="p-1 text-zinc-400 hover:text-zinc-900 hover:bg-white rounded transition-colors"
                        title="Copy reference"
                      >
                        {copiedKey === "ref" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] text-zinc-500 leading-relaxed">
                  Include booking reference <strong className="font-mono text-zinc-800">{bookingReference}</strong> as the payment description or transaction remarks.
                </p>
              </div>

              {/* Segmented Switcher */}
              <div>
                <div className="flex p-1 bg-zinc-100 rounded-lg mb-4">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={cn(
                      "flex-1 py-2 text-xs font-medium rounded-md transition-all duration-150 active:scale-[0.98]",
                      paymentMethod === "bank"
                        ? "bg-white text-zinc-900 shadow-xs font-semibold"
                        : "text-zinc-500 hover:text-zinc-900"
                    )}
                  >
                    Bank Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("momo")}
                    className={cn(
                      "flex-1 py-2 text-xs font-medium rounded-md transition-all duration-150 active:scale-[0.98]",
                      paymentMethod === "momo"
                        ? "bg-white text-zinc-900 shadow-xs font-semibold"
                        : "text-zinc-500 hover:text-zinc-900"
                    )}
                  >
                    Mobile Money
                  </button>
                </div>

                {/* Account Details */}
                {paymentMethod === "bank" ? (
                  <dl className="divide-y divide-zinc-100 text-xs border border-zinc-100 rounded-xl px-4 bg-white">
                    <div className="py-2.5 flex justify-between items-center">
                      <dt className="text-zinc-500 font-normal">Bank Name</dt>
                      <dd className="font-medium text-zinc-900">{BANK_DETAILS.bankName}</dd>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <dt className="text-zinc-500 font-normal">Account Name</dt>
                      <dd className="font-medium text-zinc-900">{BANK_DETAILS.accountName}</dd>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <dt className="text-zinc-500 font-normal">Account Number</dt>
                      <dd className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-zinc-900">{BANK_DETAILS.accountNumber}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(BANK_DETAILS.accountNumber.replace(/\s/g, ""), "bank")}
                          className="p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                          title="Copy account number"
                        >
                          {copiedKey === "bank" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      </dd>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <dt className="text-zinc-500 font-normal">Branch</dt>
                      <dd className="font-medium text-zinc-700">{BANK_DETAILS.branch}</dd>
                    </div>
                  </dl>
                ) : (
                  <dl className="divide-y divide-zinc-100 text-xs border border-zinc-100 rounded-xl px-4 bg-white">
                    <div className="py-2.5 flex justify-between items-center">
                      <dt className="text-zinc-500 font-normal">Supported Networks</dt>
                      <dd className="font-medium text-zinc-900">{MOMO_DETAILS.network}</dd>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <dt className="text-zinc-500 font-normal">Merchant Name</dt>
                      <dd className="font-medium text-zinc-900">{MOMO_DETAILS.merchantName}</dd>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <dt className="text-zinc-500 font-normal">Merchant / Till ID</dt>
                      <dd className="flex items-center gap-1.5">
                        <span className="font-mono font-semibold text-zinc-900">{MOMO_DETAILS.merchantId}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(MOMO_DETAILS.merchantId, "momo")}
                          className="p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-colors"
                          title="Copy merchant ID"
                        >
                          {copiedKey === "momo" ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
                        </button>
                      </dd>
                    </div>
                    <div className="py-2.5 flex justify-between items-center">
                      <dt className="text-zinc-500 font-normal">Direct Helpline</dt>
                      <dd className="font-medium text-zinc-700">{MOMO_DETAILS.phone}</dd>
                    </div>
                  </dl>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-11 bg-zinc-900 hover:bg-black text-white text-xs sm:text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-transform duration-160 ease-out active:scale-[0.98] shadow-xs"
                >
                  Send Receipt via WhatsApp
                </a>

                <button
                  type="button"
                  onClick={handleConfirmedReceipt}
                  className="w-full h-11 bg-white border border-zinc-200/80 hover:bg-zinc-50 text-zinc-800 text-xs sm:text-sm font-medium rounded-xl flex items-center justify-center transition-transform duration-160 ease-out active:scale-[0.98] cursor-pointer"
                >
                  I Have Sent the Receipt
                </button>

                <p className="text-[11px] text-center text-zinc-400 font-normal leading-relaxed">
                  Our accounts team matches transfers within 1–2 hours. Your lease will be automatically extended upon verification.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
