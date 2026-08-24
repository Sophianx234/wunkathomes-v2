"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { format } from "date-fns";
import { Search01Icon, FilterIcon, MoreHorizontalIcon, ViewIcon, ArrowDown01Icon } from "@hugeicons/core-free-icons";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface CleaningRecord {
  id: string;
  tenantName: string;
  tenantEmail: string;
  tenantImage?: string;
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
  const [selectedRecord, setSelectedRecord] = useState<CleaningRecord | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [canScrollMore, setCanScrollMore] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      setCanScrollMore(scrollHeight > clientHeight && Math.ceil(scrollTop + clientHeight) < scrollHeight);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      setTimeout(checkScroll, 100);
    }
  }, [isDialogOpen, selectedRecord]);

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
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-32 text-center text-zinc-500 font-medium">
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

                  {/* ACTIONS */}
                  <TableCell className="py-3 align-middle text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <HugeiconsIcon icon={MoreHorizontalIcon} size={16} className="text-zinc-500" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedRecord(record);
                            setIsDialogOpen(true);
                          }}
                          className="text-xs font-medium cursor-pointer flex items-center gap-2"
                        >
                          <HugeiconsIcon icon={ViewIcon} size={14} className="text-zinc-400" />
                          View Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-white border-zinc-200/60 overflow-hidden max-h-[85vh] sm:max-w-md p-0 rounded-xl gap-0 flex flex-col">
          {selectedRecord && (
            <>
              <DialogHeader className="p-5 border-b border-zinc-100 bg-zinc-50/50 shrink-0">
                <DialogTitle className="text-xl font-bold tracking-tight text-zinc-900">
                  Service Request Details
                </DialogTitle>
                <DialogDescription className="text-sm font-medium text-zinc-500">
                  Detailed view of the tenant's cleaning schedule.
                </DialogDescription>
              </DialogHeader>

              <div 
                ref={scrollRef}
                onScroll={checkScroll}
                className="p-5 space-y-6 flex-1 overflow-y-auto hide-scrollbar relative"
              >
                {/* Status Badge */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-2">
                    Current Status
                  </h4>
                  {selectedRecord.isDispatchToday ? (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-0 uppercase tracking-widest text-xs font-bold px-3 py-1">
                      Dispatch Today
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-zinc-500 border-zinc-200 uppercase tracking-widest text-xs font-bold px-3 py-1">
                      Scheduled
                    </Badge>
                  )}
                </div>

                {/* Tenant Details */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
                    Tenant Information
                  </h4>
                  <div className="flex items-center gap-3 p-3 bg-zinc-50/50 border border-zinc-200/60 rounded-lg">
                    <Avatar className="h-10 w-10 border border-zinc-200/60 shadow-sm">
                      <AvatarImage src={selectedRecord.tenantImage} />
                      <AvatarFallback className="bg-white text-zinc-900 font-bold text-sm">
                        {selectedRecord.tenantName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-zinc-900">
                        {selectedRecord.tenantName}
                      </span>
                      <span className="text-xs font-medium text-zinc-500">
                        {selectedRecord.tenantEmail}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Property Details */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
                    Property Location
                  </h4>
                  <div className="flex flex-col p-3 bg-zinc-50/50 border border-zinc-200/60 rounded-lg">
                    <span className="text-sm font-bold text-zinc-900">
                      {selectedRecord.propertyTitle}
                    </span>
                    <span className="text-xs font-medium text-zinc-500 mt-0.5">
                      {selectedRecord.propertyLocation}
                    </span>
                  </div>
                </div>

                {/* Schedule Rules */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-3">
                    Schedule Rules
                  </h4>
                  <div className="flex flex-col p-4 bg-zinc-50/50 border border-zinc-200/60 rounded-lg">
                    {selectedRecord.scheduleType === "daily" && (
                      <div>
                        <span className="text-sm font-black text-black tracking-tight">Daily Cleaning</span>
                        <p className="text-xs text-zinc-500 font-medium mt-1">Cleaners are dispatched to this property every single day.</p>
                      </div>
                    )}
                    {selectedRecord.scheduleType === "weekly" && (
                      <div>
                        <span className="text-sm font-black text-black tracking-tight">Weekly Recurring</span>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedRecord.weeklyDays?.map((d: number) => (
                            <span key={d} className="px-2 py-1 bg-white border border-zinc-200/60 rounded text-xs font-bold text-zinc-800 shadow-sm">
                              {dayNames[d]}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {selectedRecord.scheduleType === "custom" && (
                      <div>
                        <span className="text-sm font-black text-black tracking-tight">Custom Dates</span>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {selectedRecord.customDates && selectedRecord.customDates.length > 0 ? (
                            selectedRecord.customDates.map((dateStr, idx) => (
                              <span key={idx} className="px-2 py-1 bg-white border border-zinc-200/60 rounded text-xs font-bold text-zinc-800 ">
                                {format(new Date(dateStr), "MMM d, yyyy")}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-zinc-500 italic">No future dates selected.</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Scroll Indicator Caret */}
              {canScrollMore && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex justify-center w-full pointer-events-none animate-bounce">
                  <div className="bg-white/80 backdrop-blur shadow-sm border border-zinc-200 rounded-full p-1 text-zinc-500">
                    <HugeiconsIcon icon={ArrowDown01Icon} size={16} />
                  </div>
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
