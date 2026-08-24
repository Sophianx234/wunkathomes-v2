import {
  ArrowUpDown,
  Bathtub01Icon,
  BedSingle02Icon,
  Building03Icon,
  Car01Icon,
  CctvCameraIcon,
  CheckmarkBadge01Icon,
  DropletIcon,
  Dumbbell01Icon,
  ElectricTower02FreeIcons,
  Key01Icon,
  Landmark,
  Location01Icon,
  MaximizeIcon,
  Restaurant01Icon,
  Shield01Icon,
  SnowIcon,
  StarIcon,
  SwimmingIcon,
  Wifi01Icon,
  WindowsNewIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { connectToDatabase } from "@/config/DbConnect";
import Review from "@/models/review";

import BookingCard from "@/components/booking-card";
import ImageGallery from "@/components/image-gallery";
import { PropertyMap } from "@/components/property-map-dynamic";
import SimilarCarousel from "@/components/similar-carousel";
import ThingsToKnow from "@/components/things-to-know";
import ReviewForm from "@/components/review-form";
import { getNeighborhoodDescription } from "@/lib/helpers";
import { Toaster } from "@/components/ui/sonner";
import SavePropertyButton from "@/components/ui/saved-property-button";
import Listing from "@/models/listing";
import "@/models/property";
import "@/models/user";
import { IProperty } from "@/components/property-card";
import { getSession, SessionPayload } from "@/lib/session";
import SavedProperty from "@/models/saved";
interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

const AMENITY_ICONS: Record<string, any> = {
  "Air Conditioning": SnowIcon,
  "Swimming Pool": SwimmingIcon,
  "Backup Generator": ElectricTower02FreeIcons,
  "24/7 Security": Shield01Icon,
  "Water Tank (Polytank)": DropletIcon,
  "Fitted Kitchen": Restaurant01Icon,
  "Parking Space": Car01Icon,
  Gym: Dumbbell01Icon,
  "Wi-Fi": Wifi01Icon,
  Balcony: WindowsNewIcon,
  "CCTV Surveillance": CctvCameraIcon,
  Elevator: ArrowUpDown,
};

const formatLocation = (locationObj: any) => {
  if (!locationObj) return "Unknown Location";
  return locationObj.city
    ? `${locationObj.area}, ${locationObj.city}`
    : `${locationObj.area}, ${locationObj.region}`;
};

export const mapToIProperty = (
  doc: any,
): IProperty & { property: { generalAmenities: string[] } } => ({
  id: doc._id.toString(),
  slug: doc.slug,
  listingType: doc.listingType,
  status: doc.status,
  price: doc.price,
  title: doc.title,
  description: doc.description,
  features: {
    bedrooms: doc.features?.bedrooms ?? 0,
    bathrooms: doc.features?.bathrooms ?? 0,
    sizeSqm: doc.features?.sizeSqm ?? 0,
  },
  terms: {
    leaseTerm: doc.terms?.leaseTerm ?? null,
  },
  smartLock: {
    hasSmartLock: doc.smartLock?.hasSmartLock ?? false,
    accessInstructions: doc.smartLock?.accessInstructions,
  },
  images: doc.images ?? [],
  createdAt: doc.createdAt,
  updatedAt: doc.updatedAt,
  property: {
    propertyType: doc.propertyId?.propertyType ?? "Unknown",
    location: formatLocation(doc.propertyId?.location),
    coordinates: doc.propertyId?.coordinates
      ? {
          lat: doc.propertyId.coordinates.lat,
          lng: doc.propertyId.coordinates.lng,
        }
      : undefined,
    landmarks: doc.propertyId?.landmarks ?? [],
    generalAmenities: doc.propertyId?.generalAmenities ?? [],
  },
});

async function getListingData(slug: string) {
  await connectToDatabase();
  const rawListing = await Listing.findOne({ slug })
    .populate("propertyId")
    .lean();
  if (!rawListing) return { listing: null, similar: [], reviews: [] };

  const rawSimilar = await Listing.find({
    listingType: rawListing.listingType,
    slug: { $ne: slug },
  })
    .populate("propertyId")
    .limit(5)
    .lean();

  const rawReviews = await Review.find({ listingId: rawListing._id })
    .populate("userId", "name")
    .sort({ createdAt: -1 })
    .lean();

  const serializedReviews = rawReviews.map((r) => ({
    id: r._id.toString(),
    rating: r.rating,
    comment: r.comment,
    date: r.createdAt,
    userName: r.userId?.name || "Verified Guest",
  }));

  return {
    listing: mapToIProperty(rawListing),
    similar: rawSimilar.map(mapToIProperty),
    reviews: serializedReviews,
  };
}

export default async function PropertyDetailsPage({
  params,
}: PropertyPageProps) {
  const { slug } = await params;
  const { listing, similar, reviews } = await getListingData(slug);
  const session = (await getSession()) as SessionPayload;

  if (!listing) notFound();
  let isSaved = false;
  if (session && session.userId && listing.id) {
    const existingSave = await SavedProperty.findOne({
      user: session.userId,
      property: listing.id, // Assuming listing.id is the MongoDB ObjectId for this listing
    }).lean();

    if (existingSave) {
      isSaved = true;
    }
  }

  const isRent = listing.listingType === "For_Rent";

  const reviewCount = reviews.length;
  const averageRating =
    reviewCount > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount
        ).toFixed(2)
      : "New";

  return (
    <main className="min-h-screen bg-white text-black pt-24 pb-32">
      <div className="max-w-6xl mx-auto">
        <ImageGallery images={listing.images} title={listing.title} />
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 mt-12">
        <div className="lg:col-span-8 flex flex-col pb-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-[1.1] mb-4">
              {listing.title}
            </h1>
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap items-center gap-4 text-sm font-bold uppercase tracking-widest text-zinc-500">
                <span className="flex items-center gap-1.5 text-black">
                  <HugeiconsIcon
                    icon={StarIcon}
                    size={16}
                    className={reviewCount > 0 ? "fill-black" : ""}
                  />
                  {averageRating}{" "}
                  {reviewCount > 0 && `· ${reviewCount} Reviews`}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={Location01Icon} size={16} />
                  {listing.property.location}
                </span>
              </div>
              <div className="mt-2 shrink-0">
                <SavePropertyButton
                  propertyId={listing.id || listing.slug}
                  initialIsSaved={isSaved}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between py-6 border-y border-black/10 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white">
                <HugeiconsIcon icon={Building03Icon} size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">
                  Managed by WunkatHomes
                </h3>
                <p className="text-sm font-medium text-zinc-500">
                  Verified Property • No Agent Fees
                </p>
              </div>
            </div>
            <HugeiconsIcon
              icon={CheckmarkBadge01Icon}
              size={28}
              className="text-green-600"
            />
          </div>

          <div className="flex flex-wrap gap-6 mb-10">
            {[
              {
                icon: BedSingle02Icon,
                label: `${listing.features.bedrooms} Bedrooms`,
              },
              {
                icon: Bathtub01Icon,
                label: `${listing.features.bathrooms} Baths`,
              },
              ...(listing.features.sizeSqm
                ? [
                    {
                      icon: MaximizeIcon,
                      label: `${listing.features.sizeSqm} Sqm`,
                    },
                  ]
                : []),
              {
                icon: listing.smartLock.hasSmartLock ? Key01Icon : Shield01Icon,
                label: listing.smartLock.hasSmartLock
                  ? "Smart Lock"
                  : "Secure Entry",
              },
            ].map((metric, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-black"
              >
                <HugeiconsIcon
                  icon={metric.icon}
                  size={20}
                  className="text-zinc-400"
                />
                {metric.label}
              </div>
            ))}
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-black uppercase tracking-widest mb-4">
              About This Property
            </h2>
            <p className="text-zinc-600 text-base md:text-lg leading-relaxed font-medium whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          {listing.property.generalAmenities &&
            listing.property.generalAmenities.length > 0 && (
              <div className="mb-12 pt-10 border-t border-black/10">
                <h2 className="text-xl font-black uppercase tracking-widest mb-6">
                  Amenities & Features
                </h2>
                <div className="flex flex-wrap gap-3">
                  {listing.property.generalAmenities.map((amenity, idx) => {
                    const IconComponent =
                      AMENITY_ICONS[amenity] || CheckmarkBadge01Icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-zinc-200/60 text-sm font-bold text-zinc-700 bg-zinc-50/50"
                      >
                        <HugeiconsIcon
                          icon={IconComponent}
                          size={16}
                          className="text-zinc-400"
                        />
                        {amenity}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          <div className="mb-12 pt-10 border-t border-black/10">
            <h2 className="text-xl font-black uppercase tracking-widest mb-6">
              Neighborhood & Location
            </h2>
            <PropertyMap
              lat={listing.property.coordinates?.lat}
              lng={listing.property.coordinates?.lng}
            />
            <h3 className="font-bold text-lg mb-2">
              {listing.property.location}
            </h3>
            <p className="text-zinc-600 font-medium">
              {getNeighborhoodDescription(listing.property)}
            </p>
          </div>

          {/* === REVIEWS SECTION === */}
          <div className="pt-10 border-t border-black/10">
            <div className="flex items-center justify-between gap-2 mb-8">
              <div className="flex items-center gap-2">
                {reviewCount > 0 && (
                  <HugeiconsIcon
                    icon={StarIcon}
                    size={24}
                    className={reviewCount > 0 ? "fill-black" : ""}
                  />
                )}
                <h2 className="text-2xl font-black uppercase tracking-tight">
                  {reviewCount > 0
                    ? `${averageRating} · ${reviewCount} Reviews`
                    : "No Reviews Yet"}
                </h2>
              </div>
            </div>

            {/* Review Form controls its own toggle view automatically */}
            <ReviewForm listingId={listing.id} />

            {reviewCount > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                {reviews.map((review) => (
                  <div key={review.id} className="flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center font-black text-zinc-500">
                        {review.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          {review.userName}
                          <span className="flex text-black">
                            <HugeiconsIcon
                              icon={StarIcon}
                              size={12}
                              className="fill-black"
                            />
                            <span className="ml-1 leading-none">
                              {review.rating}
                            </span>
                          </span>
                        </div>
                        <div className="text-xs text-zinc-500 font-medium">
                          {new Date(review.date).toLocaleDateString("en-US", {
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-zinc-700 text-sm leading-relaxed">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-zinc-500 text-sm">
                Be the first to review this property!
              </p>
            )}
          </div>
        </div>

        <BookingCard listing={listing} isRent={isRent} />
      </section>

      <ThingsToKnow
        isRent={isRent}
        propertyType={listing.property.propertyType}
      />

      {similar.length > 0 && (
        <SimilarCarousel
          similar={similar}
          propertyType={listing.property.propertyType}
        />
      )}

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black p-4 flex items-center justify-between z-50 lg:hidden">
        <div>
          <div className="text-xl font-black">
            ${listing.price.toLocaleString()}
            <span className="text-sm font-medium text-zinc-500">
              {listing.listingType === "For_Rent" ? (listing.roomType === "Furnished" ? " /day" : " /month") : ""}
            </span>
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
            {isRent ? "Monthly Rent" : "Purchase Price"}
          </div>
        </div>
        <Link href={`/checkout/${listing.slug}?type=deposit`}>
          <button className="px-6 py-3 bg-black text-white font-black uppercase tracking-widest text-[10px] rounded hover:bg-zinc-800 transition-colors">
            {isRent ? "Reserve Now" : "Reserve to Buy"}
          </button>
        </Link>
      </div>
      <Toaster position="top-right" />
    </main>
  );
}
