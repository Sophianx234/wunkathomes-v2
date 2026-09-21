import { getDashboardData } from "@/actions/admin/dashboard.action";
import PortfolioDashboardClient from "@/components/overview-client";

export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const resolvedParams = await searchParams;
  const year = resolvedParams.year ? parseInt(resolvedParams.year, 10) : new Date().getFullYear();
  
  const data = await getDashboardData(year);

  return <PortfolioDashboardClient data={data} selectedYear={year} />;
}
