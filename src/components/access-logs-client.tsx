"use client";

import { useMemo, useState } from "react";
import {
  Search01Icon,
  FilterIcon,
  Clock01Icon,
  Key01Icon,
  Shield02Icon,
  Alert01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

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

export default function AccessLogsClient({ data, availableProperties }: { data: AccessLogRecord[], availableProperties: string[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProperty, setSelectedProperty] = useState("all");
  const [selectedAction, setSelectedAction] = useState("all");

  const filteredData = useMemo(() => {
    return data.filter((log) => {
      // Filter by property
      if (selectedProperty !== "all") {
        if (!log.property || log.property.location !== selectedProperty) return false;
      }
      
      // Filter by action
      if (selectedAction !== "all") {
        if (log.action !== selectedAction) return false;
      }

      // Filter by search term
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        const matchesActor = log.actor?.name.toLowerCase().includes(lowerSearch);
        const matchesAction = log.action.toLowerCase().includes(lowerSearch);
        const matchesTarget = log.metadata?.targetName?.toLowerCase().includes(lowerSearch);
        if (!matchesActor && !matchesAction && !matchesTarget) return false;
      }

      return true;
    });
  }, [data, searchTerm, selectedProperty, selectedAction]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200/60 pb-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Access & Security Logs
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor smart lock interactions, generated pins, and property access events.
            </p>
          </div>
        </div>

        {/* TOOLBAR: Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-2 rounded-xl border border-zinc-200/60 shadow-sm">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-[280px]">
              <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs by name or event..."
                className="pl-9 h-10 border-zinc-200/80 bg-zinc-50/50 focus-visible:bg-white focus-visible:ring-zinc-200 transition-colors"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <Select value={selectedProperty} onValueChange={setSelectedProperty}>
              <SelectTrigger className="h-10 w-[180px] bg-white border-zinc-200/80">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={FilterIcon} size={14} className="text-muted-foreground" />
                  <SelectValue placeholder="All Properties" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {availableProperties.map(prop => (
                  <SelectItem key={prop} value={prop}>{prop}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="h-10 w-[180px] bg-white border-zinc-200/80">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Shield02Icon} size={14} className="text-muted-foreground" />
                  <SelectValue placeholder="All Events" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="REMOTE_UNLOCK">Remote Unlock</SelectItem>
                <SelectItem value="PHYSICAL_UNLOCK">Physical Unlock</SelectItem>
                <SelectItem value="TEMP_PIN_CREATED">Pin Created</SelectItem>
                <SelectItem value="PIN_REVOKED">Pin Revoked</SelectItem>
                <SelectItem value="PIN_RESET">Pin Reset</SelectItem>
                <SelectItem value="ALARM_TRIGGERED">Alarm Triggered</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="bg-white rounded-xl border border-zinc-200/60 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-zinc-50/50 hover:bg-zinc-50/50">
                  <TableHead className="w-[200px] h-12 text-xs font-medium uppercase tracking-wider text-muted-foreground pl-6">Timestamp</TableHead>
                  <TableHead className="w-[250px] h-12 text-xs font-medium uppercase tracking-wider text-muted-foreground">Property</TableHead>
                  <TableHead className="w-[200px] h-12 text-xs font-medium uppercase tracking-wider text-muted-foreground">Actor</TableHead>
                  <TableHead className="w-[250px] h-12 text-xs font-medium uppercase tracking-wider text-muted-foreground">Event</TableHead>
                  <TableHead className="h-12 text-xs font-medium uppercase tracking-wider text-muted-foreground">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-[400px] text-center">
                      <div className="flex flex-col items-center justify-center text-muted-foreground">
                        <HugeiconsIcon icon={Search01Icon} size={32} className="mb-3 opacity-20" />
                        <p>No access logs found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((log) => (
                    <TableRow key={log.id} className="group hover:bg-zinc-50/50 transition-colors h-[72px]">
                      
                      {/* Timestamp */}
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-2 text-[13px] font-medium text-zinc-900">
                          <HugeiconsIcon icon={Clock01Icon} size={14} className="text-muted-foreground" />
                          {new Date(log.createdAt).toLocaleString('en-GB', { 
                            day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                          })}
                        </div>
                      </TableCell>

                      {/* Property */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-medium text-zinc-900">{log.property?.location || "Unknown"}</span>
                          {log.lock && <span className="text-[11px] text-muted-foreground mt-0.5 font-mono">{log.lock.deviceId.substring(0, 8)}...</span>}
                        </div>
                      </TableCell>

                      {/* Actor */}
                      <TableCell>
                        {log.actor ? (
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 rounded-full border border-zinc-200/60">
                              <AvatarImage src={log.actor.profilePicture} />
                              <AvatarFallback className="text-[10px] font-medium bg-zinc-100 text-zinc-600">
                                {log.actor.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-medium text-zinc-900 leading-none">
                                {log.actor.name}
                              </span>
                              <span className="text-[11px] text-muted-foreground mt-1 leading-none">
                                {log.actorType}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="bg-zinc-50 text-zinc-600 border-zinc-200/60">
                              System
                            </Badge>
                          </div>
                        )}
                      </TableCell>

                      {/* Event */}
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {log.action === "REMOTE_UNLOCK" && <Badge variant="secondary" className="bg-blue-50 text-blue-700 hover:bg-blue-50 border-none"><HugeiconsIcon icon={Key01Icon} size={12} className="mr-1" /> Remote Unlock</Badge>}
                          {log.action === "PHYSICAL_UNLOCK" && <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-none"><HugeiconsIcon icon={Key01Icon} size={12} className="mr-1" /> Physical Unlock</Badge>}
                          {log.action === "TEMP_PIN_CREATED" && <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-none"><HugeiconsIcon icon={Shield02Icon} size={12} className="mr-1" /> Temp PIN Created</Badge>}
                          {log.action === "PIN_REVOKED" && <Badge variant="secondary" className="bg-rose-50 text-rose-700 hover:bg-rose-50 border-none"><HugeiconsIcon icon={Alert01Icon} size={12} className="mr-1" /> PIN Revoked</Badge>}
                          {log.action === "PIN_RESET" && <Badge variant="secondary" className="bg-amber-50 text-amber-700 hover:bg-amber-50 border-none">PIN Reset</Badge>}
                          {log.action === "ALARM_TRIGGERED" && <Badge variant="secondary" className="bg-rose-500 text-white hover:bg-rose-500 border-none"><HugeiconsIcon icon={Alert01Icon} size={12} className="mr-1" /> Alarm</Badge>}
                          {!["REMOTE_UNLOCK", "PHYSICAL_UNLOCK", "TEMP_PIN_CREATED", "PIN_REVOKED", "PIN_RESET", "ALARM_TRIGGERED"].includes(log.action) && (
                            <Badge variant="secondary" className="bg-zinc-100 text-zinc-700 hover:bg-zinc-100 border-none">{log.action}</Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Details */}
                      <TableCell>
                        {log.metadata?.targetName ? (
                          <div className="flex flex-col">
                            <span className="text-[12px] font-medium text-zinc-700">Target: {log.metadata.targetName}</span>
                            {log.metadata.expiresAt && <span className="text-[11px] text-muted-foreground mt-0.5">Exp: {new Date(log.metadata.expiresAt).toLocaleDateString()}</span>}
                          </div>
                        ) : (
                          <span className="text-[12px] text-muted-foreground">-</span>
                        )}
                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

      </div>
    </div>
  );
}
