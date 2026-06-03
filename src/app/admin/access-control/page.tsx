"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  Search01Icon,
  FilterIcon,
  ViewIcon,
  ViewOffIcon,
  FingerAccessIcon,
  Refresh01Icon,
  Alert01Icon,
  CheckmarkCircle01Icon,
  Clock01Icon,
  Key01Icon,
  UserGroupIcon,
  GridIcon,
  Wifi01Icon,
  WifiDisconnected01Icon,
  BatteryFullIcon,
  Door01Icon,
  Settings01Icon,
  LinkSquare01Icon,
  BedSingle01Icon,
  Bathtub01Icon,
  Maximize01Icon,
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Image from "next/image";

// --- TYPES & SCHEMAS ---
type AccessRights =
  | "Access_Granted"
  | "Manually_Revoked"
  | "Grace_Period_Override";
type ViewPerspective = "unit" | "tenant";
type TenantFilterPill = "all" | "revoked" | "grace";
type UnitFilterPill = "all" | "vacant" | "low_battery" | "offline";

interface ListingDetails {
  id: string;
  title: string;
  image: string;
  features: { bedrooms: number; bathrooms: number; sizeSqm: number };
}

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
    listingDetails: ListingDetails;
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

interface UnitAccessRecord {
  id: string;
  propertyName: string;
  unitNumber: string;
  location: string;
  connection: "Online" | "Offline";
  batteryLevel: number;
  occupancy: "Occupied" | "Vacant";
  tenantName?: string;
  masterPin: string;
  listingDetails: ListingDetails;
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
    unit: {
      propertyName: "The Heights",
      unitNumber: "Apt 4B",
      location: "east_legon",
      listingDetails: {
        id: "LST-001",
        title: "Master Bedroom with Balcony",
        image:
          "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=400&auto=format&fit=crop",
        features: { bedrooms: 1, bathrooms: 1, sizeSqm: 45 },
      },
    },
    accessRights: "Access_Granted",
    assignedPin: "482910",
    logs: [
      {
        id: "log_1",
        event: "Deposit Paid - PIN Issued",
        timestamp: "12 May 2026, 09:14 AM",
        completed: true,
      },
      {
        id: "log_2",
        event: "Ghana Card Verified",
        timestamp: "12 May 2026, 11:30 AM",
        completed: true,
      },
      {
        id: "log_3",
        event: "Manual Overrides Active",
        timestamp: "No overrides active",
        completed: false,
      },
    ],
  },
  {
    id: "acc_002",
    user: {
      name: "Abena Osei",
      phone: "+233 20 987 6543",
      email: "abena.osei@example.com",
      profilePicture: "https://i.pravatar.cc/150?u=abena",
    },
    unit: {
      propertyName: "Cantonments Villas",
      unitNumber: "Villa 2",
      location: "cantonments",
      listingDetails: {
        id: "LST-002",
        title: "Luxury 3-Bedroom Suite",
        image:
          "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&auto=format&fit=crop",
        features: { bedrooms: 3, bathrooms: 3, sizeSqm: 180 },
      },
    },
    accessRights: "Manually_Revoked",
    assignedPin: "910245",
    logs: [
      {
        id: "log_4",
        event: "Deposit Paid - PIN Issued",
        timestamp: "01 May 2026, 14:22 PM",
        completed: true,
      },
      {
        id: "log_5",
        event: "Ghana Card Verified",
        timestamp: "02 May 2026, 10:05 AM",
        completed: true,
      },
      {
        id: "log_6",
        event: "Admin Lockout Active",
        timestamp: "Revocation active by Admin",
        completed: true,
      },
    ],
  },
  {
    id: "acc_003",
    user: {
      name: "Daniel Tetteh",
      phone: "+233 24 555 8899",
      email: "dtetteh@example.com",
      profilePicture: "",
    },
    unit: {
      propertyName: "Airport Res. Apartments",
      unitNumber: "Apt 1A",
      location: "airport_res",
      listingDetails: {
        id: "LST-003",
        title: "Studio Apartment",
        image:
          "https://images.unsplash.com/photo-1621360841013-c76831f1e35d?q=80&w=400&auto=format&fit=crop",
        features: { bedrooms: 1, bathrooms: 1, sizeSqm: 35 },
      },
    },
    accessRights: "Grace_Period_Override",
    assignedPin: "110293",
    logs: [
      {
        id: "log_7",
        event: "Deposit Paid - PIN Issued",
        timestamp: "15 May 2026, 16:40 PM",
        completed: true,
      },
      {
        id: "log_8",
        event: "Ghana Card Verified",
        timestamp: "Awaiting manual audit",
        completed: false,
      },
      {
        id: "log_9",
        event: "Grace Period Active",
        timestamp: "Grace period bypass active",
        completed: true,
      },
    ],
  },
];

const MOCK_UNIT_ACCESS: UnitAccessRecord[] = [
  {
    id: "u_001",
    propertyName: "The Heights",
    unitNumber: "Apt 4B",
    location: "east_legon",
    connection: "Online",
    batteryLevel: 87,
    occupancy: "Occupied",
    tenantName: "Kwame Mensah",
    masterPin: "009912",
    listingDetails: {
      id: "LST-001",
      title: "Master Bedroom with Balcony",
      image:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=400&auto=format&fit=crop",
      features: { bedrooms: 1, bathrooms: 1, sizeSqm: 45 },
    },
  },
  {
    id: "u_002",
    propertyName: "The Heights",
    unitNumber: "Apt 4C",
    location: "east_legon",
    connection: "Offline",
    batteryLevel: 12,
    occupancy: "Vacant",
    masterPin: "881204",
    listingDetails: {
      id: "LST-004",
      title: "Executive 2-Bed Unit",
      image:
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=400&auto=format&fit=crop",
      features: { bedrooms: 2, bathrooms: 2, sizeSqm: 85 },
    },
  },
  {
    id: "u_003",
    propertyName: "Cantonments Villas",
    unitNumber: "Villa 2",
    location: "cantonments",
    connection: "Online",
    batteryLevel: 94,
    occupancy: "Occupied",
    tenantName: "Abena Osei",
    masterPin: "112233",
    listingDetails: {
      id: "LST-002",
      title: "Luxury 3-Bedroom Suite",
      image:
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=400&auto=format&fit=crop",
      features: { bedrooms: 3, bathrooms: 3, sizeSqm: 180 },
    },
  },
  {
    id: "u_004",
    propertyName: "Airport Res. Apartments",
    unitNumber: "Apt 1A",
    location: "airport_res",
    connection: "Online",
    batteryLevel: 45,
    occupancy: "Vacant",
    masterPin: "445566",
    listingDetails: {
      id: "LST-003",
      title: "Studio Apartment",
      image:
        "https://images.unsplash.com/photo-1621360841013-c76831f1e35d?q=80&w=400&auto=format&fit=crop",
      features: { bedrooms: 1, bathrooms: 1, sizeSqm: 35 },
    },
  },
];

// --- BRAND DESIGN HELPERS ---
const getAccessBadgeStyle = (rights: AccessRights) => {
  switch (rights) {
    case "Access_Granted":
      return "bg-emerald-50/50 text-emerald-700 border-emerald-200/60 rounded-lg font-medium";
    case "Manually_Revoked":
      return "bg-rose-50 text-rose-700 font-bold border-rose-300 rounded-lg";
    case "Grace_Period_Override":
      return "bg-amber-50/50 text-amber-700 border-amber-200/60 rounded-lg font-medium";
  }
};

const getBatteryColor = (level: number) => {
  if (level > 50) return "text-emerald-500";
  if (level > 20) return "text-amber-500";
  return "text-rose-500";
};

export default function AccessControlDashboard() {
  const [isMounted, setIsMounted] = useState(false);

  // Global Layout States
  const [perspective, setPerspective] = useState<ViewPerspective>("tenant");
  const [locationFilter, setLocationFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Tenant Specific States
  const [tenantPill, setTenantPill] = useState<TenantFilterPill>("all");
  const [tenantStatusFilter, setTenantStatusFilter] = useState("all");
  const [selectedTenantAccess, setSelectedTenantAccess] =
    useState<TenantAccessRecord | null>(null);
  const [tenantPinInput, setTenantPinInput] = useState("");
  const [isTenantPinEditing, setIsTenantPinEditing] = useState(false);
  const [sheetAccessStatus, setSheetAccessStatus] =
    useState<AccessRights>("Access_Granted");
  const [revealedTenantPins, setRevealedTenantPins] = useState<
    Record<string, boolean>
  >({});

  // Unit Specific States
  const [unitPill, setUnitPill] = useState<UnitFilterPill>("all");
  const [selectedUnitAccess, setSelectedUnitAccess] =
    useState<UnitAccessRecord | null>(null);
  const [revealedUnitPins, setRevealedUnitPins] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // --- HANDLERS ---
  const handleConfigureTenant = (record: TenantAccessRecord) => {
    setSelectedTenantAccess(record);
    setTenantPinInput(record.assignedPin);
    setIsTenantPinEditing(false);
    setSheetAccessStatus(record.accessRights);
  };

  const handleConfigureUnit = (record: UnitAccessRecord) => {
    setSelectedUnitAccess(record);
  };

  const togglePinVisibility = (
    id: string,
    type: "tenant" | "unit",
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    if (type === "tenant") {
      setRevealedTenantPins((prev) => ({ ...prev, [id]: !prev[id] }));
    } else {
      setRevealedUnitPins((prev) => ({ ...prev, [id]: !prev[id] }));
    }
  };

  // --- DATA FILTERING ---
  const filteredTenantData = useMemo(() => {
    return MOCK_TENANT_ACCESS.filter((record) => {
      if (
        tenantPill === "revoked" &&
        record.accessRights !== "Manually_Revoked"
      )
        return false;
      if (
        tenantPill === "grace" &&
        record.accessRights !== "Grace_Period_Override"
      )
        return false;
      if (locationFilter !== "all" && record.unit.location !== locationFilter)
        return false;
      if (
        tenantStatusFilter !== "all" &&
        record.accessRights !== tenantStatusFilter
      )
        return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          record.user.name.toLowerCase().includes(query) ||
          record.unit.propertyName.toLowerCase().includes(query) ||
          record.unit.unitNumber.toLowerCase().includes(query) ||
          record.assignedPin.includes(query)
        );
      }
      return true;
    });
  }, [searchQuery, locationFilter, tenantStatusFilter, tenantPill]);

  const filteredUnitData = useMemo(() => {
    return MOCK_UNIT_ACCESS.filter((record) => {
      if (unitPill === "vacant" && record.occupancy !== "Vacant") return false;
      if (unitPill === "low_battery" && record.batteryLevel > 20) return false;
      if (unitPill === "offline" && record.connection !== "Offline")
        return false;
      if (locationFilter !== "all" && record.location !== locationFilter)
        return false;
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          record.propertyName.toLowerCase().includes(query) ||
          record.unitNumber.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [searchQuery, locationFilter, unitPill]);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
      <div className=" mx-auto space-y-6">
        {/* PAGE HEADER & METRICS */}
        {/* 1. Changed 'grid grid-cols-2' to 'flex flex-col md:flex-row' */}
        <div className="flex flex-col md:flex-row  w-full items-start md:items-center justify-between gap-4 border-b border-zinc-200/60 pb-4">
          {/* Left Side: Pills */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 w-full md:w-auto">
            {/* Dynamic Pills based on Perspective */}
            <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar w-full md:w-auto pb-1 md:pb-0">
              {perspective === "tenant" ? (
                <>
                  <button
                    onClick={() => setTenantPill("all")}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-sm transition-all ${tenantPill === "all" ? "bg-primary text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}
                  >
                    All Tenants
                  </button>
                  <button
                    onClick={() => setTenantPill("revoked")}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-sm transition-all ${tenantPill === "revoked" ? "bg-primary text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}
                  >
                    Locked Out
                  </button>
                  <button
                    onClick={() => setTenantPill("grace")}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-sm transition-all ${tenantPill === "grace" ? "bg-primary text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}
                  >
                    Grace Period
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setUnitPill("all")}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-sm transition-all ${unitPill === "all" ? "bg-primary text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}
                  >
                    All Units
                  </button>
                  <button
                    onClick={() => setUnitPill("vacant")}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-sm transition-all ${unitPill === "vacant" ? "bg-primary text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}
                  >
                    Vacant Units
                  </button>
                  <button
                    onClick={() => setUnitPill("low_battery")}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-sm transition-all ${unitPill === "low_battery" ? "bg-primary text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}
                  >
                    Low Battery
                  </button>
                  <button
                    onClick={() => setUnitPill("offline")}
                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-sm transition-all ${unitPill === "offline" ? "bg-primary text-white" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"}`}
                  >
                    Offline
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Right Side: Tabs */}
          {/* 2. Added flex & justify-end so the tabs push to the right boundary */}
          <div className="w-full md:w-auto flex md:justify-end">
            <Tabs
              value={perspective}
              onValueChange={(val) => {
                setPerspective(val as ViewPerspective);
                setSearchQuery(""); // Reset search when switching views
              }}
              className="w-full md:w-auto inline-block"
            >
              <TabsList className="h-10 bg-zinc-100/80 border border-zinc-200/60 p-1 rounded-xl w-full flex">
                <TabsTrigger
                  value="tenant"
                  className="text-[13px] font-semibold data-[state=active]:bg-white  rounded-lg px-6 flex items-center justify-center gap-2 flex-1"
                >
                  <HugeiconsIcon icon={UserGroupIcon} size={15} /> View by
                  Tenant
                </TabsTrigger>
                <TabsTrigger
                  value="unit"
                  className="text-[13px] font-semibold data-[state=active]:bg-white  rounded-lg px-6 flex items-center justify-center gap-2 flex-1"
                >
                  <HugeiconsIcon icon={GridIcon} size={15} /> View by Unit
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* PERSPECTIVE SWITCHER */}

        {/* SHARED TOP FILTER CHROME */}
        <div className="flex flex-col gap-5 w-full">
          <section className="flex flex-col xl:flex-row items-center gap-4 bg-white p-2 border border-zinc-200/80 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.01)] w-full">
            <div className="relative flex-1 w-full">
              <HugeiconsIcon
                icon={Search01Icon}
                size={16}
                strokeWidth={2}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              />
              <Input
                placeholder={
                  perspective === "tenant"
                    ? "Search by tenant name, key hash, or assigned room..."
                    : "Search by property or unit number..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] bg-transparent shadow-none font-medium placeholder:text-zinc-400"
              />
            </div>

            <div className="h-5 w-px bg-zinc-200 hidden xl:block" />

            <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full xl:w-auto px-2 pb-1 xl:pb-0">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-full md:w-[140px] h-8 border-0 bg-zinc-50/80 hover:bg-zinc-100 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Areas</SelectItem>
                  <SelectItem value="east_legon">East Legon</SelectItem>
                  <SelectItem value="cantonments">Cantonments</SelectItem>
                  <SelectItem value="airport_res">Airport Res.</SelectItem>
                </SelectContent>
              </Select>

              {perspective === "tenant" && (
                <Select
                  value={tenantStatusFilter}
                  onValueChange={setTenantStatusFilter}
                >
                  <SelectTrigger className="w-full md:w-[145px] h-8 border-0 bg-zinc-50/80 hover:bg-zinc-100 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
                    <SelectValue placeholder="Access Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Access_Granted">Granted</SelectItem>
                    <SelectItem value="Manually_Revoked">Revoked</SelectItem>
                    <SelectItem value="Grace_Period_Override">
                      Grace Override
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}

              <div className="h-5 w-px bg-zinc-200 hidden md:block mx-1" />

              <div className="hidden md:flex items-center gap-2 pl-1 pr-2">
                <span className="text-[18px] font-semibold tracking-tighter text-zinc-900 leading-none font-tabular-nums">
                  {perspective === "tenant"
                    ? filteredTenantData.length
                    : filteredUnitData.length}
                </span>
                <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">
                  Records
                  <br />
                  Found
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* --- PERSPECTIVE 1: VIEW BY TENANT --- */}
        {perspective === "tenant" && (
          <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)] animate-in fade-in duration-300">
            <Table>
              <TableHeader className="bg-zinc-50/50">
                <TableRow className="border-zinc-200/80 hover:bg-transparent">
                  <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[240px]">
                    Tenant Profile
                  </TableHead>
                  <TableHead className="font-medium text-zinc-500 text-xs h-10">
                    Occupied Unit
                  </TableHead>
                  <TableHead className="font-medium text-zinc-500 text-xs h-10">
                    Access Status
                  </TableHead>
                  <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[150px]">
                    Active PIN
                  </TableHead>
                  <TableHead className="font-medium text-zinc-500 text-xs h-10 text-right w-[160px]">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTenantData.map((record) => (
                  <TableRow
                    key={record.id}
                    className="group border-zinc-100 hover:bg-zinc-50/80 transition-colors cursor-pointer"
                    onClick={() => handleConfigureTenant(record)}
                  >
                    <TableCell className="py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-zinc-200/60 shadow-sm">
                          <AvatarImage src={record.user.profilePicture} />
                          <AvatarFallback className="bg-zinc-100 text-zinc-600 text-xs">
                            {record.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-semibold text-zinc-900 leading-tight">
                            {record.user.name}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-500 mt-0.5 tracking-tight">
                            {record.user.phone}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 align-middle">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-zinc-900 leading-tight">
                          {record.unit.propertyName}
                        </span>
                        <span className="text-[11px] text-zinc-500 mt-0.5">
                          {record.unit.unitNumber}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 align-middle">
                      <Badge
                        variant="outline"
                        className={`px-2 py-0.5 border text-[10px] uppercase tracking-wider h-5 rounded-sm ${getAccessBadgeStyle(record.accessRights)}`}
                      >
                        {record.accessRights.replace(/_/g, " ")}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className="py-3 align-middle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2 font-mono text-[14px] font-semibold text-zinc-800 tracking-[0.15em]">
                        <span className="w-16 inline-block">
                          {revealedTenantPins[record.id]
                            ? record.assignedPin
                            : "••••••"}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md shrink-0"
                          onClick={(e) =>
                            togglePinVisibility(record.id, "tenant", e)
                          }
                        >
                          {revealedTenantPins[record.id] ? (
                            <HugeiconsIcon icon={ViewOffIcon} size={14} />
                          ) : (
                            <HugeiconsIcon icon={ViewIcon} size={14} />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 align-middle text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[11px] font-semibold border-zinc-200 text-zinc-700  rounded-lg group-hover:bg-primary group-hover:text-white group-hover:border-zinc-900 transition-all duration-200"
                      >
                        Configure Access
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredTenantData.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-zinc-500 text-sm"
                    >
                      No tenants match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* --- PERSPECTIVE 2: VIEW BY UNIT --- */}
        {perspective === "unit" && (
          <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)] animate-in fade-in duration-300">
            <Table>
              <TableHeader className="bg-zinc-50/50">
                <TableRow className="border-zinc-200/80 hover:bg-transparent">
                  <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[240px]">
                    Property & Unit
                  </TableHead>
                  <TableHead className="font-medium text-zinc-500 text-xs h-10">
                    Occupancy
                  </TableHead>
                  <TableHead className="font-medium text-zinc-500 text-xs h-10">
                    Lock Status
                  </TableHead>
                  <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[150px]">
                    Master PIN
                  </TableHead>
                  <TableHead className="font-medium text-zinc-500 text-xs h-10 text-right w-[160px]">
                    Action
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUnitData.map((unit) => (
                  <TableRow
                    key={unit.id}
                    className="group border-zinc-100 hover:bg-zinc-50/80 transition-colors cursor-pointer"
                    onClick={() => handleConfigureUnit(unit)}
                  >
                    <TableCell className="py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg relative bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-500">
                          <Image
                            src={unit.listingDetails.image}
                            alt={unit.listingDetails.title}
                            fill
                            className="object-cover rounded-lg"
                          />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-semibold text-zinc-900 leading-tight">
                            {unit.propertyName}
                          </span>
                          <span className="text-[11px] text-zinc-500 mt-0.5">
                            {unit.unitNumber}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 align-middle">
                      {unit.occupancy === "Occupied" ? (
                        <div className="flex flex-col">
                          <span className="text-[12px] font-medium text-zinc-900">
                            Occupied
                          </span>
                          <span className="text-[11px] text-zinc-500">
                            {unit.tenantName}
                          </span>
                        </div>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-zinc-100 text-zinc-600 border-zinc-200 text-[10px] uppercase tracking-wider h-5 rounded-md"
                        >
                          Vacant
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-3 align-middle">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          {unit.connection === "Online" ? (
                            <HugeiconsIcon
                              icon={Wifi01Icon}
                              size={14}
                              className="text-emerald-500"
                            />
                          ) : (
                            <HugeiconsIcon
                              icon={WifiDisconnected01Icon}
                              size={14}
                              className="text-rose-500"
                            />
                          )}
                          <span
                            className={`text-[12px] font-medium ${unit.connection === "Online" ? "text-emerald-700" : "text-rose-700"}`}
                          >
                            {unit.connection}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <HugeiconsIcon
                            icon={BatteryFullIcon}
                            size={14}
                            className={getBatteryColor(unit.batteryLevel)}
                          />
                          <span
                            className={`text-[12px] font-medium font-tabular-nums ${getBatteryColor(unit.batteryLevel)}`}
                          >
                            {unit.batteryLevel}%
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell
                      className="py-3 align-middle"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-2 font-mono text-[14px] font-semibold text-zinc-800 tracking-[0.15em]">
                        <span className="w-16 inline-block">
                          {revealedUnitPins[unit.id]
                            ? unit.masterPin
                            : "••••••"}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-md shrink-0"
                          onClick={(e) =>
                            togglePinVisibility(unit.id, "unit", e)
                          }
                        >
                          {revealedUnitPins[unit.id] ? (
                            <HugeiconsIcon icon={ViewOffIcon} size={14} />
                          ) : (
                            <HugeiconsIcon icon={ViewIcon} size={14} />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="py-3 align-middle text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[11px] font-semibold border-zinc-200 text-zinc-700  rounded-lg group-hover:bg-primary group-hover:text-white group-hover:border-zinc-900 transition-all duration-200"
                      >
                        Manage Lock
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUnitData.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-32 text-center text-zinc-500 text-sm"
                    >
                      No units match your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* --- SHEET 1: TENANT CONFIGURATION --- */}
      <Sheet
        open={!!selectedTenantAccess}
        onOpenChange={(open) => !open && setSelectedTenantAccess(null)}
      >
        <SheetContent className="w-full sm:max-w-[420px] p-0 bg-[#FAFAFA] border-l border-zinc-200/80 flex flex-col font-sans shadow-2xl">
          {selectedTenantAccess && (
            <>
              <div className="px-6 pt-10 pb-6 border-b border-zinc-200/80 bg-white">
                <div className="flex items-center gap-4">
                  <Avatar className="h-14 w-14 border border-zinc-200/80 shadow-sm ring-4 ring-zinc-50/50">
                    <AvatarImage
                      src={selectedTenantAccess.user.profilePicture}
                    />
                    <AvatarFallback className="bg-zinc-100 text-zinc-600 text-lg">
                      {selectedTenantAccess.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-base font-semibold tracking-tight text-zinc-900 leading-tight">
                      {selectedTenantAccess.user.name}
                    </h2>
                    <p className="text-[12px] font-mono text-zinc-500 mt-1">
                      {selectedTenantAccess.user.phone}
                    </p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      {selectedTenantAccess.user.email}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* --- ADDED: Property Context Card --- */}
                <section className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)] group relative">
                  <Link
                    href={`/admin/properties/${selectedTenantAccess.unit.listingDetails.id}`}
                    className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HugeiconsIcon icon={LinkSquare01Icon} size={14} />
                  </Link>
                  <div className="h-32 w-full bg-zinc-100 relative">
                    <img
                      src={selectedTenantAccess.unit.listingDetails.image}
                      alt={selectedTenantAccess.unit.listingDetails.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                        {selectedTenantAccess.unit.propertyName} •{" "}
                        {selectedTenantAccess.unit.unitNumber}
                      </p>
                      <p className="text-[15px] font-semibold leading-tight mt-0.5">
                        {selectedTenantAccess.unit.listingDetails.title}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-50/50 flex items-center justify-between border-t border-zinc-200/60 text-[11px] font-medium text-zinc-600">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={BedSingle01Icon} size={12} />{" "}
                        {
                          selectedTenantAccess.unit.listingDetails.features
                            .bedrooms
                        }{" "}
                        Bed
                      </span>
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={Bathtub01Icon} size={12} />{" "}
                        {
                          selectedTenantAccess.unit.listingDetails.features
                            .bathrooms
                        }{" "}
                        Bath
                      </span>
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={Maximize01Icon} size={12} />{" "}
                        {
                          selectedTenantAccess.unit.listingDetails.features
                            .sizeSqm
                        }{" "}
                        sqm
                      </span>
                    </div>
                  </div>
                </section>

                <section className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h3 className="text-[12px] font-bold text-zinc-900 uppercase tracking-tight flex items-center gap-1.5">
                        <HugeiconsIcon
                          icon={FingerAccessIcon}
                          size={14}
                          className="text-zinc-400"
                        />{" "}
                        Live Lock Access
                      </h3>
                      <p className="text-[11px] text-zinc-400">
                        Instantly toggle lock entry permissions.
                      </p>
                    </div>
                    <Switch
                      checked={sheetAccessStatus !== "Manually_Revoked"}
                      onCheckedChange={(c) =>
                        setSheetAccessStatus(
                          c ? "Access_Granted" : "Manually_Revoked",
                        )
                      }
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                  {sheetAccessStatus === "Manually_Revoked" && (
                    <div className="p-3 bg-rose-50 border border-rose-200/50 rounded-lg flex items-start gap-2.5 text-rose-800 text-[11px] font-medium animate-in fade-in duration-200">
                      <HugeiconsIcon
                        icon={Alert01Icon}
                        size={14}
                        className="mt-0.5 shrink-0 text-rose-600"
                      />
                      <div>
                        <span className="font-bold uppercase tracking-wider block mb-1">
                          Manual Lockout Active
                        </span>
                        This overrides all lease states. The tenant's PIN is
                        blocked on the hardware.
                      </div>
                    </div>
                  )}
                </section>

                <section className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-4">
                  <div className="space-y-0.5">
                    <h3 className="text-[12px] font-bold text-zinc-900 uppercase tracking-tight flex items-center gap-1.5">
                      <HugeiconsIcon
                        icon={Key01Icon}
                        size={14}
                        className="text-zinc-400"
                      />{" "}
                      Smart Lock PIN
                    </h3>
                    <p className="text-[11px] text-zinc-400">
                      Modify the tenant's primary entry code.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isTenantPinEditing ? (
                      <Input
                        value={tenantPinInput}
                        onChange={(e) =>
                          setTenantPinInput(
                            e.target.value.replace(/[^0-9]/g, "").slice(0, 6),
                          )
                        }
                        className="font-mono text-base tracking-[0.2em] font-semibold h-9 text-center focus-visible:ring-zinc-900/20"
                        maxLength={6}
                        autoFocus
                      />
                    ) : (
                      <div className="flex-1 bg-zinc-50 border border-zinc-200 text-center font-mono text-base tracking-[0.2em] font-bold text-zinc-800 h-9 flex items-center justify-center rounded-md">
                        {tenantPinInput}
                      </div>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 border-zinc-200 text-zinc-700 shrink-0 font-medium text-xs transition-colors hover:bg-zinc-100"
                      onClick={() => setIsTenantPinEditing(!isTenantPinEditing)}
                    >
                      {isTenantPinEditing ? (
                        "Save PIN"
                      ) : (
                        <>
                          <HugeiconsIcon
                            icon={Refresh01Icon}
                            size={12}
                            className="mr-1.5"
                          />{" "}
                          Modify
                        </>
                      )}
                    </Button>
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                    Access Authorization History
                  </h3>
                  <div className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-4">
                    {selectedTenantAccess.logs.map((log) => (
                      <div key={log.id} className="flex gap-3 text-[12px]">
                        <div className="mt-0.5 shrink-0">
                          {log.completed ? (
                            <HugeiconsIcon
                              icon={CheckmarkCircle01Icon}
                              size={14}
                              className="text-emerald-600"
                            />
                          ) : (
                            <HugeiconsIcon
                              icon={Clock01Icon}
                              size={14}
                              className="text-zinc-300"
                            />
                          )}
                        </div>
                        <div className="space-y-0.5">
                          <p
                            className={`font-semibold ${log.completed ? "text-zinc-800" : "text-zinc-400"}`}
                          >
                            {log.event}
                          </p>
                          <p className="text-[11px] text-zinc-400 font-medium font-tabular-nums">
                            {log.timestamp}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="p-4 bg-white border-t border-zinc-200/80 shadow-[0_-8px_20px_rgba(0,0,0,0.02)] z-20">
                <Button
                  className="w-full h-10 bg-primary text-white hover:bg-zinc-800 text-[13px] font-semibold shadow-sm transition-all rounded-lg"
                  onClick={() => setSelectedTenantAccess(null)}
                >
                  Apply Configuration Changes
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* --- SHEET 2: UNIT CONFIGURATION --- */}
      <Sheet
        open={!!selectedUnitAccess}
        onOpenChange={(open) => !open && setSelectedUnitAccess(null)}
      >
        <SheetContent className="w-full sm:max-w-[420px] p-0 bg-[#FAFAFA] border-l border-zinc-200/80 flex flex-col font-sans shadow-2xl">
          {selectedUnitAccess && (
            <>
              <div className="px-6 pt-10 pb-6 border-b border-zinc-200/80 bg-white">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-600 shadow-sm">
                    <HugeiconsIcon icon={Door01Icon} size={24} />
                  </div>
                  <div>
                    <Badge
                      variant="outline"
                      className="bg-zinc-50 mb-1 border-zinc-200 text-zinc-600 text-[10px] uppercase tracking-wider"
                    >
                      {selectedUnitAccess.occupancy}
                    </Badge>
                    <h2 className="text-lg font-semibold tracking-tight text-zinc-900 leading-tight">
                      {selectedUnitAccess.propertyName}
                    </h2>
                    <p className="text-[13px] font-medium text-zinc-500 mt-0.5">
                      {selectedUnitAccess.unitNumber}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* --- ADDED: Property Context Card --- */}
                <section className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)] group relative">
                  <Link
                    href={`/admin/properties/${selectedUnitAccess.listingDetails.id}`}
                    className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm p-1.5 rounded-md text-zinc-500 hover:text-zinc-900 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <HugeiconsIcon icon={LinkSquare01Icon} size={14} />
                  </Link>
                  <div className="h-32 w-full bg-zinc-100 relative">
                    <img
                      src={selectedUnitAccess.listingDetails.image}
                      alt={selectedUnitAccess.listingDetails.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 text-white">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">
                        {selectedUnitAccess.propertyName} •{" "}
                        {selectedUnitAccess.unitNumber}
                      </p>
                      <p className="text-[15px] font-semibold leading-tight mt-0.5">
                        {selectedUnitAccess.listingDetails.title}
                      </p>
                    </div>
                  </div>
                  <div className="p-3 bg-zinc-50/50 flex items-center justify-between border-t border-zinc-200/60 text-[11px] font-medium text-zinc-600">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={BedSingle01Icon} size={12} />{" "}
                        {selectedUnitAccess.listingDetails.features.bedrooms}{" "}
                        Bed
                      </span>
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={Bathtub01Icon} size={12} />{" "}
                        {selectedUnitAccess.listingDetails.features.bathrooms}{" "}
                        Bath
                      </span>
                      <span className="flex items-center gap-1">
                        <HugeiconsIcon icon={Maximize01Icon} size={12} />{" "}
                        {selectedUnitAccess.listingDetails.features.sizeSqm} sqm
                      </span>
                    </div>
                  </div>
                </section>

                {/* Hardware Telemetry */}
                <section className="bg-white border border-zinc-200/80 rounded-xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.01)] flex divide-x divide-zinc-100">
                  <div className="flex-1 px-2 text-center space-y-1">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      Network
                    </p>
                    <div className="flex items-center justify-center gap-1.5">
                      {selectedUnitAccess.connection === "Online" ? (
                        <HugeiconsIcon
                          icon={Wifi01Icon}
                          size={16}
                          className="text-emerald-500"
                        />
                      ) : (
                        <HugeiconsIcon
                          icon={WifiDisconnected01Icon}
                          size={16}
                          className="text-rose-500"
                        />
                      )}
                      <span
                        className={`text-[13px] font-semibold ${selectedUnitAccess.connection === "Online" ? "text-emerald-700" : "text-rose-700"}`}
                      >
                        {selectedUnitAccess.connection}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 px-2 text-center space-y-1">
                    <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      Battery
                    </p>
                    <div className="flex items-center justify-center gap-1.5">
                      <HugeiconsIcon
                        icon={BatteryFullIcon}
                        size={16}
                        className={getBatteryColor(
                          selectedUnitAccess.batteryLevel,
                        )}
                      />
                      <span
                        className={`text-[13px] font-semibold font-tabular-nums ${getBatteryColor(selectedUnitAccess.batteryLevel)}`}
                      >
                        {selectedUnitAccess.batteryLevel}%
                      </span>
                    </div>
                  </div>
                </section>

                {/* Vacant Unit Temporary Access */}
                {selectedUnitAccess.occupancy === "Vacant" && (
                  <section className="bg-white border border-zinc-200/80 rounded-xl p-5 shadow-[0_1px_3px_rgba(0,0,0,0.01)] space-y-4">
                    <div className="space-y-0.5">
                      <h3 className="text-[13px] font-bold text-zinc-900 tracking-tight">
                        Temporary Access Code
                      </h3>
                      <p className="text-[12px] text-zinc-500">
                        Generate a 24-hour PIN for cleaning crews, maintenance,
                        or prospective viewings.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      className="w-full h-10 text-[12px] font-semibold border-zinc-200 hover:bg-zinc-50 text-zinc-800"
                    >
                      Generate 24h Vendor PIN
                    </Button>
                  </section>
                )}

                {/* Device Actions */}
                <section className="space-y-3">
                  <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest pl-1">
                    Hardware Commands
                  </h3>
                  <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.01)] divide-y divide-zinc-100">
                    <button className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors">
                      <div className="flex items-center gap-3 text-zinc-700">
                        <HugeiconsIcon icon={Refresh01Icon} size={16} />
                        <span className="text-[13px] font-medium">
                          Restart Smart Lock
                        </span>
                      </div>
                    </button>
                    <button className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-zinc-50 transition-colors">
                      <div className="flex items-center gap-3 text-zinc-700">
                        <HugeiconsIcon icon={Settings01Icon} size={16} />
                        <span className="text-[13px] font-medium">
                          Force Firmware Sync
                        </span>
                      </div>
                    </button>
                  </div>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
