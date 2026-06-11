"use client";

import {
  Bathtub01Icon,
  BedDoubleIcon,
  Calendar01Icon,
  CreditCardIcon,
  Loading03Icon,
  LockKeyIcon,
  MapPinIcon,
  MaximizeIcon,
  SignatureIcon,
  ViewIcon,
  ViewOffIcon,
  Wrench01Icon,
  Key01Icon,
  House03Icon,
  Time01Icon,
  Alert01Icon,
  ArrowRight01Icon,
  Shield02Icon,
  Logout01Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; 
import { submitNoticeToVacate } from "@/actions/user/lease.action";

// --- SHADCN IMPORTS ---
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const getDaysDifference = (start: Date, end: Date) => {
  const utc1 = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utc2 = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
};

export interface DashboardProps {
  user: { name: string; kycStatus: string };
  activeLeases: Array<{
    lease: {
      id: string;
      status: string;
      totalRentAmount: number;
      startDate: string;
      endDate?: string;
      smartLockPin?: string;
      intentToVacate: boolean;
      signatureAudit: { isSigned: boolean };
    };
    listing: {
      title: string;
      images: string[];
      location: string;
      propertyType: string;
      bedrooms: number;
      bathrooms: number;
      sizeSqm: number;
      amenities: string[];
    };
  }>;
}

export function UserDashboard({ user, activeLeases }: DashboardProps) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentData = activeLeases[selectedIndex];
  const { lease, listing } = currentData;

  const [showPin, setShowPin] = useState(false);
  const [lockStatus, setLockStatus] = useState<"LOCKED" | "UNLOCKED" | "LOADING">("LOCKED");
  const [isRenewing, setIsRenewing] = useState(false);
  const [isVacating, setIsVacating] = useState(false);

  const needsKyc = user.kycStatus === "Unverified" || user.kycStatus === "Rejected";
  const needsSignature =  !lease.signatureAudit.isSigned;
  const isPendingAdmin = lease.status === "Awaiting_Admin_Approval";
  const isRestricted = needsKyc || needsSignature || isPendingAdmin;

  useEffect(() => {
    setShowPin(false);
    setLockStatus("LOCKED");
  }, [selectedIndex]);

  const startDate = new Date(lease.startDate);
  const endDate = lease.endDate
    ? new Date(lease.endDate)
    : new Date(startDate.getTime() + 365 * 24 * 60 * 60 * 1000);
  const today = new Date();

  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const totalDays = Math.max(1, getDaysDifference(startDate, endDate));

  let daysLeft: number | string = 0;
  let progressPercentage = 0;
  let statusText = "Days Left";
  let isExpiringSoon = false;
  let isExpired = false; 

  if (isRestricted) {
    daysLeft = "--";
    progressPercentage = 0;
    statusText = "Action Required";
  } else if (today < startDate) {
    const daysUntilMoveIn = getDaysDifference(today, startDate);
    daysLeft = totalDays; 
    progressPercentage = 0;
    statusText = ` ${daysUntilMoveIn > 1 ? `Starts in ${daysUntilMoveIn} Days` : "Starting Tomorrow"}`;
  } else if (today > endDate) {
    daysLeft = 0;
    progressPercentage = 100;
    statusText = "Expired (Grace Period)";
    isExpiringSoon = true;
    isExpired = true;
  } else {
    const daysPassed = getDaysDifference(startDate, today);
    daysLeft = getDaysDifference(today, endDate);
    progressPercentage = Math.min(100, Math.max(0, (daysPassed / totalDays) * 100));
    statusText = lease.intentToVacate ? "Days Until Move-Out" : "Days Left";
    isExpiringSoon = daysLeft <= 30;
  }

  const toggleSmartLock = async () => {
    if (lockStatus === "LOADING" || isRestricted) return;
    const action = lockStatus === "LOCKED" ? "unlocking" : "locking";
    setLockStatus("LOADING");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const newStatus = action === "unlocking" ? "UNLOCKED" : "LOCKED";
      setLockStatus(newStatus);
      toast.success(`Door securely ${newStatus.toLowerCase()}.`);
    } catch (error) {
      toast.error(`Failed to ${action.replace("ing", "e")} door. Check connection.`);
      setLockStatus(action === "unlocking" ? "LOCKED" : "UNLOCKED");
    }
  };

  const handleRenewal = () => {
    setIsRenewing(true);
    router.push(`/checkout/renew?leaseId=${lease.id}`);
  };

  // Removed window.confirm! Handled safely via Shadcn Action.
  const handleVacate = async () => {
    setIsVacating(true);
    const result = await submitNoticeToVacate(lease.id);
    
    if (result.success) {
      toast.success(result.message);
      router.refresh(); 
    } else {
      toast.error(result.message || "Failed to submit notice.");
    }
    setIsVacating(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24">
      {/* HEADER */}
      <header className="bg-zinc-950 text-white pt-24 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">Tenant Dashboard</h1>
            <p className="text-sm font-medium text-slate-400">Welcome home, {user.name.split(" ")[0]}.</p>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 shrink-0">
            <span className={`w-2 h-2 rounded-full ${isRestricted ? "bg-amber-500" : lockStatus === "LOCKED" ? "bg-green-500" : "bg-red-500"} ${!isRestricted && "animate-pulse"}`} />
            <span className="text-xs font-bold uppercase tracking-widest text-white">{isRestricted ? "System Restricted" : `Door ${lockStatus}`}</span>
          </div>
        </div>

        {activeLeases.length > 1 && (
          <div className="max-w-6xl mx-auto mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {activeLeases.map((item, idx) => (
              <button
                key={item.lease.id}
                onClick={() => setSelectedIndex(idx)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest transition-all border flex items-center gap-2 ${
                  selectedIndex === idx ? "bg-white text-black border-white shadow-lg" : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <HugeiconsIcon icon={House03Icon} size={14} />
                {item.listing.title}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10 space-y-8">
        
        {/* ========================================================= */}
        {/* ACTION CARDS & ALERTS (PREMIUM MINIMALIST STYLING)        */}
        {/* ========================================================= */}
        
        {/* 1. KYC BANNER */}
        {needsKyc && (
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6  relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900" />
            <div className="flex items-start sm:items-center gap-4 pl-2">
              <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={Shield02Icon} className="text-slate-900" size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">Identity Verification Required</h4>
                <p className="text-sm text-slate-500 font-medium">Please verify your identity to generate your Smart Lock access credentials.</p>
              </div>
            </div>
            <Link href="/user/leases" className="shrink-0 w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center">
              Verify Identity
            </Link>
          </div>
        )}

        {/* 2. SIGNATURE BANNER */}
        {needsSignature && (
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-6  relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900" />
            <div className="flex items-start sm:items-center gap-4 pl-2">
              <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={SignatureIcon} className="text-slate-900" size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">Digital Signature Required</h4>
                <p className="text-sm text-slate-500 font-medium">Please review and sign your digital Tenancy Agreement to finalize your application.</p>
              </div>
            </div>
            <Link href={`/user/sign-lease?leaseId=${lease.id}`} className="shrink-0 w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-black text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center">
              Sign Document
            </Link>
          </div>
        )}

        {/* 3. ADMIN REVIEW BANNER */}
        {isPendingAdmin && (
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300" />
            <div className="flex items-start sm:items-center gap-4 pl-2">
              <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={Time01Icon} className="text-slate-900" size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">Application Under Review</h4>
                <p className="text-sm text-slate-500 font-medium">Your documents have been submitted. Our team is finalizing your verification.</p>
              </div>
            </div>
          </div>
        )}

        {/* 4. RENEWAL & VACATE ACTION CARD (Replaces the inline buttons) */}
        {isExpiringSoon && !isRestricted && (
          <div className="bg-white border border-slate-200 p-6 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-6  relative overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900" />
            
            <div className="flex items-start gap-4 pl-2">
              <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <HugeiconsIcon 
                  icon={lease.intentToVacate ? Logout01Icon : isExpired ? Alert01Icon : Calendar01Icon} 
                  className="text-slate-900" 
                  size={20} 
                />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 tracking-tight">
                  {lease.intentToVacate 
                    ? "Move-Out Scheduled" 
                    : isExpired 
                      ? "Payment Overdue: Lease Expired" 
                      : "Lease Renewal Due"
                  }
                </h4>
                <p className="text-sm text-slate-500 font-medium mt-1 max-w-xl">
                  {lease.intentToVacate
                    ? `Your notice to vacate is confirmed for ${endDate.toLocaleDateString()}. Please prepare for the final property inspection.`
                    : isExpired
                      ? "Your lease has officially expired. Please renew your subscription immediately to prevent the automatic revocation of your smart lock access."
                      : `Your current lease concludes in ${daysLeft} days. Please secure your renewal or officially submit a notice to vacate.`
                  }
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            {!lease.intentToVacate && (
              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 pl-2 md:pl-0">
                
                {/* SHADCN ALERT DIALOG FOR VACATING */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={isRenewing || isVacating}
                      className="w-full sm:w-auto px-5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {isVacating ? (
                        <><HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" /> Submitting...</>
                      ) : (
                        "Notice to Vacate"
                      )}
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will inform property management that you are vacating on <strong>{endDate.toLocaleDateString()}</strong>. Your smart lock access will expire, and the property will be immediately listed for new tenants.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={handleVacate}
                        className="bg-slate-900 text-white hover:bg-slate-800"
                      >
                        Confirm Move-Out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <button
                  onClick={handleRenewal}
                  disabled={isRenewing || isVacating}
                  className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-black text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-sm"
                >
                  {isRenewing ? (
                    <><HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" /> Processing...</>
                  ) : (
                    "Renew Lease"
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBSCRIPTION STATS TRACKER (Clean, structural, no buttons) */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl  border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-6">
            <div>
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                Lease Timeline
              </h3>
              <p className="text-sm text-slate-900 font-medium">
                {startDate.toLocaleDateString()} — {endDate.toLocaleDateString()}
              </p>
            </div>

            <div className="text-left md:text-right">
              <p className="text-3xl font-black text-slate-900 tracking-tight flex flex-col">
                {daysLeft}
                <span className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-1">
                  {statusText}
                </span>
              </p>
            </div>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${isRestricted ? "bg-slate-300" : "bg-slate-900"}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
            <span>Move-In</span>
            <span>{isRestricted ? "Action Required" : today < startDate ? "Pending" : `${Math.round(progressPercentage)}% Completed`}</span>
            <span>{lease.intentToVacate ? "Move-Out Date" : "Expiration"}</span>
          </div>
        </div>

        {/* HERO: Property & Smart Lock Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-2xl  border border-slate-200 overflow-hidden flex flex-col sm:flex-row">
            <div className="w-full sm:w-2/5 h-48 sm:h-auto relative bg-slate-100">
              <Image src={listing.images[0] || "/placeholder.jpg"} alt="Property" fill className="object-cover" />
            </div>
            <div className="p-6 sm:p-8 flex flex-col justify-center flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 bg-slate-100 px-2 py-1 rounded">{listing.propertyType}</span>
                
                {isRestricted ? (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-slate-100 px-2 py-1 rounded flex items-center gap-1">
                    <HugeiconsIcon icon={Time01Icon} size={10} /> Action Required
                  </span>
                ) : isExpired ? (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-900 bg-slate-200 px-2 py-1 rounded flex items-center gap-1">
                    <HugeiconsIcon icon={Alert01Icon} size={10} /> Overdue
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-700 bg-slate-100 px-2 py-1 rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{listing.title}</h2>
              <p className="text-sm font-medium text-slate-500 mb-6 flex items-center gap-2">
                <HugeiconsIcon icon={MapPinIcon} size={16} /> {listing.location}
              </p>

              <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-6">
                <div className="flex flex-col items-start gap-1 text-slate-700">
                  <HugeiconsIcon icon={BedDoubleIcon} size={18} className="text-slate-400" />
                  <span className="text-sm font-bold">{listing.bedrooms} Beds</span>
                </div>
                <div className="flex flex-col items-start gap-1 text-slate-700">
                  <HugeiconsIcon icon={Bathtub01Icon} size={18} className="text-slate-400" />
                  <span className="text-sm font-bold">{listing.bathrooms} Baths</span>
                </div>
                <div className="flex flex-col items-start gap-1 text-slate-700">
                  <HugeiconsIcon icon={MaximizeIcon} size={18} className="text-slate-400" />
                  <span className="text-sm font-bold">{listing.sizeSqm || "--"} Sqm</span>
                </div>
              </div>
            </div>
          </div>

          {/* DIGITAL KEYS BLOCK */}
          <div className={`rounded-2xl  p-8 flex flex-col justify-center relative overflow-hidden transition-colors duration-500 ${isRestricted ? "bg-zinc-900 border border-zinc-800" : lockStatus === "UNLOCKED" ? "bg-zinc-800 border border-zinc-700" : "bg-zinc-950 border border-black"}`}>
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <HugeiconsIcon icon={Key01Icon} size={150} />
            </div>

            <div className="relative z-10 h-full flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                  <HugeiconsIcon icon={isRestricted ? Time01Icon : Key01Icon} size={24} className={isRestricted ? "text-slate-400" : "text-white"} />
                </div>
                {!isRestricted && (
                  <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${lockStatus === "LOCKED" ? "bg-green-500/10 text-green-400 border-green-500/20" : lockStatus === "UNLOCKED" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-white/10 text-white border-white/20"}`}>
                    Door is {lockStatus}
                  </span>
                )}
              </div>

              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Smart Lock Access</h3>

              <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                {isRestricted ? (
                  <div className="font-mono text-xl font-bold text-slate-500 uppercase tracking-[0.1em]">Pending</div>
                ) : (
                  <>
                    <div className="font-mono text-3xl font-black text-white tracking-[0.2em]">{showPin ? lease.smartLockPin || "849201" : "••••••"}</div>
                    <button onClick={() => setShowPin(!showPin)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white" title={showPin ? "Hide PIN" : "Reveal PIN"}>
                      <HugeiconsIcon icon={showPin ? ViewOffIcon : ViewIcon} size={20} />
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={toggleSmartLock}
                disabled={lockStatus === "LOADING" || today < startDate || isRestricted}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs transition-all shadow-lg mt-auto ${
                  isRestricted ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5" : today < startDate ? "bg-white/5 text-slate-600 cursor-not-allowed border border-white/10" : lockStatus === "LOADING" ? "bg-white/10 text-slate-400 cursor-wait" : lockStatus === "LOCKED" ? "bg-white text-black hover:bg-slate-200" : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                {needsKyc ? (
                  <><HugeiconsIcon icon={Shield02Icon} size={18} /> Complete KYC</>
                ) : needsSignature ? (
                  <><HugeiconsIcon icon={SignatureIcon} size={18} /> Sign Lease</>
                ) : isPendingAdmin ? (
                  <><HugeiconsIcon icon={Alert01Icon} size={18} /> Provisioning...</>
                ) : today < startDate ? (
                  <><HugeiconsIcon icon={LockKeyIcon} size={18} /> Active on Move-in</>
                ) : lockStatus === "LOADING" ? (
                  <><HugeiconsIcon icon={Loading03Icon} size={18} className="animate-spin" /> Connecting...</>
                ) : lockStatus === "LOCKED" ? (
                  <><HugeiconsIcon icon={ViewIcon} size={18} /> Unlock Door Remotely</>
                ) : (
                  <><HugeiconsIcon icon={LockKeyIcon} size={18} /> Lock Door Securely</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* UTILITIES & ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {!isRestricted && (
            <Link href={`/user/maintenance`} className="bg-white p-6 rounded-2xl border border-slate-200  hover:border-slate-300  transition-all text-left flex flex-col gap-4 group">
              <div className="w-10 h-10 bg-slate-50 text-slate-900 border border-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                <HugeiconsIcon icon={Wrench01Icon} size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Report an Issue</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Create a maintenance ticket for plumbing, AC, or smart lock issues.</p>
              </div>
            </Link>
          )}

          <Link href={`/user/transactions`} className="bg-white p-6 rounded-2xl border border-slate-200  hover:border-slate-300  transition-all text-left flex flex-col gap-4 group">
            <div className="w-10 h-10 bg-slate-50 text-slate-900 border border-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-100 transition-colors">
              <HugeiconsIcon icon={CreditCardIcon} size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Payment History</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">View your transaction history and download official receipts.</p>
            </div>
          </Link>

          {!needsSignature && (
            <Link href={`/user/lease-document/${lease.id}`} className="bg-white p-6 rounded-2xl border border-slate-200  hover:border-slate-300  transition-all text-left flex flex-col gap-4 group">
              <div className="w-10 h-10 bg-slate-50 text-slate-900 border border-slate-100 rounded-full flex items-center justify-center group-hover:bg-slate-100 transition-colors">
                <HugeiconsIcon icon={SignatureIcon} size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Lease Document</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">Download a PDF copy of your signed tenancy agreement document.</p>
              </div>
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}