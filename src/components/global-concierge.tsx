"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  CustomerSupportIcon, 
  Cancel01Icon,
  MessageMultiple01Icon,
  SmartPhone01Icon,
  Mail01Icon,
  Alert02Icon,
  Key01Icon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function GlobalConcierge() {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent background scrolling when the drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const portfolioManager = {
    name: "Sarah Mensah",
    title: "Senior Portfolio Manager",
    phone: "+233 24 123 4567",
    email: "sarah.m@wunkat.com"
  };

  return (
    <>
      {/* === 1. The Floating Action Button (FAB) === */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] w-14 h-14 bg-black text-white rounded-full flex items-center justify-center border-2 border-transparent hover:border-slate-400 transition-colors shadow-[0px_8px_24px_rgba(0,0,0,0.2)] group"
        aria-label="Open Concierge"
      >
        <HugeiconsIcon icon={CustomerSupportIcon} size={24} className="group-hover:scale-110 transition-transform" />
        
        {/* Unread Message Indicator (Optional detail for FOMO/Urgency) */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-black rounded-full animate-pulse"></span>
      </motion.button>

      {/* === 2. The Slide-Out Drawer === */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Dark Overlay Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[110]"
            />

            {/* The Drawer Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-[100dvh] w-full max-w-[400px] bg-slate-50 border-l-2 border-black z-[120] flex flex-col shadow-[-20px_0px_40px_rgba(0,0,0,0.1)] overflow-y-auto"
            >
              
              {/* Drawer Header */}
              <div className="bg-white px-6 py-6 border-b border-slate-200 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={CustomerSupportIcon} size={20} className="text-black" />
                  <h2 className="text-sm font-black uppercase tracking-widest text-black">
                    Private Concierge
                  </h2>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-slate-100 text-slate-500 hover:text-black hover:bg-slate-200 rounded-full transition-colors"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={18} />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="p-6 flex flex-col gap-8">
                
                {/* The Manager Profile */}
                <div className="bg-white border-2 border-black rounded-xl p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center flex flex-col items-center">
                  <div className="w-20 h-20 bg-slate-100 rounded-full mb-3 border-2 border-slate-200 flex items-center justify-center overflow-hidden relative">
                    {/* Fallback Icon / Add Next Image here */}
                    <HugeiconsIcon icon={CustomerSupportIcon} size={32} className="text-slate-400" />
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-black">
                    {portfolioManager.name}
                  </h3>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-1 mb-6">
                    {portfolioManager.title}
                  </p>

                  <div className="w-full flex flex-col gap-3">
                    <button className="w-full py-3.5 bg-green-600 text-white font-black uppercase tracking-widest text-[11px] rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-600/20 flex items-center justify-center gap-2">
                      <HugeiconsIcon icon={MessageMultiple01Icon} size={16} />
                      WhatsApp Message
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="w-full py-3 bg-slate-50 text-black font-black uppercase tracking-widest text-[10px] border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5">
                        <HugeiconsIcon icon={SmartPhone01Icon} size={14} /> Call
                      </button>
                      <button className="w-full py-3 bg-slate-50 text-black font-black uppercase tracking-widest text-[10px] border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5">
                        <HugeiconsIcon icon={Mail01Icon} size={14} /> Email
                      </button>
                    </div>
                  </div>
                </div>

                {/* The Emergency Block */}
                <div className="bg-red-50 border border-red-200 rounded-xl p-5">
                  <h4 className="text-[11px] font-black uppercase tracking-widest text-red-800 mb-3 flex items-center gap-1.5">
                    <HugeiconsIcon icon={Alert02Icon} size={14} />
                    Active Asset Emergency
                  </h4>
                  <p className="text-[10px] font-medium text-red-800/80 mb-4 leading-relaxed">
                    Locked out? Experiencing a critical physical infrastructure failure?
                  </p>
                  <button className="w-full py-3 bg-white text-red-700 font-bold uppercase tracking-widest text-[10px] border border-red-200 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-between px-3 shadow-sm">
                    <span className="flex items-center gap-2">
                      <HugeiconsIcon icon={Key01Icon} size={14} /> Tuya Lock Override
                    </span>
                    <span>Dial Ext. 1</span>
                  </button>
                </div>

                <p className="text-[9px] text-center font-bold text-slate-400 uppercase tracking-widest leading-relaxed mt-auto pt-8">
                  Wunkat Homes Hub • Accra, Ghana <br /> Always at your service.
                </p>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}