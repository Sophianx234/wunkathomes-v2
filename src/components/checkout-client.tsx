"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner" 
import { Lock, Copy, Check, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { 
  ArrowLeft01Icon, 
  CheckmarkBadge01Icon,
  CreditCardIcon,
  SmartPhone01Icon,
  Loading03Icon,
  Shield01Icon,
  ArrowDown01Icon
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { IProperty } from "@/components/property-card"
import { createManualBankPaymentAction } from "@/actions/user/payment.action"
import { LoginModal } from "@/components/login-modal"
import { Checkbox } from "@/components/ui/checkbox"
import { TenancyDocument } from "@/components/lease-document viewer"

interface CheckoutClientProps {
  listing: IProperty | any;
  currentUser?: { id: string; name: string; email: string; phone: string } | null;
  existingPendingReservation?: { reference: string; amount: number } | null;
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

export default function CheckoutClient({ 
  listing, 
  currentUser, 
  existingPendingReservation 
}: CheckoutClientProps) {
  const router = useRouter()
  
  // Setup default move-in date to tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const defaultDate = tomorrow.toISOString().split('T')[0]

  const propType = listing?.listingType || listing?.property?.type || "For_Rent";
  const isSale = propType === "Sale" || propType === "For_Sale";
  const isRent = !isSale;

  const pageHeader = isSale 
    ? "Complete Your Property Acquisition" 
    : propType === "Short-let" || propType === "Short_Let"
    ? "Confirm Your Booking" 
    : "Finalize Your Lease Agreement";

  const pricingLabel = isSale 
    ? "Total Purchase Price" 
    : propType === "Short-let" || propType === "Short_Let"
    ? "Total Booking Cost" 
    : "Total Lease Payment";

  const buttonText = isSale 
    ? "Proceed to Bank Payment" 
    : "Proceed to Payment Instructions";

  // --- State ---
  const [step, setStep] = useState<"DETAILS" | "PAYMENT_INSTRUCTIONS">(
    existingPendingReservation?.reference ? "PAYMENT_INSTRUCTIONS" : "DETAILS"
  );
  const [bookingReference, setBookingReference] = useState(
    existingPendingReservation?.reference || ""
  );
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"bank" | "momo">("bank");

  const [formData, setFormData] = useState({
    legalName: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || ""
  })
  const [moveInDate, setMoveInDate] = useState(defaultDate)
  const [isProcessing, setIsProcessing] = useState(false)
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false)

  const roomType = listing?.roomType || "Empty"; // 'Furnished' or 'Empty'
  const [rentDuration, setRentDuration] = useState<number>(roomType === 'Furnished' ? 1 : 3);

  // Calculations
  const basePrice = listing.price || 0;
  let rentSubtotal = basePrice;
  let securityDeposit = 0;

  if (isRent) {
    rentSubtotal = basePrice * rentDuration;
    if (roomType === 'Furnished') {
      securityDeposit = basePrice * 2; // 2 days
    } else {
      securityDeposit = basePrice * 2; // 2 months
    }
  }

  const finalTotal = isRent ? rentSubtotal + securityDeposit : basePrice;

  const formatLocation = (loc: any) => {
    if (typeof loc === 'string') return loc;
    if (loc?.area && loc?.city) return `${loc.area}, ${loc.city}`;
    if (loc?.area && loc?.region) return `${loc.area}, ${loc.region}`;
    return "Location available upon booking";
  }

  const draftActivation = {
    user: { name: formData.legalName || "Tenant Name" },
    lease: {
      id: "draft",
      propertyName: listing?.title || "Property",
      propertyLocation: formatLocation(listing?.property?.location),
      startDate: moveInDate,
      totalRentAmount: finalTotal,
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success("Copied to clipboard!");
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleAgreementScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 25) {
      setHasScrolledToBottom(true);
    }
  };

  // Form Submit Handler -> Initiates Reservation & Moves to Step 4
  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.legalName || !formData.phone || !moveInDate) {
      toast.error("Please complete all required details.");
      return;
    }

    if (!agreedToTerms) {
      toast.error("Please review and agree to the Tenancy Agreement.");
      return;
    }

    if (!currentUser) {
      toast.error("Please log in to proceed.");
      return;
    }

    setIsProcessing(true);

    try {
      const result = await createManualBankPaymentAction({
        listingId: listing.id,
        selectedMoveInDate: moveInDate,
        rentDuration,
        legalName: formData.legalName.trim(),
        phone: formData.phone.trim(),
      });

      if (result.success && result.reference) {
        setBookingReference(result.reference);
        setStep("PAYMENT_INSTRUCTIONS");
        window.scrollTo({ top: 0, behavior: "smooth" });
        toast.success("Reservation initiated! Please follow payment instructions below.");
      } else {
        toast.error(result.message || "Failed to initiate reservation.");
      }
    } catch (err: any) {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // Construct Pre-filled WhatsApp message (no emojis, guaranteed %0A line breaks)
  const whatsappLines = [
    "Hello Wunkat Homes, I have made payment for my reservation.",
    "",
    `Booking Ref: ${bookingReference}`,
    `Property: ${listing?.title || "Property"}`,
    `Tenant Name: ${formData.legalName || currentUser?.name || "Tenant"}`,
    `Amount: GHS ${finalTotal.toLocaleString()}`,
    "",
    "Attached is my payment transfer receipt/screenshot."
  ];
  const whatsappMessage = whatsappLines.map(line => encodeURIComponent(line)).join("%0A");
  const whatsappUrl = `https://wa.me/${BUSINESS_WHATSAPP_NUMBER.replace(/[^0-9]/g, "")}?text=${whatsappMessage}`;

  const handleConfirmedReceipt = () => {
    toast.success("Reservation recorded! Redirecting to confirmation receipt...");
    router.push(`/checkout/success?reference=${bookingReference}`);
  };

  return (
    <main className="min-h-screen bg-zinc-50/50 text-black py-6 md:py-16 px-2 md:px-4 sm:px-6 lg:px-8 overflow-x-hidden">
      
      {/* Top Nav */}
      <div className="max-w-6xl mx-auto mb-5 md:mb-8 px-2 md:px-0">
        {step === "PAYMENT_INSTRUCTIONS" ? (
          <button 
            type="button"
            onClick={() => setStep("DETAILS")} 
            className="group inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors"
          >
            <ArrowLeft size={14} className="transition-transform duration-160 ease-out group-hover:-translate-x-0.5" />
            Back to Agreement & Details
          </button>
        ) : (
          <Link href={`/properties/${listing.slug}`} className="group inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-500 hover:text-black transition-colors">
            <span className="scale-75 md:scale-100 flex items-center transition-transform duration-160 ease-out group-hover:-translate-x-0.5">
              <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
            </span>
            Return to Property
          </Link>
        )}
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-16 px-2 md:px-0">
        
        {/* ========================================================================= */}
        {/* LEFT COLUMN: Details / Tenancy Agreement OR Payment Instructions          */}
        {/* ========================================================================= */}
        <div className="lg:col-span-7 flex flex-col">
          
          {step === "DETAILS" ? (
            <>
              <h1 className="text-xl md:text-3xl font-bold tracking-tight mb-1 md:mb-2 text-slate-900">
                {pageHeader}
              </h1>
              <p className="text-xs md:text-sm text-slate-500 mb-5 md:mb-8 leading-relaxed">
                Enter your details below to reserve this property and prepare your Tenancy Agreement.
              </p>

              <form onSubmit={handleProceedToPayment} className="space-y-4 md:space-y-6 w-full max-w-full box-border">
                
                {/* Legal Information Section */}
                <div className="bg-white p-3 md:p-6 rounded-lg border border-zinc-200/60 w-full max-w-full box-border">
                  <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest mb-3 md:mb-5 border-b border-zinc-200/60 pb-2 md:pb-3">
                    Tenant Details
                  </h2>
                  
                  <div className="space-y-2.5 md:space-y-4 w-full max-w-full box-border">
                    <div className="w-full min-w-0 max-w-full box-border">
                      <label className="block text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1 md:mb-2">
                        Full Name (Match with your Ghana Card)
                      </label>
                      <input 
                        required
                        type="text" 
                        value={formData.legalName}
                        onChange={e => setFormData({...formData, legalName: e.target.value})}
                        className="block w-full min-w-0 max-w-full box-border m-0 p-2.5 md:p-3.5 border border-slate-300 rounded-lg text-xs md:text-sm font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-zinc-50/50 focus:bg-white transition-all appearance-none"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-4 w-full max-w-full box-border">
                      <div className="w-full min-w-0 max-w-full box-border">
                        <label className="block text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1 md:mb-2">
                          Email Address
                        </label>
                        <input 
                          required
                          type="email" 
                          value={formData.email}
                          onChange={e => setFormData({...formData, email: e.target.value})}
                          className="block w-full min-w-0 max-w-full box-border m-0 p-2.5 md:p-3.5 border border-slate-300 rounded-lg text-xs md:text-sm font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-zinc-50/50 focus:bg-white transition-all appearance-none"
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
                          className="block w-full min-w-0 max-w-full box-border m-0 p-2.5 md:p-3.5 border border-slate-300 rounded-lg text-xs md:text-sm font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-zinc-50/50 focus:bg-white transition-all appearance-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 md:gap-4 w-full max-w-full box-border pt-1 md:pt-2">
                      {/* Move-In Date Selector */}
                      <div className="w-full min-w-0 max-w-full box-border">
                        <label className="block text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1 md:mb-2">
                          Expected Move-In Date
                        </label>
                        <input 
                          required
                          type="date" 
                          min={defaultDate}
                          value={moveInDate}
                          onChange={e => setMoveInDate(e.target.value)}
                          className="block w-full min-w-0 max-w-full box-border m-0 p-2.5 md:p-3.5 border border-slate-300 rounded-lg text-xs md:text-sm font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-zinc-50/50 focus:bg-white transition-all appearance-none"
                        />
                      </div>

                      {/* Rent Duration Selector */}
                      {isRent && (
                        <div className="w-full min-w-0 max-w-full box-border">
                          <label className="block text-[9px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-1 md:mb-2">
                            Rent Duration ({roomType === 'Furnished' ? 'Days' : 'Months'})
                          </label>
                          {roomType === 'Furnished' ? (
                            <input 
                              required
                              type="number" 
                              min={1}
                              value={rentDuration}
                              onChange={e => setRentDuration(Math.max(1, parseInt(e.target.value) || 1))}
                              className="block w-full min-w-0 max-w-full box-border m-0 p-2.5 md:p-3.5 border border-slate-300 rounded-lg text-xs md:text-sm font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-zinc-50/50 focus:bg-white transition-all appearance-none"
                            />
                          ) : (
                            <select
                              required
                              value={rentDuration}
                              onChange={e => setRentDuration(parseInt(e.target.value))}
                              className="block w-full min-w-0 max-w-full box-border m-0 p-2.5 md:p-3.5 border border-slate-300 rounded-lg text-xs md:text-sm font-bold focus:outline-none focus:border-black focus:ring-1 focus:ring-black bg-zinc-50/50 focus:bg-white transition-all appearance-none cursor-pointer"
                            >
                              <option value={3}>3 Months</option>
                              <option value={6}>6 Months</option>
                              <option value={12}>1 Year (12 Months)</option>
                            </select>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="w-full min-w-0 max-w-full box-border">
                      <p className="text-[8px] md:text-[10px] text-zinc-400 mt-1 md:mt-2 font-medium break-words">
                        Your digital lease will activate at 12:00 AM on the move-in date. Access PIN instructions will appear in your dashboard upon payment verification.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Terms and Signature Section */}
                <div className="bg-white p-3 md:p-6 rounded-lg border border-zinc-200/60 w-full max-w-full box-border">
                  <h2 className="text-xs md:text-sm font-bold uppercase tracking-widest mb-3 md:mb-4 border-b border-zinc-200/60 pb-2 md:pb-3 flex items-center justify-between">
                    Tenancy Agreement
                  </h2>
                  
                  <div 
                    className="w-full h-[360px] md:h-[450px] overflow-y-auto border border-zinc-200 rounded-md mb-4 bg-zinc-50/30 p-2 md:p-4 relative"
                    onScroll={handleAgreementScroll}
                  >
                    <div className="max-w-none text-xs md:text-sm text-slate-800">
                      <TenancyDocument selectedActivation={draftActivation as any} showNav={false} isModal={true} onBack={() => {}} />
                    </div>
                    {!hasScrolledToBottom && (
                      <div className="sticky bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white/90 to-transparent pt-10 pb-3 flex justify-center pointer-events-none">
                        <span className="bg-black text-white text-[10px] md:text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-2 shadow-sm animate-pulse">
                          Scroll to bottom to agree <HugeiconsIcon icon={ArrowDown01Icon} size={14} />
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <Checkbox 
                        id="terms" 
                        checked={agreedToTerms}
                        onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                        disabled={!hasScrolledToBottom}
                        className="mt-1 disabled:opacity-50"
                      />
                      <label 
                        htmlFor="terms" 
                        className={`text-xs md:text-sm leading-relaxed ${!hasScrolledToBottom ? 'text-zinc-400 cursor-not-allowed' : 'text-zinc-600 cursor-pointer'}`}
                      >
                        I, <strong>{formData.legalName || "[Full Legal Name]"}</strong>, acknowledge that I have reviewed the Standard Tenancy Agreement. I agree to be legally bound by its terms, which will take effect upon verified payment.
                      </label>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                {currentUser ? (
                  <div className="w-full">
                    <Button 
                      type="submit"
                      disabled={isProcessing || !agreedToTerms}
                      className="w-full py-6 bg-black text-white hover:bg-black/90 font-bold tracking-tight text-sm md:text-base rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
                    >
                      {isProcessing && <HugeiconsIcon icon={Loading03Icon} size={18} className="animate-spin" />}
                      {isProcessing ? "Initiating Reservation..." : buttonText}
                    </Button>
                    
                    <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1.5 mt-3 leading-relaxed">
                      <Lock size={14} className="text-slate-500" />
                      Zero platform charges. Pay securely via direct Bank Transfer or MoMo.
                    </p>
                  </div>
                ) : (
                  <LoginModal>
                    <div className="w-full">
                      <Button 
                        type="button"
                        className="w-full py-6 bg-black text-white hover:bg-black/90 font-bold tracking-tight text-sm md:text-base rounded-lg flex items-center justify-center gap-2 transition-colors cursor-pointer"
                      >
                        Log in to Continue
                      </Button>
                      
                      <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1.5 mt-3 leading-relaxed">
                        <Lock size={14} className="text-slate-500" />
                        Please log in or create an account to secure this lease.
                      </p>
                    </div>
                  </LoginModal>
                )}
              </form>
            </>
          ) : (
            /* =================================================================== */
            /* STEP 4: DIRECT BANK TRANSFER & MOMO PAYMENT INSTRUCTIONS           */
            /* =================================================================== */
            <div className="space-y-5 animate-in fade-in duration-200">
              
              {/* Header */}
              <div>
                <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
                  Step 2 of 2 · Transfer & Confirm
                </p>
                <h1 className="text-xl md:text-3xl font-bold tracking-tight text-zinc-900 mb-1.5">
                  Payment Instructions
                </h1>
                <p className="text-xs md:text-sm text-zinc-500 leading-relaxed">
                  Transfer the exact rent amount using the details below. Once sent, share your payment confirmation on WhatsApp to finalize your tenancy.
                </p>
              </div>

              {/* 1. Essential Summary Card: Amount & Reference */}
              <div className="rounded-xl border border-zinc-200/80 bg-white p-5 md:p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                      Total Amount Due
                    </span>
                    <span className="text-2xl md:text-3xl font-black text-zinc-900 tracking-tight">
                      GHS {finalTotal.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">
                      Booking Reference
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-sm md:text-base font-bold text-zinc-900 bg-zinc-100 px-3 py-1 rounded-md tracking-wider">
                        {bookingReference}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(bookingReference, "ref")}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-700 bg-zinc-100 hover:bg-zinc-200/70 rounded-md transition-transform duration-160 ease-out active:scale-[0.96]"
                        title="Copy reference code"
                      >
                        {copiedKey === "ref" ? (
                          <>
                            <Check size={12} className="text-emerald-600" />
                            <span className="text-[11px] text-emerald-600 font-bold">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span className="text-[11px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-500 leading-relaxed">
                  Include <strong className="font-mono text-zinc-900">{bookingReference}</strong> in your transfer description/remarks so we can match your payment instantly.
                </p>
              </div>

              {/* 2. Refined Segmented Control: Bank Transfer vs Mobile Money */}
              <div className="rounded-xl border border-zinc-200/80 bg-white p-5 md:p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
                <div className="flex p-1 bg-zinc-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-160 ease-out active:scale-[0.98]",
                      paymentMethod === "bank"
                        ? "bg-white text-zinc-900 shadow"
                        : "text-zinc-500 hover:text-zinc-900"
                    )}
                  >
                    Bank Transfer
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("momo")}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-md transition-all duration-160 ease-out active:scale-[0.98]",
                      paymentMethod === "momo"
                        ? "bg-white text-zinc-900 shadow"
                        : "text-zinc-500 hover:text-zinc-900"
                    )}
                  >
                    Mobile Money
                  </button>
                </div>

                {paymentMethod === "bank" ? (
                  <dl className="divide-y divide-zinc-100 text-xs">
                    <div className="py-3 flex justify-between items-center">
                      <dt className="text-zinc-500 font-medium">Bank Name</dt>
                      <dd className="font-bold text-zinc-900">{BANK_DETAILS.bankName}</dd>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <dt className="text-zinc-500 font-medium">Account Name</dt>
                      <dd className="font-bold text-zinc-900">{BANK_DETAILS.accountName}</dd>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <dt className="text-zinc-500 font-medium">Account Number</dt>
                      <dd className="flex items-center gap-2">
                        <span className="font-mono font-bold text-zinc-900 text-sm">
                          {BANK_DETAILS.accountNumber}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(BANK_DETAILS.accountNumber.replace(/\s/g, ""), "bank")}
                          className="p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-transform duration-160 ease-out active:scale-[0.94]"
                          title="Copy account number"
                        >
                          {copiedKey === "bank" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        </button>
                      </dd>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <dt className="text-zinc-500 font-medium">Branch</dt>
                      <dd className="font-medium text-zinc-700">{BANK_DETAILS.branch}</dd>
                    </div>
                  </dl>
                ) : (
                  <dl className="divide-y divide-zinc-100 text-xs">
                    <div className="py-3 flex justify-between items-center">
                      <dt className="text-zinc-500 font-medium">Supported Networks</dt>
                      <dd className="font-bold text-zinc-900">{MOMO_DETAILS.network}</dd>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <dt className="text-zinc-500 font-medium">Merchant Name</dt>
                      <dd className="font-bold text-zinc-900">{MOMO_DETAILS.merchantName}</dd>
                    </div>
                    <div className="py-3 flex justify-between items-center">
                      <dt className="text-zinc-500 font-medium">Merchant / Till ID</dt>
                      <dd className="flex items-center gap-2">
                        <span className="font-mono font-bold text-zinc-900 text-sm">
                          {MOMO_DETAILS.merchantId}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(MOMO_DETAILS.merchantId, "momo")}
                          className="p-1 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded transition-transform duration-160 ease-out active:scale-[0.94]"
                          title="Copy merchant ID"
                        >
                          {copiedKey === "momo" ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                        </button>
                      </dd>
                    </div>
                  </dl>
                )}
              </div>

              {/* 3. Action Block: Single-Focus WhatsApp & Confirmation */}
              <div className="space-y-3 pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-4 px-6 bg-zinc-900 hover:bg-black text-white font-bold text-sm rounded-lg flex items-center justify-center gap-2 shadow-sm transition-transform duration-160 ease-out active:scale-[0.98]"
                >
                  Send Receipt via WhatsApp
                </a>

                <Button
                  type="button"
                  onClick={handleConfirmedReceipt}
                  variant="outline"
                  className="w-full py-4 text-xs md:text-sm font-bold rounded-lg border-zinc-200 text-zinc-700 hover:text-zinc-900 hover:bg-zinc-50 transition-transform duration-160 ease-out active:scale-[0.98] cursor-pointer"
                >
                  I Have Sent the Receipt
                </Button>

                <p className="text-[10px] text-center text-zinc-400 font-medium leading-relaxed pt-1">
                  Our team verifies receipts within 1–2 hours. Your digital agreement and access PIN will be activated on your dashboard.
                </p>
              </div>

            </div>
          )}

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Order Summary (Sticky)                                      */}
        {/* ========================================================================= */}
        <div className="lg:col-span-5 w-full box-border">
          <div className="sticky top-6 md:top-12 bg-white p-3 md:p-8 rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full box-border">
            
            {/* Property Preview Card */}
            <div className="flex gap-2 md:gap-4 mb-4 md:mb-8 pb-4 md:pb-8 border-b border-zinc-200/60 w-full box-border">
              <div className="relative w-16 h-16 md:w-24 md:h-24 rounded-lg overflow-hidden shrink-0 bg-zinc-100/50">
                <Image 
                  src={listing?.images?.[0] || '/a-1.jpg'} 
                  alt={listing?.title || "Property"}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  fill 
                  className="object-cover" 
                />
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
              <div className="flex justify-between items-center text-xs md:text-sm font-medium text-slate-900">
                <span>{pricingLabel}</span>
                <span>GHS {(isRent ? rentSubtotal : basePrice).toLocaleString()}</span>
              </div>
              {isRent && securityDeposit > 0 && (
                <div className="flex justify-between items-center text-xs md:text-sm font-medium text-slate-900">
                  <span>Security Deposit (Refundable)</span>
                  <span>GHS {securityDeposit.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs md:text-sm font-medium text-zinc-600">
                <span>Agency Fees</span>
                <span className="text-green-600 font-bold text-[10px] md:text-sm">Free</span>
              </div>
              <div className="flex justify-between items-center text-xs md:text-sm font-medium text-zinc-600">
                <span>Payment Processing Fee</span>
                <span className="text-green-600 font-bold text-[10px] md:text-sm">GHS 0.00</span>
              </div>
            </div>

            <div className="p-2 md:p-4 bg-zinc-50/50 border border-zinc-200/60 rounded-lg mb-3 md:mb-6 w-full box-border">
              <div className="flex justify-between items-center pt-3 border-t border-black/10">
                <span className="text-sm font-black uppercase tracking-widest text-black">Total Due</span>
                <span className="text-xl font-black text-black">
                  GHS {finalTotal.toLocaleString()}
                </span>
              </div>
              <p className="text-[8px] md:text-[10px] text-zinc-500 font-medium leading-relaxed mt-1 md:mt-2 break-words">
                {step === "PAYMENT_INSTRUCTIONS" 
                  ? "Send this exact amount to avoid payment matching delays." 
                  : "Proceeding places a temporary hold on this property."}
              </p>
            </div>

            <div className="mt-4 md:mt-8 flex items-start gap-1.5 md:gap-3 bg-green-50 p-2 md:p-4 rounded-lg border border-green-100 w-full box-border">
              <span className="scale-75 md:scale-100 shrink-0 mt-0.5 flex items-center">
                 <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} className="text-green-600" />
              </span>
              <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-green-800 leading-relaxed break-words">
                Upon verified transfer, your digital Tenancy Agreement will be officially approved and attached to your tenant dashboard.
              </p>
            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
