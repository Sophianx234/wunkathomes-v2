import { getDashboardData } from "@/actions/admin/dashboard.action";
import PortfolioDashboardClient from "@/components/overview-client";

export const dynamic = "force-dynamic";

export default async function Page() {
  const data = await getDashboardData();

  return <PortfolioDashboardClient data={data} />;
}
