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
  Clock01Icon,
  Alert01Icon,
  ArrowRight01Icon,
  Shield02Icon,
  Logout01Icon,
  SparklesIcon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import CleaningScheduleClient from "./cleaning-schedule-client";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
    lock: {
      activeTempPins: Array<{
        pinId: string;
        name: string;
        pinMasked: string;
        validFrom: string;
        expiresAt: string;
      }>;
    } | null;
  }>;
  initialSchedule?: any;
}

export function UserDashboard({ user, activeLeases, initialSchedule }: DashboardProps) {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentData = activeLeases[selectedIndex];
  const { lease, listing } = currentData;

  const [showPin, setShowPin] = useState(false);
  const [lockStatus, setLockStatus] = useState<
    "LOCKED" | "UNLOCKED" | "LOADING"
  >("LOCKED");
  const [isRenewing, setIsRenewing] = useState(false);
  const [isVacating, setIsVacating] = useState(false);
  
  const hasActiveSchedule = initialSchedule && 
    (initialSchedule.scheduleType === 'daily' || 
     (initialSchedule.customDates && initialSchedule.customDates.length > 0) || 
     (initialSchedule.weeklyDays && initialSchedule.weeklyDays.length > 0));
     
  const [showCleaning, setShowCleaning] = useState(!!hasActiveSchedule);
  
  const [isGuestModalOpen, setIsGuestModalOpen] = useState(false);
  const [guestName, setGuestName] = useState("");
  const [guestDuration, setGuestDuration] = useState("24");

  const handleGenerateGuestPin = async () => {
    if (!guestName.trim()) {
      toast.error("Please enter a guest name.");
      return;
    }
    const duration = parseInt(guestDuration, 10);
    if (isNaN(duration) || duration <= 0 || duration > 48) {
      toast.error("Duration must be between 1 and 48 hours.");
      return;
    }

    const toastId = toast.loading("Generating guest PIN...");
    setIsGuestModalOpen(false);
    
    try {
      const { tenantCreateGuestPinAction } = await import("@/actions/user/smartlock.action");
      const result = await tenantCreateGuestPinAction(lease.id, guestName.trim(), duration);
      
      if (result.success) {
        toast.success(`Guest PIN: ${result.pin} (Valid for ${duration}h)`, { id: toastId, duration: 10000 });
        setGuestName("");
        setGuestDuration("24");
        router.refresh();
      } else {
        toast.error(result.error || "Failed to generate PIN.", { id: toastId });
      }
    } catch (error) {
      toast.error("An unexpected error occurred.", { id: toastId });
    }
  };

  const isRejected = user.kycStatus === "Rejected";
  const needsKyc = user.kycStatus === "Unverified" || user.kycStatus === "Pending";
  const needsSignature = !lease.signatureAudit.isSigned;
  const isPendingAdmin = lease.status === "Awaiting_Admin_Approval";
  const isRestricted = needsKyc || needsSignature || isPendingAdmin || isRejected;

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
    progressPercentage = Math.min(
      100,
      Math.max(0, (daysPassed / totalDays) * 100),
    );
    statusText = lease.intentToVacate ? "Days Until Move-Out" : "Days Left";
    isExpiringSoon = daysLeft <= 30;
  }

  const toggleSmartLock = async () => {
    if (lockStatus === "LOADING" || lockStatus === "UNLOCKED" || isRestricted || today < startDate) return;
    
    setLockStatus("LOADING");

    try {
      const { tenantRemoteUnlockAction } = await import("@/actions/user/smartlock.action");
      const result = await tenantRemoteUnlockAction(lease.id);
      
      if (result.success) {
        toast.success(result.message || "Door unlocked (5s).");
        setLockStatus("UNLOCKED");
        
        // Auto-lock clutch UI fallback (5 seconds)
        setTimeout(() => {
          setLockStatus("LOCKED");
        }, 5000);
      } else {
        toast.error(result.error || "Failed to unlock door. Check connection.");
        setLockStatus("LOCKED");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
      setLockStatus("LOCKED");
    }
  };

  const handleRenewal = () => {
    setIsRenewing(true);
    router.push(`/checkout/renew?leaseId=${lease.id}`);
  };

  const [vacateDate, setVacateDate] = useState<string>("");
  const [vacateReason, setVacateReason] = useState<string>("");

  const handleVacate = async () => {
    if (!vacateDate) {
      toast.error("Please select a move-out date.");
      return;
    }
    setIsVacating(true);
    const result = await submitNoticeToVacate(lease.id, new Date(vacateDate).toISOString(), vacateReason);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.message || "Failed to submit notice.");
    }
    setIsVacating(false);
  };

  return (
    <main className="min-h-screen bg-zinc-50 font-sans text-zinc-800 pb-16 md:pb-24 w-full overflow-x-hidden box-border">
      {/* HEADER */}
      <header className="bg-zinc-950 text-white pt-10 pb-20 md:pt-16 md:pb-28 px-4 sm:px-6 lg:px-8 w-full border-b border-zinc-800/80 box-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 w-full box-border">
          <div className="w-full min-w-0">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-1 truncate">
              Tenant Dashboard
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 truncate">
              Welcome back, {user.name.split(" ")[0]}.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-zinc-900/90 px-3.5 py-1.5 rounded-full border border-zinc-800 text-xs font-medium text-zinc-300 shrink-0">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isRestricted
                  ? "bg-zinc-500"
                  : lockStatus === "LOCKED"
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                    : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.4)]"
              }`}
            />
            <span>{isRestricted ? "Access Restricted" : `Door ${lockStatus.toLowerCase()}`}</span>
          </div>
        </div>

        {activeLeases.length > 1 && (
          <div className="max-w-6xl mx-auto mt-6 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none w-full box-border">
            {activeLeases.map((item, idx) => (
              <button
                key={item.lease.id}
                onClick={() => setSelectedIndex(idx)}
                className={`whitespace-nowrap px-3.5 py-2 rounded-lg text-xs font-medium transition-colors duration-150 active:scale-[0.98] border flex items-center gap-2 shrink-0 ${
                  selectedIndex === idx
                    ? "bg-white text-zinc-900 border-white shadow-xs font-semibold"
                    : "bg-zinc-900/60 text-zinc-400 border-zinc-800 hover:bg-zinc-900 hover:text-white"
                }`}
              >
                <HugeiconsIcon icon={House03Icon} size={15} className={selectedIndex === idx ? "text-zinc-900" : "text-zinc-400"} />
                <span>{item.listing.title}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-16 relative z-10 space-y-4 md:space-y-6 w-full box-border">
        {/* ========================================================= */}
        {/* ACTION CARDS & ALERTS (PREMIUM MINIMALIST STYLING)        */}
        {/* ========================================================= */}

        {/* 1. REJECTED BANNER */}
        {isRejected && (
          <div className="bg-white border border-red-200 p-4 md:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative w-full box-border shadow-xs">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 bg-red-50 text-red-600 border border-red-100 rounded-lg flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={Alert01Icon} size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-red-900 tracking-tight">
                  Application Rejected
                </h4>
                <p className="text-xs md:text-sm text-zinc-600 font-normal leading-relaxed mt-0.5">
                  Your onboarding application was rejected by the administration. Please contact support or visit our office to resolve the issue with your physical Ghana Card.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 1A. KYC BANNER (UNVERIFIED / NEW TENANT) */}
        {needsKyc && isPendingAdmin && (
          <div className="bg-white border border-zinc-200/80 p-4 md:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative w-full box-border shadow-xs">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 bg-zinc-100 text-zinc-700 border border-zinc-200/60 rounded-lg flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={Shield02Icon} size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-zinc-900 tracking-tight">
                  Payment Successful — Property Reserved
                </h4>
                <p className="text-xs md:text-sm text-zinc-600 font-normal leading-relaxed mt-0.5">
                  Please visit our main office at <strong className="font-semibold text-zinc-900">Wunkat Homes HQ, Accra</strong> with your physical Ghana Card to complete onboarding and receive your access credentials.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 1B. VIP BANNER (VERIFIED / REPEAT TENANT) */}
        {!needsKyc && isPendingAdmin && !isRejected && (
          <div className="bg-white border border-emerald-200/80 p-4 md:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative w-full box-border shadow-xs">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-lg flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-emerald-950 tracking-tight">
                  Payment Successful
                </h4>
                <p className="text-xs md:text-sm text-zinc-600 font-normal leading-relaxed mt-0.5">
                  Our team is finalizing your property. Please visit our main office at <strong className="font-semibold text-zinc-900">Wunkat Homes HQ, Hatso Accra</strong> with your physical Ghana Card to complete onboarding and receive access credentials.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. SIGNATURE BANNER */}
        {needsSignature && !isRejected && (
          <div className="bg-white border border-zinc-200/80 p-4 md:p-5 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative w-full box-border shadow-xs">
            <div className="flex items-start sm:items-center gap-3.5 min-w-0">
              <div className="w-9 h-9 bg-zinc-100 text-zinc-900 border border-zinc-200/60 rounded-lg flex items-center justify-center shrink-0">
                <HugeiconsIcon icon={SignatureIcon} size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-zinc-900 tracking-tight">
                  Digital Signature Required
                </h4>
                <p className="text-xs md:text-sm text-zinc-500 font-normal leading-relaxed mt-0.5">
                  Please review and sign your digital Tenancy Agreement to finalize your tenancy.
                </p>
              </div>
            </div>
            <Link
              href={`/user/sign-lease?leaseId=${lease.id}`}
              className="shrink-0 w-full sm:w-auto px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs md:text-sm font-medium rounded-lg transition-colors duration-150 active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>Sign Document</span>
              <HugeiconsIcon icon={ArrowRight01Icon} size={15} className="text-white" />
            </Link>
          </div>
        )}

        {/* 4. MANAGE LEASE & VACATE ACTION CARD */}
        {!isRestricted && (
          <div className="bg-white border border-zinc-200/80 p-4 md:p-5 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative w-full box-border shadow-xs">
            <div className="flex items-start gap-3.5 min-w-0">
              <div className="w-9 h-9 bg-zinc-100 text-zinc-900 border border-zinc-200/60 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                <HugeiconsIcon
                  icon={
                    lease.intentToVacate
                      ? Logout01Icon
                      : isExpired
                        ? Alert01Icon
                        : Calendar01Icon
                  }
                  size={18}
                />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm md:text-base font-semibold text-zinc-900 tracking-tight">
                  {lease.intentToVacate
                    ? "Move-Out Scheduled"
                    : isExpired
                      ? "Payment Overdue: Lease Expired"
                      : isExpiringSoon
                        ? "Lease Renewal Due"
                        : "Manage Lease"}
                </h4>
                <p className="text-xs md:text-sm text-zinc-500 font-normal mt-0.5 max-w-xl leading-relaxed">
                  {lease.intentToVacate
                    ? `Your notice to vacate is confirmed for ${endDate.toLocaleDateString()}. Please prepare for the final property inspection.`
                    : isExpired
                      ? "Your lease has officially expired. Please renew your subscription immediately to prevent the automatic revocation of your smart lock access."
                      : isExpiringSoon
                        ? `Your current lease concludes in ${daysLeft} days. Please secure your renewal or officially submit a notice to vacate.`
                        : `Your lease is active with ${daysLeft} days remaining. You can submit an early notice to vacate if you plan to move.`}
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            {!lease.intentToVacate && (
              <div className="flex flex-col sm:flex-row items-center gap-2 shrink-0 w-full sm:w-auto box-border">
                {/* SHADCN ALERT DIALOG FOR VACATING */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={isRenewing || isVacating}
                      className="w-full sm:w-auto px-3.5 py-2 bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-zinc-300 text-zinc-700 font-medium text-xs md:text-sm rounded-lg transition-colors duration-150 active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0"
                    >
                      {isVacating ? (
                        <>
                          <HugeiconsIcon
                            icon={Loading03Icon}
                            size={15}
                            className="animate-spin text-zinc-500"
                          />
                          <span>Submitting...</span>
                        </>
                      ) : (
                        "Notice to Vacate"
                      )}
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-xl border-zinc-200 sm:max-w-md">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-base font-semibold tracking-tight text-zinc-900">
                        Submit Notice to Vacate
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-xs md:text-sm text-zinc-500">
                        This action will inform property management that you intend to move out.
                        Please provide your intended move-out date.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    
                    <div className="flex flex-col gap-3 py-3">
                      <div>
                        <Label htmlFor="vacate-date" className="text-xs font-medium text-zinc-700">Move-Out Date</Label>
                        <Input 
                          id="vacate-date" 
                          type="date" 
                          min={today.toISOString().split('T')[0]} 
                          value={vacateDate}
                          className="rounded-lg mt-1 border-zinc-200 text-sm"
                          onChange={(e) => setVacateDate(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="vacate-reason" className="text-xs font-medium text-zinc-700">Reason (Optional)</Label>
                        <Input 
                          id="vacate-reason" 
                          placeholder="e.g. Relocating for work"
                          value={vacateReason}
                          className="rounded-lg mt-1 border-zinc-200 text-sm"
                          onChange={(e) => setVacateReason(e.target.value)}
                        />
                      </div>
                    </div>

                    <AlertDialogFooter className="gap-2 sm:gap-2">
                      <AlertDialogCancel className="text-xs md:text-sm h-9 rounded-lg border-zinc-200">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.preventDefault();
                          handleVacate();
                        }}
                        disabled={!vacateDate || isVacating}
                        className="bg-zinc-900 text-white hover:bg-zinc-800 text-xs md:text-sm h-9 rounded-lg transition-colors active:scale-[0.98]"
                      >
                        {isVacating ? "Submitting..." : "Confirm Move-Out"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                {isExpiringSoon && (
                  <button
                    onClick={handleRenewal}
                    disabled={isRenewing || isVacating}
                    className="w-full sm:w-auto px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs md:text-sm rounded-lg transition-colors duration-150 active:scale-[0.98] flex items-center justify-center gap-1.5 disabled:opacity-70 shadow-xs shrink-0"
                  >
                    {isRenewing ? (
                      <>
                        <HugeiconsIcon
                          icon={Loading03Icon}
                          size={15}
                          className="animate-spin text-white"
                        />
                        <span>Processing...</span>
                      </>
                    ) : (
                      "Renew Lease"
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBSCRIPTION STATS TRACKER */}
        {/* ========================================================= */}
        <div className="bg-white rounded-xl border border-zinc-200/80 p-5 md:p-6 w-full box-border shadow-xs">
          <div className="flex flex-row justify-between items-baseline gap-4 mb-4 w-full box-border">
            <div className="min-w-0">
              <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block">
                Lease Timeline
              </span>
              <p className="text-sm font-semibold text-zinc-900 tracking-tight mt-0.5 truncate">
                {startDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })} —{" "}
                {endDate.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>

            <div className="text-right shrink-0">
              <div className="flex flex-col items-end justify-center">
                <span className="text-2xl md:text-3xl font-bold text-zinc-900 tracking-tight font-mono tabular-nums">
                  {daysLeft}
                </span>
                <span className="text-xs font-medium text-zinc-500">
                  {statusText}
                </span>
              </div>
            </div>
          </div>

          <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden box-border">
            <div
              className={`h-full rounded-full transition-all duration-500 ease-out ${
                isRestricted
                  ? "bg-zinc-300"
                  : isExpired
                    ? "bg-red-500"
                    : isExpiringSoon
                      ? "bg-amber-500"
                      : "bg-zinc-900"
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-xs font-medium text-zinc-400 mt-2.5 w-full box-border">
            <span>Move-In</span>
            <span className="text-zinc-600 font-medium">
              {isRestricted
                ? "Action Required"
                : today < startDate
                  ? "Pending"
                  : `${Math.round(progressPercentage)}% Completed`}
            </span>
            <span>
              {lease.intentToVacate ? "Move-Out Date" : "Expiration"}
            </span>
          </div>
        </div>

        {/* HERO: Property & Smart Lock Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 w-full box-border">
          <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200/80 overflow-hidden flex flex-col sm:flex-row w-full box-border shadow-xs">
            <div className="w-full sm:w-2/5 min-h-[180px] sm:min-h-full relative bg-zinc-100 shrink-0">
              <Image
                src={listing.images[0] || "/placeholder.jpg"}
                alt={listing.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="p-5 md:p-6 flex flex-col justify-between flex-1 min-w-0">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="text-xs font-semibold text-zinc-800 bg-zinc-100 px-2.5 py-1 rounded-md">
                    {listing.propertyType}
                  </span>

                  {isRestricted ? (
                    <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <HugeiconsIcon icon={Clock01Icon} size={12} />
                      <span>Action Required</span>
                    </span>
                  ) : isExpired ? (
                    <span className="text-xs font-medium text-red-700 bg-red-50 border border-red-200/60 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <HugeiconsIcon icon={Alert01Icon} size={12} />
                      <span>Overdue</span>
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Active</span>
                    </span>
                  )}
                </div>

                <h2 className="text-lg md:text-xl font-bold text-zinc-900 tracking-tight mb-1 truncate w-full">
                  {listing.title}
                </h2>
                <p className="text-xs md:text-sm text-zinc-500 mb-5 flex items-center gap-1.5 truncate w-full">
                  <HugeiconsIcon icon={MapPinIcon} size={15} className="shrink-0 text-zinc-400" />
                  <span className="truncate">{listing.location}</span>
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3 border-t border-zinc-100 pt-4 mt-auto w-full box-border">
                <div className="flex flex-col items-start gap-0.5 min-w-0">
                  <HugeiconsIcon
                    icon={BedDoubleIcon}
                    size={16}
                    className="text-zinc-400"
                  />
                  <span className="text-xs md:text-sm font-semibold text-zinc-800 truncate">
                    {listing.bedrooms} Beds
                  </span>
                </div>
                <div className="flex flex-col items-start gap-0.5 min-w-0">
                  <HugeiconsIcon
                    icon={Bathtub01Icon}
                    size={16}
                    className="text-zinc-400"
                  />
                  <span className="text-xs md:text-sm font-semibold text-zinc-800 truncate">
                    {listing.bathrooms} Baths
                  </span>
                </div>
                <div className="flex flex-col items-start gap-0.5 min-w-0">
                  <HugeiconsIcon
                    icon={MaximizeIcon}
                    size={16}
                    className="text-zinc-400"
                  />
                  <span className="text-xs md:text-sm font-semibold text-zinc-800 truncate">
                    {listing.sizeSqm || "--"} Sqm
                  </span>
                </div>
              </div>
            </div>
          </div>

          {currentData.lock ? (
          <div
            className={`rounded-xl p-5 md:p-6 flex flex-col justify-between relative overflow-hidden transition-colors duration-200 w-full box-border shadow-xs ${isRestricted ? "bg-zinc-900 border border-zinc-800" : lockStatus === "UNLOCKED" ? "bg-zinc-900 border border-zinc-700" : "bg-zinc-950 border border-zinc-800"}`}
          >
            <div className="relative z-10 h-full flex flex-col justify-between w-full box-border">
              <div>
                <div className="flex justify-between items-center mb-4 w-full box-border">
                  <div className="w-9 h-9 bg-zinc-800/80 rounded-lg flex items-center justify-center border border-zinc-700/60 shrink-0 text-zinc-200">
                    <HugeiconsIcon
                      icon={isRestricted ? Clock01Icon : Key01Icon}
                      size={18}
                    />
                  </div>
                  {!isRestricted && (
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full border truncate ml-2 ${
                        today < startDate
                          ? "bg-amber-400/10 text-amber-400 border-amber-400/20"
                          : lockStatus === "LOCKED"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : lockStatus === "UNLOCKED"
                              ? "bg-white/10 text-white border-white/20"
                              : "bg-zinc-800 text-zinc-300 border-zinc-700"
                      }`}
                    >
                      {today < startDate ? "Move-In Pending" : `Door ${lockStatus.toLowerCase()}`}
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-medium uppercase tracking-wider text-zinc-400 block mb-1">
                  Smart Lock Access
                </span>

                <div className="flex items-center justify-between gap-3 mb-5 pb-4 border-b border-zinc-800/80 w-full box-border min-w-0">
                  {isRestricted ? (
                    <div className="font-mono text-sm md:text-base font-semibold text-zinc-500 uppercase tracking-widest truncate py-1">
                      Pending Verification
                    </div>
                  ) : today < startDate ? (
                    <div className="flex items-center justify-between w-full py-1">
                      <div>
                        <div className="text-xs font-medium text-amber-400 flex items-center gap-1.5">
                          <HugeiconsIcon icon={Clock01Icon} size={14} /> Available on Move-In
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5 font-normal">
                          {startDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <span className="font-mono text-xs font-medium text-zinc-400 bg-zinc-900 px-2.5 py-1 rounded-md border border-zinc-800">
                        Locked
                      </span>
                    </div>
                  ) : (
                    <>
                      <div className="font-mono text-2xl md:text-3xl font-bold text-white tracking-[0.25em] truncate">
                        {showPin ? lease.smartLockPin || "Pending" : "••••••"}
                      </div>
                      {lease.smartLockPin && (
                        <button
                          onClick={() => setShowPin(!showPin)}
                          className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white active:scale-95 shrink-0"
                          title={showPin ? "Hide PIN" : "Reveal PIN"}
                        >
                          <HugeiconsIcon
                            icon={showPin ? ViewOffIcon : ViewIcon}
                            size={18}
                          />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>

              <div>
                <button
                  onClick={toggleSmartLock}
                  disabled={
                    lockStatus === "LOADING" || today < startDate || isRestricted
                  }
                  className={`w-full py-3 rounded-lg flex items-center justify-center gap-2 font-medium text-xs md:text-sm transition-transform duration-150 active:scale-[0.98] shadow-xs min-w-0 box-border px-3 truncate ${
                    isRestricted
                      ? "bg-zinc-900 text-zinc-500 cursor-not-allowed border border-zinc-800"
                      : today < startDate
                        ? "bg-zinc-900 text-zinc-500 cursor-not-allowed border border-zinc-800"
                        : lockStatus === "LOADING"
                          ? "bg-zinc-800 text-zinc-300 cursor-wait border border-zinc-700"
                          : lockStatus === "LOCKED"
                            ? "bg-white text-zinc-950 hover:bg-zinc-100"
                            : "bg-emerald-600 text-white hover:bg-emerald-500"
                  }`}
                >
                  {needsKyc ? (
                    <>
                      <HugeiconsIcon icon={Shield02Icon} size={16} />
                      <span className="truncate">Complete KYC</span>
                    </>
                  ) : needsSignature ? (
                    <>
                      <HugeiconsIcon icon={SignatureIcon} size={16} />
                      <span className="truncate">Sign Lease</span>
                    </>
                  ) : isPendingAdmin ? (
                    <span className="truncate">Provisioning...</span>
                  ) : today < startDate ? (
                    <>
                      <HugeiconsIcon icon={LockKeyIcon} size={16} />
                      <span className="truncate">Active on Move-in</span>
                    </>
                  ) : lockStatus === "LOADING" ? (
                    <>
                      <HugeiconsIcon
                        icon={Loading03Icon}
                        size={16}
                        className="animate-spin text-zinc-300"
                      />
                      <span className="truncate">Connecting...</span>
                    </>
                  ) : lockStatus === "LOCKED" ? (
                    <>
                      <HugeiconsIcon icon={LockKeyIcon} size={16} />
                      <span className="truncate">Unlock Door Remotely</span>
                    </>
                  ) : (
                    <>
                      <HugeiconsIcon icon={LockKeyIcon} size={16} />
                      <span className="truncate">Unlocked (5s)...</span>
                    </>
                  )}
                </button>
                
                {!isRestricted && today >= startDate && (
                  <button
                    onClick={() => setIsGuestModalOpen(true)}
                    className="w-full mt-2.5 py-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300 hover:text-white text-xs font-medium transition-colors duration-150 active:scale-[0.98] flex items-center justify-center gap-2 min-w-0 box-border px-3 truncate"
                  >
                    <HugeiconsIcon icon={Key01Icon} size={15} />
                    <span>Generate Guest Pass</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          ) : (
          <div
            className="rounded-xl p-5 md:p-6 flex flex-col justify-center relative overflow-hidden transition-colors duration-200 w-full box-border bg-zinc-950 border border-zinc-800 shadow-xs"
          >
            <div className="relative z-10 h-full flex flex-col w-full box-border items-center text-center justify-center py-6">
              <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center border border-zinc-800 shrink-0 mb-3 text-zinc-300">
                <HugeiconsIcon icon={Key01Icon} size={20} />
              </div>
              <h4 className="text-sm font-semibold text-white tracking-tight mb-1">Physical Keys</h4>
              <p className="text-xs text-zinc-400 leading-relaxed max-w-[220px] mx-auto">
                This property uses standard physical keys for access. Please keep them secure.
              </p>
            </div>
          </div>
          )}
        </div>

        {/* ACTIVE GUEST PASSES */}
        {!isRestricted && currentData.lock && currentData.lock.activeTempPins.length > 0 && (
          <div className="mb-4 md:mb-6 w-full box-border bg-white rounded-xl border border-zinc-200/80 overflow-hidden shadow-xs">
            <div className="p-4 md:p-5 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-900 tracking-tight">
                Active Guest Passes
              </h3>
              <span className="text-xs font-medium text-zinc-500 bg-zinc-100 px-2.5 py-0.5 rounded-full">
                {currentData.lock.activeTempPins.length} / 5
              </span>
            </div>
            <div className="divide-y divide-zinc-100">
              {currentData.lock.activeTempPins.map((pin) => (
                <div key={pin.pinId} className="p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-zinc-900 mb-0.5">{pin.name}</span>
                    <div className="flex items-center gap-2.5 text-xs text-zinc-500 font-normal">
                      <span className="font-mono bg-zinc-100 text-zinc-800 font-semibold px-2 py-0.5 rounded">{pin.pinMasked}</span>
                      <span>Expires {new Date(pin.expiresAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="text-xs font-medium text-zinc-600 hover:text-red-600 hover:bg-red-50 border border-zinc-200 hover:border-red-200 transition-colors duration-150 px-3 py-1.5 rounded-lg active:scale-[0.98]"
                      >
                        Revoke Pass
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border-zinc-200 rounded-xl sm:max-w-md">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-base font-semibold text-zinc-900">Revoke Guest Pass?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs md:text-sm text-zinc-500">
                          Are you sure you want to revoke the guest pass for <span className="font-semibold text-zinc-800">{pin.name}</span>? This will immediately delete the PIN from the smart lock.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter className="gap-2 sm:gap-2">
                        <AlertDialogCancel className="border-zinc-200 text-zinc-700 text-xs md:text-sm h-9 rounded-lg">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 text-white hover:bg-red-700 text-xs md:text-sm font-medium h-9 rounded-lg active:scale-[0.98] transition-colors"
                          onClick={async () => {
                            const toastId = toast.loading("Revoking guest pass...");
                            try {
                              const { tenantRevokeGuestPinAction } = await import("@/actions/user/smartlock.action");
                              const res = await tenantRevokeGuestPinAction(lease.id, pin.pinId);
                              if (res.success) {
                                toast.success(res.message, { id: toastId });
                                router.refresh();
                              } else {
                                toast.error(res.error || "Failed to revoke.", { id: toastId });
                              }
                            } catch (e) {
                              toast.error("Error revoking pin.", { id: toastId });
                            }
                          }}
                        >
                          Revoke Pass
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CLEANING SERVICES */}
        {!isRestricted && (
          <div className="mb-4 md:mb-6 w-full">
            {!showCleaning ? (
              <div className="bg-white border border-zinc-200/80 p-5 md:p-6 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 w-full overflow-hidden relative shadow-xs">
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                 
                  <div className="min-w-0">
                    <h4 className="text-sm md:text-base font-semibold text-zinc-900 tracking-tight mb-0.5 truncate">
                      Professional Cleaning Services
                    </h4>
                    <p className="text-xs md:text-sm font-normal text-zinc-500 leading-relaxed">
                      Need a cleaner? Schedule trusted on-demand property cleaning. Payment is collected after service.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2 shrink-0 w-full sm:w-auto">
                  <button
                    onClick={() => setShowCleaning(true)}
                    className="w-full sm:w-auto px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs md:text-sm font-medium rounded-lg transition-colors duration-150 active:scale-[0.98] shadow-xs"
                  >
                    Request Cleaning
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-3 w-full  mx-auto">
                <div className="flex justify-end px-1">
                  <button
                    onClick={() => setShowCleaning(false)}
                    className="text-xs font-medium text-zinc-400 hover:text-zinc-600 tracking-wider uppercase transition-colors"
                  >
                    Hide Service
                  </button>
                </div>
                <CleaningScheduleClient initialSchedule={initialSchedule} />
              </div>
            )}
          </div>
        )}

        {/* UTILITIES & ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full box-border">
          {!isRestricted && (
            <Link
              href={`/user/maintenance`}
              className="bg-white p-5 rounded-xl border border-zinc-200/80 hover:border-zinc-300 transition-colors duration-150 text-left flex flex-col gap-3 group w-full min-w-0 box-border active:scale-[0.99] shadow-xs"
            >
              <div className="w-9 h-9 bg-zinc-100 text-zinc-900 border border-zinc-200/60 rounded-lg flex items-center justify-center group-hover:bg-zinc-200/70 transition-colors shrink-0">
                <HugeiconsIcon icon={Wrench01Icon} size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-zinc-900 mb-0.5 truncate">
                  Report an Issue
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                  Create a maintenance ticket for plumbing, AC, or smart lock issues.
                </p>
              </div>
            </Link>
          )}

          <Link
            href={`/user/transactions`}
            className="bg-white p-5 rounded-xl border border-zinc-200/80 hover:border-zinc-300 transition-colors duration-150 text-left flex flex-col gap-3 group w-full min-w-0 box-border active:scale-[0.99] shadow-xs"
          >
            <div className="w-9 h-9 bg-zinc-100 text-zinc-900 border border-zinc-200/60 rounded-lg flex items-center justify-center group-hover:bg-zinc-200/70 transition-colors shrink-0">
              <HugeiconsIcon icon={CreditCardIcon} size={18} />
            </div>
            <div className="min-w-0">
              <h4 className="text-sm font-semibold text-zinc-900 mb-0.5 truncate">
                Payment History
              </h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                View your transaction history and download official receipts.
              </p>
            </div>
          </Link>

          {!needsSignature && (
            <Link
              href={`/user/lease-document/${lease.id}`}
              className="bg-white p-5 rounded-xl border border-zinc-200/80 hover:border-zinc-300 transition-colors duration-150 text-left flex flex-col gap-3 group w-full min-w-0 box-border active:scale-[0.99] shadow-xs"
            >
              <div className="w-9 h-9 bg-zinc-100 text-zinc-900 border border-zinc-200/60 rounded-lg flex items-center justify-center group-hover:bg-zinc-200/70 transition-colors shrink-0">
                <HugeiconsIcon icon={SignatureIcon} size={18} />
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-semibold text-zinc-900 mb-0.5 truncate">
                  Lease Document
                </h4>
                <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                  Download a PDF copy of your signed tenancy agreement document.
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>
      
      {/* Generate Guest PIN Modal */}
      <Dialog open={isGuestModalOpen} onOpenChange={setIsGuestModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-zinc-200 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight text-zinc-900">Create Guest Pass</DialogTitle>
            <DialogDescription className="text-zinc-500 text-xs md:text-sm">
              Generate a temporary PIN for visitors, cleaners, or contractors. Valid for up to 48 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-3">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guestName" className="text-xs font-medium text-zinc-700">
                Guest Name
              </Label>
              <Input
                id="guestName"
                placeholder="e.g. Cleaner, John Doe"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="bg-zinc-50 border-zinc-200 text-zinc-900 text-sm rounded-lg focus-visible:ring-zinc-400"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="guestDuration" className="text-xs font-medium text-zinc-700">
                Valid For (Hours)
              </Label>
              <Input
                id="guestDuration"
                type="number"
                min="1"
                max="48"
                placeholder="24"
                value={guestDuration}
                onChange={(e) => setGuestDuration(e.target.value)}
                className="bg-zinc-50 border-zinc-200 text-zinc-900 text-sm rounded-lg focus-visible:ring-zinc-400"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-zinc-200 text-zinc-700 hover:bg-zinc-100 text-xs md:text-sm rounded-lg h-9">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleGenerateGuestPin} className="bg-zinc-900 text-white hover:bg-zinc-800 text-xs md:text-sm font-medium rounded-lg h-9 active:scale-[0.98] transition-colors">
              Generate PIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
