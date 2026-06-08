"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckmarkBadge01Icon,
  PrinterIcon,
  ArrowRight01Icon,
  Home09Icon,
  UserCircleIcon,
  CreditCardPosIcon,
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

  // --- Formatting for Web View ---
  const formattedDateTimeFull = new Date(
    transaction.paidAt || transaction.createdAt,
  ).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Location string logic
  const loc = transaction.listingId?.propertyId?.location;
  const locationString = loc
    ? typeof loc === "string"
      ? loc
      : `${loc.area}, ${loc.city || loc.region}`
    : "Accra, Ghana";

  return (
    <>
      {/* ================================================================= */}
      {/* WEB VIEW: Your detailed, comprehensive UI (Hidden during printing) */}
      {/* ================================================================= */}
      <div className="max-w-3xl mx-auto w-full print:hidden">
        {/* --- HEADER: Animated Success State --- */}
        <div className="flex flex-col items-center text-center mb-10">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100"
          >
            <HugeiconsIcon
              icon={CheckmarkBadge01Icon}
              size={40}
              className="text-white fill-green-500"
            />
          </motion.div>

          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-4xl font-black uppercase tracking-tight text-slate-900 mb-3"
          >
            Payment Successful
          </motion.h1>

          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-base font-medium max-w-md"
          >
            Your reservation is confirmed. A copy of this receipt has been
            securely logged to your account ledger.
          </motion.p>
        </div>

        {/* --- MAIN RECEIPT CARD --- */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-white border border-slate-200 rounded-2xl overflow-hidden"
        >
          <div className="h-2 w-full bg-zinc-950" />

          <div className="p-6 md:p-10">
            {/* Section 1: Transaction Details */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <HugeiconsIcon
                  icon={CreditCardPosIcon}
                  size={24}
                  className="text-slate-400"
                />
                Transaction Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-slate-500 mb-1 font-medium">
                    Reference Number:
                  </span>
                  <span className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-1 rounded w-fit">
                    {transaction.reference}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 mb-1 font-medium">
                    Date & Time:
                  </span>
                  <span className="font-bold text-slate-900">
                    {formattedDateTimeFull}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 mb-1 font-medium">
                    Payment Method:
                  </span>
                  <span className="font-bold text-slate-900 capitalize">
                    Paystack ({transaction.channel || "Secure Gateway"})
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 mb-1 font-medium">
                    Status:
                  </span>
                  <span className="font-bold text-green-600 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />{" "}
                    Verified
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-dashed border-slate-200 mb-10" />

            {/* Section 2: Property & Financials */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <HugeiconsIcon
                  icon={Home09Icon}
                  size={24}
                  className="text-slate-400"
                />
                Property Details
              </h2>

              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <h3 className="font-bold text-lg text-slate-900">
                    {transaction.listingId?.title || "WunkatHomes Property"}
                  </h3>
                  <p className="text-slate-500 text-sm font-medium">
                    {locationString}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-slate-500 text-sm font-medium mb-1">
                    Upfront Rent
                  </p>
                  <p className="font-black text-xl text-slate-900">
                    ${transaction.amount?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <div className="flex justify-between items-center mb-3 text-sm font-medium text-slate-600">
                  <span>Subtotal</span>
                  <span>${transaction.amount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mb-4 text-sm font-medium text-slate-600">
                  <span>Agency Fees / Taxes</span>
                  <span className="text-green-600 font-bold">Free</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                  <span className="font-bold text-slate-900 uppercase tracking-widest text-xs">
                    Total Paid
                  </span>
                  <span className="font-black text-2xl text-slate-900">
                    ${transaction.amount?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-dashed border-slate-200 mb-10" />

            {/* Section 3: Tenant Details */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <HugeiconsIcon
                  icon={UserCircleIcon}
                  size={24}
                  className="text-slate-400"
                />
                Tenant Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div className="flex flex-col">
                  <span className="text-slate-500 mb-1 font-medium">
                    Registered Name
                  </span>
                  <span className="font-bold text-slate-900">
                    {transaction.userId?.name || "Verified User"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-500 mb-1 font-medium">
                    Contact Email
                  </span>
                  <span className="font-bold text-slate-900">
                    {transaction.userId?.email || "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* --- ACTIONS --- */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4 mt-8"
        >
          <button
            onClick={handlePrint}
            className="flex-1 py-4 bg-white border border-slate-200 text-slate-700 font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
          >
            <HugeiconsIcon icon={PrinterIcon} size={18} /> Download Receipt
          </button>
          <Link
            href="/user/sign-lease"
            className="flex-1 py-4 bg-black text-white font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
          >
            Continue to Dashboard{" "}
            <HugeiconsIcon icon={ArrowRight01Icon} size={18} />
          </Link>
        </motion.div>
      </div>

      {/* Render the isolated print component here */}
      <PrintReceipt transaction={transaction} />
    </>
  );
}
