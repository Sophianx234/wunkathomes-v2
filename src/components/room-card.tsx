"use client";

import { Button } from "@/components/ui/button";
import { Bath, BedDouble, Edit, Trash } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import Image from "next/image";
import { useRouter } from "next/navigation";

export interface IRoom {
  _id: string;
  name: string;
  description: string;
  price: number;
  available?: boolean;
  images: string[];
  beds: number;
  baths: number;
  planType: string;
  status: string;
  houseId?: {
    _id: string;
    name: string;
    location: {
      address: string;
      city: string;
      region: string;
      country: string;
      _id: string;
    };
  };
}
type propertyCardProps = {
  room: IRoom;
  type?: "admin" | "user";
};

export default function RoomCard({ room, type = "user" }: propertyCardProps) {
  const router = useRouter();

  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-green-100 text-green-700";
      case "booked":
        return "bg-red-100 text-red-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      default:
        return "bg-zinc-100/50 text-zinc-600";
    }
  };

  const handleReadMore = () => {
    // If logged in → go to property page

    router.push(`/overview/properties/${room._id}`);
  };

  const handleEdit = () => {
    router.push(`/overview/properties/edit/${room._id}`);
  };

  const handleDelete = async () => {};

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 relative hover:shadow-sm transition flex flex-col h-full">
      {/* Image + Badge */}
      <div className="relative w-full h-32 mb-4 rounded-lg overflow-hidden">
        <Image
          src={room?.images[0]}
          alt={room.name}
          fill
          className="object-cover"
        />
        <span
          className={`absolute top-2 left-2 px-3 py-1 text-xs font-medium rounded-full ${getStatusStyle(
            room?.status,
          )}`}
        >
          {room?.status.charAt(0).toUpperCase() + room?.status.slice(1)}
        </span>

        {type === "admin" && (
          <div className="absolute top-2 right-2 flex gap-2">
            <Button
              onClick={handleEdit}
              size="icon"
              variant="outline"
              className="h-7 w-7"
            >
              <HugeiconsIcon icon={Edit} className="w-4 h-4" />
            </Button>
            <Button
              onClick={handleDelete}
              size="icon"
              className="h-7 w-7 bg-red-100 hover:bg-red-200 text-red-600 border border-red-200"
            >
              <HugeiconsIcon icon={Trash} className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-grow">
        <h3 className="font-semibold text-sm mb-1">{room.name}</h3>
        <p className="text-xs text-zinc-500 mb-2">
          {room?.houseId?.location?.city} - {room?.houseId?.location?.region}
        </p>
        <p className="text-xs text-zinc-500 mb-2 line-clamp-3">
          {room?.description}
        </p>

        {/* Beds & Baths */}
        <div className="flex items-center justify-between gap-4 text-zinc-600 text-xs mb-4">
          <div className="flex items-center gap-1">
            <HugeiconsIcon icon={BedDouble} className="size-4 text-zinc-500" />
            <span>{room.beds} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <HugeiconsIcon icon={Bath} className="size-4 text-zinc-500" />
            <span>{room.baths} Baths</span>
          </div>
        </div>

        {/* Footer pinned at bottom */}
        <div className="mt-auto flex justify-between items-center text-sm pt-2">
          <span className="font-semibold text-zinc-800 flex flex-col leading-tight">
            {room.price}
            <span className="italic text-xs font-medium text-zinc-500">
              {room?.planType.includes("m") ? "/month" : "/year"}
            </span>
          </span>

          <Button
            disabled={!room.status.includes("available") && type === "user"}
            onClick={handleReadMore}
            className="text-white text-xs font-medium px-4 py-1"
          >
            View & Book
          </Button>
        </div>
      </div>
    </div>
  );
}
