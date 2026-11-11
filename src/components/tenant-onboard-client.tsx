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
  CheckmarkBadge01Icon,
  Shield02Icon,
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

import { formatCurrency } from "./transactions-client";
import { DocumentViewer } from "@/components/ui/document-viewer";
import { TenancyDocumentPDFViewer } from "./tenancy-document-pdf-viewer";
import { verifyAndOnboardTenantAction, updateTenantDetailsAction, rejectTenantOnboardingAction } from "@/actions/admin/tenant.action";
import type { TenantRecord } from "@/components/tenant-directory-client";

export default function TenantOnboardClient({ tenant }: { tenant: TenantRecord }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<"verifyAndOnboard" | "rejectOnboarding" | null>(null);
  
  // Rejection state
  const [rejectReason, setRejectReason] = useState("Fraudulent Documents");
  const [suspendUser, setSuspendUser] = useState(false);

  // Media Viewer
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [isViewingDocument, setIsViewingDocument] = useState(false);

  // Payment Verification State
  const [amountPaid, setAmountPaid] = useState<number | "">(
    tenant.pendingPayment?.amount || tenant.lease.totalRentAmount || 0
  );

  // Identity Form State
  const [editName, setEditName] = useState(tenant.user.name || "");
  const [editPhone, setEditPhone] = useState(tenant.user.phone || "");
  const [editGhanaCard, setEditGhanaCard] = useState(tenant.user.ghanaCardNumber === "Not Provided" ? "" : (tenant.user.ghanaCardNumber || ""));
  const [editFacePhoto, setEditFacePhoto] = useState<File | null>(null);
  
  const [removeExistingFace, setRemoveExistingFace] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Physical Card In-Person Verification Check (NIA L.I. 2523)
  const [isGhanaCardChecked, setIsGhanaCardChecked] = useState(
    tenant.user.kycStatus === "Verified" || tenant.checklist.ghanaCardVerified === "Verified"
  );

  const executeConfirmedAction = () => {
    if (confirmAction === "verifyAndOnboard") {
      startTransition(async () => {
        try {
          const formData = new FormData();
          formData.append("leaseId", tenant.lease.id);
          
          // Inject identity modifications
          formData.append("name", editName);
          formData.append("phone", editPhone);
          if (editFacePhoto) formData.append("facePhoto", editFacePhoto);
          formData.append("removeFace", String(removeExistingFace));
          formData.append("userId", tenant.user.id);
          formData.append("ghanaCardNumber", editGhanaCard || tenant.user.ghanaCardNumber || "");
          formData.append("isGhanaCardChecked", String(isGhanaCardChecked));
          
          // Amount paid confirmed by admin
          const finalAmount = amountPaid !== "" && Number(amountPaid) > 0 
            ? Number(amountPaid) 
            : (tenant.pendingPayment?.amount || tenant.lease.totalRentAmount || 0);
          formData.append("amountPaid", String(finalAmount));
          
          const res = await verifyAndOnboardTenantAction(formData);
          if (res.success) {
            toast.success(res.message);
            router.push("/admin/manage/tenants");
            router.refresh();
          } else {
            toast.error(res.error || "Failed to complete onboarding.");
          }
        } catch (error) {
          toast.error("An unexpected error occurred.");
        } finally {
          setConfirmAction(null);
        }
      });
    } else if (confirmAction === "rejectOnboarding") {
      startTransition(async () => {
        try {
          const formData = new FormData();
          formData.append("leaseId", tenant.lease.id);
          formData.append("userId", tenant.user.id);
          formData.append("reason", rejectReason);
          formData.append("suspendUser", String(suspendUser));

          const res = await rejectTenantOnboardingAction(formData);
          if (res.success) {
            toast.success(res.message);
            router.push("/admin/manage/tenants");
            router.refresh();
          } else {
            toast.error(res.error || "Failed to reject onboarding.");
          }
        } catch (error) {
          toast.error("An unexpected error occurred.");
        } finally {
          setConfirmAction(null);
        }
      });
    }
  };

  const saveEditedDetails = async () => {
    setIsSavingEdit(true);
    try {
      const formData = new FormData();
      formData.append("userId", tenant.user.id);
      formData.append("name", editName);
      formData.append("phone", editPhone);
      formData.append("ghanaCardNumber", editGhanaCard);
      if (editFacePhoto) formData.append("facePhoto", editFacePhoto);
      formData.append("removeFace", String(removeExistingFace));

      const res = await updateTenantDetailsAction(formData);
      if (res.success) {
        toast.success("Identity details saved successfully.");
        setEditFacePhoto(null);
        setRemoveExistingFace(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update details.");
      }
    } catch (e) {
      toast.error("Failed to update details.");
    } finally {
      setIsSavingEdit(false);
    }
  };

  const hasFacePhoto = (tenant.user.securityPhotoUrl && !removeExistingFace) || !!editFacePhoto;
  const hasGhanaCardNumber = Boolean(
    (editGhanaCard || tenant.user.ghanaCardNumber) &&
    (editGhanaCard || tenant.user.ghanaCardNumber) !== "Not Provided" &&
    (editGhanaCard || tenant.user.ghanaCardNumber)!.length >= 10
  );
  const needsDocs = !hasFacePhoto || !hasGhanaCardNumber || !isGhanaCardChecked;

  if (isViewingDocument && tenant) {
    return (
      <TenancyDocumentPDFViewer
        selectedActivation={tenant}
        onBack={() => setIsViewingDocument(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
          <div className="space-y-1">
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors duration-160"
            >
              <HugeiconsIcon icon={ArrowLeft02Icon} size={14} />
              <span>Back to Tenant Directory</span>
            </button>
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">
              Tenant Onboarding & Verification
            </h1>
            <p className="text-xs text-zinc-500">
              Physical identity attestation and payment confirmation for{" "}
              <span className="font-semibold text-zinc-800">{tenant.lease.propertyName} ({tenant.lease.unitNumber})</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            <Badge variant="outline" className="h-6 px-2.5 text-[11px] font-medium bg-amber-50 text-amber-800 border-amber-200/80">
              Pending Verification
            </Badge>
          </div>
        </div>

        {/* Master Unified Form Container */}
        <div className="bg-white border border-zinc-200/80 rounded-xl shadow-xs divide-y divide-zinc-200/70 overflow-hidden">
          
          {/* Top Tenant Summary Strip */}
          <div className="p-5 sm:p-6 bg-zinc-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <Avatar className="h-12 w-12 border border-zinc-200/80 shrink-0">
                <AvatarImage src={tenant.user.profilePicture} />
                <AvatarFallback className="bg-zinc-100 text-zinc-700 font-medium text-sm">
                  {tenant.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-sm font-semibold text-zinc-900">{tenant.user.name}</h2>
                <p className="text-xs text-zinc-500">{tenant.user.email} • {tenant.user.phone || "No phone"}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-zinc-600 sm:border-l sm:border-zinc-200/60 sm:pl-6">
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider">Lease Term</span>
                <span className="font-medium text-zinc-800">{tenant.lease.startDate} — {tenant.lease.endDate}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider">Total Rent</span>
                <span className="font-semibold text-zinc-900 font-tabular-nums">{formatCurrency(tenant.lease.totalRentAmount)}</span>
              </div>
            </div>
          </div>

          {/* Section 1: In-Person Identity Verification (NIA L.I. 2523) */}
          <div className="p-5 sm:p-6 space-y-5">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-zinc-900">
                  1. In-Person Identity Verification
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-500">
                  <HugeiconsIcon icon={Shield02Icon} size={14} className="text-zinc-400" />
                  NIA L.I. 2523 Compliant
                </span>
              </div>
              <p className="text-xs text-zinc-500 mt-0.5">
                Inspect original Ghana Card in office. Storing digital scans or photocopies is prohibited by law.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Form Fields: 7 cols */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700">Full Legal Name</label>
                    <Input 
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="h-9 text-xs rounded-md border-zinc-200/90 bg-white focus-visible:ring-1 focus-visible:ring-zinc-900"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-zinc-700">Phone Number</label>
                    <Input 
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="e.g. +233..."
                      className="h-9 text-xs rounded-md border-zinc-200/90 bg-white focus-visible:ring-1 focus-visible:ring-zinc-900"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-700">National ID Number (Ghana Card)</label>
                    {hasGhanaCardNumber && (
                      <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={11} /> Format Valid
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400 select-none font-medium pointer-events-none">
                      GHA-
                    </span>
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
                      placeholder="123456789-0"
                      className="h-9 pl-13 text-xs font-mono rounded-md border-zinc-200/90 bg-white focus-visible:ring-1 focus-visible:ring-zinc-900"
                    />
                  </div>
                </div>

                {/* Ghana Card Physical Inspection Check Button */}
                <div className="pt-1">
                  <label className="text-xs font-medium text-zinc-700 block mb-1.5">
                    Physical Card Inspection Attestation <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsGhanaCardChecked(!isGhanaCardChecked)}
                    className={`w-full text-left p-3.5 rounded-lg border transition-all duration-160 ease-out active:scale-[0.98] flex items-start gap-3 ${
                      isGhanaCardChecked 
                        ? "bg-zinc-900 border-zinc-900 text-white shadow-xs" 
                        : "bg-white border-zinc-200/90 text-zinc-900 hover:border-zinc-300 hover:bg-zinc-50/60"
                    }`}
                  >
                    <div className={`mt-0.5 h-4 w-4 rounded flex items-center justify-center shrink-0 transition-colors ${
                      isGhanaCardChecked ? "bg-white text-zinc-900" : "border border-zinc-300 bg-white"
                    }`}>
                      {isGhanaCardChecked && <HugeiconsIcon icon={CheckmarkCircle01Icon} size={13} className="text-zinc-900" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold">
                          {isGhanaCardChecked ? "Physical Ghana Card Inspected & Verified" : "Confirm Physical Card Inspection"}
                        </span>
                        <span className={`text-[10px] font-mono uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded ${
                          isGhanaCardChecked ? "bg-zinc-800 text-emerald-400" : "bg-zinc-100 text-zinc-500"
                        }`}>
                          {isGhanaCardChecked ? "Verified in Person" : "Pending Inspection"}
                        </span>
                      </div>
                      <p className={`text-[11px] leading-relaxed mt-1 ${isGhanaCardChecked ? "text-zinc-300" : "text-zinc-500"}`}>
                        Admin attestation: Tenant presented their original physical card in office. No card scans stored pursuant to NIA L.I. 2523.
                      </p>
                    </div>
                  </button>
                </div>

                <div className="flex justify-end pt-1">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={saveEditedDetails}
                    disabled={isSavingEdit}
                    className="h-8 text-xs font-medium border-zinc-200 text-zinc-700 hover:bg-zinc-50 duration-160 ease-out active:scale-[0.98]"
                  >
                    {isSavingEdit ? "Saving..." : "Save Identity Changes"}
                  </Button>
                </div>
              </div>

              {/* Right Column: Security Selfie Portrait (5 cols) */}
              <div className="lg:col-span-5 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-700">Security Face Photo (Live Selfie)</label>
                  {(tenant.user.securityPhotoUrl || editFacePhoto) && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditFacePhoto(null);
                        if (tenant.user.securityPhotoUrl) setRemoveExistingFace(true);
                      }}
                      className="text-[11px] text-zinc-400 hover:text-rose-600 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {!editFacePhoto && (!tenant.user.securityPhotoUrl || removeExistingFace) ? (
                  <label className="h-48 w-full flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300 transition-colors cursor-pointer group">
                    <HugeiconsIcon icon={Alert01Icon} size={22} className="text-zinc-400 group-hover:text-zinc-600 mb-2 transition-colors" />
                    <span className="text-xs font-medium text-zinc-700">Tap to Take Live Selfie</span>
                    <span className="text-[10px] text-zinc-400 mt-0.5">Passport-style front view</span>
                    <Input 
                      type="file"
                      accept="image/*"
                      capture="user"
                      onChange={(e) => setEditFacePhoto(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                  </label>
                ) : (
                  <div 
                    onClick={() => setExpandedImage(editFacePhoto ? URL.createObjectURL(editFacePhoto) : tenant.user.securityPhotoUrl!)}
                    className="h-48 w-full bg-zinc-50 rounded-lg border border-zinc-200/80 overflow-hidden cursor-pointer hover:opacity-95 transition-opacity relative group"
                  >
                    <img 
                      src={editFacePhoto ? URL.createObjectURL(editFacePhoto) : tenant.user.securityPhotoUrl} 
                      alt="Security Selfie" 
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-xs font-medium bg-black/60 px-2.5 py-1 rounded backdrop-blur-xs">
                        Click to Enlarge
                      </span>
                    </div>
                  </div>
                )}
                <p className="text-[10px] text-zinc-400 text-center">
                  Live verification portrait taken in the office.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Manual Payment Verification */}
          <div className="p-5 sm:p-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                2. Manual Payment Verification
              </h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Confirm receipt of funds against the WhatsApp transfer receipt or bank statement.
              </p>
            </div>

            {/* Payment Summary Box */}
            <div className="p-4 rounded-lg border border-zinc-200/70 bg-zinc-50/50 space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider mb-0.5">Booking Reference</span>
                  <span className="font-mono font-medium text-zinc-900 select-all">{tenant.pendingPayment?.reference || "Pending"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider mb-0.5">Payment Method</span>
                  <span className="font-medium text-zinc-900 capitalize">
                    {tenant.pendingPayment?.channel === "mobile_money" ? "Mobile Money" : "Bank Transfer"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-semibold text-zinc-400 block tracking-wider mb-0.5">Expected Lease Rent</span>
                  <span className="font-semibold text-zinc-900 font-tabular-nums">{formatCurrency(tenant.lease.totalRentAmount)}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-200/60 max-w-sm space-y-1.5">
                <label className="text-xs font-medium text-zinc-700 block">
                  Confirmed Amount Received (GHS) <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400">GH₵</span>
                  <Input 
                    type="number"
                    step="0.01"
                    min="1"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value === "" ? "" : Number(e.target.value))}
                    className="pl-11 h-9 text-xs font-mono font-tabular-nums bg-white rounded-md border-zinc-200/90 focus-visible:ring-1 focus-visible:ring-zinc-900"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-[11px] text-zinc-500">
                  Input the exact confirmed deposit or rent amount shown on the transfer receipt.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Tenancy Agreement */}
          <div className="p-5 sm:p-6 space-y-3">
            <h3 className="text-sm font-semibold text-zinc-900">
              3. Tenancy Agreement
            </h3>
            
            <div className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-200/70 bg-white">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-md bg-zinc-50 border border-zinc-200/80 flex items-center justify-center shrink-0">
                  <HugeiconsIcon icon={FileDownloadIcon} size={16} className="text-zinc-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-zinc-900">Signed Tenancy Agreement PDF</p>
                  <p className="text-[11px] text-zinc-400">Legally binding electronically signed lease</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={13} /> Signed
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsViewingDocument(true)}
                  disabled={tenant.checklist.leaseSigned !== "Signed"}
                  className="h-8 text-xs font-medium border-zinc-200 text-zinc-800 hover:bg-zinc-50 duration-160 ease-out active:scale-[0.98]"
                >
                  View Agreement
                </Button>
              </div>
            </div>
          </div>

          {/* Section 4: Actions & Approval Bar */}
          <div className="p-5 sm:p-6 bg-zinc-50/60 rounded-b-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="text-xs text-zinc-500 max-w-md">
              {!hasFacePhoto ? (
                <span className="text-amber-600 font-medium">⚠️ Live security selfie is required.</span>
              ) : !hasGhanaCardNumber ? (
                <span className="text-amber-600 font-medium">⚠️ Valid Ghana Card number is required.</span>
              ) : !isGhanaCardChecked ? (
                <span className="text-amber-600 font-medium">⚠️ Confirm the physical Ghana Card inspection check above.</span>
              ) : (
                <span className="text-emerald-700 font-medium">✓ Ready to activate lease and provision Tuya Smart Lock access.</span>
              )}
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button 
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setConfirmAction("rejectOnboarding")}
                className="flex-1 sm:flex-none h-10 px-4 text-xs font-medium border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 duration-160 ease-out active:scale-[0.98]"
              >
                Reject Application
              </Button>

              <Button 
                type="button"
                disabled={needsDocs || isPending}
                onClick={() => setConfirmAction("verifyAndOnboard")}
                className="flex-1 sm:flex-none h-10 px-5 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg shadow-sm duration-160 ease-out active:scale-[0.98] disabled:opacity-40"
              >
                {isPending ? (
                  <><HugeiconsIcon icon={Loading03Icon} className="animate-spin mr-1.5" size={14} /> Processing...</>
                ) : (
                  "Verify Payment & Grant Access"
                )}
              </Button>
            </div>
          </div>

        </div>

      </div>

      <DocumentViewer imageUrl={expandedImage} onClose={() => setExpandedImage(null)} />

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-zinc-900">
              {confirmAction === "verifyAndOnboard" ? "Verify Payment & Dispatch Keys" : "Reject Application"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-zinc-500 leading-relaxed">
              {confirmAction === "verifyAndOnboard" 
                ? "By confirming, you verify that the tenant's physical Ghana Card matches the person present and that the payment is confirmed. This will activate their lease, record the transaction, and dispatch property credentials."
                : "This action will cancel the lease, mark the pending transaction as failed, free up the property listing, and notify the user."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {confirmAction === "verifyAndOnboard" && (
            <div className="mt-4 p-4 rounded-lg border border-zinc-200/80 bg-zinc-50/70 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Booking Reference</span>
                <span className="font-mono font-medium text-zinc-900">{tenant.pendingPayment?.reference || "Pending"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Payment Channel</span>
                <span className="capitalize font-medium text-zinc-900">
                  {tenant.pendingPayment?.channel === "mobile_money" ? "Mobile Money" : "Bank Transfer"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Confirmed Amount Received</span>
                <span className="font-semibold text-zinc-900 font-tabular-nums">
                  GH₵ {Number(amountPaid || tenant.lease.totalRentAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
          
          {confirmAction === "verifyAndOnboard" && tenant.user.kycStatus === "Verified" && (
            <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200/60 rounded-lg">
              <div className="flex items-start gap-3">
                <HugeiconsIcon icon={CheckmarkBadge01Icon} className="text-emerald-600 shrink-0" size={20} />
                <div>
                  <h4 className="text-[13px] font-bold text-emerald-900 mb-1">VIP Fast-Track Available</h4>
                  <p className="text-[11px] text-emerald-700/90 leading-relaxed">
                    This tenant is already verified with a valid Ghana Card on file.
                  </p>
                </div>
              </div>
            </div>
          )}

          {confirmAction === "rejectOnboarding" && (
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-2 block">Reason for Rejection</label>
                <select 
                  className="w-full h-10 px-3 text-[14px] rounded-md border border-zinc-200/60 bg-white text-zinc-900 outline-none focus:border-zinc-400"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                >
                  <option value="Fraudulent Documents">Fraudulent Documents</option>
                  <option value="Payment Failed">Payment Failed</option>
                  <option value="Suspicious Activity">Suspicious Activity</option>
                  <option value="Tenant Withdrew">Tenant Withdrew</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="suspend-user" 
                  checked={suspendUser} 
                  onChange={(e) => setSuspendUser(e.target.checked)} 
                  className="rounded border-zinc-300"
                />
                <label htmlFor="suspend-user" className="text-[13px] text-zinc-700 font-medium">Suspend User Account</label>
              </div>
            </div>
          )}

          <AlertDialogFooter className="mt-6 gap-2 sm:gap-0">
            <AlertDialogCancel disabled={isPending} className="h-10 text-[13px] font-semibold border-zinc-200/60 hover:bg-zinc-50 rounded-lg">Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={executeConfirmedAction} 
              disabled={isPending} 
              className={`h-10 text-[13px] font-semibold rounded-lg duration-160 ease-out active:scale-[0.98] ${confirmAction === "rejectOnboarding" ? "bg-rose-600 hover:bg-rose-700 text-white" : "bg-zinc-900 hover:bg-zinc-800 text-white"}`}
            >
              {isPending ? <><HugeiconsIcon icon={Loading03Icon} className="animate-spin mr-2" size={14} /> Processing...</> : 
               confirmAction === "rejectOnboarding" ? "Confirm Rejection" : "Verify Payment & Dispatch Keys"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
