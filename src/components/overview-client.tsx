"use client"

import {
  ArrowDownRight01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  BankIcon,
  Building03Icon,
  Calendar01Icon,
  City01Icon,
  Clock01Icon,
  Door01Icon,
  House03Icon,
  LinkSquare01Icon,
  Location01Icon,
  MapingIcon,
  MoreHorizontalIcon,
  OfficeChairIcon,
  SmartPhone01Icon,
  StarIcon,
  Wallet02Icon,
  Wrench01Icon, // For maintenance alerts
  Shield02Icon,
  UserIdVerificationIcon, // For KYC alerts
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import * as React from "react"
import { useRouter, usePathname, useSearchParams } from "next/navigation"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis
} from "recharts"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from "@/components/ui/chart"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatCurrency } from "./transactions-client"


// --- STATIC CONFIGS ---
const revenueChartConfig = {
  Paystack: { label: "Paystack", color: "var(--foreground)" }, 
  Bank_Transfer: { label: "Bank Transfer", color: "var(--border)" }, 
}

const assetChartConfig = {
  Rented: { label: "Rented", color: "#10b981" },
  Pending: { label: "Pending", color: "#f59e0b" },
  Available: { label: "Available", color: "#3b82f6" },
}

// --- UTILS ---

const getPropertyIcon = (type: string) => {
  switch (type) {
    case "Apartment Building":
    case "Apartment_Building":
      return City01Icon;
    case "Commercial":
      return OfficeChairIcon;
    case "House":
      return House03Icon;
    case "Land":
      return MapingIcon;
    default:
      return Building03Icon; 
  }
};

const renderStars = (rating: number) => {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <HugeiconsIcon 
          key={star} 
          icon={StarIcon} 
          size={12} 
          className={star <= rating ? "fill-zinc-500 text-zinc-500" : "fill-muted text-muted-foreground opacity-30"} 
        />
      ))}
    </div>
  )
}

// --- COMPONENT TYPES ---
type DashboardProps = {
  selectedYear?: number;
  data: {
    metrics: {
      monthlyRevenue: number;
      revenueTrend: number;
      revenueDifference: number;
      timeframeLabel: string;
      rentedListings: number;
      totalListings: number;
      unverifiedFunds: number;
      unverifiedTrend: number;
      outstandingRent: number;
      totalLocks: number;
      onlineLocks: number;
      activeTours: number;
      toursToday: number;
      activeTenancies: number;
      openWorkOrders: number;
      offlineLocks: number;
      // DYNAMIC ALERT METRICS (Ensure these are passed from server)
      pendingBankTransfers: number;
      pendingToursToday: number;
      pendingKYC: number;
      pendingLeases: number;
      urgentMaintenance: number;
    };
    recentPayments: any[];
    dueRents: any[];
    recentListings: any[];
    recentReviews: any[];
    recentSecurityEvents?: any[];
    recentTours?: any[];
    propertyTypeStats: any[];
    assetChartData: any[];
    revenueChartData: any[];
  }
}

export default function PortfolioDashboardClient({ data, selectedYear }: DashboardProps) {
  const [isMounted, setIsMounted] = React.useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const currentYearStr = (selectedYear || new Date().getFullYear()).toString();

  const handleYearChange = (year: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("year", year)
    router.push(`${pathname}?${params.toString()}`)
  }

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) return null

  const {
    metrics,
    recentPayments,
    dueRents,
    recentListings,
    recentReviews,
    recentSecurityEvents = [],
    recentTours = [],
    propertyTypeStats,
    assetChartData,
    revenueChartData
  } = data;

  const totalAssets = assetChartData.reduce((acc, curr) => acc + curr.count, 0)

// ============================================================================
  // DYNAMIC ALERTS ENGINE
  // ============================================================================
  const activeAlerts = [];

  // 1. Critical Operational Blockers (Maintenance)
  if (metrics.urgentMaintenance > 0) {
    activeAlerts.push({
      id: 'maintenance',
      icon: Wrench01Icon,
      title: "Urgent Maintenance",
      message: `There are ${metrics.urgentMaintenance} urgent maintenance request${metrics.urgentMaintenance > 1 ? 's' : ''} waiting to be resolved.`,
      link: "/admin/manage/maintenance",
      iconClass: "bg-amber-50 text-amber-700 border border-amber-200/60",
    });
  }

  // 2. Onboarding Bottlenecks (KYC & Leases)
  if (metrics.pendingKYC > 0 || metrics.pendingLeases > 0) {
    let onboardingMessage = "";
    
    if (metrics.pendingKYC > 0 && metrics.pendingLeases > 0) {
      onboardingMessage = `${metrics.pendingKYC} ID verification${metrics.pendingKYC > 1 ? 's' : ''} and ${metrics.pendingLeases} lease${metrics.pendingLeases > 1 ? 's' : ''} need your approval before the tenants can move in.`;
    } else if (metrics.pendingKYC > 0) {
      onboardingMessage = `${metrics.pendingKYC} ID verification${metrics.pendingKYC > 1 ? 's' : ''} need${metrics.pendingKYC === 1 ? 's' : ''} your approval before the tenant${metrics.pendingKYC === 1 ? '' : 's'} can move in.`;
    } else {
      onboardingMessage = `${metrics.pendingLeases} lease${metrics.pendingLeases > 1 ? 's' : ''} need${metrics.pendingLeases === 1 ? 's' : ''} your approval before the tenant${metrics.pendingLeases === 1 ? '' : 's'} can move in.`;
    }

    activeAlerts.push({
      id: 'onboarding',
      icon: UserIdVerificationIcon,
      title: "New Tenant Approvals",
      message: onboardingMessage,
      link: "/admin/manage/tenants",
      iconClass: "bg-zinc-100 text-zinc-900 border border-zinc-200/60",
    });
  }

  // 3. Financial Reconciliations (Bank Transfers)
  if (metrics.pendingBankTransfers > 0) {
    activeAlerts.push({
      id: 'finance',
      icon: BankIcon,
      title: "Pending Bank Transfers",
      message: `${metrics.pendingBankTransfers} bank transfer${metrics.pendingBankTransfers > 1 ? 's' : ''} need to be reviewed and confirmed.`,
      link: "/admin/manage/transactions",
      iconClass: "bg-blue-50 text-blue-700 border border-blue-200/60",
    });
  }

  // 4. Daily Operations (Tours)
  if (metrics.pendingToursToday > 0) {
    activeAlerts.push({
      id: 'tours',
      icon: Calendar01Icon,
      title: "Today's Tours",
      message: `You have ${metrics.pendingToursToday} property tour${metrics.pendingToursToday > 1 ? 's' : ''} happening today.`,
      link: "/admin/manage/tours",
      iconClass: "bg-zinc-100 text-zinc-800 border border-zinc-200/60",
    });
  }

  // 5. Smart Lock Operations (Offline Locks)
  const offlineLocksCount = metrics.offlineLocks ?? (metrics.totalLocks - metrics.onlineLocks);
  if (offlineLocksCount > 0) {
    activeAlerts.push({
      id: 'locks',
      icon: Shield02Icon,
      title: "Offline Smart Locks",
      message: `There ${offlineLocksCount > 1 ? 'are' : 'is'} ${offlineLocksCount} smart lock${offlineLocksCount > 1 ? 's' : ''} currently offline that require${offlineLocksCount === 1 ? 's' : ''} attention.`,
      link: "/admin/manage/locks",
      iconClass: "bg-rose-50 text-rose-700 border border-rose-200/60",
    });
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-4 lg:p-8 lg:pt-0 font-sans selection:bg-zinc-200">
      <div className="mx-auto max-w-[1500px] space-y-6">
        
        {/* ========================================================= */}
        {/* DYNAMIC ALERT STACK */}
        {/* ========================================================= */}
        {activeAlerts.length > 0 && (
          <div className="flex flex-col gap-3">
            {activeAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 md:p-5 rounded-xl border border-zinc-200/80 bg-white shadow-xs transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${alert.iconClass}`}>
                    <HugeiconsIcon icon={alert.icon} size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold tracking-tight text-zinc-900 mb-0.5">{alert.title}</h4>
                    <p className="text-xs md:text-sm font-normal text-zinc-600 leading-relaxed">{alert.message}</p>
                  </div>
                </div>
                <Link 
                  href={alert.link} 
                  className="shrink-0 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors duration-150 active:scale-[0.98] flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <span>Review Action</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="text-white" />
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* --- GRID LAYOUT --- */}
        <div className="flex flex-col gap-5">
          
          {/* ROW 1: 4 Cards (2x2), Donut Chart, Occupancy Table */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            
            {/* Left Col (4 Cards - 2x2 Grid) */}
            <div className="grid grid-cols-2 gap-5 lg:col-span-8">
              {/* Card 1: Revenue */}
              <div className="rounded-xl border border-zinc-200/80 bg-white shadow-xs p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Revenue</span>
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
                      <HugeiconsIcon icon={Wallet02Icon} size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold tracking-tight text-zinc-900 font-tabular-nums">
                      {formatCurrency(metrics.monthlyRevenue).replace("GH", "")}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-zinc-500 flex flex-wrap items-center gap-1">
                  {metrics.revenueTrend > 0 ? (
                    <span className="inline-flex items-center font-medium text-emerald-600">
                      <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} className="mr-0.5" />
                      {metrics.revenueTrend}%
                      <span className="opacity-80 ml-1 font-normal">
                        (+{formatCurrency(Math.abs(metrics.revenueDifference)).replace("GH", "")})
                      </span>
                    </span>
                  ) : metrics.revenueTrend < 0 ? (
                    <span className="inline-flex items-center font-medium text-rose-600">
                      <HugeiconsIcon icon={ArrowDownRight01Icon} size={14} className="mr-0.5" />
                      {Math.abs(metrics.revenueTrend)}%
                      <span className="opacity-80 ml-1 font-normal">
                        (-{formatCurrency(Math.abs(metrics.revenueDifference)).replace("GH", "")})
                      </span>
                    </span>
                  ) : (
                    <span className="font-medium text-zinc-500">No change</span>
                  )}
                  <span className="text-zinc-400">• {metrics.timeframeLabel || "vs previous 30 days"}</span>
                </div>
              </div>

              {/* Card 2: Occupancy */}
              <div className="rounded-xl border border-zinc-200/80 bg-white shadow-xs p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Occupied Properties</span>
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
                      <HugeiconsIcon icon={House03Icon} size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold tracking-tight text-zinc-900 font-tabular-nums">
                      {metrics.rentedListings} <span className="text-lg font-medium text-zinc-400">/ {metrics.totalListings}</span>
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-zinc-500 flex items-center gap-1.5">
                  {(() => {
                    const capacity = metrics.totalListings > 0 ? Math.round((metrics.rentedListings / metrics.totalListings) * 100) : 0;
                    const availableUnits = metrics.totalListings - metrics.rentedListings;
                    
                    let colorClass = "text-rose-600";
                    if (capacity >= 80) colorClass = "text-emerald-600";
                    else if (capacity >= 50) colorClass = "text-amber-600";

                    return (
                      <>
                        <span className={`font-semibold ${colorClass}`}>
                          {capacity}% capacity
                        </span>
                        <span className="text-zinc-400">
                          • {availableUnits} {availableUnits === 1 ? 'unit' : 'units'} vacant
                        </span>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Card 3: Current Residents */}
              <div className="rounded-xl border border-zinc-200/80 bg-white shadow-xs p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Current Tenants</span>
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
                      <HugeiconsIcon icon={Door01Icon} size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold tracking-tight text-zinc-900 font-tabular-nums">
                      {metrics.activeTenancies}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-zinc-500">
                  <span className="font-semibold text-zinc-900">{metrics.pendingLeases}</span> onboarding pending
                </div>
              </div>

              {/* Card 4: Open Work Orders */}
              <div className="rounded-xl border border-zinc-200/80 bg-white shadow-xs p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Maintenance Requests</span>
                    <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-700">
                      <HugeiconsIcon icon={Wrench01Icon} size={16} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold tracking-tight text-zinc-900 font-tabular-nums">
                      {metrics.openWorkOrders}
                    </span>
                  </div>
                </div>
                <div className="mt-2 text-xs text-zinc-500">
                  {metrics.urgentMaintenance > 0 ? (
                    <span className="font-medium text-rose-600">
                      {metrics.urgentMaintenance} {metrics.urgentMaintenance === 1 ? 'requires' : 'require'} urgent attention
                    </span>
                  ) : (
                    <span className="text-zinc-500">No urgent requests</span>
                  )}
                </div>
              </div>
            </div>

            {/* Middle Col: Asset Status Donut */}
            <div className="lg:col-span-4 h-full">
              <div className="flex flex-col h-full rounded-xl border border-zinc-200/80 bg-white shadow-xs p-5">
                <div className="pb-1">
                  <span className="text-sm font-semibold tracking-tight text-zinc-900">Properties Status</span>
                </div>
                <div className="flex flex-1 flex-col justify-center pt-2">
                  <div className="relative h-[200px] w-full">
                    <ChartContainer config={assetChartConfig} className="mx-auto h-full w-full">
                      <PieChart>
                        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                        <Pie
                          data={assetChartData}
                          dataKey="count"
                          nameKey="status"
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={3}
                          strokeWidth={0}
                        >
                          {assetChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                          <Label
                            content={({ viewBox }) => {
                              if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                                return (
                                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-zinc-900 text-3xl font-bold font-tabular-nums">
                                      {totalAssets}
                                    </tspan>
                                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-zinc-400 text-xs font-medium tracking-wide">
                                      Total Units
                                    </tspan>
                                  </text>
                                )
                              }
                            }}
                          />
                        </Pie>
                      </PieChart>
                    </ChartContainer>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    {assetChartData.map((item) => {
                      const percentage = totalAssets > 0 ? Math.round((item.count / totalAssets) * 100) : 0;
                      return (
                        <div key={item.status} className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2">
                            <div className="size-2 rounded-full" style={{ backgroundColor: item.fill }} />
                            <span className="font-medium text-zinc-600">{item.status}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-tabular-nums">
                            <span className="font-semibold text-zinc-900">{item.count}</span>
                            <span className="text-[11px] text-zinc-400 w-8 text-right">({percentage}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ROW 2: Bar Chart (Left 2/3), Remaining Mini Cards & Transactions Table (Right 1/3) */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            
            {/* Left 2/3: Revenue Chart */}
            <div className="lg:col-span-8 h-full">
              <div className="flex flex-col h-full rounded-xl border border-zinc-200/80 bg-white shadow-xs p-5">
                <div className="flex items-center justify-between pb-3">
                  <span className="text-sm font-semibold tracking-tight text-zinc-900">Revenue Overview</span>
                  <Select value={currentYearStr} onValueChange={handleYearChange}>
                    <SelectTrigger className="h-8 px-2.5 rounded-lg border border-zinc-200 text-xs font-medium text-zinc-700 bg-zinc-50 hover:bg-zinc-100 transition-colors focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-lg">
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                      <SelectItem value="2024">2024</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 pt-2">
                  <div className="h-[260px] w-full">
                    <ChartContainer config={revenueChartConfig} className="h-full w-full">
                      <BarChart data={revenueChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontWeight: 500 }} 
                          dy={10} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 11, fill: 'var(--muted-foreground)', fontWeight: 500 }} 
                          tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<ChartTooltipContent />} />
                        <Bar dataKey="Paystack" stackId="a" fill="var(--color-Paystack)" radius={[0, 0, 4, 4]} maxBarSize={12} />
                        <Bar dataKey="Bank_Transfer" stackId="a" fill="var(--color-Bank_Transfer)" radius={[4, 4, 0, 0]} maxBarSize={12} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Right 1/3: 2 Mini Cards + Transactions Table */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-5">
                {/* Card 5: Smart Locks */}
                <div className="rounded-xl border border-zinc-200/80 bg-white shadow-xs p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Smart Locks</span>
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
                      <HugeiconsIcon icon={Shield02Icon} size={15} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold tracking-tight text-zinc-900 font-tabular-nums">
                      {metrics.totalLocks}
                    </span>
                    <div className="mt-1 flex items-center gap-2 text-xs font-medium">
                      <span className="flex items-center text-emerald-600">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1"></span>
                        {metrics.onlineLocks} Online
                      </span>
                      <span className="flex items-center text-zinc-500">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 mr-1"></span>
                        {metrics.offlineLocks} Offline
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card 6: Site Schedules */}
                <div className="rounded-xl border border-zinc-200/80 bg-white shadow-xs p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Tours</span>
                    <div className="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
                      <HugeiconsIcon icon={Calendar01Icon} size={15} />
                    </div>
                  </div>
                  <div className="mt-3">
                    <span className="text-2xl font-bold tracking-tight text-zinc-900 font-tabular-nums">
                      {metrics.activeTours}
                    </span>
                    <div className="mt-1 text-xs font-medium text-zinc-500">
                      {metrics.toursToday > 0 ? (
                        <><span className="font-semibold text-zinc-900">{metrics.toursToday}</span> today</>
                      ) : (
                        "No tours today"
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Table 1: Recent Transactions */}
              <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white flex-1 shadow-xs">
                <div className="flex items-center justify-between p-4 md:p-5 border-b border-zinc-100">
                  <span className="text-sm font-semibold tracking-tight text-zinc-900">Recent Transactions</span>
                  <Link href="/admin/transactions">
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 active:scale-95 transition-colors">
                      <HugeiconsIcon icon={ArrowUpRight01Icon} size={15} />
                    </Button>
                  </Link>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-zinc-100 hover:bg-transparent">
                      <TableHead className="h-9 px-5 text-xs font-medium text-zinc-500">Target</TableHead>
                      <TableHead className="h-9 text-right text-xs font-medium text-zinc-500">Amount</TableHead>
                      <TableHead className="h-9 px-5 text-right text-xs font-medium text-zinc-500">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPayments.length > 0 ? recentPayments.map((payment) => (
                      <TableRow key={payment.id} className="group border-b border-zinc-100/80 transition-colors hover:bg-zinc-50/50">
                        <TableCell className="py-3 px-5">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-zinc-900">{payment.tenant}</span>
                            <span className="text-[11px] text-zinc-400 mt-0.5">{payment.target}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <span className="text-xs font-semibold text-zinc-900 font-tabular-nums">{formatCurrency(payment.amount).replace("GH", "")}</span>
                        </TableCell>
                        <TableCell className="py-3 px-5 text-right">
                          <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[11px] font-medium hover:bg-transparent border-none ${
                            payment.status === "Pending_Verification" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                          }`}>
                            {payment.status === "Pending_Verification" ? "Pending" : "Processed"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6 text-xs text-zinc-400">No recent transactions.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

          </div>

          {/* ROW 3: Published Listings (Left 2/3), Outstanding Rent (Right 1/3) */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            
            {/* Left 2/3: Table 2 - Recent Listings */}
            <div className="lg:col-span-8">
              <div className="h-full overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs">
                <div className="flex items-center justify-between p-4 md:p-5 border-b border-zinc-100">
                  <span className="text-sm font-semibold tracking-tight text-zinc-900">Recently Published</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-zinc-100 hover:bg-transparent">
                      <TableHead className="h-9 px-5 text-xs font-medium text-zinc-500">Listing</TableHead>
                      <TableHead className="h-9 px-5 text-xs font-medium text-zinc-500">Price</TableHead>
                      <TableHead className="h-9 text-xs font-medium text-zinc-500">Status</TableHead>
                      <TableHead className="h-9 text-right text-xs font-medium text-zinc-500 pr-5">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentListings.length > 0 ? recentListings.map((listing) => (
                      <TableRow key={listing.id} className="group border-b border-zinc-100/80 transition-colors hover:bg-zinc-50/50">
                        <TableCell className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-100">
                              <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-zinc-900 truncate max-w-[140px]">{listing.title}</span>
                              <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
                                 <HugeiconsIcon icon={Location01Icon} size={13} className="text-zinc-400" /> {listing.locationArea}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-5">
                          <span className="text-xs font-semibold text-zinc-900 font-tabular-nums">{formatCurrency(listing.price).replace("GH", "")}</span>
                        </TableCell>
                        <TableCell className="py-3">
                          <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[11px] font-medium hover:bg-transparent border-none ${
                            listing.status === "Available" ? "bg-emerald-50 text-emerald-700" :
                            listing.status === "Pending" ? "bg-zinc-100 text-zinc-700" :
                            "bg-zinc-100 text-zinc-600"
                          }`}>
                            {listing.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 pr-5 text-right">
                          <Link href={`/admin/properties/${listing.slug}`}>
                            <Button size="sm" variant="outline" className="h-7 px-3 text-xs font-medium text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg border-zinc-200 active:scale-[0.98] transition-colors">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-xs text-zinc-400">No recent listings.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Right 1/3: Table 3 - Due Rents */}
            <div className="lg:col-span-4">
              <div className="h-full overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs">
                <div className="flex items-center justify-between p-4 md:p-5 border-b border-zinc-100">
                  <span className="text-sm font-semibold tracking-tight text-zinc-900">Outstanding Rentals</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 active:scale-95 transition-colors">
                    <HugeiconsIcon icon={ArrowUpRight01Icon} size={15} />
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-zinc-100 hover:bg-transparent">
                      <TableHead className="h-9 px-5 text-xs font-medium text-zinc-500">Target</TableHead>
                      <TableHead className="h-9 text-right text-xs font-medium text-zinc-500">Amount Due</TableHead>
                      <TableHead className="h-9 px-5 text-right text-xs font-medium text-zinc-500">Timeline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dueRents.length > 0 ? dueRents.map((rent) => (
                      <TableRow key={rent.id} className="group border-b border-zinc-100/80 transition-colors hover:bg-zinc-50/50">
                        <TableCell className="py-3 px-5">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-zinc-900">{rent.tenant}</span>
                            <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
                               <HugeiconsIcon icon={LinkSquare01Icon} size={13} className="text-zinc-400" /> {rent.target}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <span className="text-xs font-semibold text-zinc-900 font-tabular-nums">{formatCurrency(rent.amountDue).replace("GH", "")}</span>
                        </TableCell>
                        <TableCell className="py-3 px-5 text-right">
                          <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[11px] font-medium hover:bg-transparent border-none ${
                            rent.status === "Overdue" ? "bg-rose-50 text-rose-700" :
                            rent.status === "Due_Today" ? "bg-amber-50 text-amber-700" :
                            "bg-zinc-100 text-zinc-600"
                          }`}>
                            {rent.dueDate}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )) : (
                       <TableRow>
                        <TableCell colSpan={3} className="text-center py-6 text-xs text-zinc-400">No outstanding rents.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Recently Booked Tours */}
            <div className="lg:col-span-12 h-full">
              <div className="h-full flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs">
                <div className="flex items-center justify-between p-4 md:p-5 border-b border-zinc-100">
                  <span className="text-sm font-semibold tracking-tight text-zinc-900">Recently Booked Tours</span>
                  <Button variant="ghost" size="sm" className="text-xs font-medium text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg active:scale-[0.98] transition-colors" asChild>
                    <Link href="/admin/manage/tours">View All <HugeiconsIcon icon={ArrowRight01Icon} className="ml-1 size-3" /></Link>
                  </Button>
                </div>
                <div className="flex-1 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-zinc-100 hover:bg-transparent">
                        <TableHead className="h-9 px-5 text-xs font-medium text-zinc-500">Client</TableHead>
                        <TableHead className="h-9 text-xs font-medium text-zinc-500">Property</TableHead>
                        <TableHead className="h-9 text-xs font-medium text-zinc-500">Date & Time</TableHead>
                        <TableHead className="h-9 text-xs font-medium text-zinc-500">Type</TableHead>
                        <TableHead className="h-9 px-5 text-right text-xs font-medium text-zinc-500">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTours.length > 0 ? recentTours.map((tour: any) => (
                        <TableRow key={tour.id} className="group border-b border-zinc-100/80 transition-colors hover:bg-zinc-50/50">
                          <TableCell className="py-3 px-5">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border border-zinc-200">
                                <AvatarImage src={tour.clientAvatar || ""} />
                                <AvatarFallback className="text-[11px] bg-zinc-100 font-medium text-zinc-600">{tour.clientName.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="text-xs font-semibold text-zinc-900">{tour.clientName}</span>
                                <span className="text-[11px] text-zinc-400">{tour.clientEmail}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <span className="text-xs font-medium text-zinc-900">{tour.propertyTitle}</span>
                          </TableCell>
                          <TableCell className="py-3">
                            <div className="flex flex-col">
                              <span className="text-xs font-medium text-zinc-900">{tour.tourDate}</span>
                              <span className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                                <HugeiconsIcon icon={Clock01Icon} className="size-3 text-zinc-400" /> {tour.tourTime}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge variant="outline" className="rounded-md px-2 py-0.5 text-[11px] font-medium bg-zinc-50 border-zinc-200 text-zinc-700">
                              {tour.type === "Virtual" ? "Virtual" : "In-Person"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 px-5 text-right">
                            <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[11px] font-medium hover:bg-transparent border-none ${
                              tour.status === "Confirmed" ? "bg-emerald-50 text-emerald-700" :
                              tour.status === "Pending_Time" ? "bg-amber-50 text-amber-700" :
                              "bg-zinc-100 text-zinc-600"
                            }`}>
                              {tour.status.replace("_", " ")}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      )) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-6 text-xs text-zinc-400">No recent tours booked.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Occupancy by Property Type */}
            <div className="lg:col-span-12 h-full">
              <div className="h-full flex flex-col overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs">
                <div className="flex items-center justify-between p-4 md:p-5 border-b border-zinc-100">
                  <span className="text-sm font-semibold tracking-tight text-zinc-900">Occupancy by Type</span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 active:scale-95 transition-colors">
                    <HugeiconsIcon icon={ArrowUpRight01Icon} size={15} />
                  </Button>
                </div>
                <div className="flex-1 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-zinc-100 hover:bg-transparent">
                        <TableHead className="h-9 px-5 text-xs font-medium text-zinc-500">Property Type</TableHead>
                        <TableHead className="h-9 text-right text-xs font-medium text-zinc-500">Total</TableHead>
                        <TableHead className="h-9 px-5 text-right text-xs font-medium text-zinc-500">Occupancy</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {propertyTypeStats.length > 0 ? propertyTypeStats.map((stat) => {
                        const rate = stat.total > 0 ? Math.round((stat.occupied / stat.total) * 100) : 0;
                        return (
                          <TableRow key={stat.type} className="group border-b border-zinc-100/80 transition-colors hover:bg-zinc-50/50">
                            <TableCell className="py-3 px-5">
                              <div className="flex items-center gap-2">
                                <HugeiconsIcon 
                                  icon={getPropertyIcon(stat.type)} 
                                  size={16}
                                  className="text-zinc-500" 
                                />
                                <span className="text-xs font-medium text-zinc-900">{stat.type}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-right">
                              <span className="text-xs font-semibold text-zinc-900 font-tabular-nums">{stat.total}</span>
                            </TableCell>
                            <TableCell className="py-3 px-5 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <div className="h-2 w-20 bg-zinc-100 overflow-hidden rounded-full">
                                  <div className="h-full bg-zinc-900 rounded-full transition-all duration-300" style={{ width: `${rate}%` }} />
                                </div>
                                <span className="text-xs font-semibold text-zinc-900 font-tabular-nums w-8 text-right">{rate}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      }) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-6 text-xs text-zinc-400">No property data available.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Table: Tenant Reviews */}
            <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs lg:col-span-12">
              <div className="flex items-center justify-between p-4 md:p-5 border-b border-zinc-100">
                <span className="text-sm font-semibold tracking-tight text-zinc-900">Tenant Feedback & Reviews</span>
                <Button variant="outline" size="sm" className="h-7 text-xs px-3 font-medium text-zinc-700 hover:text-zinc-900 rounded-lg border-zinc-200 active:scale-[0.98] transition-colors">
                  View Audit Log
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-zinc-100 hover:bg-transparent">
                    <TableHead className="h-9 px-5 text-xs font-medium text-zinc-500 w-[220px]">Reviewer</TableHead>
                    <TableHead className="h-9 text-xs font-medium text-zinc-500 w-[200px]">Property</TableHead>
                    <TableHead className="h-9 text-xs font-medium text-zinc-500 w-[120px]">Rating</TableHead>
                    <TableHead className="h-9 text-xs font-medium text-zinc-500">Feedback</TableHead>
                    <TableHead className="h-9 text-right text-xs font-medium text-zinc-500 w-[120px]">Date</TableHead>
                    <TableHead className="h-9 w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReviews.length > 0 ? recentReviews.map((review) => (
                    <TableRow key={review.id} className="group border-b border-zinc-100/80 transition-colors hover:bg-zinc-50/50">
                      
                      {/* Reviewer */}
                      <TableCell className="py-3.5 px-5 align-top">
                        <div className="flex items-start gap-3">
                          <Avatar className="size-8 border border-zinc-200 mt-0.5">
                            <AvatarImage src={review.user.avatar} />
                            <AvatarFallback className="text-[11px] font-medium bg-zinc-100 text-zinc-600">{review.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-xs font-semibold text-zinc-900 leading-tight">{review.user.name}</span>
                            <span className="text-[11px] text-zinc-400 mt-0.5">{review.user.email}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Property */}
                      <TableCell className="py-3.5 align-top">
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-zinc-900 truncate max-w-[180px]">{review.property.name}</span>
                          {review.property.unit && (
                            <div className="flex items-center gap-1 text-[11px] text-zinc-400 mt-0.5">
                              <HugeiconsIcon icon={Door01Icon} size={13} className="shrink-0 text-zinc-400" /> {review.property.unit}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Rating */}
                      <TableCell className="py-3.5 align-top">
                        <div className="flex flex-col gap-1">
                          {renderStars(review.rating)}
                          <span className="text-[11px] font-medium text-zinc-500 tabular-nums">
                            {review.rating}.0 / 5.0
                          </span>
                        </div>
                      </TableCell>

                      {/* Feedback */}
                      <TableCell className="py-3.5 align-top">
                        <div className="flex flex-col gap-1.5">
                          <p className="text-xs text-zinc-700 line-clamp-1 leading-relaxed truncate max-w-[280px]">
                            "{review.comment}"
                          </p>
                          {review.status === "Flagged" && (
                            <Badge variant="outline" className="w-max px-1.5 py-0 text-[10px] font-medium bg-rose-50 text-rose-700 border-rose-200">
                              Requires Attention
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Date */}
                      <TableCell className="py-3.5 text-right align-top">
                        <span className="text-xs text-zinc-400 font-tabular-nums">{review.date}</span>
                      </TableCell>

                      {/* Action */}
                      <TableCell className="py-3.5 pr-5 text-right align-top">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-7 rounded-lg text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700 active:scale-95 transition-colors">
                              <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-36 rounded-xl border-zinc-200">
                            <DropdownMenuItem className="text-xs">View Full</DropdownMenuItem>
                            <DropdownMenuItem className="text-xs">Contact Tenant</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-xs text-rose-600 focus:text-rose-700">Delete Review</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-xs text-zinc-400">No tenant feedback yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* ROW 5: Security & Hardware Events */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-xs lg:col-span-12">
              <div className="flex items-center justify-between p-4 md:p-5 border-b border-zinc-100">
                <span className="text-sm font-semibold tracking-tight text-zinc-900">Recent Security & Access Events</span>
                <Link href="/admin/smartlocks">
                  <Button variant="outline" size="sm" className="h-7 text-xs px-3 font-medium text-zinc-700 hover:text-zinc-900 rounded-lg border-zinc-200 active:scale-[0.98] transition-colors">
                    Manage Fleet
                  </Button>
                </Link>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-zinc-100 hover:bg-transparent">
                    <TableHead className="h-9 px-5 text-xs font-medium text-zinc-500">Actor</TableHead>
                    <TableHead className="h-9 px-5 text-xs font-medium text-zinc-500">Event</TableHead>
                    <TableHead className="h-9 px-5 text-xs font-medium text-zinc-500">Target Lock</TableHead>
                    <TableHead className="h-9 text-right text-xs font-medium text-zinc-500 pr-5">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentSecurityEvents && data.recentSecurityEvents.length > 0 ? data.recentSecurityEvents.map((event: any) => (
                    <TableRow key={event.id} className="group border-b border-zinc-100/80 transition-colors hover:bg-zinc-50/50">
                      <TableCell className="py-3 px-5">
                        <div className="flex items-center gap-3">
                          <Avatar className="size-8 ring-1 ring-zinc-200 shrink-0">
                            {event.avatar ? <AvatarImage src={event.avatar} alt={event.actorName} /> : null}
                            <AvatarFallback className={`text-[10px] font-bold ${event.actorRole === 'Hardware' ? 'bg-zinc-100 text-zinc-500' : 'bg-muted'}`}>
                              {event.actorRole === 'Hardware' ? 'HW' : event.actorName?.charAt(0) || 'S'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-zinc-900">{event.actorName}</span>
                              <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-medium">{event.actorRole || 'System'}</span>
                            </div>
                            {(event.actorEmail || event.actorPhone) && (
                              <div className="flex items-center gap-1.5 text-[11px] text-zinc-400 mt-0.5">
                                {event.actorEmail && <span>{event.actorEmail}</span>}
                                {event.actorEmail && event.actorPhone && <span>•</span>}
                                {event.actorPhone && <span>{event.actorPhone}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-5">
                        <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[11px] font-medium border-none ${
                          event.isAlarm ? 'bg-rose-50 text-rose-700' : 'bg-zinc-100 text-zinc-700'
                        }`}>
                          {event.action.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-5">
                        <span className="text-xs font-medium text-zinc-900">{event.lockName}</span>
                      </TableCell>
                      <TableCell className="py-3 pr-5 text-right">
                        <span className="text-[11px] text-zinc-400 font-mono">{event.timestamp}</span>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-xs text-zinc-400">No recent security events.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
