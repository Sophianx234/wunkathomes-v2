"use client";

import { useState, useActionState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar01Icon,
  ArrowLeft01Icon,
  CheckmarkBadge01Icon,
  SmartPhone01Icon,
  Loading03Icon,
  Clock01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatLeaseTerm } from "@/lib/helpers";
import { createTourAction, TourActionState } from "@/actions/user/tour.action";
import { toast } from "sonner";

interface BookingCardProps {
  listing: any;
  isRent: boolean;
}

type SchedulingStep = "IDLE" | "DATE" | "PHONE" | "SUCCESS";

const initialState: TourActionState = { success: false, message: "" };

export default function BookingCard({ listing, isRent }: BookingCardProps) {
  const [state, formAction, isPending] = useActionState(
    createTourAction,
    initialState,
  );

  const [step, setStep] = useState<SchedulingStep>("IDLE");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState(""); // NEW: Time State
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleNext = (nextStep: SchedulingStep) => setStep(nextStep);
  const handleBack = (prevStep: SchedulingStep) => setStep(prevStep);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      setStep("SUCCESS");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const resetFlow = () => {
    setStep("IDLE");
    setSelectedDate("");
    setSelectedTime("");
    setPhoneNumber("");
  };

  // Helper to format the combined Date + Time for the success screen
  const getFormattedDateTime = () => {
    if (!selectedDate || !selectedTime) return "";
    const dateObj = new Date(`${selectedDate}T${selectedTime}`);
    const dateStr = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
    const timeStr = dateObj.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
    return `${dateStr} at ${timeStr}`;
  };

  return (
    <div className="lg:col-span-4 -translate-8 w-[300px] ml-auto relative hidden lg:block">
      <div className="sticky top-32 min-h-[460px] p-8 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col rounded-xl">
        {/* === Header === */}
        <div className="mb-8 shrink-0">
          <span className="text-sm font-bold uppercase tracking-widest text-slate-500 block mb-2">
            {isRent ? "Lease for" : "Purchase Price"}
          </span>
          <div className="text-4xl font-black tracking-tight">
            ${listing.price?.toLocaleString()}
            {listing.terms?.leaseTerm && (
              <span className="text-lg text-slate-500 font-medium tracking-normal">
                {" "}
                {formatLeaseTerm(listing.terms.leaseTerm)}
              </span>
            )}
          </div>
        </div>

        {/* === Simple Info Ledger === */}
        <div className="space-y-4 mb-8 shrink-0">
          <div className="flex justify-between items-center py-3 border-b border-black/10">
            <span className="text-sm font-medium text-slate-600">
              Verified Property
            </span>
            <span className="text-sm font-bold text-black flex items-center gap-1">
              <HugeiconsIcon
                icon={CheckmarkBadge01Icon}
                size={16}
                className="text-green-600"
              />{" "}
              Yes
            </span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-black/10">
            <span className="text-sm font-medium text-slate-600">
              Agent Fees
            </span>
            <span className="text-sm font-bold text-green-600">$0</span>
          </div>
        </div>

        {/* === DYNAMIC ACTION AREA === */}
        <div className="flex flex-col gap-3 mt-auto transition-all duration-300">
          {step === "IDLE" && (
            <>
              <Link
                href={`/checkout/${listing.slug}?type=deposit`}
                className="w-full"
              >
                <button className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-xs rounded-lg hover:bg-slate-800 transition-colors">
                  {isRent ? "Reserve Now" : "Reserve to Buy"}
                </button>
              </Link>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  Or
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                onClick={() => handleNext("DATE")}
                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs border-2 border-black rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <HugeiconsIcon icon={Calendar01Icon} size={16} /> Schedule a
                Tour
              </button>
            </>
          )}

          {step === "DATE" && (
            <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <button
                onClick={() => handleBack("IDLE")}
                className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1 mb-1 hover:text-black w-fit"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={12} /> Back
              </button>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-widest text-black">
                  Select a Date
                </label>
                <div className="relative">
                  <HugeiconsIcon
                    icon={Calendar01Icon}
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="w-full py-3.5 pl-10 pr-4 border-2 border-black rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/20 text-black bg-white"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-widest text-black">
                  Select a Time
                </label>
                <div className="relative">
                  <HugeiconsIcon
                    icon={Clock01Icon}
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full py-3.5 pl-10 pr-4 border-2 border-black rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/20 text-black bg-white"
                  />
                </div>
              </div>

              <button
                onClick={() => handleNext("PHONE")}
                disabled={!selectedDate || !selectedTime}
                className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-xs rounded-lg hover:bg-slate-800 transition-colors mt-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {step === "PHONE" && (
            <form
              action={formAction}
              className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <button
                type="button"
                onClick={() => handleBack("DATE")}
                className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1 mb-2 hover:text-black w-fit"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={12} /> Back
              </button>

              <label className="text-xs font-bold uppercase tracking-widest text-black mb-1">
                Your WhatsApp Number
              </label>
              <div className="relative">
                <HugeiconsIcon
                  icon={SmartPhone01Icon}
                  size={16}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />

                {/* Passing both date and time to the server securely */}
                <input type="hidden" name="listingId" value={listing.id} />
                <input
                  type="hidden"
                  name="scheduledDate"
                  value={selectedDate}
                />
                <input
                  type="hidden"
                  name="scheduledTime"
                  value={selectedTime}
                />

                <input
                  type="tel"
                  name="phoneNumber"
                  placeholder="+233 XX XXX XXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full py-4 pl-10 pr-4 border-2 border-black rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/20 text-black placeholder:text-slate-300"
                />
              </div>

              <button
                type="submit"
                disabled={isPending || phoneNumber.length < 9}
                className="w-full py-4 flex items-center justify-center bg-black text-white font-black uppercase tracking-widest text-xs rounded-lg hover:bg-slate-800 transition-colors mt-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isPending && (
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    size={16}
                    className="animate-spin mr-2"
                  />
                )}
                {isPending ? "Confirming..." : "Confirm Tour"}
              </button>
            </form>
          )}

          {step === "SUCCESS" && (
            <div className="flex flex-col items-center justify-center text-center gap-2 py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-2">
                <HugeiconsIcon
                  icon={CheckmarkBadge01Icon}
                  size={32}
                  className="text-green-600"
                />
              </div>
              <h3 className="font-black text-lg uppercase tracking-tight text-black">
                Tour Scheduled!
              </h3>
              <p className="text-xs font-medium text-slate-500 mb-6 leading-relaxed px-4">
                One of our friendly team members will meet you on <br />
                <strong className="text-black">
                  {new Date(selectedDate).toLocaleDateString("en-US", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </strong>
                .
              </p>
              <button
                onClick={resetFlow}
                className="w-full py-3 bg-white text-black font-black uppercase tracking-widest text-xs border-2 border-black rounded-lg hover:bg-slate-50 transition-colors"
              >
                Done
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
