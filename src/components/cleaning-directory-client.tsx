"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Search01Icon,
  FilterIcon,
  Building01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface CleaningRecord {
  id: string;
  tenantName: string;
  tenantEmail: string;
  tenantImage?: string;
  propertyTitle: string;
  propertyLocation: string;
  scheduleType: "daily" | "weekly" | "custom";
  weeklyDays?: number[];
  customDates?: string[]; // ISO strings
  isDispatchToday: boolean;
}

interface CleaningDirectoryClientProps {
  data: CleaningRecord[];
  availableProperties: string[];
}

export default function CleaningDirectoryClient({
  data,
  availableProperties,
}: CleaningDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredData = useMemo(() => {
    return data.filter((record) => {
      const matchesSearch =
        record.tenantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.tenantEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.propertyTitle.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProperty =
        propertyFilter === "all" || record.propertyTitle === propertyFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "dispatch_today" && record.isDispatchToday) ||
        (statusFilter === "scheduled" && !record.isDispatchToday);

      return matchesSearch && matchesProperty && matchesStatus;
    });
  }, [data, searchQuery, propertyFilter, statusFilter]);

  const formatCustomDates = (dates: string[]) => {
    return dates.map(d => format(new Date(d), "MMM d, yyyy")).join(", ");
  };

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200/60 pb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Cleaning Schedules
            </h1>
            <Badge className="bg-black text-white hover:bg-zinc-800 text-[11px] px-2 h-5 rounded-full">
              {data.filter(d => d.isDispatchToday).length} Active Today
            </Badge>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <section className="flex flex-col xl:flex-row items-center gap-4 bg-white p-1.5 border border-zinc-200/60 rounded-lg shadow-sm w-full">
          <div className="relative flex-1 w-full">
            <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search by tenant name, email, or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] bg-transparent shadow-none"
            />
          </div>
          <div className="h-4 w-px bg-zinc-200 hidden xl:block" />
          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full xl:w-auto px-2 pb-1 xl:pb-0">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[160px] h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100/50 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="dispatch_today">Dispatch Today</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-full md:w-[160px] h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100/50 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {availableProperties.map((prop) => (
                  <SelectItem key={prop} value={prop}>{prop}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="h-4 w-px bg-zinc-200 hidden md:block mx-1" />
            <div className="hidden md:flex items-center gap-2 pl-1 pr-2">
              <span className="text-[18px] font-semibold text-zinc-900 leading-none font-tabular-nums">{filteredData.length}</span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">Records</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setSearchQuery(""); setPropertyFilter("all"); setStatusFilter("all"); }}
              className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50 rounded-md"
            >
              <HugeiconsIcon icon={FilterIcon} size={14} />
            </Button>
          </div>
        </section>

        {/* DATA TABLE */}
        <div className="bg-white border border-zinc-200/60 rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-zinc-50/30">
              <TableRow className="border-zinc-200/60 hover:bg-transparent">
                <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[280px]">Tenant Profile</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Property</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Schedule Rule</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record) => (
                <TableRow
                  key={record.id}
                  className="group border-zinc-200/60 hover:bg-zinc-50/50 transition-colors"
                >
                  {/* TENANT PROFILE */}
                  <TableCell className="py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-zinc-200/60 shadow-sm">
                        <AvatarImage src={record.tenantImage} />
                        <AvatarFallback className="bg-zinc-100/50 text-zinc-600 text-xs font-medium">
                          {record.tenantName.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-[13px] font-semibold leading-tight tracking-tight text-zinc-900">
                          {record.tenantName}
                        </span>
                        <span className="text-[11px] text-zinc-500 mt-0.5">{record.tenantEmail}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* PROPERTY */}
                  <TableCell className="py-3 align-middle">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-zinc-900 leading-tight flex items-center gap-1.5">
                        <HugeiconsIcon icon={Building01Icon} size={12} className="text-zinc-400" /> {record.propertyTitle}
                      </span>
                      <span className="text-[11px] text-zinc-500 mt-0.5 max-w-[200px] truncate">{record.propertyLocation}</span>
                    </div>
                  </TableCell>

                  {/* SCHEDULE RULE */}
                  <TableCell className="py-3 align-middle">
                    {record.scheduleType === "daily" && (
                      <span className="text-[12px] font-semibold text-zinc-900">Daily</span>
                    )}
                    {record.scheduleType === "weekly" && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Weekly</span>
                        <span className="text-[12px] text-zinc-900 font-medium">
                          {record.weeklyDays?.map((d: number) => dayNames[d]).join(", ")}
                        </span>
                      </div>
                    )}
                    {record.scheduleType === "custom" && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">Custom Dates</span>
                        <span className="text-[12px] text-zinc-900 font-medium max-w-[250px] truncate" title={formatCustomDates(record.customDates || [])}>
                          {formatCustomDates(record.customDates || [])}
                        </span>
                      </div>
                    )}
                  </TableCell>

                  {/* STATUS */}
                  <TableCell className="py-3 align-middle">
                    {record.isDispatchToday ? (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/60 border-0 rounded px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold">
                        Dispatch Today
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-zinc-100/50 text-zinc-600 ring-1 ring-zinc-200/80 border-0 rounded px-2 py-0.5 text-[10px] uppercase tracking-wider font-bold">
                        Scheduled
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-zinc-500 text-sm">
                    No active cleaning schedules match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
