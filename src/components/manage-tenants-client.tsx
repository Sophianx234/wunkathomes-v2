"use client";

import {
  ArrowUpRight01Icon,
  Cancel01Icon,
  Copy01Icon,
  Download01Icon,
  FilterIcon,
  Loading03Icon,
  MoreHorizontalIcon,
  Search01Icon,
  ShieldIcon,
  SmartPhone01Icon,
  WhatsappIcon
} from "@hugeicons/core-free-icons";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

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
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { HugeiconsIcon } from "@hugeicons/react";

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
    region: string; // Used for filtering
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
const formatCurrency = (amount: number) => `GH₵ ${amount.toLocaleString()}`;

const getLeaseBadgeStyle = (status: string) => {
  const styles: Record<string, string> = {
    Active: "bg-teal-50/50 text-teal-700 border-teal-200/60",
    Pending_Balance: "bg-amber-50/50 text-amber-700 border-amber-200/60",
    Pending_Deposit: "bg-amber-50/50 text-amber-700 border-amber-200/60",
    Expired: "bg-rose-50/50 text-rose-700 border-rose-200/60",
    Cancelled: "bg-zinc-50/80 text-zinc-600 border-zinc-200",
  };
  return styles[status] || "bg-zinc-50/80 text-zinc-600 border-zinc-200";
};

const getAccountBadgeStyle = (status: string) => {
  if (status === "Suspended") return "bg-rose-50/80 text-rose-700 border-rose-200/60";
  return null; 
};

// --- MAIN PAGE COMPONENT ---
export default function ManageTenantsClient({ data, availableRegions, availableStatuses }: ManageTenantsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [selectedTenant, setSelectedTenant] = useState<TenantRecord | null>(null);
  const [isPending, startTransition] = useTransition();

  // Multi-layered Search & Filter implementation
  const filteredData = useMemo(() => {
    return data.filter((t) => {
      // 1. Text Search
      const matchesSearch = 
        !searchQuery || 
        t.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        t.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.lease.propertyName.toLowerCase().includes(searchQuery.toLowerCase());
      
      // 2. Status Dropdown
      const matchesStatus = statusFilter === "all" || t.lease.status === statusFilter;
      
      // 3. Region Dropdown
      const matchesRegion = regionFilter === "all" || t.lease.region === regionFilter;

      return matchesSearch && matchesStatus && matchesRegion;
    });
  }, [data, searchQuery, statusFilter, regionFilter]);

  // Server Action Handler
  const handleToggleStatus = (userId: string, currentStatus: string) => {
    startTransition(async () => {
      const result = await toggleAccountStatus(userId, currentStatus);
      if (result.success) {
        toast.success(result.message);
        setSelectedTenant(null); 
      } else {
        toast.error(result.error);
      }
    });
  };

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
            {/* Dynamic Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[160px] h-9 border-0 bg-zinc-50 hover:bg-zinc-100 text-[13px] font-medium text-zinc-700 shadow-none focus:ring-0">
                <SelectValue placeholder="Lease Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {availableStatuses.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.replace(/_/g, " ")}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Dynamic Region Filter */}
            <Select value={regionFilter} onValueChange={setRegionFilter}>
              <SelectTrigger className="w-full md:w-[160px] h-9 border-0 bg-zinc-50 hover:bg-zinc-100 text-[13px] font-medium text-zinc-700 shadow-none focus:ring-0">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Regions</SelectItem>
                {availableRegions.map(region => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="h-5 w-px bg-zinc-200 hidden md:block mx-1" />

            <div className="hidden md:flex items-center gap-2 pl-1 pr-2">
              <span className="text-[20px] font-semibold tracking-tighter text-zinc-900 leading-none">
                {filteredData.length}
              </span>
              <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-widest leading-tight">
                Total<br/>Tenants
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
              className="h-9 w-9 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 shrink-0 ml-auto md:ml-0"
              title="Clear Filters"
            >
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
              {filteredData.map((tenant) => (
                <TableRow 
                  key={tenant.id} 
                  className="group border-zinc-100 hover:bg-zinc-50/80 transition-colors cursor-pointer"
                  onClick={() => setSelectedTenant(tenant)}
                >
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

                  <TableCell className="py-3 align-middle">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-zinc-900 leading-tight">{tenant.lease.propertyName}</span>
                      <span className="text-xs text-zinc-500 mt-0.5">{tenant.lease.unitNumber}</span>
                    </div>
                  </TableCell>

                  <TableCell className="py-3 align-middle">
                    <Badge variant="outline" className={`px-2 py-0.5 rounded-md font-medium border ${getLeaseBadgeStyle(tenant.lease.status)}`}>
                      {tenant.lease.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>

                  <TableCell className="py-3 align-middle">
                    <span className="text-sm text-zinc-600">
                      {new Date(tenant.lease.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </TableCell>

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
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(tenant.user.id, tenant.user.accountStatus)}
                            disabled={isPending}
                            className="text-sm cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700 rounded-lg flex items-center justify-between"
                          >
                            Suspend Account
                            {isPending && <HugeiconsIcon icon={Loading03Icon} className="animate-spin" size={14} />}
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem 
                            onClick={() => handleToggleStatus(tenant.user.id, tenant.user.accountStatus)}
                            disabled={isPending}
                            className="text-sm cursor-pointer text-teal-600 focus:bg-teal-50 focus:text-teal-700 rounded-lg flex items-center justify-between"
                          >
                            Restore Account
                            {isPending && <HugeiconsIcon icon={Loading03Icon} className="animate-spin" size={14} />}
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              
              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-zinc-500 text-sm">
                    No tenants found matching your search.
                  </TableCell>
                </TableRow>
              )}
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
                      This account is currently suspended. Portal access is restricted.
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
                            <div className="flex items-center text-green-600 text-xs font-medium">
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
                      <Button variant="link" className="h-auto p-0 text-[11px] font-medium text-zinc-500 hover:text-primary tracking-wide">
                        View Property <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} className="ml-1" strokeWidth={2.5} />
                      </Button>
                    </div>

                    <div className="bg-white border border-zinc-200/80 rounded-xl p-3 flex gap-4 shadow-[0_1px_4px_rgba(0,0,0,0.01)] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,0.04)] cursor-pointer group">
                      <div className="h-14 w-14 shrink-0 bg-zinc-100 rounded-lg overflow-hidden border border-zinc-200/50">
                        {selectedTenant.lease.propertyImage ? (
                          <img 
                            src={selectedTenant.lease.propertyImage} 
                            alt="Property Thumbnail" 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-[10px]">No Image</div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-sm font-semibold tracking-tight text-zinc-900 group-hover:text-primary transition-colors">
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
                        {selectedTenant.user.ghanaCardUrl ? (
                          <>
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
                          </>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-zinc-400 text-sm font-medium">
                            No document uploaded
                          </div>
                        )}
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
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Recent Transactions</h3>
                    <div className="space-y-3">
                      {selectedTenant.transactions.length > 0 ? (
                        selectedTenant.transactions.map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                            <div>
                              <p className="text-sm font-medium text-zinc-900">{tx.purpose.replace(/_/g, " ")}</p>
                              <p className="text-xs text-zinc-500 mt-0.5">{tx.date}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium text-zinc-900">{formatCurrency(tx.amount)}</p>
                              <span className={`text-[10px] font-bold uppercase tracking-wider ${tx.status === 'Success' ? 'text-teal-600' : tx.status === 'Failed' ? 'text-rose-600' : 'text-amber-600'}`}>
                                {tx.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-zinc-500 py-2">No transactions recorded.</p>
                      )}
                    </div>
                  </section>

                </div>
              </div>

              {/* Fixed Footer Block */}
              <div className="absolute bottom-0 left-0 w-full bg-white border-t border-zinc-200 p-4 space-y-2 ">
                <Button variant="outline" className="w-full rounded-lg h-10 border-zinc-200 hover:bg-zinc-50 text-zinc-900 font-medium ">
                  View Tenancy Agreement
                </Button>
                
                <div className="pt-1">
                  {selectedTenant.user.accountStatus === 'Active' ? (
                    <Button 
                      onClick={() => handleToggleStatus(selectedTenant.user.id, selectedTenant.user.accountStatus)}
                      disabled={isPending}
                      variant="ghost" 
                      className="w-full h-10 rounded-lg bg-rose-50/50 text-rose-700 hover:text-rose-800 hover:bg-rose-100 border border-rose-100/50 font-medium transition-colors"
                    >
                      {isPending ? <HugeiconsIcon icon={Loading03Icon} className="animate-spin mr-2" size={16} /> : null}
                      Suspend Account
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleToggleStatus(selectedTenant.user.id, selectedTenant.user.accountStatus)}
                      disabled={isPending}
                      variant="ghost" 
                      className="w-full h-10 rounded-lg bg-zinc-900 text-white hover:text-white hover:bg-zinc-800 font-medium transition-colors shadow-sm"
                    >
                      {isPending ? <HugeiconsIcon icon={Loading03Icon} className="animate-spin mr-2" size={16} /> : null}
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