"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MediaUpload } from "@/components/media-upload";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";

import {
  submitMaintenanceRequest,
  ActionState,
} from "@/actions/user/maintenance.action";

const initialState: ActionState = { success: false, message: "" };

interface MaintenanceFormProps {
  properties: { id: string; title: string }[];
}

export default function MaintenanceRequestForm({
  properties,
}: MaintenanceFormProps) {
  const router = useRouter();

  const [state, formAction] = useActionState(
    submitMaintenanceRequest,
    initialState,
  );
  const [isPending, startTransition] = useTransition();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Default to the first property in the array
  const [selectedLeaseId, setSelectedLeaseId] = useState<string>(
    properties[0]?.id || "",
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.message);
      setTimeout(() => {
        router.push("/user/dashboard");
      }, 1500);
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Explicitly append the selected property ID to the payload
    formData.append("leaseId", selectedLeaseId);

    uploadedFiles.forEach((file) => {
      formData.append("media", file);
    });

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 md:space-y-6 max-w-4xl mx-auto w-full overflow-x-hidden box-border px-2 md:px-0"
    >
      {/* --- SECTION: PROPERTY SELECTION --- */}
      <div className="bg-white rounded-lg md:rounded-lg border border-zinc-200/60 p-4 md:p-8 w-full box-border">
        <h2 className="text-[14px] md:text-[18px] font-medium text-zinc-900 mb-3 md:mb-6 pb-2 md:pb-3 border-b border-zinc-200/60 truncate">
          Property Details
        </h2>
        <div className="space-y-1.5 md:space-y-2 max-w-md w-full min-w-0 box-border">
          <Label className="text-[10px] md:text-[13px] font-medium text-zinc-700">
            Affected Property *
          </Label>

          {properties.length === 1 ? (
            // SINGLE PROPERTY: Locked read-only text
            <div className="h-9 md:h-10 bg-zinc-50/50 border border-zinc-200/60 rounded-md px-2 md:px-3 flex items-center text-[11px] md:text-sm text-zinc-700 font-medium w-full min-w-0 box-border truncate">
              {properties[0].title}
            </div>
          ) : (
            // MULTIPLE PROPERTIES: Select Dropdown
            <Select
              value={selectedLeaseId}
              onValueChange={setSelectedLeaseId}
              required
            >
              <SelectTrigger className="h-9 md:h-10 bg-zinc-50/50 focus:ring-zinc-950 border-zinc-200/60 text-[11px] md:text-sm w-full min-w-0 max-w-full box-border m-0">
                <SelectValue
                  placeholder="Select a property"
                  className="truncate"
                />
              </SelectTrigger>
              <SelectContent>
                {properties.map((property) => (
                  <SelectItem
                    key={property.id}
                    value={property.id}
                    className="text-[11px] md:text-sm"
                  >
                    {property.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* --- SECTION: ISSUE CLASSIFICATION --- */}
      <div className="bg-white rounded-lg md:rounded-lg border border-zinc-200/60 p-4 md:p-8 w-full box-border">
        <h2 className="text-[14px] md:text-[18px] font-medium text-zinc-900 mb-3 md:mb-6 pb-2 md:pb-3 border-b border-zinc-200/60 truncate">
          Issue Classification
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5 w-full box-border">
          <div className="space-y-1.5 md:space-y-2 w-full min-w-0 box-border">
            <Label className="text-[10px] md:text-[13px] font-medium text-zinc-700">
              Service Category *
            </Label>
            <Select name="category" required>
              <SelectTrigger className="h-9 md:h-10 bg-zinc-50/50 focus:ring-zinc-950 border-zinc-200/60 text-[11px] md:text-sm w-full min-w-0 max-w-full box-border m-0">
                <SelectValue
                  placeholder="Select the affected area"
                  className="truncate"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Plumbing" className="text-[11px] md:text-sm">
                  Plumbing & Water
                </SelectItem>
                <SelectItem
                  value="Electrical"
                  className="text-[11px] md:text-sm"
                >
                  Electrical & Lighting
                </SelectItem>
                <SelectItem value="HVAC" className="text-[11px] md:text-sm">
                  Air Conditioning & HVAC
                </SelectItem>
                <SelectItem
                  value="Smart_Lock"
                  className="text-[11px] md:text-sm"
                >
                  Smart Lock & Access
                </SelectItem>
                <SelectItem
                  value="Appliances"
                  className="text-[11px] md:text-sm"
                >
                  Provided Appliances
                </SelectItem>
                <SelectItem
                  value="Structural"
                  className="text-[11px] md:text-sm"
                >
                  Structural (Doors, Windows, Walls)
                </SelectItem>
                <SelectItem value="Other" className="text-[11px] md:text-sm">
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 md:space-y-2 w-full min-w-0 box-border">
            <Label className="text-[10px] md:text-[13px] font-medium text-zinc-700">
              Priority Level *
            </Label>
            <Select name="priority" defaultValue="Routine">
              <SelectTrigger className="h-9 md:h-10 bg-zinc-50/50 focus:ring-zinc-950 border-zinc-200/60 text-[11px] md:text-sm w-full min-w-0 max-w-full box-border m-0">
                <SelectValue
                  placeholder="Assess the urgency"
                  className="truncate"
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low" className="text-[11px] md:text-sm">
                  Low (No immediate impact on living)
                </SelectItem>
                <SelectItem value="Routine" className="text-[11px] md:text-sm">
                  Routine (Standard maintenance)
                </SelectItem>
                <SelectItem value="High" className="text-[11px] md:text-sm">
                  High (Impacting daily comfort)
                </SelectItem>
                <SelectItem
                  value="Emergency"
                  className="text-[11px] md:text-sm"
                >
                  Emergency (Active leak, security breach, etc.)
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* --- SECTION: REQUEST DETAILS --- */}
      <div className="bg-white rounded-lg md:rounded-lg border border-zinc-200/60 p-4 md:p-8 w-full box-border">
        <h2 className="text-[14px] md:text-[18px] font-medium text-zinc-900 mb-3 md:mb-6 pb-2 md:pb-3 border-b border-zinc-200/60 truncate">
          Request Details
        </h2>

        <div className="space-y-3 md:space-y-5 w-full box-border">
          <div className="space-y-1.5 md:space-y-2 w-full min-w-0 box-border">
            <Label
              htmlFor="title"
              className="text-[10px] md:text-[13px] font-medium text-zinc-700"
            >
              Subject *
            </Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g. Master bathroom sink is draining slowly"
              className="h-9 md:h-10 bg-zinc-50/50 focus:ring-zinc-950 border-zinc-200/60 text-[11px] md:text-sm block w-full min-w-0 max-w-full box-border appearance-none m-0 px-3"
              required
            />
          </div>

          <div className="space-y-1.5 md:space-y-2 w-full min-w-0 box-border">
            <Label
              htmlFor="description"
              className="text-[10px] md:text-[13px] font-medium text-zinc-700"
            >
              Detailed Context *
            </Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Please describe the issue in detail. When did it start? Are there any specific error codes?"
              className="min-h-[80px] md:min-h-[120px] bg-zinc-50/50 focus:ring-zinc-950 border-zinc-200/60 resize-y text-[11px] md:text-sm block w-full min-w-0 max-w-full box-border appearance-none m-0 p-3"
              required
            />
          </div>
        </div>
      </div>

      {/* --- SECTION: VISUAL EVIDENCE --- */}
      <MediaUpload files={uploadedFiles} setFiles={setUploadedFiles} />

      {/* --- SECTION: ACTIONS --- */}
      <div className="bg-white rounded-lg md:rounded-lg border border-zinc-200/60 p-4 md:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 w-full box-border">
        <p className="text-[10px] md:text-[13px] text-zinc-500 max-w-md break-words text-center sm:text-left leading-relaxed">
          Upon submission, our dispatch team will review your request and
          schedule a technician. You can track the status of this ticket in your
          dashboard.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-3 w-full sm:w-auto box-border">
          <Button
            type="button"
            variant="outline"
            className="h-9 md:h-11 px-4 md:px-6 rounded-md text-[11px] md:text-[14px] w-full sm:w-auto border-zinc-200/60 hover:bg-zinc-50/50 shrink-0"
            onClick={() => router.back()}
          >
            Cancel
          </Button>

          <div className="w-full sm:w-auto min-w-0">
            {/* Note: Ensure your <SubmitButton /> internally scales down gracefully or pass props if necessary */}
            <SubmitButton pending={isPending} />
          </div>
          <Toaster position="top-right" />
        </div>
      </div>
    </form>
  );
}
