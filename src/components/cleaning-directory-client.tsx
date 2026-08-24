"use client";

import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Search01Icon, FilterIcon } from "@hugeicons/core-free-icons";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

export interface CleaningRecord {
  id: string;
  tenantName: string;
  tenantEmail: string;
  propertyTitle: string;
  propertyLocation: string;
  scheduleType: "custom" | "daily" | "weekly";
  weeklyDays: number[];
  customDates: string[];
  isDispatchToday: boolean;
}

interface CleaningDirectoryClientProps {
  data: CleaningRecord[];
  availableProperties: string[];
}

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CleaningDirectoryClient({ data, availableProperties }: CleaningDirectoryClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("all");
  const [dispatchFilter, setDispatchFilter] = useState("all");

  const filteredData = useMemo(() => {
    return data.filter((record) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        record.tenantName.toLowerCase().includes(q) ||
        record.tenantEmail.toLowerCase().includes(q) ||
        record.propertyTitle.toLowerCase().includes(q);

      if (!matchesSearch) return false;

      // 2. Property Filter
      if (propertyFilter !== "all" && record.propertyTitle !== propertyFilter) {
        return false;
      }

      // 3. Dispatch Filter
      if (dispatchFilter === "today" && !record.isDispatchToday) return false;
      if (dispatchFilter === "future" && record.isDispatchToday) return false;

      return true;
    });
  }, [data, searchQuery, propertyFilter, dispatchFilter]);

  const formatCustomDates = (dates: string[]) => {
    if (!dates || dates.length === 0) return "";
    return dates.map((d) => format(new Date(d), "MMM d, yyyy")).join(", ");
  };

  return (
    <div className="space-y-6">
      {/* FILTER & SEARCH BAR */}
      <section className="bg-white p-2 md:p-3 rounded-lg border border-zinc-200/60 shadow-sm sticky top-20 z-30">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <Input
              placeholder="Search by tenant name, email, or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 bg-zinc-50/50 border-zinc-200 text-sm focus-visible:ring-zinc-400 w-full rounded-md"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
            <Select value={dispatchFilter} onValueChange={setDispatchFilter}>
              <SelectTrigger className="w-[140px] h-10 bg-white border-zinc-200 text-xs font-semibold shrink-0">
                <SelectValue placeholder="Dispatch Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Schedules</SelectItem>
                <SelectItem value="today">Dispatch Today</SelectItem>
                <SelectItem value="future">Future Dates</SelectItem>
              </SelectContent>
            </Select>

            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-[160px] h-10 bg-white border-zinc-200 text-xs font-semibold shrink-0">
                <SelectValue placeholder="Filter Property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {availableProperties.map((prop) => (
                  <SelectItem key={prop} value={prop}>
                    {prop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="h-4 w-px bg-zinc-200 hidden md:block mx-1" />
            <div className="hidden md:flex items-center gap-2 pl-1 pr-2">
              <span className="text-[18px] font-semibold text-zinc-900 leading-none font-tabular-nums">
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
                setPropertyFilter("all");
                setDispatchFilter("all");
              }}
              className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50 rounded-md shrink-0"
              title="Clear Filters"
            >
              <HugeiconsIcon icon={FilterIcon} size={14} />
            </Button>
          </div>
        </div>
      </section>

      {/* DATA TABLE */}
      <div className="bg-white border border-zinc-200/60 rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-zinc-50/30">
            <TableRow className="border-zinc-200/60 hover:bg-transparent">
              <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[280px]">Tenant</TableHead>
              <TableHead className="font-medium text-zinc-500 text-xs h-10">Property</TableHead>
              <TableHead className="font-medium text-zinc-500 text-xs h-10">Schedule Rule</TableHead>
              <TableHead className="font-medium text-zinc-500 text-xs h-10 text-right">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center text-zinc-500 font-medium">
                  No cleaning schedules found matching your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((record) => (
                <TableRow
                  key={record.id}
                  className="group border-zinc-200/60 hover:bg-zinc-50/50 transition-colors"
                >
                  {/* TENANT */}
                  <TableCell className="py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-zinc-200/60 shadow-sm">
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
                      <span className="text-[13px] font-medium text-zinc-900 leading-tight">
                        {record.propertyTitle}
                      </span>
                      <span className="text-[11px] text-zinc-500 mt-0.5 truncate max-w-[200px]">
                        {record.propertyLocation}
                      </span>
                    </div>
                  </TableCell>

                  {/* SCHEDULE RULE */}
                  <TableCell className="py-3 align-middle">
                    {record.scheduleType === "daily" && (
                      <span className="text-[12px] font-bold text-black border-b border-black">Daily</span>
                    )}
                    {record.scheduleType === "weekly" && (
                      <div className="text-[12px]">
                        <span className="font-bold text-black">Weekly: </span>
                        <span className="text-zinc-600 font-medium">
                          {record.weeklyDays?.map((d: number) => dayNames[d]).join(", ")}
                        </span>
                      </div>
                    )}
                    {record.scheduleType === "custom" && (
                      <div
                        className="max-w-[200px] truncate text-[12px]"
                        title={formatCustomDates(record.customDates)}
                      >
                        <span className="font-bold text-black">Custom Dates: </span>
                        <span className="text-zinc-600 font-medium">
                          {formatCustomDates(record.customDates)}
                        </span>
                      </div>
                    )}
                  </TableCell>

                  {/* STATUS / DISPATCH */}
                  <TableCell className="py-3 align-middle text-right">
                    {record.isDispatchToday ? (
                      <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0 uppercase tracking-widest text-[9px] font-bold px-2 py-0.5">
                        Dispatch Today
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-zinc-500 border-zinc-200 uppercase tracking-widest text-[9px] font-bold px-2 py-0.5">
                        Scheduled
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
