import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getAccessLogsData } from "@/services/accesslog.service";
import AccessLogsClient, { AccessLogRecord } from "@/components/access-logs-client";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";

export const metadata = {
  title: "Access Logs | Admin Dashboard",
};

export const dynamic = "force-dynamic";

async function DataLoader() {
  const logs = await getAccessLogsData();

  // Extract unique properties for the filter dropdown
  const validProperties = logs.map((log: any) => log.property?.location).filter(Boolean);
  const uniqueProperties = Array.from(new Set(validProperties)).sort() as string[];

  return (
    <AccessLogsClient 
      data={logs as AccessLogRecord[]} 
      availableProperties={uniqueProperties}
    />
  );
}

export default async function AdminAccessLogsPage() {
  const session = await getSession();
  if (!session || !['Admin', 'Manager'].includes(session.role)) {
    redirect("/login");
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-50/50 p-6 md:p-8 font-sans">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200/60 pb-4">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
                Access & Security Logs
              </h1>
              <p className="text-sm text-zinc-500 mt-1">
                Real-time audit trail of hardware unlocks, temporary PIN issuance, and security telemetry.
              </p>
            </div>
          </div>
          <DataTableSkeleton rows={10} />
        </div>
      </div>
    }>
      <DataLoader />
    </Suspense>
  );
}
