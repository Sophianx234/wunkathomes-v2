// components/properties-grid.tsx

// Add this helper function
export function serializeListing(listing: any) {
  return {
    ...listing,
    _id: listing._id.toString(),
    propertyId: listing.propertyId
      ? {
          ...listing.propertyId,
          _id: listing.propertyId._id?.toString(),
          createdAt: listing.propertyId.createdAt?.toISOString?.() ?? listing.propertyId.createdAt,
          updatedAt: listing.propertyId.updatedAt?.toISOString?.() ?? listing.propertyId.updatedAt,
        }
      : listing.propertyId,
    createdAt: listing.createdAt?.toISOString?.() ?? listing.createdAt,
    updatedAt: listing.updatedAt?.toISOString?.() ?? listing.updatedAt,
  };
}
