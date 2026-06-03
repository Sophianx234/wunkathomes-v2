"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search01Icon,
  FilterIcon,
  ArrowUpRight01Icon,
  UniversityIcon,
  SmartPhone01Icon,
  LinkSquare01Icon,
  BedSingle01Icon,
  Bathtub01Icon,
  Maximize01Icon,
  CreditCardIcon,
  Time01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent } from "@/components/ui/sheet";

// --- TYPES ---
export interface TransactionRecord {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  paymentPurpose: string;
  channel: string;
  status: string;
  createdAt: string;
  paidAt: string | null;
  user: {
    name: string;
    email: string;
    profilePicture: string;
  };
  leaseId: string | null;
  listing: {
    id: string;
    slug: string;
    title: string;
    price: number;
    image: string;
    features: { bedrooms: number; bathrooms: number; sizeSqm: number };
    property: { propertyType: string; location: string };
  };
}

// --- UTILS ---
const formatCurrency = (amount: number, currency: string = "GHS") =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency }).format(amount);

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
};

const getPurposeBadge = (purpose: string) => {
  const styles: Record<string, string> = {
    Booking_Deposit: "text-blue-700 bg-blue-50/50 ring-1 ring-blue-200/50",
    Upfront_Rent: "text-indigo-700 bg-indigo-50/50 ring-1 ring-indigo-200/50",
    Rent_Balance: "text-purple-700 bg-purple-50/50 ring-1 ring-purple-200/50",
    Monthly_Renewal: "text-zinc-700 bg-zinc-100/50 ring-1 ring-zinc-200/60",
    Purchase: "text-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-200/50",
  };
  return styles[purpose] || "text-zinc-700 bg-zinc-100/50 ring-1 ring-zinc-200/60";
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Success":
      return "text-emerald-700 ring-1 ring-emerald-200/60 bg-emerald-50/30";
    case "Pending":
      return "text-amber-700 ring-1 ring-amber-300/60 bg-amber-50/50";
    case "Failed":
    case "Abandoned":
      return "text-zinc-500 ring-1 ring-zinc-200/60 bg-zinc-50/50 line-through decoration-zinc-300";
    case "Refunded":
      return "text-rose-700 ring-1 ring-rose-200/60 bg-rose-50/50";
    default:
      return "text-zinc-500 ring-1 ring-zinc-200/60 bg-zinc-50/50";
  }
};

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case "card":
      return <HugeiconsIcon icon={CreditCardIcon} size={12} className="text-zinc-400" />;
    case "mobile_money":
      return <HugeiconsIcon icon={SmartPhone01Icon} size={12} className="text-zinc-400" />;
    case "bank":
      return <HugeiconsIcon icon={UniversityIcon} size={12} className="text-zinc-400" />;
    default:
      return <HugeiconsIcon icon={Time01Icon} size={12} className="text-zinc-400" />;
  }
};

// --- MAIN CLIENT COMPONENT ---
export default function TransactionsClient({
  initialTransactions,
}: {
  initialTransactions: TransactionRecord[];
}) {
  const [activeTab, setActiveTab] = useState<"all" | "success" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [purposeFilter, setPurposeFilter] = useState("all");
  
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);

  // Derived Data based on filters
  const filteredData = useMemo(() => {
    return initialTransactions.filter((tx) => {
      // Tab Filter
      if (activeTab === "success" && tx.status !== "Success") return false;
      if (activeTab === "pending" && tx.status !== "Pending") return false;

      // Dropdown Filters
      if (channelFilter !== "all" && tx.channel !== channelFilter) return false;
      if (purposeFilter !== "all" && tx.paymentPurpose !== purposeFilter) return false;

      // Search Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          tx.reference.toLowerCase().includes(query) ||
          tx.user.name.toLowerCase().includes(query) ||
          tx.listing.title.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [initialTransactions, activeTab, searchQuery, channelFilter, purposeFilter]);

  const pendingCount = initialTransactions.filter((t) => t.status === "Pending").length;

  // Extract unique dynamic options for filters
  const uniqueChannels = Array.from(new Set(initialTransactions.map((t) => t.channel)));
  const uniquePurposes = Array.from(new Set(initialTransactions.map((t) => t.paymentPurpose)));

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* PAGE HEADER & TABS */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200/60 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Transactions
            </h1>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as any)}
            className="w-full md:w-auto"
          >
            <TabsList className="h-9 bg-zinc-100/50 border border-zinc-200/60 p-0.5 rounded-lg">
              <TabsTrigger value="all" className="text-[13px] font-medium data-[state=active]:bg-white  rounded-md px-4">
                All 
              </TabsTrigger>
              <TabsTrigger value="success" className="text-[13px] font-medium data-[state=active]:bg-white  rounded-md px-4">
                Successful
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-[13px] font-medium data-[state=active]:bg-white  rounded-md px-4">
                Pending
                {pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center bg-zinc-200/80 text-[10px] font-bold h-4 w-4 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* INLINE FILTER CHROME */}
        <section className="flex flex-col xl:flex-row items-center gap-4 bg-white p-1.5 border border-zinc-200/60 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.01)] w-full">
          <div className="relative flex-1 w-full">
            <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search by Reference ID, Tenant, or Property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] bg-transparent shadow-none placeholder:text-zinc-400"
            />
          </div>

          <div className="h-4 w-px bg-zinc-200 hidden xl:block" />

          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full xl:w-auto px-2 pb-1 xl:pb-0">
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-full md:w-[130px] h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                {uniqueChannels.map((channel) => (
                  <SelectItem key={channel} value={channel}>
                    {channel.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={purposeFilter} onValueChange={setPurposeFilter}>
              <SelectTrigger className="w-full md:w-[150px] h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
                <SelectValue placeholder="Purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purposes</SelectItem>
                {uniquePurposes.map((purpose) => (
                  <SelectItem key={purpose} value={purpose}>
                    {purpose.replace("_", " ")}
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
                setChannelFilter("all");
                setPurposeFilter("all");
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
              <TableRow className="border-zinc-200/60 hover:bg-transparent">
                <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[180px]">ID & Date</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Client / Tenant</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Allocation</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Channel</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10 ">Value</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[140px] ">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((tx) => (
                <TableRow
                  key={tx.id}
                  className="group border-zinc-100 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTx(tx)}
                >
                  {/* Col 1: ID & Date */}
                  <TableCell className="py-3 align-middle">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-mono font-medium text-zinc-900 truncate max-w-[150px]">
                        {tx.reference}
                      </span>
                      <span className="text-[11px] text-zinc-500 mt-0.5">
                        {new Date(tx.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}
                      </span>
                    </div>
                  </TableCell>

                  {/* Col 2: Client */}
                  <TableCell className="py-3 align-middle">
                    <div className="flex items-center gap-2.5">
                      <Avatar className="h-7 w-7 border border-zinc-200/60 shadow-sm">
                        <AvatarImage src={tx.user.profilePicture} />
                        <AvatarFallback className="bg-zinc-100 text-zinc-600 text-[10px]">
                          {tx.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-[13px] font-medium text-zinc-900 truncate max-w-[150px]">
                        {tx.user.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Col 3: Allocation */}
                  <TableCell className="py-3 align-middle">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide whitespace-nowrap ${getPurposeBadge(tx.paymentPurpose)}`}>
                      {tx.paymentPurpose.replace("_", " ")}
                    </span>
                  </TableCell>

                  {/* Col 4: Channel */}
                  <TableCell className="py-3 align-middle">
                    <div className="flex items-center text-[12px] font-medium text-zinc-600 gap-1.5 capitalize">
                      {getChannelIcon(tx.channel)}
                      {tx.channel.replace("_", " ")}
                    </div>
                  </TableCell>

                  {/* Col 5: Value */}
                  <TableCell className="py-3 align-middle ">
                    <span className="text-[14px] font-semibold text-zinc-900 font-tabular-nums tracking-tight">
                      {formatCurrency(tx.amount, tx.currency)}
                    </span>
                  </TableCell>

                  {/* Col 6: Status */}
                  <TableCell className="py-3 align-middle ">
                    <Badge
                      variant="outline"
                      className={`px-2 py-0 border-0 rounded-full text-[10px] uppercase tracking-wider font-bold h-5 ${getStatusBadge(tx.status)}`}
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}

              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-zinc-500 text-sm">
                    No transactions match your current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* COMPONENT B: READ-ONLY TRANSACTION DESK (Sheet) */}
      <Sheet open={!!selectedTx} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <SheetContent className="w-full sm:max-w-[420px] p-0 bg-[#FAFAFA] border-l border-zinc-200/60 flex flex-col font-sans shadow-2xl">
          {selectedTx && (
            <div className="flex-1 overflow-y-auto">
              
              {/* Header Profile Card */}
              <div className="px-6 pt-10 pb-6 border-b border-zinc-200/60 bg-white">
                <Badge
                  variant="outline"
                  className={`mb-4 px-2 py-0 border-0 rounded-full text-[10px] uppercase tracking-wider font-bold h-5 ${getStatusBadge(selectedTx.status)}`}
                >
                  {selectedTx.status}
                </Badge>

                <h2 className="text-3xl font-semibold tracking-tighter text-zinc-900 font-tabular-nums mb-6">
                  {formatCurrency(selectedTx.amount, selectedTx.currency)}
                </h2>

                <div className="bg-white border border-zinc-200/60 rounded-lg p-3 flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-zinc-200/60">
                    <AvatarImage src={selectedTx.user.profilePicture} />
                    <AvatarFallback className="bg-zinc-100 text-zinc-600 text-xs">
                      {selectedTx.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-[13px] font-medium text-zinc-900 leading-tight">
                      {selectedTx.user.name}
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {selectedTx.user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-6">
                
                {/* 1. Property Context Card (Mapped exactly like Tours) */}
                <section>
                  <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                    Associated Property
                  </h3>
                  <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)] group relative">
                    <Link
                      href={`/admin/properties/${selectedTx.listing.slug}`}
                      target="_blank"
                      className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <HugeiconsIcon icon={LinkSquare01Icon} size={14} />
                    </Link>

                    {/* Image Header */}
                    <div className="h-32 w-full bg-zinc-100 relative">
                      <img
                        src={selectedTx.listing.image}
                        alt={selectedTx.listing.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-3 left-3 text-white">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                          {selectedTx.listing.property.propertyType.replace("_", " ")}
                        </p>
                        <p className="text-[15px] font-semibold leading-tight">
                          {selectedTx.listing.title}
                        </p>
                      </div>
                    </div>

                    {/* Meta Specs */}
                    <div className="p-3 bg-zinc-50/50 flex items-center justify-between border-t border-zinc-200/60 text-[11px] font-medium text-zinc-600">
                      <div className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={BedSingle01Icon} size={12} /> {selectedTx.listing.features.bedrooms} Bed
                        </span>
                        <span className="flex items-center gap-1">
                          <HugeiconsIcon icon={Bathtub01Icon} size={12} /> {selectedTx.listing.features.bathrooms} Bath
                        </span>
                        {selectedTx.listing.features.sizeSqm > 0 && (
                          <span className="flex items-center gap-1">
                            <HugeiconsIcon icon={Maximize01Icon} size={12} /> {selectedTx.listing.features.sizeSqm} sqm
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* 2. Audit Details Block */}
                <section>
                  <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                    Audit Log
                  </h3>
                  <div className="bg-white border border-zinc-200/60 rounded-xl overflow-hidden text-[13px] shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                    <div className="flex justify-between py-2.5 px-4 border-b border-zinc-100">
                      <span className="text-zinc-500 font-medium">Reference ID</span>
                      <span className="text-zinc-900 font-mono tracking-tight break-all text-right ml-4">
                        {selectedTx.reference}
                      </span>
                    </div>

                    <div className="flex justify-between py-2.5 px-4 border-b border-zinc-100">
                      <span className="text-zinc-500 font-medium">Created At</span>
                      <span className="text-zinc-900 font-tabular-nums text-right">
                        {formatDate(selectedTx.createdAt)}
                      </span>
                    </div>

                    {selectedTx.paidAt && (
                      <div className="flex justify-between py-2.5 px-4 border-b border-zinc-100">
                        <span className="text-zinc-500 font-medium">Cleared At</span>
                        <span className="text-emerald-700 font-tabular-nums text-right font-medium">
                          {formatDate(selectedTx.paidAt)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between py-2.5 px-4 border-b border-zinc-100">
                      <span className="text-zinc-500 font-medium">Payment Channel</span>
                      <span className="text-zinc-900 capitalize text-right flex items-center gap-1.5">
                        {getChannelIcon(selectedTx.channel)}
                        {selectedTx.channel.replace("_", " ")}
                      </span>
                    </div>

                    {selectedTx.leaseId && (
                      <div className="flex justify-between py-2.5 px-4 bg-zinc-50/50">
                        <span className="text-zinc-500 font-medium">Lease ID</span>
                        <div className="flex items-center gap-1 text-zinc-900 text-right">
                          <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} className="text-indigo-500" />
                          <span className="font-mono tracking-tight text-[11px]">
                            {selectedTx.leaseId.slice(-8).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}