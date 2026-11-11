"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Loading03Icon,
  ArrowLeft02Icon,
  FileDownloadIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
  verifyAndOnboardTenantAction,
  updateTenantDetailsAction,
  rejectTenantOnboardingAction,
} from "@/actions/admin/tenant.action";
import type { TenantRecord } from "@/components/tenant-directory-client";

export default function TenantOnboardClient({ tenant }: { tenant: TenantRecord }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirmAction, setConfirmAction] = useState<"verifyAndOnboard" | "rejectOnboarding" | null>(null);

  // Rejection state
  const [rejectReason, setRejectReason] = useState("Fraudulent Documents");
  const [suspendUser, setSuspendUser] = useState(false);

  // Document & Image viewers
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [isViewingDocument, setIsViewingDocument] = useState(false);

  // Payment confirmation state
  const [amountPaid, setAmountPaid] = useState<number | "">(
    tenant.pendingPayment?.amount || tenant.lease.totalRentAmount || 0
  );

  // Identity Form State
  const [editName, setEditName] = useState(tenant.user.name || "");
  const [editPhone, setEditPhone] = useState(tenant.user.phone || "");
  const [editGhanaCard, setEditGhanaCard] = useState(
    tenant.user.ghanaCardNumber === "Not Provided" ? "" : tenant.user.ghanaCardNumber || ""
  );
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
          formData.append("userId", tenant.user.id);
          formData.append("name", editName);
          formData.append("phone", editPhone);
          if (editFacePhoto) formData.append("facePhoto", editFacePhoto);
          formData.append("removeFace", String(removeExistingFace));
          formData.append("ghanaCardNumber", editGhanaCard || tenant.user.ghanaCardNumber || "");
          formData.append("isGhanaCardChecked", String(isGhanaCardChecked));

          const finalAmount =
            amountPaid !== "" && Number(amountPaid) > 0
              ? Number(amountPaid)
              : tenant.pendingPayment?.amount || tenant.lease.totalRentAmount || 0;
          formData.append("amountPaid", String(finalAmount));

          const res = await verifyAndOnboardTenantAction(formData);
          if (res.success) {
            toast.success(res.message);
            router.push("/admin/manage/tenants");
            router.refresh();
          } else {
            toast.error(res.error || "Failed to complete onboarding.");
          }
        } catch {
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
        } catch {
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
        toast.success("Identity details saved.");
        setEditFacePhoto(null);
        setRemoveExistingFace(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update details.");
      }
    } catch {
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
  const canSubmit = hasFacePhoto && hasGhanaCardNumber && isGhanaCardChecked;

  if (isViewingDocument && tenant) {
    return (
      <TenancyDocumentPDFViewer
        selectedActivation={tenant}
        onBack={() => setIsViewingDocument(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/60 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation & Header */}
        <div className="space-y-1">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors duration-160"
          >
            <HugeiconsIcon icon={ArrowLeft02Icon} size={14} />
            <span>Tenants</span>
          </button>
          <div className="flex items-baseline justify-between pt-1">
            <h1 className="text-lg font-semibold tracking-tight text-zinc-900">
              Onboard Tenant
            </h1>
            <span className="text-xs text-zinc-500">
              {tenant.lease.propertyName} • Unit {tenant.lease.unitNumber}
            </span>
          </div>
        </div>

        {/* Master Form Container */}
        <div className="bg-white border border-zinc-200/90 rounded-xl divide-y divide-zinc-100 shadow-2xs">
          
          {/* Tenant Summary Strip */}
          <div className="p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar className="h-10 w-10 border border-zinc-200 shrink-0">
                <AvatarImage src={tenant.user.profilePicture} />
                <AvatarFallback className="bg-zinc-100 text-zinc-700 text-xs font-medium">
                  {tenant.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-medium text-zinc-900 truncate">{tenant.user.name}</p>
                <p className="text-xs text-zinc-500 truncate">{tenant.user.email} • {tenant.user.phone || "No phone"}</p>
              </div>
            </div>

            <div className="text-right shrink-0">
              <p className="text-xs text-zinc-500">Total Rent</p>
              <p className="text-sm font-semibold font-tabular-nums text-zinc-900">
                {formatCurrency(tenant.lease.totalRentAmount)}
              </p>
            </div>
          </div>

          {/* Section 1: In-Person Identity Verification */}
          <div className="p-5 space-y-4">
            <h2 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
              Identity Verification
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-start">
              {/* Form Fields (7 cols) */}
              <div className="sm:col-span-7 space-y-3.5">
                <div className="space-y-1">
                  <label htmlFor="legalName" className="text-xs font-medium text-zinc-700">
                    Full Legal Name
                  </label>
                  <Input
                    id="legalName"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-9 text-xs rounded-lg border-zinc-200 bg-white focus-visible:ring-1 focus-visible:ring-zinc-900"
                    placeholder="Full legal name"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="phoneNumber" className="text-xs font-medium text-zinc-700">
                    Phone Number
                  </label>
                  <Input
                    id="phoneNumber"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="h-9 text-xs rounded-lg border-zinc-200 bg-white focus-visible:ring-1 focus-visible:ring-zinc-900"
                    placeholder="+233..."
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="ghanaCard" className="text-xs font-medium text-zinc-700">
                    Ghana Card Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono text-zinc-400 select-none pointer-events-none font-medium">
                      GHA-
                    </span>
                    <Input
                      id="ghanaCard"
                      value={editGhanaCard ? editGhanaCard.replace(/^GHA-?/i, "") : ""}
                      onChange={(e) => {
                        const raw = e.target.value.replace(/[^\d]/g, "").slice(0, 10);
                        const formatted = raw.length > 9 ? `${raw.slice(0, 9)}-${raw.slice(9)}` : raw;
                        setEditGhanaCard(formatted ? `GHA-${formatted}` : "");
                      }}
                      className="h-9 pl-12 text-xs font-mono rounded-lg border-zinc-200 bg-white focus-visible:ring-1 focus-visible:ring-zinc-900"
                      placeholder="123456789-0"
                    />
                  </div>
                </div>

                {/* Restrained Physical Verification Checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2.5 p-3 rounded-lg border border-zinc-200/90 bg-zinc-50/50 hover:bg-zinc-50 cursor-pointer transition-colors duration-160">
                    <input
                      type="checkbox"
                      checked={isGhanaCardChecked}
                      onChange={(e) => setIsGhanaCardChecked(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 cursor-pointer accent-zinc-900"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-medium text-zinc-900 block leading-tight">
                        Original Ghana Card verified in person
                      </span>
                      <span className="text-[11px] text-zinc-500 block mt-0.5 leading-normal">
                        Physical card inspected in office. No card scans stored.
                      </span>
                    </div>
                  </label>
                </div>

                <div className="flex justify-end pt-0.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={saveEditedDetails}
                    disabled={isSavingEdit}
                    className="h-7 text-xs text-zinc-600 hover:text-zinc-900 px-2"
                  >
                    {isSavingEdit ? "Saving..." : "Save details"}
                  </Button>
                </div>
              </div>

              {/* Security Selfie (5 cols) */}
              <div className="sm:col-span-5 space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-medium text-zinc-700">Security Photo</label>
                  {(tenant.user.securityPhotoUrl || editFacePhoto) && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditFacePhoto(null);
                        if (tenant.user.securityPhotoUrl) setRemoveExistingFace(true);
                      }}
                      className="text-xs text-zinc-400 hover:text-rose-600 transition-colors"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {!editFacePhoto && (!tenant.user.securityPhotoUrl || removeExistingFace) ? (
                  <label className="h-44 w-full flex flex-col items-center justify-center border border-dashed border-zinc-200 rounded-lg bg-zinc-50/50 hover:bg-zinc-50 hover:border-zinc-300 cursor-pointer transition-colors duration-160">
                    <span className="text-xs font-medium text-zinc-700">Take live selfie</span>
                    <span className="text-[11px] text-zinc-400 mt-0.5">Front camera portrait</span>
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
                    onClick={() =>
                      setExpandedImage(
                        editFacePhoto ? URL.createObjectURL(editFacePhoto) : tenant.user.securityPhotoUrl!
                      )
                    }
                    className="h-44 w-full bg-zinc-50 rounded-lg border border-zinc-200 overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
                  >
                    <img
                      src={
                        editFacePhoto
                          ? URL.createObjectURL(editFacePhoto)
                          : tenant.user.securityPhotoUrl
                      }
                      alt="Security Portrait"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Payment Verification */}
          <div className="p-5 space-y-3">
            <h2 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
              Payment Verification
            </h2>

            <div className="grid grid-cols-3 gap-3 text-xs py-2 px-3 rounded-lg bg-zinc-50/70 border border-zinc-200/60">
              <div>
                <span className="text-zinc-500 block">Reference</span>
                <span className="font-mono font-medium text-zinc-900 select-all">
                  {tenant.pendingPayment?.reference || "Pending"}
                </span>
              </div>
              <div>
                <span className="text-zinc-500 block">Channel</span>
                <span className="font-medium text-zinc-900 capitalize">
                  {tenant.pendingPayment?.channel === "mobile_money" ? "Mobile Money" : "Bank Transfer"}
                </span>
              </div>
              <div className="text-right">
                <span className="text-zinc-500 block">Expected</span>
                <span className="font-semibold text-zinc-900 font-tabular-nums">
                  {formatCurrency(tenant.lease.totalRentAmount)}
                </span>
              </div>
            </div>

            <div className="max-w-xs space-y-1 pt-1">
              <label htmlFor="confirmedAmount" className="text-xs font-medium text-zinc-700">
                Confirmed Amount Received
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-zinc-400">
                  GH₵
                </span>
                <Input
                  id="confirmedAmount"
                  type="number"
                  step="0.01"
                  min="1"
                  value={amountPaid}
                  onChange={(e) =>
                    setAmountPaid(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  className="pl-11 h-9 text-xs font-mono font-tabular-nums rounded-lg border-zinc-200 bg-white focus-visible:ring-1 focus-visible:ring-zinc-900"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Tenancy Agreement */}
          <div className="p-5 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-semibold text-zinc-900 uppercase tracking-wider">
                Tenancy Agreement
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                {tenant.checklist.leaseSigned === "Signed"
                  ? "Signed electronically by tenant"
                  : "Awaiting tenant signature"}
              </p>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsViewingDocument(true)}
              disabled={tenant.checklist.leaseSigned !== "Signed"}
              className="h-8 text-xs font-medium border-zinc-200 text-zinc-800 hover:bg-zinc-50 duration-160 ease-out active:scale-[0.98]"
            >
              <HugeiconsIcon icon={FileDownloadIcon} size={14} className="mr-1.5 text-zinc-500" />
              View Agreement
            </Button>
          </div>

          {/* Footer Actions */}
          <div className="p-5 bg-zinc-50/50 rounded-b-xl flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setConfirmAction("rejectOnboarding")}
              className="h-9 px-4 text-xs font-medium border-zinc-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 duration-160 ease-out active:scale-[0.98]"
            >
              Reject Application
            </Button>

            <Button
              type="button"
              disabled={!canSubmit || isPending}
              onClick={() => setConfirmAction("verifyAndOnboard")}
              className="h-9 px-4 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg shadow-2xs duration-160 ease-out active:scale-[0.98] disabled:opacity-40"
            >
              {isPending ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} className="animate-spin mr-1.5" size={14} />
                  Processing...
                </>
              ) : (
                "Verify & Grant Access"
              )}
            </Button>
          </div>

        </div>

      </div>

      <DocumentViewer imageUrl={expandedImage} onClose={() => setExpandedImage(null)} />

      {/* Confirmation & Rejection Dialog */}
      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base font-semibold text-zinc-900">
              {confirmAction === "verifyAndOnboard" ? "Confirm Onboarding" : "Reject Application"}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-zinc-500 leading-relaxed">
              {confirmAction === "verifyAndOnboard"
                ? `Activate lease for ${tenant.lease.propertyName} (${tenant.lease.unitNumber}) and record payment of GH₵ ${Number(amountPaid || tenant.lease.totalRentAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })}.`
                : "Cancel the lease and free up the listing unit."}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {confirmAction === "rejectOnboarding" && (
            <div className="mt-3 space-y-3">
              <div className="space-y-1">
                <label htmlFor="rejectReason" className="text-xs font-medium text-zinc-700">
                  Reason
                </label>
                <select
                  id="rejectReason"
                  className="w-full h-9 px-2.5 text-xs rounded-lg border border-zinc-200 bg-white text-zinc-900 outline-none focus:border-zinc-400"
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

              <label className="flex items-center gap-2 pt-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={suspendUser}
                  onChange={(e) => setSuspendUser(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-zinc-300 text-zinc-900 accent-zinc-900"
                />
                <span className="text-xs text-zinc-600">Suspend user account</span>
              </label>
            </div>
          )}

          <AlertDialogFooter className="mt-4 gap-2 sm:gap-0">
            <AlertDialogCancel
              disabled={isPending}
              className="h-8 text-xs font-medium border-zinc-200 hover:bg-zinc-50 rounded-lg"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={executeConfirmedAction}
              disabled={isPending}
              className={`h-8 text-xs font-medium rounded-lg duration-160 ease-out active:scale-[0.98] ${
                confirmAction === "rejectOnboarding"
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-zinc-900 hover:bg-zinc-800 text-white"
              }`}
            >
              {isPending ? (
                <>
                  <HugeiconsIcon icon={Loading03Icon} className="animate-spin mr-1.5" size={14} />
                  Processing...
                </>
              ) : confirmAction === "rejectOnboarding" ? (
                "Confirm Rejection"
              ) : (
                "Confirm & Activate"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
