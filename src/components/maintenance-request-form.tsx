"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// Checkbox is imported but not used in the layout you provided, I left it just in case
import { Checkbox } from "@/components/ui/checkbox"; 
import { MediaUpload } from "@/components/media-upload";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/submit-button";

// 1. IMPORT THE REAL ACTION
import { submitMaintenanceRequest, ActionState } from "@/actions/maintenance.action";

// 2. DEFINE INITIAL STATE
const initialState: ActionState = { success: false, message: "" };

export default function MaintenanceRequestForm() {
  const router = useRouter();
  
  // 3. USE THE REAL ACTION HERE (Replaced mockAction with submitMaintenanceRequest)
  const [state, formAction] = useActionState(submitMaintenanceRequest, initialState);
  
  const [isPending, startTransition] = useTransition();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (state.success) {
      toast.success(state.message); // Use the real message from the server (e.g. "Ticket MNT-12345 submitted")
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
    
    // Append the files from React state into the FormData object
    uploadedFiles.forEach((file) => {
      formData.append("media", file);
    });

    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      
      {/* --- SECTION: ISSUE CLASSIFICATION --- */}
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <h2 className="text-[18px] font-medium text-slate-900 mb-6 pb-3 border-b border-slate-200">
          Issue Classification
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-slate-700">Service Category *</Label>
            <Select name="category" required>
              <SelectTrigger className="h-10 bg-slate-50 focus:ring-zinc-950">
                <SelectValue placeholder="Select the affected area" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Plumbing">Plumbing & Water</SelectItem>
                <SelectItem value="Electrical">Electrical & Lighting</SelectItem>
                <SelectItem value="HVAC">Air Conditioning & HVAC</SelectItem>
                <SelectItem value="Smart_Lock">Smart Lock & Access</SelectItem>
                <SelectItem value="Appliances">Provided Appliances</SelectItem>
                <SelectItem value="Structural">Structural (Doors, Windows, Walls)</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-[13px] font-medium text-slate-700">Priority Level *</Label>
            <Select name="priority" defaultValue="Routine">
              <SelectTrigger className="h-10 bg-slate-50 focus:ring-zinc-950">
                <SelectValue placeholder="Assess the urgency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Low">Low (No immediate impact on living)</SelectItem>
                <SelectItem value="Routine">Routine (Standard maintenance)</SelectItem>
                <SelectItem value="High">High (Impacting daily comfort)</SelectItem>
                <SelectItem value="Emergency">Emergency (Active leak, security breach, etc.)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
  
      {/* --- SECTION: REQUEST DETAILS --- */}
      <div className="bg-white rounded-lg border border-slate-200 p-8">
        <h2 className="text-[18px] font-medium text-slate-900 mb-6 pb-3 border-b border-slate-200">
          Request Details
        </h2>
        
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[13px] font-medium text-slate-700">Subject *</Label>
            <Input 
              id="title" 
              name="title" 
              placeholder="e.g. Master bathroom sink is draining slowly" 
              className="h-10 bg-slate-50 focus:ring-zinc-950" 
              required 
            />
          </div>
  
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[13px] font-medium text-slate-700">Detailed Context *</Label>
            <Textarea 
              id="description" 
              name="description" 
              placeholder="Please describe the issue in detail. When did it start? Are there any specific error codes?" 
              className="min-h-[120px] bg-slate-50 focus:ring-zinc-950 resize-y" 
              required 
            />
          </div>
        </div>
      </div>

      {/* --- SECTION: VISUAL EVIDENCE --- */}
      <MediaUpload files={uploadedFiles} setFiles={setUploadedFiles} />
      
      {/* --- SECTION: ACTIONS --- */}
      <div className="bg-white rounded-lg border border-slate-200 p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[13px] text-slate-500 max-w-md">
          Upon submission, our dispatch team will review your request and schedule a technician. You can track the status of this ticket in your dashboard.
        </p>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button 
            type="button" 
            variant="outline" 
            className="h-11 px-6 rounded-md text-[14px] w-full sm:w-auto" 
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          
          <div className="w-full sm:w-auto">
            <SubmitButton pending={isPending} /> 
          </div>
          <Toaster position="top-right"/>
        </div>
      </div>
    </form>
  );
}