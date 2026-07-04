"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { useUserStore } from "@/store/user-store";
import { submitInquiry } from "@/actions/support.action";
import {
  CustomerSupportIcon,
  Cancel01Icon,
  MessageMultiple01Icon,
  SmartPhone01Icon,
  Mail01Icon,
  Alert02Icon,
  Key01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export default function SupportWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"contact" | "message" | "emergency">("contact");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user, isLoggedIn } = useUserStore();

  const [formData, setFormData] = useState({
    message: "",
    name: "",
    email: "",
  });

  // Pre-fill user data when they open the modal if logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [isLoggedIn, user, isOpen]);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
      // Reset state on close
      setActiveTab("contact");
      if (!isLoggedIn) {
        setFormData({ message: "", name: "", email: "" });
      } else {
        setFormData(prev => ({ ...prev, message: "" }));
      }
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isLoggedIn]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.message.trim()) {
      toast.error("Please enter a message.");
      return;
    }
    if (!isLoggedIn && (!formData.name.trim() || !formData.email.trim())) {
      toast.error("Name and email are required for guests.");
      return;
    }

    setIsSubmitting(true);
    const result = await submitInquiry({
      name: isLoggedIn && user?.name ? user.name : formData.name,
      email: isLoggedIn && user?.email ? user.email : formData.email,
      message: formData.message,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success(result.message);
      setFormData(prev => ({ ...prev, message: "" }));
      setIsOpen(false);
    } else {
      toast.error(result.message);
    }
  };

  return (
    <>
      {/* === The Floating Action Button (FAB) === */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200, damping: 20 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] w-14 h-14 bg-black text-white rounded-full flex items-center justify-center border-2 border-transparent hover:border-slate-400 transition-colors shadow-[0px_8px_24px_rgba(0,0,0,0.2)] group"
        aria-label="Open Support"
      >
        <HugeiconsIcon
          icon={CustomerSupportIcon}
          size={24}
          className="group-hover:scale-110 transition-transform"
        />
      </motion.button>

      {/* === The Centered Support Modal === */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
            {/* Dark Overlay Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            />

            {/* The Modal Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="relative w-full max-w-[420px] bg-white border border-slate-200 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-[120]"
            >
              {/* Modal Header */}
              <div className="bg-slate-50 px-6 py-5 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={CustomerSupportIcon}
                    size={22}
                    className="text-slate-900"
                  />
                  <h2 className="text-[15px] font-bold text-slate-900 tracking-tight">
                    How can we help you today?
                  </h2>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-200/50 rounded-full transition-colors"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={20} />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200">
                <button
                  onClick={() => setActiveTab("contact")}
                  className={`flex-1 py-3 text-xs font-semibold tracking-wide uppercase transition-colors ${
                    activeTab === "contact"
                      ? "text-slate-900 border-b-2 border-slate-900"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Contact
                </button>
                <button
                  onClick={() => setActiveTab("message")}
                  className={`flex-1 py-3 text-xs font-semibold tracking-wide uppercase transition-colors ${
                    activeTab === "message"
                      ? "text-slate-900 border-b-2 border-slate-900"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  Message
                </button>
             
              </div>

              {/* Modal Body */}
              <div className="p-6">
                {activeTab === "contact" && (
                  <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="text-center">
                      <p className="text-sm text-slate-600 font-medium mb-4">
                        Talk to our team directly. We're available 24/7.
                      </p>
                    </div>
                    <div className="flex flex-col gap-3">
                      <a 
                        href="https://wa.me/233241234567" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="w-full py-3.5 bg-black text-white font-bold text-[13px] rounded-md transition-all flex items-center justify-center gap-2"
                      >
                        <img src="/w-1.svg" alt="WhatsApp" className="w-[18px] h-[18px] object-contain" />
                        WhatsApp Support
                      </a>
                      <a 
                        href="tel:+233241234567"
                        className="w-full py-3.5 bg-slate-50 text-slate-900 font-bold text-[13px] border border-slate-200 rounded-md hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                      >
                        <HugeiconsIcon icon={SmartPhone01Icon} size={18} /> 
                        Call Us (+233 24 123 4567)
                      </a>
                      <a 
                        href="mailto:support@wunkat.com"
                        className="w-full py-3.5 bg-slate-50 text-slate-900 font-bold text-[13px] border border-slate-200 rounded-md hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                      >
                        <HugeiconsIcon icon={Mail01Icon} size={18} /> 
                        Email Support
                      </a>
                    </div>
                  </div>
                )}

                {activeTab === "message" && (
                  <form onSubmit={handleSubmit} className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <p className="text-sm text-slate-600 font-medium text-center mb-2">
                      Send us a message and we'll reply to your email.
                    </p>
                    
                    {!isLoggedIn && (
                      <div className="flex flex-col gap-3">
                        <input
                          type="text"
                          placeholder="Your Name"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                        />
                        <input
                          type="email"
                          placeholder="Your Email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                        />
                      </div>
                    )}
                    
                    <textarea
                      placeholder="How can we help you?"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all resize-none"
                    ></textarea>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full mt-2 py-3.5 bg-black text-white font-bold text-[13px] rounded-xl hover:bg-slate-900 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <HugeiconsIcon icon={Loading03Icon} size={18} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        "Send Message"
                      )}
                    </button>
                  </form>
                )}

                {activeTab === "emergency" && (
                  <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-red-50 border border-red-100 rounded-xl p-5 text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4">
                        <HugeiconsIcon icon={Alert02Icon} size={24} />
                      </div>
                      <h4 className="text-[14px] font-bold text-red-800 mb-2">
                        Urgent Maintenance & Lockouts
                      </h4>
                      <p className="text-xs text-red-700/80 font-medium leading-relaxed mb-6">
                        Are you locked out or experiencing a critical physical infrastructure failure? 
                        Use our dedicated emergency line for immediate assistance.
                      </p>
                      
                      <a 
                        href="tel:+233241234567"
                        className="w-full py-3.5 bg-white text-red-700 font-bold text-[13px] border border-red-200 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2 shadow-sm"
                      >
                        <HugeiconsIcon icon={Key01Icon} size={18} />
                        Request Lock Override
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
