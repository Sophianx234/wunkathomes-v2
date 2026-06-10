"use client";

import React from "react";
import { ArrowLeft01Icon, PrinterIcon, ArrowUpRight01Icon, Building03Icon } from "@hugeicons/core-free-icons";
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
const formatCurrency = (amount: number, currency: string = "GHS") =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency }).format(amount);

const formatDateFull = (dateString: string) => {
  const d = new Date(dateString);
  return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" })} at ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
};

export function TransactionReceipt({ transaction, onBack }: TransactionReceiptProps) {
  const isSuccess = transaction.status === "Success";

  return (
    <div className="min-h-screen bg-[#FAFAFA] font-sans print:bg-white pb-20">
      
      {/* PRINT STYLES */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print { 
            body { background-color: white !important; -webkit-print-color-adjust: exact; } 
            .print-hide { display: none !important; } 
            @page { margin: 2cm; } 
          }`,
        }}
      />

      {/* TOP NAVIGATION BAR (Hidden during printing) */}
      <div className="print-hide sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-zinc-200/60 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-zinc-600 hover:text-zinc-900"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={18} className="mr-2" />
            Back to Transactions
          </Button>
          <div className="h-4 w-px bg-zinc-200" />
          <h3 className="font-bold text-zinc-800 text-[13px] uppercase tracking-widest">
            Payment Receipt
          </h3>
        </div>
        <Button
          onClick={() => window.print()}
          className="bg-zinc-900 text-white hover:bg-zinc-800 h-9 px-6 text-[12px] font-bold uppercase tracking-wider rounded-lg shadow-sm"
        >
          <HugeiconsIcon icon={PrinterIcon} size={16} className="mr-2" />
          Print / Save PDF
        </Button>
      </div>

      {/* RECEIPT BODY */}
      <div className="max-w-2xl mx-auto mt-10 print:mt-0 p-6 md:p-0">
        
        {/* The Receipt "Slip" */}
        <div className="bg-white border border-zinc-200/80 rounded-2xl shadow-[0_2px_12px_-4px_rgba(0,0,0,0.06)] overflow-hidden print:border-none print:shadow-none print:rounded-none">
          
          {/* Header */}
          <div className="p-8 md:p-10 md:pb-4 border-b border-zinc-200/80 flex flex-col items-center text-center bg-zinc-50/50 print:bg-white">
            <div className="h-12 w-12 relative  rounded-xl flex items-center justify-center mb-6">
              <Image src={'/images/home.png'} alt="WunkatHomes" fill className="text-white object-cover" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-900">
              WunkatHomes Ltd.
            </h1>
            <p className="text-[13px] text-zinc-500 mt-1">
              Payment Receipt
            </p>

            <div className="mt-8 mb-2">
              <p className="text-[12px] font-bold text-zinc-400 uppercase tracking-widest mb-2">
                Amount Paid
              </p>
              <p className={`text-4xl font-semibold tracking-tighter font-tabular-nums ${isSuccess ? "text-zinc-900" : "text-zinc-400 line-through"}`}>
                {formatCurrency(transaction.amount, transaction.currency)}
              </p>
            </div>

            {/* Status Badge */}
            <div className={`mt-4 px-3 py-1 text-[11px] font-bold uppercase tracking-widest rounded-full border ${
              isSuccess ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
              : transaction.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
            }`}>
              {transaction.status}
            </div>
          </div>

          {/* Details Section */}
          <div className="p-8 md:p-10 space-y-8">
            
            <section>
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
                Transaction Details
              </h3>
              <dl className="space-y-4 text-[14px]">
                <div className="flex justify-between items-start border-b border-zinc-100 pb-4">
                  <dt className="text-zinc-500 font-medium">Reference ID</dt>
                  <dd className="font-mono text-zinc-900 font-medium text-right break-all max-w-[200px]">
                    {transaction.reference}
                  </dd>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                  <dt className="text-zinc-500 font-medium">Date & Time</dt>
                  <dd className="text-zinc-900 font-medium text-right font-tabular-nums">
                    {formatDateFull(transaction.paidAt || transaction.createdAt)}
                  </dd>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                  <dt className="text-zinc-500 font-medium">Payment Method</dt>
                  <dd className="text-zinc-900 font-medium text-right capitalize">
                    {transaction.channel.replace("_", " ")}
                  </dd>
                </div>
                <div className="flex justify-between items-center border-b border-zinc-100 pb-4">
                  <dt className="text-zinc-500 font-medium">Payment Purpose</dt>
                  <dd className="text-zinc-900 font-medium text-right capitalize">
                    {transaction.paymentPurpose.replace(/_/g, " ")}
                  </dd>
                </div>
              </dl>
            </section>

            <section>
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4 mt-8">
                Billed To
              </h3>
              <div className="bg-zinc-50/80 p-5 rounded-xl border border-zinc-200/60 print:border-none print:p-0 print:bg-white">
                <p className="text-[14px] font-semibold text-zinc-900 mb-1">
                  {transaction.user.name}
                </p>
                <p className="text-[13px] text-zinc-500">
                  {transaction.user.email}
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4 mt-8">
                Associated Property
              </h3>
              <div className="flex items-start justify-between bg-zinc-50/80 p-5 rounded-xl border border-zinc-200/60 print:border-none print:p-0 print:bg-white">
                <div className="flex-1 pr-4">
                  <p className="text-[14px] font-semibold text-zinc-900 mb-1">
                    {transaction.listing.title}
                  </p>
                  <p className="text-[13px] text-zinc-500">
                    {transaction.listing.property.location}
                  </p>
                  <p className="text-[11px] text-zinc-400 font-medium mt-2 capitalize">
                    Asset Type: {transaction.listing.property.propertyType.replace("_", " ")}
                  </p>
                </div>
              </div>
            </section>

          </div>
          
          {/* Footer */}
          <div className="p-8 md:p-10 border-t border-zinc-200/80 bg-zinc-50/50 print:bg-white print:pt-4 text-center">
             <p className="text-[12px] text-zinc-500 leading-relaxed max-w-md mx-auto">
               If you have any questions about this receipt, please contact support at <span className="font-semibold text-zinc-700">support@wunkathomes.com</span>.
             </p>
             <p className="text-[10px] font-mono text-zinc-400 mt-6 tracking-widest uppercase">
               Generated securely by WunkatHomes Sys.
             </p>
          </div>

        </div>
      </div>
    </div>
  );
}