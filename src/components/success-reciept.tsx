"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import TransactionReceipt from "./transaction-reciept";

interface SuccessReceiptProps {
  transaction: any;
}

export default function SuccessReceipt({ transaction }: SuccessReceiptProps) {
  const [isViewingReceipt, setIsViewingReceipt] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleCopyReference = () => {
    if (!transaction.reference) return;
    navigator.clipboard.writeText(transaction.reference);
    setCopied(true);
    toast.success("Booking reference copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  // Pre-filled WhatsApp follow-up link (no emojis, guaranteed %0A line breaks)
  const businessWhatsapp = (process.env.NEXT_PUBLIC_BUSINESS_WHATSAPP || "233241234567").replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${businessWhatsapp}?text=${[
    "Hello Wunkat Homes, I am sending my payment transfer receipt.",
    "",
    `Booking Ref: ${transaction.reference}`,
    `Property: ${transaction.listingId?.title || "Property"}`,
    `Tenant Name: ${transaction.userId?.name || "Verified User"}`,
    `Amount: GHS ${transaction.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    "",
    "Attached is my payment transfer receipt/screenshot."
  ].map(line => encodeURIComponent(line)).join("%0A")}`;

  // =================================================================
  // ROUTING LOGIC
  // =================================================================
  const isRenewal = transaction.paymentPurpose === "Lease_Renewal";
  const isVerified = transaction.userId?.kycStatus === "Verified";

  let continueUrl = "/user/dashboard";
  let buttonText = "";

  if (transaction.status === "Pending") {
    buttonText = "Go to Dashboard";
  } else if (isRenewal) {
    buttonText = "Return to Dashboard";
  } else if (isVerified) {
    buttonText = "View Your Lease";
  } else {
    buttonText = "Continue to Dashboard";
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
      channel: transaction.channel || "bank_transfer",
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
      {/* --- 50VH HERO IMAGE --- */}
      <div className="relative w-full h-[42vh] min-h-[320px] md:h-[50vh] bg-zinc-900">
        <Image 
          src={propertyImage} 
          alt={transaction.listingId?.title || "Property"} 
          fill 
          className="object-cover" 
          priority
        />
        {/* Subtle cinematic gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />
        
        {/* Status Pill */}
        <div className="absolute top-6 md:top-8 inset-x-0">
          <div className="max-w-4xl mx-auto px-6 md:px-10 w-full flex">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md text-xs font-medium text-zinc-900 shadow-xs">
              
              <span>{transaction.status === "Pending" ? "Payment Under Review" : "Payment Confirmed"}</span>
            </div>
          </div>
        </div>

        {/* Property Info at Bottom of Hero */}
        <div className="absolute inset-x-0 bottom-0 pb-6 md:pb-8">
          <div className="max-w-4xl mx-auto px-6 md:px-10 w-full text-white">
            <p className="text-[11px] uppercase tracking-wider text-white/70 font-medium mb-1">
              {transaction.listingId?.propertyId?.propertyType || "Property"}
            </p>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-white mb-1.5 leading-tight">
              {transaction.listingId?.title || "WunkatHomes Property"}
            </h1>
            <p className="text-xs sm:text-sm text-white/80 font-normal">
              {locationString}
            </p>
          </div>
        </div>
      </div>

      {/* --- RECEIPT CONTENT --- */}
      <div className="max-w-4xl mx-auto w-full px-6 md:px-10 py-8 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
        >
          {transaction.status === "Pending" && (
            <div className="mb-8 p-5 bg-white border border-zinc-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-zinc-900">
                  Payment Verification In Progress
                </p>
                <p className="text-xs text-zinc-600 leading-relaxed max-w-xl">
                  Our accounts team is matching your transfer with booking ref <span className="font-mono font-medium text-zinc-900">{transaction.reference}</span>. If you haven&apos;t sent your receipt screenshot yet, forward it to our official WhatsApp line.
                </p>
              </div>
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-medium transition-transform duration-160 ease-out active:scale-[0.98]"
              >
                <span>Send Receipt on WhatsApp</span>
              </a>
            </div>
          )}

          {/* Amount and Reference Header */}
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between mb-8 pb-8 border-b border-zinc-200/80 gap-4">
            <div>
              <p className="text-xs font-medium text-zinc-500 mb-1">
                {transaction.status === "Pending" ? "Amount Transferred" : "Amount Paid"}
              </p>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950">
                GHS {transaction.amount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </h2>
            </div>
            <div className="sm:text-right">
              <p className="text-xs font-medium text-zinc-500 mb-1">
                Booking Reference
              </p>
              <button
                type="button"
                onClick={handleCopyReference}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200/80 bg-white hover:bg-zinc-50 text-xs font-mono text-zinc-800 transition-transform duration-160 ease-out active:scale-[0.98]"
                title="Click to copy reference"
              >
                <span>{transaction.reference}</span>
                {copied ? (
                  <Check size={12} className="text-emerald-600" />
                ) : (
                  <Copy size={12} className="text-zinc-400" />
                )}
              </button>
            </div>
          </div>

          {/* Tabular Details */}
          <div className="border border-zinc-200/80 rounded-2xl bg-white overflow-hidden mb-10 shadow-xs">
            <dl className="divide-y divide-zinc-100 text-xs sm:text-sm">
              <div className="px-5 py-3.5 flex justify-between items-center">
                <dt className="text-zinc-500 font-normal">Date &amp; Time</dt>
                <dd className="font-medium text-zinc-900">{formattedDateTimeFull}</dd>
              </div>
              <div className="px-5 py-3.5 flex justify-between items-center">
                <dt className="text-zinc-500 font-normal">Payment Method</dt>
                <dd className="font-medium text-zinc-900 capitalize">
                  {transaction.channel ? transaction.channel.replace(/_/g, " ") : "Bank Transfer"}
                </dd>
              </div>
              <div className="px-5 py-3.5 flex justify-between items-center">
                <dt className="text-zinc-500 font-normal">Transaction Type</dt>
                <dd className="font-medium text-zinc-900">
                  {isRenewal ? "Lease Extension" : "Upfront Rent"}
                </dd>
              </div>
              <div className="px-5 py-3.5 flex justify-between items-center">
                <dt className="text-zinc-500 font-normal">Tenant Name</dt>
                <dd className="font-medium text-zinc-900">
                  {transaction.userId?.name || "Verified User"}
                </dd>
              </div>
              <div className="px-5 py-3.5 flex justify-between items-center">
                <dt className="text-zinc-500 font-normal">Verification Status</dt>
                <dd className="font-medium text-zinc-900 flex items-center gap-2">
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      transaction.status === "Pending" ? "bg-amber-500" : "bg-emerald-600"
                    )}
                  />
                  <span>{transaction.status === "Pending" ? "Under Review" : "Confirmed"}</span>
                </dd>
              </div>
            </dl>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3 max-w-md">
            <Link
              href={continueUrl}
              className="w-full sm:w-auto flex-1 h-11 px-5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs sm:text-sm font-medium rounded-xl flex items-center justify-center transition-transform duration-160 ease-out active:scale-[0.98]"
            >
              {buttonText}
            </Link>

            <button
              type="button"
              onClick={() => setIsViewingReceipt(true)}
              className="w-full sm:w-auto flex-1 h-11 px-5 bg-white border border-zinc-200/80 hover:bg-zinc-50 text-zinc-800 text-xs sm:text-sm font-medium rounded-xl flex items-center justify-center transition-transform duration-160 ease-out active:scale-[0.98]"
            >
              View Official Receipt
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}