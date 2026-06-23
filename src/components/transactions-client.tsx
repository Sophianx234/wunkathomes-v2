"use client";

import React, { useState, useMemo, useTransition } from "react";
import Link from "next/link";
import {
  Search01Icon,
  FilterIcon,
  ArrowUpRight01Icon,
  UniversityIcon,
  SmartPhone01Icon,
  LinkSquare01Icon,
  CreditCardIcon,
  Time01Icon,
  Building03Icon,
  Download01Icon,
  Alert01Icon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { toast } from "sonner";

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
import { TransactionReceipt } from "./transaction-reciept";

// --- TYPES ---
export interface UserTransaction {
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
    profilePicture?: string;
  };
  leaseId: string | null;
  listing: {
    id: string;
    slug: string;
    title: string;
    price: number;
    image: string;
    features: { bedrooms: number; bathrooms: number; sizeSqm: number };
    property: { propertyType: string; location: string; propertyName?: string };
  };
}

interface TransactionsClientProps {
  data: UserTransaction[];
}

// --- UTILS ---
const formatCurrency = (amount: number, currency: string = "GHS") =>
  new Intl.NumberFormat("en-GH", {
    style: "currency",
    currency: currency,
  }).format(amount);

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
};

// REFINED INDUSTRY-STANDARD MONOCHROMATIC BADGES
const getPurposeBadge = (purpose: string) => {
  return "text-zinc-700 bg-white ring-1 ring-zinc-200/80 shadow-[0_1px_2px_rgba(0,0,0,0.02)]";
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Success":
      return "text-emerald-700 ring-1 ring-emerald-200/50 bg-emerald-50/50";
    case "Pending":
      return "text-amber-700 ring-1 ring-amber-300/50 bg-amber-50/50";
    case "Failed":
    case "Abandoned":
      return "text-zinc-500 ring-1 ring-zinc-200/60 bg-zinc-50/50 line-through decoration-zinc-300";
    case "Refunded":
      return "text-rose-700 ring-1 ring-rose-200/50 bg-rose-50/50";
    default:
      return "text-zinc-600 ring-1 ring-zinc-200/60 bg-zinc-50/50";
  }
};

const getChannelIcon = (channel: string) => {
  switch (channel) {
    case "card":
      return <HugeiconsIcon icon={CreditCardIcon} size={14} className="text-zinc-400" />;
    case "mobile_money":
      return <HugeiconsIcon icon={SmartPhone01Icon} size={14} className="text-zinc-400" />;
    case "bank":
      return <HugeiconsIcon icon={UniversityIcon} size={14} className="text-zinc-400" />;
    default:
      return <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} className="text-zinc-400" />;
  }
};

// --- MAIN CLIENT COMPONENT ---
export default function TransactionsClient({ data }: TransactionsClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | "success" | "pending">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");
  const [purposeFilter, setPurposeFilter] = useState("all");
  
  const [selectedTx, setSelectedTx] = useState<UserTransaction | null>(null);
  const [isViewingReceipt, setIsViewingReceipt] = useState(false);
  
  const [isReportingIssue, setIsReportingIssue] = useState(false);
  const [isPending, startTransition] = useTransition();

  const filteredData = useMemo(() => {
    return data.filter((tx) => {
      if (activeTab === "success" && tx.status !== "Success") return false;
      if (activeTab === "pending" && tx.status !== "Pending") return false;
      if (channelFilter !== "all" && tx.channel !== channelFilter) return false;
      if (purposeFilter !== "all" && tx.paymentPurpose !== purposeFilter) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          tx.reference.toLowerCase().includes(query) ||
          tx.listing.title.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [data, activeTab, searchQuery, channelFilter, purposeFilter]);

  const pendingCount = data.filter((t) => t.status === "Pending").length;
  const uniqueChannels = Array.from(new Set(data.map((t) => t.channel)));
  const uniquePurposes = Array.from(new Set(data.map((t) => t.paymentPurpose)));

  const handleReportIssue = () => {
    if (!selectedTx) return;
    startTransition(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success(`Support ticket created for transaction #${selectedTx.reference.slice(-6)}.`);
      setIsReportingIssue(false);
    });
  };

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
    <div className="min-h-screen bg-[#FAFAFA] p-3 md:p-6 lg:pb-10 font-sans w-full overflow-x-hidden box-border">
      <div className="max-w-[1400px] mx-auto space-y-4 md:space-y-6 pt-6 md:pt-16 w-full box-border">
        
        {/* PAGE HEADER & TABS */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4 pb-2 border-b border-zinc-200/60 w-full box-border">
          <div>
            <h1 className="text-lg md:text-3xl font-semibold tracking-tight text-zinc-900 truncate">
              Payment History
            </h1>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as any)}
            className="w-full md:w-auto"
          >
            <TabsList className="h-8 md:h-9 bg-zinc-100/50 border border-zinc-200/60 p-0.5 md:p-0.5 rounded-lg w-full flex overflow-x-auto scrollbar-hide">
              <TabsTrigger value="all" className="text-[10px] md:text-[13px] font-medium data-[state=active]:bg-white rounded-md px-2 md:px-4 shrink-0">
                All Payments
              </TabsTrigger>
              <TabsTrigger value="success" className="text-[10px] md:text-[13px] font-medium data-[state=active]:bg-white rounded-md px-2 md:px-4 shrink-0">
                Successful
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-[10px] md:text-[13px] font-medium data-[state=active]:bg-white rounded-md px-2 md:px-4 shrink-0">
                Pending
                {pendingCount > 0 && (
                  <span className="ml-1 md:ml-2 inline-flex items-center justify-center bg-zinc-100/50 text-[8px] md:text-[10px] font-bold h-3 w-3 md:h-4 md:w-4 rounded-full text-zinc-600">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* INLINE FILTER CHROME */}
        <section className="flex flex-col xl:flex-row items-center gap-2 md:gap-4 bg-white p-1 md:p-1.5 border border-zinc-200/60 rounded-lg md:rounded-lg shadow-[0_1px_4px_rgba(0,0,0,0.01)] w-full box-border">
          <div className="relative flex-1 w-full min-w-0 box-border">
            <span className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 text-zinc-400 scale-75 md:scale-100 flex items-center">
              <HugeiconsIcon icon={Search01Icon} size={16} />
            </span>
            <Input
              placeholder="Search by Reference ID or Property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 md:pl-9 h-8 md:h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[10px] md:text-[13px] bg-transparent shadow-none placeholder:text-zinc-400 m-0 box-border"
            />
          </div>

          <div className="h-4 w-px bg-zinc-200 hidden xl:block shrink-0" />

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-1.5 md:gap-2 w-full xl:w-auto px-1 md:px-2 pb-1 xl:pb-0 box-border">
            <Select value={channelFilter} onValueChange={setChannelFilter}>
              <SelectTrigger className="w-full sm:w-[100px] md:w-[130px] h-7 md:h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100/50 text-[10px] md:text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md box-border m-0">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[10px] md:text-[12px]">All Channels</SelectItem>
                {uniqueChannels.map((channel) => (
                  <SelectItem key={channel} value={channel} className="text-[10px] md:text-[12px]">
                    {channel.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={purposeFilter} onValueChange={setPurposeFilter}>
              <SelectTrigger className="w-full sm:w-[110px] md:w-[150px] h-7 md:h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100/50 text-[10px] md:text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md box-border m-0">
                <SelectValue placeholder="Purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-[10px] md:text-[12px]">All Purposes</SelectItem>
                {uniquePurposes.map((purpose) => (
                  <SelectItem key={purpose} value={purpose} className="text-[10px] md:text-[12px]">
                    {purpose.replace("_", " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="h-4 w-px bg-zinc-200 hidden sm:block mx-0.5 md:mx-1 shrink-0" />

            <div className="hidden sm:flex items-center gap-1 md:gap-2 pl-1 pr-1 md:pr-2 shrink-0">
              <span className="text-[12px] md:text-[18px] font-semibold tracking-tighter text-zinc-900 leading-none font-tabular-nums">
                {filteredData.length}
              </span>
              <span className="text-[7px] md:text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">
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
              className="h-7 w-7 md:h-8 md:w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50 shrink-0 ml-auto sm:ml-0 rounded-md m-0 p-0"
            >
              <span className="scale-75 md:scale-100 flex items-center">
                <HugeiconsIcon icon={FilterIcon} size={14} />
              </span>
            </Button>
          </div>
        </section>

        {/* EDGE-TO-EDGE FINANCIAL TABLE */}
        <div className="bg-white border border-zinc-200/60 rounded-lg md:rounded-lg shadow-[0_1px_4px_rgba(0,0,0,0.01)] w-full overflow-hidden box-border">
          <div className="w-full overflow-x-auto box-border scrollbar-hide">
            <Table className="w-full min-w-full">
              <TableHeader className="bg-zinc-50/30">
                <TableRow className="border-zinc-200/60 hover:bg-transparent">
                  <TableHead className="font-medium text-zinc-500 text-[8px] md:text-xs h-8 md:h-10 w-[140px] md:w-[200px] whitespace-nowrap px-2 md:px-4">Reference & Date</TableHead>
                  <TableHead className="font-medium text-zinc-500 text-[8px] md:text-xs h-8 md:h-10 whitespace-nowrap px-2 md:px-4">Property</TableHead>
                  <TableHead className="font-medium text-zinc-500 text-[8px] md:text-xs h-8 md:h-10 hidden sm:table-cell whitespace-nowrap px-2 md:px-4">Payment Type</TableHead>
                  <TableHead className="font-medium text-zinc-500 text-[8px] md:text-xs h-8 md:h-10 hidden sm:table-cell whitespace-nowrap px-2 md:px-4">Method</TableHead>
                  <TableHead className="font-medium text-zinc-500 text-[8px] md:text-xs h-8 md:h-10 whitespace-nowrap px-2 md:px-4">Amount</TableHead>
                  <TableHead className="font-medium text-zinc-500 text-[8px] md:text-xs h-8 md:h-10 w-[80px] md:w-[140px] text-right pr-3 md:pr-6 whitespace-nowrap">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((tx) => (
                  <TableRow
                    key={tx.id}
                    className="group border-zinc-200/60 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedTx(tx)}
                  >
                    <TableCell className="py-2 md:py-3 align-middle px-2 md:px-4">
                      <div className="flex flex-col min-w-0">
                        <span className="text-[10px] md:text-[13px] font-mono font-medium text-zinc-900 truncate">
                          {tx.reference}
                        </span>
                        <span className="text-[8px] md:text-[11px] text-zinc-500 mt-0.5 truncate">
                          {formatDate(tx.createdAt)}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-2 md:py-3 align-middle px-2 md:px-4">
                      <div className="flex items-center gap-1.5 md:gap-3 min-w-0">
                        <div className="w-5 h-5 md:w-8 md:h-8 rounded md:rounded-md overflow-hidden bg-zinc-100/50 shrink-0 border border-zinc-200/60 flex items-center justify-center">
                          {tx.listing.image ? (
                            <img src={tx.listing.image} alt={tx.listing.title} className="w-full h-full object-cover" />
                          ) : (
                            <span className="scale-75 md:scale-100 flex items-center">
                              <HugeiconsIcon icon={Building03Icon} size={14} className="text-zinc-400" />
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] md:text-[13px] font-medium text-zinc-900 truncate max-w-[120px] md:max-w-[180px]">
                          {tx.listing.title}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-2 md:py-3 align-middle px-2 md:px-4 hidden sm:table-cell">
                      <span className={`px-1.5 md:px-2 py-0.5 rounded md:rounded-md text-[7px] md:text-[10px] uppercase font-bold tracking-widest whitespace-nowrap ${getPurposeBadge(tx.paymentPurpose)}`}>
                        {tx.paymentPurpose.replace("_", " ")}
                      </span>
                    </TableCell>

                    <TableCell className="py-2 md:py-3 align-middle px-2 md:px-4 hidden sm:table-cell">
                      <div className="flex items-center text-[9px] md:text-[12px] font-medium text-zinc-600 gap-1 md:gap-1.5 capitalize whitespace-nowrap">
                        <span className="scale-75 md:scale-100 flex items-center">{getChannelIcon(tx.channel)}</span>
                        {tx.channel.replace("_", " ")}
                      </div>
                    </TableCell>

                    <TableCell className="py-2 md:py-3 align-middle px-2 md:px-4">
                      <span className="text-[10px] md:text-[14px] font-semibold text-zinc-900 font-tabular-nums tracking-tight whitespace-nowrap">
                        {formatCurrency(tx.amount, tx.currency)}
                      </span>
                    </TableCell>

                    <TableCell className="py-2 md:py-3 align-middle text-right pr-3 md:pr-6">
                      <Badge
                        variant="outline"
                        className={`px-1.5 md:px-2 py-0 border-0 rounded-full text-[7px] md:text-[10px] uppercase tracking-wider font-bold h-4 md:h-5 whitespace-nowrap ${getStatusBadge(tx.status)}`}
                      >
                        {tx.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}

                {filteredData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-20 md:h-32 text-center text-zinc-500 text-[10px] md:text-sm">
                      You don't have any transactions matching this criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* INDUSTRY STANDARD TRANSACTION DESK (Sheet) */}
      <Dialog open={!!selectedTx && !isViewingReceipt} onOpenChange={(open) => !open && setSelectedTx(null)}>
        <DialogContent className="w-full sm:max-w-xl md:max-w-2xl p-0 bg-[#FAFAFA] border border-slate-200/80 flex flex-col font-sans shadow-sm rounded-lg max-h-[85vh] overflow-hidden">
          {selectedTx && (
            <>
              {/* Header Context Section */}
              <div className="px-4 md:px-6 py-6 md:py-8 border-b border-zinc-200/60 bg-zinc-50/30 w-full box-border">
                <div className="flex items-center justify-between mb-3 md:mb-5">
                  <Badge
                    variant="outline"
                    className={`px-1.5 md:px-2 py-0 border-0 rounded text-[7px] md:text-[9px] uppercase tracking-wider font-bold h-4 md:h-5 ${getStatusBadge(selectedTx.status)}`}
                  >
                    {selectedTx.status}
                  </Badge>
                  <span className={`px-1.5 md:px-2 py-0.5 rounded md:rounded-md text-[8px] md:text-[10px] font-bold uppercase tracking-widest ${getPurposeBadge(selectedTx.paymentPurpose)}`}>
                    {selectedTx.paymentPurpose.replace(/_/g, " ")}
                  </span>
                </div>

                <h2 className="text-2xl md:text-4xl font-semibold tracking-tighter text-zinc-900 font-tabular-nums leading-none truncate">
                  {formatCurrency(selectedTx.amount, selectedTx.currency)}
                </h2>
              </div>

              {/* Scrollable Data Body */}
              <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 md:py-8 space-y-6 md:space-y-10 w-full box-border">
                
                {/* 1. Transaction Audit Block (Definition List) */}
                <section className="w-full box-border">
                  <h3 className="text-[9px] md:text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2 md:mb-4">
                    Transaction Details
                  </h3>
                  <div className="bg-white border border-zinc-200/60 rounded-lg md:rounded-lg overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)] w-full box-border">
                    <dl className="divide-y divide-zinc-100 text-[10px] md:text-[13px] w-full">
                      <div className="flex justify-between py-2 md:py-3 px-3 md:px-4 w-full">
                        <dt className="text-zinc-500 font-medium shrink-0">Reference ID</dt>
                        <dd className="text-zinc-900 font-mono tracking-tight text-right font-medium truncate pl-2 max-w-[150px] md:max-w-[250px]">
                          {selectedTx.reference}
                        </dd>
                      </div>
                      <div className="flex justify-between py-2 md:py-3 px-3 md:px-4 w-full">
                        <dt className="text-zinc-500 font-medium shrink-0">Date Initiated</dt>
                        <dd className="text-zinc-900 font-tabular-nums text-right font-medium truncate pl-2">
                          {formatDate(selectedTx.createdAt)}
                        </dd>
                      </div>
                      {selectedTx.paidAt && (
                        <div className="flex justify-between py-2 md:py-3 px-3 md:px-4 w-full">
                          <dt className="text-zinc-500 font-medium shrink-0">Date Cleared</dt>
                          <dd className="text-emerald-700 font-tabular-nums text-right font-medium truncate pl-2">
                            {formatDate(selectedTx.paidAt)}
                          </dd>
                        </div>
                      )}
                      <div className="flex justify-between py-2 md:py-3 px-3 md:px-4 w-full">
                        <dt className="text-zinc-500 font-medium shrink-0">Payment Channel</dt>
                        <dd className="text-zinc-900 capitalize text-right flex items-center justify-end gap-1 md:gap-1.5 font-medium truncate pl-2">
                          <span className="scale-75 md:scale-100 flex items-center">{getChannelIcon(selectedTx.channel)}</span>
                          {selectedTx.channel.replace("_", " ")}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </section>

                {/* 2. Associated Asset Context Card */}
                <section className="w-full box-border">
                  <div className="flex items-center justify-between mb-2 md:mb-4 w-full">
                    <h3 className="text-[9px] md:text-[11px] font-bold text-zinc-400 uppercase tracking-widest truncate pr-2">
                      Associated Asset
                    </h3>
                    <Link
                      href={`/properties/${selectedTx.listing.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-[9px] md:text-[11px] font-medium text-zinc-500 hover:text-zinc-900 tracking-wide transition-colors shrink-0"
                    >
                      View Asset <span className="scale-75 md:scale-100 flex items-center"><HugeiconsIcon icon={LinkSquare01Icon} size={12} /></span>
                    </Link>
                  </div>

                  <div className="rounded-lg md:rounded-lg border border-zinc-200/60 overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)] bg-white w-full box-border">
                    <div className="p-3 md:p-4 flex gap-2 md:gap-4 w-full min-w-0">
                      <div className="h-10 w-10 md:h-12 md:w-12 shrink-0 bg-zinc-100/50 rounded-md overflow-hidden border border-zinc-200/60 shadow-sm">
                        {selectedTx.listing.image ? (
                          <img src={selectedTx.listing.image} alt="Property" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="scale-75 md:scale-100 flex items-center"><HugeiconsIcon icon={Building03Icon} size={16} className="text-zinc-300"/></span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center min-w-0">
                        <h4 className="text-[11px] md:text-sm font-semibold tracking-tight text-zinc-900 truncate">
                          {selectedTx.listing.title}
                        </h4>
                        <p className="text-[9px] md:text-[12px] text-zinc-500 mt-0.5 truncate">
                          {selectedTx.listing.property?.propertyName || selectedTx.listing.property?.location || "Location not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              {/* Fixed Bottom Action Bar */}
              <div className="p-3 md:p-4 border-t border-zinc-200/60 bg-white grid grid-cols-2 gap-2 md:gap-3 w-full box-border shrink-0">
                <Button
                  variant="outline"
                  onClick={() => setIsReportingIssue(true)}
                  className="h-8 md:h-10 w-full text-[10px] md:text-[12px] font-medium border-zinc-200/60 hover:bg-zinc-50 text-zinc-700 rounded-md md:rounded-lg shadow-none truncate px-1"
                >
                  <span className="scale-75 md:scale-100 flex items-center md:mr-2 shrink-0"><HugeiconsIcon icon={Alert01Icon} size={14} /></span>
                  Report Issue
                </Button>
                <Button
                  disabled={selectedTx.status !== "Success"}
                  onClick={() => setIsViewingReceipt(true)}
                  className="h-8 md:h-10 w-full text-[10px] md:text-[12px] font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-md md:rounded-lg shadow-none disabled:bg-zinc-200 disabled:text-zinc-400 truncate px-1"
                >
                  <span className="scale-75 md:scale-100 flex items-center md:mr-2 shrink-0"><HugeiconsIcon icon={Download01Icon} size={14} /></span>
                  {selectedTx.status === "Success" ? "View Receipt" : "Unavailable"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* SHADCN CONFIRMATION DIALOG (Report Issue Action) */}
      <AlertDialog
        open={isReportingIssue}
        onOpenChange={setIsReportingIssue}
      >
        <AlertDialogContent className="font-sans w-[90vw] md:max-w-[400px] rounded-lg md:rounded-lg p-4 md:p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base md:text-lg font-semibold tracking-tight text-zinc-900">
              Report Transaction Issue
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] md:text-[13px] text-zinc-500 leading-relaxed mt-1 md:mt-2 break-words">
              Are you sure you want to report transaction{" "}
              <span className="font-mono text-zinc-900 font-medium">#{selectedTx?.reference.slice(-6)}</span>{" "}
              to support? This will open a formal investigation ticket.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 md:mt-6 gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={isPending}
              className="h-8 md:h-9 px-3 md:px-4 text-[10px] md:text-[12px] font-medium border-zinc-200/60 hover:bg-zinc-50 rounded-md md:rounded-lg m-0"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleReportIssue}
              disabled={isPending}
              className="h-8 md:h-9 px-3 md:px-4 text-[10px] md:text-[12px] font-medium rounded-md md:rounded-lg m-0 bg-black text-white hover:bg-zinc-800 focus:ring-zinc-900"
            >
              {isPending ? (
                <>
                  <span className="scale-75 md:scale-100 flex items-center md:mr-2 shrink-0"><HugeiconsIcon icon={Loading03Icon} className="animate-spin" size={14} /></span>
                  Sending...
                </>
              ) : (
                "Submit Report"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
