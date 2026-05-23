import PropertyCard, { IProperty } from "@/components/property-card";

interface PropertiesGridProps {
  listings: IProperty[];
}

export default function PropertiesGrid({ listings }: PropertiesGridProps) {
  if (!listings.length) {
    return (
      <p className="text-slate-500 text-center py-16">
        No properties found.
      </p>
    );
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
      {listings.map((listing: IProperty, index: number) => (
        <PropertyCard
          key={listing.id}
          property={listing}
          index={index}
        />
      ))}
    </section>
  );
}