"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer 
} from "recharts";

// Mock data representing the last 6 months of cleared revenue
const data = [
  { month: "Jan", revenue: 45000 },
  { month: "Feb", revenue: 52000 },
  { month: "Mar", revenue: 48000 },
  { month: "Apr", revenue: 61000 },
  { month: "May", revenue: 59000 },
  { month: "Jun", revenue: 76000 },
];

export default function AdminOverviewPage() {
  return (
    <div className="space-y-8">
      {/* Top Nav / Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-sm font-medium">Overview</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 text-xs font-normal">
            Export CSV
          </Button>
        </div>
      </div>

      {/* Stat Grid */}
      <Card className="rounded-md border shadow-none overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
          
          <CardContent className="p-6">
            <div className="text-xs text-muted-foreground">Total Revenue</div>
            <div className="mt-2 text-2xl font-medium tracking-tight">$341,000</div>
            <div className="mt-1 text-xs text-emerald-600">+14.2%</div>
          </CardContent>

          <CardContent className="p-6">
            <div className="text-xs text-muted-foreground">Escrow Holds</div>
            <div className="mt-2 text-2xl font-medium tracking-tight">$12,500</div>
            <div className="mt-1 text-xs text-emerald-600">+5.4%</div>
          </CardContent>

          <CardContent className="p-6">
            <div className="text-xs text-muted-foreground">Occupancy Rate</div>
            <div className="mt-2 text-2xl font-medium tracking-tight">92%</div>
            <div className="mt-1 text-xs text-emerald-600">+2.1%</div>
          </CardContent>

          <CardContent className="p-6">
            <div className="text-xs text-muted-foreground">Active Holds (72h)</div>
            <div className="mt-2 text-2xl font-medium tracking-tight">14</div>
            <div className="mt-1 text-xs text-red-500">-3.0%</div>
          </CardContent>

        </div>
      </Card>

      {/* Chart Section */}
      <div className="pt-4">
        <div className="mb-6 text-xs text-muted-foreground uppercase tracking-wide">
          Revenue Dynamics
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <Tooltip 
              cursor={{ fill: 'hsl(var(--muted-foreground))', opacity: 0.1 }}
              contentStyle={{ 
                fontSize: 12, 
                border: '0.5px solid hsl(var(--border))', 
                borderRadius: '4px',
                backgroundColor: 'hsl(var(--card))',
                color: 'hsl(var(--foreground))',
                boxShadow: 'none'
              }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar 
              dataKey="revenue" 
              fill="hsl(var(--foreground))" 
              fillOpacity={0.8} 
              radius={[2, 2, 0, 0]} 
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
