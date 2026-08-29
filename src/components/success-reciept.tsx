"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  CheckmarkBadge01Icon,
  PrinterIcon,
  ArrowRight01Icon,
  Shield02Icon,
  Home09Icon,
  Location01Icon
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
    month: "short",
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

  const propertyImage = transaction.listingId?.images?.[0] || "/a-1.jpg";

  // =================================================================
  // ROUTING LOGIC
  // =================================================================
  const isRenewal = transaction.paymentPurpose === "Lease_Renewal";
  const isVerified = transaction.userId?.kycStatus === "Verified";

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
    <div className="max-w-[500px] mx-auto w-full font-sans px-4 md:px-0 mt-4 md:mt-10">
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200, damping: 25 }}
        className="bg-white rounded-[32px] overflow-hidden  border border-zinc-100/80"
      >
        {/* --- PINTEREST STYLE HERO IMAGE --- */}
        <div className="relative w-full h-[280px] md:h-[340px] bg-zinc-100">
          <Image 
            src={propertyImage} 
            alt="Property" 
            fill 
            className="object-cover" 
            priority
          />
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />
          
          {/* Floating Success Pill */}
          <div className="absolute top-5 left-5 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={14} className="text-green-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-900">Payment Confirmed</span>
          </div>

          {/* Property Info at Bottom of Image */}
          <div className="absolute bottom-5 left-5 right-5 text-white">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-1.5 drop-shadow-sm line-clamp-2 leading-tight">
              {transaction.listingId?.title || "WunkatHomes Property"}
            </h1>
            <div className="flex items-center gap-1.5 text-white/90 text-[12px] font-medium drop-shadow-sm">
              <HugeiconsIcon icon={Location01Icon} size={14} />
              <span className="truncate">{locationString}</span>
            </div>
          </div>
        </div>

        {/* --- CLEAN RECEIPT DETAILS --- */}
        <div className="p-6 md:p-8">
          <div className="flex items-end justify-between mb-8 pb-6 border-b border-zinc-100">
            <div>
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                Amount Paid
              </p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter text-zinc-900">
                GHS {transaction.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1.5">
                Ref ID
              </p>
              <p className="font-mono text-[11px] font-semibold text-zinc-800 bg-zinc-100/80 px-2 py-1 rounded-md">
                {transaction.reference}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8">
            <DetailItem label="Date & Time" value={formattedDateTimeFull} />
            <DetailItem label="Payment Method" value={`Paystack (${transaction.channel || "Card"})`} />
            <DetailItem label="Transaction Type" value={isRenewal ? "Lease Extension" : "Upfront Rent"} />
            <DetailItem label="Tenant Name" value={transaction.userId?.name || "Verified User"} />
          </div>

          {/* --- ACTIONS --- */}
          <div className="flex flex-col gap-3">
            <Link
              href={continueUrl}
              className="w-full h-[52px] bg-zinc-900 text-white text-[13px] font-bold rounded-[20px] hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-md"
            >
              <span>{buttonText}</span>
              <HugeiconsIcon icon={ButtonIcon} size={16} />
            </Link>

            <button
              onClick={() => setIsViewingReceipt(true)}
              className="w-full h-[52px] bg-white border border-zinc-200/80 text-zinc-700 text-[13px] font-bold rounded-[20px] hover:bg-zinc-50 transition-colors flex items-center justify-center gap-2"
            >
              <HugeiconsIcon icon={PrinterIcon} size={16} />
              <span>View Official Receipt</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-[12px] md:text-[13px] font-semibold text-zinc-900 leading-snug break-words">
        {value}
      </p>
    </div>
  );
}
