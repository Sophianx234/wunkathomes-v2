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

import { createTourAction, rescheduleTourAction, TourActionState } from "@/actions/user/tour.action";
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

import { Calendar } from "@/components/ui/calendar";

export default function BookingCard({ listing, isRent, hasBookedTour, bookedTourDate, availableDays = [1, 2, 3, 4, 5] }: BookingCardProps & { availableDays?: number[], tourPrice?: number }) {
  const [state, formAction, isPending] = useActionState(
    createTourAction,
    initialState,
  );

  const [step, setStep] = useState<SchedulingStep>(hasBookedTour ? "SUCCESS" : "IDLE");
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
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
    setSelectedDate(undefined);
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

  const displayDate = bookedTourDate || (selectedDate ? selectedDate.toLocaleDateString() : "");

  const isSale = listing.listingType === "For_Sale";
  const isShortLet = listing.listingType === "Short_Let";

  let ctaText = "Secure This Property";
  let microCopy = "You will be securely redirected to pay the full amount and take this property off the market.";

  if (isSale) {
    ctaText = "Secure This Property";
    microCopy = "You will be securely redirected to pay the full amount and take this property off the market.";
  } else if (isShortLet) {
    ctaText = "Secure Your Booking";
    microCopy = "You will be securely redirected to complete your payment.";
  } else {
    ctaText = "Secure Your Lease";
    microCopy = "You will be securely redirected to pay the full amount and take this property off the market.";
  }

  return (
    <div className="lg:col-span-4 lg:-translate-y-8 w-full lg:w-[350px] lg:ml-auto relative">
      
      {/* Unified Responsive Container */}
      <div className="
        fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-black p-4 rounded-t-2xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] transition-all duration-300 box-border w-full max-w-[100vw]
        lg:sticky lg:top-32 lg:min-h-[460px] lg:p-6 lg:border-2 lg:border-black lg:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] lg:flex lg:flex-col lg:rounded-lg lg:bottom-auto lg:left-auto lg:right-auto lg:z-auto lg:max-w-none
      ">
        
        {/* === Mobile Only: Header / Condensed View === */}
        <div className="lg:hidden w-full max-w-full box-border">
          {step === "IDLE" && (
            <div className="flex items-center justify-between animate-in fade-in duration-300 w-full">
              <div className="min-w-0 shrink overflow-hidden pr-2">
                <div className="text-xl font-black truncate">
                  ${listing.price?.toLocaleString()}
                  <span className="text-[10px] font-medium text-zinc-500">
                    {listing.listingType === "For_Rent" ? (listing.roomType === "Furnished" ? " /day" : " /month") : ""}
                  </span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 truncate">
                  {isRent ? "For Rent" : "Purchase Price"}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => handleNext("DATE")}
                  disabled={hasBookedTour && !isRescheduling}
                  className="p-3 border-2 border-black rounded-lg hover:bg-zinc-50/50 transition-colors shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="scale-90 flex items-center">
                    <HugeiconsIcon icon={Calendar01Icon} size={16} />
                  </span>
                </button>
                <Link href={`/checkout/${listing.slug}?type=deposit`} className="shrink-0">
                  <button className="px-5 py-3 bg-black text-white font-black uppercase tracking-widest text-[10px] rounded-lg hover:bg-black/90 transition-colors whitespace-nowrap w-full">
                    {ctaText}
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
                              <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 w-full mb-6">
                  <p className="text-[10px] lg:text-xs text-zinc-600 font-medium leading-relaxed">
                    Please note: A viewing fee of <span className="font-bold text-black">{tourPrice || 50} GHS</span> is payable to the tour guide after the viewing.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setIsRescheduling(true);
                    setStep("DATE");
                  }}
                  className="w-full box-border py-3 bg-white text-black font-bold uppercase tracking-widest text-[10px] lg:text-xs border-2 border-black rounded-lg hover:bg-zinc-50 transition-colors mb-2"
                >
                  Reschedule Tour
                </button>
                
                {!hasBookedTour && (
                  <button
                    onClick={resetFlow}
                    className="block w-full max-w-full box-border py-2.5 lg:py-3 bg-white text-zinc-500 font-black uppercase tracking-widest text-[10px] lg:text-xs hover:text-black transition-colors m-0"
                  >
                    Close
                  </button>
                )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}










