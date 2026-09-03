
"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Alert01Icon,
  CheckmarkCircle01Icon,
  Loading03Icon,
  FileDownloadIcon,
  Clock01Icon,
  ArrowLeft02Icon,
  ViewIcon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

import { DocumentViewer } from "@/components/ui/document-viewer";
import { verifyAndOnboardTenantAction, updateTenantDetailsAction } from "@/actions/admin/tenant.action";
import type { TenantRecord } from "@/components/tenant-directory-client";
import Image from "next/image";

export default function TenantEditClient({ tenant }: { tenant: TenantRecord }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
    
  // Media Viewer
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [isViewingDocument, setIsViewingDocument] = useState(false);

  // Identity Form State (Always visible)
  const [editName, setEditName] = useState(tenant.user.name || "");
  const [editPhone, setEditPhone] = useState(tenant.user.phone || "");
  const [editGhanaCard, setEditGhanaCard] = useState(tenant.user.ghanaCardNumber === "Not Provided" ? "" : (tenant.user.ghanaCardNumber || ""));
  const [editFacePhoto, setEditFacePhoto] = useState<File | null>(null);
  const [editCardScan, setEditCardScan] = useState<File | null>(null);
  
  const [removeExistingFace, setRemoveExistingFace] = useState(false);
  const [removeExistingCard, setRemoveExistingCard] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const saveEditedDetails = async () => {
    setIsSavingEdit(true);
    try {
      const formData = new FormData();
      formData.append("userId", tenant.user.id);
      formData.append("name", editName);
          formData.append("phone", editPhone);
      formData.append("ghanaCardNumber", editGhanaCard);
      if (editFacePhoto) formData.append("facePhoto", editFacePhoto);
      if (editCardScan) formData.append("cardScan", editCardScan);
      
      formData.append("removeFace", String(removeExistingFace));
      formData.append("removeCard", String(removeExistingCard));

      const res = await updateTenantDetailsAction(formData);
      if (res.success) {
        toast.success("Documents saved successfully.");
        setEditFacePhoto(null);
        setEditCardScan(null);
        setRemoveExistingFace(false);
        setRemoveExistingCard(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update documents.");
      }
    } catch (e) {
      toast.error("Failed to update details.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const hasFacePhoto = (tenant.user.securityPhotoUrl && !removeExistingFace) || !!editFacePhoto;
  const hasCardScan = (tenant.user.ghanaCardUrl && !removeExistingCard) || !!editCardScan;
  const hasGhanaCardNumber = editGhanaCard || tenant.user.ghanaCardNumber;
  const needsDocs = tenant.user.kycStatus !== "Verified" && (!hasFacePhoto || !hasCardScan || !hasGhanaCardNumber || hasGhanaCardNumber === "Not Provided" || hasGhanaCardNumber.length < 15);

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-12 font-sans">
      <div className="max-w-[800px] mx-auto space-y-6">
        
        {/* Back Button & Title */}
        <div className="flex items-center gap-4 border-b border-zinc-200/60 pb-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8 text-zinc-500 hover:text-zinc-900">
            <HugeiconsIcon icon={ArrowLeft02Icon} size={18} />
          </Button>
          <h1 className="text-xl font-semibold tracking-tight text-zinc-900">Tenant Onboarding</h1>
        </div>

        {/* Card 1: Header Box */}
        <div className="bg-white border border-zinc-200/80 shadow rounded-xl p-6 md:p-8 flex flex-col gap-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border border-zinc-200/60 ">
                <AvatarImage src={tenant.user.profilePicture} />
                <AvatarFallback className="bg-zinc-100/50 text-zinc-600 font-medium text-xl">
                  {tenant.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-semibold text-zinc-900 tracking-tight">{tenant.user.name}</h2>
                  <Badge variant="outline" className="px-2 py-0 border-0 rounded text-[10px] uppercase tracking-wider font-bold h-5 bg-zinc-50 text-zinc-700 ring-1 ring-zinc-200/60">
                    Pending
                  </Badge>
                </div>
                <p className="text-[14px] text-zinc-500">{tenant.user.email} � {tenant.user.phone}</p>
              </div>
            </div>
          </div>
          
          {/* Stepper */}
          <div className="flex items-center gap-2 pt-2">
            <div className="flex items-center gap-1.5 flex-1">
              <div className="h-8 flex items-center justify-center rounded-full bg-emerald-50 text-emerald-700 px-4 text-[11px] font-bold border border-emerald-200/60">
                <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="mr-1.5" /> Lease Signed
              </div>
              <div className="h-px bg-zinc-200 flex-1"></div>
              <div className={`h-8 flex items-center justify-center rounded-full ${tenant.checklist.ghanaCardVerified === "Verified" ? "bg-emerald-50 text-emerald-700 border-emerald-200/60" : "bg-white text-zinc-500 border-zinc-200/60 "} px-4 text-[11px] font-bold border`}>
                {tenant.checklist.ghanaCardVerified === "Verified" && <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="mr-1.5" />} ID Uploaded
              </div>
              <div className="h-px bg-zinc-200 flex-1"></div>
              <div className="h-8 flex items-center justify-center rounded-full bg-zinc-50 text-zinc-400 px-4 text-[11px] font-bold border border-zinc-200/60">
                Office Verification
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: Identity & Documents */}
        <div className="bg-white border border-zinc-200/80 shadow rounded-xl p-6 md:p-8">
          <section>
            <div className="mb-6">
              <h3 className="text-base font-bold text-zinc-900 tracking-tight mb-1">1. Identity Capture & Documents</h3>
              <p className="text-[14px] text-zinc-500">Capture or update the tenant's physical identification documents. These are required before granting access.</p>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg border border-zinc-200/60 bg-zinc-50/50">
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-2 block">Full Legal Name</label>
                  <Input 
                    value={editName} 
                    onChange={(e) => setEditName(e.target.value)} 
                    className="h-10 text-[14px] bg-white font-medium"
                    placeholder="Enter full legal name"
                  />
                </div>
                
                <div className="p-4 rounded-lg border border-zinc-200/60 bg-zinc-50/50">
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-2 block">Phone Number</label>
                  <Input 
                    value={editPhone} 
                    onChange={(e) => setEditPhone(e.target.value)} 
                    className="h-10 text-[14px] bg-white"
                  />
                </div>

                <div className="p-4 rounded-lg border border-zinc-200/60 bg-zinc-50/50">
                  <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-2 flex items-center justify-between">
                    <span>National ID Number</span>
                    {tenant.user.ghanaCardNumber && tenant.user.ghanaCardNumber !== "Not Provided" && (
                      <span className="text-emerald-600 flex items-center gap-1 text-[9px]"><HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} /> VERIFIED</span>
                    )}
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-[14px] font-mono text-zinc-500 font-medium select-none pointer-events-none">GHA-</span>
                    <Input 
                      value={editGhanaCard ? editGhanaCard.replace(/^GHA-?/i, '') : ''} 
                      onChange={(e) => {
                        let raw = e.target.value.replace(/[^\d]/g, '').slice(0, 10);
                        let formatted = raw;
                        if (raw.length > 9) {
                          formatted = `${raw.slice(0, 9)}-${raw.slice(9)}`;
                        }
                        setEditGhanaCard(formatted ? `GHA-${formatted}` : '');
                      }} 
                      className="h-10 pl-[50px] text-[14px] rounded-md font-mono bg-white"
                      placeholder="123456789-0"
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {/* Face Photo */}
                <div className="flex-1 p-4 rounded-lg border border-zinc-200/60 bg-zinc-50/50 flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Security Photo (Face)</p>
                    {(tenant.user.securityPhotoUrl || editFacePhoto) && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-2 text-[10px] text-zinc-500 hover:text-zinc-600 hover:bg-zinc-50"
                        onClick={() => {
                          setEditFacePhoto(null);
                          if (tenant.user.securityPhotoUrl) setRemoveExistingFace(true);
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  {!editFacePhoto && (!tenant.user.securityPhotoUrl || removeExistingFace) ? (
                    <div className="flex-1 flex flex-col justify-center items-center p-6 border-2 border-dashed border-zinc-300 rounded-lg bg-white hover:bg-zinc-50 transition-colors relative cursor-pointer group min-h-[160px]">
                      <HugeiconsIcon icon={Alert01Icon} size={24} className="text-zinc-400 group-hover:text-zinc-500 mb-3" />
                      <p className="text-xs font-medium text-zinc-500 text-center">Tap to Take Selfie</p>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        capture="user"
                        onChange={(e) => setEditFacePhoto(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                    </div>
                  ) : (
                    <div className="h-48 relative w-full bg-zinc-50 rounded-md border border-zinc-200/60 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity  group" onClick={() => setExpandedImage(editFacePhoto ? URL.createObjectURL(editFacePhoto) : tenant.user.securityPhotoUrl!)}>
                      <Image fill src={editFacePhoto ? URL.createObjectURL(editFacePhoto) : tenant.user.securityPhotoUrl} alt="Security Photo" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-md backdrop-blur-sm">Click to Enlarge</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Card Scan */}
                <div className="flex-1 p-4 rounded-lg border border-zinc-200/60 bg-zinc-50/50 flex flex-col">
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Ghana Card Scan</p>
                    {(tenant.user.ghanaCardUrl || editCardScan) && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="h-6 px-2 text-[10px] text-zinc-500 hover:text-zinc-600 hover:bg-zinc-50"
                        onClick={() => {
                          setEditCardScan(null);
                          if (tenant.user.ghanaCardUrl) setRemoveExistingCard(true);
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  
                  {!editCardScan && (!tenant.user.ghanaCardUrl || removeExistingCard) ? (
                    <div className="flex-1 flex flex-col justify-center items-center p-6 border-2 border-dashed border-zinc-300 rounded-lg bg-white hover:bg-zinc-50 transition-colors relative cursor-pointer group min-h-[160px]">
                      <HugeiconsIcon icon={Alert01Icon} size={24} className="text-zinc-400 group-hover:text-zinc-500 mb-3" />
                      <p className="text-xs font-medium text-zinc-500 text-center">Tap to Scan ID</p>
                      <Input 
                        type="file" 
                        accept="image/*" 
                        capture="environment"
                        onChange={(e) => setEditCardScan(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                      />
                    </div>
                  ) : (
                    <div className="h-48 w-full bg-zinc-50 rounded-md border border-zinc-200/60 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity relative group" onClick={() => setExpandedImage(editCardScan ? URL.createObjectURL(editCardScan) : tenant.user.ghanaCardUrl!)}>
                      <img src={editCardScan ? URL.createObjectURL(editCardScan) : tenant.user.ghanaCardUrl} alt="Ghana Card Scan" className="w-full h-full object-contain" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs font-medium bg-black/60 px-3 py-1.5 rounded-md backdrop-blur-sm">Click to Enlarge</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

                </div>
            </section>
          </div>

        {/* Card 3: Tenancy Agreement */}
        <div className="bg-white border border-zinc-200/80 shadow rounded-xl p-6 md:p-8">
          <section>
            <div className="mb-6">
              <h3 className="text-base font-bold text-zinc-900 tracking-tight mb-1">2. Tenancy Agreement</h3>
              <p className="text-[14px] text-zinc-500">Review the legally binding lease agreement that has been electronically signed by the tenant.</p>
            </div>
            
            <div className="flex items-center justify-between p-5 rounded-lg border border-zinc-200/60 bg-zinc-50/50">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-white rounded-md border border-zinc-200/80  flex items-center justify-center">
                  <HugeiconsIcon icon={FileDownloadIcon} size={18} className="text-zinc-600" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-0.5">Signed Lease Document</p>
                  <button
                    onClick={() => setIsViewingDocument(true)}
                    disabled={tenant.checklist.leaseSigned !== "Signed"}
                    className="flex items-center gap-1.5 text-[14px] font-medium text-zinc-900 hover:underline underline-offset-4 disabled:no-underline disabled:text-zinc-400"
                  >
                    <HugeiconsIcon icon={ViewIcon} size={16} />
                    {tenant.checklist.leaseSigned === "Signed" ? "View Signed Document" : "Awaiting Tenant Signature"}
                  </button>
                </div>
              </div>
              <div>{tenant.checklist.leaseSigned === "Signed" ? <HugeiconsIcon icon={CheckmarkCircle01Icon} size={22} className="text-emerald-600" /> : <HugeiconsIcon icon={Clock01Icon} size={22} className="text-zinc-500" />}</div>
            </div>
          </section>
        </div>

        
        <div className="pt-4 flex justify-end">
          <Button 
            disabled={isSavingEdit}
            onClick={saveEditedDetails}
            className="h-12 px-8 bg-zinc-900 text-white hover:bg-zinc-800 text-[14px] font-semibold rounded-xl transition-all disabled:opacity-50" 
          >
            {isSavingEdit ? "Saving Changes..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <DocumentViewer imageUrl={expandedImage} onClose={() => setExpandedImage(null)} />

      

    </div>
  );
}
