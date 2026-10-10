"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import PDFViewerWrapper from "./pdf-viewer-wrapper";
import TenancyDocumentPDF from "./pdf/tenancy-document-pdf";

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

export default function DocumentVaultClient({ data }: DocumentVaultClientProps) {
  // Map the incoming Vault data to the structure TenancyDocument expects
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
    <main className="min-h-screen bg-[#F4F4F5] text-zinc-900 font-sans flex flex-col w-full overflow-x-hidden box-border">
      {/* APP HEADER */}
      <header className="h-10 md:h-16 bg-white border-b border-zinc-200/60 flex items-center justify-between px-2 md:px-8 sticky top-0 z-20 shrink-0 shadow-sm w-full box-border">
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
              View Tenancy Agreement
            </h1>
          </div>
        </div>
        {/* PDF viewer has its own download button */}
      </header>

      {/* MAIN WORKSPACE */}
      <div className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col box-border min-w-0 h-[calc(100vh-100px)]">
        <PDFViewerWrapper>
          <TenancyDocumentPDF selectedActivation={mappedActivation} />
        </PDFViewerWrapper>
      </div>
    </main>
  );
}
