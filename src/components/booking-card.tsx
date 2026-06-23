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
import { PhoneInput } from "@/components/phone-input";

interface BookingCardProps {
  listing: any;
  hasBookedTour: boolean;
  bookedTourDate?: string | null;
  isRent: boolean;
}

type SchedulingStep = "IDLE" | "DATE" | "PHONE" | "SUCCESS";

const initialState: TourActionState = { success: false, message: "" };

export default function BookingCard({ listing, isRent, hasBookedTour, bookedTourDate }: BookingCardProps) {
  const [state, formAction, isPending] = useActionState(
    createTourAction,
    initialState,
  );

  const [step, setStep] = useState<SchedulingStep>(hasBookedTour ? "SUCCESS" : "IDLE");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+233");

  // Lock navigation if a tour is already booked
  const handleNext = (nextStep: SchedulingStep) => {
    if (hasBookedTour) return;
    setStep(nextStep);
  };
  
  const handleBack = (prevStep: SchedulingStep) => {
    if (hasBookedTour) return;
    setStep(prevStep);
  };

  const resetFlow = () => {
    if (hasBookedTour) return;
    setStep("IDLE");
    setSelectedDate("");
    setSelectedTime("");
    setPhoneNumber("");
  };

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      setStep("SUCCESS");
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state]);

  const displayDate = bookedTourDate || selectedDate;

  return (
    <div className="lg:col-span-4 lg:-translate-y-8 w-full lg:w-[300px] lg:ml-auto relative">
      
      {/* Unified Responsive Container */}
      <div className="
        fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-black p-4 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] transition-all duration-300 box-border w-full max-w-[100vw]
        lg:sticky lg:top-32 lg:min-h-[460px] lg:p-8 lg:border-2 lg:border-black lg:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:flex lg:flex-col lg:rounded-xl lg:bottom-auto lg:left-auto lg:right-auto lg:z-auto lg:max-w-none
      ">
        
        {/* === Mobile Only: Header / Condensed View === */}
        <div className="lg:hidden w-full max-w-full box-border">
          {step === "IDLE" && (
            <div className="flex items-center justify-between animate-in fade-in duration-300 w-full">
              <div className="min-w-0 shrink overflow-hidden pr-2">
                <div className="text-xl font-black truncate">
                  ${listing.price?.toLocaleString()}
                  <span className="text-[10px] font-medium text-slate-500">
                    {" "}
                    {formatLeaseTerm(listing.terms?.leaseTerm)}
                  </span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate">
                  {isRent ? "For Rent" : "Purchase Price"}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleNext("DATE")}
                  disabled={hasBookedTour}
                  className="p-3 border-2 border-black rounded-lg hover:bg-slate-50 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="scale-90 flex items-center">
                    <HugeiconsIcon icon={Calendar01Icon} size={16} />
                  </span>
                </button>
                <Link href={`/checkout/${listing.slug}?type=deposit`} className="shrink-0">
                  <button className="px-5 py-3 bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap w-full">
                    {isRent ? "Reserve" : "Buy Now"}
                  </button>
                </Link>
              </div>
            </div>
          )}

          {step !== "IDLE" && (
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-black/10 w-full box-border">
              <span className="font-black uppercase tracking-widest text-xs truncate pr-4">
                {step === "SUCCESS" ? "Tour Confirmed" : "Schedule a Tour"}
              </span>
              {!hasBookedTour && (
                <button
                  onClick={resetFlow}
                  className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hover:text-black shrink-0"
                >
                  Close
                </button>
              )}
            </div>
          )}
        </div>

        {/* === Desktop Only: Header & Ledger === */}
        <div className="hidden lg:block mb-8 shrink-0 w-full box-border">
          <span className="text-sm font-bold uppercase tracking-widest text-slate-500 block mb-2">
            {isRent ? "Lease for" : "Purchase Price"}
          </span>
          <div className="text-4xl font-black tracking-tight break-words">
            ${listing.price?.toLocaleString()}
            {listing.terms?.leaseTerm && (
              <span className="text-lg text-slate-500 font-medium tracking-normal">
                {" "}
                {formatLeaseTerm(listing.terms.leaseTerm)}
              </span>
            )}
          </div>
        </div>

        <div className="hidden lg:block space-y-4 mb-8 shrink-0 w-full box-border">
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

        {/* === DYNAMIC ACTION AREA (Forms) === */}
        <div className={`flex-col w-full max-w-full box-border gap-2 lg:gap-3 mt-auto transition-all duration-300 ${step === 'IDLE' ? 'hidden lg:flex' : 'flex max-h-[70vh] overflow-y-auto overflow-x-hidden pb-2 lg:pb-0'}`}>
          
          {step === "IDLE" && (
            <div className="hidden lg:contents w-full box-border">
              <Link
                href={`/checkout/${listing.slug}?type=deposit`}
                className="w-full block"
              >
                <button className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-xs rounded-lg hover:bg-slate-800 transition-colors">
                  {isRent ? "Reserve Now" : "Reserve to Buy"}
                </button>
              </Link>

              <div className="relative flex items-center py-2 w-full box-border">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">
                  Or
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button
                onClick={() => handleNext("DATE")}
                disabled={hasBookedTour}
                className="w-full box-border py-4 bg-white text-black font-black uppercase tracking-widest text-xs border-2 border-black rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HugeiconsIcon icon={Calendar01Icon} size={16} /> Schedule a
                Tour
              </button>
            </div>
          )}

          {step === "DATE" && (
            <div className="flex flex-col w-full min-w-0 max-w-full box-border gap-2 lg:gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <button
                onClick={() => handleBack("IDLE")}
                className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1 mb-1 hover:text-black w-fit shrink-0"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={12} /> Back
              </button>

              <div className="flex flex-col gap-1 w-full min-w-0 max-w-full box-border">
                <label className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-black">
                  Select a Date
                </label>
                <div className="relative w-full min-w-0 max-w-full box-border">
                  <span className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none scale-90 lg:scale-100 flex items-center">
                    <HugeiconsIcon icon={Calendar01Icon} size={16} />
                  </span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="block w-full min-w-0 max-w-full box-border py-2.5 lg:py-3.5 pl-9 lg:pl-10 pr-3 lg:pr-4 border-2 border-black rounded-lg text-xs lg:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/20 text-black bg-white m-0 appearance-none"
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1 w-full min-w-0 max-w-full box-border">
                <label className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-black">
                  Select a Time
                </label>
                <div className="relative w-full min-w-0 max-w-full box-border">
                  <span className="absolute left-3 lg:left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none scale-90 lg:scale-100 flex items-center">
                      <HugeiconsIcon icon={Clock01Icon} size={16} />
                  </span>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="block w-full min-w-0 max-w-full box-border py-2.5 lg:py-3.5 pl-9 lg:pl-10 pr-3 lg:pr-4 border-2 border-black rounded-lg text-xs lg:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/20 text-black bg-white m-0 appearance-none"
                  />
                </div>
              </div>

              <button
                onClick={() => handleNext("PHONE")}
                disabled={!selectedDate || !selectedTime}
                className="block w-full min-w-0 max-w-full box-border py-3 lg:py-4 bg-black text-white font-black uppercase tracking-widest text-[10px] lg:text-xs rounded-lg hover:bg-slate-800 transition-colors mt-2 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
              >
                Continue
              </button>
            </div>
          )}

          {step === "PHONE" && (
            <form
              action={formAction}
              className="flex flex-col w-full max-w-full box-border gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <button
                type="button"
                onClick={() => handleBack("DATE")}
                className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1 mb-2 hover:text-black w-fit"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={12} /> Back
              </button>

              <div className="flex flex-col gap-1 w-full max-w-full box-border">
                <label className="text-[10px] lg:text-xs font-bold uppercase tracking-widest text-black mb-1">
                  Your WhatsApp Number
                </label>
                <div className="relative w-full max-w-full box-border">
                  <input type="hidden" name="listingId" value={listing.id} />
                  <input type="hidden" name="scheduledDate" value={selectedDate} />
                  <input type="hidden" name="scheduledTime" value={selectedTime} />
                  
                  {/* Combine the country code with raw digits for the backend */}
                  <input type="hidden" name="phoneNumber" value={`${countryCode}${phoneNumber.replace(/\D/g, "")}`} />

                  <PhoneInput
                    id="phone"
                    name="rawPhoneNumber"
                    value={phoneNumber}
                    onChange={setPhoneNumber}
                    countryCode={countryCode}
                    onCountryCodeChange={setCountryCode}
                    className="block w-full max-w-full box-border py-3 lg:py-4 border-2 border-black rounded-lg text-xs lg:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/20 text-black placeholder:text-slate-300 m-0"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending || phoneNumber.length < 9}
                className="block w-full max-w-full box-border py-3 lg:py-4 flex items-center justify-center bg-black text-white font-black uppercase tracking-widest text-[10px] lg:text-xs rounded-lg hover:bg-slate-800 transition-colors mt-2 disabled:opacity-30 disabled:cursor-not-allowed m-0"
              >
                {isPending && (
                  <span className="scale-90 flex items-center mr-1.5 lg:mr-2">
                     <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
                  </span>
                )}
                {isPending ? "Confirming..." : "Confirm Tour"}
              </button>
            </form>
          )}

          {step === "SUCCESS" && (
            <div className="flex flex-col w-full max-w-full box-border items-center justify-center text-center gap-2 py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-50 rounded-full flex items-center justify-center mb-2 shrink-0">
                <span className="scale-75 lg:scale-100 flex items-center">
                  <HugeiconsIcon
                    icon={CheckmarkBadge01Icon}
                    size={32}
                    className="text-green-600"
                  />
                </span>
              </div>
              <h3 className="font-black text-sm lg:text-lg uppercase tracking-tight text-black break-words">
                Tour Scheduled!
              </h3>
              <p className="text-[10px] lg:text-xs font-medium text-slate-500 mb-4 lg:mb-6 leading-relaxed w-full box-border px-2">
                One of our friendly team members will meet you on <br />
                {displayDate && (
                  <strong className="text-black">
                    {new Date(displayDate).toLocaleDateString("en-US", {
                      weekday: "long",
                      month: "short",
                      day: "numeric",
                    })}
                  </strong>
                )}
                .
              </p>
              
              {!hasBookedTour && (
                <button
                  onClick={resetFlow}
                  className="block w-full max-w-full box-border py-2.5 lg:py-3 bg-white text-black font-black uppercase tracking-widest text-[10px] lg:text-xs border-2 border-black rounded-lg hover:bg-slate-50 transition-colors m-0"
                >
                  Done
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
