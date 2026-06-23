"use client";

import { 
  CreditCardIcon, 
  ArrowDownLeft01Icon, 
  ArrowUpRight01Icon, 
  Download01Icon,
  Refresh,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function FinancialLedgerPage() {
  // Mock Data: Fetch this from your database (Paystack webhooks should populate this)
  const transactions = [
    {
      id: "txn_8942301",
      date: "May 02, 2026",
      amount: "$11,500.00",
      type: "WIRE_TRANSFER",
      description: "Annual Balance Clearance",
      property: "The Glasshouse Villa",
      status: "CLEARED" // CLEARED, PENDING, REFUNDED
    },
    {
      id: "txn_8942250",
      date: "May 01, 2026",
      amount: "$500.00",
      type: "CARD_PAYMENT",
      description: "Refundable Hold",
      property: "The Glasshouse Villa",
      status: "CLEARED"
    },
    {
      id: "txn_8941002",
      date: "Apr 15, 2026",
      amount: "$500.00",
      type: "MOBILE_MONEY",
      description: "Refundable Hold",
      property: "Cantonments Penthouse",
      status: "REFUNDED"
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CLEARED':
        return (
          <span className="flex items-center gap-1 pb-8 text-[10px] font-bold uppercase tracking-widest bg-green-50 text-green-700 px-2 py-1 rounded border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Cleared
          </span>
        );
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-amber-50 text-amber-700 px-2 py-1 rounded border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span> Processing
          </span>
        );
      case 'REFUNDED':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest bg-zinc-100/50 text-zinc-500 px-2 py-1 rounded border border-zinc-200/60">
            <HugeiconsIcon icon={Refresh} size={10} /> Refunded
          </span>
        );
      default:
        return null;
    }
  };

  const getTransactionIcon = (type: string, status: string) => {
    if (status === 'REFUNDED') {
      return <HugeiconsIcon icon={ArrowUpRight01Icon} size={18} className="text-zinc-400" />;
    }
    return <HugeiconsIcon icon={ArrowDownLeft01Icon} size={18} className="text-green-600" />;
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* === Header === */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/10 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black mb-2">
            Financial Ledger
          </h1>
          <p className="text-sm font-medium text-zinc-500">
            A permanent, secure record of your WunkatHomes transactions and escrow holds.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-400">
          <HugeiconsIcon icon={CreditCardIcon} size={16} />
          Secured via Paystack
        </div>
      </div>

      {/* === The Ledger Table === */}
      <div className="bg-white border-2 border-black rounded-lg shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        
        {/* Table Header (Hidden on Mobile) */}
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-zinc-50/50 border-b border-black/10 text-[10px] font-black uppercase tracking-widest text-zinc-400">
          <div className="col-span-5">Transaction Details</div>
          <div className="col-span-2 text-left">Date</div>
          <div className="col-span-2 text-left">Status</div>
          <div className="col-span-3 text-right">Amount</div>
        </div>

        {/* Ledger Rows */}
        <div className="flex flex-col divide-y divide-slate-100">
          {transactions.map((txn) => (
            <div key={txn.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 items-center hover:bg-zinc-50/50 transition-colors group">
              
              {/* Context (Left) */}
              <div className="col-span-1 md:col-span-5 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${txn.status === 'REFUNDED' ? 'bg-zinc-50/50 border-zinc-200/60' : 'bg-green-50 border-green-100'}`}>
                  {getTransactionIcon(txn.type, txn.status)}
                </div>
                <div>
                  <p className="text-sm font-black uppercase tracking-tight text-black line-clamp-1">
                    {txn.description}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                      {txn.property}
                    </span>
                    <span className="text-[10px] text-zinc-300 hidden sm:inline">•</span>
                    <span className="text-[9px] font-mono text-zinc-400 hidden sm:inline">
                      {txn.id}
                    </span>
                  </div>
                </div>
              </div>

              {/* Date (Middle) */}
              <div className="col-span-1 md:col-span-2 hidden md:block text-xs font-bold text-zinc-500">
                {txn.date}
              </div>

              {/* Status (Middle) */}
              <div className="col-span-1 md:col-span-2 flex md:block">
                {getStatusBadge(txn.status)}
              </div>

              {/* Amount & Actions (Right) */}
              <div className="col-span-1 md:col-span-3 flex items-center justify-between md:justify-end gap-6 mt-2 md:mt-0 pt-4 md:pt-0 border-t border-zinc-200/60 md:border-none">
                <span className={`text-base font-black tracking-tight ${txn.status === 'REFUNDED' ? 'text-zinc-400 line-through' : 'text-black'}`}>
                  {txn.amount}
                </span>
                
                {/* Download Receipt Button */}
                {txn.status === 'CLEARED' && (
                  <button className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200/60 text-zinc-500 hover:text-black hover:border-black hover:bg-zinc-100/50 transition-all">
                    <HugeiconsIcon icon={Download01Icon} size={14} />
                  </button>
                )}
              </div>

            </div>
          ))}
        </div>

      </div>

      {/* Footer Trust Note */}
      <p className="text-[10px] text-center font-bold text-zinc-400 uppercase tracking-widest leading-relaxed mt-8">
        Need help with a transaction? <br />
        Contact your <span className="text-black border-b border-black cursor-pointer">Portfolio Manager</span> or Wunkat Support.
      </p>

    </div>
  );
}
