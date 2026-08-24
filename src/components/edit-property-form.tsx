"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import {
  editPropertyAction,
  ActionState,
} from "@/actions/user/property.action";
import { SubmitButton } from "@/components/submit-button"; // Adjust paths as needed
import { Button } from "@/components/ui/button";
import { MediaUpload } from "@/components/media-upload";
import { SmartLockToggle } from "@/components/smart-lock-toggle";
import { Checkbox } from "@/components/ui/checkbox";
import { COMMON_AMENITIES, GHANA_REGIONS } from "@/lib/constants";
import { Label } from "@/components/ui/label";
import { MapPickerDynamic } from "@/components/map-picker-dynamic";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// --- NEW: Import shadcn AlertDialog ---
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const initialState: ActionState = {
  success: false,
  message: "",
};

export default function EditPropertyForm({ 
  initialData, 
  unassignedLocks = [],
  currentLock = null
}: { 
  initialData: any,
  unassignedLocks?: any[],
  currentLock?: any
}) {
  const router = useRouter();

  const [state, formAction] = useActionState(editPropertyAction, initialState);
  const [isPending, startTransition] = useTransition();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isUploadingToCloud, setIsUploadingToCloud] = useState(false);
  
  
  // Track existing images so they aren't lost if the user doesn't upload new ones
  const [existingImages, setExistingImages] = useState<string[]>(initialData.images || []);

  const [listingType, setListingType] = useState(initialData.listingType || "For_Rent");
  const [roomType, setRoomType] = useState(initialData.roomType || "Empty");

  // --- NEW: Confirmation Modal State ---
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);

  useEffect(() => {
    if (state.success) {
      toast.dismiss()
      toast.success(state.message);
      setTimeout(() => {
        router.push("/admin/properties");
      }, 1500);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  // Intercept the form submission to open the dialog instead
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    if (uploadedFiles.length === 0 && existingImages.length === 0) {
      toast.error("Please ensure the property has at least one image.");
      return;
    }

    // DO NOT append the raw File objects here. We just append the retained images.
    formData.append("existingImages", JSON.stringify(existingImages));

    setPendingFormData(formData);
    setIsConfirmOpen(true);
  };

  // 3. REPLACE YOUR executeSubmit WITH THE CLOUDINARY LOGIC
  const executeSubmit = async () => {
    if (!pendingFormData) return;
    
    // Close modal immediately so the main form UI can show the loading state
    setIsConfirmOpen(false); 

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (uploadedFiles.length > 0 && (!cloudName || !uploadPreset)) {
      toast.error("Cloudinary configuration is missing.");
      return;
    }

    setIsUploadingToCloud(true);
    const toastId = toast.loading("Processing changes...");

    try {
      // Step A: If there are NEW files, upload them directly to Cloudinary
      if (uploadedFiles.length > 0) {
        toast.loading("Uploading new high-res images...", { id: toastId });
        
        const uploadPromises = uploadedFiles.map(async (file) => {
          const cloudData = new FormData();
          cloudData.append("file", file);
          cloudData.append("upload_preset", uploadPreset!);

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            { method: "POST", body: cloudData }
          );

          const data = await response.json();
          if (!data.secure_url) throw new Error("Upload failed for a file");
          
          return data.secure_url as string;
        });

        const newUploadedUrls = await Promise.all(uploadPromises);

        // Step B: Append the lightweight URLs to the formData as "newMediaUrls"
        newUploadedUrls.forEach((url) => {
          pendingFormData.append("newMediaUrls", url);
        });
      }

      

      // Step C: Now fire the Server Action with the URLs attached
      startTransition(() => {
        formAction(pendingFormData);
      });

    } catch (error) {
      console.error("Cloudinary Error:", error);
      if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
        toast.error("Upload blocked. Please disable your adblocker or shields.", { id: toastId, duration: 5000 });
      } else {
        toast.error("Image upload failed. Check your network.", { id: toastId });
      }
    } finally {
      setIsUploadingToCloud(false);
    }
  };

  

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hidden Identifiers for the Update Operation */}
        <input type="hidden" name="listingId" value={initialData._id} />
        <input type="hidden" name="propertyId" value={initialData.propertyId._id} />

        {/* --- SECTION: ASSET DETAILS --- */}
        <div className="bg-white rounded-lg border border-zinc-200/60 p-8">
          <h2 className="text-[18px] font-medium text-zinc-900 mb-6 pb-3 border-b border-zinc-200/60">
            Primary Details
          </h2>
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[13px] font-medium text-zinc-700">
                  Listing Title *
                </Label>
                <Input
                  id="title"
                  name="title"
                  defaultValue={initialData.title}
                  placeholder="e.g. Master Bedroom with Balcony"
                  className="h-10 bg-zinc-50/50 focus:ring-zinc-950"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-[13px] font-medium text-zinc-700">
                    Listing Type *
                  </Label>
                  <Select name="listingType" value={listingType} onValueChange={setListingType}>
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
                  <Select name="propertyType" defaultValue={initialData.propertyId.propertyType}>
                    <SelectTrigger className="h-10 bg-zinc-50/50 focus:ring-zinc-950">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Apartment_Building">Apartment</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="House">House</SelectItem>
                      <SelectItem value="Land">Land</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {listingType === "For_Rent" && (
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-[13px] font-medium text-zinc-700">
                      Rental Category *
                    </Label>
                    <Select name="roomType" value={roomType} onValueChange={setRoomType}>
                      <SelectTrigger className="h-10 bg-zinc-50/50 focus:ring-zinc-950">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Empty">Empty Room</SelectItem>
                        <SelectItem value="Furnished">Furnished Apartment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-[13px] font-medium text-zinc-700">
                Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                defaultValue={initialData.description}
                placeholder="Provide a detailed description..."
                className="min-h-[120px] bg-zinc-50/50 focus:ring-zinc-950 resize-y"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="price" className="text-[13px] font-medium text-zinc-700 flex flex-col ">
                  <div className='text-left w-full'>
                    {listingType === "For_Sale" 
                      ? "Total Price (GHS) *" 
                      : roomType === "Furnished" 
                        ? "Base Rent Amount (Per Day) *" 
                        : "Base Rent Amount (Per Month) *"}
                  </div>
                  
                </Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  defaultValue={initialData.price}
                  placeholder="0.00"
                  className="h-10 bg-zinc-50/50 focus:ring-zinc-950"
                  required
                />
                {listingType === "For_Rent" && (
                    <span className="text-[10px] text-amber-600 font-medium">
                      Note: Checkout will automatically enforce a {roomType === "Furnished" ? "2-day" : "2-month"} security deposit.
                    </span>
                  )}
              </div>
              <div className="space-y-2">
                <Label className="text-[13px] font-medium text-zinc-700">
                  Status
                </Label>
                <Select name="status" defaultValue={initialData.status}>
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
                <Select name="region" required defaultValue={initialData.propertyId.location?.region}>
                  <SelectTrigger className="h-10 bg-zinc-50/50 focus:ring-zinc-950">
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {GHANA_REGIONS.map((region) => (
                      <SelectItem key={region} value={region.replace(/\s+/g, "_")}>
                        {region}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="city" className="text-[13px] font-medium text-zinc-700">
                  City
                </Label>
                <Input
                  id="city"
                  name="city"
                  defaultValue={initialData.propertyId.location?.city}
                  placeholder="e.g. Accra"
                  className="h-10 bg-zinc-50/50 focus:ring-zinc-950"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="area" className="text-[13px] font-medium text-zinc-700">
                  Area / Neighborhood *
                </Label>
                <Input
                  id="area"
                  name="area"
                  defaultValue={initialData.propertyId.location?.area}
                  placeholder="e.g. East Legon"
                  className="h-10 bg-zinc-50/50 focus:ring-zinc-950"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="landmarks" className="text-[13px] font-medium text-zinc-700">
                Nearby Landmark
              </Label>
              <Input
                id="landmarks"
                name="landmarks"
                defaultValue={initialData.propertyId.landmarks?.join(", ")}
                placeholder="e.g. Accra Mall, Kotoka Airport, KFC"
                className="h-10 bg-zinc-50/50 focus:ring-zinc-950"
              />
              <p className="text-xs text-zinc-500 mt-1">
                Separate multiple landmarks with a comma.
              </p>
            </div>

            <input type="hidden" name="lat" value={initialData.propertyId.coordinates?.lat} />
            <input type="hidden" name="lng" value={initialData.propertyId.coordinates?.lng} />
            <MapPickerDynamic />
          </div>
        </div>

        {/* --- SECTION: FEATURES --- */}
        <div className="bg-white rounded-lg border border-zinc-200/60 p-8">
          <h2 className="text-[18px] font-medium text-zinc-900 mb-6 pb-3 border-b border-zinc-200/60">
            Features & Amenities
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            <div className="space-y-2">
              <Label htmlFor="bedrooms" className="text-[13px] font-medium text-zinc-700">
                Bedrooms
              </Label>
              <Input
                id="bedrooms"
                name="bedrooms"
                type="number"
                min="0"
                defaultValue={initialData.features?.bedrooms || 0}
                className="h-10 bg-zinc-50/50 focus:ring-zinc-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms" className="text-[13px] font-medium text-zinc-700">
                Bathrooms
              </Label>
              <Input
                id="bathrooms"
                name="bathrooms"
                type="number"
                min="0"
                defaultValue={initialData.features?.bathrooms || 0}
                className="h-10 bg-zinc-50/50 focus:ring-zinc-950"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sizeSqm" className="text-[13px] font-medium text-zinc-700">
                Size (sqm)
              </Label>
              <Input
                id="sizeSqm"
                name="sizeSqm"
                type="number"
                min="0"
                defaultValue={initialData.features?.sizeSqm || ""}
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
                    defaultChecked={initialData.propertyId.generalAmenities?.includes(amenity)}
                    className="data-[state=checked]:bg-zinc-950"
                  />
                  <Label htmlFor={`amenity-${amenity}`} className="text-[13px] text-zinc-700 cursor-pointer">
                    {amenity}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- MEDIA & ACCESS CONTROL --- */}
        <MediaUpload 
          files={uploadedFiles} 
          setFiles={setUploadedFiles} 
          existingImages={existingImages}
          setExistingImages={setExistingImages}
        />
        
        <SmartLockToggle 
          unassignedLocks={unassignedLocks} 
          currentLock={currentLock} 
          initialAccessInstructions={initialData.smartLock?.accessInstructions || ""}
        />

        <div className="bg-white rounded-lg border border-zinc-200/60 p-8 flex items-center justify-between">
          <p className="text-[13px] text-zinc-500 max-w-sm">
            Updating this asset will immediately reflect across the portfolio and live listings.
          </p>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="h-11 px-6 rounded-md text-[14px]"
              onClick={() => router.back()}
              disabled={isPending}
            >
              Cancel
            </Button>
            {/* The main button remains type="submit". It triggers handleSubmit, not executeSubmit. */}
            <SubmitButton pending={isPending} text="Save Changes" />
            <Toaster position="top-right" />
          </div>
        </div>
      </form>

      {/* --- NEW: The Confirmation Dialog --- */}
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-900">Save Property Changes?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-500">
              You are about to update this property's details. These changes will immediately reflect across your live listings and portfolio. Do you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setPendingFormData(null)}
              className="mt-0 rounded-md"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeSubmit} 
              className="bg-zinc-950 rounded-md text-white hover:bg-zinc-800 transition-colors"
            >
              Confirm & Save
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
