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
  Wallet02Icon
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

import { Alert, AlertDescription } from "@/components/ui/alert"
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
const formatCurrency = (amount: number) => `₵ ${amount.toLocaleString()}`

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
// Extracted from the server action return signature
type DashboardProps = {
  data: {
    metrics: any;
    recentPayments: any[];
    dueRents: any[];
    recentListings: any[];
    recentReviews: any[];
    propertyTypeStats: any[];
    assetChartData: any[];
    revenueChartData: any[];
  }
}

// --- COMPONENT ---
// Changed to accept data as props. The fetching should happen in the page.tsx wrapper.
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

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-4 lg:p-8 lg:pt-0 font-sans">
      <div className="mx-auto max-w-[1500px] space-y-6">
        
        {/* HEADER & ALERTS */}
        <div className="flex flex-col gap-4">
          {(metrics.pendingBankTransfers > 0 || metrics.pendingToursToday > 0) && (
            <Alert className="flex items-center justify-between rounded-lg border-transparent  bg-amber-50/50 pb-3 text-amber-800 ">
              <div className="flex items-center gap-3">
                <AlertDescription className="text-[13px] font-medium mt-0">
                  <span className="mr-2 font-bold tracking-tight">Requires Attention:</span>
                  {metrics.pendingBankTransfers} bank transfers await verification, and {metrics.pendingToursToday} site tours are scheduled for today.
                </AlertDescription>
              </div>
              <Link href="/admin/transactions" className="flex items-center text-[12px] font-semibold transition-opacity hover:opacity-70">
                Review Queue <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="ml-1 size-3.5" />
              </Link>
            </Alert>
          )}
        </div>

        {/* --- GRID LAYOUT --- */}
        <div className="flex flex-col gap-5">
          
          {/* ROW 1: 4 Cards (2x2), Donut Chart, Occupancy Table */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-12">
            
            {/* Left Col (4 Cards - 2x2 Grid) */}
            <div className="grid grid-cols-2 gap-5 lg:col-span-8">
              {/* Card 1: Revenue */}
              <Card className="rounded-lg border-transparent border shadow-none bg-white">
                <div className="flex flex-col p-6 h-full justify-center">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Total Revenue</span>
                    <div className="flex  items-center justify-center   ">
                      <HugeiconsIcon icon={Wallet02Icon} strokeWidth={1} className="size-10" />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col">
                    <span className="text-2xl font-bold tracking-tight text-foreground font-tabular-nums">
                      {formatCurrency(metrics.monthlyRevenue)}
                    </span>
                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                      <span className="mr-1.5 flex items-center font-medium text-emerald-600">
                        <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2.5} className="mr-0.5 size-3" />
                        {metrics.revenueTrend}%
                      </span>
                      since last month
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 2: Occupancy */}
              <Card className="rounded-lg shadow-none bg-white">
                <div className="flex flex-col p-6 h-full justify-center">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Occupied Units</span>
                    <div className="flex  items-center justify-center rounded-lg  ">
                      <HugeiconsIcon icon={House03Icon} strokeWidth={1} className="size-10" />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col">
                    <span className="text-2xl font-bold tracking-tight text-foreground font-tabular-nums">
                      {metrics.rentedListings} <span className="text-xl font-semibold text-muted-foreground">/ {metrics.totalListings}</span>
                    </span>
                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                      <span className="mr-1.5 flex items-center font-medium text-emerald-600">
                        <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={2.5} className="mr-0.5 size-3" />
                        {metrics.totalListings > 0 ? Math.round((metrics.rentedListings / metrics.totalListings) * 100) : 0}%
                      </span>
                      portfolio capacity
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 3: Unverified Funds */}
              <Card className="rounded-lg shadow-none bg-white">
                <div className="flex flex-col p-6 h-full justify-center">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Pending Verifications</span>
                    <div className="flex  items-center justify-center rounded-lg  ">
                      <HugeiconsIcon icon={BankIcon} strokeWidth={1} className="size-10" />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col">
                    <span className="text-2xl font-bold tracking-tight text-foreground font-tabular-nums">
                      {formatCurrency(metrics.unverifiedFunds)}
                    </span>
                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                      <span className="mr-1.5 flex items-center font-medium text-rose-600">
                        <HugeiconsIcon icon={ArrowDownRight01Icon} strokeWidth={2.5} className="mr-0.5 size-3" />
                        {Math.abs(metrics.unverifiedTrend)}%
                      </span>
                      pending queue reduced
                    </div>
                  </div>
                </div>
              </Card>

              {/* Card 4: Due & Arrears */}
              <Card className="rounded-lg shadow-none bg-white">
                <div className="flex flex-col p-6 h-full justify-center">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Outstanding Rent</span>
                    <div className="flex  items-center justify-center rounded-lg  ">
                      <HugeiconsIcon icon={Clock01Icon} strokeWidth={1} className="size-10" />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col">
                    <span className="text-2xl font-bold tracking-tight text-foreground font-tabular-nums">
                      {formatCurrency(metrics.outstandingRent)}
                    </span>
                    <div className="mt-2 flex items-center text-xs text-muted-foreground">
                      Across active tenancies
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Middle Col: Asset Status Donut */}
            <div className="lg:col-span-4 h-full">
              <Card className="flex flex-col h-full rounded-lg shadow-none bg-white">
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
              <Card className="flex flex-col h-full rounded-lg shadow-none bg-white">
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
                <Card className="rounded-lg shadow-none bg-white">
                  <div className="flex flex-col p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Hardware Connectivity</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground">
                        <HugeiconsIcon icon={SmartPhone01Icon} strokeWidth={2} className="size-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col">
                      <span className="text-2xl font-bold tracking-tight text-foreground font-tabular-nums">
                        {metrics.onlineLocks} <span className="text-lg font-semibold text-muted-foreground">/ {metrics.totalLocks}</span>
                      </span>
                      <div className="mt-1 flex items-center text-xs text-muted-foreground">
                        Smart lock nodes online
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Card 6: Site Schedules */}
                <Card className="rounded-lg shadow-none bg-white">
                  <div className="flex flex-col p-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Active Schedules</span>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground">
                        <HugeiconsIcon icon={Calendar01Icon} strokeWidth={2} className="size-4" />
                      </div>
                    </div>
                    <div className="mt-3 flex flex-col">
                      <span className="text-2xl font-bold tracking-tight text-foreground font-tabular-nums">
                        {metrics.activeTours}
                      </span>
                      <div className="mt-1 flex items-center text-xs text-muted-foreground">
                        <span className="mr-1 font-medium text-foreground">{metrics.toursToday}</span> tours scheduled for today
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Table 1: Recent Transactions */}
              <div className="overflow-hidden rounded-lg border border-border/60 bg-white flex-1">
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
                          <span className="text-[13px] font-semibold text-foreground font-tabular-nums">{formatCurrency(payment.amount)}</span>
                        </TableCell>
                        <TableCell className="py-3 px-5 text-right">
                          <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[10px] font-medium hover:bg-transparent ${
                            payment.status === "Pending_Verification" ? "bg-amber-50 text-amber-700 hover:bg-amber-50" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
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
              <div className="h-full overflow-hidden rounded-lg border border-border/60 bg-white">
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
                          <span className="text-[13px] font-semibold text-foreground font-tabular-nums">{formatCurrency(listing.price)}</span>
                        </TableCell>
                        <TableCell className="py-3 ">
                          <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[10px] font-medium hover:bg-transparent ${
                            listing.status === "Available" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" :
                            listing.status === "Pending" ? "bg-[#FEF08A]/50 text-amber-700 hover:bg-[#FEF08A]/50" :
                            "bg-zinc-100 text-zinc-600 hover:bg-zinc-100"
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
              <div className="h-full overflow-hidden rounded-lg border border-border/60 bg-white">
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
                          <span className="text-[13px] font-semibold text-foreground font-tabular-nums">{formatCurrency(rent.amountDue)}</span>
                        </TableCell>
                        <TableCell className="py-3 px-5 text-right">
                          <Badge variant="secondary" className={`rounded-md px-2 py-0.5 text-[10px] font-medium hover:bg-transparent ${
                            rent.status === "Overdue" ? "bg-rose-50 text-rose-700 hover:bg-rose-50" :
                            rent.status === "Due_Today" ? "bg-amber-50 text-amber-700 hover:bg-amber-50" :
                            "bg-zinc-100 text-zinc-600 hover:bg-zinc-100"
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
              <div className="h-full flex flex-col overflow-hidden rounded-lg border border-border/60 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
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
            <div className="overflow-hidden rounded-[1.25rem] lg:col-span-12 border border-border/60 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] lg:col-span-2">
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
                              <Badge variant="outline" className="w-max px-1.5 py-0 text-[9px] uppercase tracking-wider font-bold bg-zinc-100 text-zinc-700 border-zinc-200">
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
                          <DropdownMenuContent align="end" className="w-32 rounded-xl">
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