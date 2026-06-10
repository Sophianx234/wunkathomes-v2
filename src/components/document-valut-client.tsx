"use client"

import React from "react"
import Link from "next/link"
import { 
  ArrowLeft01Icon,
  PrinterIcon,
  Shield02Icon,
  CheckmarkBadge01Icon
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
      `}} />

      <main className="min-h-screen bg-[#F4F4F5] text-zinc-900 font-sans print:bg-white flex flex-col">
        
        {/* ========================================================= */}
        {/* APP HEADER - HIDDEN DURING PRINT */}
        {/* ========================================================= */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-20 shrink-0 print:hidden shadow-sm">
          <div className="flex items-center gap-4">
            <Link 
              href="/user/dashboard" 
              className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-zinc-100 transition-colors text-zinc-500 hover:text-zinc-900"
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} size={18} />
            </Link>
            <div className="h-4 w-px bg-zinc-200 hidden sm:block" />
            <div className="flex items-center gap-2">
              <h1 className="text-[14px] font-semibold tracking-tight text-zinc-900">
                Sign Tenancy Agreement 
              </h1>
            </div>
          </div>
          
          <button 
            onClick={handlePrint}
            className="h-9 px-4 bg-zinc-900 text-white text-[12px] font-medium rounded-lg hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <HugeiconsIcon icon={PrinterIcon} size={14} /> 
            <span className="hidden sm:inline">Download PDF</span>
            <span className="sm:hidden">PDF</span>
          </button>
        </header>

        {/* ========================================================= */}
        {/* MAIN WORKSPACE */}
        {/* ========================================================= */}
        <div className="flex-1 max-w-[1200px] w-full mx-auto p-4 sm:p-8 flex flex-col lg:flex-row gap-8 items-start">
          
          {/* LEFT: HTML DOCUMENT VIEWER (THIS IS WHAT PRINTS) */}
          <div className="flex-1 w-full bg-white border border-zinc-200/80 rounded-sm shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] print:border-none print:shadow-none print:w-full print:block">
            
            <div className="p-8 md:p-14 lg:p-20 font-serif text-zinc-800 leading-[1.8] text-[14px] text-justify print:p-0 print:text-black">
              
              <div className="text-center mb-14">
                <h2 className="text-xl font-bold uppercase tracking-widest border-b border-zinc-200 pb-4 inline-block mx-auto text-zinc-900">
                  Standard Tenancy Agreement
                </h2>
                <p className="mt-4 font-sans text-[10px] uppercase tracking-widest text-zinc-400 font-bold">
                  Document Reference: {data.leaseId.slice(-12).toUpperCase()}
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

              {/* Document Signatures with "Live Ink" styling */}
              <div className="mt-20 pt-10 border-t border-zinc-100 flex flex-col sm:flex-row justify-between gap-10 sm:gap-4 print:break-inside-avoid">
                
                <div className="w-full sm:w-56 font-sans">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-6">Landlord Signature</p>
                  <div className="h-12 border-b border-zinc-300 flex items-end pb-2">
                    <span className="text-2xl " style={{ fontFamily: "'Brush Script MT', 'Bradley Hand', cursive", lineHeight: 0.8 }}>
                      WunkatHomes Ltd.
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-3 font-medium">Verified System Counter-Signature</p>
                </div>

                <div className="w-full sm:w-56 font-sans">
                  <p className="text-[10px] uppercase tracking-widest text-zinc-400 font-bold mb-6">Tenant E-Signature</p>
                  <div className="h-12 border-b border-zinc-300 flex items-end pb-2">
                    <span className="text-3xl  truncate" style={{ fontFamily: "'Brush Script MT', 'Bradley Hand', cursive", lineHeight: 0.8 }}>
                      {data.signature.typedName}
                    </span>
                  </div>
                  <div className="mt-3 space-y-1">
                    <p className="text-[11px] text-zinc-400 font-medium">Date: <span className="text-zinc-600">{data.signature.signedAt}</span></p>
                    <p className="text-[11px] text-zinc-400 font-medium">IP Addr: <span className="text-zinc-600 font-mono">{data.signature.ipAddress}</span></p>
                  </div>
                </div>

              </div>
              
              <div className="mt-12 bg-zinc-50 p-4 rounded-md font-mono text-[10px] text-zinc-400 break-all border border-zinc-100 print:border-none print:bg-white print:p-0 print:text-black">
                <strong>SEC-HASH:</strong> {data.signature.documentHash}
              </div>

            </div>
          </div>

          {/* ========================================================= */}
          {/* RIGHT: AUDIT TRAIL SIDEBAR - HIDDEN DURING PRINT */}
          {/* ========================================================= */}
          <aside className="w-full lg:w-[340px] bg-white border border-zinc-200 rounded-xl p-6 shrink-0 shadow-sm print:hidden sticky top-24">
            
            <div className="flex items-center gap-2 mb-6">
              <h3 className="text-[14px] font-semibold text-zinc-900 tracking-tight">
                Document Audit Trail
              </h3>
            </div>
            
            <div className="space-y-4">
              <AuditRow 
                label="Document Status" 
                value={
                  <span className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2 py-0.5 rounded-md border border-green-200/60 w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Signed & Active
                  </span>
                } 
              />
              <AuditRow 
                label="Signed By" 
                value={data.signature.typedName} 
              />
              <AuditRow 
                label="Time of Signature" 
                value={data.signature.signedAt} 
              />
              <AuditRow 
                label="Network IP" 
                value={data.signature.ipAddress} 
                isMono
              />
              
              <div className="pt-2">
                <span className="block text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                  Security ID Code
                </span>
                <div className="bg-zinc-50 border border-zinc-200 rounded-md p-2.5">
                  <span className="font-mono text-[11px] text-zinc-700 break-all select-all leading-tight">
                    {data.signature.documentHash}
                  </span>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </main>
    </>
  )
}

// Small helper component for the Audit Trail rows
function AuditRow({ label, value, isMono = false }: { label: string, value: React.ReactNode, isMono?: boolean }) {
  return (
    <div className="flex flex-col border-b border-zinc-100 pb-3">
      <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-widest mb-1.5">
        {label}
      </span>
      <span className={`text-[13px] font-medium text-zinc-900 ${isMono ? 'font-mono tracking-tight' : ''}`}>
        {value}
      </span>
    </div>
  )
}