import PropertiesClient from "@/components/properties-client";
import { connectToDatabase } from "@/config/DbConnect";
import Property from "@/models/property";
import { getPublicProperties } from "@/actions/shared/fetch-properties.action";

export const metadata = {
  title: "Properties | WunkatHomes",
  description: "Browse our exclusive portfolio of smart homes and properties.",
};

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const resolvedParams = await searchParams;
  
  const typeFilter = resolvedParams.type || "All";
  const statusFilter = resolvedParams.status || "all";
  const locationFilter = resolvedParams.location || "all";

  const { properties: inventoryData, hasMore, totalAssets } = await getPublicProperties(1, 12, {
    type: typeFilter,
    status: statusFilter,
    location: locationFilter
  });

  await connectToDatabase();
  const availableAreas = await Property.distinct("location.area");

  return (
    <PropertiesClient 
      key={JSON.stringify({ typeFilter, statusFilter, locationFilter })}
      initialInventory={inventoryData} 
      initialHasMore={hasMore} 
      initialTotalAssets={totalAssets}
      availableAreas={availableAreas} 
      initialFilters={{ typeFilter, statusFilter, locationFilter }} 
    />
  );
}
