"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import {
  createPropertyAction,
  ActionState,
} from "@/actions/user/property.action";
import { SubmitButton } from "./submit-button";
import { Button } from "./ui/button";
import { MediaUpload } from "./media-upload";
import { SmartLockToggle } from "./smart-lock-toggle";
import { Checkbox } from "./ui/checkbox";
import { COMMON_AMENITIES, GHANA_REGIONS } from "@/lib/constants";
import { Label } from "./ui/label";
import { MapPickerDynamic } from "./map-picker-dynamic";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";

const initialState: ActionState = {
  success: false,
  message: "",
};

export default function CreatePropertyForm() {
  const router = useRouter();

  // 1. Setup states for our Server Action, Transition, and Files
  const [state, formAction] = useActionState(
    createPropertyAction,
    initialState,
  );
  const [isPending, startTransition] = useTransition();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // NEW: State to track the Cloudinary upload phase
  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);

  // Watch for state changes to trigger toasts and client-side redirects
  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      // Wait a moment for the user to see the toast, then redirect
      setTimeout(() => {
        router.push("/admin/properties");
      }, 1500);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  // 2. Intercept the submission to handle direct uploads first
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one image.");
      return;
    }

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (!cloudName || !uploadPreset) {
      toast.error("Cloudinary configuration is missing from environment.");
      return;
    }

    setIsUploadingToCloud(true);
    const toastId = toast.loading("Uploading high-res images to cloud...");

    try {
      // Upload all selected files directly from the browser to Cloudinary
      const uploadPromises = uploadedFiles.map(async (file) => {
        const cloudData = new FormData();
        cloudData.append("file", file);
        cloudData.append("upload_preset", uploadPreset);

        const response = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          { method: "POST", body: cloudData }
        );

        const data = await response.json();
        if (!data.secure_url) throw new Error("Upload failed for a file");
        
        return data.secure_url as string;
      });

      const uploadedUrls = await Promise.all(uploadPromises);

      // Append only the resulting text URLs to the formData
      uploadedUrls.forEach((url) => {
        formData.append("mediaUrls", url);
      });
      toast.dismiss(toastId);
      toast.success("Images secured. Saving property data...", { id: toastId });

      // Fire the Server Action via transition
      startTransition(() => {
        formAction(formData);
      });

    } catch (error) {
      console.error("Cloudinary Error:", error);
      toast.error("Image upload failed. Please check your network connection.", { id: toastId });
    } finally {
      setIsUploadingToCloud(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* --- SECTION: ASSET DETAILS --- */}
      <div className="bg-white rounded-lg border border-zinc-200/60 p-8">
        <h2 className="text-[18px] font-medium text-zinc-900 mb-6 pb-3 border-b border-zinc-200/60">
          Primary Details
        </h2>
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label
                htmlFor="title"
                className="text-[13px] font-medium text-zinc-700"
              >
                Listing Title *
              </Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Master Bedroom with Balcony"
                className="h-10 bg-zinc-50/50 focus:ring-zinc-950"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label className="text-[13px] font-medium text-zinc-700">
                  Listing Type *
                </Label>
                <Select name="listingType" defaultValue="For_Rent">
                  <SelectTrigger className="h-10 bg-zinc-50/50 focus:ring-zinc-950">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="For_Rent">For Rent</SelectItem>
                    <SelectItem value="For_Sale">For Sale</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-medium text-zinc-700">
                  Property Type *
                </Label>
                <Select name="propertyType" defaultValue="Apartment_Building">
                  <SelectTrigger className="h-10 bg-zinc-50/50 focus:ring-zinc-950">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Apartment_Building">
                      Apartment
                    </SelectItem>
                    <SelectItem value="Commercial">Commercial</SelectItem>
                    <SelectItem value="House">House</SelectItem>
                    <SelectItem value="Land">Land</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="description"
              className="text-[13px] font-medium text-zinc-700"
            >
              Description *
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Provide a detailed description..."
              className="min-h-[120px] bg-zinc-50/50 focus:ring-zinc-950 resize-y"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label
                htmlFor="price"
                className="text-[13px] font-medium text-zinc-700"
              >
                Price (GHS) *
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                placeholder="0.00"
                className="h-10 bg-zinc-50/50 focus:ring-zinc-950"
                required
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-zinc-700">
                Lease Term
              </Label>
              <Select name="leaseTerm">
                <SelectTrigger className="h-10 bg-zinc-50/50 focus:ring-zinc-950">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Monthly">Monthly</SelectItem>
                  <SelectItem value="1_Year">1 Year</SelectItem>
                  <SelectItem value="2_Years">2 Years</SelectItem>
                  <SelectItem value="3_Years">3 Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-zinc-700">
                Initial Status
              </Label>
              <Select name="status" defaultValue="Available">
                <SelectTrigger className="h-10 bg-zinc-50/50 focus:ring-zinc-950">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available">Available</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Rented">Rented</SelectItem>
                  <SelectItem value="Sold">Sold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* --- SECTION: LOCATION --- */}
      <div className="bg-white rounded-lg border border-zinc-200/60 p-8">
        <h2 className="text-[18px] font-medium text-zinc-900 mb-6 pb-3 border-b border-zinc-200/60">
          Location & Coordinates
        </h2>
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-2">
              <Label className="text-[13px] font-medium text-zinc-700">
                Region *
              </Label>
              <Select name="region" required>
                <SelectTrigger className="h-10 bg-zinc-50/50 focus:ring-zinc-950">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {GHANA_REGIONS.map((region) => (
                    <SelectItem
                      key={region}
                      value={region.replace(/\s+/g, "_")}
                    >
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="city"
                className="text-[13px] font-medium text-zinc-700"
              >
                City
              </Label>
              <Input
                id="city"
                name="city"
                placeholder="e.g. Accra"
                className="h-10 bg-zinc-50/50 focus:ring-zinc-950"
              />
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="area"
                className="text-[13px] font-medium text-zinc-700"
              >
                Area / Neighborhood *
              </Label>
              <Input
                id="area"
                name="area"
                placeholder="e.g. East Legon"
                className="h-10 bg-zinc-50/50 focus:ring-zinc-950"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label
              htmlFor="landmarks"
              className="text-[13px] font-medium text-zinc-700"
            >
              Nearby Landmark{" "}
            </Label>
            <Input
              id="landmarks"
              name="landmarks"
              placeholder="e.g. Accra Mall, Kotoka Airport, KFC"
              className="h-10 bg-zinc-50/50 focus:ring-zinc-950"
            />
            <p className="text-xs text-zinc-500 mt-1">
              Separate multiple landmarks with a comma.
            </p>
          </div>

          {/* Dynamic Map Component */}
          <MapPickerDynamic />
        </div>
      </div>

      {/* --- SECTION: FEATURES --- */}
      <div className="bg-white rounded-lg border border-zinc-200/60 p-8">
        <h2 className="text-[18px] font-medium text-zinc-900 mb-6 pb-3 border-b border-zinc-200/60">
          Features & Amenities
        </h2>

        {/* NEW: Bedrooms, Bathrooms, Size */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
          <div className="space-y-2">
            <Label
              htmlFor="bedrooms"
              className="text-[13px] font-medium text-zinc-700"
            >
              Bedrooms
            </Label>
            <Input
              id="bedrooms"
              name="bedrooms"
              type="number"
              min="0"
              placeholder="0"
              className="h-10 bg-zinc-50/50 focus:ring-zinc-950"
              defaultValue="0"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="bathrooms"
              className="text-[13px] font-medium text-zinc-700"
            >
              Bathrooms
            </Label>
            <Input
              id="bathrooms"
              name="bathrooms"
              type="number"
              min="0"
              placeholder="0"
              className="h-10 bg-zinc-50/50 focus:ring-zinc-950"
              defaultValue="0"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="sizeSqm"
              className="text-[13px] font-medium text-zinc-700"
            >
              Size (sqm)
            </Label>
            <Input
              id="sizeSqm"
              name="sizeSqm"
              type="number"
              min="0"
              placeholder="e.g. 150"
              className="h-10 bg-zinc-50/50 focus:ring-zinc-950"
            />
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-[13px] font-medium text-zinc-700">
            Select General Amenities
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 p-5 rounded-lg border border-zinc-200/60 bg-slate-50/50">
            {COMMON_AMENITIES.map((amenity) => (
              <div key={amenity} className="flex items-center space-x-3">
                <Checkbox
                  id={`amenity-${amenity}`}
                  name="amenities"
                  value={amenity}
                  className="data-[state=checked]:bg-zinc-950"
                />
                <Label
                  htmlFor={`amenity-${amenity}`}
                  className="text-[13px] text-zinc-700 cursor-pointer"
                >
                  {amenity}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- MEDIA & ACCESS CONTROL (Client Islands) --- */}
      <MediaUpload files={uploadedFiles} setFiles={setUploadedFiles} />

      <SmartLockToggle />

      <div className="bg-white rounded-lg border border-zinc-200/60 p-8 flex items-center justify-between">
        <p className="text-[13px] text-zinc-500 max-w-sm">
          By saving this asset, a unified unique slug will automatically be
          generated based on the title.
        </p>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 px-6 rounded-md text-[14px]"
            onClick={() => router.back()}
            disabled={isPending || isUploadingToCloud}
          >
            Discard
          </Button>

          <SubmitButton pending={isPending || isUploadingToCloud} />
          <Toaster position="top-right" />
        </div>
      </div>
    </form>
  );
}
