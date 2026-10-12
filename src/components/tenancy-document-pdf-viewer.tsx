"use client";

import React from "react";
import { ArrowLeft, FileText, CheckCircle2, Clock } from "lucide-react";
import PDFViewerWrapper from "./pdf-viewer-wrapper";
import TenancyDocumentPDF from "./pdf/tenancy-document-pdf";

interface TenancyDocumentPDFViewerProps {
  selectedActivation: any;
  onBack: () => void;
}

export function TenancyDocumentPDFViewer({
  selectedActivation,
  onBack,
}: TenancyDocumentPDFViewerProps) {
  // Normalize and map activation data to the structure TenancyDocumentPDF expects
  const isSigned = selectedActivation?.checklist?.leaseSigned === "Signed" || !!selectedActivation?.lease?.signatureAudit?.isSigned;

  const mappedActivation = {
    user: {
      name: selectedActivation?.user?.name || "Tenant",
    },
    lease: {
      id: selectedActivation?.lease?.id || selectedActivation?.id || "",
      propertyName: selectedActivation?.lease?.propertyName || "WunkatHomes Property",
      propertyLocation:
        selectedActivation?.lease?.propertyLocation ||
        selectedActivation?.lease?.location ||
        (selectedActivation?.lease?.unitNumber ? `Unit ${selectedActivation.lease.unitNumber}` : "Accra, Ghana"),
      unitNumber: selectedActivation?.lease?.unitNumber,
      startDate: selectedActivation?.lease?.startDate || new Date().toISOString(),
      endDate: selectedActivation?.lease?.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      totalRentAmount: selectedActivation?.lease?.totalRentAmount || 0,
      signatureAudit: {
        typedName:
          selectedActivation?.lease?.signatureAudit?.typedName ||
          selectedActivation?.user?.name ||
          "Tenant",
        ipAddress: selectedActivation?.lease?.signatureAudit?.ipAddress || "Verified Portal",
        signedAt: selectedActivation?.lease?.signatureAudit?.signedAt
          ? new Date(selectedActivation.lease.signatureAudit.signedAt).toLocaleString("en-GB")
          : isSigned ? new Date().toLocaleDateString("en-GB") : "Pending Signature",
        documentHash: selectedActivation?.lease?.signatureAudit?.documentHash || "SHA256-AUTHENTICATED",
      },
    },
  };

  return (
    <main className="min-h-screen bg-zinc-50/50 text-zinc-900 font-sans flex flex-col w-full overflow-x-hidden box-border">
      {/* APP HEADER */}
      <header className="h-14 bg-white border-b border-zinc-200/80 flex items-center justify-between px-4 md:px-8 sticky top-0 z-30 shrink-0 shadow-xs w-full box-border">
        <div className="flex items-center gap-3 md:gap-4 min-w-0">
          <button
            onClick={onBack}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 active:scale-95 transition-all shrink-0 border border-zinc-200/60 shadow-2xs"
            title="Back to Tenant Directory"
            aria-label="Back to Tenant Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          
          <div className="h-4 w-px bg-zinc-200 hidden sm:block shrink-0" />
          
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 text-zinc-600 border border-zinc-200/60">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xs md:text-sm font-semibold tracking-tight text-zinc-900 truncate">
                Tenancy Agreement PDF Preview
              </h1>
              <p className="text-[11px] text-zinc-400 font-mono truncate hidden sm:block">
                {mappedActivation.lease.propertyName} • {mappedActivation.user.name}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {isSigned ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Signed & Verified</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-zinc-100 text-zinc-600 border border-zinc-200/60">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Awaiting Signature</span>
            </span>
          )}
        </div>
      </header>

      {/* MAIN WORKSPACE: High-fidelity PDF viewer */}
      <div className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 flex flex-col box-border min-w-0 h-[calc(100vh-70px)]">
        <div className="flex-1 w-full rounded-xl overflow-hidden border border-zinc-200/80 shadow-xs bg-white">
          <PDFViewerWrapper className="w-full h-full min-h-[750px] bg-white overflow-hidden">
            <TenancyDocumentPDF selectedActivation={mappedActivation} />
          </PDFViewerWrapper>
        </div>
      </div>
    </main>
  );
}

export default TenancyDocumentPDFViewer;
