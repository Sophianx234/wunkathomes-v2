"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  Calendar01Icon, 
  ArrowLeft01Icon,
  CheckmarkBadge01Icon,
  SmartPhone01Icon // Assuming this icon exists in your Hugeicons pack
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

// Assuming you have an interface for your listing
interface BookingCardProps {
  listing: any; 
  isRent: boolean;
}

type SchedulingStep = 'IDLE' | 'DATE' | 'PHONE' | 'SUCCESS';

export default function BookingCard({ listing, isRent }: BookingCardProps) {
  // --- State Machine for the Scheduling Flow ---
  const [step, setStep] = useState<SchedulingStep>('IDLE');
  const [selectedDate, setSelectedDate] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // --- Handlers ---
  const handleNext = (nextStep: SchedulingStep) => setStep(nextStep);
  const handleBack = (prevStep: SchedulingStep) => setStep(prevStep);
  
  const handleConfirm = () => {
    // TODO: Trigger your backend API here to save the lead/booking via SMS
    console.log(`Booking confirmed for ${selectedDate} with phone: ${phoneNumber}`);
    setStep('SUCCESS');
  };

  const resetFlow = () => {
    setStep('IDLE');
    setSelectedDate('');
    setPhoneNumber('');
  };

  return (
    <div className="lg:col-span-4 relative hidden lg:block">
      <div className="sticky top-32 p-8 border-2 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col rounded-xl min-h-[450px]">
        
        {/* === Header (Always Visible) === */}
        <div className="mb-8">
          <span className="text-sm font-bold uppercase tracking-widest text-slate-500 block mb-2">
            {isRent ? 'Lease Valuation' : 'Acquisition Price'}
          </span>
          <div className="text-4xl font-black tracking-tight">
            ${listing.price?.toLocaleString()}
            {isRent && <span className="text-lg text-slate-500 font-medium tracking-normal"> / mo</span>}
          </div>
        </div>

        {/* === Financial Ledger (Always Visible) === */}
        <div className="space-y-4 mb-8">
          <div className="flex justify-between items-center py-3 border-b border-black/10">
            <span className="text-sm font-medium text-slate-600">Verification</span>
            <span className="text-sm font-bold text-black">Wunkat Standard</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-black/10">
            <span className="text-sm font-medium text-slate-600">Broker Fees</span>
            <span className="text-sm font-bold text-green-600">$0 (Direct)</span>
          </div>
          {isRent && listing.terms?.leaseTerm && (
            <div className="flex justify-between items-center py-3 border-b border-black/10">
              <span className="text-sm font-medium text-slate-600">Minimum Term</span>
              <span className="text-sm font-bold text-black">{listing.terms.leaseTerm}</span>
            </div>
          )}
        </div>

        {/* === DYNAMIC ACTION AREA === */}
        <div className="flex flex-col gap-3 mt-auto transition-all duration-300">
          
          {/* STATE 1: IDLE (Default View) */}
          {step === 'IDLE' && (
            <>
              <Link href={`/checkout/${listing.slug}?type=deposit`} className="w-full">
                <button className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-xs rounded-lg hover:bg-slate-800 transition-colors">
                  Reserve
                </button>
              </Link>
              
              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-slate-400 text-[10px] font-bold uppercase tracking-widest">Or</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <button 
                onClick={() => handleNext('DATE')}
                className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs border-2 border-black rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
              >
                <HugeiconsIcon icon={Calendar01Icon} size={16} />
                Schedule Site Viewing
              </button>
            </>
          )}

          {/* STATE 2: DATE SELECTION */}
          {step === 'DATE' && (
            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <button 
                onClick={() => handleBack('IDLE')} 
                className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1 mb-2 hover:text-black w-fit"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={12} /> Back
              </button>
              
              <label className="text-xs font-bold uppercase tracking-widest text-black mb-1">
                Select Viewing Date
              </label>
              <input 
                type="date" 
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full p-4 border-2 border-black rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/20 text-black bg-white" 
                min={new Date().toISOString().split('T')[0]} // Prevents selecting past dates
              />
              
              <button 
                onClick={() => handleNext('PHONE')}
                disabled={!selectedDate}
                className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-xs rounded-lg hover:bg-slate-800 transition-colors mt-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Continue
              </button>
            </div>
          )}

          {/* STATE 3: PHONE NUMBER INPUT */}
          {step === 'PHONE' && (
            <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <button 
                onClick={() => handleBack('DATE')} 
                className="text-[10px] text-slate-500 uppercase tracking-widest font-bold flex items-center gap-1 mb-2 hover:text-black w-fit"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} size={12} /> Back
              </button>
              
              <label className="text-xs font-bold uppercase tracking-widest text-black mb-1">
                Your WhatsApp Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <HugeiconsIcon icon={SmartPhone01Icon} size={16} className="text-slate-400" />
                </div>
                <input 
                  type="tel" 
                  placeholder="+233 XX XXX XXXX"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full py-4 pl-10 pr-4 border-2 border-black rounded-lg text-sm font-bold focus:outline-none focus:ring-2 focus:ring-black/20 text-black placeholder:text-slate-300" 
                />
              </div>
              
              <button 
                onClick={handleConfirm}
                disabled={phoneNumber.length < 9}
                className="w-full py-4 bg-black text-white font-black uppercase tracking-widest text-xs rounded-lg hover:bg-slate-800 transition-colors mt-2 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Confirm Tour
              </button>
              <p className="text-[9px] text-center font-bold uppercase tracking-widest text-slate-400 mt-2">
                We'll send your secure entry pass via WhatsApp.
              </p>
            </div>
          )}

          {/* STATE 4: SUCCESS CONFIRMATION */}
          {step === 'SUCCESS' && (
            <div className="flex flex-col items-center justify-center text-center gap-2 py-4 animate-in fade-in zoom-in-95 duration-300">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-2">
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={32} className="text-green-600" />
              </div>
              <h3 className="font-black text-lg uppercase tracking-tight text-black">
                Tour Scheduled
              </h3>
              <p className="text-xs font-medium text-slate-500 mb-6 leading-relaxed px-4">
                Your Wunkat Portfolio Manager will meet you on <br/>
                <strong className="text-black">{new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</strong>.
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

        {/* === Footer Trust Marker === */}
        {step === 'IDLE' && (
          <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest mt-6 font-bold leading-relaxed">
            100% Owned by WunkatHomes. <br /> Secure hybrid payments.
          </p>
        )}
      </div>
    </div>
  );
}