"use client";

import React from "react";
import Link from "next/link";
import {
  ArrowLeft01Icon,
  PrinterIcon,
  Shield02Icon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { TenancyDocument } from "./lease-document viewer";

interface DocumentVaultClientProps {
  data: {
    leaseId: string;
    tenantName: string;
    propertyTitle: string;
    propertyLocation: string;
    totalRent: number;
    startDate: string;
    endDate: string;
    signature: {
      isSigned: boolean;
      typedName: string;
      signedAt: string;
      ipAddress: string;
      documentHash: string;
    };
  };
}

export default function DocumentVaultClient({
  data,
}: DocumentVaultClientProps) {
  const handlePrint = () => {
    window.print();
  };

  // 1. Map the incoming Vault data to the structure TenancyDocument expects
  const mappedActivation = {
    user: {
      name: data.tenantName,
    },
    lease: {
      id: data.leaseId,
      propertyName: data.propertyTitle,
      propertyLocation: data.propertyLocation,
      startDate: data.startDate,
      endDate: data.endDate,
      totalRentAmount: data.totalRent,
      signatureAudit: {
        typedName: data.signature.typedName,
        ipAddress: data.signature.ipAddress,
        signedAt: data.signature.signedAt,
        documentHash: data.signature.documentHash,
      },
    },
  };

  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          html, body, #__next, main {
            height: auto !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
            background: white !important;
          }
            footer,navbar{
            display: none !important;}
          * {
            float: none !important;
          }
        }
      `,
        }}
      />

      <main className="min-h-screen bg-[#F4F4F5] text-zinc-900 font-sans print:bg-white flex flex-col w-full overflow-x-hidden box-border">
        {/* ========================================================= */}
        {/* APP HEADER - HIDDEN DURING PRINT */}
        {/* ========================================================= */}
        <header className="h-10 md:h-16 bg-white border-b border-zinc-200/60 flex items-center justify-between px-2 md:px-8 sticky top-0 z-20 shrink-0 print:hidden shadow-sm w-full box-border">
          <div className="flex items-center gap-2 md:gap-4 min-w-0">
            <Link
              href="/user/dashboard"
              className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-md hover:bg-zinc-100/50 transition-colors text-zinc-500 hover:text-zinc-900 shrink-0"
            >
              <span className="scale-75 md:scale-100 flex items-center">
                <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
              </span>
            </Link>
            <div className="h-3 md:h-4 w-px bg-zinc-200 hidden sm:block shrink-0" />
            <div className="flex items-center gap-1 md:gap-2 min-w-0">
              <h1 className="text-[10px] md:text-[14px] font-semibold tracking-tight text-zinc-900 truncate">
                Sign Tenancy Agreement
              </h1>
            </div>
          </div>

          <button
            onClick={handlePrint}
            className="h-7 md:h-9 px-2 md:px-4 bg-zinc-900 text-white text-[9px] md:text-[12px] font-medium rounded-md md:rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1.5 md:gap-2 shadow-sm shrink-0 truncate ml-2"
          >
            <span className="scale-75 md:scale-100 flex items-center shrink-0">
              <HugeiconsIcon icon={PrinterIcon} size={14} />
            </span>
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </header>

        {/* ========================================================= */}
        {/* MAIN WORKSPACE */}
        {/* ========================================================= */}
        <div className="flex-1 md:max-w-[1200px] w-full mx-auto p-2 md:p-8 flex flex-col lg:flex-row gap-4 md:gap-8 items-start box-border min-w-0">
          {/* LEFT: HTML DOCUMENT VIEWER (THIS IS WHAT PRINTS) */}
          <div className="flex-1 w-full min-w-0 max-w-full box-border print:border-none print:shadow-none print:w-full print:block">
            {/* 2. Invoke the Component Here */}
            <TenancyDocument
              showNav={false}
              selectedActivation={mappedActivation}
              onBack={() => {
                // Optional: Handle the onBack function if TenancyDocument still triggers it
                console.log("Back clicked from inside TenancyDocument");
              }}
            />
          </div>
        </div>
      </main>
    </>
  );
}

// Small helper component for the Audit Trail rows
function AuditRow({
  label,
  value,
  isMono = false,
}: {
  label: string;
  value: React.ReactNode;
  isMono?: boolean;
}) {
  return (
    <div className="flex flex-col border-b border-zinc-200/60 pb-2 md:pb-3 w-full box-border min-w-0">
      <span className="text-[7px] md:text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1 md:mb-1.5 truncate">
        {label}
      </span>
      <span
        className={`text-[9px] md:text-[13px] font-medium text-zinc-900 truncate ${isMono ? "font-mono tracking-tight" : ""}`}
      >
        {value}
      </span>
    </div>
  );
}
