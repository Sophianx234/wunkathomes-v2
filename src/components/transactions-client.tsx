"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowUpRight01Icon,
  UniversityIcon,
  File02Icon,
  Download01Icon,
  CreditCardIcon,
  SmartPhone01Icon,
  Home09Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import PrintReceipt, { UserTransaction } from "./print-reciept-cleint";

// Import your new PrintReceipt component and its type

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

const getPurposeBadge = (purpose: string) => {
  switch (purpose) {
    case "Upfront_Rent":
      return "text-blue-700 bg-blue-50/50 ring-1 ring-blue-200/50";
    case "Rent_Balance":
      return "text-purple-700 bg-purple-50/50 ring-1 ring-purple-200/50";
    case "Monthly_Renewal":
      return "text-zinc-700 bg-zinc-100/50 ring-1 ring-zinc-200/60";
    case "Purchase":
      return "text-emerald-700 bg-emerald-50/50 ring-1 ring-emerald-200/50";
    default:
      return "text-zinc-700 bg-zinc-100/50 ring-1 ring-zinc-200/60";
  }
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Success":
      return "text-emerald-700 ring-1 ring-emerald-200/60 bg-emerald-50/30";
    case "Pending":
      return "text-amber-700 ring-1 ring-amber-300/60 bg-amber-50/50 animate-pulse-slow";
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
      return (
        <HugeiconsIcon
          icon={CreditCardIcon}
          size={14}
          className="text-zinc-500"
        />
      );
    case "mobile_money":
      return (
        <HugeiconsIcon
          icon={SmartPhone01Icon}
          size={14}
          className="text-zinc-500"
        />
      );
    case "bank":
      return (
        <HugeiconsIcon
          icon={UniversityIcon}
          size={14}
          className="text-zinc-500"
        />
      );
    default:
      return (
        <HugeiconsIcon
          icon={ArrowUpRight01Icon}
          size={14}
          className="text-zinc-500"
        />
      );
  }
};

// --- MAIN CLIENT COMPONENT ---
export default function TransactionsClient({ data }: TransactionsClientProps) {
  const [activeTab, setActiveTab] = useState<"all" | "success" | "pending">(
    "all",
  );
  const [selectedTx, setSelectedTx] = useState<UserTransaction | null>(null);

  // Filter Logic
  const filteredData = useMemo(() => {
    if (activeTab === "success")
      return data.filter((tx) => tx.status === "Success");
    if (activeTab === "pending")
      return data.filter((tx) => tx.status === "Pending");
    return data;
  }, [data, activeTab]);

  const pendingCount = data.filter((t) => t.status === "Pending").length;

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans print:p-0 print:bg-white">
      {/* Hide the main dashboard view when printing */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          @media print {
            #main-table-view { display: none !important; }
          }
        `,
        }}
      />

      <div
        id="main-table-view"
        className="max-w-[1400px] mx-auto space-y-6 pt-12 md:pt-16 print:hidden"
      >
        {/* PAGE HEADER & TABS */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-zinc-900">
              Payment History
            </h1>
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as any)}
            className="w-full md:w-auto"
          >
            <TabsList className="h-9 bg-zinc-100/50 border border-zinc-200/60 p-0.5 rounded-lg">
              <TabsTrigger
                value="all"
                className="text-[13px] font-medium data-[state=active]:bg-white  rounded-md px-4"
              >
                All Payments
              </TabsTrigger>
              <TabsTrigger
                value="success"
                className="text-[13px] font-medium data-[state=active]:bg-white  rounded-md px-4"
              >
                Successful
              </TabsTrigger>
              <TabsTrigger
                value="pending"
                className="text-[13px] font-medium data-[state=active]:bg-white  rounded-md px-4"
              >
                Pending
                {pendingCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center bg-zinc-100 text-[10px] font-bold h-4 w-4 rounded-full">
                    {pendingCount}
                  </span>
                )}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* EDGE-TO-EDGE FINANCIAL TABLE */}
        <div className="bg-white border border-zinc-200/60 rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
          <Table>
            <TableHeader className="bg-zinc-50/30">
              <TableRow className="border-zinc-200/60 hover:bg-transparent">
                <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[200px]">
                  Reference & Date
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">
                  Property
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">
                  Payment Type
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">
                  Method
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10 ">
                  Amount
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[140px] ">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((tx) => (
                <TableRow
                  key={tx.id}
                  className="group border-zinc-100 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTx(tx)}
                >
                  <TableCell className="py-3 align-middle">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-mono font-medium text-zinc-900">
                        {tx.reference}
                      </span>
                      <span className="text-[11px] text-zinc-500 mt-0.5">
                        {formatDate(tx.createdAt)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-md overflow-hidden bg-zinc-100 shrink-0 border border-zinc-200 flex items-center justify-center">
                        {tx.propertyImage ? (
                          <img
                            src={tx.propertyImage}
                            alt={tx.propertyTitle}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <HugeiconsIcon
                            icon={Home09Icon}
                            size={14}
                            className="text-zinc-400"
                          />
                        )}
                      </div>
                      <span className="text-[13px] font-medium text-zinc-900">
                        {tx.propertyTitle}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 align-middle">
                    <span
                      className={`px-2 py-0.5 rounded-sm text-[10px] uppercase font-bold tracking-widest ${getPurposeBadge(tx.paymentPurpose)}`}
                    >
                      {tx.paymentPurpose.replace("_", " ")}
                    </span>
                  </TableCell>

                  <TableCell className="py-3 align-middle">
                    <div className="flex items-center text-[12px] font-medium text-zinc-600 gap-1.5 capitalize">
                      {getChannelIcon(tx.channel)}{" "}
                      {tx.channel.replace("_", " ")}
                    </div>
                  </TableCell>

                  <TableCell className="py-3 align-middle ">
                    <span className="text-[14px] font-semibold text-zinc-900 font-tabular-nums tracking-tight">
                      {formatCurrency(tx.amount, tx.currency)}
                    </span>
                  </TableCell>

                  <TableCell className="py-3 align-middle ">
                    <Badge
                      variant="outline"
                      className={`px-2 py-0 border-0  text-[10px] uppercase tracking-wider rounded-sm font-bold h-5 ${getStatusBadge(tx.status)}`}
                    >
                      {tx.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}

              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-32 text-center text-zinc-500 text-sm"
                  >
                    You don't have any transactions in this category yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* COMPONENT B: THE DIGITAL LEDGER SHEET */}
      <Sheet
        open={!!selectedTx}
        onOpenChange={(open) => !open && setSelectedTx(null)}
      >
        <SheetContent className="w-full sm:max-w-[420px] p-0 bg-white border-none flex flex-col font-sans shadow-2xl print:hidden">
          {selectedTx && (
            <>
              {/* Scrollable Details Area */}
              <div className="flex-1 overflow-y-auto bg-zinc-100 p-4 pb-32">
                {/* Embedded Receipt Preview inside the Sheet */}
                <div className="scale-[0.95] origin-top">
                  <PrintReceipt transaction={selectedTx} />
                </div>
              </div>

              {/* ACTION FOOTER */}
              <div className="absolute bottom-0 left-0 w-full bg-white border-t border-zinc-200/80 p-4 shadow-[0_-8px_20px_rgba(0,0,0,0.03)] z-20">
                <Button
                  disabled={selectedTx.status !== "Success"}
                  className="w-full h-12 bg-zinc-950 text-white font-bold uppercase tracking-widest text-xs hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 rounded-xl disabled:bg-zinc-200 disabled:text-zinc-400"
                  onClick={() => window.print()}
                >
                  <HugeiconsIcon
                    icon={
                      selectedTx.status === "Success"
                        ? Download01Icon
                        : File02Icon
                    }
                    size={16}
                  />
                  {selectedTx.status === "Success"
                    ? "Download Receipt"
                    : "Receipt Unavailable"}
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* --- ISOLATED PRINT COMPONENT (Only renders to the printer) --- */}
      {selectedTx && (
        <PrintReceipt isPrintView={true} transaction={selectedTx} />
      )}
    </div>
  );
}
