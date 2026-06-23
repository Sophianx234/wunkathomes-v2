"use client";

import React, { useState, useMemo, useTransition, useEffect } from "react";
import Link from "next/link";
import {
  Search01Icon,
  FilterIcon,
  Alert01Icon,
  Ticket01Icon,
  CheckmarkCircle01Icon,
  Wrench01Icon,
  Image01Icon,
  Cancel01Icon,
  Clock01Icon,
  TimeQuarterIcon,
  LinkSquare01Icon,
  Building03Icon,
  SmartPhone01Icon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
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
import { updateMaintenanceStatusAction } from "@/actions/admin/maintenance.action";

// --- TYPES ---
export type MaintenanceStatus = "Pending" | "In_Progress" | "Resolved" | "Cancelled";
export type MaintenancePriority = "Low" | "Routine" | "High" | "Emergency";

export interface MaintenanceTicket {
  id: string;
  ticketNumber: string;
  category: string;
  priority: MaintenancePriority;
  title: string;
  description: string;
  images: string[];
  status: MaintenanceStatus;
  createdAt: string;
  updatedAt: string;
  user: {
    name: string;
    email: string;
    phone: string;
    profilePicture: string;
  };
  listing: {
    title: string;
    slug: string;
    image: string;
    location: string;
  };
}

interface MaintenanceClientProps {
  initialTickets: MaintenanceTicket[];
}

// --- UTILS ---
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
  
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "2-digit" });
};

const getStatusConfig = (status: MaintenanceStatus) => {
  const configs = {
    Pending: { icon: Alert01Icon, label: "Awaiting", color: "", badge: "bg-black text-white " },
    In_Progress: { icon: Wrench01Icon, label: "In Progress", color: "", badge: "bg-black text-white" },
    Resolved: { icon: CheckmarkCircle01Icon, label: "Resolved", color: "", badge: "bg-black text-white" },
    Cancelled: { icon: Cancel01Icon, label: "Cancelled", color: "", badge: "bg-black text-white" },
  };
  return configs[status];
};

const getPriorityDot = (priority: MaintenancePriority) => {
  const colors = {
    Low: "bg-emerald-400",
    Routine: "bg-blue-400",
    High: "bg-amber-400",
    Emergency: "bg-rose-500 animate-pulse ring-2 ring-rose-500/20",
  };
  return colors[priority];
};

// --- MAIN COMPONENT ---
export default function MaintenanceClient({ initialTickets }: MaintenanceClientProps) {
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(initialTickets);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MaintenanceStatus>("all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | MaintenancePriority>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | string>("all");

  // Sheet, Image Viewer & Confirmation State
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [pendingStatusChange, setPendingStatusChange] = useState<MaintenanceStatus | null>(null);
  const [isPending, startTransition] = useTransition();

  // Sync state if server data refreshes
  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  // Derived Metrics
  const metrics = useMemo(() => {
    return {
      open: tickets.filter(t => t.status === "Pending").length,
      active: tickets.filter(t => t.status === "In_Progress").length,
      resolved: tickets.filter(t => t.status === "Resolved").length,
      total: tickets.length,
    };
  }, [tickets]);

  // Filtered Data
  const filteredData = useMemo(() => {
    return tickets.filter((ticket) => {
      if (statusFilter !== "all" && ticket.status !== statusFilter) return false;
      if (priorityFilter !== "all" && ticket.priority !== priorityFilter) return false;
      if (categoryFilter !== "all" && ticket.category !== categoryFilter) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          ticket.ticketNumber.toLowerCase().includes(query) ||
          ticket.title.toLowerCase().includes(query) ||
          ticket.user.name.toLowerCase().includes(query) ||
          ticket.listing.title.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [tickets, searchQuery, statusFilter, priorityFilter, categoryFilter]);

  // Dynamic filter options
  const uniqueCategories = Array.from(new Set(tickets.map(t => t.category)));
  const uniquePriorities = Array.from(new Set(tickets.map(t => t.priority)));

  // Handle Status Update Flow (Shadcn Confirmation)
  const requestStatusChange = (newStatus: MaintenanceStatus) => {
    if (!selectedTicket || newStatus === selectedTicket.status) return;
    setPendingStatusChange(newStatus);
  };

  const confirmStatusChange = () => {
    if (!selectedTicket || !pendingStatusChange) return;
    const newStatus = pendingStatusChange;
    const ticketId = selectedTicket.id;

    startTransition(async () => {
      // Optimistic UI Update
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t));
      setSelectedTicket({ ...selectedTicket, status: newStatus, updatedAt: new Date().toISOString() });

      // Server Action
      const result = await updateMaintenanceStatusAction(ticketId, newStatus);
      
      if (result.success) {
        toast.success(result.message || "Status updated successfully.");
      } else {
        toast.error(result.error || "Failed to update status.");
        setTickets(initialTickets); // Revert on failure
        if (selectedTicket) {
          const original = initialTickets.find(t => t.id === ticketId);
          if (original) setSelectedTicket(original);
        }
      }
      setPendingStatusChange(null);
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* HEADER & METRICS CARDS */}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 mb-6">
            Support Tickets
          </h1>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-xl border border-zinc-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.01)] flex flex-col justify-between">
              <span className="text-[12px] font-medium text-zinc-500 uppercase tracking-widest">Open tickets</span>
              <span className="text-3xl font-bold tracking-tighter text-zinc-900 mt-2 font-tabular-nums">{metrics.open.toString().padStart(2, '0')}</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-zinc-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.01)] flex flex-col justify-between">
              <span className="text-[12px] font-medium text-zinc-500 uppercase tracking-widest">Active tickets</span>
              <span className="text-3xl font-bold tracking-tighter text-zinc-900 mt-2 font-tabular-nums">{metrics.active.toString().padStart(2, '0')}</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-zinc-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.01)] flex flex-col justify-between">
              <span className="text-[12px] font-medium text-zinc-500 uppercase tracking-widest">Resolved</span>
              <span className="text-3xl font-bold tracking-tighter text-zinc-900 mt-2 font-tabular-nums">{metrics.resolved.toString().padStart(2, '0')}</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-zinc-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.01)] flex flex-col justify-between">
              <span className="text-[12px] font-medium text-zinc-500 uppercase tracking-widest">Total volume</span>
              <span className="text-3xl font-bold tracking-tighter text-zinc-900 mt-2 font-tabular-nums">{metrics.total.toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        <section className="flex flex-col md:flex-row items-center gap-3 bg-white p-1.5 border border-zinc-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.01)] rounded-xl w-full ">
          <div className="relative w-full md:flex-1">
            <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search issues, tenants, or #ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] bg-transparent shadow-none placeholder:text-zinc-400 rounded-lg"
            />
          </div>

          <div className="h-4 w-px bg-zinc-200 hidden md:block mx-1" />

          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto px-2 pb-1 md:pb-0">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)}>
              <SelectTrigger className="w-full md:w-[130px] h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Pending">Awaiting</SelectItem>
                <SelectItem value="In_Progress">In Progress</SelectItem>
                <SelectItem value="Resolved">Resolved</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={(val) => setPriorityFilter(val as any)}>
              <SelectTrigger className="w-full md:w-[130px] h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
                <SelectValue placeholder="All Priorities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                {uniquePriorities.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[140px] h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((c) => (
                  <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="h-4 w-px bg-zinc-200 hidden md:block mx-1" />

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setPriorityFilter("all");
                setCategoryFilter("all");
              }}
              className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 shrink-0 ml-auto md:ml-0 rounded-md"
            >
              <HugeiconsIcon icon={FilterIcon} size={14} />
            </Button>
          </div>
        </section>

        {/* TICKET LIST */}
        <div className="bg-white border border-zinc-200/60 shadow-[0_1px_4px_rgba(0,0,0,0.01)] rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-200/60 bg-zinc-50/30 text-[12px] font-medium text-zinc-500">
            <div className="col-span-12 md:col-span-5">Ticket Title & Details</div>
            <div className="hidden md:block col-span-2">Status</div>
            <div className="hidden md:block col-span-1">Priority</div>
            <div className="hidden md:block col-span-2">Updated</div>
            <div className="hidden md:block col-span-2">Created at</div>
          </div>

          <div className="divide-y divide-zinc-100">
            {filteredData.map((ticket) => {
              const statusCfg = getStatusConfig(ticket.status);
              
              return (
                <div 
                  key={ticket.id} 
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-zinc-50/50 transition-colors group bg-white cursor-pointer"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  {/* Issue Info */}
                  <div className="col-span-12 md:col-span-5 flex items-start gap-3">
                    <Avatar className="h-10 w-10 mt-0.5 shrink-0 border border-zinc-200/60 shadow-sm">
                      <AvatarImage src={ticket.user.profilePicture} />
                      <AvatarFallback className="bg-zinc-100 text-zinc-600 text-xs font-medium">
                        {ticket.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[13px] font-semibold tracking-tight text-zinc-900 truncate">
                          {ticket.title}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-mono tracking-tighter shrink-0">
                          #{ticket.ticketNumber.slice(-4)}
                        </span>
                      </div>
                      <span className="text-[12px] text-zinc-500 truncate mb-1.5 pr-4">
                        {ticket.description}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-zinc-700">
                          {ticket.user.name}
                        </span>
                        <span className="text-[10px] font-medium text-zinc-500 bg-zinc-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                          {ticket.listing.title}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Dropdown (intercepted click) */}
                  <div className="hidden md:flex col-span-2 items-center" onClick={(e) => e.stopPropagation()}>
                    <Select 
                      value={ticket.status} 
                      onValueChange={(val) => {
                        setSelectedTicket(ticket);
                        requestStatusChange(val as MaintenanceStatus);
                      }}
                    >
                      <SelectTrigger className="h-8 border-0 bg-transparent hover:bg-zinc-100 focus:ring-0 p-0 px-2 w-auto gap-2 rounded-md">
                        <div className="flex items-center gap-1.5">
                          <HugeiconsIcon icon={statusCfg.icon} size={14} className={statusCfg.color} />
                          <span className="text-[12px] font-medium text-zinc-700">{statusCfg.label}</span>
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Awaiting</SelectItem>
                        <SelectItem value="In_Progress">In Progress</SelectItem>
                        <SelectItem value="Resolved">Resolved</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Priority */}
                  <div className="hidden md:flex col-span-1 items-center gap-2">
                    <div className={`h-2.5 w-2.5 rounded-full ${getPriorityDot(ticket.priority)}`} />
                    <span className="text-[12px] font-medium text-zinc-700">
                      {ticket.priority}
                    </span>
                  </div>

                  {/* Updated At */}
                  <div className="hidden md:flex col-span-2 items-center gap-1.5 text-zinc-500">
                    <HugeiconsIcon icon={TimeQuarterIcon} size={14} />
                    <span className="text-[12px] font-medium">
                      {formatRelativeTime(ticket.updatedAt)}
                    </span>
                  </div>

                  {/* Created At */}
                  <div className="hidden md:flex col-span-2 items-center gap-1.5 text-zinc-500">
                    <HugeiconsIcon icon={Clock01Icon} size={14} />
                    <span className="text-[12px] font-medium font-tabular-nums">
                      {new Date(ticket.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredData.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center justify-center">
                <HugeiconsIcon icon={Ticket01Icon} size={32} className="text-zinc-300 mb-3" />
                <p className="text-sm font-medium text-zinc-500">No tickets found matching your criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* FULL-SCREEN IMAGE VIEWER */}
      {expandedImage && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm"
          style={{ pointerEvents: 'auto' }}
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-5xl w-full h-full max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <button 
              className="absolute -top-3 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
              onClick={() => setExpandedImage(null)}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={24} />
            </button>
            <img 
              src={expandedImage} 
              alt="Issue attachment" 
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
            />
          </div>
        </div>
      )}

      {/* INDUSTRY STANDARD TICKET CRM SHEET */}
      <Sheet open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <SheetContent className="w-full sm:max-w-[480px] p-0 bg-[#FAFAFA] border-l border-zinc-200/60 flex flex-col font-sans shadow-2xl">
          {selectedTicket && (() => {
            const currentStatusCfg = getStatusConfig(selectedTicket.status);
            return (
              <>
                {/* Header Context Section */}
                <div className="px-6 py-8 border-b border-zinc-100 bg-zinc-50/30">
                  <div className="flex items-center justify-between mb-6">
                    <Badge
                      variant="outline"
                      className={`px-2 py-0 border-0 rounded text-[9px] uppercase tracking-wider font-bold h-5 ${currentStatusCfg.badge}`}
                    >
                      {currentStatusCfg.label}
                    </Badge>
                    <div className="flex items-center gap-2">
                      <div className={`h-2.5 w-2.5 rounded-full ${getPriorityDot(selectedTicket.priority)}`} />
                      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                        {selectedTicket.priority} Priority
                      </span>
                    </div>
                  </div>

                  <h2 className="text-xl font-semibold tracking-tight text-zinc-900 leading-tight mb-2">
                    {selectedTicket.title}
                  </h2>
                  <p className="text-[12px] text-zinc-500 font-mono tracking-widest uppercase">
                    TICKET #{selectedTicket.ticketNumber.slice(-8)}
                  </p>
                </div>

                {/* Scrollable Data Body */}
                <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10">
                  
                  {/* 1. Issue Description */}
                  <section>
                    <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                       Description Context
                    </h3>
                    <div className="bg-white border border-zinc-200/60 p-4 rounded-xl text-[13px] text-zinc-700 leading-relaxed whitespace-pre-wrap shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                      {selectedTicket.description}
                    </div>
                  </section>

                  {/* 2. Reporter Context Card */}
                  <section>
                    <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                      Reporter Info
                    </h3>
                    <div className="rounded-xl border border-zinc-200/60 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                      <div className="p-4 bg-zinc-50/50 flex gap-4 border-b border-zinc-100">
                        <Avatar className="h-12 w-12 border border-zinc-200/60 shadow-sm shrink-0">
                          <AvatarImage src={selectedTicket.user.profilePicture} />
                          <AvatarFallback className="bg-zinc-100 text-zinc-600 font-medium text-sm">
                            {selectedTicket.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col justify-center min-w-0">
                          <h4 className="text-sm font-semibold tracking-tight text-zinc-900 truncate">
                            {selectedTicket.user.name}
                          </h4>
                          <p className="text-[12px] text-zinc-500 mt-0.5 truncate">
                            {selectedTicket.user.email}
                          </p>
                        </div>
                      </div>
                      <dl className="grid grid-cols-1 gap-y-3 p-4 text-[13px] bg-white">
                        <div className="flex items-center gap-3">
                          <HugeiconsIcon icon={SmartPhone01Icon} size={14} className="text-zinc-400" />
                          <dd className="font-medium text-zinc-900 font-mono tracking-tight">{selectedTicket.user.phone}</dd>
                        </div>
                        <div className="flex items-center gap-3">
                          <HugeiconsIcon icon={Mail01Icon} size={14} className="text-zinc-400" />
                          <dd className="font-medium text-zinc-900 truncate">{selectedTicket.user.email}</dd>
                        </div>
                      </dl>
                    </div>
                  </section>

                  {/* 3. Associated Asset Context Card */}
                  <section>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                        Associated Asset
                      </h3>
                      <Link
                        href={`/admin/properties/${selectedTicket.listing.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 tracking-wide transition-colors"
                      >
                        View Asset <HugeiconsIcon icon={LinkSquare01Icon} size={12} />
                      </Link>
                    </div>
                    <div className="rounded-xl border border-zinc-200/60 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)] bg-white">
                      <div className="p-4 flex gap-4">
                        <div className="h-12 w-12 shrink-0 bg-zinc-100 rounded-md overflow-hidden border border-zinc-200/60 shadow-sm">
                          {selectedTicket.listing.image ? (
                            <img src={selectedTicket.listing.image} alt="Property" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <HugeiconsIcon icon={Building03Icon} size={16} className="text-zinc-300"/>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col justify-center min-w-0">
                          <h4 className="text-sm font-semibold tracking-tight text-zinc-900 truncate">
                            {selectedTicket.listing.title}
                          </h4>
                          <p className="text-[12px] text-zinc-500 mt-0.5 truncate">
                            {selectedTicket.listing.location}
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* 4. Attached Evidence */}
                  {selectedTicket.images && selectedTicket.images.length > 0 && (
                    <section>
                      <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                        Attached Evidence
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {selectedTicket.images.map((imgUrl, idx) => (
                          <button 
                            key={idx} 
                            onClick={() => setExpandedImage(imgUrl)}
                            className="aspect-square rounded-xl border border-zinc-200/80 overflow-hidden group relative bg-zinc-100 shadow-[0_1px_4px_rgba(0,0,0,0.01)] focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
                          >
                            <img src={imgUrl} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] font-bold uppercase tracking-wider bg-black/40 px-2 py-1 rounded backdrop-blur-sm transition-opacity duration-300">View</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* 5. Status Pipeline Management */}
                  <section>
                    <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                      Maintenance Status
                    </h3>
                    <div className="bg-zinc-100/60 border border-zinc-200/60 p-1 rounded-xl flex flex-wrap gap-1">
                      {(["Pending", "In_Progress", "Resolved", "Cancelled"] as MaintenanceStatus[]).map((status) => {
                        const isActive = selectedTicket.status === status;
                        return (
                          <button
                            key={status}
                            disabled={isPending}
                            onClick={() => requestStatusChange(status)}
                            className={`flex-1 min-w-[45%] py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                              isActive
                                ? "bg-white text-zinc-900 border border-zinc-200 shadow-sm"
                                : "text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-700 disabled:opacity-50"
                            }`}
                          >
                            {status.replace("_", " ")}
                          </button>
                        );
                      })}
                    </div>
                  </section>

                </div>

                {/* Fixed Bottom Action Bar */}
                <div className="p-4 border-t border-zinc-200/60 bg-white flex gap-3">
                  <a href={`tel:${selectedTicket.user.phone}`} className="flex-1">
                    <Button variant="outline" className="w-full h-10 rounded-lg border-zinc-200 text-zinc-900 hover:bg-zinc-50 font-medium transition-all shadow-none">
                      Call Tenant
                    </Button>
                  </a>
                  <a href={`mailto:${selectedTicket.user.email}?subject=Regarding Ticket #${selectedTicket.ticketNumber}`} className="flex-1">
                    <Button className="w-full h-10 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-medium transition-all shadow-none">
                      Email Tenant
                    </Button>
                  </a>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>

      {/* SHADCN CONFIRMATION DIALOG FOR STATUS CHANGES */}
      <AlertDialog
        open={!!pendingStatusChange}
        onOpenChange={(open) => !open && setPendingStatusChange(null)}
      >
        <AlertDialogContent className="font-sans max-w-[400px] rounded-2xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold tracking-tight text-zinc-900">
              Confirm Status Update
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-zinc-500 leading-relaxed mt-2">
              Are you sure you want to transition this ticket to{" "}
              <span className="font-bold text-zinc-900">
                {pendingStatusChange?.replace("_", " ")}
              </span>
              ? This action will update the system immediately.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6 gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={isPending}
              className="h-9 px-4 text-[12px] font-medium border-zinc-200 hover:bg-zinc-50 rounded-lg m-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmStatusChange}
              disabled={isPending}
              className="h-9 px-4 text-[12px] font-medium rounded-lg m-0 bg-black text-white hover:bg-zinc-800 focus:ring-zinc-900"
            >
              {isPending ? (
                <>
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    className="animate-spin mr-2"
                    size={14}
                  />{" "}
                  Saving...
                </>
              ) : (
                "Confirm Transition"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
