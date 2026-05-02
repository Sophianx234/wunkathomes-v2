"use client";

import Image from "next/image";
import Link from "next/link";
import { 
  Building04Icon, 
  Key01Icon, 
  File02Icon, 
  Wifi01Icon,
  CustomerSupportIcon,
  CreditCardIcon,
  Download01Icon,
  ArrowRight01Icon,
  CheckmarkBadge01Icon,
  Time02Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function LeasesPage() {
  // Mock Data: In production, fetch this from your DB via the user's session
  const activeLease = {
    propertyName: "The Cantonments Penthouse",
    status: "ACTIVE",
    rentDue: "Nov 1, 2026",
    pin: "8472-9901",
    wifi: "Wunkat_Penthouse_5G",
    image: "/images/properties/penthouse.jpg" // Replace with actual image
  };

  const pendingBooking = {
    propertyName: "The Glasshouse Villa",
    status: "PENDING_BALANCE",
    balance: "$11,500.00",
    deadline: "24 Hours",
    image: "/images/properties/glasshouse.jpg"
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/10 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black mb-2">
            My Assets & Leases
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Manage your digital keys, active contracts, and secure payments.
          </p>
        </div>
      </div>

      <div className="space-y-12">

        {/* =========================================
            SECTION 1: PENDING BOOKINGS (Requires Action)
        ========================================= */}
        <section>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">
            Pending Handover
          </h2>
          
          <div className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row overflow-hidden relative">
            <div className="absolute top-0 left-0 h-full w-2 bg-amber-400"></div>
            
            {/* Image Box */}
            <div className="w-full md:w-64 h-48 md:h-auto bg-slate-100 relative shrink-0">
              <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                <HugeiconsIcon icon={Building04Icon} size={32} />
              </div>
              <img src={pendingBooking.image} alt={pendingBooking.propertyName} className="absolute inset-0 w-full h-full object-cover relative z-10" />
            </div>

            {/* Details & Action Box */}
            <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-800 px-2 py-1 rounded">
                    Awaiting Final Balance
                  </span>
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight mb-2">
                  {pendingBooking.propertyName}
                </h3>
                <p className="text-xs font-medium text-slate-500 mb-6">
                  Your physical inspection is complete. Clear the remaining balance to instantly receive your permanent digital keys.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4 border-t border-slate-100 pt-6">
                <button className="w-full sm:w-auto px-6 py-3.5 bg-black text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-black/20 flex items-center justify-center gap-2">
                  <HugeiconsIcon icon={CreditCardIcon} size={16} />
                  Wire {pendingBooking.balance}
                </button>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <HugeiconsIcon icon={Time02Icon} size={14} className="text-amber-500" />
                  Due in {pendingBooking.deadline}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 2: ACTIVE ASSETS (The Digital Keyring)
        ========================================= */}
        <section>
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">
            Active Assets
          </h2>
          
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-2">
            <div className="bg-white border border-slate-200 rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden">
              
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                
                {/* Left: Asset Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                      Active Lease
                    </span>
                  </div>
                  <h3 className="text-2xl font-black uppercase tracking-tight mb-1">
                    {activeLease.propertyName}
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-8">
                    Next payment due: <strong className="text-black">{activeLease.rentDue}</strong>
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Concierge Block */}
                    <div className="p-4 border border-slate-200 rounded-lg flex items-start gap-3 bg-slate-50">
                      <div className="bg-white p-2 rounded-md shadow-sm border border-slate-100 shrink-0">
                        <HugeiconsIcon icon={CustomerSupportIcon} size={18} className="text-black" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Portfolio Manager</span>
                        <span className="block text-xs font-bold text-black mb-1">Sarah Mensah</span>
                        <button className="text-[10px] font-bold uppercase tracking-widest border-b border-black text-black hover:text-slate-500 transition-colors">Message</button>
                      </div>
                    </div>
                    {/* Wifi Block */}
                    <div className="p-4 border border-slate-200 rounded-lg flex items-start gap-3 bg-slate-50">
                      <div className="bg-white p-2 rounded-md shadow-sm border border-slate-100 shrink-0">
                        <HugeiconsIcon icon={Wifi01Icon} size={18} className="text-black" />
                      </div>
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-0.5">Network Setup</span>
                        <span className="block text-xs font-bold text-black mb-1">{activeLease.wifi}</span>
                        <button className="text-[10px] font-bold uppercase tracking-widest border-b border-black text-black hover:text-slate-500 transition-colors">Show Password</button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right: Tuya Digital Keyring */}
                <div className="w-full lg:w-72 bg-black rounded-xl p-6 text-white flex flex-col justify-between shrink-0 shadow-xl shadow-black/10">
                  <div>
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/20">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-slate-300">Smart Lock PIN</h4>
                      <HugeiconsIcon icon={Key01Icon} size={16} className="text-white" />
                    </div>
                    
                    {/* The Hidden PIN UX */}
                    <div className="bg-white/10 p-4 rounded-lg text-center mb-4 cursor-pointer hover:bg-white/20 transition-colors group">
                      <span className="block text-2xl font-black tracking-widest blur-sm group-hover:blur-none transition-all duration-300">
                        {activeLease.pin}
                      </span>
                      <span className="block text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2">Hover to reveal</span>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-lg hover:bg-slate-200 transition-colors">
                    Generate Guest PIN
                  </button>
                </div>

              </div>
            </div>
          </div>
        </section>

        {/* =========================================
            SECTION 3: DIGITAL LEDGER (Contracts)
        ========================================= */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">
              Document Ledger
            </h2>
          </div>
          
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            
            {/* Table Header */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 border-b border-slate-100 bg-slate-50 text-[10px] font-bold uppercase tracking-widest text-slate-500">
              <div className="col-span-6">Document Type</div>
              <div className="col-span-3">Date Executed</div>
              <div className="col-span-3 text-right">Action</div>
            </div>

            {/* Document Row 1 */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-5 border-b border-slate-100 items-center hover:bg-slate-50 transition-colors">
              <div className="col-span-1 sm:col-span-6 flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded text-slate-400 shrink-0">
                  <HugeiconsIcon icon={File02Icon} size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-black uppercase tracking-widest">Tenancy Agreement</p>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{activeLease.propertyName}</p>
                </div>
              </div>
              <div className="col-span-1 sm:col-span-3 text-xs font-bold text-slate-500">
                Oct 15, 2026
              </div>
              <div className="col-span-1 sm:col-span-3 flex sm:justify-end">
                <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 hover:text-slate-500 hover:border-slate-500 transition-colors">
                  <HugeiconsIcon icon={Download01Icon} size={14} /> PDF
                </button>
              </div>
            </div>

            {/* Document Row 2 */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-slate-50 transition-colors">
              <div className="col-span-1 sm:col-span-6 flex items-center gap-3">
                <div className="bg-slate-100 p-2 rounded text-slate-400 shrink-0">
                  <HugeiconsIcon icon={File02Icon} size={16} />
                </div>
                <div>
                  <p className="text-xs font-bold text-black uppercase tracking-widest">Escrow Receipt ($500)</p>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">{pendingBooking.propertyName}</p>
                </div>
              </div>
              <div className="col-span-1 sm:col-span-3 text-xs font-bold text-slate-500">
                May 02, 2026
              </div>
              <div className="col-span-1 sm:col-span-3 flex sm:justify-end">
                <button className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-black border-b border-black pb-0.5 hover:text-slate-500 hover:border-slate-500 transition-colors">
                  <HugeiconsIcon icon={Download01Icon} size={14} /> PDF
                </button>
              </div>
            </div>

          </div>
        </section>

      </div>
    </div>
  );
}