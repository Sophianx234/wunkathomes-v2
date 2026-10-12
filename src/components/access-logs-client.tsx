"use client";

import { useMemo, useState } from "react";
import {
  Search,
  Filter,
  Clock,
  Key,
  Shield,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface AccessLogRecord {
  id: string;
  action: string;
  actorType: string;
  performedBy: string;
  actor: {
    id: string;
    name: string;
    email: string;
    profilePicture: string;
  } | null;
  property: {
    id: string;
    location: string;
  } | null;
  lock: {
    id: string;
    deviceId: string;
  } | null;
  metadata: {
    targetName?: string;
    expiresAt?: string;
  } | null;
  createdAt: string;
}

export default function AccessLogsClient({ 
  data, 
  availableProperties 
}: { 
  data: AccessLogRecord[]; 
  availableProperties: string[]; 
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [selectedAction, setSelectedAction] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Stat summaries
  const stats = useMemo(() => {
    const total = data.length;
    const unlocks = data.filter(l => l.action.includes("UNLOCK")).length;
    const pins = data.filter(l => l.action.includes("PIN")).length;
    const alarms = data.filter(l => l.action.includes("ALARM")).length;
    return { total, unlocks, pins, alarms };
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((log) => {
      // Filter by property
      if (selectedProperty !== "all") {
        if (!log.property || log.property.location !== selectedProperty) return false;
      }
      
      // Filter by action
      if (selectedAction !== "all") {
        if (selectedAction === "UNLOCK") {
          if (!log.action.includes("UNLOCK")) return false;
        } else if (selectedAction === "PIN") {
          if (!log.action.includes("PIN")) return false;
        } else if (log.action !== selectedAction) {
          return false;
        }
      }

      // Filter by search term
      if (searchTerm.trim()) {
        const lowerSearch = searchTerm.toLowerCase();
        const matchesActor = log.actor?.name.toLowerCase().includes(lowerSearch);
        const matchesAction = log.action.toLowerCase().includes(lowerSearch);
        const matchesTarget = log.metadata?.targetName?.toLowerCase().includes(lowerSearch);
        const matchesProperty = log.property?.location?.toLowerCase().includes(lowerSearch);
        const matchesDevice = log.lock?.deviceId?.toLowerCase().includes(lowerSearch);
        if (!matchesActor && !matchesAction && !matchesTarget && !matchesProperty && !matchesDevice) {
          return false;
        }
      }

      return true;
    });
  }, [data, searchTerm, selectedProperty, selectedAction]);

  // Reset to page 1 on filter changes
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedProperty("all");
    setSelectedAction("all");
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm !== "" || selectedProperty !== "all" || selectedAction !== "all";

  return (
    <div className="min-h-screen bg-zinc-50/50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Access & Security Logs
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Real-time audit trail of hardware unlocks, temporary PIN issuance, and security telemetry.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs text-zinc-500 font-medium">Telemetry Online</span>
          </div>
        </div>

        {/* STAT SUMMARY CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            onClick={() => { setSelectedAction("all"); setCurrentPage(1); }}
            className={`bg-white rounded-xl border p-4 shadow-xs transition-all cursor-pointer ${
              selectedAction === "all" ? "border-zinc-900 ring-1 ring-zinc-900/10" : "border-zinc-200/80 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Total Events</span>
              <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900 font-mono tabular-nums tracking-tight mt-2">
              {stats.total}
            </p>
          </div>

          <div 
            onClick={() => { setSelectedAction("UNLOCK"); setCurrentPage(1); }}
            className={`bg-white rounded-xl border p-4 shadow-xs transition-all cursor-pointer ${
              selectedAction === "UNLOCK" ? "border-zinc-900 ring-1 ring-zinc-900/10" : "border-zinc-200/80 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Door Unlocks</span>
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
                <Key className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900 font-mono tabular-nums tracking-tight mt-2">
              {stats.unlocks}
            </p>
          </div>

          <div 
            onClick={() => { setSelectedAction("PIN"); setCurrentPage(1); }}
            className={`bg-white rounded-xl border p-4 shadow-xs transition-all cursor-pointer ${
              selectedAction === "PIN" ? "border-zinc-900 ring-1 ring-zinc-900/10" : "border-zinc-200/80 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">PIN Operations</span>
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
                <Shield className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900 font-mono tabular-nums tracking-tight mt-2">
              {stats.pins}
            </p>
          </div>

          <div 
            onClick={() => { setSelectedAction("ALARM_TRIGGERED"); setCurrentPage(1); }}
            className={`bg-white rounded-xl border p-4 shadow-xs transition-all cursor-pointer ${
              selectedAction === "ALARM_TRIGGERED" ? "border-zinc-900 ring-1 ring-zinc-900/10" : "border-zinc-200/80 hover:border-zinc-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-zinc-500">Security Alarms</span>
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200/60">
                <ShieldAlert className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-zinc-900 font-mono tabular-nums tracking-tight mt-2">
              {stats.alarms}
            </p>
          </div>
        </div>

        {/* TOOLBAR: Search & Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-3 rounded-xl border border-zinc-200/80 shadow-xs">
          <div className="flex flex-wrap items-center gap-2.5 flex-1">
            <div className="relative flex-1 min-w-[220px] max-w-sm">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                placeholder="Search by actor, event, or location..."
                className="pl-8.5 pr-8 h-9 text-xs border-zinc-200 bg-zinc-50/50 hover:bg-white focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-zinc-400 rounded-lg transition-all"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <Select 
              value={selectedProperty} 
              onValueChange={(val) => {
                setSelectedProperty(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-44 text-xs bg-zinc-50/50 hover:bg-white border-zinc-200 rounded-lg transition-all">
                <div className="flex items-center gap-1.5 truncate">
                  <Filter className="w-3 h-3 text-zinc-400 shrink-0" />
                  <SelectValue placeholder="All Properties" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-zinc-200 shadow-md">
                <SelectItem value="all" className="text-xs rounded-md">All Properties</SelectItem>
                {availableProperties.map(prop => (
                  <SelectItem key={prop} value={prop} className="text-xs rounded-md">{prop}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select 
              value={selectedAction} 
              onValueChange={(val) => {
                setSelectedAction(val);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="h-9 w-44 text-xs bg-zinc-50/50 hover:bg-white border-zinc-200 rounded-lg transition-all">
                <div className="flex items-center gap-1.5 truncate">
                  <Activity className="w-3 h-3 text-zinc-400 shrink-0" />
                  <SelectValue placeholder="All Events" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-zinc-200 shadow-md">
                <SelectItem value="all" className="text-xs rounded-md">All Events</SelectItem>
                <SelectItem value="UNLOCK" className="text-xs rounded-md">All Unlocks</SelectItem>
                <SelectItem value="REMOTE_UNLOCK" className="text-xs rounded-md">Remote Unlock</SelectItem>
                <SelectItem value="PHYSICAL_UNLOCK" className="text-xs rounded-md">Physical Unlock</SelectItem>
                <SelectItem value="PIN" className="text-xs rounded-md">All PIN Events</SelectItem>
                <SelectItem value="TEMP_PIN_CREATED" className="text-xs rounded-md">PIN Created</SelectItem>
                <SelectItem value="PIN_REVOKED" className="text-xs rounded-md">PIN Revoked</SelectItem>
                <SelectItem value="PIN_RESET" className="text-xs rounded-md">PIN Reset</SelectItem>
                <SelectItem value="ALARM_TRIGGERED" className="text-xs rounded-md">Alarm Triggered</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="h-9 px-3 text-xs font-medium text-zinc-600 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300 rounded-lg active:scale-95 transition-all shadow-2xs"
              >
                Reset
              </button>
            )}
          </div>

          <div className="text-xs font-mono tabular-nums text-zinc-500 shrink-0 self-end md:self-auto">
            Showing {filteredData.length} of {data.length} events
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-xl border border-zinc-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50/75 border-b border-zinc-100 hover:bg-zinc-50/75">
                  <TableHead className="w-[200px] h-10 text-xs font-medium text-zinc-500 pl-5">Timestamp</TableHead>
                  <TableHead className="w-[240px] h-10 text-xs font-medium text-zinc-500">Property & Device</TableHead>
                  <TableHead className="w-[200px] h-10 text-xs font-medium text-zinc-500">Actor</TableHead>
                  <TableHead className="w-[220px] h-10 text-xs font-medium text-zinc-500">Event</TableHead>
                  <TableHead className="h-10 text-xs font-medium text-zinc-500">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-72 text-center">
                      <div className="flex flex-col items-center justify-center text-zinc-500">
                        <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-400 mb-2.5 border border-zinc-200/60">
                          <Search className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-medium text-zinc-800">No matching log records found</p>
                        <p className="text-[11px] text-zinc-400 mt-0.5">Try widening your filters or clearing your search query.</p>
                        {hasActiveFilters && (
                          <button
                            onClick={handleResetFilters}
                            className="mt-3 text-xs font-medium text-zinc-700 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300 bg-white px-3 py-1 rounded-lg active:scale-95 transition-all shadow-2xs"
                          >
                            Reset filters
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((log) => (
                    <TableRow key={log.id} className="hover:bg-zinc-50/60 transition-colors">
                      
                      {/* Timestamp */}
                      <TableCell className="pl-5 py-3.5">
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-900 font-mono tabular-nums">
                          <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                          <span>
                            {new Date(log.createdAt).toLocaleString('en-GB', { 
                              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </TableCell>

                      {/* Property & Lock */}
                      <TableCell className="py-3.5">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium text-zinc-900 line-clamp-1">{log.property?.location || "Unknown"}</span>
                          {log.lock && (
                            <span className="text-[11px] text-zinc-400 font-mono mt-0.5">
                              ID: {log.lock.deviceId.substring(0, 10)}...
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Actor */}
                      <TableCell className="py-3.5">
                        {log.actor ? (
                          <div className="flex items-center gap-2.5">
                            <Avatar className="h-8 w-8 rounded-lg ring-1 ring-zinc-200/80 shrink-0">
                              <AvatarImage src={log.actor.profilePicture} alt={log.actor.name} />
                              <AvatarFallback className="text-[10px] font-medium bg-zinc-100 text-zinc-600 rounded-lg">
                                {log.actor.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col min-w-0">
                              <span className="text-xs font-medium text-zinc-900 truncate">
                                {log.actor.name}
                              </span>
                              <span className="text-[11px] text-zinc-400 truncate">
                                {log.actorType}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] font-medium text-zinc-600 bg-zinc-100 border border-zinc-200/60 px-2 py-0.5 rounded-md">
                              {log.performedBy || "System Event"}
                            </span>
                          </div>
                        )}
                      </TableCell>

                      {/* Event */}
                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          {log.action === "REMOTE_UNLOCK" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <Key className="w-3 h-3" /> Remote Unlock
                            </span>
                          )}
                          {log.action === "PHYSICAL_UNLOCK" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                              <Key className="w-3 h-3" /> Physical Unlock
                            </span>
                          )}
                          {log.action === "TEMP_PIN_CREATED" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60">
                              <Shield className="w-3 h-3" /> PIN Issued
                            </span>
                          )}
                          {log.action === "PIN_REVOKED" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60">
                              <AlertTriangle className="w-3 h-3" /> PIN Revoked
                            </span>
                          )}
                          {log.action === "PIN_RESET" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60">
                              <RefreshCw className="w-3 h-3" /> PIN Reset
                            </span>
                          )}
                          {log.action === "ALARM_TRIGGERED" && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 animate-pulse">
                              <ShieldAlert className="w-3 h-3" /> Alarm Triggered
                            </span>
                          )}
                          {!["REMOTE_UNLOCK", "PHYSICAL_UNLOCK", "TEMP_PIN_CREATED", "PIN_REVOKED", "PIN_RESET", "ALARM_TRIGGERED"].includes(log.action) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-zinc-100 text-zinc-700 border border-zinc-200/60">
                              {log.action.replace(/_/g, ' ')}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Details */}
                      <TableCell className="py-3.5">
                        {log.metadata?.targetName ? (
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-zinc-400 text-[11px]">For:</span>
                              <code className="text-[11px] font-mono font-medium text-zinc-700 bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200/60">
                                {log.metadata.targetName}
                              </code>
                            </div>
                            {log.metadata.expiresAt && (
                              <span className="text-[11px] text-zinc-400 font-mono tabular-nums mt-0.5">
                                Exp: {new Date(log.metadata.expiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* TABLE FOOTER / PAGINATION */}
          {totalPages > 1 && (
            <div className="px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <span className="text-xs text-zinc-500 font-mono tabular-nums">
                Page {currentPage} of {totalPages}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="h-8 px-2.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300 bg-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-2xs flex items-center gap-1"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="h-8 px-2.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-300 bg-white rounded-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-all shadow-2xs flex items-center gap-1"
                >
                  <span>Next</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
