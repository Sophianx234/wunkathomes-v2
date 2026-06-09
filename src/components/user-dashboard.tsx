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
  ArrowRight01Icon, // Imported for the Renewal Button
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation"; // Imported for routing

// --- BULLETPROOF DATE HELPER ---
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

  const isPendingApproval = lease.status === "Awaiting_Admin_Approval" || lease.status === "Pending_Verification";

  useEffect(() => {
    setShowPin(false);
    setLockStatus("LOCKED");
  }, [selectedIndex]);

  // --- PERFECTED SUBSCRIPTION MATH ---
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
  let isExpired = false; // Phase 2 Tracker

  if (isPendingApproval) {
    daysLeft = "--";
    progressPercentage = 0;
    statusText = "Pending Review";
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
    statusText = "Days Left";
    isExpiringSoon = daysLeft <= 30;
  }

  // --- Smart Lock Handler ---
  const toggleSmartLock = async () => {
    if (lockStatus === "LOADING" || isPendingApproval) return;

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

  // --- Renewal Handler (1-Click) ---
  const handleRenewal = () => {
    setIsRenewing(true);
    // Route them to a specialized checkout page where they do NOT have to do KYC or re-sign the lease.
    router.push(`/checkout/renew?leaseId=${lease.id}`);
  };

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24">
      {/* HEADER */}
      <header className="bg-zinc-950 text-white pt-24 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">
              Tenant Dashboard
            </h1>
            <p className="text-sm font-medium text-slate-400">
              Welcome home, {user.name.split(" ")[0]}.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10 shrink-0">
            <span
              className={`w-2 h-2 rounded-full ${isPendingApproval ? "bg-amber-500" : lockStatus === "LOCKED" ? "bg-green-500" : "bg-red-500"} ${!isPendingApproval && "animate-pulse"}`}
            />
            <span className="text-xs font-bold uppercase tracking-widest text-white">
              {isPendingApproval ? "System Pending" : `Door ${lockStatus}`}
            </span>
          </div>
        </div>

        {/* MULTI-PROPERTY SELECTOR */}
        {activeLeases.length > 1 && (
          <div className="max-w-6xl mx-auto mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {activeLeases.map((item, idx) => (
              <button
                key={item.lease.id}
                onClick={() => setSelectedIndex(idx)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-md text-xs font-bold uppercase tracking-widest transition-all border flex items-center gap-2 ${
                  selectedIndex === idx 
                    ? "bg-white text-black border-white shadow-lg" 
                    : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
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
        
        {/* THE WAITING ROOM BANNER */}
        {isPendingApproval && (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Time01Icon} className="text-amber-600" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900 mb-1 tracking-tight">Application Under Review</h4>
              <p className="text-xs text-amber-800 font-medium leading-relaxed">
                Your payment and tenancy agreement have been successfully submitted. Our team is finalizing your verification. You will receive an SMS with your access PIN once approved.
              </p>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PHASE 2: GRACE PERIOD OVERDUE WARNING */}
        {/* ========================================================= */}
        {isExpired && !isPendingApproval && (
          <div className="bg-red-50 border border-red-200 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center gap-4 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
              <HugeiconsIcon icon={Alert01Icon} className="text-red-600" size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-900 mb-1 tracking-tight">Payment Overdue</h4>
              <p className="text-xs text-red-800 font-medium leading-relaxed">
                Your lease has expired. Please renew your subscription immediately. Smart lock access will be automatically revoked at the end of the 72-hour grace period.
              </p>
            </div>
          </div>
        )}

        {/* SUBSCRIPTION STATS TRACKER */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-6 mb-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-1">
                <HugeiconsIcon icon={Calendar01Icon} size={18} className="text-primary" />
                Lease Subscription
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {startDate.toLocaleDateString()} — {endDate.toLocaleDateString()}
              </p>
            </div>

            <div className="text-center">
              <p className={`text-3xl font-black flex-col flex tracking-tight ${isExpiringSoon ? "text-red-500" : "text-slate-900"}`}>
                {daysLeft}{" "}
                <span className={`text-sm font-bold uppercase tracking-widest ${isExpired ? "text-red-400" : "text-slate-400"}`}>
                  {statusText}
                </span>
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${isExpiringSoon ? "bg-red-500" : "bg-zinc-950"} ${isPendingApproval && "opacity-20"}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3">
            <span>Move-In</span>
            <span>{isPendingApproval ? "Awaiting Approval" : today < startDate ? "Pending Move-In" : `${Math.round(progressPercentage)}% Completed`}</span>
            <span>Expiration</span>
          </div>

          {/* ========================================================= */}
          {/* PHASE 1 & 2: RENEWAL BUTTON (Shows during last 30 days or Grace Period) */}
          {/* ========================================================= */}
          {isExpiringSoon && !isPendingApproval && (
            <div className="mt-8 border-t border-slate-100 pt-6">
              <button
                onClick={handleRenewal}
                disabled={isRenewing}
                className="w-full sm:w-auto px-8 py-3 bg-red-500 hover:bg-red-600 text-white font-bold uppercase tracking-widest text-xs rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg shadow-red-500/20"
              >
                {isRenewing ? (
                  <><HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" /> Processing...</>
                ) : (
                  <>Renew Subscription Now <HugeiconsIcon icon={ArrowRight01Icon} size={16} /></>
                )}
              </button>
            </div>
          )}
        </div>

        {/* HERO: Property & Smart Lock Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col sm:flex-row">
            <div className="w-full sm:w-2/5 h-48 sm:h-auto relative bg-slate-100">
              <Image src={listing.images[0] || "/placeholder.jpg"} alt="Property" fill className="object-cover" />
            </div>
            <div className="p-6 sm:p-8 flex flex-col justify-center flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-black/10 px-2 py-1 rounded">
                  {listing.propertyType}
                </span>
                
                {isPendingApproval ? (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-2 py-1 rounded flex items-center gap-1 border border-amber-100">
                    <HugeiconsIcon icon={Time01Icon} size={10} /> Reviewing
                  </span>
                ) : isExpired ? (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-red-600 bg-red-50 px-2 py-1 rounded flex items-center gap-1 border border-red-100">
                    <HugeiconsIcon icon={Alert01Icon} size={10} /> Overdue
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-2 py-1 rounded flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Active
                  </span>
                )}
              </div>

              <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
                {listing.title}
              </h2>
              <p className="text-sm font-medium text-slate-500 mb-6 flex items-center gap-2">
                <HugeiconsIcon icon={MapPinIcon} size={16} /> {listing.location}
              </p>

              {/* Property Details Grid */}
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
          <div
            className={`rounded-2xl shadow-xl p-8 flex flex-col justify-center relative overflow-hidden transition-colors duration-500 ${
              isPendingApproval 
                ? "bg-zinc-900 border border-zinc-800" 
                : lockStatus === "UNLOCKED" 
                  ? "bg-zinc-800 border border-zinc-700" 
                  : "bg-zinc-950 border border-black"
            }`}
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <HugeiconsIcon icon={Key01Icon} size={150} />
            </div>

            <div className="relative z-10 h-full flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20">
                  <HugeiconsIcon icon={isPendingApproval ? Time01Icon : Key01Icon} size={24} className={isPendingApproval ? "text-slate-400" : "text-white"} />
                </div>
                {!isPendingApproval && (
                  <span
                    className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full border ${
                      lockStatus === "LOCKED"
                        ? "bg-green-500/10 text-green-400 border-green-500/20"
                        : lockStatus === "UNLOCKED"
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-white/10 text-white border-white/20"
                    }`}
                  >
                    Door is {lockStatus}
                  </span>
                )}
              </div>

              <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                Smart Lock Access
              </h3>

              {/* PIN Revealer */}
              <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
                {isPendingApproval ? (
                  <div className="font-mono text-xl font-bold text-slate-500 uppercase tracking-[0.1em]">
                    Pending
                  </div>
                ) : (
                  <>
                    <div className="font-mono text-3xl font-black text-white tracking-[0.2em]">
                      {showPin ? lease.smartLockPin || "849201" : "••••••"}
                    </div>
                    <button
                      onClick={() => setShowPin(!showPin)}
                      className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                      title={showPin ? "Hide PIN" : "Reveal PIN"}
                    >
                      <HugeiconsIcon icon={showPin ? ViewOffIcon : ViewIcon} size={20} />
                    </button>
                  </>
                )}
              </div>

              {/* Remote Lock/Unlock Toggle */}
              <button
                onClick={toggleSmartLock}
                disabled={lockStatus === "LOADING" || today < startDate || isPendingApproval}
                className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs transition-all shadow-lg mt-auto ${
                  isPendingApproval 
                    ? "bg-white/5 text-slate-500 cursor-not-allowed border border-white/5"
                    : today < startDate
                    ? "bg-white/5 text-slate-600 cursor-not-allowed border border-white/10"
                    : lockStatus === "LOADING"
                    ? "bg-white/10 text-slate-400 cursor-wait"
                    : lockStatus === "LOCKED"
                      ? "bg-white text-black hover:bg-slate-200"
                      : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                {isPendingApproval ? (
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

        {/* SECTION: UTILITIES & ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Hide Maintenance if Pending */}
          {!isPendingApproval && (
            <Link
              href={`/user/maintenance`}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-primary hover:shadow-md transition-all text-left flex flex-col gap-4 group"
            >
              <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center group-hover:bg-black/10 group-hover:text-primary transition-colors">
                <HugeiconsIcon icon={Wrench01Icon} size={20} />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-1">Report an Issue</h4>
                <p className="text-xs text-slate-500 leading-relaxed font-medium">
                  Create a maintenance ticket for plumbing, AC, or smart lock issues.
                </p>
              </div>
            </Link>
          )}

          <Link
            href={`/user/transactions`}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-primary hover:shadow-md transition-all text-left flex flex-col gap-4 group"
          >
            <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center group-hover:bg-black/10 group-hover:text-primary transition-colors">
              <HugeiconsIcon icon={CreditCardIcon} size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Payment History</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                View your transaction history and download official receipts.
              </p>
            </div>
          </Link>

          <Link
            href={`/user/lease-document/${lease.id}`}
            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-primary hover:shadow-md transition-all text-left flex flex-col gap-4 group"
          >
            <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center group-hover:bg-black/10 group-hover:text-primary transition-colors">
              <HugeiconsIcon icon={SignatureIcon} size={20} />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Lease Document</h4>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Download a PDF copy of your signed tenancy agreement document.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}