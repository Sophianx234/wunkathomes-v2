import { notFound } from "next/navigation";
import Link from "next/link";
import {
  Location01Icon,
  BedSingle02Icon,
  Bathtub01Icon,
  MaximizeIcon,
  Key01Icon,
  CheckmarkBadge01Icon,
  Calendar01Icon,
  Shield01Icon,
  StarIcon,
  Wifi01Icon,
  Car01Icon,
  Building04Icon,
  Map,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { inventory } from "@/lib/data";

// --- Import the new Client Components ---
import ImageGallery from "@/components/image-gallery";
import SimilarCarousel from "@/components/similar-carousel";
import ThingsToKnow from "@/components/things-to-know";
import BookingCard from "@/components/booking-card";
import SavePropertyButton from "@/components/ui/saved-property-button";
import { getSession, SessionPayload } from "@/lib/session";
import SavedProperty from "@/models/saved";
import { connectToDatabase } from "@/config/DbConnect";
import Review from "@/models/review";
import { mapToIProperty } from "@/app/admin/properties/[slug]/page";
import Listing from "@/models/listing";

interface PropertyPageProps {
  params: Promise<{ slug: string }>;
}

async function getListingDatax(slug: string) {
  // Simulate DB Delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  const listing = inventory.find((item) => item.slug === slug) || null;
  const similar = inventory
    .filter(
      (item) => item.slug !== slug && item.listingType === listing?.listingType,
    )
    .slice(0, 5); // Increased slice so the carousel has enough items to scroll

  return { listing, similar };
}
async function getListingData(slug: string) {
  await connectToDatabase();
  const rawListing = await Listing.findOne({ slug })
    .populate("propertyId")
    .lean();
  console.log("Fetched listing data:", rawListing);
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
  const { listing, similar } = await getListingData(slug);
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

  const reviews = [
    {
      name: "Kwame A.",
      date: "October 2025",
      text: "The digital lease process was flawless. I signed on my phone, paid via Paystack, and the Tuya smart lock PIN was generated instantly. Zero agent hassle.",
      rating: 5,
    },
    {
      name: "Sarah M.",
      date: "September 2025",
      text: "Pristine property. It looks exactly like the photos. The Wunkat maintenance ledger is very transparent. Highly recommend this standard of living.",
      rating: 5,
    },
    {
      name: "David O.",
      date: "August 2025",
      text: "Finally, a real estate platform in Accra without the middleman. Moving in was just unlocking the door with my phone. The fiber internet was already active.",
      rating: 4.8,
    },
    {
      name: "Elena R.",
      date: "July 2025",
      text: "Beautiful architecture and very secure. The hybrid payment system made it easy to wire the annual rent without massive gateway fees.",
      rating: 5,
    },
  ];

  return (
    <main className="min-h-screen bg-white text-black pt-24 pb-32">
      {/* 1. Interactive Client-Side Gallery */}
      <div className="max-w-6xl mx-auto">
        <ImageGallery images={listing.images} title={listing.title} />
      </div>

      {/* 2. Main Content & Sticky Ledger */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
        {/* --- Left Column: Details --- */}
        <div className="lg:col-span-8 flex flex-col pb-12">
          <div className="mb-8">
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight leading-[1.1] mb-4">
              {listing.title}
            </h1>
            <div className="flex items-center justify-between gap-4 ">
              <div className="flex flex-wrap items-center gap-4 text-sm font-bold uppercase tracking-widest text-slate-500">
                <span className="flex items-center gap-1.5 text-black">
                  <HugeiconsIcon
                    icon={StarIcon}
                    size={16}
                    className="fill-black"
                  />
                  4.95 · 12 Reviews
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
                <HugeiconsIcon icon={Building04Icon} size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase tracking-tight">
                  Owned & Operated by Wunkat
                </h3>
                <p className="text-sm font-medium text-slate-500">
                  100% Verified Asset • Zero Brokers
                </p>
              </div>
            </div>
            <HugeiconsIcon
              icon={CheckmarkBadge01Icon}
              size={28}
              className="text-blue-600"
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
              { icon: MaximizeIcon, label: `${listing.features.sizeSqm} Sqm` },
              {
                icon: listing.smartLock.hasSmartLock ? Key01Icon : Shield01Icon,
                label: listing.smartLock.hasSmartLock
                  ? "Smart Lock"
                  : "Secure Access",
              },
            ].map((metric, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-black"
              >
                <HugeiconsIcon
                  icon={metric.icon}
                  size={20}
                  className="text-slate-400"
                />
                {metric.label}
              </div>
            ))}
          </div>

          <div className="mb-12">
            <h2 className="text-xl font-black uppercase tracking-widest mb-4">
              The Narrative
            </h2>
            <p className="text-slate-600 text-base md:text-lg leading-relaxed font-medium">
              {listing.description}
            </p>
          </div>

          <div className="mb-12 pt-10 border-t border-black/10">
            <h2 className="text-xl font-black uppercase tracking-widest mb-6">
              Infrastructure
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                "High-Speed Fiber",
                "Backup Generator",
                "Dedicated Parking",
                "Smart Climate Control",
                "24/7 Security Ledger",
              ].map((amenity, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-slate-200 text-sm font-bold text-slate-700 bg-slate-50"
                >
                  {idx === 0 ? (
                    <HugeiconsIcon icon={Wifi01Icon} size={16} />
                  ) : idx === 2 ? (
                    <HugeiconsIcon icon={Car01Icon} size={16} />
                  ) : (
                    <HugeiconsIcon
                      icon={CheckmarkBadge01Icon}
                      size={16}
                      className="text-slate-400"
                    />
                  )}
                  {amenity}
                </div>
              ))}
            </div>
          </div>

          <div className="mb-12 pt-10 border-t border-black/10">
            <h2 className="text-xl font-black uppercase tracking-widest mb-6">
              The Neighbourhood
            </h2>
            <div className="w-full h-[250px] bg-slate-100 rounded-2xl border border-slate-200 flex flex-col items-center justify-center text-slate-400 mb-6">
              <HugeiconsIcon icon={Map} size={32} className="mb-2" />
              <span className="text-xs font-bold uppercase tracking-widest">
                Map API Integration Placeholder
              </span>
            </div>
            <h3 className="font-bold text-lg mb-2">
              {listing.property.location}
            </h3>
            <p className="text-slate-600 font-medium">
              Situated in a highly coveted enclave. Immediate access to major
              business districts, premium retail, and diplomatic zones. The
              exact geolocation and entry coordinates are securely transmitted
              to your dashboard upon lease execution.
            </p>
          </div>

          <div className="pt-10 border-t border-black/10">
            <div className="flex items-center gap-2 mb-8">
              <HugeiconsIcon icon={StarIcon} size={24} className="fill-black" />
              <h2 className="text-2xl font-black uppercase tracking-tight">
                4.95 · 12 Wunkat Reviews
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {reviews.map((review, i) => (
                <div key={i} className="flex flex-col">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-black text-slate-500">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-sm">{review.name}</div>
                      <div className="text-xs text-slate-500 font-medium">
                        {review.date}
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {review.text}
                  </p>
                </div>
              ))}
            </div>
            <button className="mt-8 px-6 py-3 border-2 border-black font-bold uppercase tracking-widest text-[10px] hover:bg-black hover:text-white transition-colors">
              Show all 12 reviews
            </button>
          </div>
        </div>

        {/* --- Right Column: Sticky Action Ledger --- */}
        <BookingCard listing={listing} isRent={isRent} />
      </section>
      <ThingsToKnow isRent={isRent} />

      {/* 3. Interactive Client-Side Carousel */}
      <SimilarCarousel similar={similar} />

      {/* Mobile Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t-2 border-black p-4 flex items-center justify-between z-50 lg:hidden">
        <div>
          <div className="text-xl font-black">
            ${listing.price.toLocaleString()}
            {isRent && (
              <span className="text-sm font-medium text-slate-500"> / mo</span>
            )}
          </div>
          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
            {isRent ? "Booking Deposit" : "Acquisition"}
          </div>
        </div>
        <Link href={`/checkout/${listing.slug}?type=deposit`}>
          <button className="px-6 py-3 bg-black text-white font-black uppercase tracking-widest text-[10px] rounded hover:bg-slate-800 transition-colors">
            {isRent ? "Reserve" : "Acquire"}
          </button>
        </Link>
      </div>
    </main>
  );
}
