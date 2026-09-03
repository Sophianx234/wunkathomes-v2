import { Suspense } from "react";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getTenantsData } from "@/services/tenant.service";
import TenantEditClient from "@/components/tenant-edit-client";

export const metadata = {
  title: "Onboard Tenant | Admin Dashboard",
};

export const dynamic = "force-dynamic";

async function DataLoader({ id }: { id: string }) {
  const unifiedData = await getTenantsData();
  const tenant = unifiedData.find((t: any) => t.id === id);

  if (!tenant) {
    redirect("/admin/manage/tenants");
  }

  return (
    <TenantEditClient tenant={tenant} />
  );
}

export default async function TenantOnboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await getSession();
  if (!session || !['Admin', 'Manager'].includes(session.role)) {
    redirect("/login");
  }

  const resolvedParams = await params;

  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans flex items-center justify-center">
        <p className="text-zinc-500 text-sm font-medium animate-pulse">Loading Onboarding Flow...</p>
      </div>
    }>
      <DataLoader id={resolvedParams.id} />
    </Suspense>
  );
}
