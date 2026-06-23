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
  Building03Icon,
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
import { TransactionReceipt } from "./transaction-reciept";

// IMPORT YOUR RECEIPT COMPONENT HERE

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

// REFINED INDUSTRY-STANDARD MONOCHROMATIC BADGES
const getPurposeBadge = (purpose: string) => {
  const styles: Record<string, string> = {
    Booking_Deposit: "text-zinc-700 bg-zinc-100 ring-1 ring-zinc-200/80",
    Upfront_Rent: "text-zinc-900 bg-zinc-100 ring-1 ring-zinc-300/80",
    Rent_Balance: "text-zinc-700 bg-zinc-100 ring-1 ring-zinc-200/80",
    Monthly_Renewal: "text-zinc-600 bg-zinc-50 ring-1 ring-zinc-200/60",
    Purchase: "text-zinc-900 bg-zinc-100 ring-1 ring-zinc-300/80",
  };
  return styles[purpose] || "text-zinc-600 bg-zinc-50 ring-1 ring-zinc-200/60";
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Success":
      return "text-emerald-700 ring-1 ring-emerald-200/50 bg-emerald-50";
    case "Pending":
      return "text-amber-700 ring-1 ring-amber-300/50 bg-amber-50";
    case "Failed":
    case "Abandoned":
      return "text-zinc-500 ring-1 ring-zinc-200/60 bg-zinc-50 line-through decoration-zinc-300";
    case "Refunded":
      return "text-rose-700 ring-1 ring-rose-200/50 bg-rose-50";
    default:
      return "text-zinc-600 ring-1 ring-zinc-200/60 bg-zinc-50";
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
  const [isViewingReceipt, setIsViewingReceipt] = useState(false); // NEW STATE FOR RECEIPT VIEWER

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

  // =====================================================================
  // INVOCATION OF THE ISOLATED RECEIPT COMPONENT
  // =====================================================================
  if (isViewingReceipt && selectedTx) {
    return (
      <TransactionReceipt 
        transaction={selectedTx} 
        onBack={() => setIsViewingReceipt(false)} 
      />
    );
  }

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
                  <span className="ml-2 inline-flex items-center justify-center bg-zinc-200/80 text-[10px] font-bold h-4 w-4 rounded-full text-zinc-700">
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
                        <AvatarFallback className="bg-zinc-100 text-zinc-600 text-[10px] font-medium">
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

      {/* INDUSTRY STANDARD TRANSACTION DESK (Sheet) */}
      <Sheet open={!!selectedTx && !isViewingReceipt} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <SheetContent className="w-full sm:max-w-[480px] p-0 bg-[#FAFAFA] border-l border-zinc-200/60 flex flex-col font-sans shadow-2xl">
          {selectedTx && (
            <>
              {/* Header Context Section */}
              <div className="px-6 py-8 border-b border-zinc-100 bg-zinc-50/30">
                <div className="flex items-center justify-between mb-6">
                  <Badge
                    variant="outline"
                    className={`px-2 py-0 border-0 rounded text-[9px] uppercase tracking-wider font-bold h-5 ${getStatusBadge(selectedTx.status)}`}
                  >
                    {selectedTx.status}
                  </Badge>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getPurposeBadge(selectedTx.paymentPurpose)}`}>
                    {selectedTx.paymentPurpose.replace(/_/g, " ")}
                  </span>
                </div>

                <h2 className="text-3xl font-semibold tracking-tighter text-zinc-900 font-tabular-nums mb-6 leading-none">
                  {formatCurrency(selectedTx.amount, selectedTx.currency)}
                </h2>

                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border border-zinc-200/60 shadow-sm">
                    <AvatarImage src={selectedTx.user.profilePicture} />
                    <AvatarFallback className="bg-zinc-100 text-zinc-600 font-medium text-sm">
                      {selectedTx.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col pt-0.5">
                    <h3 className="text-base font-semibold tracking-tight text-zinc-900 leading-none">
                      {selectedTx.user.name}
                    </h3>
                    <p className="text-[13px] text-zinc-500 mt-1.5 leading-none">
                      {selectedTx.user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Data Body */}
              <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10">
                
                {/* 1. Property Context Card */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      Associated Asset
                    </h3>
                    <Link
                      href={`/admin/properties/${selectedTx.listing.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500 hover:text-zinc-900 tracking-wide transition-colors"
                    >
                      View Asset <HugeiconsIcon icon={LinkSquare01Icon} size={12} />
                    </Link>
                  </div>

                  <div className="rounded-xl border border-zinc-200/60 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                    <div className="p-4 bg-zinc-50/50 flex gap-4 border-b border-zinc-100">
                      <div className="h-12 w-12 shrink-0 bg-white rounded-md overflow-hidden border border-zinc-200/60 shadow-sm">
                        {selectedTx.listing.image ? (
                          <img src={selectedTx.listing.image} alt="Property" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <HugeiconsIcon icon={Building03Icon} size={16} className="text-zinc-300"/>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-sm font-semibold tracking-tight text-zinc-900 truncate">
                          {selectedTx.listing.title}
                        </h4>
                        <p className="text-[12px] text-zinc-500 mt-0.5 truncate">
                          {selectedTx.listing.property.propertyName || selectedTx.listing.property.location}
                        </p>
                      </div>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-4 p-4 text-[13px] bg-white">
                      <div>
                        <dt className="text-zinc-500 mb-1">Pricing</dt>
                        <dd className="font-medium text-zinc-900 font-tabular-nums">{formatCurrency(selectedTx.listing.price)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500 mb-1">Asset Type</dt>
                        <dd className="font-medium text-zinc-900 capitalize">{selectedTx.listing.property.propertyType.replace("_", " ")}</dd>
                      </div>
                      <div className="col-span-2">
                        <dt className="text-zinc-500 mb-1.5">Configurations</dt>
                        <dd className="flex items-center gap-4 text-zinc-700 font-medium">
                          <span className="flex items-center gap-1.5">
                            <HugeiconsIcon icon={BedSingle01Icon} size={14} className="text-zinc-400" />
                            {selectedTx.listing.features.bedrooms} Bed
                          </span>
                          <span className="flex items-center gap-1.5">
                            <HugeiconsIcon icon={Bathtub01Icon} size={14} className="text-zinc-400" />
                            {selectedTx.listing.features.bathrooms} Bath
                          </span>
                          {selectedTx.listing.features.sizeSqm > 0 && (
                            <span className="flex items-center gap-1.5">
                              <HugeiconsIcon icon={Maximize01Icon} size={14} className="text-zinc-400" />
                              {selectedTx.listing.features.sizeSqm} sqm
                            </span>
                          )}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </section>

                {/* 2. Audit Details Block */}
                <section>
                  <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
                    Audit Log
                  </h3>
                  <div className="bg-white border border-zinc-200/60 rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
                    <dl className="divide-y divide-zinc-100 text-[13px]">
                      <div className="flex justify-between py-3 px-4">
                        <dt className="text-zinc-500 font-medium">Reference ID</dt>
                        <dd className="text-zinc-900 font-mono tracking-tight text-right font-medium">
                          {selectedTx.reference}
                        </dd>
                      </div>
                      <div className="flex justify-between py-3 px-4">
                        <dt className="text-zinc-500 font-medium">Created At</dt>
                        <dd className="text-zinc-900 font-tabular-nums text-right font-medium">
                          {formatDate(selectedTx.createdAt)}
                        </dd>
                      </div>
                      {selectedTx.paidAt && (
                        <div className="flex justify-between py-3 px-4">
                          <dt className="text-zinc-500 font-medium">Cleared At</dt>
                          <dd className="text-emerald-700 font-tabular-nums text-right font-medium">
                            {formatDate(selectedTx.paidAt)}
                          </dd>
                        </div>
                      )}
                      <div className="flex justify-between py-3 px-4">
                        <dt className="text-zinc-500 font-medium">Channel</dt>
                        <dd className="text-zinc-900 capitalize text-right flex items-center gap-1.5 font-medium">
                          {getChannelIcon(selectedTx.channel)}
                          {selectedTx.channel.replace("_", " ")}
                        </dd>
                      </div>
                      {selectedTx.leaseId && (
                        <div className="flex justify-between py-3 px-4 bg-zinc-50/50">
                          <dt className="text-zinc-500 font-medium">Lease Link</dt>
                          <dd className="flex items-center gap-1 text-zinc-900 text-right font-medium">
                            <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} className="text-zinc-400" />
                            <span className="font-mono tracking-tight text-[12px] uppercase">
                              {selectedTx.leaseId.slice(-8)}
                            </span>
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>
                </section>
              </div>

              {/* Fixed Bottom Action Bar */}
              <div className="p-4 border-t border-zinc-200/60 bg-white">
                <Button
                  variant="outline"
                  onClick={() => setIsViewingReceipt(true)}
                  className="h-10 w-full text-[12px] font-medium border-zinc-200 hover:bg-zinc-50 rounded-lg flex items-center justify-center gap-2 shadow-none text-zinc-700"
                >
                  View Official Receipt
                  <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} className="text-zinc-400" />
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
