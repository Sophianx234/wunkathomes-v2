"use client";

import React from "react";
import { ArrowLeft01Icon, PrinterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

// NOTE: Ensure you import your Button component from wherever it lives in your project!
// Example: import { Button } from "@/components/ui/button";
import { Button } from "@/components/ui/button"; // Replace with your actual Button import

// Define the shape of the data this component requires to render correctly
export interface TenancyDocumentProps {
  showNav?:boolean
  selectedActivation: {
    user: {
      name: string;
    };
    lease: {
      id: string;
      propertyName: string;
      propertyLocation?: string;
      unitNumber?: string;
      startDate: string | Date;
      endDate?: string | Date;
      totalRentAmount: number;
      signatureAudit?: {
        typedName?: string;
        ipAddress?: string;
        signedAt?: string;
        documentHash?: string;
      };
    };
  };
  onBack: () => void;
}

export function TenancyDocument({ selectedActivation, onBack,showNav=true }: TenancyDocumentProps) {
  // Utility function to safely format dates
  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-zinc-100 font-sans print:bg-white">
      {/* Print styles injected via dangerouslySetInnerHTML. 
        This ensures that when the user prints the page, 
        the background is white and the "Back" / "Print" buttons disappear. 
      */}
      <style
        dangerouslySetInnerHTML={{
          __html: `@media print { 
            body { background-color: white !important; } 
            .print-hide { display: none !important; } 
            @page { margin: 1.5cm; } 
          }`,
        }}
      />

      {/* TOP NAVIGATION BAR (Hidden during printing) */}
      {showNav&&<div className="print-hide sticky top-0 z-10 flex items-center justify-between p-4 bg-white border-b border-zinc-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-zinc-600 hover:text-zinc-900"
          >
            <HugeiconsIcon
              icon={ArrowLeft01Icon}
              size={18}
              className="mr-2"
            />{" "}
            Back to Onboarding
          </Button>
          <div className="h-4 w-px bg-zinc-200" />
          <h3 className="font-bold text-zinc-800 flex items-center gap-2">
            Tenancy Agreement
          </h3>
        </div>
        <Button
          onClick={() => window.print()}
          className="bg-zinc-900 text-white hover:bg-zinc-800 h-9 px-6 text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm"
        >
          <HugeiconsIcon icon={PrinterIcon} size={16} className="mr-2" />{" "}
          Print Document
        </Button>
      </div>}

      {/* DOCUMENT BODY */}
      <div className="max-w-4xl mx-auto p-8 print:p-0">
        <div className="flex-1 w-full bg-white border border-zinc-200/80 rounded-sm shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] print:border-none print:shadow-none print:w-full print:block">
          <div className="p-8 md:p-14 lg:p-20 font-serif text-zinc-800 leading-[1.8] text-[14px] text-justify print:p-0 print:text-black">
            
            <div className="text-center mb-14">
              <h2 className="text-xl font-bold uppercase tracking-widest border-b border-zinc-200 pb-4 inline-block mx-auto text-zinc-900">
                Standard Tenancy Agreement
              </h2>
              <p className="mt-4 font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                Document Reference: {selectedActivation.lease.id.slice(-12).toUpperCase()}
              </p>
            </div>

            <div className="space-y-6">
              <p>
                This Tenancy Agreement is formally established between <strong>WunkatHomes Ltd.</strong> (referred to as the "Landlord") and <strong>{selectedActivation.user.name}</strong> (referred to as the "Tenant").
              </p>
              
              <p>
                <strong>1. The Property:</strong> The Landlord agrees to rent, and the Tenant agrees to occupy the property known as <strong>{selectedActivation.lease.propertyName}</strong> located at <strong>{selectedActivation.lease.propertyLocation || `Unit ${selectedActivation.lease.unitNumber}`}</strong>.
              </p>
              
              <p>
                <strong>2. Lease Duration:</strong> This agreement begins on <strong>{formatDate(selectedActivation.lease.startDate)}</strong> and will remain active until <strong>{selectedActivation.lease.endDate ? formatDate(selectedActivation.lease.endDate) : "the end of the agreed term"}</strong>, unless ended earlier under the terms of this agreement.
              </p>
              
              <p>
                <strong>3. Rent & Payment:</strong> The total rent payment of <strong>GHS {selectedActivation.lease.totalRentAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> has been successfully processed and verified.
              </p>
              
              <p>
                <strong>4. Smart Lock & Property Access:</strong> Access to the property is managed securely via a Tuya Smart Lock system. The Tenant agrees to keep their personal access PIN confidential and not share it with unauthorized individuals.
              </p>

              <p>
                <strong>5. Tenant Responsibilities:</strong> The Tenant agrees to maintain the interior of the property in good condition, use the property only for residential living, and allow the Landlord or maintenance teams to enter for repairs with fair prior notice.
              </p>
            </div>

            {/* Document Signatures with "Live Ink" styling */}
            <div className="mt-20 pt-10 border-t border-zinc-100 flex flex-col sm:flex-row justify-between gap-10 sm:gap-4 print:break-inside-avoid">
              
              <div className="w-full sm:w-56 font-sans">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-6">Landlord Signature</p>
                <div className="h-12 border-b border-zinc-300 flex items-end pb-2">
                  <span className="text-2xl" style={{ fontFamily: "'Brush Script MT', 'Bradley Hand', cursive", lineHeight: 0.8 }}>
                    WunkatHomes Ltd.
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 mt-3 font-medium">Verified System Counter-Signature</p>
              </div>

              <div className="w-full sm:w-56 font-sans">
                <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-6">Tenant E-Signature</p>
                <div className="h-12 border-b border-zinc-300 flex items-end pb-2">
                  <span className="text-3xl truncate" style={{ fontFamily: "'Brush Script MT', 'Bradley Hand', cursive", lineHeight: 0.8 }}>
                    {selectedActivation.lease.signatureAudit?.typedName || selectedActivation.user.name}
                  </span>
                </div>
                <div className="mt-3 space-y-1">
                  <p className="text-[11px] text-zinc-400 font-medium">Date: <span className="text-zinc-600">{selectedActivation.lease.signatureAudit?.signedAt || "Pending"}</span></p>
                  <p className="text-[11px] text-zinc-400 font-medium">IP Addr: <span className="text-zinc-600 font-mono">{selectedActivation.lease.signatureAudit?.ipAddress || "N/A"}</span></p>
                </div>
              </div>

            </div>
            
            <div className="mt-12 bg-zinc-50 p-4 rounded-md font-mono text-[10px] text-zinc-400 break-all border border-zinc-100 print:border-none print:bg-white print:p-0 print:text-black">
              <strong>SEC-HASH:</strong> {selectedActivation.lease.signatureAudit?.documentHash || "Pending Generation"}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}