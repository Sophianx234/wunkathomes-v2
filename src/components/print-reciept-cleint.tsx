"use client";

import React from "react";
import {
  TickDouble02Icon,
  CreditCardIcon,
  SmartPhone01Icon,
  UniversityIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export interface UserTransaction {
  id: string;
  reference: string;
  createdAt: string;
  paidAt: string | null;
  amount: number;
  currency: string;
  paymentPurpose: string;
  channel: string;
  status: string;
  propertyTitle: string;
  propertyImage?: string;
  propertyLocation: string;
  userName: string;
  userEmail: string;
}

interface PrintReceiptProps {
  transaction: UserTransaction;
  isPrintView?: boolean;
}

export default function PrintReceipt({
  transaction,
  isPrintView = false,
}: PrintReceiptProps) {
  const dateToUse = transaction.paidAt || transaction.createdAt;

  const formattedDate = new Date(dateToUse).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = new Date(dateToUse).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Determine the outermost classes based on where it's being rendered
  const wrapperClasses = isPrintView
    ? "hidden print:block" 
    : "block print:hidden"; 

  return (
    <>
      {isPrintView && (
        <style
          dangerouslySetInnerHTML={{
            __html: `
            @media print {
              @page { size: auto; margin: 15mm; }
              html, body {
                height: auto !important;
                background-color: white !important;
              }
              header, nav, footer { display: none !important; }
              #isolated-print-receipt {
                display: block !important;
                width: 100% !important;
                max-width: 800px !important;
                margin: 0 auto !important;
              }
            }
          `,
          }}
        />
      )}

      {/* Outer Wrapper */}
      <div
        id={isPrintView ? "isolated-print-receipt" : undefined}
        className={`${wrapperClasses} w-full max-w-2xl mx-auto font-sans text-zinc-900 bg-white`}
      >
        <div className={`p-8 md:p-12 ${!isPrintView ? "border border-zinc-200 rounded-xl shadow-sm" : ""}`}>
          
          {/* HEADER: Logo & Status */}
          <div className="flex justify-between items-start mb-16">
            <div>
              <h1 className="text-2xl font-bold tracking-tight mb-1">WunkatHomes Ltd.</h1>
              <p className="text-[13px] text-zinc-500 font-medium">Official Payment Receipt</p>
            </div>
            
            <div className="text-right">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${transaction.status === 'Success' ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'}`}>
                <HugeiconsIcon
                  icon={transaction.status === "Success" ? TickDouble02Icon : UniversityIcon}
                  size={14}
                />
                <span className="text-[11px] font-bold uppercase tracking-widest">
                  {transaction.status}
                </span>
              </div>
            </div>
          </div>

          {/* TOTAL AMOUNT BANNED */}
          <div className="mb-12">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-zinc-400 mb-2">Amount Paid</p>
            <h2 className="text-5xl font-light tracking-tighter text-zinc-900">
              {new Intl.NumberFormat("en-GH", {
                style: "currency",
                currency: transaction.currency,
              }).format(transaction.amount)}
            </h2>
          </div>

          {/* TWO COLUMN GRID FOR DETAILS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 mb-12">
            
            <div className="space-y-6">
              <ReceiptRow label="Date Paid" value={`${formattedDate} at ${formattedTime}`} />
              <ReceiptRow label="Payment Method" value={`Paystack (${transaction.channel || "Gateway"})`} />
              
              <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-3">
                <span className="text-[12px] font-semibold text-zinc-500 mt-0.5 uppercase tracking-wider">Channel</span>
                <div className="flex items-center gap-2">
                  {transaction.channel === "mobile_money" ? (
                    <HugeiconsIcon icon={SmartPhone01Icon} size={16} className="text-zinc-400" />
                  ) : (
                    <HugeiconsIcon icon={CreditCardIcon} size={16} className="text-zinc-400" />
                  )}
                  <span className="block text-[13px] font-medium text-zinc-900 capitalize">
                    {transaction.channel?.replace("_", " ") || "Secure Web"}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <ReceiptRow label="Receipt Number" value={transaction.reference} isMono />
              <ReceiptRow label="Transaction ID" value={transaction.id} isMono />
              <ReceiptRow label="Payment Purpose" value={transaction.paymentPurpose?.replace("_", " ")} />
            </div>

          </div>

          <div className="w-full h-px bg-zinc-200 mb-12" />

          {/* BILLED TO / FOR SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4">Billed To</p>
              <p className="text-[14px] font-semibold text-zinc-900 mb-1">{transaction.userName}</p>
              <p className="text-[13px] text-zinc-500">{transaction.userEmail}</p>
            </div>

            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-400 mb-4">For Property</p>
              <p className="text-[14px] font-semibold text-zinc-900 mb-1">{transaction.propertyTitle}</p>
              <p className="text-[13px] text-zinc-500">{transaction.propertyLocation}</p>
            </div>

          </div>

          {/* FOOTER */}
          <div className="mt-16 pt-8 border-t border-zinc-100 text-center">
            <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-medium">
              This receipt is computer generated and serves as official proof of payment.
            </p>
          </div>

        </div>
      </div>
    </>
  );
}

// Internal Helper Component for clean, aligned rows
function ReceiptRow({ label, value, isMono = false }: { label: string; value: string; isMono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-zinc-100 pb-3">
      <span className="text-[12px] font-semibold text-zinc-500 mt-0.5 uppercase tracking-wider">{label}</span>
      <span className={`text-[13px] font-medium text-zinc-900 text-right ${isMono ? 'font-mono tracking-tight text-[12px]' : ''}`}>
        {value}
      </span>
    </div>
  );
}
