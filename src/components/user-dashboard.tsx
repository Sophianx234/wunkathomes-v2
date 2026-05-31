"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"
import {
  CheckmarkBadge01Icon,
  Key01Icon,
  Wifi01Icon,
  MapPinIcon,
  EyeIcon,
  ViewOffIcon,
  Wrench01Icon,
  CreditCardIcon,
  Loading03Icon,
  SignatureIcon
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import Link from "next/link"

// Define the shape of the data passed from the Server Component
export interface DashboardProps {
  user: {
    name: string;
    kycStatus: string;
  };
  lease: {
    id: string;
    status: string;
    totalRentAmount: number;
    startDate: string;
    endDate?: string;
    smartLockPin?: string;
    signatureAudit: {
      isSigned: boolean;
    };
  };
  listing: {
    title: string;
    images: string[];
    location: string;
    // Mocking move-in details since they aren't in the schema yet
    wifiNetwork?: string; 
    wifiPassword?: string;
  };
}

export function UserDashboard({ user, lease, listing }: DashboardProps) {
  // --- State ---
  // If the lease is already Active, start on the Dashboard. Otherwise, start on the Signing view.
  const [view, setView] = useState<'SIGNING' | 'ACTIVE'>(
    lease.status === 'Active' ? 'ACTIVE' : 'SIGNING'
  )
  
  // Signing Form State
  const [agreed, setAgreed] = useState(false)
  const [typedName, setTypedName] = useState("")
  const [isSigning, setIsSigning] = useState(false)

  // PIN Reveal State
  const [showPin, setShowPin] = useState(false)

  // --- Handlers ---
  const handleSignAgreement = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (typedName.trim().toLowerCase() !== user.name.toLowerCase()) {
      toast.error("Signature must match your registered name exactly.")
      return
    }

    setIsSigning(true)

    try {
      // In a real app, you would call a Server Action here:
      // await signLeaseAction(lease.id, typedName)
      
      // Mock network delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      toast.success("Agreement signed successfully!")
      setView('ACTIVE')
      
    } catch (error) {
      toast.error("Failed to sign agreement. Please try again.")
    } finally {
      setIsSigning(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24">
      
      {/* Dynamic Header */}
      <header className="bg-zinc-950 text-white pt-24 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto flex justify-between items-end">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">
              {view === 'SIGNING' ? 'Action Required' : 'Tenant Dashboard'}
            </h1>
            <p className="text-sm font-medium text-slate-400">
              {view === 'SIGNING' 
                ? 'Your identity is verified. Finalize your tenancy agreement below.' 
                : `Welcome home, ${user.name.split(' ')[0]}.`}
            </p>
          </div>
          {view === 'ACTIVE' && (
            <div className="hidden md:flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-white">Active Stay</span>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 relative z-10">
        <AnimatePresence mode="wait">
          
          {/* ===================================================================== */}
          {/* VIEW 1: THE DIGITAL SIGNATURE */}
          {/* ===================================================================== */}
          {view === 'SIGNING' && (
            <motion.div 
              key="signing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col lg:flex-row"
            >
              {/* Left Side: The Document Viewer */}
              <div className="w-full lg:w-2/3 bg-slate-100 border-r border-slate-200 p-6 flex flex-col h-[600px]">
                <div className="flex items-center gap-3 mb-4">
                  <HugeiconsIcon icon={SignatureIcon} size={24} className="text-slate-600" />
                  <h2 className="text-lg font-bold text-slate-900">Tenancy Agreement</h2>
                </div>
                
                {/* Mock PDF Viewer Frame */}
                <div className="flex-1 bg-white border border-slate-300 rounded-lg shadow-inner overflow-y-auto p-8 relative">
                  <div className="max-w-lg mx-auto prose prose-sm prose-slate">
                    <h3 className="text-center font-black uppercase tracking-widest text-slate-900 border-b-2 border-black pb-4 mb-6">Standard Tenancy Agreement</h3>
                    <p className="font-bold text-[10px] tracking-widest uppercase text-slate-400 mb-6">Generated on {new Date().toLocaleDateString()}</p>
                    <p>This Tenancy Agreement is made between WunkatHomes (hereinafter referred to as the "Landlord") and <strong>{user.name}</strong> (hereinafter referred to as the "Tenant").</p>
                    <p><strong>1. Property:</strong> The Landlord agrees to let and the Tenant agrees to take the property known as <strong>{listing.title}</strong> located at <strong>{listing.location}</strong>.</p>
                    <p><strong>2. Term:</strong> The tenancy shall commence on <strong>{new Date(lease.startDate).toLocaleDateString()}</strong>.</p>
                    <p><strong>3. Rent:</strong> The total rent amount of <strong>${lease.totalRentAmount.toLocaleString()}</strong> has been paid and verified in full via secure gateway.</p>
                    <p><strong>4. Smart Lock Access:</strong> The Tenant agrees not to share their unique Tuya Smart Lock PIN with unauthorized individuals. Access logs are actively monitored for security purposes.</p>
                    {/* Filler content to make it scrollable */}
                    {[...Array(3)].map((_, i) => (
                      <p key={i} className="text-slate-300 bg-slate-100 mt-2 h-4 w-full rounded" />
                    ))}
                  </div>
                  {/* Fade out at bottom to indicate scrolling */}
                  <div className="sticky bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                </div>
              </div>

              {/* Right Side: The Signing Action */}
              <div className="w-full lg:w-1/3 p-8 flex flex-col justify-center bg-white">
                <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mb-6 border border-green-100">
                  <HugeiconsIcon icon={CheckmarkBadge01Icon} size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Identity Verified</h3>
                <p className="text-sm text-slate-500 mb-8 leading-relaxed">
                  Your KYC has been approved. Please review the agreement on the left. Type your legal name to apply your binding digital signature.
                </p>

                <form onSubmit={handleSignAgreement} className="space-y-6 mt-auto">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                      <input 
                        type="checkbox" 
                        required
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-2 focus:ring-primary/20 checked:bg-primary checked:border-primary transition-all"
                      />
                      <HugeiconsIcon 
                        icon={CheckmarkBadge01Icon} 
                        size={14} 
                        className="absolute text-white opacity-0 peer-checked:opacity-100 pointer-events-none" 
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-600 group-hover:text-black transition-colors leading-relaxed">
                      I have read, understood, and agree to the terms outlined in the Tenancy Agreement.
                    </span>
                  </label>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-2">
                      Digital Signature
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder={user.name}
                      value={typedName}
                      onChange={(e) => setTypedName(e.target.value)}
                      className="w-full p-4 border border-slate-300 rounded-lg text-sm font-bold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-slate-50 focus:bg-white transition-all font-signature text-lg"
                      style={{ fontFamily: "'Dancing Script', cursive" }} // If you have a script font loaded
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={!agreed || !typedName || isSigning}
                    className="w-full py-4 bg-primary text-white font-black uppercase tracking-widest text-xs rounded-xl hover:bg-black transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                  >
                    {isSigning && <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />}
                    {isSigning ? "Securing Ledger..." : "Sign & Generate Keys"}
                  </button>
                  <p className="text-[9px] text-center font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                    By signing, your IP Address and timestamp are securely recorded to the blockchain ledger.
                  </p>
                </form>
              </div>
            </motion.div>
          )}

          {/* ===================================================================== */}
          {/* VIEW 2: THE ACTIVE TENANT DASHBOARD */}
          {/* ===================================================================== */}
          {view === 'ACTIVE' && (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              {/* HERO: Property & PIN Reveal */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Property Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col sm:flex-row">
                  <div className="w-full sm:w-2/5 h-48 sm:h-auto relative bg-slate-100">
                    <Image src={listing.images[0] || '/placeholder.jpg'} alt="Property" fill className="object-cover" />
                  </div>
                  <div className="p-6 sm:p-8 flex flex-col justify-center flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Active Lease
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">{listing.title}</h2>
                    <p className="text-sm font-medium text-slate-500 mb-6 flex items-center gap-2">
                      <HugeiconsIcon icon={MapPinIcon} size={16} /> {listing.location}
                    </p>
                    <div className="mt-auto flex gap-6 border-t border-slate-100 pt-6">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Start Date</p>
                        <p className="text-sm font-bold text-slate-900">{new Date(lease.startDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Rent Value</p>
                        <p className="text-sm font-bold text-slate-900">${lease.totalRentAmount.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DIGITAL KEYS BLOCK */}
                <div className="bg-zinc-950 rounded-2xl shadow-xl border border-zinc-800 p-8 flex flex-col justify-center relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-6 opacity-10">
                    <HugeiconsIcon icon={Key01Icon} size={120} />
                  </div>
                  
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center mb-6 border border-white/20">
                      <HugeiconsIcon icon={Key01Icon} size={24} className="text-white" />
                    </div>
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">Your Smart Lock PIN</h3>
                    
                    <div className="flex items-center gap-4 mb-8">
                      <div className="font-mono text-3xl font-black text-white tracking-[0.2em]">
                        {showPin ? (lease.smartLockPin || "849201") : "••••••"}
                      </div>
                      <button 
                        onClick={() => setShowPin(!showPin)}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-400 hover:text-white"
                      >
                        <HugeiconsIcon icon={showPin ? ViewOffIcon : EyeIcon} size={20} />
                      </button>
                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400 flex items-center gap-2"><HugeiconsIcon icon={Wifi01Icon} size={16} /> Network</span>
                        <span className="font-bold text-white">{listing.wifiNetwork || "Wunkat_5G"}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Password</span>
                        <span className="font-mono font-bold text-white bg-black px-2 py-0.5 rounded">{listing.wifiPassword || "wunkat2026"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION: UTILITIES & ACTIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* Maintenance */}
                <Link href="/user/maintenance" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-primary hover:shadow-md transition-all text-left flex flex-col gap-4 group">
                  <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <HugeiconsIcon icon={Wrench01Icon} size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Report an Issue</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Create a maintenance ticket for plumbing, AC, or smart lock issues.</p>
                  </div>
                </Link>

                {/* Ledger */}
                <Link href="/user/transactions" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-primary hover:shadow-md transition-all text-left flex flex-col gap-4 group">
                  <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <HugeiconsIcon icon={CreditCardIcon} size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Payment Ledger</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">View your transaction history and download official receipts.</p>
                  </div>
                </Link>

                {/* Documents */}
                <Link href="/user/documents" className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-primary hover:shadow-md transition-all text-left flex flex-col gap-4 group">
                  <div className="w-10 h-10 bg-slate-50 text-slate-600 rounded-full flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    <HugeiconsIcon icon={SignatureIcon} size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-1">Lease Document</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">Download a PDF copy of your signed digital tenancy agreement.</p>
                  </div>
                </Link>

              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </main>
  )
}