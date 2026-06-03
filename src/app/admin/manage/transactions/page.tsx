"use client";

import React, { useState, useMemo } from "react";
import {
  Search01Icon,
  FilterIcon,
  ArrowUpRight01Icon,
  UniversityIcon,
  CheckmarkCircle01Icon,
  Alert01Icon,
  File02Icon,
  SearchMinusIcon,
  LinkSquare01Icon,
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
import { Textarea } from "@/components/ui/textarea";

// --- TYPES (Mapped from Mongoose Schemas) ---
interface TransactionRecord {
  id: string; // Database ID
  transactionReference: string;
  createdAt: string;
  amount: number;
  paymentPurpose:
    | "Booking_Deposit"
    | "Rent_Balance"
    | "Monthly_Renewal"
    | "Purchase";
  paymentMethod: "Paystack" | "Bank_Transfer" | "Cash";
  status: "Pending_Verification" | "Completed" | "Failed" | "Refunded";
  proofOfPaymentUrl?: string;
  user: {
    name: string;
    email: string;
    profilePicture: string;
  };
  lease: {
    id: string; // Lease ID for auditing
    propertyName: string;
    unitNumber: string;
  };
}

// --- MOCK DATA ---
const MOCK_TRANSACTIONS: TransactionRecord[] = [
  {
    id: "tx_001",
    transactionReference: "TXN-9842A",
    createdAt: "2026-05-17T10:14:00Z",
    amount: 45000,
    paymentPurpose: "Rent_Balance",
    paymentMethod: "Bank_Transfer",
    status: "Pending_Verification",
    proofOfPaymentUrl:
      "https://images.unsplash.com/photo-1621360841013-c76831f1e35d?q=80&w=400&auto=format&fit=crop",
    user: {
      name: "Kwame Mensah",
      email: "kwame.m@example.com",
      profilePicture: "https://i.pravatar.cc/150?u=kwame",
    },
    lease: {
      id: "LSE-8821",
      propertyName: "The Heights",
      unitNumber: "Apt 4B",
    },
  },
  {
    id: "tx_002",
    transactionReference: "PYS-1102B",
    createdAt: "2026-05-16T14:30:00Z",
    amount: 12000,
    paymentPurpose: "Booking_Deposit",
    paymentMethod: "Paystack",
    status: "Completed",
    user: {
      name: "Abena Osei",
      email: "abena.osei@example.com",
      profilePicture: "https://i.pravatar.cc/150?u=abena",
    },
    lease: {
      id: "LSE-9910",
      propertyName: "Cantonments Villas",
      unitNumber: "Villa 2",
    },
  },
  {
    id: "tx_003",
    transactionReference: "TXN-7731C",
    createdAt: "2026-05-15T09:05:00Z",
    amount: 3500,
    paymentPurpose: "Monthly_Renewal",
    paymentMethod: "Bank_Transfer",
    status: "Failed",
    proofOfPaymentUrl:
      "https://images.unsplash.com/photo-1621360841013-c76831f1e35d?q=80&w=400&auto=format&fit=crop",
    user: {
      name: "Daniel Tetteh",
      email: "dtetteh@example.com",
      profilePicture: "",
    },
    lease: {
      id: "LSE-4432",
      propertyName: "Osu Prime",
      unitNumber: "Suite 12",
    },
  },
];

// --- UTILS (Fintech Color & Typographic Scales) ---
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-GH", { style: "currency", currency: "GHS" }).format(
    amount,
  );

const formatDate = (dateString: string) => {
  const d = new Date(dateString);
  return `${d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}, ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
};

const getPurposeBadge = (purpose: TransactionRecord["paymentPurpose"]) => {
  const styles = {
    Booking_Deposit: "text-blue-700 bg-blue-50/50 ring-1 ring-blue-200/50",
    Rent_Balance: "text-purple-700 bg-purple-50/50 ring-1 ring-purple-200/50",
    Monthly_Renewal: "text-zinc-700 bg-zinc-100/50 ring-1 ring-zinc-200/60",
    Purchase: "text-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-200/50",
  };
  return styles[purpose];
};

const getStatusBadge = (status: TransactionRecord["status"]) => {
  switch (status) {
    case "Completed":
      return "text-emerald-700 ring-1 ring-emerald-200/60 bg-emerald-50/30";
    case "Pending_Verification":
      return "text-amber-700 ring-1 ring-amber-300/60 bg-amber-50/50 animate-pulse-slow";
    case "Failed":
      return "text-zinc-500 ring-1 ring-zinc-200/60 bg-zinc-50/50 line-through decoration-zinc-300";
    case "Refunded":
      return "text-rose-700 ring-1 ring-rose-200/60 bg-rose-50/50";
  }
};

// --- MAIN LEDGER COMPONENT ---
export default function TransactionsLedgerPage() {
  const [activeTab, setActiveTab] = useState<"needs-review" | "history">(
    "needs-review",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);
  const [showRejectNote, setShowRejectNote] = useState(false);

  // Derived Data based on active tab
  const filteredData = useMemo(() => {
    let data = MOCK_TRANSACTIONS;
    if (activeTab === "needs-review") {
      data = data.filter((tx) => tx.status === "Pending_Verification");
    }
    if (searchQuery) {
      data = data.filter(
        (tx) =>
          tx.transactionReference
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          tx.user.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }
    return data;
  }, [activeTab, searchQuery]);

  const pendingCount = MOCK_TRANSACTIONS.filter(
    (t) => t.status === "Pending_Verification",
  ).length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* PAGE HEADER & TABS (Fintech Style) */}
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
              <TabsTrigger
                value="needs-review"
                className="text-[13px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4"
              >
                Needs Review
                {pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center bg-zinc-100 text-[10px] font-bold h-4 w-4 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="text-[13px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4"
              >
                Transaction History
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* INLINE FILTER CHROME */}
        <section className="flex flex-col xl:flex-row items-center gap-4 bg-white p-1.5 border border-zinc-200/60 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.01)] w-full">
          <div className="relative flex-1 w-full">
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <Input
              placeholder="Search by Reference ID or Tenant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] bg-transparent shadow-none placeholder:text-zinc-400"
            />
          </div>

          <div className="h-4 w-px bg-zinc-200 hidden xl:block" />

          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full xl:w-auto px-2 pb-1 xl:pb-0">
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[130px] h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Channels</SelectItem>
                <SelectItem value="paystack">Paystack</SelectItem>
                <SelectItem value="bank">Bank Transfer</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[130px] h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
                <SelectValue placeholder="Purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purposes</SelectItem>
                <SelectItem value="deposit">Deposits</SelectItem>
                <SelectItem value="rent">Rent Balances</SelectItem>
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
              className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 shrink-0 ml-auto md:ml-0 rounded-md"
            >
              <HugeiconsIcon icon={FilterIcon} size={14} />
            </Button>
          </div>
        </section>

        {/* EDGE-TO-EDGE FINANCIAL TABLE */}
        <div className="bg-white border border-zinc-200/60 rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
          <Table>
            <TableHeader className="bg-zinc-50/30">
              <TableRow className="border-zinc-200/60 hover:bg-transparent">
                <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[180px]">
                  ID & Date
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">
                  Client / Tenant
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">
                  Allocation
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">
                  Channel
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10 text-right">
                  Value
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[140px] text-right">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((tx) => (
                <TableRow
                  key={tx.id}
                  className="group border-zinc-100 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                  onClick={() => {
                    setSelectedTx(tx);
                    setShowRejectNote(false); // Reset UI state when opening a new one
                  }}
                >
                  {/* Col 1: ID & Date */}
                  <TableCell className="py-3 align-middle">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-mono font-medium text-zinc-900">
                        {tx.transactionReference}
                      </span>
                      <span className="text-[11px] text-zinc-500 mt-0.5">
                        {formatDate(tx.createdAt)}
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
                      <span className="text-[13px] font-medium text-zinc-900">
                        {tx.user.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Col 3: Allocation */}
                  <TableCell className="py-3 align-middle">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide ${getPurposeBadge(tx.paymentPurpose)}`}
                    >
                      {tx.paymentPurpose.replace("_", " ")}
                    </span>
                  </TableCell>

                  {/* Col 4: Channel */}
                  <TableCell className="py-3 align-middle">
                    <div className="flex items-center text-[12px] font-medium text-zinc-600 gap-1.5">
                      {tx.paymentMethod === "Paystack" ? (
                        <>
                          Paystack{" "}
                          <HugeiconsIcon
                            icon={ArrowUpRight01Icon}
                            size={12}
                            className="text-zinc-400"
                          />
                        </>
                      ) : (
                        <>
                          <HugeiconsIcon
                            icon={UniversityIcon}
                            size={12}
                            className="text-zinc-400"
                          />{" "}
                          Bank Transfer
                        </>
                      )}
                    </div>
                  </TableCell>

                  {/* Col 5: Value */}
                  <TableCell className="py-3 align-middle text-right">
                    <span className="text-[14px] font-semibold text-zinc-900 font-tabular-nums tracking-tight">
                      {formatCurrency(tx.amount)}
                    </span>
                  </TableCell>

                  {/* Col 6: Status */}
                  <TableCell className="py-3 align-middle text-right">
                    <Badge
                      variant="outline"
                      className={`px-2 py-0 border-0 rounded-full text-[10px] uppercase tracking-wider font-bold h-5 ${getStatusBadge(tx.status)}`}
                    >
                      {tx.status.replace("_", " ")}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}

              {/* Empty State */}
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-zinc-500 text-sm"
                  >
                    No transactions match your current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* COMPONENT B: THE REVIEW DESK (Slide-out Sheet) */}
      <Sheet
        open={!!selectedTx}
        onOpenChange={(open) => !open && setSelectedTx(null)}
      >
        <SheetContent className="w-full sm:max-w-[420px] p-0 bg-white border-l border-zinc-200/60 flex flex-col font-sans shadow-2xl">
          {selectedTx && (
            <>
              {/* Scrollable Ledger Area */}
              <div className="flex-1 overflow-y-auto pb-32">
                {/* Header Profile Card */}
                <div className="px-6 pt-10 pb-6 border-b border-zinc-100 bg-zinc-50/30">
                  <Badge
                    variant="outline"
                    className={`mb-4 px-2 py-0 border-0 rounded-full text-[10px] uppercase tracking-wider font-bold h-5 ${getStatusBadge(selectedTx.status)}`}
                  >
                    {selectedTx.status.replace("_", " ")}
                  </Badge>

                  <h2 className="text-3xl font-semibold tracking-tighter text-zinc-900 font-tabular-nums mb-6">
                    {formatCurrency(selectedTx.amount)}
                  </h2>

                  {/* Intersecting Tenant Card */}
                  <div className="bg-white border border-zinc-200/60 rounded-lg p-3 flex items-center gap-3 ">
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

                <div className="px-6 py-6 space-y-8">
                  {/* Audit Details Block */}
                  <section>
                    <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                      Audit Log
                    </h3>
                    <div className="bg-white border border-zinc-200/60 rounded-xl overflow-hidden text-[13px]">
                      <div className="flex justify-between py-2.5 px-4 border-b border-zinc-100">
                        <span className="text-zinc-500 font-medium">
                          Reference ID
                        </span>
                        <span className="text-zinc-900 font-mono tracking-tight">
                          {selectedTx.transactionReference}
                        </span>
                      </div>

                      <div className="flex justify-between py-2.5 px-4 border-b border-zinc-100">
                        <span className="text-zinc-500 font-medium">
                          Timestamp
                        </span>
                        <span className="text-zinc-900 font-tabular-nums">
                          {formatDate(selectedTx.createdAt)}
                        </span>
                      </div>

                      <div className="flex justify-between py-2.5 px-4 border-b border-zinc-100">
                        <span className="text-zinc-500 font-medium">
                          Lease Link
                        </span>
                        <div className="flex items-center gap-1 text-zinc-900">
                          <HugeiconsIcon
                            icon={LinkSquare01Icon}
                            size={14}
                            className="text-indigo-500"
                          />
                          <span className="font-mono tracking-tight">
                            {selectedTx.lease.id}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between py-2.5 px-4 bg-zinc-50/50">
                        <span className="text-zinc-500 font-medium">Asset</span>
                        <span className="text-zinc-900 text-right">
                          {selectedTx.lease.propertyName} <br />
                          <span className="text-[11px] text-zinc-500">
                            {selectedTx.lease.unitNumber}
                          </span>
                        </span>
                      </div>
                    </div>
                  </section>

                  {/* Receipt Vault (Only for Bank Transfers) */}
                  {selectedTx.paymentMethod === "Bank_Transfer" && (
                    <section>
                      <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">
                        Proof of Payment
                      </h3>

                      {selectedTx.proofOfPaymentUrl ? (
                        <div className="relative group rounded-xl overflow-hidden border border-zinc-200/80 bg-zinc-100 cursor-pointer">
                          {/* Top Bar Chrome */}
                          <div className="absolute top-0 w-full h-8 bg-primary/40 backdrop-blur-md flex items-center px-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                            <HugeiconsIcon
                              icon={File02Icon}
                              size={14}
                              className="text-white/80 mr-2"
                            />
                            <span className="text-[10px] text-white/90 font-mono uppercase tracking-wider">
                              receipt_scan.jpg
                            </span>
                          </div>

                          {/* Image */}
                          <div className="aspect-[4/3] w-full">
                            <img
                              src={selectedTx.proofOfPaymentUrl}
                              alt="Bank Receipt"
                              className="w-full h-full object-cover mix-blend-multiply opacity-90 transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>

                          {/* Hover Magnify Overlay */}
                          <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur-sm text-zinc-900 text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                              <HugeiconsIcon icon={SearchMinusIcon} size={14} />{" "}
                              Enlarge Document
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="border border-dashed border-zinc-300 rounded-xl p-6 flex flex-col items-center justify-center text-zinc-400 bg-zinc-50">
                          <HugeiconsIcon
                            icon={Alert01Icon}
                            size={24}
                            className="mb-2 opacity-50"
                          />
                          <p className="text-[12px] font-medium text-center">
                            No document uploaded.
                          </p>
                        </div>
                      )}
                    </section>
                  )}
                </div>
              </div>

              {/* DUAL-ACTION FOOTER (Pinned) */}
              {selectedTx.status === "Pending_Verification" && (
                <div className="absolute bottom-0 left-0 w-full bg-white border-t border-zinc-200/80 p-4 space-y-3 shadow-[0_-8px_20px_rgba(0,0,0,0.03)] z-20">
                  {/* Expanding Text Box for Rejections */}
                  {showRejectNote && (
                    <div className="animate-in slide-in-from-bottom-2 fade-in duration-200 mb-2">
                      <label className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide mb-1 block">
                        Rejection Reason
                      </label>
                      <Textarea
                        placeholder="e.g. Receipt is blurry, or amount does not match..."
                        className="text-[13px] min-h-[60px] resize-none focus-visible:ring-rose-500/20 focus-visible:border-rose-500"
                        autoFocus
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    {/* Primary Approve Button */}
                    <Button
                      className={`flex-1 h-10 font-semibold rounded-lg transition-all duration-200 ${showRejectNote ? "bg-zinc-100 text-zinc-400 hover:bg-zinc-200 pointer-events-none" : "bg-primary text-white hover:bg-zinc-800 shadow-sm"}`}
                    >
                      <HugeiconsIcon
                        icon={CheckmarkCircle01Icon}
                        size={16}
                        className="mr-2"
                      />
                      Verify & Approve
                    </Button>

                    {/* Secondary Reject Button */}
                    <Button
                      variant="outline"
                      onClick={() => setShowRejectNote(!showRejectNote)}
                      className={`h-10 px-4 font-semibold transition-colors rounded-lg duration-200 ${showRejectNote ? "bg-rose-50 border-rose-200 text-rose-700 hover:bg-rose-100" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"}`}
                    >
                      {showRejectNote ? "Confirm Rejection" : "Flag & Reject"}
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
