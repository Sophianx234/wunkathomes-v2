"use client";

import React from "react";
import { ArrowLeft01Icon, PrinterIcon, Building03Icon, Shield02Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

// --- TYPES ---
export interface ReceiptData {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  paymentPurpose: string;
  channel: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  user: {
    name: string;
    email: string;
  };
  listing: {
    title: string;
    property: { propertyType: string; location: string };
  };
}

export interface TransactionReceiptProps {
  transaction: ReceiptData;
  onBack: () => void;
}

// --- UTILS ---
const formatCurrency = (amount: number, currency: string = "GHS") => {
  const symbol = currency === "GHS" ? "GHS " : `${currency} `;
  return symbol + amount.toLocaleString(undefined, { minimumFractionDigits: 2 });
};

const formatDateFull = (dateString: string) => {
  const d = new Date(dateString);
  return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })} at ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
};

export function TransactionReceipt({ transaction, onBack }: TransactionReceiptProps) {
  const isSuccess = transaction.status === "Success";
  const dateStr = formatDateFull(transaction.paidAt || transaction.createdAt);

  return (
    <div className="min-h-screen bg-zinc-50/50 font-sans print:bg-white pb-10 md:pb-20 w-full overflow-x-hidden box-border">
      
      {/* PRINT STYLES */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print { 
            body { background-color: white !important; -webkit-print-color-adjust: exact; } 
            .print-hide { display: none !important; } 
            @page { margin: 1cm; } 
          }`,
        }}
      />

      {/* TOP NAVIGATION BAR (Hidden during printing) */}
      <div className="print-hide sticky top-0 z-10 flex items-center justify-between p-3 md:p-4 bg-white/80 backdrop-blur-xl border-b border-zinc-100 shadow-sm w-full box-border">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-zinc-600 hover:text-zinc-900 px-2 md:px-4 h-10 shrink-0 rounded-xl"
          >
            <span className="scale-75 md:scale-100 flex items-center md:mr-2">
              <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
            </span>
            <span className="hidden sm:inline text-[13px] font-bold">Back</span>
          </Button>
        </div>
        <Button
          onClick={() => window.print()}
          className="bg-zinc-900 text-white hover:bg-zinc-800 h-10 px-4 md:px-6 text-[11px] md:text-[13px] font-bold rounded-[14px] shadow-sm shrink-0 flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <HugeiconsIcon icon={PrinterIcon} size={16} />
          <span className="hidden sm:inline">Save as PDF</span>
          <span className="sm:hidden">Print</span>
        </Button>
      </div>

      {/* RECEIPT BODY */}
      <div className="max-w-[800px] mx-auto mt-6 md:mt-12 print:mt-0 p-4 md:p-0 w-full box-border">
        
        {/* The Digital Certificate Card */}
        <div className="bg-white border border-zinc-100 rounded-[32px] shadow overflow-hidden print:border-none print:shadow-none print:rounded-none w-full">
          
          {/* Header */}
          <div className="p-8 md:p-12 flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-zinc-100 print:border-zinc-200">
            <div>
              <div className="h-14 w-14 relative  overflow-hidden mb-5  flex items-center justify-center ">
                <Image src={'/images/home.png'} alt="WunkatHomes" fill className="object-cover" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-900 mb-1">
                WunkatHomes Ltd.
              </h1>
              <p className="text-[12px] md:text-[13px] text-zinc-500 font-medium">
                Official Payment Receipt
              </p>
            </div>
            
            <div className="text-left md:text-right flex flex-col md:items-start print:items-start">
               <p className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Date Issued</p>
               <p className="text-[13px] md:text-[14px] font-semibold text-zinc-900 mb-3">{dateStr}</p>
               
               <p className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">Transaction Ref</p>
               <p className="font-mono text-[11px] md:text-[12px] font-bold text-zinc-600 bg-zinc-50 px-2.5 py-1.5 rounded-lg border border-zinc-100 inline-block print:border-none print:px-0">
                 {transaction.reference}
               </p>
            </div>
          </div>

          {/* Amount Showcase */}
          <div className="p-8 md:p-16 bg-zinc-50/50 print:bg-white flex flex-col items-center justify-center text-center">
            <p className="text-[10px] md:text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Total Amount Paid</p>
            <h2 className={`text-4xl md:text-6xl font-black tracking-tighter ${isSuccess ? "text-zinc-900" : "text-zinc-400 line-through"}`}>
              {formatCurrency(transaction.amount, transaction.currency)}
            </h2>
            <div className={`mt-5 px-4 py-1.5 text-[11px] md:text-[12px] font-bold uppercase tracking-widest rounded-full  flex items-center gap-1.5 ${
              isSuccess ? "" 
              : transaction.status === "Pending" ? ""
              : ""
            }`}>
              {transaction.status}
            </div>
          </div>

          {/* Entities Grid */}
          <div className="p-8 md:p-12 border-t border-zinc-100 print:border-zinc-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10 md:mb-14">
               {/* Billed To Box */}
               <div className="bg-white md:bg-zinc-50 rounded-[24px] md:p-6 md:border border-zinc-100 print:border-none print:p-0 print:bg-white">
                 <h3 className="text-[10px] md:text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Billed To</h3>
                 <p className="text-[15px] md:text-[17px] font-bold text-zinc-900 mb-1.5 truncate">{transaction.user.name}</p>
                 <p className="text-[13px] md:text-[14px] text-zinc-500 font-medium truncate">{transaction.user.email}</p>
               </div>
               
               {/* Property Box */}
               <div className="bg-white md:bg-zinc-50 rounded-[24px] md:p-6 md:border border-zinc-100 print:border-none print:p-0 print:bg-white">
                 <h3 className="text-[10px] md:text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Property / Asset</h3>
                 <p className="text-[15px] md:text-[17px] font-bold text-zinc-900 mb-1.5 truncate">{transaction.listing.title}</p>
                 <p className="text-[13px] md:text-[14px] text-zinc-500 font-medium truncate">{transaction.listing.property.location}</p>
                 <p className="text-[11px] md:text-[12px] text-zinc-400 font-bold mt-3 capitalize bg-white md:bg-zinc-100/80 px-2 py-1 rounded-md inline-block print:px-0 print:bg-white">
                   Asset Type: {transaction.listing.property.propertyType.replace("_", " ")}
                 </p>
               </div>
            </div>

            {/* Line Items / Details */}
            <div className="space-y-4 max-w-2xl mx-auto">
              <h3 className="text-[10px] md:text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4 border-b border-zinc-100 pb-3 print:border-zinc-200">Payment Breakdown</h3>
              <div className="flex justify-between items-center py-2.5 border-b border-zinc-50 print:border-zinc-100">
                 <span className="text-[13px] md:text-[14px] font-semibold text-zinc-500">Payment Method</span>
                 <span className="text-[13px] md:text-[14px] font-bold text-zinc-900 capitalize">{transaction.channel.replace("_", " ")}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 border-b border-zinc-50 print:border-zinc-100">
                 <span className="text-[13px] md:text-[14px] font-semibold text-zinc-500">Payment Purpose</span>
                 <span className="text-[13px] md:text-[14px] font-bold text-zinc-900 capitalize">{transaction.paymentPurpose.replace(/_/g, " ")}</span>
              </div>
              <div className="flex justify-between items-center py-2.5 pt-4">
                 <span className="text-[14px] md:text-[15px] font-bold text-zinc-900">Total</span>
                 <span className="text-[14px] md:text-[15px] font-black text-zinc-900">{formatCurrency(transaction.amount, transaction.currency)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-8 md:p-12 border-t border-zinc-100 bg-zinc-50/50 print:bg-white print:border-zinc-200 text-center">
             <p className="text-[11px] md:text-[13px] font-medium text-zinc-500 leading-relaxed max-w-md mx-auto">
               If you have any questions regarding this official receipt, please contact support at <span className="font-bold text-zinc-900">support@wunkathomes.com</span>.
             </p>
             <div className="mt-8 pt-6 border-t border-zinc-200/60 print:border-zinc-200">
               <p className="text-[9px] md:text-[10px] font-bold text-zinc-400 tracking-widest uppercase flex items-center justify-center gap-1.5">
                  Generated Securely by WunkatHomes
               </p>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}
