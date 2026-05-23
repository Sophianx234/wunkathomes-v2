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
  Location01Icon,
  MaximizeIcon,
  Restaurant01Icon,
  Shield01Icon,
  SnowIcon,
  StarIcon,
  SwimmingIcon,
  Wifi01Icon,
  WindowsNewIcon
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { connectToDatabase } from "@/config/DbConnect"
import Listing from "@/models/listing"
import Review from "@/models/review"
import '@/models/user'
import { IProperty } from "@/types"

import BookingCard from "@/components/booking-card"
import ImageGallery from "@/components/image-gallery"
import { PropertyMap } from "@/components/property-map-dynamic"
import SimilarCarousel from "@/components/similar-carousel"
import ThingsToKnow from "@/components/things-to-know"
import ReviewForm from "@/components/review-form" // Ensure this exists
import { formatLeaseTerm } from "@/lib/helpers"
import { Toaster } from "@/components/ui/sonner"

interface PropertyPageProps {
  params: Promise<{ slug: string }>
}

// 1. Map Amenity Strings to their HugeIcon equivalents
const AMENITY_ICONS: Record<string, any> = {
  "Air Conditioning": SnowIcon,
  "Swimming Pool": SwimmingIcon,
  "Backup Generator": ElectricTower02FreeIcons,
  "24/7 Security": Shield01Icon,
  "Water Tank (Polytank)": DropletIcon,
  "Fitted Kitchen": Restaurant01Icon,
  "Parking Space": Car01Icon,
  "Gym": Dumbbell01Icon,
  "Wi-Fi": Wifi01Icon,
  "Balcony": WindowsNewIcon,
  "CCTV Surveillance": CctvCameraIcon,
  "Elevator": ArrowUpDown,
};

// Helper to format the nested Mongoose location object into a clean string for the UI
const formatLocation = (locationObj: any) => {
  if (!locationObj) return "Unknown Location";
  return locationObj.city 
    ? `${locationObj.area}, ${locationObj.city}` 
    : `${locationObj.area}, ${locationObj.region}`;
};

// Helper to serialize raw MongoDB documents into strict IProperty objects
const mapToIProperty = (doc: any): IProperty & { property: { generalAmenities: string[] } } => ({
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
    coordinates: doc.propertyId?.coordinates ? {
      lat: doc.propertyId.coordinates.lat,
      lng: doc.propertyId.coordinates.lng
    } : undefined,
    generalAmenities: doc.propertyId?.generalAmenities ?? [],
  },
});

async function getListingData(slug: string) {
  await connectToDatabase()

  const rawListing = await Listing.findOne({ slug })
    .populate("propertyId")
    .lean()

  // Make sure to return an empty array for reviews if the listing isn't found
  if (!rawListing) return { listing: null, similar: [], reviews: [] }

  const rawSimilar = await Listing.find({ 
    listingType: rawListing.listingType, 
    slug: { $ne: slug } 
  })
    .populate("propertyId")
    .limit(5)
    .lean()

  // 1. Fetch Real Reviews
  const rawReviews = await Review.find({ listingId: rawListing._id })
    .populate("userId", "name") // Assumes your User schema has a 'name' field
    .sort({ createdAt: -1 })
    .lean()

  // Serialize reviews for the frontend
  const serializedReviews = rawReviews.map(r => ({
    id: r._id.toString(),
    rating: r.rating,
    comment: r.comment,
    date: r.createdAt,
    // Safely handle missing populated user data
    userName: r.userId?.name || "Verified Guest" 
  }));

  return { 
    listing: mapToIProperty(rawListing), 
    similar: rawSimilar.map(mapToIProperty),
    reviews: serializedReviews
  }
}

export default async function PropertyDetailsPage({ params }: PropertyPageProps) {
  const { slug } = await params
  const { listing, similar, reviews } = await getListingData(slug)

  if (!listing) notFound()

  const isRent = listing.listingType === "For_Rent"

  // 2. Calculate Real Average Rating
  const reviewCount = reviews.length;
  const averageRating = reviewCount > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviewCount).toFixed(2)
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
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold uppercase tracking-widest text-slate-500">
              <span className="flex items-center gap-1.5 text-black">
                <HugeiconsIcon icon={StarIcon} size={16} className={reviewCount > 0 ? "fill-black" : ""} />
                {averageRating} {reviewCount > 0 && `· ${reviewCount} Reviews`}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Location01Icon} size={16} />
                {listing.property.location}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between py-6 border-y border-black/10 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white">
                <HugeiconsIcon icon={Building03Icon} size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">Managed by WunkatHomes</h3>
                <p className="text-sm font-medium text-slate-500">Verified Property • No Agent Fees</p>
              </div>
            </div>
            <HugeiconsIcon icon={CheckmarkBadge01Icon} size={28} className="text-green-600" />
          </div>

          <div className="flex flex-wrap gap-6 mb-10">
            {[
              { icon: BedSingle02Icon, label: `${listing.features.bedrooms} Bedrooms` },
              { icon: Bathtub01Icon, label: `${listing.features.bathrooms} Baths` },
              ...(listing.features.sizeSqm ? [{ icon: MaximizeIcon, label: `${listing.features.sizeSqm} Sqm` }] : []),
              { icon: listing.smartLock.hasSmartLock ? Key01Icon : Shield01Icon, label: listing.smartLock.hasSmartLock ? 'Smart Lock' : 'Secure Entry' },
            ].map((metric, i) => (
              <div key={i} className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-black">
                <HugeiconsIcon icon={metric.icon} size={20} className="text-slate-400" />
                {metric.label}
              </div>
            ))}
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-black uppercase tracking-widest mb-4">About This Property</h2>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium whitespace-pre-wrap">
              {listing.description}
            </p>
          </div>

          {listing.property.generalAmenities && listing.property.generalAmenities.length > 0 && (
            <div className="mb-12 pt-10 border-t border-black/10">
              <h2 className="text-xl font-black uppercase tracking-widest mb-6">Amenities & Features</h2>
              <div className="flex flex-wrap gap-3">
                {listing.property.generalAmenities.map((amenity, idx) => {
                  const IconComponent = AMENITY_ICONS[amenity] || CheckmarkBadge01Icon;
                  return (
                    <div key={idx} className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 text-sm font-bold text-slate-700 bg-slate-50">
                      <HugeiconsIcon icon={IconComponent} size={16} className="text-slate-400"/>
                      {amenity}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          <div className="mb-12 pt-10 border-t border-black/10">
            <h2 className="text-xl font-black uppercase tracking-widest mb-6">Neighborhood & Location</h2>
            <PropertyMap lat={listing.property.coordinates?.lat} lng={listing.property.coordinates?.lng} />
            <h3 className="font-bold text-lg mb-2">{listing.property.location}</h3>
            <p className="text-slate-600 font-medium">
              Located in a welcoming neighborhood with convenient access to shopping, business centers, and dining. For your privacy and security, the exact address details and check-in instructions are provided once your booking is confirmed.
            </p>
          </div>

          {/* 3. REVIEWS SECTION */}
          <div className="pt-10 border-t border-black/10">
            <div className="flex items-center gap-2 mb-8">
              <HugeiconsIcon icon={StarIcon} size={24} className={reviewCount > 0 ? "fill-black" : ""} />
              <h2 className="text-2xl font-black uppercase tracking-tight">
                {reviewCount > 0 ? `${averageRating} · ${reviewCount} Reviews` : "No Reviews Yet"}
              </h2>
            </div>
            
            {/* The Write a Review Form */}
            <ReviewForm listingId={listing.id} />
            
            {/* Displaying Real Reviews */}
            {reviewCount > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                {reviews.map((review) => (
                  <div key={review.id} className="flex flex-col">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-500">
                        {review.userName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-sm flex items-center gap-2">
                          {review.userName}
                          <span className="flex text-black">
                            <HugeiconsIcon icon={StarIcon} size={12} className="fill-black" />
                            <span className="ml-1 leading-none">{review.rating}</span>
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {new Date(review.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-slate-700 text-sm leading-relaxed">{review.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">Be the first to review this property!</p>
            )}
          </div>

        </div>

        <BookingCard listing={listing} isRent={isRent} />
      </section>
      
      <ThingsToKnow isRent={isRent} />

      {similar.length > 0 && (
        <SimilarCarousel similar={similar} />
      )}

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black p-4 flex items-center justify-between z-50 lg:hidden">
        <div>
          <div className="text-xl font-black">${listing.price.toLocaleString()}<span className="text-sm font-medium text-slate-500"> {formatLeaseTerm(listing.terms.leaseTerm)}</span></div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{isRent ? 'Monthly Rent' : 'Purchase Price'}</div>
        </div>
        <Link href={`/checkout/${listing.slug}?type=deposit`}>
          <button className="px-6 py-3 bg-black text-white font-black uppercase tracking-widest text-[10px] rounded hover:bg-slate-800 transition-colors">
            {isRent ? 'Reserve Now' : 'Reserve to Buy'}
          </button>
        </Link>
      </div>
<Toaster position="top-right" />
    </main>
  )
}