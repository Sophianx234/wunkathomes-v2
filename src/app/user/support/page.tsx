"use client";

import Image from "next/image";
import { 
  CustomerSupportIcon, 
  MessageMultiple01Icon, 
  SmartPhone01Icon,
  Alert02Icon,
  Key01Icon,
  HelpCircleIcon,
  ArrowDown01Icon,
  Mail01Icon,
  Wrench01Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useState } from "react";

export default function SupportPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Mock Data: Fetch from DB based on user session
  const portfolioManager = {
    name: "Sarah Mensah",
    title: "Senior Portfolio Manager",
    phone: "+233 24 123 4567",
    email: "sarah.m@wunkathomes.com",
    image: "/images/team/sarah.jpg" // Replace with actual image
  };

  const faqs = [
    {
      question: "How does the $500 Refundable Hold work?",
      answer: "When you place a hold, the asset is removed from the public market for 72 hours. Your funds are held securely in escrow via Paystack. If you decline the property after physical inspection, the $500 is reversed to your original payment method instantly."
    },
    {
      question: "How do I access the property for my viewing?",
      answer: "Once your hold is placed or your Wunkat ID is verified, you can generate a temporary Tuya Smart-Lock PIN from your dashboard. This PIN will be active for 45 minutes around your scheduled viewing time."
    },
    {
      question: "Can I pay my annual rent in installments?",
      answer: "Currently, WunkatHomes requires annual upfront clearance for rental properties via our secure Virtual Account wire system. However, specific installment plans can be negotiated directly with your Portfolio Manager."
    },
    {
      question: "My Smart Lock PIN isn't working. What do I do?",
      answer: "Ensure your Bluetooth is enabled if using the app proximity unlock. If the keypad is unresponsive, contact the 24/7 Asset Emergency line immediately for an remote override."
    }
  ];

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 py-8 md:py-12 px-4 sm:px-6 lg:px-8">
      
      {/* === Header === */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-black/10 pb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-black mb-3">
            Concierge & Support
          </h1>
          <p className="text-sm md:text-base font-medium text-slate-500 max-w-xl">
            Direct access to your dedicated portfolio management team and 24/7 physical asset emergency response.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        
        {/* === LEFT COLUMN: The Human Touch & Emergencies === */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* Section 1: Dedicated Portfolio Manager */}
          <div className="bg-white border-2 border-black rounded-2xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 md:p-8">
            <div className="flex items-center gap-2 mb-6">
              <HugeiconsIcon icon={CustomerSupportIcon} size={20} className="text-black" />
              <h2 className="text-sm font-black uppercase tracking-widest text-black">
                Your Dedicated Manager
              </h2>
            </div>

            <div className="flex flex-col items-center text-center mb-8">
              <div className="w-24 h-24 bg-slate-200 rounded-full mb-4 relative overflow-hidden border-2 border-slate-100">
                {/* Fallback avatar */}
                <div className="absolute inset-0 flex items-center justify-center text-slate-400 bg-slate-100">
                  <HugeiconsIcon icon={CustomerSupportIcon} size={32} />
                </div>
                {/* <Image src={portfolioManager.image} alt={portfolioManager.name} fill className="object-cover relative z-10" /> */}
              </div>
              <h3 className="text-xl font-black uppercase tracking-tight text-black">
                {portfolioManager.name}
              </h3>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">
                {portfolioManager.title}
              </p>
            </div>

            <div className="flex flex-col gap-3">
              {/* WhatsApp Button */}
              <button className="w-full py-4 bg-green-600 text-white font-black uppercase tracking-widest text-[11px] rounded-xl hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 flex items-center justify-center gap-2">
                <HugeiconsIcon icon={MessageMultiple01Icon} size={18} />
                Message on WhatsApp
              </button>
              
              <div className="grid grid-cols-2 gap-3">
                <button className="w-full py-3 bg-slate-50 text-black font-black uppercase tracking-widest text-[10px] border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5">
                  <HugeiconsIcon icon={SmartPhone01Icon} size={14} /> Call
                </button>
                <button className="w-full py-3 bg-slate-50 text-black font-black uppercase tracking-widest text-[10px] border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5">
                  <HugeiconsIcon icon={Mail01Icon} size={14} /> Email
                </button>
              </div>
            </div>
            
            <p className="text-[9px] text-center font-medium text-slate-500 mt-6 leading-relaxed">
              Available Monday - Saturday <br /> 8:00 AM to 6:00 PM GMT.
            </p>
          </div>

          {/* Section 2: Asset Emergencies */}
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 md:p-8">
            <h2 className="text-xs font-black uppercase tracking-widest text-red-800 mb-4 flex items-center gap-2">
              <HugeiconsIcon icon={Alert02Icon} size={16} />
              24/7 Asset Emergency
            </h2>
            <p className="text-[11px] font-medium text-red-800/80 mb-6 leading-relaxed">
              For immediate physical infrastructure issues at an active Wunkat property only.
            </p>
            
            <div className="space-y-3">
              <button className="w-full py-3 bg-white text-red-700 font-bold uppercase tracking-widest text-[10px] border border-red-200 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-between px-4 shadow-sm">
                <span className="flex items-center gap-2">
                  <HugeiconsIcon icon={Key01Icon} size={14} /> Smart Lock Failure
                </span>
                <span>Dial Ext. 1</span>
              </button>
              <button className="w-full py-3 bg-white text-red-700 font-bold uppercase tracking-widest text-[10px] border border-red-200 rounded-xl hover:bg-red-100 transition-colors flex items-center justify-between px-4 shadow-sm">
                <span className="flex items-center gap-2">
                  <HugeiconsIcon icon={Wrench01Icon} size={14} /> Plumbing / Electrical
                </span>
                <span>Dial Ext. 2</span>
              </button>
            </div>
          </div>

        </div>

        {/* === RIGHT COLUMN: Knowledge Ledger (FAQs) === */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm h-full">
            <h2 className="text-sm font-black uppercase tracking-widest text-black mb-8 flex items-center gap-2 pb-6 border-b border-slate-100">
              <HugeiconsIcon icon={HelpCircleIcon} size={18} />
              The Knowledge Ledger
            </h2>

            <div className="flex flex-col gap-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div 
                    key={index} 
                    className={`border border-slate-200 rounded-xl overflow-hidden transition-colors ${isOpen ? 'bg-slate-50' : 'bg-white hover:bg-slate-50/50'}`}
                  >
                    <button 
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="w-full text-left p-5 flex items-center justify-between focus:outline-none"
                    >
                      <span className="text-xs md:text-sm font-bold text-black uppercase tracking-widest leading-snug pr-4">
                        {faq.question}
                      </span>
                      <HugeiconsIcon 
                        icon={ArrowDown01Icon} 
                        size={18} 
                        className={`text-slate-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-black' : ''}`} 
                      />
                    </button>
                    
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                      <div className="p-5 pt-0 text-[11px] md:text-xs font-medium text-slate-600 leading-relaxed border-t border-slate-200/50 mt-2 mx-5">
                        {faq.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-10 p-6 bg-slate-100 rounded-xl border border-slate-200 text-center">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                Still have questions?
              </h4>
              <p className="text-[11px] text-slate-600 mb-4">
                Our support team operates out of the Wunkat Hub in Accra.
              </p>
              <button className="text-[10px] font-bold uppercase tracking-widest border-b-[1.5px] border-black pb-0.5 hover:text-slate-500 hover:border-slate-500 transition-colors text-black">
                Send a General Inquiry
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}