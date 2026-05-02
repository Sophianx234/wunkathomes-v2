"use client";

import { 
  Shield01Icon, 
  UserCircleIcon, 
  Mail01Icon, 
  SmartPhone01Icon,
  CreditCardIcon,
  CheckmarkBadge01Icon,
  Alert02Icon,
  LockKeyIcon,
  Delete01Icon,
  Add01Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function SettingsPage() {
  // Mock Data: In production, fetch this from your auth/session context
  const user = {
    legalName: "Kwame Mensah",
    email: "kwame.mensah@example.com",
    phone: "+233 24 123 4567",
    isKycVerified: true, // Toggle this to false to see the amber warning state!
    ghanaCardLast4: "8921",
    savedPayments: [
      { id: "pm_1", type: "CARD", brand: "Visa", last4: "4242", expiry: "12/28" },
      { id: "pm_2", type: "MOMO", brand: "MTN", last4: "4567", expiry: "N/A" }
    ]
  };

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* === Header === */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/10 pb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black mb-2">
            Identity Vault
          </h1>
          <p className="text-sm font-medium text-slate-500">
            Manage your KYC verification, contact ledger, and secure payment tokens.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* === LEFT COLUMN (KYC & Contact) === */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* SECTION 1: Identity Verification (KYC) */}
          <div className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8 relative overflow-hidden">
            <h2 className="text-sm font-black uppercase tracking-widest text-black mb-6 flex items-center gap-2">
              <HugeiconsIcon icon={Shield01Icon} size={18} />
              Legal Identity (KYC)
            </h2>

            {user.isKycVerified ? (
              // VERIFIED STATE
              <div className="bg-green-50 border border-green-200 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <HugeiconsIcon icon={CheckmarkBadge01Icon} size={20} className="text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-green-800 mb-1">
                      Ghana Card Verified
                    </h3>
                    <p className="text-[11px] font-medium text-green-700 leading-relaxed">
                      Your identity is secured. Your legal name is locked to protect the integrity of your digital lease agreements.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // UNVERIFIED STATE
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6">
                <div className="flex items-start gap-3">
                  <HugeiconsIcon icon={Alert02Icon} size={20} className="text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-amber-800 mb-1">
                      Verification Required
                    </h3>
                    <p className="text-[11px] font-medium text-amber-700 leading-relaxed mb-3">
                      You must verify your Ghana Card (NIA) to schedule viewings or sign contracts.
                    </p>
                    <button className="text-[10px] font-black uppercase tracking-widest bg-amber-600 text-white px-4 py-2 rounded shadow-sm hover:bg-amber-700 transition-colors">
                      Begin Verification
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Inputs (Locked if verified) */}
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Full Legal Name
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={user.legalName} 
                    disabled={user.isKycVerified}
                    className="w-full p-4 pl-11 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-black disabled:text-slate-500 cursor-not-allowed" 
                  />
                  <HugeiconsIcon icon={UserCircleIcon} size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  {user.isKycVerified && <HugeiconsIcon icon={LockKeyIcon} size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />}
                </div>
              </div>

              {user.isKycVerified && (
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                    National ID Number (Masked)
                  </label>
                  <input 
                    type="text" 
                    value={`GHA-*********-${user.ghanaCardLast4}`} 
                    disabled 
                    className="w-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono text-slate-500 cursor-not-allowed tracking-widest" 
                  />
                </div>
              )}
            </div>
          </div>

          {/* SECTION 2: Contact Ledger */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
            <h2 className="text-sm font-black uppercase tracking-widest text-black mb-6">
              Contact Ledger
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Primary Email
                </label>
                <div className="relative">
                  <input 
                    type="email" 
                    defaultValue={user.email} 
                    className="w-full p-4 pl-11 bg-white border border-slate-300 rounded-lg text-sm font-bold text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" 
                  />
                  <HugeiconsIcon icon={Mail01Icon} size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500">
                    WhatsApp Number
                  </label>
                  <span className="text-[9px] font-bold uppercase tracking-widest text-green-600 bg-green-50 px-1.5 py-0.5 rounded border border-green-100">Verified</span>
                </div>
                <div className="relative">
                  <input 
                    type="tel" 
                    defaultValue={user.phone} 
                    className="w-full p-4 pl-11 bg-white border border-slate-300 rounded-lg text-sm font-bold text-black focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-all" 
                  />
                  <HugeiconsIcon icon={SmartPhone01Icon} size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <button className="w-full py-4 bg-slate-100 text-black font-black uppercase tracking-widest text-xs rounded-xl hover:bg-slate-200 transition-colors mt-2">
                Update Contact Info
              </button>
            </div>
          </div>

        </div>

        {/* === RIGHT COLUMN (Payments & Security) === */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* SECTION 3: Payment Infrastructure */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 md:p-8">
            <h2 className="text-sm font-black uppercase tracking-widest text-black mb-1">
              Payment Tokens
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-1.5">
              <HugeiconsIcon icon={LockKeyIcon} size={12} />
              Secured by Paystack
            </p>

            <div className="space-y-3 mb-6">
              {user.savedPayments.map((payment) => (
                <div key={payment.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between group shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded shrink-0 text-slate-600">
                      {payment.type === 'CARD' ? <HugeiconsIcon icon={CreditCardIcon} size={16} /> : <HugeiconsIcon icon={SmartPhone01Icon} size={16} />}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-black uppercase tracking-widest">
                        {payment.brand} •••• {payment.last4}
                      </p>
                      {payment.expiry !== "N/A" && (
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Expires {payment.expiry}</p>
                      )}
                    </div>
                  </div>
                  <button className="text-slate-300 hover:text-red-500 transition-colors">
                    <HugeiconsIcon icon={Delete01Icon} size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button className="w-full py-4 bg-white border-2 border-black text-black font-black uppercase tracking-widest text-[10px] rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 border-dashed">
              <HugeiconsIcon icon={Add01Icon} size={14} />
              Add Payment Method
            </button>

            <p className="text-[9px] text-center font-medium text-slate-500 mt-6 leading-relaxed">
              WunkatHomes does not store raw credit card or MoMo pin data on our servers. All financial tokens are vaulted externally.
            </p>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 border border-red-100 rounded-2xl p-6">
             <h4 className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-2">Danger Zone</h4>
             <p className="text-xs font-medium text-red-800/70 mb-4">
               Permanently close your Wunkat account and delete your identity tokens. Active leases must be resolved first.
             </p>
             <button className="text-[10px] font-bold uppercase tracking-widest text-red-600 border-b border-red-600 pb-0.5 hover:text-red-800 hover:border-red-800 transition-colors">
                Delete Account
             </button>
          </div>

        </div>

      </div>
    </div>
  );
}