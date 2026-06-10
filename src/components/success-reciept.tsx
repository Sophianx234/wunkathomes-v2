"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckmarkBadge01Icon,
  PrinterIcon,
  ArrowRight01Icon,
  Shield02Icon,
  Home09Icon 
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import PrintReceipt from "./print-reciept";

interface SuccessReceiptProps {
  transaction: any;
}

export default function SuccessReceipt({ transaction }: SuccessReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  const formattedDateTimeFull = new Date(
    transaction.paidAt || transaction.createdAt,
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const loc = transaction.listingId?.propertyId?.location;
  const locationString = loc
    ? typeof loc === "string"
      ? loc
      : `${loc.area}, ${loc.city || loc.region}`
    : "Accra, Ghana";

  // =================================================================
  // ROUTING LOGIC (Maintained exactly as is)
  // =================================================================
  const isRenewal = transaction.paymentPurpose === "Lease_Renewal";
  const isVerified = transaction.userId?.kycStatus === "Verified";
  const targetLeaseId = transaction.leaseId || "";

  let continueUrl = "";
  let buttonText = "";
  let ButtonIcon = ArrowRight01Icon;

  if (isRenewal) {
    continueUrl = "/user/dashboard";
    buttonText = "Return to Dashboard";
    ButtonIcon = Home09Icon;
  } else if (isVerified) {
    continueUrl = `/user/sign-lease?leaseId=${targetLeaseId}`;
    buttonText = "Sign Tenancy Agreement";
    ButtonIcon = ArrowRight01Icon;
  } else {
    continueUrl = `/user/leases`;
    buttonText = "Verify Identity to Continue";
    ButtonIcon = Shield02Icon;
  }

  return (
    <>
      <div className="max-w-2xl mx-auto w-full print:hidden font-sans">
        
        {/* --- 1. MINIMALIST HEADER --- */}
        <div className="flex flex-col items-center text-center mb-10 mt-4">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-6 shadow-sm"
          >
            <HugeiconsIcon
              icon={CheckmarkBadge01Icon}
              size={24}
              className="text-white"
            />
          </motion.div>

          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-2xl font-semibold tracking-tight text-zinc-900 mb-2"
          >
            Payment Successful
          </motion.h1>

          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[13px] text-zinc-500 font-medium"
          >
            Your payment is confirmed. You can view your receipt anytime in your dashboard.
          </motion.p>
        </div>

        {/* --- 2. THE LEDGER RECEIPT --- */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-zinc-200/80 rounded-2xl "
        >
          {/* Top Amount Banner */}
          <div className="p-8 md:p-10 border-b border-zinc-100 flex flex-col items-center justify-center">
            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
              Total Amount Paid
            </p>
            <h2 className="text-4xl font-light tracking-tighter text-zinc-900">
              GHS {transaction.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </h2>
            <div className="mt-4 flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full border border-green-100/50">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-green-700">Verified</span>
            </div>
          </div>

          <div className="p-8 md:p-10 space-y-8">
            
            {/* Section: Transaction Specs */}
            <div className="space-y-4">
              <ReceiptRow label="Reference ID" value={transaction.reference} isMono />
              <ReceiptRow label="Date & Time" value={formattedDateTimeFull} />
              <ReceiptRow label="Payment Method" value={`Paystack (${transaction.channel || "Secure Gateway"})`} />
              <ReceiptRow label="Transaction Type" value={isRenewal ? "Lease Extension" : "Upfront Rent"} />
            </div>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section: Property & User Specs */}
            <div className="space-y-4">
              <ReceiptRow 
                label={isRenewal ? "Renewal Property" : "Reserved Property"} 
                value={transaction.listingId?.title || "WunkatHomes Property"} 
                subValue={locationString} 
              />
              <ReceiptRow label="Tenant Name" value={transaction.userId?.name || "Verified User"} />
              <ReceiptRow label="Contact Email" value={transaction.userId?.email || "N/A"} />
            </div>

            <div className="w-full h-px bg-zinc-100" />

            {/* Section: Breakdown */}
            <div className="space-y-4">
              <ReceiptRow label="Subtotal" value={`GHS ${transaction.amount?.toLocaleString()}`} />
              <ReceiptRow label="Platform & Agency Fees" value="Free" valueClass="text-zinc-400" />
            </div>

          </div>
        </motion.div>

        {/* --- 3. ACTIONS --- */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 mt-8"
        >
          <button
            onClick={handlePrint}
            className="flex-1 h-12 bg-white border border-zinc-200 text-zinc-700 text-[13px] font-semibold rounded-xl hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2"
          >
            <HugeiconsIcon icon={PrinterIcon} size={16} /> Download Receipt
          </button>
          
          <Link
            href={continueUrl}
            className="flex-1 h-12 bg-zinc-900 text-white text-[13px] font-semibold rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {buttonText}
            <HugeiconsIcon icon={ButtonIcon} size={16} />
          </Link>
        </motion.div>
      </div>

      <PrintReceipt transaction={transaction} />
    </>
  );
}

// --- HELPER COMPONENT FOR CLEAN LEDGER ROWS ---
function ReceiptRow({ 
  label, 
  value, 
  subValue, 
  isMono = false,
  valueClass = "text-zinc-900"
}: { 
  label: string; 
  value: string; 
  subValue?: string; 
  isMono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-[12px] font-medium text-zinc-500 mt-0.5">{label}</span>
      <div className="text-right">
        <span className={`block text-[13px] ${isMono ? 'font-mono font-medium tracking-tight' : 'font-semibold'} ${valueClass}`}>
          {value}
        </span>
        {subValue && (
          <span className="block text-[11px] text-zinc-400 mt-0.5 font-medium">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}