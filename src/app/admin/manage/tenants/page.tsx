import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getTenantsData } from "@/services/tenant.service";
import TenantDirectoryClient, { TenantRecord } from "@/components/tenant-directory-client";
import { DataTableSkeleton } from "@/components/ui/data-table-skeleton";

export const metadata = {
  title: "Tenant Directory | Admin Dashboard",
};

export const dynamic = "force-dynamic";

async function DataLoader({ tab }: { tab: "all" | "pending" | "active" }) {
  const unifiedData = await getTenantsData();

  const validTenants = unifiedData.filter((t: any) => t.user.id);
  const uniqueProperties = Array.from(new Set(validTenants.map((a: any) => a.lease.propertyName))).sort() as string[];

  return (
    <TenantDirectoryClient 
      data={validTenants as TenantRecord[]} 
      availableProperties={uniqueProperties}
      initialTab={tab}
    />
  );
}

export default async function AdminTenantsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await getSession();
  if (!session || !['Admin', 'Manager'].includes(session.role)) {
    redirect("/login");
  }

  const resolvedParams = await searchParams;
  const initialTab = (resolvedParams.tab as "all" | "pending" | "active") || "active";

  return (
    <Suspense key={initialTab} fallback={
      <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200/60 pb-4">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Tenant Directory
            </h1>
          </div>
          <DataTableSkeleton rows={10} />
        </div>
      </div>
    }>
      <DataLoader tab={initialTab} />
    </Suspense>
  );
}
