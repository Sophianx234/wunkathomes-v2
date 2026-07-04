"use client";

import React from "react";
import { ArrowLeft01Icon, PrinterIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button"; 

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
    <div className="min-h-screen bg-zinc-100/50 font-sans print:bg-white print:absolute print:inset-0 print:w-full print:m-0 print:p-0 w-full overflow-x-hidden box-border">
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
      {showNav&&<div className="print:hidden sticky top-0 z-10 flex items-center justify-between p-2 md:p-4 bg-white border-b border-zinc-200/60 shadow-sm w-full box-border">
        <div className="flex items-center gap-2 md:gap-4 min-w-0">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-zinc-600 hover:text-zinc-900 px-2 md:px-4 h-8 md:h-10 shrink-0"
          >
            <span className="scale-75 md:scale-100 flex items-center md:mr-2">
              <HugeiconsIcon
                icon={ArrowLeft01Icon}
                size={18}
              />
            </span>
            <span className="hidden sm:inline">Back to Onboarding</span>
            <span className="sm:hidden text-xs">Back</span>
          </Button>
          <div className="h-3 md:h-4 w-px bg-zinc-200 hidden sm:block shrink-0" />
          <h3 className="font-bold text-zinc-800 flex items-center gap-1 md:gap-2 text-[10px] md:text-base truncate">
            Tenancy Agreement
          </h3>
        </div>
        <Button
          onClick={() => window.print()}
          className="print:hidden bg-zinc-900 text-white hover:bg-zinc-800 h-7 md:h-9 px-3 md:px-6 text-[9px] md:text-xs font-bold uppercase tracking-wider rounded-md md:rounded-lg shadow-sm shrink-0 ml-2"
        >
          <span className="scale-75 md:scale-100 flex items-center md:mr-2 shrink-0"><HugeiconsIcon icon={PrinterIcon} size={16} /></span>
          <span className="hidden sm:inline">Print Document</span>
          <span className="sm:hidden">Print</span>
        </Button>
      </div>}

      {/* DOCUMENT BODY */}
      <div className="max-w-4xl mx-auto p-4 md:p-8 print:p-0 w-full box-border">
        <div className="flex-1 w-full bg-white border border-zinc-200/80 rounded-md md:rounded-sm shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] print:border-none print:shadow-none print:rounded-none print:w-full print:block box-border overflow-hidden">
          <div className="p-5 md:p-14 lg:p-20 font-serif text-zinc-800 leading-relaxed md:leading-[1.8] text-[10px] md:text-[14px] text-justify print:p-0 print:text-black w-full box-border">
            
            <div className="text-center mb-4 md:mb-6 w-full box-border">
              <h2 className="text-sm md:text-xl font-bold uppercase tracking-widest border-b border-zinc-200/60 pb-2 md:pb-4 inline-block mx-auto text-zinc-900 break-words max-w-full">
                Standard Tenancy Agreement
              </h2>
              
            </div>

            <div className="space-y-4 md:space-y-6 w-full box-border">
              <p className="print:break-inside-avoid">
                This Tenancy Agreement is formally established between <strong>WunkatHomes Ltd.</strong> (referred to as the "Landlord") and <strong>{selectedActivation.user.name}</strong> (referred to as the "Tenant").
              </p>
              
              <p className="print:break-inside-avoid">
                <strong>1. The Property:</strong> The Landlord agrees to rent, and the Tenant agrees to occupy the property known as <strong>{selectedActivation.lease.propertyName}</strong> located at <strong>{selectedActivation.lease.propertyLocation || `Unit ${selectedActivation.lease.unitNumber}`}</strong>.
              </p>
              
              <p className="print:break-inside-avoid">
                <strong>2. Lease Duration:</strong> This agreement begins on <strong>{formatDate(selectedActivation.lease.startDate)}</strong> and will remain active until <strong>{selectedActivation.lease.endDate ? formatDate(selectedActivation.lease.endDate) : "the end of the agreed term"}</strong>, unless ended earlier under the terms of this agreement.
              </p>
              
              <p className="print:break-inside-avoid">
                <strong>3. Rent & Payment:</strong> The total rent payment of <strong>GHS {selectedActivation.lease.totalRentAmount?.toLocaleString(undefined, { minimumFractionDigits: 2 })}</strong> has been successfully processed and verified.
              </p>
              
              <p className="print:break-inside-avoid">
                <strong>4. Smart Lock & Property Access:</strong> Access to the property is managed securely via a Tuya Smart Lock system. The Tenant agrees to keep their personal access PIN confidential and not share it with unauthorized individuals.
              </p>

              <p className="print:break-inside-avoid">
                <strong>5. Tenant Responsibilities:</strong> The Tenant agrees to maintain the interior of the property in good condition, use the property only for residential living, and allow the Landlord or maintenance teams to enter for repairs with fair prior notice.
              </p>
            </div>

            {/* Document Signatures with "Live Ink" styling */}
            <div className="mt-10 md:mt-20 pt-6 md:pt-10 border-t border-zinc-200/60 flex flex-col sm:flex-row justify-between gap-6 md:gap-10 sm:gap-4 print:break-inside-avoid w-full box-border">
              
              <div className="w-full sm:w-56 font-sans min-w-0">
                <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-3 md:mb-6 truncate">Landlord Signature</p>
                <div className="h-8 md:h-12 border-b border-zinc-300 flex items-end pb-1 md:pb-2">
                  <span className="text-lg  truncate w-full font-serif md:text-[11px]">
                    WunkatHomes Ltd.
                  </span>
                </div>
                <p className="text-[9px] md:text-[11px] text-zinc-400 mt-2 md:mt-3 font-medium truncate">Verified System Counter-Signature</p>
              </div>

              <div className="w-full sm:w-56 font-sans min-w-0 mt-4 sm:mt-0">
                <p className="text-[8px] md:text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-3 md:mb-6 truncate">Tenant E-Signature</p>
                <div className="h-8 md:h-12 border-b border-zinc-300 flex items-end pb-1 md:pb-2">
                  <span className=" md:text-[11px] truncate w-full font-serif " >
                    {selectedActivation.lease.signatureAudit?.typedName || selectedActivation.user.name}
                  </span>
                </div>
                <div className="mt-2 md:mt-3 space-y-0.5 md:space-y-1">
                  <p className="text-[9px] md:text-[11px] text-zinc-400 font-medium truncate">Date: <span className="text-zinc-600">{selectedActivation.lease.signatureAudit?.signedAt || "Pending"}</span></p>
                  <p className="text-[9px] md:text-[11px] text-zinc-400 font-medium truncate">IP Addr: <span className="text-zinc-600 font-mono">{selectedActivation.lease.signatureAudit?.ipAddress || "N/A"}</span></p>
                </div>
              </div>

            </div>
            
            

          </div>
        </div>
      </div>
    </div>
  );
}
