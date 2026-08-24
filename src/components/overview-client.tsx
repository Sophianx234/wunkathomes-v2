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
  Rented: { label: "Rented", color: "var(--foreground)" },
  Pending: { label: "Pending", color: "var(--muted-foreground)" },
  Available: { label: "Available", color: "#FDE047" },
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
          className={star <= rating ? "fill-amber-500 text-amber-500" : "fill-muted text-muted-foreground opacity-30"} 
        />
      ))}
    </div>
  )
}

// --- COMPONENT TYPES ---
type DashboardProps = {
  data: {
    metrics: {
      monthlyRevenue: number;
      revenueTrend: number;
      rentedListings: number;
      totalListings: number;
      unverifiedFunds: number;
      unverifiedTrend: number;
      outstandingRent: number;
      totalLocks: number;
      onlineLocks: number;
      activeTours: number;
      toursToday: number;
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
    propertyTypeStats: any[];
    assetChartData: any[];
    revenueChartData: any[];
  }
}

export default function PortfolioDashboardClient({ data }: DashboardProps) {
  const [isMounted, setIsMounted] = React.useState(false)

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
      message: `There are ${metrics.urgentMaintenance} urgent maintenance request${metrics.urgentMaintenance>1&&'s'} waiting to be resolved.`,
      link: "/admin/maintenance",
      containerClass: "bg-rose-50 border-rose-200 text-rose-900",
      iconClass: "bg-rose-100 text-rose-600",
      btnClass: "bg-zinc-950 hover:bg-zinc-800 text-white border-transparent shadow-sm",
    });
  }

  // 2. Onboarding Bottlenecks (KYC & Leases)
  if (metrics.pendingKYC > 0 || metrics.pendingLeases > 0) {
    activeAlerts.push({
      id: 'onboarding',
      icon: UserIdVerificationIcon,
      title: "New Tenant Approvals",
      message: `${metrics.pendingKYC} ID verification${metrics.pendingKYC>1?'s':''} and ${metrics.pendingLeases} lease${metrics.pendingLeases>1?'s':''} need your approval before the tenants can move in.`,
      link: "/admin/manage/tenants/onboarding",
      containerClass: "bg-amber-50 border-amber-200 text-amber-900",
      iconClass: "bg-amber-100 text-amber-600",
      btnClass: "bg-zinc-950 hover:bg-zinc-800 text-white border-transparent shadow-sm",
    });
  }

  // 3. Financial Reconciliations (Bank Transfers)
  if (metrics.pendingBankTransfers > 0) {
    activeAlerts.push({
      id: 'finance',
      icon: BankIcon,
      title: "Pending Bank Transfers",
      message: `${metrics.pendingBankTransfers} bank transfer${metrics.pendingBankTransfers>1?'s':''} need to be reviewed and confirmed.`,
      link: "/admin/manage/transactions",
      containerClass: "bg-blue-50 border-blue-200 text-blue-900",
      iconClass: "bg-blue-100 text-blue-600",
      btnClass: "bg-zinc-950 hover:bg-zinc-800 text-white border-transparent shadow-sm",
    });
  }

  // 4. Daily Operations (Tours)
  if (metrics.pendingToursToday > 0) {
    activeAlerts.push({
      id: 'tours',
      icon: Calendar01Icon,
      title: "Today's Tours",
      message: `You have ${metrics.pendingToursToday} property tour${metrics.pendingToursToday>1?'s':''} happening today.`,
      link: "/admin/manage/tours",
      containerClass: "bg-zinc-100/50 border-zinc-200/60 text-zinc-900",
      iconClass: "bg-white text-zinc-600",
      btnClass: "bg-zinc-950 hover:bg-zinc-800 text-white border-transparent shadow-sm",
    });
  }

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 lg:p-8 lg:pt-0 font-sans selection:bg-zinc-200">
      <div className="mx-auto max-w-[1500px] space-y-6">
        
        {/* ========================================================= */}
        {/* DYNAMIC ALERT STACK */}
        {/* ========================================================= */}
        {activeAlerts.length > 0 && (
          <div className="flex flex-col gap-3">
            {activeAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border transition-all ${alert.containerClass}`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${alert.iconClass}`}>
                    <HugeiconsIcon icon={alert.icon} size={20} />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold tracking-tight mb-0.5">{alert.title}</h4>
                    <p className="text-[12px] font-medium opacity-90 leading-relaxed">{alert.message}</p>
                  </div>
                </div>
                <Link 
                  href={alert.link} 
                  className={`shrink-0 px-5 py-2.5 border text-[11px] font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center ${alert.btnClass}`}
                >
                  Review Action <HugeiconsIcon icon={ArrowRight01Icon} size={14} className="ml-1.5" />
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
              <Card className="rounded-lg border-transparent border shadow-none bg-white border-zinc-200/50">
                <div className="flex flex-col p-6 h-full justify-center">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Total Revenue</span>
                    <div className="flex  items-center justify-center   ">
                      <HugeiconsIcon icon={Wallet02Icon} strokeWidth={1} className="size-10 text-zinc-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col">
                    <span className="text-2xl font-bold tracking-tight text-foreground font-tabular-nums">
                      {formatCurrency(metrics.monthlyRevenue).replace("GH", "")}
                    </span>
                    {/* quik info */}
                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                      {metrics.revenueTrend > 0 ? (
                        <span className="mr-1.5 flex items-center font-medium text-emerald-600">
                          <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2.5} className="mr-0.5 size-3" />
                          {metrics.revenueTrend}%
                        </span>
                      ) : metrics.revenueTrend < 0 ? (
                        <span className="mr-1.5 flex items-center font-medium text-rose-600">
                          <HugeiconsIcon icon={ArrowDownRight01Icon} strokeWidth={2.5} className="mr-0.5 size-3" />
                          {Math.abs(metrics.revenueTrend)}%
                        </span>
                      ) : (
                        <span className="mr-1.5 flex items-center font-medium text-zinc-500">
                          0%
                        </span>
                      )}
                      since last month
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 2: Occupancy */}
              <Card className="rounded-lg shadow-none bg-white border border-zinc-200/50">
                <div className="flex flex-col p-6 h-full justify-center">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Occupied Units</span>
                    {/* quick info */}
                    <div className="flex  items-center justify-center rounded-lg  ">
                      <HugeiconsIcon icon={House03Icon} strokeWidth={1} className="size-10 text-zinc-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col">
                    <span className="text-2xl font-bold tracking-tight text-foreground font-tabular-nums">
                      {metrics.rentedListings} <span className="text-xl font-semibold text-muted-foreground">/ {metrics.totalListings}</span>
                    </span>
                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                      <span className="mr-1.5 font-medium text-emerald-600">
                        {metrics.totalListings > 0 ? Math.round((metrics.rentedListings / metrics.totalListings) * 100) : 0}%
                      </span>
                      portfolio capacity
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 3: Active Tenancies */}
              <Card className="rounded-lg shadow-none bg-white border border-zinc-200/50">
                <div className="flex flex-col p-6 h-full justify-center">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Active Tenancies</span>
                    {/* quick info */}
                    <div className="flex  items-center justify-center rounded-lg  ">
                      <HugeiconsIcon icon={Door01Icon} strokeWidth={1} className="size-10 text-zinc-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col">
                    <span className="text-2xl font-bold tracking-tight text-foreground font-tabular-nums">
                      {metrics.activeTenancies}
                    </span>
                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                      <span className="mx-1 font-medium text-foreground">{metrics.pendingLeases}</span> new application{metrics.pendingLeases === 1 ? '' : 's'} pending
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 4: Open Work Orders */}
              <Card className="rounded-lg shadow-none bg-white border border-zinc-200/50">
                <div className="flex flex-col p-6 h-full justify-center">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Open Work Orders</span>
                    {/* quick info */}
                    <div className="flex  items-center justify-center rounded-lg  ">
                      <HugeiconsIcon icon={Wrench01Icon} strokeWidth={1} className="size-10 text-zinc-400" />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col">
                    <span className="text-2xl font-bold tracking-tight text-foreground font-tabular-nums">
                      {metrics.openWorkOrders}
                    </span>
                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                      <span className="mx-1 font-medium text-rose-600">{metrics.urgentMaintenance}</span> require{metrics.urgentMaintenance === 1 ? 's' : ''} urgent attention
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Middle Col: Asset Status Donut */}
            <div className="lg:col-span-4 h-full">
              <Card className="flex flex-col h-full rounded-lg shadow-none bg-white border border-zinc-200/50">
                <div className="p-6 pb-0">
                  <span className="text-sm font-medium text-foreground">Subscriptions & Assets</span>
                </div>
                <CardContent className="flex flex-1 flex-col justify-center px-6 pb-6 pt-4">
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
                                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-foreground text-3xl font-bold font-tabular-nums">
                                      {totalAssets}
                                    </tspan>
                                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 20} className="fill-muted-foreground text-[10px] font-medium tracking-wide">
                                      Total Assets
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
                    {assetChartData.map((item) => (
                      <div key={item.status} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="size-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                          <span className="font-medium text-muted-foreground">{item.status}</span>
                        </div>
                        <span className="font-semibold text-foreground">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ROW 2: Bar Chart (Left 2/3), Remaining Mini Cards & Transactions Table (Right 1/3) */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            
            {/* Left 2/3: Revenue Chart */}
            <div className="lg:col-span-8 h-full">
              <Card className="flex flex-col h-full rounded-lg shadow-none bg-white border border-zinc-200/50">
                <div className="flex items-center justify-between p-6 pb-2">
                  <span className="text-sm font-medium text-foreground">Sales dynamics</span>
                  <Select defaultValue="2026">
                    <SelectTrigger className="h-7 w-[80px] border-none shadow-none text-xs font-medium focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2026">2026</SelectItem>
                      <SelectItem value="2025">2025</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <CardContent className="flex-1 px-6 pb-6 pt-2">
                  <div className="h-[260px] w-full">
                    <ChartContainer config={revenueChartConfig} className="h-full w-full">
                      <BarChart data={revenueChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                        <XAxis 
                          dataKey="month" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 500 }} 
                          dy={10} 
                        />
                        <YAxis 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 10, fill: 'var(--muted-foreground)', fontWeight: 500 }} 
                          tickFormatter={(value) => `${value / 1000}k`}
                        />
                        <ChartTooltip cursor={{ fill: 'var(--muted)' }} content={<ChartTooltipContent />} />
                        <Bar dataKey="Paystack" stackId="a" fill="var(--color-Paystack)" radius={[0, 0, 4, 4]} maxBarSize={12} />
                        <Bar dataKey="Bank_Transfer" stackId="a" fill="var(--color-Bank_Transfer)" radius={[4, 4, 0, 0]} maxBarSize={12} />
                      </BarChart>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right 1/3: 2 Mini Cards + Transactions Table */}
            <div className="lg:col-span-4 flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-5">
                {/* Card 5: Smart Locks */}
                <Card className="rounded-lg shadow-none bg-white border border-zinc-200/50">
                  <div className="flex flex-col p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Smart Locks</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground">
                        <HugeiconsIcon icon={Shield02Icon} strokeWidth={2} className="size-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col">
                      <span className="text-2xl font-bold tracking-tight text-foreground font-tabular-nums">
                        {metrics.totalLocks}
                      </span>
                      <div className="mt-1 flex items-center gap-2 text-[11px] font-medium">
                        <span className="flex items-center text-emerald-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1"></span>
                          {metrics.onlineLocks} Online
                        </span>
                        <span className="flex items-center text-rose-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 mr-1"></span>
                          {metrics.offlineLocks} Offline
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Card 6: Site Schedules */}
                <Card className="rounded-lg shadow-none bg-white border border-zinc-200/50">
                  <div className="flex flex-col p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Tours</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground">
                        <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} className="size-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col">
                      <span className="text-2xl font-bold tracking-tight text-foreground font-tabular-nums">
                        {metrics.activeTours}
                      </span>
                      <div className="mt-1 flex items-center text-[11px] font-medium text-muted-foreground">
                        <span className="mr-1 font-bold text-foreground">{metrics.toursToday}</span> today
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Table 1: Recent Transactions */}
              <div className="overflow-hidden rounded-lg border border-border/60 bg-white flex-1 shadow-sm">
                <div className="flex items-center justify-between p-5 border-b border-border/40">
                  <span className="text-sm font-medium text-foreground">Recent Transactions</span>
                  <Link href="/admin/transactions">
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                      <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} className="size-3.5" />
                    </Button>
                  </Link>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/40 hover:bg-transparent">
                      <TableHead className="h-10 px-5 text-xs font-medium text-muted-foreground">Target</TableHead>
                      <TableHead className="h-10 text-right text-xs font-medium text-muted-foreground">Amount</TableHead>
                      <TableHead className="h-10 px-5 text-right text-xs font-medium text-muted-foreground">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentPayments.length > 0 ? recentPayments.map((payment) => (
                      <TableRow key={payment.id} className="group border-b border-border/40 transition-colors hover:bg-muted/30">
                        <TableCell className="py-3 px-5">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-medium text-foreground">{payment.tenant}</span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">{payment.target}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <span className="text-[13px] font-semibold text-foreground font-tabular-nums">{formatCurrency(payment.amount).replace("GH", "")}</span>
                        </TableCell>
                        <TableCell className="py-3 px-5 text-right">
                          <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[10px] font-medium hover:bg-transparent border-none ${
                            payment.status === "Pending_Verification" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"
                          }`}>
                            {payment.status === "Pending_Verification" ? "Pending" : "Processed"}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-6 text-xs text-muted-foreground">No recent transactions.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

          </div>

          {/* ROW 3: Published Listings (Left 2/3), Outstanding Rent (Right 1/3) */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            
            {/* Left 2/3: Table 3 - Recent Listings */}
            <div className="lg:col-span-8">
              <div className="h-full overflow-hidden rounded-lg border border-border/60 bg-white shadow-sm">
                <div className="flex items-center justify-between p-5 border-b border-border/40">
                  <span className="text-sm font-medium text-foreground">Recently Published</span>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/40 hover:bg-transparent">
                      <TableHead className="h-10 px-5 text-xs font-medium text-muted-foreground">Listing</TableHead>
                      <TableHead className="h-10 px-5 text-xs font-medium text-muted-foreground">Price</TableHead>
                      <TableHead className="h-10  text-xs font-medium text-muted-foreground">Status</TableHead>
                      <TableHead className="h-10  text-right text-xs font-medium text-muted-foreground ">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentListings.length > 0 ? recentListings.map((listing) => (
                      <TableRow key={listing.id} className="group border-b border-border/40 transition-colors hover:bg-muted/30">
                        <TableCell className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 shrink-0 overflow-hidden rounded-md border border-border/60 bg-muted">
                              <img src={listing.image} alt={listing.title} className="h-full w-full object-cover" />
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-medium text-foreground truncate max-w-[120px]">{listing.title}</span>
                              <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                                 <HugeiconsIcon icon={Location01Icon} strokeWidth={2} className="size-3" /> {listing.locationArea}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 px-5">
                          <span className="text-[13px] font-semibold text-foreground font-tabular-nums">{formatCurrency(listing.price).replace("GH", "")}</span>
                        </TableCell>
                        <TableCell className="py-3 ">
                          <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[10px] font-medium hover:bg-transparent border-none ${
                            listing.status === "Available" ? "bg-emerald-50 text-emerald-700" :
                            listing.status === "Pending" ? "bg-amber-50 text-amber-700" :
                            "bg-zinc-100/50 text-zinc-600"
                          }`}>
                            {listing.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 pr-5 text-right">
                          <Link href={`/admin/properties/${listing.slug}`}>
                            <Button   className="bg-white px-0 border rounded-lg text-sm text-muted-foreground hover:bg-white hover:text-foreground">
                              View
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    )) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-6 text-xs text-muted-foreground">No recent listings.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Right 1/3: Table 2 - Due Rents */}
            <div className="lg:col-span-4">
              <div className="h-full overflow-hidden rounded-lg border border-border/60 bg-white shadow-sm">
                <div className="flex items-center justify-between p-5 border-b border-border/40">
                  <span className="text-sm font-medium text-foreground">Outstanding Rentals</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                    <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} className="size-3.5" />
                  </Button>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-border/40 hover:bg-transparent">
                      <TableHead className="h-10 px-5 text-xs font-medium text-muted-foreground">Target</TableHead>
                      <TableHead className="h-10 text-right text-xs font-medium text-muted-foreground">Amount Due</TableHead>
                      <TableHead className="h-10 px-5 text-right text-xs font-medium text-muted-foreground">Timeline</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dueRents.length > 0 ? dueRents.map((rent) => (
                      <TableRow key={rent.id} className="group border-b border-border/40 transition-colors hover:bg-muted/30">
                        <TableCell className="py-3 px-5">
                          <div className="flex flex-col">
                            <span className="text-[13px] font-medium text-foreground">{rent.tenant}</span>
                            <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                               <HugeiconsIcon icon={LinkSquare01Icon} strokeWidth={2} className="size-3" /> {rent.target}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-right">
                          <span className="text-[13px] font-semibold text-foreground font-tabular-nums">{formatCurrency(rent.amountDue).replace("GH", "")}</span>
                        </TableCell>
                        <TableCell className="py-3 px-5 text-right">
                          <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[10px] font-medium hover:bg-transparent border-none ${
                            rent.status === "Overdue" ? "bg-rose-50 text-rose-700" :
                            rent.status === "Due_Today" ? "bg-amber-50 text-amber-700" :
                            "bg-zinc-100/50 text-zinc-600"
                          }`}>
                            {rent.dueDate}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )) : (
                       <TableRow>
                        <TableCell colSpan={3} className="text-center py-6 text-xs text-muted-foreground">No outstanding rents.</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
            
            {/* Right Col: Table 4 - Occupancy by Property Type */}
            <div className="lg:col-span-12 h-full">
              <div className="h-full flex flex-col overflow-hidden rounded-lg border border-border/60 bg-white shadow-sm">
                <div className="flex items-center justify-between p-5 border-b border-border/40">
                  <span className="text-sm font-medium text-foreground">Occupancy by Type</span>
                  <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground">
                    <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2} className="size-3.5" />
                  </Button>
                </div>
                <div className="flex-1 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-b border-border/40 hover:bg-transparent">
                        <TableHead className="h-10 px-5 text-xs font-medium text-muted-foreground">Property Type</TableHead>
                        <TableHead className="h-10 text-right text-xs font-medium text-muted-foreground">Total</TableHead>
                        <TableHead className="h-10 px-5 text-right text-xs font-medium text-muted-foreground">Occupancy</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {propertyTypeStats.length > 0 ? propertyTypeStats.map((stat) => {
                        const rate = stat.total > 0 ? Math.round((stat.occupied / stat.total) * 100) : 0;
                        return (
                          <TableRow key={stat.type} className="group border-b border-border/40 transition-colors hover:bg-muted/30">
                            <TableCell className="py-3 px-5">
                              <div className="flex items-center gap-2">
                                <HugeiconsIcon 
                                  icon={getPropertyIcon(stat.type)} 
                                  strokeWidth={2} 
                                  className="size-4 text-muted-foreground" 
                                />
                                <span className="text-[13px] font-medium text-foreground">{stat.type}</span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3 text-right">
                              <span className="text-[13px] font-semibold text-foreground font-tabular-nums">{stat.total}</span>
                            </TableCell>
                            <TableCell className="py-3 px-5 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <div className="h-1.5 w-16 bg-muted overflow-hidden rounded-full">
                                  <div className="h-full bg-zinc-950 rounded-full" style={{ width: `${rate}%` }} />
                                </div>
                                <span className="text-[12px] font-medium text-muted-foreground font-tabular-nums w-8 text-right">{rate}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      }) : (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-6 text-xs text-muted-foreground">No property data available.</TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            {/* Table 4: Tenant Reviews */}
            <div className="overflow-hidden rounded-lg lg:col-span-12 border border-border/60 bg-white shadow-sm lg:col-span-2">
              <div className="flex items-center justify-between p-5 border-b border-border/40">
                <span className="text-sm font-medium text-foreground">Tenant Feedback & Reviews</span>
                <Button variant="ghost" size="sm" className="h-7 text-[11px] px-3 font-medium text-muted-foreground border border-border/50">
                  View Audit Log
                </Button>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/40 hover:bg-transparent">
                    <TableHead className="h-10 px-5 text-xs font-medium text-muted-foreground w-[220px]">Reviewer</TableHead>
                    <TableHead className="h-10 text-xs font-medium text-muted-foreground w-[200px]">Property</TableHead>
                    <TableHead className="h-10 text-xs font-medium text-muted-foreground w-[120px]">Rating</TableHead>
                    <TableHead className="h-10 text-xs font-medium text-muted-foreground">Feedback</TableHead>
                    <TableHead className="h-10 text-right text-xs font-medium text-muted-foreground w-[120px]">Date</TableHead>
                    <TableHead className="h-10 w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentReviews.length > 0 ? recentReviews.map((review) => (
                    <TableRow key={review.id} className="group border-b border-border/40 transition-colors hover:bg-muted/30">
                      
                      {/* 1. Reviewer Column */}
                      <TableCell className="py-4 px-5 align-top">
                        <div className="flex items-start gap-3">
                          <Avatar className="size-8 border border-border/60 shadow-sm mt-0.5">
                            <AvatarImage src={review.user.avatar} />
                            <AvatarFallback className="text-[10px] font-medium bg-muted text-muted-foreground">{review.user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-[13px] font-medium text-foreground leading-tight">{review.user.name}</span>
                            <span className="text-[11px] text-muted-foreground mt-0.5">{review.user.email}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* 2. Property Column */}
                      <TableCell className="py-4 align-top">
                        <div className="flex flex-col">
                          <span className="text-[12px] font-semibold text-foreground truncate max-w-[180px]">{review.property.name}</span>
                          {review.property.unit && (
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
                              <HugeiconsIcon icon={Door01Icon} strokeWidth={2} className="size-3 shrink-0" /> {review.property.unit}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* 3. Rating Column */}
                      <TableCell className="py-4 align-top">
                        <div className="flex flex-col gap-1.5">
                          {renderStars(review.rating)}
                          <span className="text-[11px] font-medium text-muted-foreground tabular-nums">
                            {review.rating}.0 / 5.0
                          </span>
                        </div>
                      </TableCell>

                      {/* 4. Feedback Column */}
                      <TableCell className="py-4 align-top">
                        <div className="flex items-start gap-2">
                          <div className="flex flex-col gap-2">
                            <p className="text-[12px] text-foreground line-clamp-1 leading-relaxed truncate max-w-[250px]">
                              "{review.comment}"
                            </p>
                            {review.status === "Flagged" && (
                              <Badge variant="outline" className="w-max px-1.5 py-0 text-[9px] uppercase tracking-wider font-bold bg-zinc-100/50 text-zinc-700 border-zinc-200/60">
                                Requires Attention
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      {/* 5. Date Column */}
                      <TableCell className="py-4 text-right align-top">
                        <span className="text-[12px] text-muted-foreground font-tabular-nums">{review.date}</span>
                      </TableCell>

                      {/* 6. Action Column */}
                      <TableCell className="py-4 pr-5 text-right align-top">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="size-7 text-muted-foreground hover:bg-muted hover:text-foreground">
                              <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={2} className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-32 rounded-lg">
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
                      <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">No tenant feedback yet.</TableCell>
                      <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">No tenant feedback yet.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* ROW 5: Security & Hardware Events */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="overflow-hidden rounded-lg lg:col-span-12 border border-border/60 bg-white shadow-sm">
              <div className="flex items-center justify-between p-5 border-b border-border/40">
                <span className="text-sm font-medium text-foreground">Recent Security & Access Events</span>
                <Link href="/admin/smartlocks">
                  <Button variant="ghost" size="sm" className="h-7 text-[11px] px-3 font-medium text-muted-foreground border border-border/50">
                    Manage Fleet
                  </Button>
                </Link>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border/40 hover:bg-transparent">
                    <TableHead className="h-10 px-5 text-xs font-medium text-muted-foreground">Actor</TableHead>
                    <TableHead className="h-10 px-5 text-xs font-medium text-muted-foreground">Event</TableHead>
                    <TableHead className="h-10 px-5 text-xs font-medium text-muted-foreground">Target Lock</TableHead>
                    <TableHead className="h-10 text-right text-xs font-medium text-muted-foreground pr-5">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.recentSecurityEvents && data.recentSecurityEvents.length > 0 ? data.recentSecurityEvents.map((event: any) => (
                    <TableRow key={event.id} className="group border-b border-border/40 transition-colors hover:bg-muted/30">
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
                              <span className="text-[13px] font-semibold text-foreground">{event.actorName}</span>
                              <span className="text-[9px] text-muted-foreground uppercase tracking-wider font-medium">{event.actorRole || 'System'}</span>
                            </div>
                            {(event.actorEmail || event.actorPhone) && (
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground mt-0.5">
                                {event.actorEmail && <span>{event.actorEmail}</span>}
                                {event.actorEmail && event.actorPhone && <span>•</span>}
                                {event.actorPhone && <span>{event.actorPhone}</span>}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-5">
                        <Badge variant="secondary" className={`rounded px-1.5 py-0.5 text-[10px] font-bold border-none tracking-wider ${
                          event.isAlarm ? 'bg-rose-100 text-rose-700' : 'bg-zinc-100/50 text-zinc-700'
                        }`}>
                          {event.action.replace(/_/g, ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3 px-5">
                        <span className="text-[12px] font-medium text-foreground">{event.lockName}</span>
                      </TableCell>
                      <TableCell className="py-3 pr-5 text-right">
                        <span className="text-[11px] text-muted-foreground font-mono">{event.timestamp}</span>
                      </TableCell>
                    </TableRow>
                  )) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-xs text-muted-foreground">No recent security events.</TableCell>
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
