"use client";

import React, { useState, useMemo, useTransition, useEffect } from "react";
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
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
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
    Pending: { icon: Alert01Icon, label: "Awaiting", color: "text-amber-700" },
    In_Progress: { icon: Wrench01Icon, label: "In Progress", color: "text-blue-700" },
    Resolved: { icon: CheckmarkCircle01Icon, label: "Resolved", color: "text-emerald-700" },
    Cancelled: { icon: Cancel01Icon, label: "Cancelled", color: "text-zinc-500" },
  };
  return configs[status];
};

const getPriorityDot = (priority: MaintenancePriority) => {
  const colors = {
    Low: "bg-emerald-400",
    Routine: "bg-blue-400",
    High: "bg-amber-400",
    Emergency: "bg-rose-500 animate-pulse",
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

  // Sheet & Image Viewer State
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
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

  // Handle Status Update (Optimistic UI)
  // Handle Status Update (Optimistic UI)
  const handleStatusChange = (ticketId: string, newStatus: MaintenanceStatus) => {
    
    startTransition(async () => {
      // 1. Optimistically update the UI immediately
      setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, status: newStatus, updatedAt: new Date().toISOString() } : t));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus, updatedAt: new Date().toISOString() });
      }

      // 2. Fire the server action in the background
      const result = await updateMaintenanceStatusAction(ticketId, newStatus);
      
      // 3. Handle the Server Response
      if (result.success) {
        toast.success(result.message);
      } else {
        // If it fails, revert the state back to the original initialTickets (or fetch fresh)
        toast.error(result.error);
        setTickets(initialTickets); 
      }
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
            <div className="bg-white p-5 rounded-xl border border-zinc-200 flex flex-col justify-between">
              <span className="text-[12px] font-medium text-zinc-500">Open tickets</span>
              <span className="text-3xl font-bold tracking-tighter text-zinc-900 mt-2">{metrics.open.toString().padStart(2, '0')}</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-zinc-200 flex flex-col justify-between">
              <span className="text-[12px] font-medium text-zinc-500">Active tickets</span>
              <span className="text-3xl font-bold tracking-tighter text-zinc-900 mt-2">{metrics.active.toString().padStart(2, '0')}</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-zinc-200 flex flex-col justify-between">
              <span className="text-[12px] font-medium text-zinc-500">Resolved tickets</span>
              <span className="text-3xl font-bold tracking-tighter text-zinc-900 mt-2">{metrics.resolved.toString().padStart(2, '0')}</span>
            </div>
            <div className="bg-white p-5 rounded-xl border border-zinc-200 flex flex-col justify-between">
              <span className="text-[12px] font-medium text-zinc-500">Total volume</span>
              <span className="text-3xl font-bold tracking-tighter text-zinc-900 mt-2">{metrics.total.toString().padStart(2, '0')}</span>
            </div>
          </div>
        </div>

        {/* FILTER BAR */}
        {/* FILTER BAR */}
        <section className="flex flex-col md:flex-row items-center gap-3 bg-white p-2 border border-zinc-200 rounded-xl w-full ">
          {/* Search Input (Expands to fill available space) */}
          <div className="relative w-full md:flex-1">
            <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search issues, tenants, or #ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 h-9 border-zinc-200 focus-visible:ring-0 focus-visible:border-zinc-400 text-[13px] bg-white placeholder:text-zinc-400 rounded-lg "
            />
          </div>

          {/* Divider (Desktop Only) */}
          <div className="h-6 w-px bg-zinc-200 hidden md:block mx-1" />

          {/* Dropdown Filters & Reset Button */}
          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full md:w-auto">
            <Select value={statusFilter} onValueChange={(val) => setStatusFilter(val as any)}>
              <SelectTrigger className="w-full md:w-[130px] h-9 border-zinc-200 bg-white hover:bg-zinc-50 text-[12px] font-medium text-zinc-700  focus:ring-0 rounded-lg">
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
              <SelectTrigger className="w-full md:w-[130px] h-9 border-zinc-200 bg-white hover:bg-zinc-50 text-[12px] font-medium text-zinc-700  focus:ring-0 rounded-lg">
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
              <SelectTrigger className="w-full md:w-[140px] h-9 border-zinc-200 bg-white hover:bg-zinc-50 text-[12px] font-medium text-zinc-700  focus:ring-0 rounded-lg">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {uniqueCategories.map((c) => (
                  <SelectItem key={c} value={c}>{c.replace("_", " ")}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="default"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setPriorityFilter("all");
                setCategoryFilter("all");
              }}
              className="h-9 px-4 text-[12px] font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg  shrink-0 w-full md:w-auto"
            >
              Reset Filters
            </Button>
          </div>
        </section>

        {/* TICKET LIST */}
        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
          <div className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-zinc-200 bg-white text-[12px] font-medium text-zinc-500">
            <div className="col-span-12 md:col-span-5 flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
              Title
            </div>
            <div className="hidden md:block col-span-2">Status</div>
            <div className="hidden md:block col-span-1">Priority</div>
            <div className="hidden md:block col-span-2">Updated</div>
            <div className="hidden md:block col-span-2">Created at</div>
          </div>

          <div className="divide-y divide-zinc-200">
            {filteredData.map((ticket) => {
              const statusCfg = getStatusConfig(ticket.status);
              
              return (
                <div 
                  key={ticket.id} 
                  className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-zinc-50 transition-colors group bg-white"
                >
                  {/* Issue Info */}
                  <div 
                    className="col-span-12 md:col-span-5 flex items-start gap-3 cursor-pointer"
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="mt-2.5">
                       <input type="checkbox" onClick={(e) => e.stopPropagation()} className="h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
                    </div>
                    <Avatar className="h-10 w-10 mt-0.5 shrink-0 border border-zinc-200">
                      <AvatarImage src={ticket.user.profilePicture} />
                      <AvatarFallback className="bg-zinc-100 text-zinc-600 text-xs">
                        {ticket.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[14px] font-semibold text-zinc-900 truncate">
                          {ticket.title}
                        </span>
                        <span className="text-[13px] text-zinc-400 font-mono tracking-tighter shrink-0">
                          #{ticket.ticketNumber.slice(-3)}
                        </span>
                      </div>
                      <span className="text-[13px] text-zinc-500 truncate mb-1.5 pr-4">
                        {ticket.description}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-medium text-zinc-900">
                          {ticket.user.name}
                        </span>
                        <span className="text-[11px] font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-sm">
                          {ticket.listing.title}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Inline Status Dropdown */}
                  <div className="hidden md:flex col-span-2 items-center">
                    <Select 
                      value={ticket.status} 
                      onValueChange={(val) => handleStatusChange(ticket.id, val as MaintenanceStatus)}
                    >
                      <SelectTrigger className="h-8 border-0 bg-transparent hover:bg-zinc-100 focus:ring-0 p-0 px-2 w-auto gap-2">
                        <div className="flex items-center gap-1.5">
                          <HugeiconsIcon icon={statusCfg.icon} size={14} className={statusCfg.color} />
                          <span className="text-[13px] font-medium text-zinc-700">{statusCfg.label}</span>
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
                    <div className={`h-2.5 w-2.5 rounded-sm ${getPriorityDot(ticket.priority)}`} />
                    <span className="text-[13px] font-medium text-zinc-700">
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
                    <span className="text-[12px] font-medium">
                      {formatRelativeTime(ticket.createdAt)}
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
              className="absolute top-4 right-4 text-white bg-white/10 hover:bg-white/20 rounded-full p-2 transition-colors z-10"
              onClick={() => setExpandedImage(null)}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={24} />
            </button>
            <img 
              src={expandedImage} 
              alt="Issue attachment" 
              className="max-w-full max-h-full object-contain rounded-lg" 
            />
          </div>
        </div>
      )}

      {/* TICKET DETAILS SHEET */}
      <Sheet open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
        <SheetContent className="w-full sm:max-w-[480px] p-0 bg-[#FAFAFA] border-l border-zinc-200 flex flex-col font-sans">
          {selectedTicket && (() => {
            return (
              <>
                <div className="flex-1 overflow-y-auto">
                  {/* Sheet Header */}
                  <div className="px-6 pt-10 pb-6 border-b border-zinc-200 bg-white sticky top-0 z-10">
                    <div className="flex items-center justify-between mb-4">
                      <span className="font-mono text-xs font-bold text-zinc-400 tracking-widest uppercase">
                        Ticket {selectedTicket.ticketNumber}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className={`h-2.5 w-2.5 rounded-sm ${getPriorityDot(selectedTicket.priority)}`} />
                        <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider">
                          {selectedTicket.priority}
                        </span>
                      </div>
                    </div>
                    
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-900 leading-tight mb-2">
                      {selectedTicket.title}
                    </h2>
                    <p className="text-[12px] font-medium text-zinc-500">
                      Reported {formatRelativeTime(selectedTicket.createdAt)}
                    </p>
                  </div>

                  <div className="p-6 space-y-8">
                    
                    {/* Description */}
                    <section>
                      <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <HugeiconsIcon icon={Alert01Icon} size={14} /> Issue Description
                      </h3>
                      <div className="bg-white border border-zinc-200 p-4 rounded-xl text-[13px] text-zinc-700 leading-relaxed whitespace-pre-wrap">
                        {selectedTicket.description}
                      </div>
                    </section>

                    {/* Image Gallery */}
                    {selectedTicket.images && selectedTicket.images.length > 0 && (
                      <section>
                        <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <HugeiconsIcon icon={Image01Icon} size={14} /> Attached Evidence
                        </h3>
                        <div className="grid grid-cols-3 gap-2">
                          {selectedTicket.images.map((imgUrl, idx) => (
                            <div 
                              key={idx} 
                              onClick={() => setExpandedImage(imgUrl)}
                              className="aspect-square rounded-lg border border-zinc-200 overflow-hidden cursor-pointer group relative bg-zinc-100"
                            >
                              <img src={imgUrl} alt={`Evidence ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <span className="opacity-0 group-hover:opacity-100 text-white text-[10px] font-bold uppercase tracking-wider">View</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Full Reporter & Property Context */}
                    <section className="space-y-4">
                      {/* User Context Block */}
                      <div className="bg-white border border-zinc-200 p-4 rounded-xl flex flex-col gap-3">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Reporter Info</span>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-zinc-200 shrink-0">
                            <AvatarImage src={selectedTicket.user.profilePicture || undefined} />
                            <AvatarFallback className="bg-zinc-100 text-zinc-600 text-[10px]">
                              {selectedTicket.user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-zinc-900 truncate">{selectedTicket.user.name}</p>
                            <p className="text-[12px] text-zinc-500 truncate">{selectedTicket.user.email}</p>
                            <p className="text-[12px] text-zinc-500 truncate">{selectedTicket.user.phone}</p>
                          </div>
                        </div>
                      </div>

                      {/* Property Context Block */}
                      <div className="bg-white border border-zinc-200 p-4 rounded-xl flex flex-col gap-3">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Property Assignment</span>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg border border-zinc-200 overflow-hidden shrink-0 bg-zinc-100">
                            <img src={selectedTicket.listing.image} alt={selectedTicket.listing.title} className="h-full w-full object-cover" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold text-zinc-900 truncate">{selectedTicket.listing.title}</p>
                            <p className="text-[12px] text-zinc-500 truncate">{selectedTicket.listing.location}</p>
                          </div>
                        </div>
                      </div>
                    </section>

                    {/* Status Management */}
                    <section className="pb-8">
                      <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                        Update Status
                      </h3>
                      <div className="bg-zinc-100 border border-zinc-200 p-1.5 rounded-xl flex flex-wrap gap-1.5">
                        {(["Pending", "In_Progress", "Resolved", "Cancelled"] as MaintenanceStatus[]).map((status) => {
                          const isActive = selectedTicket.status === status;
                          return (
                            <button
                              key={status}
                              disabled={isPending}
                              onClick={() => handleStatusChange(selectedTicket.id, status)}
                              className={`flex-1 min-w-[45%] py-2.5 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                                isActive
                                  ? "bg-white text-zinc-900 border border-zinc-200"
                                  : "text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 disabled:opacity-50"
                              }`}
                            >
                              {status.replace("_", " ")}
                            </button>
                          );
                        })}
                      </div>
                    </section>

                  </div>
                </div>

                {/* Dual Footer Actions: Call or Email */}
                <div className="p-4 bg-white border-t border-zinc-200 z-20 flex gap-3">
                  <a href={`tel:${selectedTicket.user.phone}`} className="flex-1">
                    <Button variant="outline" className="w-full h-11 rounded-lg border-zinc-200 text-zinc-900 hover:bg-zinc-100 font-semibold transition-all">
                      Call Tenant
                    </Button>
                  </a>
                  <a href={`mailto:${selectedTicket.user.email}?subject=Regarding Ticket #${selectedTicket.ticketNumber}`} className="flex-1">
                    <Button className="w-full h-11 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white font-semibold transition-all">
                      Email Tenant
                    </Button>
                  </a>
                </div>
              </>
            );
          })()}
        </SheetContent>
      </Sheet>
    </div>
  );
}