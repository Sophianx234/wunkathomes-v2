"use client";

import React, { useState, useMemo, useTransition, useEffect } from "react";
import Link from "next/link";
import {
  WhatsappIcon,
  Calendar01Icon,
  Clock01Icon,
  LinkSquare01Icon,
  BedSingle01Icon,
  Bathtub01Icon,
  Maximize01Icon,
  Copy01Icon,
  Search01Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateTourAction } from "@/actions/user/tour.action";

type TourStatus =
  | "Pending_Time"
  | "Confirmed"
  | "Completed"
  | "No_Show"
  | "Converted";

export interface TourRecord {
  id: string;
  phoneNumber: string;
  scheduledDate: string;
  confirmedTime?: string;
  status: TourStatus;
  notes: string;
  listing: {
    id: string;
    slug: string;
    title: string;
    price: number;
    property: { propertyType: string; location: string; propertyName?: string };
    features: { bedrooms: number; bathrooms: number; sizeSqm: number };
    image: string;
  };
}

// --- HELPER FUNCTIONS ---
const formatRelativeDate = (dateString: string) => {
  const date = new Date(dateString);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  const formattedDate = date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  if (date.toDateString() === today.toDateString())
    return `Today, ${formattedDate}`;
  if (date.toDateString() === tomorrow.toDateString())
    return `Tomorrow, ${formattedDate}`;
  return formattedDate;
};

const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const formatCurrency = (amount: number) => `GHS ${amount.toLocaleString()}`;

const getStatusBadge = (status: TourStatus) => {
  const styles = {
    Pending_Time: "bg-amber-50 text-amber-700 ring-1 ring-amber-300/60",
    Confirmed: "bg-blue-50 text-blue-700 ring-1 ring-blue-300/60",
    Completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60",
    No_Show: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/60",
    Converted: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/60",
  };
  return styles[status] || "bg-zinc-100 text-zinc-600";
};

// --- ISOLATED NOTES EDITOR ---
function AdminNotesEditor({
  initialNotes,
  onSave,
  isPending,
}: {
  initialNotes: string;
  onSave: (notes: string) => void;
  isPending: boolean;
}) {
  const [notes, setNotes] = useState(initialNotes);

  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  return (
    <section>
      <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
        Admin Notes
      </h3>
      <Textarea
        placeholder="Log feedback, negotiation details, or specific client requests..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="text-[13px] min-h-[120px] resize-none focus-visible:ring-zinc-500/20 focus-visible:border-zinc-500 bg-white shadow-sm"
      />
      <div className="flex justify-end mt-2">
        <Button
          size="sm"
          variant="ghost"
          disabled={isPending}
          onClick={() => onSave(notes)}
          className="h-7 text-[11px] bg-black text-white rounded-sm hover:text-zinc-900 border transition-all hover:border-zinc-900"
        >
          {isPending ? "Saving..." : "Save Notes"}
        </Button>
      </div>
    </section>
  );
}

// --- MAIN COMPONENT ---
export default function TourTable({
  initialTours,
}: {
  initialTours: TourRecord[];
}) {
  // Local state to instantly reflect status changes without refreshing
  const [tours, setTours] = useState<TourRecord[]>(initialTours);

  // Sync state if server re-renders
  useEffect(() => {
    setTours(initialTours);
  }, [initialTours]);

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TourStatus>("all");

  // Sheet States
  const [selectedTour, setSelectedTour] = useState<TourRecord | null>(null);
  const [sheetStatus, setSheetStatus] = useState<TourStatus>("Pending_Time");
  const [isPending, startTransition] = useTransition();

  // Reset filters when switching tabs
  useEffect(() => {
    setSearchQuery("");
    setStatusFilter("all");
  }, [activeTab]);

  // Handle Sheet interactions
  const handleOpenSheet = (tour: TourRecord) => {
    setSelectedTour(tour);
    setSheetStatus(tour.status);
  };

  const handleStatusChange = (newStatus: TourStatus) => {
    if (!selectedTour) return;

    setSheetStatus(newStatus);

    startTransition(async () => {
      const res = await updateTourAction(selectedTour.id, {
        status: newStatus,
      });
      if (res.success) {
        toast.success("Status updated successfully!");

        // Update local dataset to instantly move it across tabs
        setTours((prev) =>
          prev.map((t) =>
            t.id === selectedTour.id ? { ...t, status: newStatus } : t,
          ),
        );
        setSelectedTour({ ...selectedTour, status: newStatus });
      } else {
        toast.error("Failed to update status.");
        setSheetStatus(selectedTour.status); // Revert UI
      }
    });
  };

  const handleSaveNotes = (newNotes: string) => {
    if (!selectedTour) return;
    startTransition(async () => {
      const res = await updateTourAction(selectedTour.id, { notes: newNotes });
      if (res.success) {
        toast.success("Notes saved successfully!");
        setTours((prev) =>
          prev.map((t) =>
            t.id === selectedTour.id ? { ...t, notes: newNotes } : t,
          ),
        );
        setSelectedTour({ ...selectedTour, notes: newNotes });
      } else {
        toast.error("Failed to save notes.");
      }
    });
  };

  // 1. Separate data based on Tabs
  const tabData = useMemo(() => {
    return tours.filter((tour) => {
      if (activeTab === "active") {
        return ["Pending_Time", "Confirmed"].includes(tour.status);
      } else {
        return ["Completed", "No_Show", "Converted"].includes(tour.status);
      }
    });
  }, [tours, activeTab]);

  // 2. Extract dynamic statuses for the filter dropdown based ONLY on what exists in the current tab
  const availableStatuses = useMemo(() => {
    const statuses = new Set<TourStatus>();
    tabData.forEach((tour) => statuses.add(tour.status));
    return Array.from(statuses);
  }, [tabData]);

  // 3. Apply Search and Status Filters
  const filteredData = useMemo(() => {
    return tabData.filter((tour) => {
      const matchesStatus =
        statusFilter === "all" || tour.status === statusFilter;
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        tour.phoneNumber.includes(searchQuery) ||
        tour.listing.property.location.toLowerCase().includes(searchLower) ||
        tour.listing.title.toLowerCase().includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [tabData, searchQuery, statusFilter]);

  const activeCount = tours.filter((t) =>
    ["Pending_Time", "Confirmed"].includes(t.status),
  ).length;

  return (
    <div className="space-y-6">
      {/* PAGE HEADER & TABS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200/60 pb-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Tour Management
          </h1>
          {activeCount > 0 && activeTab === "active" && (
            <Badge
              variant="secondary"
              className="bg-black text-white hover:bg-zinc-800 text-[11px] px-2 h-5 flex items-center justify-center rounded-full"
            >
              {activeCount} Active
            </Badge>
          )}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "active" | "history")}
          className="w-full md:w-auto"
        >
          <TabsList className="h-9 bg-zinc-100/50 border border-zinc-200/60 p-0.5 rounded-lg">
            <TabsTrigger
              value="active"
              className="text-[13px] font-medium data-[state=active]:bg-white  rounded-md px-4"
            >
              Active Leads
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="text-[13px] font-medium data-[state=active]:bg-white  rounded-md px-4"
            >
              Tour History
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* DYNAMIC FILTER BAR */}
      <section className="flex flex-col xl:flex-row items-center gap-4 bg-white p-1.5 border border-zinc-200/60 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.01)] w-full">
        <div className="relative flex-1 w-full">
          <HugeiconsIcon
            icon={Search01Icon}
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
          />
          <Input
            placeholder="Search by phone, location, or property..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] bg-transparent shadow-none placeholder:text-zinc-400"
          />
        </div>

        <div className="h-4 w-px bg-zinc-200 hidden xl:block" />

        <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full xl:w-auto px-2 pb-1 xl:pb-0">
          <Select
            value={statusFilter}
            onValueChange={(val) => setStatusFilter(val as any)}
          >
            <SelectTrigger className="w-full md:w-[160px] h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {availableStatuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status.replace("_", " ")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="h-4 w-px bg-zinc-200 hidden md:block mx-1" />

          <div className="hidden md:flex items-center gap-2 pl-1 pr-2">
            <span className="text-[18px] font-semibold tracking-tighter text-zinc-900 leading-none font-tabular-nums">
              {filteredData.length}
            </span>
            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">
              Records
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
            }}
            className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 shrink-0 ml-auto md:ml-0 rounded-md"
          >
            <HugeiconsIcon icon={FilterIcon} size={14} />
          </Button>
        </div>
      </section>

      {/* DATA TABLE */}
      <div className="bg-white border border-zinc-200/60 rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
        <Table>
          <TableHeader className="bg-zinc-50/30">
            <TableRow className="border-zinc-200/60">
              <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[200px]">
                Date & Time
              </TableHead>
              <TableHead className="font-medium text-zinc-500 text-xs h-10">
                Lead Contact
              </TableHead>
              <TableHead className="font-medium text-zinc-500 text-xs h-10">
                Property
              </TableHead>
              <TableHead className="font-medium text-zinc-500 text-xs h-10">
                Status
              </TableHead>
              <TableHead className="text-right w-[140px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((tour) => (
              <TableRow
                key={tour.id}
                className="group border-zinc-100 hover:bg-zinc-50/50 cursor-pointer transition-colors"
                onClick={() => handleOpenSheet(tour)}
              >
                <TableCell className="py-3 align-middle">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-semibold text-zinc-900 tracking-tight">
                      {formatRelativeDate(tour.scheduledDate)}
                    </span>
                    <span className="text-[11px] text-zinc-500 mt-0.5 flex items-center gap-1">
                      <HugeiconsIcon icon={Clock01Icon} size={10} />
                      {tour.confirmedTime || formatTime(tour.scheduledDate)}
                    </span>
                  </div>
                </TableCell>
                <TableCell
                  className="py-3 align-middle"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-mono font-medium text-zinc-800 tracking-tight">
                      {tour.phoneNumber}
                    </span>
                    <a
                      href={`https://wa.me/${tour.phoneNumber.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-[#25D366] hover:bg-[#25D366]/10 rounded-full shrink-0"
                      >
                        <HugeiconsIcon icon={WhatsappIcon} size={14} />
                      </Button>
                    </a>
                  </div>
                </TableCell>
                <TableCell className="py-3 align-middle">
                  <div className="flex flex-col">
                    <span className="text-[13px] font-medium text-zinc-900 leading-tight">
                      {tour.listing.property.propertyName ||
                        tour.listing.property.location}
                    </span>
                    <span className="text-[11px] text-zinc-500 mt-0.5 truncate max-w-[200px]">
                      {tour.listing.title}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-3 align-middle">
                  <Badge
                    variant="outline"
                    className={`px-2 py-0 border-0 rounded text-[10px] uppercase tracking-wider font-bold h-5 ${getStatusBadge(tour.status)}`}
                  >
                    {tour.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell className="py-3 align-middle text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-[11px] font-semibold border-zinc-200 text-zinc-700 rounded-lg"
                  >
                    {activeTab === "active" ? "View Detail" : "View Details"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}

            {filteredData.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-zinc-500 text-sm"
                >
                  {activeTab === "active"
                    ? "No active leads match the current filters."
                    : "No history found."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* LEAD CRM PANEL (Sheet) */}
      <Sheet
        open={!!selectedTour}
        onOpenChange={(open) => !open && setSelectedTour(null)}
      >
        <SheetContent className="w-full sm:max-w-[440px] p-0 bg-[#FAFAFA] border-l border-zinc-200/60 flex flex-col font-sans shadow-2xl">
          {selectedTour && (
            <>
              {/* Header Section */}
              <div className="px-6 pt-10 pb-6 border-b border-zinc-200/60 bg-white">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h2 className="text-xl font-semibold tracking-tight text-zinc-900 font-mono">
                      {selectedTour.phoneNumber}
                    </h2>
                    <p className="text-[12px] text-zinc-500 flex items-center gap-1.5 font-medium">
                      <HugeiconsIcon icon={Calendar01Icon} size={12} />
                      {formatRelativeDate(selectedTour.scheduledDate)} at{" "}
                      {selectedTour.confirmedTime ||
                        formatTime(selectedTour.scheduledDate)}
                    </p>
                  </div>
                  <a
                    href={`https://wa.me/${selectedTour.phoneNumber.replace(/[^0-9]/g, "")}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Button
                      size="icon"
                      className="h-10 w-10 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors shrink-0"
                    >
                      <HugeiconsIcon
                        icon={WhatsappIcon}
                        size={20}
                        strokeWidth={2}
                      />
                    </Button>
                  </a>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Section 1: Property Context Card */}
                <section>
                  <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                    Viewing Target
                  </h3>
                  <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)] group relative">
                    <Link
                      href={`/admin/properties/${selectedTour.listing.slug}`}
                      target="_blank"
                      className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <HugeiconsIcon icon={LinkSquare01Icon} size={14} />
                    </Link>

                    {/* Image Header */}
                    <div className="h-32 w-full bg-zinc-100 relative">
                      <img
                        src={selectedTour.listing.image || "/placeholder.jpg"}
                        alt={selectedTour.listing.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 text-white">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                          {selectedTour.listing.property.propertyType.replace(
                            "_",
                            " ",
                          )}
                        </p>
                        <p className="text-[15px] font-semibold leading-tight">
                          {selectedTour.listing.title}
                        </p>
                      </div>
                    </div>

                    {/* Meta Specs */}
                    <div className="p-3 bg-zinc-50/50 flex items-center justify-between border-t border-zinc-200/60 text-[11px] font-medium text-zinc-600">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={BedSingle01Icon} size={12} />{" "}
                          {selectedTour.listing.features.bedrooms} Bed
                        </span>
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={Bathtub01Icon} size={12} />{" "}
                          {selectedTour.listing.features.bathrooms} Bath
                        </span>
                        {selectedTour.listing.features.sizeSqm > 0 && (
                          <span className="flex items-center gap-1">
                            <HugeiconsIcon icon={Maximize01Icon} size={12} />{" "}
                            {selectedTour.listing.features.sizeSqm} sqm
                          </span>
                        )}
                      </div>
                      <span className="text-[13px] font-bold text-zinc-900 font-tabular-nums">
                        {formatCurrency(selectedTour.listing.price)}
                      </span>
                    </div>
                  </div>
                </section>

                {/* Section 2: Status CRM Toggle */}
                <section>
                  <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                    Tour Status
                  </h3>
                  <div className="bg-zinc-100/80 border border-zinc-200/60 p-1 rounded-xl flex flex-wrap gap-1">
                    {(
                      [
                        "Pending_Time",
                        "Confirmed",
                        "Completed",
                        "No_Show",
                        "Converted",
                      ] as TourStatus[]
                    ).map((status) => (
                      <button
                        key={status}
                        disabled={isPending}
                        onClick={() => handleStatusChange(status)}
                        className={`flex-1 min-w-[30%] py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg transition-all duration-200 ${
                          sheetStatus === status
                            ? "bg-white text-zinc-900 shadow-sm ring-1 ring-zinc-200/80"
                            : "text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-700 disabled:opacity-50"
                        }`}
                      >
                        {status.replace("_", " ")}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Section 3: Isolated Admin Notes */}
                <AdminNotesEditor
                  initialNotes={selectedTour.notes}
                  onSave={handleSaveNotes}
                  isPending={isPending}
                />
              </div>

              {/* Pinned Conversion Footer */}
              <div className="p-4 bg-white border-t border-zinc-200/80 shadow-[0_-8px_20px_rgba(0,0,0,0.03)] z-20">
                <Button
                  className="w-full h-11 rounded-md bg-black text-white hover:bg-zinc-800 text-[13px] font-semibold shadow-sm transition-all"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/checkout/${selectedTour.listing.slug}?type=deposit`,
                    );
                    toast.success("Checkout link copied to clipboard!");
                  }}
                >
                  <HugeiconsIcon icon={Copy01Icon} size={16} className="mr-2" />
                  Copy Checkout Link
                </Button>
                <p className="text-center text-[10px] text-zinc-400 mt-3 font-medium">
                  Send this secure link via WhatsApp to collect the deposit.
                </p>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
