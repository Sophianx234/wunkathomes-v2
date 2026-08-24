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

  const needsKyc =
    user.kycStatus === "Unverified" || user.kycStatus === "Rejected";
  const needsSignature = !lease.signatureAudit.isSigned;
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
    <main className="min-h-screen bg-zinc-50/50 font-sans text-zinc-800 pb-12 md:pb-24 w-full overflow-x-hidden box-border">
      {/* HEADER */}
      <header className="bg-zinc-950 text-white pt-12 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 w-full box-border">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-6 w-full box-border">
          <div className="w-full min-w-0">
            <h1 className="text-xl md:text-4xl font-black uppercase tracking-tight mb-1 md:mb-2 truncate">
              Tenant Dashboard
            </h1>
            <p className="text-[10px] md:text-sm font-medium text-zinc-400 truncate">
              Welcome home, {user.name.split(" ")[0]}.
            </p>
          </div>

          <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-md border border-white/10 shrink-0">
            <span
              className={`w-2 h-2 rounded-full ${isRestricted ? "bg-gray-500" : lockStatus === "LOCKED" ? "bg-green-500" : "bg-red-500"} ${!isRestricted && "animate-pulse"}`}
            />
            <span className="text-xs font-bold uppercase tracking-widest text-white">
              {isRestricted ? "System Restricted" : `Door ${lockStatus}`}
            </span>
          </div>
        </div>

        {activeLeases.length > 1 && (
          <div className="max-w-6xl mx-auto mt-4 md:mt-8 flex items-center gap-1.5 md:gap-2 overflow-x-auto pb-2 scrollbar-hide w-full box-border">
            {activeLeases.map((item, idx) => (
              <button
                key={item.lease.id}
                onClick={() => setSelectedIndex(idx)}
                className={`whitespace-nowrap px-3 py-1.5 md:px-5 md:py-2.5 rounded-md text-[9px] md:text-xs font-bold uppercase tracking-widest transition-all border flex items-center gap-1.5 md:gap-2 shrink-0 ${
                  selectedIndex === idx
                    ? "bg-white text-black border-white shadow-sm"
                    : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="scale-75 md:scale-100 flex items-center">
                  <HugeiconsIcon icon={House03Icon} size={14} />
                </span>
                {item.listing.title}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 md:-mt-20 relative z-10 space-y-4 md:space-y-8 w-full box-border">
        {/* ========================================================= */}
        {/* ACTION CARDS & ALERTS (PREMIUM MINIMALIST STYLING)        */}
        {/* ========================================================= */}

        {/* 1. KYC BANNER */}
        {needsKyc && (
          <div className="bg-white border border-zinc-200/60 p-4 md:p-6 rounded-lg md:rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-6 relative overflow-hidden w-full box-border">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900" />
            <div className="flex items-start sm:items-center gap-3 md:gap-4 pl-1 md:pl-2 min-w-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-50/50 border border-zinc-200/60 rounded-full flex items-center justify-center shrink-0">
                <span className="scale-75 md:scale-100 flex items-center">
                  <HugeiconsIcon
                    icon={Shield02Icon}
                    className="text-zinc-900"
                    size={20}
                  />
                </span>
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] md:text-sm font-bold text-zinc-900 mb-0.5 md:mb-1 tracking-tight truncate">
                  Identity Verification Required
                </h4>
                <p className="text-[9px] md:text-sm text-zinc-500 font-medium break-words leading-tight">
                  Please verify your identity to generate your Smart Lock access
                  credentials.
                </p>
              </div>
            </div>
            <Link
              href="/user/leases"
              className="shrink-0 w-full sm:w-auto px-4 py-2 md:px-6 md:py-2.5 bg-zinc-900 hover:bg-black text-white text-[10px] md:text-sm font-semibold rounded-md md:rounded-lg transition-colors flex items-center justify-center"
            >
              Verify Identity
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-1 text-white" />

            </Link>
          </div>
        )}

        {/* 2. SIGNATURE BANNER */}
        {needsSignature && (
          <div className="bg-white border border-zinc-200/60 p-4 md:p-6 rounded-lg md:rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-6 relative overflow-hidden w-full box-border">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900" />
            <div className="flex items-start sm:items-center gap-3 md:gap-4 pl-1 md:pl-2 min-w-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-50/50 border border-zinc-200/60 rounded-full flex items-center justify-center shrink-0">
                <span className="scale-75 md:scale-100 flex items-center">
                  <HugeiconsIcon
                    icon={SignatureIcon}
                    className="text-zinc-900"
                    size={20}
                  />
                </span>
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] md:text-sm font-bold text-zinc-900 mb-0.5 md:mb-1 tracking-tight truncate">
                  Digital Signature Required
                </h4>
                <p className="text-[9px] md:text-sm text-zinc-500 font-medium break-words leading-tight">
                  Please review and sign your digital Tenancy Agreement to
                  finalize your application.
                </p>
              </div>
            </div>
            <Link
              href={`/user/sign-lease?leaseId=${lease.id}`}
              className="shrink-0 w-full sm:w-auto px-4 py-2 md:px-6 md:py-2.5 bg-zinc-900 hover:bg-black text-white text-[10px] md:text-sm font-semibold rounded-md md:rounded-lg transition-colors flex items-center justify-center"
            >
              Sign Document
              <HugeiconsIcon icon={ArrowRight01Icon} size={16} className="ml-1 text-white" />
            </Link>
          </div>
        )}

        {/* 3. ADMIN REVIEW BANNER */}
        {isPendingAdmin && (
          <div className="bg-white border border-zinc-200/60 p-4 md:p-6 rounded-lg md:rounded-lg flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 shadow-sm relative overflow-hidden w-full box-border">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-300" />
            <div className="flex items-start sm:items-center gap-3 md:gap-4 pl-1 md:pl-2 min-w-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-50/50 border border-zinc-200/60 rounded-full flex items-center justify-center shrink-0">
                <span className="scale-75 md:scale-100 flex items-center">
                  <HugeiconsIcon
                    icon={Clock01Icon}
                    className="text-zinc-900"
                    size={20}
                  />
                </span>
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] md:text-sm font-bold text-zinc-900 mb-0.5 md:mb-1 tracking-tight truncate">
                  Application Under Review
                </h4>
                <p className="text-[9px] md:text-sm text-zinc-500 font-medium break-words leading-tight">
                  Your documents have been submitted. Our team is finalizing
                  your verification.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. RENEWAL & VACATE ACTION CARD */}
        {isExpiringSoon && !isRestricted && (
          <div className="bg-white border border-zinc-200/60 p-4 md:p-6 rounded-lg md:rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 relative overflow-hidden w-full box-border">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-zinc-900" />

            <div className="flex items-start gap-3 md:gap-4 pl-1 md:pl-2 min-w-0">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-50/50 border border-zinc-200/60 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <span className="scale-75 md:scale-100 flex items-center">
                  <HugeiconsIcon
                    icon={
                      lease.intentToVacate
                        ? Logout01Icon
                        : isExpired
                          ? Alert01Icon
                          : Calendar01Icon
                    }
                    className="text-zinc-900"
                    size={20}
                  />
                </span>
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] md:text-base font-bold text-zinc-900 tracking-tight truncate">
                  {lease.intentToVacate
                    ? "Move-Out Scheduled"
                    : isExpired
                      ? "Payment Overdue: Lease Expired"
                      : "Lease Renewal Due"}
                </h4>
                <p className="text-[9px] md:text-sm text-zinc-500 font-medium mt-0.5 md:mt-1 max-w-xl break-words leading-tight">
                  {lease.intentToVacate
                    ? `Your notice to vacate is confirmed for ${endDate.toLocaleDateString()}. Please prepare for the final property inspection.`
                    : isExpired
                      ? "Your lease has officially expired. Please renew your subscription immediately to prevent the automatic revocation of your smart lock access."
                      : `Your current lease concludes in ${daysLeft} days. Please secure your renewal or officially submit a notice to vacate.`}
                </p>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            {!lease.intentToVacate && (
              <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 shrink-0 pl-1 md:pl-0 w-full sm:w-auto box-border">
                {/* SHADCN ALERT DIALOG FOR VACATING */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button
                      disabled={isRenewing || isVacating}
                      className="w-full sm:w-auto px-4 py-2 md:px-5 md:py-2.5 bg-white border border-zinc-200/60 hover:border-slate-300 hover:bg-zinc-50/50 text-zinc-700 font-semibold text-[10px] md:text-sm rounded-md md:rounded-lg transition-all flex items-center justify-center gap-1.5 md:gap-2 disabled:opacity-50 shrink-0"
                    >
                      {isVacating ? (
                        <>
                          <span className="scale-75 md:scale-100 flex items-center">
                            <HugeiconsIcon
                              icon={Loading03Icon}
                              size={16}
                              className="animate-spin"
                            />
                          </span>{" "}
                          Submitting...
                        </>
                      ) : (
                        "Notice to Vacate"
                      )}
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-sm md:text-lg">
                        Are you absolutely sure?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="text-[11px] md:text-sm">
                        This action will inform property management that you are
                        vacating on{" "}
                        <strong>{endDate.toLocaleDateString()}</strong>. Your
                        smart lock access will expire, and the property will be
                        immediately listed for new tenants.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="gap-2">
                      <AlertDialogCancel className="text-[11px] md:text-sm h-8 md:h-10">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleVacate}
                        className="bg-zinc-900 text-white hover:bg-zinc-800 text-[11px] md:text-sm h-8 md:h-10"
                      >
                        Confirm Move-Out
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>

                <button
                  onClick={handleRenewal}
                  disabled={isRenewing || isVacating}
                  className="w-full sm:w-auto px-4 py-2 md:px-6 md:py-2.5 bg-zinc-900 hover:bg-black text-white font-semibold text-[10px] md:text-sm rounded-md md:rounded-lg transition-colors flex items-center justify-center gap-1.5 md:gap-2 disabled:opacity-70 shadow-sm shrink-0"
                >
                  {isRenewing ? (
                    <>
                      <span className="scale-75 md:scale-100 flex items-center">
                        <HugeiconsIcon
                          icon={Loading03Icon}
                          size={16}
                          className="animate-spin"
                        />
                      </span>{" "}
                      Processing...
                    </>
                  ) : (
                    "Renew Lease"
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* SUBSCRIPTION STATS TRACKER */}
        {/* ========================================================= */}
        <div className="bg-white rounded-lg md:rounded-lg border border-zinc-200/60 p-4 md:p-8 w-full box-border">
          <div className="flex flex-row justify-between md:items-end gap-4 md:gap-6 mb-4 md:mb-6 w-full box-border">
            <div className="min-w-0">
              <h3 className="text-[9px] md:text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1 md:gap-2 mb-0.5 md:mb-1 truncate">
                Lease Timeline
              </h3>
              <p className="text-[10px] md:text-sm text-zinc-900 font-medium truncate">
                {startDate.toLocaleDateString()} —{" "}
                {endDate.toLocaleDateString()}
              </p>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xl md:text-3xl font-black text-zinc-900 tracking-tight flex flex-col items-end">
                {daysLeft}
                <span className="text-[8px] md:text-xs font-bold uppercase tracking-widest text-zinc-400 mt-0.5 md:mt-1">
                  {statusText}
                </span>
              </p>
            </div>
          </div>

          <div className="w-full bg-zinc-100/50 rounded-full h-1.5 md:h-2.5 overflow-hidden box-border">
            <div
              className={`h-full rounded-full transition-all duration-1000 ${isRestricted ? "bg-zinc-300" : "bg-zinc-900"}`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="flex justify-between text-[7px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mt-2 md:mt-4 w-full box-border">
            <span className="truncate">Move-In</span>
            <span className="truncate px-1 text-center">
              {isRestricted
                ? "Action Required"
                : today < startDate
                  ? "Pending"
                  : `${Math.round(progressPercentage)}% Completed`}
            </span>
            <span className="truncate">
              {lease.intentToVacate ? "Move-Out Date" : "Expiration"}
            </span>
          </div>
        </div>

        {/* HERO: Property & Smart Lock Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8 w-full box-border">
          <div className="lg:col-span-2 bg-white rounded-lg md:rounded-lg border border-zinc-200/60 overflow-hidden flex flex-col sm:flex-row w-full box-border">
            <div className="w-full sm:w-2/5 h-32 md:h-48 sm:h-auto relative bg-zinc-100/50 shrink-0">
              <Image
                src={listing.images[0] || "/placeholder.jpg"}
                alt="Property"
                fill
                className="object-cover"
              />
            </div>
            <div className="p-4 md:p-8 flex flex-col justify-center flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-2 md:mb-3">
                <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-900 bg-zinc-100/50 px-1.5 md:px-2 py-0.5 md:py-1 rounded truncate">
                  {listing.propertyType}
                </span>

                {isRestricted ? (
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-600 bg-zinc-100/50 px-1.5 md:px-2 py-0.5 md:py-1 rounded flex items-center gap-1 truncate">
                    <span className="scale-75 md:scale-100 flex items-center">
                      <HugeiconsIcon icon={Clock01Icon} size={10} />
                    </span>{" "}
                    Action Required
                  </span>
                ) : isExpired ? (
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-900 bg-zinc-200 px-1.5 md:px-2 py-0.5 md:py-1 rounded flex items-center gap-1 truncate">
                    <span className="scale-75 md:scale-100 flex items-center">
                      <HugeiconsIcon icon={Alert01Icon} size={10} />
                    </span>{" "}
                    Overdue
                  </span>
                ) : (
                  <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-zinc-700 bg-zinc-100/50 px-1.5 md:px-2 py-0.5 md:py-1 rounded flex items-center gap-1 truncate">
                    <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-green-500 shrink-0" />{" "}
                    Active
                  </span>
                )}
              </div>

              <h2 className="text-lg md:text-2xl font-black text-zinc-900 tracking-tight mb-1 md:mb-2 truncate w-full">
                {listing.title}
              </h2>
              <p className="text-[10px] md:text-sm font-medium text-zinc-500 mb-3 md:mb-6 flex items-center gap-1 md:gap-2 truncate w-full">
                <span className="scale-75 md:scale-100 flex items-center shrink-0">
                  <HugeiconsIcon icon={MapPinIcon} size={16} />
                </span>{" "}
                <span className="truncate">{listing.location}</span>
              </p>

              <div className="grid grid-cols-3 gap-2 md:gap-4 border-t border-zinc-200/60 pt-3 md:pt-6 w-full box-border">
                <div className="flex flex-col items-start gap-0.5 md:gap-1 text-zinc-700 min-w-0">
                  <span className="scale-75 md:scale-100 flex items-center">
                    <HugeiconsIcon
                      icon={BedDoubleIcon}
                      size={18}
                      className="text-zinc-400"
                    />
                  </span>
                  <span className="text-[10px] md:text-sm font-bold truncate">
                    {listing.bedrooms} Beds
                  </span>
                </div>
                <div className="flex flex-col items-start gap-0.5 md:gap-1 text-zinc-700 min-w-0">
                  <span className="scale-75 md:scale-100 flex items-center">
                    <HugeiconsIcon
                      icon={Bathtub01Icon}
                      size={18}
                      className="text-zinc-400"
                    />
                  </span>
                  <span className="text-[10px] md:text-sm font-bold truncate">
                    {listing.bathrooms} Baths
                  </span>
                </div>
                <div className="flex flex-col items-start gap-0.5 md:gap-1 text-zinc-700 min-w-0">
                  <span className="scale-75 md:scale-100 flex items-center">
                    <HugeiconsIcon
                      icon={MaximizeIcon}
                      size={18}
                      className="text-zinc-400"
                    />
                  </span>
                  <span className="text-[10px] md:text-sm font-bold truncate">
                    {listing.sizeSqm || "--"} Sqm
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DIGITAL KEYS BLOCK */}
          <div
            className={`rounded-lg md:rounded-lg p-5 md:p-8 flex flex-col justify-center relative overflow-hidden transition-colors duration-500 w-full box-border ${isRestricted ? "bg-zinc-900 border border-zinc-800" : lockStatus === "UNLOCKED" ? "bg-zinc-800 border border-zinc-700" : "bg-zinc-950 border border-black"}`}
          >
            <div className="absolute top-0 right-0 p-3 md:p-6 opacity-5 pointer-events-none">
              <span className="scale-[0.5] md:scale-100 flex items-center origin-top-right">
                <HugeiconsIcon icon={Key01Icon} size={150} />
              </span>
            </div>

            <div className="relative z-10 h-full flex flex-col w-full box-border">
              <div className="flex justify-between items-start mb-3 md:mb-6 w-full box-border">
                <div className="w-8 h-8 md:w-12 md:h-12 bg-white/10 rounded-full flex items-center justify-center border border-white/20 shrink-0">
                  <span className="scale-75 md:scale-100 flex items-center">
                    <HugeiconsIcon
                      icon={isRestricted ? Clock01Icon : Key01Icon}
                      size={24}
                      className={isRestricted ? "text-zinc-400" : "text-white"}
                    />
                  </span>
                </div>
                {!isRestricted && (
                  <span
                    className={`text-[8px] md:text-[10px] font-bold uppercase tracking-widest px-2 py-1 md:px-3 md:py-1.5 rounded-full border truncate ml-2 ${lockStatus === "LOCKED" ? "bg-green-500/10 text-green-400 border-green-500/20" : lockStatus === "UNLOCKED" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-white/10 text-white border-white/20"}`}
                  >
                    Door is {lockStatus}
                  </span>
                )}
              </div>

              <h3 className="text-[8px] md:text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-1 md:mb-2 truncate">
                Smart Lock Access
              </h3>

              <div className="flex items-center justify-between gap-2 md:gap-4 mb-3 md:mb-6 pb-3 md:pb-6 border-b border-white/10 w-full box-border min-w-0">
                {isRestricted ? (
                  <div className="font-mono text-sm md:text-xl font-bold text-zinc-500 uppercase tracking-[0.1em] truncate">
                    Pending
                  </div>
                ) : (
                  <>
                    <div className="font-mono text-xl md:text-3xl font-black text-white tracking-[0.2em] truncate">
                      {showPin ? lease.smartLockPin || "849201" : "••••••"}
                    </div>
                    <button
                      onClick={() => setShowPin(!showPin)}
                      className="p-1.5 md:p-2 hover:bg-white/10 rounded-full transition-colors text-zinc-400 hover:text-white shrink-0"
                      title={showPin ? "Hide PIN" : "Reveal PIN"}
                    >
                      <span className="scale-75 md:scale-100 flex items-center">
                        <HugeiconsIcon
                          icon={showPin ? ViewOffIcon : ViewIcon}
                          size={20}
                        />
                      </span>
                    </button>
                  </>
                )}
              </div>

              <button
                onClick={toggleSmartLock}
                disabled={
                  lockStatus === "LOADING" || today < startDate || isRestricted
                }
                className={`w-full py-2.5 md:py-4 rounded-lg md:rounded-lg flex items-center justify-center gap-1.5 md:gap-3 font-bold uppercase tracking-widest text-[9px] md:text-xs transition-all shadow-sm mt-auto min-w-0 box-border px-2 truncate ${
                  isRestricted
                    ? "bg-white/5 text-zinc-500 cursor-not-allowed border border-white/5"
                    : today < startDate
                      ? "bg-white/5 text-zinc-600 cursor-not-allowed border border-white/10"
                      : lockStatus === "LOADING"
                        ? "bg-white/10 text-zinc-400 cursor-wait"
                        : lockStatus === "LOCKED"
                          ? "bg-white text-black hover:bg-zinc-200"
                          : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                {needsKyc ? (
                  <>
                    <span className="scale-75 md:scale-100 flex items-center shrink-0">
                      <HugeiconsIcon icon={Shield02Icon} size={18} />
                    </span>{" "}
                    <span className="truncate">Complete KYC</span>
                  </>
                ) : needsSignature ? (
                  <>
                    <span className="scale-75 md:scale-100 flex items-center shrink-0">
                      <HugeiconsIcon icon={SignatureIcon} size={18} />
                    </span>{" "}
                    <span className="truncate">Sign Lease</span>
                  </>
                ) : isPendingAdmin ? (
                  <>
                    <span className="scale-75 md:scale-100 flex items-center shrink-0">
                    </span>{" "}
                    <span className="truncate">Provisioning...</span>
                  </>
                ) : today < startDate ? (
                  <>
                    <span className="scale-75 md:scale-100 flex items-center shrink-0">
                      <HugeiconsIcon icon={LockKeyIcon} size={18} />
                    </span>{" "}
                    <span className="truncate">Active on Move-in</span>
                  </>
                ) : lockStatus === "LOADING" ? (
                  <>
                    <span className="scale-75 md:scale-100 flex items-center shrink-0">
                      <HugeiconsIcon
                        icon={Loading03Icon}
                        size={18}
                        className="animate-spin"
                      />
                    </span>{" "}
                    <span className="truncate">Connecting...</span>
                  </>
                ) : lockStatus === "LOCKED" ? (
                  <>
                    <span className="scale-75 md:scale-100 flex items-center shrink-0">
                      <HugeiconsIcon icon={ViewIcon} size={18} />
                    </span>{" "}
                    <span className="truncate">Unlock Door Remotely</span>
                  </>
                ) : (
                  <>
                    <span className="scale-75 md:scale-100 flex items-center shrink-0">
                      <HugeiconsIcon icon={LockKeyIcon} size={18} />
                    </span>{" "}
                    <span className="truncate">Unlocked (5s)...</span>
                  </>
                )}
              </button>
              
              {!isRestricted && today >= startDate && (
                <button
                  onClick={() => setIsGuestModalOpen(true)}
                  className="w-full mt-3 py-2 md:py-3 rounded-lg md:rounded-lg border border-white/20 text-white font-bold uppercase tracking-widest text-[8px] md:text-[10px] hover:bg-white/10 transition-colors flex items-center justify-center gap-1.5 min-w-0 box-border px-2 truncate"
                >
                  <span className="scale-75 md:scale-100 flex items-center shrink-0">
                    <HugeiconsIcon icon={Key01Icon} size={14} />
                  </span>
                  Generate Guest Pass
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ACTIVE GUEST PASSES */}
        {!isRestricted && currentData.lock && currentData.lock.activeTempPins.length > 0 && (
          <div className="mb-4 md:mb-6 w-full box-border bg-white rounded-lg border border-zinc-200/60 overflow-hidden">
            <div className="p-4 md:p-6 border-b border-zinc-100 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-900">
                Active Guest Passes
              </h3>
              <span className="text-xs font-bold text-zinc-500 bg-zinc-100 px-2 py-1 rounded">
                {currentData.lock.activeTempPins.length} / 5
              </span>
            </div>
            <div className="divide-y divide-zinc-100">
              {currentData.lock.activeTempPins.map((pin) => (
                <div key={pin.pinId} className="p-4 md:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-zinc-900 mb-1">{pin.name}</span>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 font-medium">
                      <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded">{pin.pinMasked}</span>
                      <span>Expires: {new Date(pin.expiresAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button
                        className="text-xs font-bold uppercase tracking-widest text-red-600 hover:text-white border border-red-200 hover:border-red-600 hover:bg-red-600 transition-colors px-4 py-2 rounded"
                      >
                        Revoke
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white border-zinc-200">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Guest Pass?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to revoke the guest pass for <span className="font-bold text-zinc-800">{pin.name}</span>? This will immediately delete the PIN from the smart lock and prevent entry.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-zinc-200 text-zinc-700">Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-red-600 text-white hover:bg-red-700"
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
                          Yes, Revoke
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
          <div className="mb-4 md:mb-6 w-full box-border">
            <CleaningScheduleClient initialSchedule={initialSchedule} />
          </div>
        )}

        {/* UTILITIES & ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 w-full box-border">
          {!isRestricted && (
            <Link
              href={`/user/maintenance`}
              className="bg-white p-4 md:p-6 rounded-lg md:rounded-lg border border-zinc-200/60 hover:border-slate-300 transition-all text-left flex flex-col gap-2 md:gap-4 group w-full min-w-0 box-border"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-50/50 text-zinc-900 border border-zinc-200/60 rounded-full flex items-center justify-center group-hover:bg-zinc-100/50 transition-colors shrink-0">
                <span className="scale-75 md:scale-100 flex items-center">
                  <HugeiconsIcon icon={Wrench01Icon} size={20} />
                </span>
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] md:text-base font-bold text-zinc-900 mb-0.5 md:mb-1 truncate">
                  Report an Issue
                </h4>
                <p className="text-[10px] md:text-xs text-zinc-500 leading-relaxed font-medium break-words">
                  Create a maintenance ticket for plumbing, AC, or smart lock
                  issues.
                </p>
              </div>
            </Link>
          )}

          <Link
            href={`/user/transactions`}
            className="bg-white p-4 md:p-6 rounded-lg md:rounded-lg border border-zinc-200/60 hover:border-slate-300 transition-all text-left flex flex-col gap-2 md:gap-4 group w-full min-w-0 box-border"
          >
            <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-50/50 text-zinc-900 border border-zinc-200/60 rounded-full flex items-center justify-center group-hover:bg-zinc-100/50 transition-colors shrink-0">
              <span className="scale-75 md:scale-100 flex items-center">
                <HugeiconsIcon icon={CreditCardIcon} size={20} />
              </span>
            </div>
            <div className="min-w-0">
              <h4 className="text-[11px] md:text-base font-bold text-zinc-900 mb-0.5 md:mb-1 truncate">
                Payment History
              </h4>
              <p className="text-[10px] md:text-xs text-zinc-500 leading-relaxed font-medium break-words">
                View your transaction history and download official receipts.
              </p>
            </div>
          </Link>

          {!needsSignature && (
            <Link
              href={`/user/lease-document/${lease.id}`}
              className="bg-white p-4 md:p-6 rounded-lg md:rounded-lg border border-zinc-200/60 hover:border-slate-300 transition-all text-left flex flex-col gap-2 md:gap-4 group w-full min-w-0 box-border"
            >
              <div className="w-8 h-8 md:w-10 md:h-10 bg-zinc-50/50 text-zinc-900 border border-zinc-200/60 rounded-full flex items-center justify-center group-hover:bg-zinc-100/50 transition-colors shrink-0">
                <span className="scale-75 md:scale-100 flex items-center">
                  <HugeiconsIcon icon={SignatureIcon} size={20} />
                </span>
              </div>
              <div className="min-w-0">
                <h4 className="text-[11px] md:text-base font-bold text-zinc-900 mb-0.5 md:mb-1 truncate">
                  Lease Document
                </h4>
                <p className="text-[10px] md:text-xs text-zinc-500 leading-relaxed font-medium break-words">
                  Download a PDF copy of your signed tenancy agreement document.
                </p>
              </div>
            </Link>
          )}
        </div>
      </div>
      
      {/* Generate Guest PIN Modal */}
      <Dialog open={isGuestModalOpen} onOpenChange={setIsGuestModalOpen}>
        <DialogContent className="sm:max-w-md bg-white border border-zinc-200">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900">Create Guest Pass</DialogTitle>
            <DialogDescription className="text-zinc-500 font-medium text-sm">
              Generate a temporary PIN for visitors, cleaners, or contractors. Valid for up to 48 hours.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="guestName" className="text-xs font-bold uppercase tracking-widest text-zinc-900">
                Guest Name
              </Label>
              <Input
                id="guestName"
                placeholder="e.g. Cleaner, John Doe"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="bg-zinc-50 border-zinc-200 text-zinc-900 focus-visible:ring-zinc-400"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="guestDuration" className="text-xs font-bold uppercase tracking-widest text-zinc-900">
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
                className="bg-zinc-50 border-zinc-200 text-zinc-900 focus-visible:ring-zinc-400"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-zinc-200 text-zinc-700 hover:bg-zinc-100">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleGenerateGuestPin} className="bg-zinc-900 text-white hover:bg-zinc-800">
              Generate PIN
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
