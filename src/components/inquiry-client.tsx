"use client";

import React, { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import {
  Search01Icon,
  MessageMultiple01Icon,
  Cancel01Icon,
  Clock01Icon,
  Loading03Icon,
  CheckmarkCircle01Icon,
  Mail01Icon,
  UserCircleIcon,
  SmartPhone01Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { updateInquiryStatus, deleteInquiry } from "@/actions/inquiry.actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface InquiryType {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  userId: string | null;
  isGuest: boolean;
  status: "Open" | "In_Progress" | "Resolved" | "Closed";
  createdAt: string;
  updatedAt: string;
}

interface InquiryClientProps {
  initialInquiries: InquiryType[];
}

const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} days ago`;
  
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Open":
      return "bg-slate-100 text-slate-800 border-slate-200";
    case "In_Progress":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "Resolved":
    case "Closed":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    default:
      return "bg-slate-100 text-slate-800 border-slate-200";
  }
};

export default function InquiryClient({ initialInquiries }: InquiryClientProps) {
  const [inquiries, setInquiries] = useState<InquiryType[]>(initialInquiries);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | "Open" | "Resolved">("All");
  
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryType | null>(null);
  const [isPending, startTransition] = useTransition();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filteredInquiries = useMemo(() => {
    let filtered = inquiries;
    
    if (statusFilter !== "All") {
      filtered = filtered.filter(inq => inq.status === statusFilter);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (inq) =>
          inq.name.toLowerCase().includes(q) ||
          inq.email.toLowerCase().includes(q) ||
          inq.message.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [inquiries, searchQuery, statusFilter]);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === "Resolved" ? "Open" : "Resolved";
    
    startTransition(async () => {
      // Optimistic Update
      setInquiries((prev) =>
        prev.map((inq) => (inq._id === id ? { ...inq, status: newStatus } : inq))
      );
      if (selectedInquiry?._id === id) {
        setSelectedInquiry({ ...selectedInquiry, status: newStatus });
      }

      const res = await updateInquiryStatus(id, newStatus);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
        setInquiries(initialInquiries); // Revert
      }
    });
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    startTransition(async () => {
      // Optimistic Update
      setInquiries((prev) => prev.filter((inq) => inq._id !== deleteId));
      if (selectedInquiry?._id === deleteId) {
        setSelectedInquiry(null);
      }
      
      const res = await deleteInquiry(deleteId);
      if (res.success) {
        toast.success(res.message);
      } else {
        toast.error(res.message);
        setInquiries(initialInquiries);
      }
      setDeleteId(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER & CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Support Inquiries
        </h1>
      </div>
      
      {/* FILTER BAR */}
      <section className="flex flex-col md:flex-row items-center gap-3 bg-white p-1.5 border border-slate-200 rounded-lg w-full">
        <div className="relative w-full md:flex-1">
          <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search name, email, or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] bg-transparent placeholder:text-slate-400 rounded-lg"
          />
        </div>

        <div className="h-4 w-px bg-slate-200 hidden md:block mx-1" />

        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto px-2 pb-1 md:pb-0">
          <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)}>
            <SelectTrigger className="w-full md:w-[130px] h-8 border-0 bg-slate-50 hover:bg-slate-100 text-[12px] font-medium text-slate-700 focus:ring-0 rounded-md">
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Open">Open</SelectItem>
              <SelectItem value="Resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>

          <div className="h-4 w-px bg-slate-200 hidden md:block mx-1" />

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("All");
            }}
            className="h-8 w-8 text-slate-500 hover:text-slate-900 hover:bg-slate-100 shrink-0 ml-auto md:ml-0 rounded-md"
          >
            <HugeiconsIcon icon={FilterIcon} size={14} />
          </Button>
        </div>
      </section>

      {/* INQUIRIES TABLE */}
      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-slate-200 bg-slate-50/50 text-[12px] font-medium text-slate-500 tracking-tight">
          <div className="col-span-12 md:col-span-3">Sender</div>
          <div className="hidden md:block col-span-3">User Context</div>
          <div className="hidden md:block col-span-3">Message Snippet</div>
          <div className="hidden md:block col-span-1 text-center">Status</div>
          <div className="hidden md:block col-span-2 text-right">Date</div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredInquiries.map((inq) => (
            <div 
              key={inq._id} 
              className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50/50 transition-colors cursor-pointer group"
              onClick={() => setSelectedInquiry(inq)}
            >
              {/* Sender */}
              <div className="col-span-12 md:col-span-3 flex flex-col min-w-0">
                <span className="text-[13px] font-semibold tracking-tight text-slate-900 truncate">
                  {inq.name}
                </span>
                <span className="text-[12px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                   {inq.email}
                </span>
              </div>

              {/* User Context */}
              <div className="hidden md:flex col-span-3 items-center">
                {inq.isGuest ? (
                  <Badge variant="outline" className="px-2 py-0.5 border rounded-sm border-slate-200 bg-slate-50 text-slate-600 font-bold tracking-widest uppercase text-[9px] flex items-center gap-1">
                    <HugeiconsIcon icon={UserCircleIcon} size={10} /> Guest
                  </Badge>
                ) : (
                  <Badge variant="outline" className="px-2 py-0.5 border border-slate-200 rounded-sm bg-black text-white font-bold tracking-widest uppercase text-[9px] flex items-center gap-1">
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} /> Tenant
                  </Badge>
                )}
              </div>

              {/* Message */}
              <div className="hidden md:flex col-span-3 text-[13px] text-slate-600 truncate pr-4">
                {inq.message}
              </div>

              {/* Status */}
              <div className="hidden md:flex col-span-1 justify-center items-center">
                <Badge variant="outline" className={`px-2 py-0.5 rounded-sm border ${getStatusBadge(inq.status)} font-bold tracking-widest  text-[9px]`}>
                  {inq.status}
                </Badge>
              </div>

              {/* Date */}
              <div className="hidden md:flex col-span-2 justify-end items-center gap-1.5 text-slate-500 text-[12px] font-medium">
                <HugeiconsIcon icon={Clock01Icon} size={14} />
                {formatRelativeTime(inq.createdAt)}
              </div>
            </div>
          ))}

          {filteredInquiries.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center justify-center">
              <HugeiconsIcon icon={MessageMultiple01Icon} size={32} className="text-slate-300 mb-3" />
              <p className="text-[13px] font-medium text-slate-500">No inquiries found.</p>
            </div>
          )}
        </div>
      </div>

      {/* CRM VIEW MODAL */}
      <Dialog open={!!selectedInquiry} onOpenChange={(open) => !open && setSelectedInquiry(null)}>
        <DialogContent className="w-full sm:max-w-xl p-0 bg-white border border-slate-200 rounded-2xl overflow-hidden font-sans">
          {selectedInquiry && (
            <div className="flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`px-2 py-0.5 border ${getStatusBadge(selectedInquiry.status)} font-bold tracking-widest  text-[9px]`}>
                    {selectedInquiry.status}
                  </Badge>
                  <span className="text-[11px] font-semibold text-slate-400 font-mono">
                    ID: {selectedInquiry._id.slice(-6).toUpperCase()}
                  </span>
                </div>
                
              </div>

              {/* Scrollable Data Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* 1. Contact Details Grid */}
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Contact Details</h3>
                  <div className="grid grid-cols-2 gap-4 bg-white border border-slate-200 rounded-xl p-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Name</p>
                      <p className="text-[13px] font-bold text-slate-900">{selectedInquiry.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">User Type</p>
                      {selectedInquiry.isGuest ? (
                        <p className="text-[13px] font-bold text-slate-600 flex items-center gap-1.5">
                          <HugeiconsIcon icon={UserCircleIcon} size={14} /> Guest 
                        </p>
                      ) : (
                        <p className="text-[13px] font-bold text-slate-900 flex items-center gap-1.5">
                          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-emerald-500" /> Verified Tenant
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Email</p>
                      <p className="text-[13px] font-medium text-slate-900 truncate">{selectedInquiry.email}</p>
                    </div>
                    {selectedInquiry.phone && (
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Phone</p>
                        <p className="text-[13px] font-medium text-slate-900">{selectedInquiry.phone}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Message Body */}
                <div>
                  <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center justify-between">
                    Message Details
                    <span className="text-[10px] font-medium text-slate-400 normal-case flex items-center gap-1">
                      <HugeiconsIcon icon={Clock01Icon} size={12} /> {new Date(selectedInquiry.createdAt).toLocaleString()}
                    </span>
                  </h3>
                  <div className="bg-slate-50 p-5 rounded-xl text-[13px] leading-relaxed text-slate-800 border border-slate-200 whitespace-pre-wrap min-h-[100px]">
                    {selectedInquiry.message}
                  </div>
                </div>
                
              </div>

              {/* CRM ACTION BAR */}
              <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row justify-between items-center gap-4">
                
                {/* Left side actions */}
                <div className="flex w-full sm:w-auto gap-2">
                  <a 
                    href={`mailto:${selectedInquiry.email}?subject=Re: Your Inquiry to WunkatHomes`}
                    className="flex-1 sm:flex-none inline-flex h-9 items-center justify-center rounded-lg bg-slate-50 px-4 text-[12px] font-semibold text-slate-900 border border-slate-200 hover:bg-slate-100 transition-colors gap-2"
                  >
                    Quick Reply
                  </a>
                  
                  {selectedInquiry.phone && (
                    <a 
                      href={`https://wa.me/${selectedInquiry.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 sm:flex-none inline-flex h-9 items-center justify-center rounded-lg bg-[#25D366]/10 px-4 text-[12px] font-bold text-[#1e9b4a] border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-colors gap-2"
                    >
                      <HugeiconsIcon icon={SmartPhone01Icon} size={14} />
                      WhatsApp
                    </a>
                  )}
                </div>

                {/* Right side actions */}
                <div className="flex w-full sm:w-auto items-center gap-3">
                  <Button 
                    variant="ghost"
                    onClick={() => setDeleteId(selectedInquiry._id)}
                    disabled={isPending}
                    className="flex-1 sm:flex-none text-[11px] font-bold uppercase tracking-wider  rounded-sm h-9"
                  >
                    Delete
                  </Button>
                  
                  <Button 
                    onClick={() => handleToggleStatus(selectedInquiry._id, selectedInquiry.status)}
                    disabled={isPending}
                    className="flex-1 sm:flex-none h-9 bg-black hover:bg-slate-900 text-white font-semibold text-[13px] px-6 rounded-lg transition-colors"
                  >
                    {isPending ? (
                      <>
                      <HugeiconsIcon icon={Loading03Icon} size={16} className="animate-spin" />
                      resolving issue....
                      </>
                    ) : selectedInquiry.status === "Resolved" ? (
                      "Reopen Inquiry"
                    ) : (
                      "Mark as Resolved"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent className="border border-slate-200 bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold tracking-tight text-slate-900">
              Delete Inquiry?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-slate-500">
              This action cannot be undone. This will permanently delete the inquiry from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel disabled={isPending} className="border border-slate-200 bg-slate-50 hover:bg-slate-100 font-medium h-9 text-[13px]">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isPending} className="h-9 bg-red-600 hover:bg-red-700 text-white font-medium text-[13px]">
              {isPending ? "Deleting..." : "Delete Permanently"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
