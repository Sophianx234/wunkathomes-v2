"use client";

import React from "react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";

// PDF Imports
import PDFViewerWrapper from "./pdf-viewer-wrapper";
import TransactionReceiptPDF from "./pdf/transaction-receipt-pdf";

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

export default function TransactionReceipt({ transaction, onBack }: TransactionReceiptProps) {
  // Format Date safely
  let dateStr = "N/A";
  try {
    const d = new Date(transaction.paidAt || transaction.createdAt);
    if (!isNaN(d.getTime())) {
      dateStr = d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  } catch (e) {
    console.error("Invalid date", e);
  }

  const formattedAmount = formatCurrency(transaction.amount, transaction.currency);

  return (
    <div className="min-h-screen bg-[#F4F4F5] text-zinc-900 font-sans flex flex-col w-full box-border">
      {/* HEADER */}
      <div className="sticky top-0 z-10 flex items-center justify-between p-3 md:p-4 bg-white/80 backdrop-blur-xl border-b border-zinc-100 shadow-sm w-full box-border">
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
      </div>

      {/* RECEIPT BODY (PDF VIEWER) */}
      <div className="max-w-4xl mx-auto mt-6 md:mt-12 p-4 md:p-0 w-full box-border h-[calc(100vh-100px)]">
        <PDFViewerWrapper>
          <TransactionReceiptPDF transaction={transaction} dateStr={dateStr} formattedAmount={formattedAmount} />
        </PDFViewerWrapper>
      </div>
    </div>
  );
}
