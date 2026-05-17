"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Search01Icon, 
  FilterIcon, 
  SmartPhone01Icon,
  ViewIcon,
  ViewOffIcon,
  FingerAccessFreeIcons,
  Refresh01Icon,
  Alert01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Key01Icon,
  UserGroupIcon,
  GridIcon // Matched to line 126 below
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
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

// --- TYPES & SCHEMAS ---
type AccessRights = "Access_Granted" | "Manually_Revoked" | "Grace_Period_Override";
type ViewPerspective = "unit" | "tenant";

interface TenantAccessRecord {
  id: string;
  user: {
    name: string;
    phone: string;
    email: string;
    profilePicture: string;
  };
  unit: {
    propertyName: string;
    unitNumber: string;
    location: string;
  };
  accessRights: AccessRights;
  assignedPin: string;
  logs: Array<{
    id: string;
    event: string;
    timestamp: string;
    completed: boolean;
  }>;
}

// --- HARDWARE SIMULATION MOCK DATA ---
const MOCK_TENANT_ACCESS: TenantAccessRecord[] = [
  {
    id: "acc_001",
    user: {
      name: "Kwame Mensah",
      phone: "+233 54 123 4567",
      email: "kwame.m@example.com",
      profilePicture: "https://i.pravatar.cc/150?u=kwame",
    },
    unit: { propertyName: "The Heights", unitNumber: "Apt 4B", location: "East Legon" },
    accessRights: "Access_Granted",
    assignedPin: "482910",
    logs: [
      { id: "log_1", event: "Deposit Paid - PIN Issued", timestamp: "12 May 2026, 09:14 AM", completed: true },
      { id: "log_2", event: "Ghana Card Verified", timestamp: "12 May 2026, 11:30 AM", completed: true },
      { id: "log_3", event: "Manual Overrides Active", timestamp: "No overrides active", completed: false },
    ]
  },
  {
    id: "acc_002",
    user: {
      name: "Abena Osei",
      phone: "+233 20 987 6543",
      email: "abena.osei@example.com",
      profilePicture: "https://i.pravatar.cc/150?u=abena",
    },
    unit: { propertyName: "Cantonments Villas", unitNumber: "Villa 2", location: "Cantonments" },
    accessRights: "Manually_Revoked",
    assignedPin: "910245",
    logs: [
      { id: "log_4", event: "Deposit Paid - PIN Issued", timestamp: "01 May 2026, 14:22 PM", completed: true },
      { id: "log_5", event: "Ghana Card Verified", timestamp: "02 May 2026, 10:05 AM", completed: true },
      { id: "log_6", event: "Manual Overrides Active", timestamp: "Revocation active by Admin", completed: true },
    ]
  },
  {
    id: "acc_003",
    user: {
      name: "Daniel Tetteh",
      phone: "+233 24 555 8899",
      email: "dtetteh@example.com",
      profilePicture: "",
    },
    unit: { propertyName: "The Heights", unitNumber: "Apt 1A", location: "East Legon" },
    accessRights: "Grace_Period_Override",
    assignedPin: "110293",
    logs: [
      { id: "log_7", event: "Deposit Paid - PIN Issued", timestamp: "15 May 2026, 16:40 PM", completed: true },
      { id: "log_8", event: "Ghana Card Verified", timestamp: "Awaiting manual audit", completed: false },
      { id: "log_9", event: "Manual Overrides Active", timestamp: "Grace period bypass active", completed: true },
    ]
  }
];

// --- BRAND DESIGN HELPERS ---
const getAccessBadgeStyle = (rights: AccessRights) => {
  switch (rights) {
    case "Access_Granted":
      return "bg-emerald-50/50 text-emerald-700 border border-emerald-200/60 font-medium";
    case "Manually_Revoked":
      return "bg-rose-600 text-white font-bold border border-rose-700 shadow-sm";
    case "Grace_Period_Override":
      return "bg-amber-50/50 text-amber-700 border border-amber-200/60 font-medium";
  }
};

export default function AccessControlDashboard() {
  const [isMounted, setIsMounted] = useState(false);
  const [perspective, setPerspective] = useState<ViewPerspective>("tenant");
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [revealedPins, setRevealedPins] = useState<Record<string, boolean>>({});
  const [sheetStatus, setSheetStatus] = useState<AccessRights>("Access_Granted");

  // Sheet States
  const [selectedTenantAccess, setSelectedTenantAccess] = useState<TenantAccessRecord | null>(null);
  const [customPinInput, setCustomPinInput] = useState("");
  const [isPinEditing, setIsPinEditing] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Sync internal sheet state when a tenant profile gets selected
  const handleConfigureAccess = (record: TenantAccessRecord) => {
    setSelectedTenantAccess(record);
    setCustomPinInput(record.assignedPin);
    setSheetStatus(record.accessRights);
    setIsPinEditing(false);
  };

  const togglePinVisibility = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRevealedPins(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredTenantData = useMemo(() => {
    return MOCK_TENANT_ACCESS.filter(record => {
      const matchesSearch = record.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            record.unit.propertyName.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Normalized matching rules to account for space vs underscore differences
      const matchesLocation = locationFilter === "all" || 
        record.unit.location.toLowerCase().replace(/\s+/g, '_') === locationFilter.toLowerCase();
      
      return matchesSearch && matchesLocation;
    });
  }, [searchQuery, locationFilter]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* HEADER SPECIFICATION */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200/60 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Access Control</h1>
            <p className="text-[13px] text-zinc-500 mt-1 font-medium">Overrule hardware states and manage physical firmware pathways instantly.</p>
          </div>

          {/* PERSPECTIVE SWITCHER */}
          <Tabs value={perspective} onValueChange={(val) => setPerspective(val as ViewPerspective)} className="w-full md:w-auto">
            <TabsList className="h-9 bg-zinc-100/50 border border-zinc-200/60 p-0.5 rounded-lg">
              <TabsTrigger value="unit" className="text-[13px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 flex items-center gap-1.5">
                <HugeiconsIcon icon={GridIcon} size={14} /> View by Unit
              </TabsTrigger>
              <TabsTrigger value="tenant" className="text-[13px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4 flex items-center gap-1.5">
                <HugeiconsIcon icon={UserGroupIcon} size={14} /> View by Tenant
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* CONDITIONAL INTERFACE CORE */}
        {perspective === "unit" ? (
          <div className="border border-dashed border-zinc-300 rounded-xl h-64 flex flex-col items-center justify-center text-zinc-400 bg-white">
            <HugeiconsIcon icon={SmartPhone01Icon} size={24} className="mb-2 opacity-40 animate-pulse" />
            <p className="text-sm font-medium">Physical asset fleet graph module placeholder.</p>
          </div>
        ) : (
          <>
            {/* UNIFIED SEARCH & FILTER CHROME */}
            <div className="flex flex-col gap-5 w-full">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto pb-1 md:pb-0">
                  <button className="whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-zinc-900 text-white shadow-sm transition-all">
                    All Overrides
                  </button>
                  <button className="whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-all">
                    Active Revocations
                  </button>
                  <button className="whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 transition-all">
                    Grace Windows
                  </button>
                </div>
              </div>

              <section className="flex flex-col xl:flex-row items-center gap-4 bg-white p-1.5 border border-zinc-200/60 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.01)] w-full">
                <div className="relative flex-1 w-full">
                  <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <Input 
                    placeholder="Search by tenant name, key hash, or assigned room..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] bg-transparent shadow-none placeholder:text-zinc-400 font-medium"
                  />
                </div>

                <div className="h-4 w-px bg-zinc-200 hidden xl:block" />

                <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full xl:w-auto px-2 pb-1 xl:pb-0">
                  <Select value={locationFilter} onValueChange={(val) => setLocationFilter(val)}>
                    <SelectTrigger className="w-full md:w-[140px] h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
                      <SelectValue placeholder="Location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Areas</SelectItem>
                      <SelectItem value="east_legon">East Legon</SelectItem>
                      <SelectItem value="cantonments">Cantonments</SelectItem>
                    </SelectContent>
                  </Select>

                  <div className="h-4 w-px bg-zinc-200 hidden md:block mx-1" />

                  <div className="hidden md:flex items-center gap-2 pl-1 pr-2">
                    <span className="text-[18px] font-semibold tracking-tighter text-zinc-900 leading-none font-tabular-nums">
                      {filteredTenantData.length}
                    </span>
                    <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">
                      Credentials
                    </span>
                  </div>

                  <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 shrink-0 ml-auto md:ml-0 rounded-md">
                    <HugeiconsIcon icon={FilterIcon} size={14} />
                  </Button>
                </div>
              </section>
            </div>

            {/* TENANT ACCESS CONTROL RECORD COMPONENT */}
            <div className="bg-white border border-zinc-200/60 rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
              <Table>
                <TableHeader className="bg-zinc-50/30">
                  <TableRow className="border-zinc-200/60 hover:bg-transparent">
                    <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[240px]">Tenant Profile</TableHead>
                    <TableHead className="font-medium text-zinc-500 text-xs h-10">Occupied Unit</TableHead>
                    <TableHead className="font-medium text-zinc-500 text-xs h-10">Current Access Rights</TableHead>
                    <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[150px]">Assigned PIN</TableHead>
                    <TableHead className="font-medium text-zinc-500 text-xs h-10 text-right w-[160px]">Override</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTenantData.map((record) => (
                    <TableRow 
                      key={record.id} 
                      className="group border-zinc-100 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                      onClick={() => handleConfigureAccess(record)}
                    >
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

                      <TableCell className="py-3 align-middle">
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-zinc-900 leading-tight">{record.unit.propertyName}</span>
                          <span className="text-[11px] text-zinc-500 mt-0.5">{record.unit.unitNumber}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 align-middle">
                        <Badge variant="outline" className={`px-2 py-0.5 border text-[10px] uppercase tracking-wider h-5 rounded-md ${getAccessBadgeStyle(record.accessRights)}`}>
                          {record.accessRights.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3 align-middle" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2 font-mono text-[14px] font-semibold text-zinc-800 tracking-wider">
                          <span>{revealedPins[record.id] ? record.assignedPin : "••••••"}</span>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-zinc-400 hover:text-zinc-900 rounded-md" onClick={(e) => togglePinVisibility(record.id, e)}>
                            {revealedPins[record.id] ? <HugeiconsIcon icon={ViewOffIcon} size={13} /> : <HugeiconsIcon icon={ViewIcon} size={13} />}
                          </Button>
                        </div>
                      </TableCell>

                      <TableCell className="py-3 align-middle text-right">
                        <Button variant="outline" size="sm" className="h-8 text-[11px] font-semibold border-zinc-200 text-zinc-700 shadow-sm rounded-lg group-hover:bg-zinc-900 group-hover:text-white group-hover:border-zinc-900 transition-all duration-200">
                          Configure Access
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      {/* TENANT ACCESS CONFIGURATION PANEL (SHEET) */}
      <Sheet open={!!selectedTenantAccess} onOpenChange={(open) => !open && setSelectedTenantAccess(null)}>
        <SheetContent className="w-full sm:max-w-[420px] p-0 bg-[#FAFAFA] border-l border-zinc-200/60 flex flex-col font-sans shadow-2xl">
          {selectedTenantAccess && (
            <>
              {/* Header Interface */}
              <div className="px-6 pt-10 pb-6 border-b border-zinc-200/60 bg-white">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border border-zinc-200/80 shadow-sm ring-4 ring-zinc-50/50">
                    <AvatarImage src={selectedTenantAccess.user.profilePicture} />
                    <AvatarFallback className="bg-zinc-100 text-zinc-600 text-lg">{selectedTenantAccess.user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-base font-semibold tracking-tight text-zinc-900 leading-tight">
                      {selectedTenantAccess.user.name}
                    </h2>
                    <p className="text-[12px] font-mono text-zinc-500 mt-1">{selectedTenantAccess.user.phone}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{selectedTenantAccess.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Functional Dashboard Options */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Section 1: Live Access Status Toggle */}
                <section className="bg-white border border-zinc-200/60 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-[12px] font-bold text-zinc-900 uppercase tracking-tight flex items-center gap-1.5">
                        <HugeiconsIcon icon={FingerAccessFreeIcons} size={14} className="text-zinc-400" /> Remote Access Gate
                      </h3>
                      <p className="text-[11px] text-zinc-400">Instantly switch live hardware operational status.</p>
                    </div>
                    <Switch 
                      checked={sheetStatus !== "Manually_Revoked"} 
                      onCheckedChange={(checked) => {
                        setSheetStatus(checked ? "Access_Granted" : "Manually_Revoked");
                      }}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>

                  {sheetStatus === "Manually_Revoked" && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200/50 rounded-lg flex items-start gap-2 text-rose-800 text-[11px] font-medium animate-in fade-in duration-200">
                      <HugeiconsIcon icon={Alert01Icon} size={14} className="mt-0.5 shrink-0 text-rose-600" />
                      <div>
                        <span className="font-bold uppercase tracking-wider block mb-0.5">Hard Lockout Overrule Active</span>
                        This profile overrides database tenancy states. Standard PIN entry mechanisms are completely isolated on the lock hardware.
                      </div>
                    </div>
                  )}
                </section>

                {/* Section 2: Manual PIN Management */}
                <section className="bg-white border border-zinc-200/60 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-4">
                  <div className="space-y-0.5">
                    <h3 className="text-[12px] font-bold text-zinc-900 uppercase tracking-tight flex items-center gap-1.5">
                      <HugeiconsIcon icon={Key01Icon} size={14} className="text-zinc-400" /> Hardware Credential Pin
                    </h3>
                    <p className="text-[11px] text-zinc-400">Modify or assign explicit manual access digits.</p>
                  </div>

                  <div className="flex items-center gap-2">
                    {isPinEditing ? (
                      <Input 
                        value={customPinInput}
                        onChange={(e) => setCustomPinInput(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                        className="font-mono text-base tracking-[0.2em] font-semibold h-9 text-center focus-visible:ring-zinc-900/20"
                        maxLength={6}
                      />
                    ) : (
                      <div className="flex-1 bg-zinc-50 border border-zinc-200 text-center font-mono text-base tracking-[0.2em] font-bold text-zinc-800 h-9 flex items-center justify-center rounded-md">
                        {customPinInput}
                      </div>
                    )}

                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-9 px-3 border-zinc-200 text-zinc-700 shrink-0 font-medium text-xs"
                      onClick={() => {
                        if (isPinEditing) {
                          // Save operation simulation
                          setIsPinEditing(false);
                        } else {
                          setIsPinEditing(true);
                        }
                      }}
                    >
                      {isPinEditing ? (
                        "Save PIN"
                      ) : (
                        <>
                          <HugeiconsIcon icon={Refresh01Icon} size={12} className="mr-1.5" /> Modify
                        </>
                      )}
                    </Button>
                  </div>
                </section>

                {/* Section 3: Access Permissions Ledger */}
                <section className="space-y-3">
                  <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Access Authorization History</h3>
                  <div className="bg-white border border-zinc-200/60 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-4">
                    {selectedTenantAccess.logs.map((log) => (
                      <div key={log.id} className="flex gap-3 text-[12px]">
                        <div className="mt-0.5 shrink-0">
                          {log.completed ? (
                            <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-emerald-600" />
                          ) : (
                            <HugeiconsIcon icon={Clock01Icon} size={14} className="text-zinc-300" />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <p className={`font-semibold ${log.completed ? 'text-zinc-800' : 'text-zinc-400'}`}>
                            {log.event}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-medium font-tabular-nums">{log.timestamp}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

              </div>

              {/* Pin Footer Operations */}
              <div className="p-4 bg-white border-t border-zinc-200/80 shadow-[0_-8px_20px_rgba(0,0,0,0.02)] z-20">
                <Button 
                  className="w-full h-10 bg-zinc-900 text-white hover:bg-zinc-800 text-[12px] font-semibold shadow-sm transition-all rounded-lg"
                  onClick={() => setSelectedTenantAccess(null)}
                >
                  Apply Configuration Changes
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}