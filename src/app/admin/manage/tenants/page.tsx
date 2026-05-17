"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  Search01Icon, 
  FilterIcon, 
  MoreHorizontalIcon, 
  Copy01Icon, 
  FileDownloadIcon, 
  WhatsappIcon,
  SmartPhone01Icon,
  ShieldIcon,
  Cancel01Icon,
  Alert01Icon,
  ArrowUpRight01Icon // Added for the property context card
} from "@hugeicons/core-free-icons";

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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import { HugeiconsIcon } from "@hugeicons/react";

// --- TYPES ---
interface TenantRecord {
  id: string;
  user: {
    name: string;
    email: string;
    phone: string;
    profilePicture: string;
    kycStatus: "Unverified" | "Pending" | "Verified" | "Rejected";
    ghanaCardNumber: string;
    ghanaCardUrl: string;
    accountStatus: "Active" | "Suspended";
  };
  lease: {
    id: string;
    propertyName: string;
    unitNumber: string;
    location: string;       // NEW: Added for context card
    propertyImage: string;  // NEW: Added for context card
    status: "Pending_Deposit" | "Pending_Balance" | "Active" | "Expired" | "Cancelled";
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
    status: "Pending_Verification" | "Completed" | "Failed" | "Refunded";
  }>;
}

// --- MOCK DATA ---
const MOCK_TENANTS: TenantRecord[] = [
  {
    id: "t_001",
    user: {
      name: "Kwame Mensah",
      email: "kwame.m@example.com",
      phone: "+233 54 123 4567",
      profilePicture: "https://i.pravatar.cc/150?u=kwame",
      kycStatus: "Verified",
      ghanaCardNumber: "GHA-716253412-9",
      ghanaCardUrl: "https://images.unsplash.com/photo-1621839673705-6617adf9e890?q=80&w=400&auto=format&fit=crop",
      accountStatus: "Active"
    },
    lease: {
      id: "l_001",
      propertyName: "The Heights",
      unitNumber: "Apt 4B",
      location: "East Legon, Accra",
      propertyImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=400&auto=format&fit=crop",
      status: "Active",
      startDate: "2025-10-12",
      endDate: "2026-10-12",
      totalRentAmount: 12000,
      smartLockCode: "8492",
    },
    transactions: [
      { id: "tx_1", date: "12 Oct 2025", purpose: "Rent_Balance", amount: 6000, status: "Completed" },
      { id: "tx_2", date: "05 Oct 2025", purpose: "Booking_Deposit", amount: 6000, status: "Completed" },
    ],
  },
  {
    id: "t_002",
    user: {
      name: "Abena Osei",
      email: "abena.osei@example.com",
      phone: "+233 20 987 6543",
      profilePicture: "https://i.pravatar.cc/150?u=abena",
      kycStatus: "Pending",
      ghanaCardNumber: "GHA-998273645-1",
      ghanaCardUrl: "https://images.unsplash.com/photo-1621839673705-6617adf9e890?q=80&w=400&auto=format&fit=crop",
      accountStatus: "Suspended"
    },
    lease: {
      id: "l_002",
      propertyName: "Cantonments Villas",
      unitNumber: "Villa 2",
      location: "Cantonments, Accra",
      propertyImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&auto=format&fit=crop",
      status: "Pending_Balance",
      startDate: "2025-11-01",
      endDate: "2026-11-01",
      totalRentAmount: 25000,
      smartLockCode: "1102",
    },
    transactions: [
      { id: "tx_3", date: "28 Oct 2025", purpose: "Booking_Deposit", amount: 5000, status: "Pending_Verification" },
    ],
  },
];

// --- UTILS (Refined Professional Color Palette) ---
const formatCurrency = (amount: number) => `GH₵ ${amount.toLocaleString()}`;

const getLeaseBadgeStyle = (status: TenantRecord["lease"]["status"]) => {
  // Using more sophisticated semantic colors (teal, amber, rose) with subtle borders
  const styles = {
    Active: "bg-teal-50/50 text-teal-700 border-teal-200/60",
    Pending_Balance: "bg-amber-50/50 text-amber-700 border-amber-200/60",
    Pending_Deposit: "bg-amber-50/50 text-amber-700 border-amber-200/60",
    Expired: "bg-rose-50/50 text-rose-700 border-rose-200/60",
    Cancelled: "bg-zinc-50/80 text-zinc-600 border-zinc-200",
  };
  return styles[status] || styles.Cancelled;
};

const getAccountBadgeStyle = (status: TenantRecord["user"]["accountStatus"]) => {
  if (status === "Suspended") return "bg-rose-50/80 text-rose-700 border-rose-200/60";
  return null; 
};

// --- MAIN PAGE COMPONENT ---
export default function ManageTenantsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTenant, setSelectedTenant] = useState<TenantRecord | null>(null);

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-8">
        
        {/* SEARCH & FILTER CHROME */}
        <section className="flex flex-col xl:flex-row items-center gap-4 bg-white p-2 border border-zinc-200/80 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] w-full">
          <div className="relative flex-1 w-full">
            <HugeiconsIcon icon={Search01Icon} size={16} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input 
              placeholder="Search by tenant name, email, or unit..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 h-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[14px] bg-transparent shadow-none placeholder:text-zinc-400"
            />
          </div>

          <div className="h-5 w-px bg-zinc-200 hidden xl:block" />

          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full xl:w-auto px-2 pb-2 xl:pb-0">
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[140px] h-9 border-0 bg-zinc-50 hover:bg-zinc-100 text-[13px] font-medium text-zinc-700 shadow-none focus:ring-0">
                <SelectValue placeholder="Lease Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[140px] h-9 border-0 bg-zinc-50 hover:bg-zinc-100 text-[13px] font-medium text-zinc-700 shadow-none focus:ring-0">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="heights">The Heights</SelectItem>
                <SelectItem value="cantonments">Cantonments Villas</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-5 w-px bg-zinc-200 hidden md:block mx-1" />

            <div className="hidden md:flex items-center gap-2 pl-1 pr-2">
              <span className="text-[20px] font-semibold tracking-tighter text-zinc-900 leading-none">
                {MOCK_TENANTS.length}
              </span>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest leading-tight">
                Total<br/>Tenants
              </span>
            </div>

            <Button variant="ghost" size="icon" className="h-9 w-9 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 shrink-0 ml-auto md:ml-0">
              <HugeiconsIcon icon={FilterIcon} size={16} strokeWidth={2} />
            </Button>
          </div>
        </section>

        {/* TENANTS TABLE */}
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <Table>
            <TableHeader className="bg-zinc-50/50">
              <TableRow className="border-zinc-200/80 hover:bg-transparent">
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Tenant Profile</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Property Occupied</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Lease Status</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Expiry Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_TENANTS.map((tenant) => (
                <TableRow 
                  key={tenant.id} 
                  className="group border-zinc-100 hover:bg-zinc-50/80 transition-colors cursor-pointer"
                  onClick={() => setSelectedTenant(tenant)}
                >
                  {/* Col 1: Profile */}
                  <TableCell className="py-3">
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-9 w-9 border shadow-sm ${tenant.user.accountStatus !== 'Active' ? 'opacity-50 grayscale border-zinc-200' : 'border-zinc-200'}`}>
                        <AvatarImage src={tenant.user.profilePicture} />
                        <AvatarFallback className="bg-zinc-100 text-zinc-600 text-xs">{tenant.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium leading-tight ${tenant.user.accountStatus === 'Suspended' ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>
                            {tenant.user.name}
                          </span>
                          {tenant.user.accountStatus !== "Active" && (
                            <Badge variant="outline" className={`px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider h-4 ${getAccountBadgeStyle(tenant.user.accountStatus)}`}>
                              {tenant.user.accountStatus}
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-zinc-500 mt-0.5">{tenant.user.email}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Col 2: Property */}
                  <TableCell className="py-3 align-middle">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-900 leading-tight">{tenant.lease.propertyName}</span>
                      <span className="text-xs text-zinc-500 mt-0.5">{tenant.lease.unitNumber}</span>
                    </div>
                  </TableCell>

                  {/* Col 3: Status */}
                  <TableCell className="py-3 align-middle">
                    <Badge variant="outline" className={`px-2 py-0.5 rounded-md font-medium border ${getLeaseBadgeStyle(tenant.lease.status)}`}>
                      {tenant.lease.status.replace("_", " ")}
                    </Badge>
                  </TableCell>

                  {/* Col 4: Expiry */}
                  <TableCell className="py-3 align-middle">
                    <span className="text-sm text-zinc-600">
                      {new Date(tenant.lease.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </TableCell>

                  {/* Col 5: Actions */}
                  <TableCell className="py-3 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 data-[state=open]:bg-zinc-100 data-[state=open]:text-zinc-900">
                          <HugeiconsIcon icon={MoreHorizontalIcon} size={18} strokeWidth={2} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-zinc-200 font-sans p-1">
                        <DropdownMenuItem onClick={() => setSelectedTenant(tenant)} className="text-sm cursor-pointer text-zinc-700 rounded-lg">
                          View Full Profile
                        </DropdownMenuItem>
                        
                        <div className="h-px bg-zinc-100 my-1 mx-2" /> 
                        
                        {tenant.user.accountStatus === 'Active' ? (
                          <DropdownMenuItem className="text-sm cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700 rounded-lg">
                            Suspend Account
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem className="text-sm cursor-pointer text-teal-600 focus:bg-teal-50 focus:text-teal-700 rounded-lg">
                            Restore Account
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* RIGHT-SIDE SHEET: TENANT PROFILE */}
      <Sheet open={!!selectedTenant} onOpenChange={(open) => !open && setSelectedTenant(null)}>
        <SheetContent className="w-full sm:max-w-[440px] p-0 bg-white border-l border-zinc-200 flex flex-col font-sans">
          {selectedTenant && (
            <>
              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto pb-28">
                
                {/* Hero Header */}
                <div className="px-6 pt-10 pb-6 border-b border-zinc-100">
                  {selectedTenant.user.accountStatus !== "Active" && (
                    <div className="mb-4 w-full p-2.5 rounded-lg flex items-center gap-2 text-xs font-medium bg-rose-50/80 text-rose-700 border border-rose-200/60">
                      This account is currently {selectedTenant.user.accountStatus.toLowerCase()}. Portal access is restricted.
                    </div>
                  )}

                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 items-center">
                      <Avatar className={`h-16 w-16 border shadow-sm ring-4 ring-zinc-50 ${selectedTenant.user.accountStatus !== 'Active' ? 'opacity-50 grayscale border-zinc-200' : 'border-zinc-200'}`}>
                        <AvatarImage src={selectedTenant.user.profilePicture} />
                        <AvatarFallback className="bg-zinc-100 text-zinc-600 text-xl">{selectedTenant.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <h2 className="text-xl font-semibold tracking-tight text-zinc-900">{selectedTenant.user.name}</h2>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 hover:bg-zinc-100 px-2 rounded-md font-medium text-[10px] uppercase tracking-widest">
                            Tenant
                          </Badge>
                          {selectedTenant.user.kycStatus === 'Verified' && (
                            <div className="flex items-center text-indigo-600 text-xs font-medium">
                              <HugeiconsIcon icon={ShieldIcon} size={14} className="mr-1" /> Verified
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <Button size="icon" className="h-10 w-10 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors shrink-0">
                      <HugeiconsIcon icon={WhatsappIcon} size={20} strokeWidth={2} />
                    </Button>
                  </div>
                </div>

                <div className="px-6 py-6 space-y-8">
                  
                  {/* Section 1: Occupancy Details & Context Card */}
                  <section className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Occupied Asset</h3>
                      <Button variant="link" className="h-auto p-0 text-[11px] font-medium text-zinc-500 hover:text-indigo-600 tracking-wide">
                        View Property <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} className="ml-1" strokeWidth={2.5} />
                      </Button>
                    </div>

                    {/* NEW: Property Context Card */}
                    <div className="bg-white border border-zinc-200/80 rounded-xl p-3 flex gap-4 shadow-[0_1px_4px_rgba(0,0,0,0.01)] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer group">
                      <div className="h-14 w-14 shrink-0 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200/50">
                        <img 
                          src={selectedTenant.lease.propertyImage} 
                          alt="Property Thumbnail" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-sm font-semibold tracking-tight text-zinc-900 group-hover:text-indigo-600 transition-colors">
                          {selectedTenant.lease.propertyName}
                        </h4>
                        <p className="text-[12px] text-zinc-500 mt-0.5">
                          {selectedTenant.lease.location} · <span className="font-medium text-zinc-700">{selectedTenant.lease.unitNumber}</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-y-5 gap-x-4 pt-2">
                      <div>
                        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide mb-1">Lease Term</p>
                        <p className="text-sm font-medium text-zinc-900">
                          {new Date(selectedTenant.lease.startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })} 
                          <span className="text-zinc-300 mx-1.5">-</span> 
                          {new Date(selectedTenant.lease.endDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide mb-1">Total Rent</p>
                        <p className="text-sm font-medium text-zinc-900">{formatCurrency(selectedTenant.lease.totalRentAmount)}</p>
                      </div>
                    </div>

                    {/* Smart Lock Card */}
                    <div className="mt-2 bg-zinc-50/80 border border-zinc-200/80 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-white border border-zinc-200 flex items-center justify-center text-zinc-700 shadow-sm">
                          <HugeiconsIcon icon={SmartPhone01Icon} size={16} />
                        </div>
                        <div>
                          <p className="text-[11px] font-medium text-zinc-500 uppercase tracking-wide">Smart Lock PIN</p>
                          <p className="text-sm font-semibold tracking-widest text-zinc-900 font-mono mt-0.5">
                            {selectedTenant.lease.smartLockCode || "----"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50">
                          <HugeiconsIcon icon={Copy01Icon} size={16} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50">
                          <HugeiconsIcon icon={Cancel01Icon} size={16} />
                        </Button>
                      </div>
                    </div>
                  </section>

                  {/* Section 2: Identity & KYC */}
                  <section className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Identity (Ghana Card)</h3>
                    <div className="bg-white border border-zinc-200 rounded-xl p-1 overflow-hidden group relative">
                      <div className="h-32 w-full bg-zinc-100 rounded-lg overflow-hidden relative">
                        <img 
                          src={selectedTenant.user.ghanaCardUrl} 
                          alt="ID Card" 
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
                          <span className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-sm text-zinc-900 text-xs font-medium px-3 py-1.5 rounded-full shadow-sm transition-opacity duration-300">
                            Click to expand
                          </span>
                        </div>
                      </div>
                      <div className="p-3 pb-2 text-center">
                        <p className="text-sm font-mono font-medium text-zinc-700 tracking-wider">
                          {selectedTenant.user.ghanaCardNumber}
                        </p>
                      </div>
                    </div>
                  </section>

                  {/* Section 3: Recent Ledger */}
                  <section className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Recent Ledger</h3>
                    <div className="space-y-3">
                      {selectedTenant.transactions.map((tx) => (
                        <div key={tx.id} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                          <div>
                            <p className="text-sm font-medium text-zinc-900">{tx.purpose.replace("_", " ")}</p>
                            <p className="text-xs text-zinc-500 mt-0.5">{tx.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-zinc-900">{formatCurrency(tx.amount)}</p>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                              {tx.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                </div>
              </div>

              {/* Fixed Footer Block */}
              <div className="absolute bottom-0 left-0 w-full bg-white border-t border-zinc-200 p-4 space-y-2 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
                <Button variant="outline" className="w-full rounded-lg h-10 border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-medium shadow-sm">
                  <HugeiconsIcon icon={FileDownloadIcon} size={16} className="mr-2 text-zinc-500" />
                  Download Signed Lease
                </Button>
                
                <div className="pt-1">
                  {selectedTenant.user.accountStatus === 'Active' ? (
                    <Button variant="ghost" className="w-full h-10 rounded-lg bg-rose-50/50 text-rose-700 hover:text-rose-800 hover:bg-rose-100 border border-rose-100/50 font-medium transition-colors">
                      Suspend Account
                    </Button>
                  ) : (
                    <Button variant="ghost" className="w-full h-10 rounded-lg bg-zinc-900 text-white hover:text-white hover:bg-zinc-800 font-medium transition-colors shadow-sm">
                      Restore Account
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}