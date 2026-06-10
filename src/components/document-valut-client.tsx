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
import { TenancyDocument } from "./lease-document viewer"

// NOTE: Update this import path to point to your actual TenancyDocument component

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
          <div className="flex-1 w-full print:border-none print:shadow-none print:w-full print:block">
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