"use client"

import React from "react"
import Link from "next/link"
import { 
  SignatureIcon, 
  ArrowLeft01Icon,
  Shield01Icon, 
  PrinterIcon
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

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
    }
  }
}

export default function DocumentVaultClient({ data }: DocumentVaultClientProps) {
  
  // Trigger the browser's native print / save-as-PDF dialog
  const handlePrint = () => {
    window.print();
  }

  return (
      <>
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          /* Nuke all global heights that cause blank pages */
          html, body, #__next, main {
            height: auto !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 0 !important;
            overflow: visible !important;
          }
          /* Strip background colors */
          body { 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact;
            background: white !important;
          }
            footer,navbar{
            display: none !important;}
          /* Force standard block rendering to fix pagination breaking */
          * {
            float: none !important;
          }
        }
      `}} />

      <main className="min-h-screen bg-zinc-50 text-zinc-950 py-12 md:py-24 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
        <div className="max-w-5xl mx-auto flex flex-col gap-8 print:block print:max-w-none">
          
          {/* Navigation / Header - HIDDEN DURING PRINT */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 print:hidden">
            <div>
              <Link href="/user/dashboard" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors mb-3">
                <HugeiconsIcon icon={ArrowLeft01Icon} size={14} /> Back to Dashboard
              </Link>
              <h1 className="text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                <HugeiconsIcon icon={SignatureIcon} size={24} className="text-zinc-700" />
                Lease Agreement
              </h1>
            </div>
            
            {/* Print / Export Action */}
            <button 
              onClick={handlePrint}
              className="w-full sm:w-auto px-6 py-3.5 bg-zinc-950 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <HugeiconsIcon icon={PrinterIcon} size={16} /> Save as PDF
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start print:block">
            
            {/* ========================================================= */}
            {/* HTML DOCUMENT VIEWER (THIS IS WHAT PRINTS) */}
            {/* ========================================================= */}
            <div className="lg:col-span-8 bg-white border border-zinc-200 rounded-2xl  flex flex-col print:border-none print:shadow-none print:w-full print:block">
              
              {/* Viewer Header - HIDDEN DURING PRINT */}
   
              
              {/* THE ACTUAL PAPER DOCUMENT */}
              <div className="p-8 md:p-12 font-serif text-zinc-900 leading-relaxed text-sm text-justify print:p-0 print:text-black print:text-sm">
                <div className="text-center mb-10">
                  <h2 className="text-2xl font-bold uppercase tracking-widest border-b-2 border-zinc-900 pb-4 inline-block mx-auto">
                    Standard Tenancy Agreement
                  </h2>
                  <p className="mt-4 font-sans text-[10px] uppercase tracking-widest text-zinc-500 font-bold">
                    Reference ID: {data.leaseId.slice(-12).toUpperCase()}
                  </p>
                </div>

                <div className="space-y-6">
                  <p>
                    This Tenancy Agreement is formally established between <strong>WunkatHomes Ltd.</strong> (referred to as the "Landlord") and <strong>{data.tenantName}</strong> (referred to as the "Tenant").
                  </p>
                  
                  <p>
                    <strong>1. The Property:</strong> The Landlord agrees to rent, and the Tenant agrees to occupy the property known as <strong>{data.propertyTitle}</strong> located at <strong>{data.propertyLocation}</strong>.
                  </p>
                  
                  <p>
                    <strong>2. Lease Duration:</strong> This agreement begins on <strong>{data.startDate}</strong> and will remain active until <strong>{data.endDate}</strong>, unless ended earlier under the terms of this agreement.
                  </p>
                  
                  <p>
                    <strong>3. Rent & Payment:</strong> The total rent payment of <strong>GHS {data.totalRent.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong> has been successfully processed and verified.
                  </p>
                  
                  <p>
                    <strong>4. Smart Lock & Property Access:</strong> Access to the property is managed securely via a Tuya Smart Lock system. The Tenant agrees to keep their personal access PIN confidential and not share it with unauthorized individuals.
                  </p>

                  <p>
                    <strong>5. Tenant Responsibilities:</strong> The Tenant agrees to maintain the interior of the property in good condition, use the property only for residential living, and allow the Landlord or maintenance teams to enter for repairs with fair prior notice.
                  </p>
                </div>

                {/* Document Signatures */}
                <div className="mt-16 pt-8 border-t border-zinc-200 print:break-inside-avoid">
                  <h4 className="font-sans text-xs font-bold uppercase tracking-widest mb-6 text-zinc-800">Digital Signature Verification</h4>
                  
                  <div className="grid grid-cols-2 gap-8 font-sans text-xs">
                    <div>
                      <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold mb-1">Landlord Signature</p>
                      <p className="font-signature text-2xl font-bold " >WunkatHomes Ltd.</p>
                      <p className="text-zinc-500 mt-2">Verified System Counter-Signature</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 uppercase tracking-widest text-[10px] font-bold mb-1">Tenant E-Signature</p>
                      <p className="font-signature text-2xl font-bold " >{data.signature.typedName}</p>
                      <p className="text-zinc-500 mt-2">IP Address: {data.signature.ipAddress}</p>
                      <p className="text-zinc-500">Date: {data.signature.signedAt}</p>
                    </div>
                  </div>
                  
                  <div className="mt-8 bg-zinc-50 p-4 rounded font-mono text-[10px] text-zinc-500 break-all border border-zinc-100 print:border-none print:bg-white print:p-0 print:text-black">
                    <strong>Security ID:</strong> {data.signature.documentHash}
                  </div>
                </div>
              </div>
            </div>

            {/* ========================================================= */}
            {/* AUDIT TRAIL SIDEBAR - HIDDEN DURING PRINT */}
            {/* ========================================================= */}
            <div className="lg:col-span-4 space-y-6 print:hidden">
              <div className="bg-white p-6 rounded-2xl border border-zinc-200  sticky top-12">
                <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-1.5">
                  Signature Details
                </h3>
                
                <div className="space-y-4 text-xs font-medium text-zinc-600">
                  <div className="flex flex-col border-b border-zinc-100 pb-3">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1">Document Status</span>
                    <span className="font-bold text-green-600">Signed & Active</span>
                  </div>
                  <div className="flex flex-col border-b border-zinc-100 pb-3">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1">Signed By</span>
                    <span className="font-bold text-zinc-900">{data.signature.typedName}</span>
                  </div>
                  <div className="flex flex-col border-b border-zinc-100 pb-3">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1">Time of Signature</span>
                    <span className="font-mono text-zinc-900">{data.signature.signedAt}</span>
                  </div>
                  <div className="flex flex-col border-b border-zinc-100 pb-3">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1">Network IP</span>
                    <span className="font-mono text-zinc-900">{data.signature.ipAddress}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-zinc-400 font-bold uppercase tracking-wider text-[10px] mb-1">Security ID Code</span>
                    <span className="font-mono text-[10px] text-zinc-900 break-all select-all bg-zinc-50 p-2 rounded border border-zinc-100 mt-1 block">
                      {data.signature.documentHash}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
    </>
  )
}