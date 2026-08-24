"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckmarkBadge01Icon,
  PrinterIcon,
  ArrowRight01Icon,
  Shield02Icon,
  Home09Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { TransactionReceipt } from "./transaction-reciept";

interface SuccessReceiptProps {
  transaction: any;
}

export default function SuccessReceipt({ transaction }: SuccessReceiptProps) {
  const [isViewingReceipt, setIsViewingReceipt] = useState(false);

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
  // ROUTING LOGIC
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
    continueUrl = `/user/dashboard`;
    buttonText = "View Your Lease";
    ButtonIcon = Home09Icon;
  } else {
    continueUrl = `/user/leases`;
    buttonText = "Verify Identity to Continue";
    ButtonIcon = Shield02Icon;
  }

  // =====================================================================
  // INVOCATION OF THE ISOLATED RECEIPT COMPONENT
  // =====================================================================
  if (isViewingReceipt) {
    const formattedReceiptData = {
      id: transaction._id,
      reference: transaction.reference,
      amount: transaction.amount,
      currency: transaction.currency || "GHS",
      paymentPurpose: transaction.paymentPurpose,
      channel: transaction.channel || "card",
      status: transaction.status,
      createdAt: transaction.createdAt,
      paidAt: transaction.paidAt,
      user: {
        name: transaction.userId?.name || "Verified User",
        email: transaction.userId?.email || "",
      },
      listing: {
        title: transaction.listingId?.title || "WunkatHomes Property",
        property: {
          propertyType:
            transaction.listingId?.propertyId?.propertyType || "Property",
          location: locationString,
        },
      },
    };

    return (
      <TransactionReceipt
        transaction={formattedReceiptData as any}
        onBack={() => setIsViewingReceipt(false)}
      />
    );
  }

  return (
    <div className="max-w-2xl mx-auto w-full font-sans px-4 md:px-0">
      {/* --- 1. MINIMALIST HEADER --- */}
      <div className="flex flex-col items-center text-center mb-6 md:mb-10 mt-2 md:mt-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="w-8 h-8 md:w-12 md:h-12 bg-zinc-900 rounded-full flex items-center justify-center mb-3 md:mb-6 shadow-sm"
        >
          <span className="scale-75 md:scale-100 flex items-center">
            <HugeiconsIcon
              icon={CheckmarkBadge01Icon}
              size={24}
              className="text-white"
            />
          </span>
        </motion.div>

        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-2xl font-semibold tracking-tight text-zinc-900 mb-1 md:mb-2"
        >
          Payment Successful
        </motion.h1>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[10px] md:text-[13px] text-zinc-500 font-medium px-4 md:px-0"
        >
          Your payment is confirmed. You can view your receipt anytime in your
          dashboard.
        </motion.p>
      </div>

      {/* --- 2. THE LEDGER RECEIPT --- */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-white border border-zinc-200/80 rounded-lg md:rounded-lg"
      >
        {/* Top Amount Banner */}
        <div className="p-5 md:p-10 border-b border-zinc-200/60 flex flex-col items-center justify-center">
          <p className="text-[8px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5 md:mb-3">
            Total Amount Paid
          </p>
          <h2 className="text-2xl md:text-4xl font-light tracking-tighter text-zinc-900">
            GHS{" "}
            {transaction.amount?.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </h2>
          <div className="mt-2 md:mt-4 flex items-center gap-1.5 px-2 py-0.5 md:px-3 md:py-1 bg-green-50 rounded-full border border-green-100/50">
            <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-green-700">
              Verified
            </span>
          </div>
        </div>

        <div className="p-5 md:p-10 space-y-5 md:space-y-8">
          {/* Section: Transaction Specs */}
          <div className="space-y-3 md:space-y-4">
            <ReceiptRow
              label="Reference ID"
              value={transaction.reference}
              isMono
            />
            <ReceiptRow label="Date & Time" value={formattedDateTimeFull} />
            <ReceiptRow
              label="Payment Method"
              value={`Paystack (${transaction.channel || "Secure Gateway"})`}
            />
            <ReceiptRow
              label="Transaction Type"
              value={isRenewal ? "Lease Extension" : "Upfront Rent"}
            />
          </div>

          <div className="w-full h-px bg-zinc-100/50" />

          {/* Section: Property & User Specs */}
          <div className="space-y-3 md:space-y-4">
            <ReceiptRow
              label={isRenewal ? "Renewal Property" : "Reserved Property"}
              value={transaction.listingId?.title || "WunkatHomes Property"}
              subValue={locationString}
            />
            <ReceiptRow
              label="Tenant Name"
              value={transaction.userId?.name || "Verified User"}
            />
            <ReceiptRow
              label="Contact Email"
              value={transaction.userId?.email || "N/A"}
            />
          </div>

          <div className="w-full h-px bg-zinc-100/50" />

          {/* Section: Breakdown */}
          <div className="space-y-3 md:space-y-4">
            <ReceiptRow
              label="Subtotal"
              value={`GHS ${transaction.amount?.toLocaleString()}`}
            />
            <ReceiptRow
              label="Platform & Agency Fees"
              value="Free"
              valueClass="text-zinc-400"
            />
          </div>
        </div>
      </motion.div>

      {/* --- 3. ACTIONS --- */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-2 md:gap-3 mt-4 md:mt-8 w-full box-border"
      >
        <button
          onClick={() => setIsViewingReceipt(true)}
          className="w-full sm:flex-1 min-w-0 box-border h-10 md:h-12 px-2 bg-white border border-zinc-200/60 text-zinc-700 text-[10px] md:text-[13px] font-semibold rounded-lg md:rounded-lg hover:bg-zinc-50 transition-colors flex items-center justify-center gap-1.5 md:gap-2 truncate"
        >
          <span className="scale-75 md:scale-100 flex items-center shrink-0">
            <HugeiconsIcon icon={PrinterIcon} size={16} />
          </span>
          <span className="truncate">View Official Receipt</span>
        </button>

        <Link
          href={continueUrl}
          className="w-full sm:flex-1 min-w-0 box-border h-10 md:h-12 px-2 bg-zinc-900 text-white text-[10px] md:text-[13px] font-semibold rounded-lg md:rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5 md:gap-2 shadow-sm truncate"
        >
          <span className="truncate">{buttonText}</span>
          <span className="scale-75 md:scale-100 flex items-center shrink-0">
            <HugeiconsIcon icon={ButtonIcon} size={16} />
          </span>
        </Link>
      </motion.div>
    </div>
  );
}

// --- HELPER COMPONENT FOR CLEAN LEDGER ROWS ---
function ReceiptRow({
  label,
  value,
  subValue,
  isMono = false,
  valueClass = "text-zinc-900",
}: {
  label: string;
  value: string;
  subValue?: string;
  isMono?: boolean;
  valueClass?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-2 md:gap-4">
      <span className="text-[9px] md:text-[12px] font-medium text-zinc-500 mt-0.5 shrink-0">
        {label}
      </span>
      <div className="text-right min-w-0">
        <span
          className={`block text-[10px] md:text-[13px] ${isMono ? "font-mono font-medium tracking-tight" : "font-semibold"} ${valueClass} break-words`}
        >
          {value}
        </span>
        {subValue && (
          <span className="block text-[8px] md:text-[11px] text-zinc-400 mt-0.5 font-medium break-words">
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}
