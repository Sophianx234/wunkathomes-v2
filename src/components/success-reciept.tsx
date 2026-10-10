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
    continueUrl = `/user/dashboard`;
    buttonText = "Continue to Dashboard";
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
    <div className="w-full min-h-screen flex flex-col bg-zinc-50/50 font-sans">
      {/* --- FULL BLEED PINTEREST STYLE HERO IMAGE --- */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative w-full h-[40vh] min-h-[350px] md:h-[50vh] bg-zinc-200"
      >
        <Image 
          src={propertyImage} 
          alt="Property" 
          fill 
          className="object-cover" 
          priority
        />
        {/* Gradient Overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
        
        {/* Floating Success Pill */}
        <div className="absolute top-6 left-6 md:top-10 md:left-10 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
          <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} className="text-green-600" />
          <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-900">Payment Confirmed</span>
        </div>

        {/* Property Info at Bottom of Image */}
        <div className="absolute inset-x-0 bottom-0 pb-6 md:pb-12">
          <div className="max-w-5xl mx-auto px-6 md:px-10 w-full text-white">
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black tracking-tight mb-2 md:mb-4 drop-shadow-sm line-clamp-2 leading-tight">
              {transaction.listingId?.title || "WunkatHomes Property"}
            </h1>
            <div className="flex items-center gap-2 text-white/90 text-sm md:text-lg font-medium drop-shadow-sm">
              <HugeiconsIcon icon={Location01Icon} size={18} />
              <span className="truncate">{locationString}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* --- DIRECT PAGE CONTENT (NO CARD) --- */}
      <div className="max-w-5xl mx-auto w-full px-6 md:px-10 py-10 md:py-16">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 25 }}
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pb-10 border-b border-zinc-200/80 gap-6">
            <div>
              <p className="text-xs md:text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Amount Paid
              </p>
              <h2 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tighter text-zinc-900">
                GHS {transaction.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="md:text-right">
              <p className="text-xs md:text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">
                Ref ID
              </p>
              <p className="font-mono text-sm font-bold text-zinc-800 bg-zinc-200/50 px-3 py-1.5 rounded-lg inline-block">
                {transaction.reference}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-8 mb-16">
            <DetailItem label="Date & Time" value={formattedDateTimeFull} />
            <DetailItem label="Payment Method" value={`Paystack (${transaction.channel || "Card"})`} />
            <DetailItem label="Transaction Type" value={isRenewal ? "Lease Extension" : "Upfront Rent"} />
            <DetailItem label="Tenant Name" value={transaction.userId?.name || "Verified User"} />
          </div>

          {/* --- ACTIONS --- */}
          <div className="flex flex-col sm:flex-row items-center gap-4 max-w-2xl">
            <Link
              href={continueUrl}
              className="w-full h-14 bg-zinc-900 text-white text-sm font-bold rounded-2xl hover:bg-black transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95"
            >
              <span>{buttonText}</span>
              <HugeiconsIcon icon={ButtonIcon} size={18} />
            </Link>

            <button
              onClick={() => setIsViewingReceipt(true)}
              className="w-full h-14 bg-transparent border-2 border-zinc-200 text-zinc-700 text-sm font-bold rounded-2xl hover:border-zinc-300 hover:bg-white transition-all flex items-center justify-center gap-2"
            >
              <HugeiconsIcon icon={PrinterIcon} size={18} />
              <span>View Official Receipt</span>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1.5">
        {label}
      </p>
      <p className="text-sm md:text-base font-bold text-zinc-900 leading-snug break-words">
        {value}
      </p>
    </div>
  );
}
