"use client";

import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  ArrowUpRight01Icon,
  Cancel01Icon,
  Copy01Icon,
  FilterIcon,
  Loading03Icon,
  MoreHorizontalIcon,
  Search01Icon,
  Shield02Icon,
  Building03Icon,
  File01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { toggleAccountStatus } from "@/actions/admin/tenant.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

// --- TYPES ---
interface TenantRecord {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profilePicture: string;
    kycStatus: string;
    ghanaCardNumber: string;
    ghanaCardUrl: string;
    accountStatus: string;
  };
  lease: {
    id: string;
    propertyName: string;
    unitNumber: string;
    location: string;
    region: string;
    propertyImage: string;
    status: string;
    startDate: string;
    endDate: string;
    totalRentAmount: number;
    smartLockCode?: string;
  };
  transactions: Array<{
    id: string;
    date: string;
    purpose: string;
    amount: number;
    status: string;
  }>;
}

interface ManageTenantsClientProps {
  data: TenantRecord[];
  availableRegions: string[];
  availableStatuses: string[];
}

// --- UTILS ---
const formatCurrency = (amount: number) => `GHS ${amount.toLocaleString()}`;

const getLeaseBadgeStyle = (status: string) => {
  const styles: Record<string, string> = {
    Active: "bg-zinc-900 text-zinc-50 ring-1 ring-zinc-950",
    Pending_Balance: "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200/80",
    Pending_Deposit: "bg-zinc-100 text-zinc-700 ring-1 ring-zinc-200/80",
    Expired: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/50",
    Cancelled: "bg-zinc-50 text-zinc-500 ring-1 ring-zinc-200",
  };
  return styles[status] || "bg-zinc-50 text-zinc-600 ring-1 ring-zinc-200";
};

const getAccountBadgeStyle = (status: string) => {
  if (status === "Suspended")
    return "bg-rose-50 text-rose-700 ring-1 ring-rose-200/50";
  return null;
};

// --- MAIN PAGE COMPONENT ---
export default function ManageTenantsClient({
  data,
  availableRegions,
  availableStatuses,
}: ManageTenantsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [selectedTenant, setSelectedTenant] = useState<TenantRecord | null>(null);
  
  // NEW: State for expanded image viewer
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  
  const [pendingAction, setPendingAction] = useState<{
    tenantId: string;
    currentStatus: string;
    actionType: "Suspend" | "Restore";
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  const filteredData = useMemo(() => {
    return data.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.lease.propertyName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.lease.status === statusFilter;
      const matchesRegion = regionFilter === "all" || t.lease.region === regionFilter;
      return matchesSearch && matchesStatus && matchesRegion;
    });
  }, [data, searchQuery, statusFilter, regionFilter]);

  const requestStatusToggle = (tenantId: string, currentStatus: string) => {
    setPendingAction({
      tenantId,
      currentStatus,
      actionType: currentStatus === "Active" ? "Suspend" : "Restore",
    });
  };

  const executeToggleStatus = () => {
    if (!pendingAction) return;
    
    startTransition(async () => {
      const result = await toggleAccountStatus(pendingAction.tenantId, pendingAction.currentStatus);
      if (result.success) {
        toast.success(result.message);
        setSelectedTenant(null);
      } else {
        toast.error(result.error);
      }
      setPendingAction(null);
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200/60 pb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Tenant Directory
          </h1>
        </div>

        {/* SEARCH & FILTER CHROME */}
        <section className="flex flex-col xl:flex-row items-center gap-4 bg-white p-1.5 border border-zinc-200/60 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.01)] w-full">
          <div className="relative flex-1 w-full">
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <Input
              placeholder="Search by tenant name, email, or unit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] bg-transparent shadow-none placeholder:text-zinc-400"
            />
          </div>
          <div className="h-4 w-px bg-zinc-200 hidden xl:block" />
          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full xl:w-auto px-2 pb-1 xl:pb-0">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[160px] h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
                <SelectValue placeholder="Lease Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {availableStatuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-full md:w-[160px] h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {availableRegions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
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
                setRegionFilter("all");
              }}
              className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 shrink-0 ml-auto md:ml-0 rounded-md"
            >
              <HugeiconsIcon icon={FilterIcon} size={14} />
            </Button>
          </div>
        </section>

        {/* TENANTS TABLE */}
        <div className="bg-white border border-zinc-200/60 rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
          <Table>
            <TableHeader className="bg-zinc-50/30">
              <TableRow className="border-zinc-200/60 hover:bg-transparent">
                <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[280px]">
                  Tenant Profile
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">
                  Property Occupied
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">
                  Lease Status
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">
                  Expiry Date
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((tenant) => (
                <TableRow
                  key={tenant.id}
                  className="group border-zinc-100 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTenant(tenant)}
                >
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar
                        className={`h-9 w-9 border shadow-sm ${tenant.user.accountStatus !== "Active" ? "opacity-50 grayscale border-zinc-200" : "border-zinc-200/60"}`}
                      >
                        <AvatarImage src={tenant.user.profilePicture} />
                        <AvatarFallback className="bg-zinc-100 text-zinc-600 text-xs font-medium">
                          {tenant.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[13px] font-semibold leading-tight tracking-tight ${tenant.user.accountStatus === "Suspended" ? "text-zinc-400 line-through" : "text-zinc-900"}`}
                          >
                            {tenant.user.name}
                          </span>
                          {tenant.user.accountStatus !== "Active" && (
                            <Badge
                              variant="outline"
                              className={`px-1.5 py-0 border-0 rounded text-[9px] uppercase tracking-wider font-bold h-4 ${getAccountBadgeStyle(tenant.user.accountStatus)}`}
                            >
                              {tenant.user.accountStatus}
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-500 mt-0.5">
                          {tenant.user.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 align-middle">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-zinc-900 leading-tight">
                        {tenant.lease.propertyName}
                      </span>
                      <span className="text-[11px] text-zinc-500 mt-0.5">
                        {tenant.lease.unitNumber}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 align-middle">
                    <Badge
                      variant="outline"
                      className={`px-2 py-0 border-0 rounded text-[10px] uppercase tracking-wider font-bold h-5 ${getLeaseBadgeStyle(tenant.lease.status)}`}
                    >
                      {tenant.lease.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3 align-middle">
                    <span className="text-[13px] font-medium text-zinc-600">
                      {new Date(tenant.lease.endDate).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </TableCell>

                  <TableCell
                    className="py-3 align-middle text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-zinc-900 data-[state=open]:bg-zinc-100 data-[state=open]:text-zinc-900 rounded-md"
                        >
                          <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 rounded-xl shadow-lg border-zinc-200/80 font-sans p-1"
                      >
                        <DropdownMenuItem
                          onClick={() => setSelectedTenant(tenant)}
                          className="text-[12px] font-medium cursor-pointer text-zinc-700 rounded-lg h-8"
                        >
                          View Full Profile
                        </DropdownMenuItem>

                        <div className="h-px bg-zinc-100 my-1 mx-2" />

                        {tenant.user.accountStatus === "Active" ? (
                          <DropdownMenuItem
                            onClick={() => requestStatusToggle(tenant.user.id, tenant.user.accountStatus)}
                            className="text-[12px] font-medium cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700 rounded-lg h-8 flex items-center justify-between"
                          >
                            Suspend Account
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={() => requestStatusToggle(tenant.user.id, tenant.user.accountStatus)}
                            className="text-[12px] font-medium cursor-pointer text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900 rounded-lg h-8 flex items-center justify-between"
                          >
                            Restore Account
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-zinc-500 text-sm"
                  >
                    No tenants found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* TENANT PROFILE SHEET */}
      <Sheet
        open={!!selectedTenant}
        onOpenChange={(open) => !open && setSelectedTenant(null)}
      >
        <SheetContent className="w-full sm:max-w-[480px] p-0 bg-white border-l border-zinc-200/60 flex flex-col font-sans shadow-2xl">
          {selectedTenant && (
            <>
              {/* Header Profile Section */}
              <div className="px-6 py-8 border-b border-zinc-100 bg-zinc-50/30">
                {selectedTenant.user.accountStatus !== "Active" && (
                  <div className="mb-6 w-full p-3 rounded-lg flex items-center gap-2 text-xs font-medium bg-rose-50/50 text-rose-700 border border-rose-100">
                    <HugeiconsIcon icon={Cancel01Icon} size={14} />
                    This account is currently suspended. Portal access is restricted.
                  </div>
                )}
                
                <div className="flex items-start gap-4">
                  <Avatar
                    className={`h-14 w-14 border border-zinc-200/60 shadow-sm ${selectedTenant.user.accountStatus !== "Active" ? "opacity-50 grayscale" : ""}`}
                  >
                    <AvatarImage src={selectedTenant.user.profilePicture} />
                    <AvatarFallback className="bg-zinc-100 text-zinc-600 font-medium text-lg">
                      {selectedTenant.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col pt-1">
                    <h2 className="text-lg font-semibold tracking-tight text-zinc-900 leading-none">
                      {selectedTenant.user.name}
                    </h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[13px] text-zinc-500">{selectedTenant.user.email}</span>
                      <span className="text-zinc-300">•</span>
                      <span className="text-[13px] font-mono text-zinc-500 tracking-tight">{selectedTenant.user.phone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scrollable Data Body */}
              <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10">
                
                {/* 1. Property Details */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      Occupied Asset
                    </h3>
                    <Badge variant="outline" className={`px-2 py-0 border-0 rounded text-[9px] uppercase tracking-wider font-bold h-5 ${getLeaseBadgeStyle(selectedTenant.lease.status)}`}>
                      {selectedTenant.lease.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  
                  <div className="rounded-xl border border-zinc-200/60 overflow-hidden">
                    <div className="p-4 bg-zinc-50/50 flex gap-4 border-b border-zinc-100">
                      <div className="h-12 w-12 shrink-0 bg-white rounded-md overflow-hidden border border-zinc-200/60 shadow-sm">
                        {selectedTenant.lease.propertyImage ? (
                          <img src={selectedTenant.lease.propertyImage} alt="Property" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><HugeiconsIcon icon={Building03Icon} size={16} className="text-zinc-300"/></div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-sm font-semibold tracking-tight text-zinc-900">
                          {selectedTenant.lease.propertyName}
                        </h4>
                        <p className="text-[12px] text-zinc-500 mt-0.5">
                          {selectedTenant.lease.location} · <span className="font-medium text-zinc-700">{selectedTenant.lease.unitNumber}</span>
                        </p>
                      </div>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-4 p-4 text-[13px]">
                      <div>
                        <dt className="text-zinc-500 mb-1">Lease Start</dt>
                        <dd className="font-medium text-zinc-900">
                          {new Date(selectedTenant.lease.startDate).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500 mb-1">Lease End</dt>
                        <dd className="font-medium text-zinc-900">
                          {new Date(selectedTenant.lease.endDate).toLocaleDateString("en-GB", { month: "short", day: "numeric", year: "numeric" })}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500 mb-1">Total Rent</dt>
                        <dd className="font-medium text-zinc-900">{formatCurrency(selectedTenant.lease.totalRentAmount)}</dd>
                      </div>
                      <div>
                        <dt className="text-zinc-500 mb-1">Access PIN</dt>
                        <dd className="font-mono font-medium tracking-widest text-zinc-900">{selectedTenant.lease.smartLockCode || "N/A"}</dd>
                      </div>
                    </dl>
                  </div>
                </section>

                {/* 2. Identity Verification (UPDATED TO THUMBNAIL) */}
                <section>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      Identity Details
                    </h3>
                    {selectedTenant.user.kycStatus === "Verified" && (
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-100/50">
                        <HugeiconsIcon icon={Shield02Icon} size={12} /> Verified
                      </div>
                    )}
                  </div>
                  
                  <div className="rounded-xl border border-zinc-200/60 p-4 flex items-center justify-between">
                    <div>
                      <p className="text-[12px] text-zinc-500 mb-0.5">National ID (Ghana Card)</p>
                      <p className="font-mono text-sm font-medium text-zinc-900 tracking-tight">
                        {selectedTenant.user.ghanaCardNumber || "Not Provided"}
                      </p>
                    </div>
                    {selectedTenant.user.ghanaCardUrl ? (
                      <button
                        onClick={() => setExpandedImage(selectedTenant.user.ghanaCardUrl)}
                        className="relative h-12 w-20 bg-zinc-100 rounded-md border border-zinc-200 overflow-hidden group transition-all hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 shrink-0"
                      >
                        <img
                          src={selectedTenant.user.ghanaCardUrl}
                          alt="ID Document Thumbnail"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <HugeiconsIcon icon={Search01Icon} size={14} className="text-white" />
                        </div>
                      </button>
                    ) : (
                      <span className="text-[11px] text-zinc-400">No Document</span>
                    )}
                  </div>
                </section>

                {/* 3. Transaction Ledger */}
                <section>
                  <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
                    Transaction History
                  </h3>
                  <div className="space-y-1">
                    {selectedTenant.transactions.length > 0 ? (
                      selectedTenant.transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg hover:bg-zinc-50 transition-colors">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center border border-zinc-200/60">
                              <HugeiconsIcon icon={File01Icon} size={14} className="text-zinc-500" />
                            </div>
                            <div>
                              <p className="text-[13px] font-medium text-zinc-900 capitalize">
                                {tx.purpose.replace(/_/g, " ")}
                              </p>
                              <p className="text-[11px] text-zinc-500">
                                {tx.date}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[13px] font-medium text-zinc-900">
                              {formatCurrency(tx.amount)}
                            </p>
                            <span className={`text-[10px] font-semibold tracking-wider ${tx.status === "Success" ? "text-teal-600" : tx.status === "Failed" ? "text-rose-600" : "text-amber-600"}`}>
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-[13px] text-zinc-500 py-4 text-center border border-dashed border-zinc-200 rounded-xl">
                        No transactions recorded.
                      </p>
                    )}
                  </div>
                </section>
              </div>

              {/* Fixed Bottom Action Bar */}
              <div className="p-4 border-t border-zinc-200/60 bg-white grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="h-9 w-full text-[12px] font-medium border-zinc-200 hover:bg-zinc-50 rounded-lg"
                >
                  Tenancy Agreement
                </Button>

                {selectedTenant.user.accountStatus === "Active" ? (
                  <Button
                    variant="outline"
                    onClick={() => requestStatusToggle(selectedTenant.user.id, selectedTenant.user.accountStatus)}
                    className="h-9 w-full text-[12px] font-medium border-rose-200/60 bg-rose-50/50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 rounded-lg shadow-none"
                  >
                    Suspend Account
                  </Button>
                ) : (
                  <Button
                    onClick={() => requestStatusToggle(selectedTenant.user.id, selectedTenant.user.accountStatus)}
                    className="h-9 w-full text-[12px] font-medium bg-zinc-900 text-white hover:bg-zinc-800 rounded-lg"
                  >
                    Restore Account
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* NEW: IMAGE VIEWER OVERLAY */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm print:hidden"
          style={{ pointerEvents: "auto" }}
          onClick={() => setExpandedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full h-full max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors z-10"
              onClick={() => setExpandedImage(null)}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={24} />
            </button>
            <img
              src={expandedImage}
              alt="Expanded Document View"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl relative z-0"
            />
          </div>
        </div>
      )}

      {/* SHADCN CONFIRMATION DIALOG FOR ACCOUNT STATUS CHANGES */}
      <AlertDialog
        open={!!pendingAction}
        onOpenChange={(open) => !open && setPendingAction(null)}
      >
        <AlertDialogContent className="font-sans max-w-[400px] rounded-2xl p-6">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold tracking-tight text-zinc-900">
              {pendingAction?.actionType === "Suspend" ? "Suspend Account?" : "Restore Account?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-zinc-500 leading-relaxed mt-2">
              {pendingAction?.actionType === "Suspend" 
                ? "This will immediately restrict the tenant's access to their digital portal. Their smart lock PIN will remain active unless manually revoked."
                : "This will restore the tenant's access to their digital portal, allowing them to view documents and log maintenance requests."}
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
              onClick={executeToggleStatus}
              disabled={isPending}
              className={`h-9 px-4 text-[12px] font-medium rounded-lg m-0 ${
                pendingAction?.actionType === "Suspend"
                  ? "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600"
                  : "bg-zinc-900 text-white hover:bg-zinc-800 focus:ring-zinc-900"
              }`}
            >
              {isPending ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} className="animate-spin mr-2" size={14} />
                  Processing...
                </>
              ) : (
                pendingAction?.actionType === "Suspend" ? "Suspend Account" : "Restore Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}