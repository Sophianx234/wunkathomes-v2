"use client";

import React from "react";
import {
  Home09Icon,
  UserCircleIcon,
  TickDouble02Icon,
  CreditCardIcon,
  SmartPhone01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface PrintReceiptProps {
  transaction: any;
}

export default function PrintReceipt({ transaction }: PrintReceiptProps) {
  // --- Formatting logic specific to the print ticket ---
  const formattedDateShort = new Date(
    transaction.paidAt || transaction.createdAt,
  )
    .toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    .toUpperCase();

  const formattedTimeShort = new Date(
    transaction.paidAt || transaction.createdAt,
  ).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const loc = transaction.listingId?.propertyId?.location;
  const locationString = loc
    ? typeof loc === "string"
      ? loc
      : `${loc.area}, ${loc.city || loc.region}`
    : "Accra, Ghana";

  const generateBarcodeLines = () => {
    const lines = [];
    const seed = transaction.reference || "WUNKAT123456";
    for (let i = 0; i < 40; i++) {
      const width = (seed.charCodeAt(i % seed.length) % 4) + 1;
      lines.push(
        <div
          key={i}
          className="bg-black h-12"
          style={{ width: `${width}px`, marginRight: "2px" }}
        />,
      );
    }
    return lines;
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            @page { 
              margin: 0 !important; 
              size: auto;
            }
            html, body {
              height: 100vh !important;
              overflow: hidden !important;
              margin: 0 !important;
              padding: 0 !important;
              background-color: white !important;
            }
            /* Hide generic structural elements just in case */
            header, nav, footer {
              display: none !important;
            }
            /* Force the receipt to cover the entire page and center its children */
            #isolated-print-receipt {
              position: fixed !important;
              top: 0 !important;
              left: 0 !important;
              width: 100vw !important;
              height: 100vh !important;
              background: white !important;
              z-index: 999999 !important;
              margin: 0 !important;
              padding-top: 3rem !important; 
              display: flex !important;
              justify-content: center !important; /* Centers horizontally */
              align-items: flex-start !important; /* Keeps it near the top */
              overflow: hidden !important;
            }
          }
        `,
        }}
      />

      {/* Outer Wrapper: Acts as the full-screen flex container on print */}
      <div
        id="isolated-print-receipt"
        className="hidden"
        style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
      >
        {/* Inner Wrapper: Controls the actual width of the ticket */}
        <div className="w-full max-w-md px-4">
          <div className="w-full bg-white border-2 border-slate-200 rounded-t-3xl relative overflow-hidden print:break-inside-avoid ">
            {/* Top Section */}
            <div className="pt-8 pb-6 px-8 text-center flex flex-col items-center">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mb-4">
                <HugeiconsIcon
                  icon={TickDouble02Icon}
                  size={28}
                  className="text-green-500"
                />
              </div>
              <h1 className="text-2xl font-black text-slate-900 mb-2">
                Thank you
              </h1>
              <p className="text-sm font-medium text-slate-500">
                Your payment has been processed
                <br />
                successfully.
              </p>
            </div>

            {/* The Tear Line & Side Notches */}
            <div className="relative w-full h-8 flex items-center justify-center my-1">
              <div className="absolute left-0 -ml-4 w-8 h-8 bg-white border-r-2 border-slate-200 rounded-full" />
              <div className="absolute right-0 -mr-4 w-8 h-8 bg-white border-l-2 border-slate-200 rounded-full" />
              <div className="w-[85%] border-b-2 border-dashed border-slate-200" />
            </div>

            {/* Details Section */}
            <div className="pt-4 pb-8 px-8">
              <div className="flex justify-between items-start mb-5">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Ticket ID
                  </p>
                  <p className="font-mono font-bold text-sm text-slate-900">
                    {transaction.reference}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                    Amount
                  </p>
                  <p className="font-black text-lg text-slate-900">
                    ${transaction.amount?.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Date & Time
                </p>
                <p className="font-bold text-sm text-slate-900">
                  {formattedDateShort} | {formattedTimeShort}
                </p>
              </div>

              <div className="mb-5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Property
                </p>
                <p className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  {transaction.listingId?.title || "WunkatHomes Property"}
                </p>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {locationString}
                </p>
              </div>

              <div className="mb-6">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Tenant
                </p>
                <p className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  {transaction.userId?.name || "Verified User"}
                </p>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {transaction.userId?.email || "N/A"}
                </p>
              </div>

              {/* Payment Method Badge */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-white rounded-full  flex items-center justify-center shrink-0">
                  {transaction.channel === "mobile_money" ? (
                    <HugeiconsIcon
                      icon={SmartPhone01Icon}
                      size={16}
                      className="text-yellow-600"
                    />
                  ) : (
                    <HugeiconsIcon
                      icon={CreditCardIcon}
                      size={16}
                      className="text-blue-600"
                    />
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 capitalize">
                    {transaction.channel?.replace("_", " ") || "Secure Gateway"}
                  </p>
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-widest">
                    Paid via Paystack
                  </p>
                </div>
              </div>

              {/* Simulated Barcode */}
              <div className="w-full flex flex-col items-center border-t border-dashed border-slate-200 pt-6">
                <div className="flex items-center justify-center w-full overflow-hidden">
                  {generateBarcodeLines()}
                </div>
                <p className="text-[9px] font-mono text-slate-400 tracking-[0.2em] mt-2">
                  {transaction._id}
                </p>
              </div>
            </div>
          </div>

          {/* Ticket Bottom Teeth */}
          <div className="flex justify-between w-full px-2 -mt-3 z-10 print:break-inside-avoid">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="w-8 h-8 bg-white border-t-2 border-slate-200 rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
