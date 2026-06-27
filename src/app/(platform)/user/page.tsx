"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Alert02Icon,
  File02Icon,
  Key01Icon,
  Clock01Icon,
  ArrowRight01Icon,
  Building04Icon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function UserCommandCenter() {
  // Mocking the state of a user who just returned from a successful checkout
  const user = { name: "Kwame" };
  const activeTask = {
    type: "SIGN_CONTRACT",
    propertyName: "The Glasshouse Villa",
    holdExpiry: "71h 45m",
    depositPaid: "$500.00",
    image: "/images/properties/glasshouse.jpg", // Replace with your actual image path
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* === Header === */}
      <div className="mb-10">
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black mb-2">
          Welcome back, {user.name}
        </h1>
        <p className="text-sm font-medium text-zinc-500">
          Your Wunkat Command Center. Review your active ledgers and asset
          statuses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* === LEFT COLUMN: Priority Action (Span 2) === */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          {/* TASK-FIRST BLOCK: The Contract Signature */}
          <div className="bg-white border-2 border-black rounded-lg p-6 md:p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
            {/* Warning Strip */}
            <div className="absolute top-0 left-0 w-2 h-full bg-amber-400"></div>

            <div className="flex items-center gap-3 mb-6">
              <div className="bg-amber-100 text-amber-700 p-2 rounded-lg">
                <HugeiconsIcon icon={Alert02Icon} size={20} />
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-amber-700">
                Action Required
              </span>
            </div>

            <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-3">
              Execute Digital Ledger
            </h2>
            <p className="text-sm text-zinc-600 font-medium leading-relaxed mb-8 max-w-md">
              Your refundable hold for{" "}
              <strong className="text-black">{activeTask.propertyName}</strong>{" "}
              is active. Please review and digitally sign your legally binding
              Tenancy Agreement to proceed to the physical inspection.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center">
              {/* In production, this opens your PDF signature modal or page */}
              <button className="w-full sm:w-auto px-8 py-4 bg-black text-white font-black uppercase tracking-widest text-xs rounded-lg hover:bg-zinc-800 transition-colors shadow-sm shadow-black/20 flex items-center justify-center gap-2">
                <HugeiconsIcon icon={File02Icon} size={16} />
                Review & Sign Contract
              </button>

              <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                <HugeiconsIcon
                  icon={Clock01Icon}
                  size={14}
                  className="text-amber-500"
                />
                Hold Expires in:{" "}
                <span className="text-black">{activeTask.holdExpiry}</span>
              </div>
            </div>
          </div>

          {/* Access Infrastructure Panel (Locked State) */}
          <div className="bg-zinc-50/50 border border-zinc-200/60 rounded-lg p-6 md:p-8">
            <div className="flex items-center justify-between mb-6 border-b border-zinc-200/60 pb-4">
              <h3 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                <HugeiconsIcon
                  icon={Key01Icon}
                  size={18}
                  className="text-zinc-400"
                />
                Access Infrastructure
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-widest bg-zinc-200 text-zinc-500 px-2 py-1 rounded">
                Awaiting Signature
              </span>
            </div>

            <p className="text-xs font-medium text-zinc-500 leading-relaxed mb-6">
              Your Tuya Smart-Lock credentials are currently locked. Complete
              the digital ledger execution above to generate your temporary
              inspection PIN.
            </p>

            <button
              disabled
              className="w-full py-4 bg-white text-zinc-400 font-black uppercase tracking-widest text-xs border-2 border-zinc-200/60 rounded-lg cursor-not-allowed flex items-center justify-center gap-2"
            >
              Generate Temporary PIN
            </button>
          </div>
        </div>

        {/* === RIGHT COLUMN: Asset Overview === */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white border border-zinc-200/60 rounded-lg overflow-hidden shadow-sm flex flex-col">
            <div className="relative h-48 w-full bg-zinc-100/50">
              {/* Fallback styling if image doesn't load immediately */}
              <div className="absolute inset-0 flex items-center justify-center text-zinc-300">
                <HugeiconsIcon icon={Building04Icon} size={32} />
              </div>
              {/* Replace with next/image in production */}
              <img
                src={activeTask.image}
                alt={activeTask.propertyName}
                className="absolute inset-0 w-full h-full object-cover relative z-10"
              />
              <div className="absolute top-4 right-4 z-20">
                <span className="bg-white/90 backdrop-blur-sm text-black text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded shadow-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Reserved
                </span>
              </div>
            </div>

            <div className="p-6">
              <h3 className="text-base font-black uppercase tracking-tight mb-4">
                {activeTask.propertyName}
              </h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center pb-3 border-b border-zinc-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    Escrow Hold
                  </span>
                  <span className="text-xs font-black text-green-600">
                    {activeTask.depositPaid}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-zinc-200/60">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                    Verification
                  </span>
                  <span className="text-[10px] font-bold text-zinc-700 flex items-center gap-1">
                    <HugeiconsIcon
                      icon={CheckmarkBadge01Icon}
                      size={12}
                      className="text-blue-500"
                    />
                    Cleared
                  </span>
                </div>
              </div>

              <Link
                href={`/properties/glasshouse-villa`}
                className="w-full flex items-center justify-between text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors group"
              >
                View Digital Twin
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>
            </div>
          </div>

          <div className="bg-zinc-50/50 rounded-lg p-6 border border-zinc-200/60">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">
              Need Assistance?
            </h4>
            <p className="text-xs font-medium text-zinc-600 mb-4">
              Your dedicated Portfolio Manager is available to assist with your
              ledger execution.
            </p>
            <button className="text-[10px] font-bold uppercase tracking-widest border-b-[1.5px] border-black pb-0.5 hover:text-zinc-500 hover:border-slate-500 transition-colors">
              Contact Concierge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
