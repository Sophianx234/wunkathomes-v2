"use client";

import React, { useState, useMemo } from "react";
import { 
  Search01Icon, 
  FilterIcon, 
  CheckmarkCircle01Icon,
  Time01Icon,
  Alert01Icon,
  File02Icon,
  SmartPhone01Icon,
  Key01Icon,
  TickDouble01Icon,
  ArrowRight01Icon
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
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

// --- TYPES ---
type PipelineStage = "awaiting_paperwork" | "ready_for_access" | "recent";

interface ActivationRecord {
  id: string;
  pipelineStage: PipelineStage;
  user: {
    name: string;
    email: string;
    phone: string;
    profilePicture: string;
    ghanaCardNumber: string;
    ghanaCardUrl: string;
  };
  lease: {
    id: string;
    propertyName: string;
    unitNumber: string;
    startDate: string;
  };
  checklist: {
    depositPaid: boolean;
    ghanaCardVerified: "Pending" | "Verified" | "Not_Uploaded";
    leaseSigned: "Pending" | "Signed";
  };
  smartLockPin?: string;
}

// --- MOCK DATA ---
const MOCK_ACTIVATIONS: ActivationRecord[] = [
  {
    id: "act_001",
    pipelineStage: "awaiting_paperwork",
    user: {
      name: "Emmanuel Osei",
      email: "e.osei@example.com",
      phone: "+233 24 555 0192",
      profilePicture: "https://i.pravatar.cc/150?u=emmanuel",
      ghanaCardNumber: "GHA-716253412-9",
      ghanaCardUrl: "https://images.unsplash.com/photo-1621839673705-6617adf9e890?q=80&w=400&auto=format&fit=crop",
    },
    lease: { id: "LSE-8821", propertyName: "Airport Residential", unitNumber: "Apt 12B", startDate: "2026-06-01" },
    checklist: { depositPaid: true, ghanaCardVerified: "Pending", leaseSigned: "Pending" },
  },
  {
    id: "act_002",
    pipelineStage: "ready_for_access",
    user: {
      name: "Sarah Mensah",
      email: "sarah.m@example.com",
      phone: "+233 50 123 4455",
      profilePicture: "https://i.pravatar.cc/150?u=sarah",
      ghanaCardNumber: "GHA-998273645-1",
      ghanaCardUrl: "https://images.unsplash.com/photo-1621839673705-6617adf9e890?q=80&w=400&auto=format&fit=crop",
    },
    lease: { id: "LSE-9910", propertyName: "Cantonments Villas", unitNumber: "Villa 4", startDate: "2026-05-20" },
    checklist: { depositPaid: true, ghanaCardVerified: "Verified", leaseSigned: "Signed" },
  },
  {
    id: "act_003",
    pipelineStage: "recent",
    user: {
      name: "David Tetteh",
      email: "dtetteh@example.com",
      phone: "+233 20 999 8877",
      profilePicture: "",
      ghanaCardNumber: "GHA-112233445-5",
      ghanaCardUrl: "https://images.unsplash.com/photo-1621839673705-6617adf9e890?q=80&w=400&auto=format&fit=crop",
    },
    lease: { id: "LSE-4432", propertyName: "The Heights", unitNumber: "Apt 2A", startDate: "2026-05-01" },
    checklist: { depositPaid: true, ghanaCardVerified: "Verified", leaseSigned: "Signed" },
    smartLockPin: "492011",
  }
];

// --- UTILS ---
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

// --- MAIN COMPONENT ---
export default function ActivationsPage() {
  const [activeTab, setActiveTab] = useState<PipelineStage>("awaiting_paperwork");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Sheet State
  const [selectedActivation, setSelectedActivation] = useState<ActivationRecord | null>(null);
  
  // Simulation States for the Command Center
  const [isLegalApproved, setIsLegalApproved] = useState(false);
  const [generatedPin, setGeneratedPin] = useState<string | null>(null);

  // Reset internal sheet state when opening a new record
  const handleOpenSheet = (record: ActivationRecord) => {
    setSelectedActivation(record);
    setIsLegalApproved(record.checklist.ghanaCardVerified === "Verified" && record.checklist.leaseSigned === "Signed");
    setGeneratedPin(record.smartLockPin || null);
  };

  // Derived Data
  const filteredData = useMemo(() => {
    return MOCK_ACTIVATIONS.filter(record => {
      const matchesTab = record.pipelineStage === activeTab;
      const matchesSearch = record.user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            record.lease.propertyName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const awaitingCount = MOCK_ACTIVATIONS.filter(r => r.pipelineStage === "awaiting_paperwork").length;

  const handleSimulatePinSync = () => {
    // Simulate API call to Smart Lock provider
    setTimeout(() => {
      setGeneratedPin(Math.floor(100000 + Math.random() * 900000).toString());
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* PAGE HEADER & PIPELINE TABS */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200/60 pb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Lease Activations</h1>
            {awaitingCount > 0 && (
              <Badge variant="secondary" className="bg-zinc-900 text-white hover:bg-zinc-800 text-[11px] px-2 h-5 flex items-center justify-center rounded-full">
                {awaitingCount} New
              </Badge>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as PipelineStage)} className="w-full md:w-auto">
            <TabsList className="h-9 bg-zinc-100/50 border border-zinc-200/60 p-0.5 rounded-lg">
              <TabsTrigger value="awaiting_paperwork" className="text-[13px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4">
                Awaiting Paperwork
              </TabsTrigger>
              <TabsTrigger value="ready_for_access" className="text-[13px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4">
                Ready for Access
              </TabsTrigger>
              <TabsTrigger value="recent" className="text-[13px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4">
                Recent Activations
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* INLINE FILTER CHROME */}
        <section className="flex flex-col xl:flex-row items-center gap-4 bg-white p-1.5 border border-zinc-200/60 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.01)] w-full">
          <div className="relative flex-1 w-full">
            <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input 
              placeholder="Search by tenant name or property..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] bg-transparent shadow-none placeholder:text-zinc-400"
            />
          </div>

          <div className="h-4 w-px bg-zinc-200 hidden xl:block" />

          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full xl:w-auto px-2 pb-1 xl:pb-0">
            <Select defaultValue="all">
              <SelectTrigger className="w-full md:w-[140px] h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                <SelectItem value="airport">Airport Res.</SelectItem>
                <SelectItem value="cantonments">Cantonments</SelectItem>
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

            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 shrink-0 ml-auto md:ml-0 rounded-md">
              <HugeiconsIcon icon={FilterIcon} size={14} />
            </Button>
          </div>
        </section>

        {/* ACTIVATIONS DATA TABLE */}
        <div className="bg-white border border-zinc-200/60 rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
          <Table>
            <TableHeader className="bg-zinc-50/30">
              <TableRow className="border-zinc-200/60 hover:bg-transparent">
                <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[220px]">New Tenant</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Allocated Property</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Move-in Date</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Checklist Status</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10 text-right w-[180px]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record) => (
                <TableRow 
                  key={record.id} 
                  className="group border-zinc-100 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                  onClick={() => handleOpenSheet(record)}
                >
                  {/* Col 1: Tenant */}
                  <TableCell className="py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-zinc-200/60 shadow-sm">
                        <AvatarImage src={record.user.profilePicture} />
                        <AvatarFallback className="bg-zinc-100 text-zinc-600 text-xs">{record.user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-semibold text-zinc-900 leading-tight">{record.user.name}</span>
                        <span className="text-[11px] text-zinc-500 mt-0.5">{record.user.phone}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Col 2: Property */}
                  <TableCell className="py-3 align-middle">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-zinc-900 leading-tight">{record.lease.propertyName}</span>
                      <span className="text-[11px] text-zinc-500 mt-0.5">{record.lease.unitNumber}</span>
                    </div>
                  </TableCell>

                  {/* Col 3: Move-In Date */}
                  <TableCell className="py-3 align-middle">
                    <span className="text-[13px] font-medium text-zinc-700">
                      {formatDate(record.lease.startDate)}
                    </span>
                  </TableCell>

                  {/* Col 4: Checklist Grid */}
                  <TableCell className="py-3 align-middle">
                    <div className="flex items-center gap-1.5">
                      {/* Deposit */}
                      <Badge variant="outline" className={`px-1.5 py-0 border-0 rounded text-[9px] uppercase tracking-wider font-bold h-5 flex items-center gap-1 ${record.checklist.depositPaid ? 'bg-emerald-50/50 text-emerald-700 ring-1 ring-emerald-200/60' : 'bg-zinc-100 text-zinc-500'}`}>
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} /> Deposit
                      </Badge>
                      {/* ID Card */}
                      <Badge variant="outline" className={`px-1.5 py-0 border-0 rounded text-[9px] uppercase tracking-wider font-bold h-5 flex items-center gap-1 ${record.checklist.ghanaCardVerified === 'Verified' ? 'bg-emerald-50/50 text-emerald-700 ring-1 ring-emerald-200/60' : 'bg-amber-50/50 text-amber-700 ring-1 ring-amber-300/60'}`}>
                        {record.checklist.ghanaCardVerified === 'Verified' ? <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} /> : <HugeiconsIcon icon={Time01Icon} size={10} />} ID
                      </Badge>
                      {/* Lease */}
                      <Badge variant="outline" className={`px-1.5 py-0 border-0 rounded text-[9px] uppercase tracking-wider font-bold h-5 flex items-center gap-1 ${record.checklist.leaseSigned === 'Signed' ? 'bg-emerald-50/50 text-emerald-700 ring-1 ring-emerald-200/60' : 'bg-amber-50/50 text-amber-700 ring-1 ring-amber-300/60'}`}>
                        {record.checklist.leaseSigned === 'Signed' ? <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} /> : <HugeiconsIcon icon={Time01Icon} size={10} />} Lease
                      </Badge>
                    </div>
                  </TableCell>

                  {/* Col 5: Action */}
                  <TableCell className="py-3 align-middle text-right">
                    {activeTab === "awaiting_paperwork" && (
                      <Button variant="outline" size="sm" className="h-8 text-[11px] font-semibold border-zinc-200 text-zinc-700 rounded-lg">
                        Review Documents
                      </Button>
                    )}
                    {activeTab === "ready_for_access" && (
                      <Button size="sm" className="h-8 text-[11px] font-semibold text-white  hover:text-white  rounded-lg">
                        Activate Key 
                      </Button>
                    )}
                    {activeTab === "recent" && (
                      <Button variant="ghost" size="sm" className="h-8 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 rounded-lg">
                        View Details
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-zinc-500 text-sm">
                    No tenants found in this pipeline stage.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* COMMAND CENTER SHEET */}
      <Sheet open={!!selectedActivation} onOpenChange={(open) => !open && setSelectedActivation(null)}>
        <SheetContent className="w-full sm:max-w-[440px] p-0 bg-[#FAFAFA] border-l border-zinc-200/60 flex flex-col font-sans shadow-2xl">
          {selectedActivation && (
            <>
              {/* Header Section */}
              <div className="px-6 pt-10 pb-6 border-b border-zinc-200/60 bg-white">
                <div className="flex items-center justify-between mb-5">
                  <Badge variant="outline" className={`px-2.5 py-0.5 border-0 rounded-full text-[10px] uppercase tracking-wider font-bold ${
                    selectedActivation.pipelineStage === 'ready_for_access' ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200/60' :
                    selectedActivation.pipelineStage === 'recent' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60' :
                    'bg-amber-50 text-amber-700 ring-1 ring-amber-300/60'
                  }`}>
                    {selectedActivation.pipelineStage.replace(/_/g, " ")}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border border-zinc-200/80 shadow-sm">
                    <AvatarImage src={selectedActivation.user.profilePicture} />
                    <AvatarFallback className="bg-zinc-100 text-zinc-600 text-lg">{selectedActivation.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-lg font-semibold tracking-tight text-zinc-900 leading-tight">
                      {selectedActivation.user.name}
                    </h2>
                    <p className="text-[12px] text-zinc-500 mt-0.5 flex items-center gap-1.5">
                      {selectedActivation.user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* 1. Legal & Paperwork Block */}
                <section className="bg-white border border-zinc-200/60 rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.01)] space-y-5">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={File02Icon} size={18} className="text-zinc-400" />
                    <h3 className="text-[13px] font-semibold text-zinc-900 tracking-tight">Legal & Identity</h3>
                  </div>

                  {/* ID Card Display */}
                  <div className="border border-zinc-200/80 rounded-lg overflow-hidden group">
                    <div className="h-24 w-full bg-zinc-100 relative cursor-pointer">
                      <img 
                        src={selectedActivation.user.ghanaCardUrl} 
                        alt="Ghana Card" 
                        className="w-full h-full object-cover mix-blend-multiply opacity-80 group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/10 transition-colors">
                        <span className="opacity-0 group-hover:opacity-100 bg-white/90 backdrop-blur-sm text-zinc-900 text-[10px] uppercase font-bold tracking-wider px-3 py-1.5 rounded-full shadow-sm transition-opacity">
                          View Card
                        </span>
                      </div>
                    </div>
                    <div className="p-2.5 bg-zinc-50/50 flex justify-between items-center border-t border-zinc-200/60">
                      <span className="text-[12px] font-mono font-medium text-zinc-700 tracking-tight">{selectedActivation.user.ghanaCardNumber}</span>
                      <HugeiconsIcon icon={TickDouble01Icon} size={14} className={isLegalApproved ? "text-emerald-500" : "text-zinc-300"} />
                    </div>
                  </div>

                  {/* Lease Verification */}
                  <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200/60 bg-zinc-50/30">
                    <span className="text-[12px] font-medium text-zinc-700">Tenancy Agreement</span>
                    {selectedActivation.checklist.leaseSigned === "Signed" ? (
                      <Badge variant="outline" className="bg-emerald-50/50 text-emerald-700 border-emerald-200/60 text-[10px]">Signed & Verified</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-amber-50/50 text-amber-700 border-amber-300/60 text-[10px]">Awaiting Signature</Badge>
                    )}
                  </div>

                  {/* Approval Action */}
                  {!isLegalApproved && (
                    <Button 
                      className="w-full h-9 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 text-[12px] font-semibold"
                      onClick={() => setIsLegalApproved(true)}
                    >
                      Approve Legal Paperwork
                    </Button>
                  )}
                </section>

                {/* 2. Physical Access (Smart Lock) Block */}
                <section className={`bg-white border border-zinc-200/60 rounded-xl p-5 shadow-[0_1px_4px_rgba(0,0,0,0.01)] space-y-4 transition-all duration-300 ${!isLegalApproved ? 'opacity-50 grayscale pointer-events-none' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={SmartPhone01Icon} size={18} className="text-zinc-400" />
                      <h3 className="text-[13px] font-semibold text-zinc-900 tracking-tight">Physical Access</h3>
                    </div>
                    {!isLegalApproved && (
                      <HugeiconsIcon icon={Key01Icon} size={14} className="text-zinc-300" />
                    )}
                  </div>

                  <p className="text-[12px] text-zinc-500 leading-relaxed">
                    Provision the smart lock at <span className="font-medium text-zinc-700">{selectedActivation.lease.propertyName} ({selectedActivation.lease.unitNumber})</span>. The tenant will receive their PIN via SMS instantly.
                  </p>

                  {generatedPin ? (
                    <div className="mt-4 p-4 rounded-xl border border-emerald-200/60 bg-emerald-50/30 flex flex-col items-center justify-center space-y-2 animate-in fade-in zoom-in-95 duration-300">
                      <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">Active PIN Code</p>
                      <p className="text-3xl font-mono font-semibold tracking-[0.2em] text-zinc-900">{generatedPin}</p>
                      <p className="text-[11px] text-emerald-700/80 font-medium">Successfully synced to hardware.</p>
                    </div>
                  ) : (
                    <Button 
                      className="w-full h-10 mt-2 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 text-[13px] font-semibold shadow-sm"
                      onClick={handleSimulatePinSync}
                    >
                      <HugeiconsIcon icon={Key01Icon} size={14} className="mr-2" />
                      Generate & Sync Smart Lock PIN
                    </Button>
                  )}
                </section>

                {/* Warning Note if disabled */}
                {!isLegalApproved && (
                  <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200/50">
                    <HugeiconsIcon icon={Alert01Icon} size={14} className="text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-[11px] font-medium text-amber-800 leading-tight">
                      Smart lock provisioning is locked until all identity documents and lease agreements are verified and approved.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}