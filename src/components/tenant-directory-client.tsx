"use client";

import { useMemo, useState, useTransition, useEffect } from "react";
import { toast } from "sonner";
import {
  Alert01Icon,
  CheckmarkCircle01Icon,
  FilterIcon,
  Key01Icon,
  Search01Icon,
  Loading03Icon,
  Cancel01Icon,
  FileDownloadIcon,
  Clock01Icon,
  MoreHorizontalIcon,
  Shield02Icon,
  Building03Icon,
  File01Icon,
  CheckmarkBadge01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { formatCurrency } from "./transactions-client";
import { DocumentViewer } from "./ui/document-viewer";
import { TenancyDocument } from "./lease-document viewer";

import { toggleAccountStatus, verifyAndOnboardTenantAction, updateTenantDetailsAction } from "@/actions/admin/tenant.action";
import {
  activateLeaseAndGeneratePin,
  approveTenantPaperwork,
  rejectTenantPaperwork,
} from "@/actions/admin/onboarding.action";
import { 
  remoteUnlockAction,
  generateVendorPinAction,
  resetTenantPinAction,
  revokeTemporaryPinAction
} from "@/actions/admin/smartlock.action";

// --- TYPES ---
type TabStage = "all" | "pending" | "active";
type ActionType = "approve" | "reject" | "pin" | "suspend" | "restore" | "remoteUnlock" | "vendorPin" | "resetPin" | "revokePin" | "verifyAndOnboard";

export interface TenantRecord {
  id: string;
  pipelineStage: "pending" | "active";
  status: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profilePicture: string;
    kycStatus: string;
    ghanaCardNumber: string;
    ghanaCardUrl: string;
    securityPhotoUrl: string;
    accountStatus: string;
  };
  lease: {
    id: string;
    propertyName: string;
    propertyLocation: string;
    location: string;
    region: string;
    unitNumber: string;
    propertyImage: string | null;
    startDate: string;
    endDate: string;
    documentUrl?: string;
    totalRentAmount: number;
    smartLockCode: string;
    signatureAudit?: {
      isSigned: boolean;
      signedAt: string;
      ipAddress: string;
      typedName: string;
      documentHash: string;
    };
  };
  checklist: {
    depositPaid: boolean;
    ghanaCardVerified: "Pending" | "Verified" | "Not_Uploaded" | "Rejected";
    leaseSigned: "Pending" | "Signed";
  };
  transactions: Array<{
    id: string;
    date: string;
    purpose: string;
    amount: number;
    status: string;
  }>;
  smartLock?: {
    tuyaDeviceId: string;
    status: string;
    batteryLevel: string;
    online: boolean;
    activeTempPins?: Array<{
      pinId: string;
      name: string;
      pinMasked: string;
      expiresAt: string;
    }>;
  };
  smartLockPin?: string;
}

interface TenantDirectoryClientProps {
  data: TenantRecord[];
  availableProperties: string[];
  initialTab?: TabStage;
}

// --- UTILS ---
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getLeaseBadgeStyle = (status: string) => {
  const styles: Record<string, string> = {
    Active: "bg-zinc-900 text-zinc-50 ",
    Pending_Balance: "bg-zinc-100/50 text-zinc-700 ring-1 ring-zinc-200/80",
    Pending_Deposit: "bg-zinc-100/50 text-zinc-700 ring-1 ring-zinc-200/80",
    Expired: "bg-rose-50 text-rose-700 ring-1 ring-rose-200/50",
    Cancelled: "bg-zinc-50 text-zinc-500 ring-1 ring-zinc-200",
  };
  return styles[status] || "bg-zinc-50 text-zinc-600 ring-1 ring-zinc-200";
};

// --- MAIN COMPONENT ---
export default function TenantDirectoryClient({
  data,
  availableProperties,
  initialTab = "active",
}: TenantDirectoryClientProps) {
  const [activeTab, setActiveTab] = useState<TabStage>(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("all");
  
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);
  const [isViewingDocument, setIsViewingDocument] = useState<boolean>(false);
  
  const [confirmAction, setConfirmAction] = useState<ActionType | null>(null);
  const [vendorPinName, setVendorPinName] = useState("");
  const [vendorPinHours, setVendorPinHours] = useState(2);
  // Removed old verify modal states
  const [removeExistingFace, setRemoveExistingFace] = useState(false);
  const [removeExistingCard, setRemoveExistingCard] = useState(false);
  const [pinToRevoke, setPinToRevoke] = useState<{ pinId: string; name: string } | null>(null);
  const [newPinResult, setNewPinResult] = useState<{ pin: string; name: string } | null>(null);

  // Edit-in-place state
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [editPhone, setEditPhone] = useState("");
  const [editGhanaCard, setEditGhanaCard] = useState("");
  const [editFacePhoto, setEditFacePhoto] = useState<File | null>(null);
  const [editCardScan, setEditCardScan] = useState<File | null>(null);
  const [isSavingEdit, startEditTransition] = useTransition();

  const [isPending, startTransition] = useTransition();

  const [unlockCountdown, setUnlockCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (unlockCountdown !== null && unlockCountdown > 0) {
      const timer = setTimeout(() => setUnlockCountdown(c => (c ? c - 1 : null)), 1000);
      return () => clearTimeout(timer);
    } else if (unlockCountdown === 0) {
      setUnlockCountdown(null);
    }
  }, [unlockCountdown]);

  const handleInlineRemoteUnlock = async (deviceId: string) => {
    startTransition(async () => {
      const result = await remoteUnlockAction(deviceId);
      if (result.success) {
        toast.success("Lock opened successfully.");
        setUnlockCountdown(5);
      } else {
        toast.error(result.error || "Failed to unlock door.");
      }
    });
  };

  const selectedTenant = useMemo(() => {
    return data.find((r) => r.id === selectedTenantId) || null;
  }, [data, selectedTenantId]);

  const filteredData = useMemo(() => {
    return data.filter((record) => {
      const matchesTab = activeTab === "all" || record.pipelineStage === activeTab;
      const matchesSearch =
        record.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.lease.propertyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesProperty = propertyFilter === "all" || record.lease.propertyName === propertyFilter;

      return matchesTab && matchesSearch && matchesProperty;
    });
  }, [data, activeTab, searchQuery, propertyFilter]);

  const awaitingCount = data.filter((r) => r.pipelineStage === "pending").length;

  const isLegalApproved =
    selectedTenant?.checklist.ghanaCardVerified === "Verified" &&
    selectedTenant?.checklist.leaseSigned === "Signed";

  const saveEditedDetails = () => {
    if (!selectedTenant) return;
    startEditTransition(async () => {
      const formData = new FormData();
      formData.append("userId", selectedTenant.user.id);
      if (editPhone !== selectedTenant.user.phone) formData.append("phone", editPhone);
      if (editGhanaCard !== (selectedTenant.user.ghanaCardNumber || "")) formData.append("ghanaCardNumber", editGhanaCard);
      if (editFacePhoto) formData.append("facePhoto", editFacePhoto);
      if (editCardScan) formData.append("cardScan", editCardScan);
      if (removeExistingFace && !editFacePhoto) formData.append("removeFacePhoto", "true");
      if (removeExistingCard && !editCardScan) formData.append("removeCardScan", "true");

      const result = await updateTenantDetailsAction(formData);
      if (result.success) {
        toast.success(result.message);
        setIsEditingDetails(false);
        setEditFacePhoto(null);
        setEditCardScan(null);
        setRemoveExistingFace(false);
        setRemoveExistingCard(false);
      } else {
        toast.error(result.error || "Failed to update tenant details.");
      }
    });
  };

  const executeConfirmedAction = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedTenant || !confirmAction) return;

    startTransition(async () => {
      let result;
      if (confirmAction === "verifyAndOnboard") {
          const formData = new FormData();
          formData.append("leaseId", selectedTenant.id);
          formData.append("userId", selectedTenant.user.id);
          formData.append("ghanaCardNumber", selectedTenant.user.ghanaCardNumber || "");
          result = await verifyAndOnboardTenantAction(formData);
        } else if (confirmAction === "approve") {
        result = await approveTenantPaperwork(selectedTenant.id, selectedTenant.user.id);
      } else if (confirmAction === "reject") {
        result = await rejectTenantPaperwork(selectedTenant.id, selectedTenant.user.id);
      } else if (confirmAction === "pin") {
        result = await activateLeaseAndGeneratePin(selectedTenant.id);
      } else if (confirmAction === "suspend") {
        result = await toggleAccountStatus(selectedTenant.user.id, "Active");
      } else if (confirmAction === "restore") {
        result = await toggleAccountStatus(selectedTenant.user.id, "Suspended");
      } else if (confirmAction === "remoteUnlock") {
        if (!selectedTenant.smartLock?.tuyaDeviceId) {
          toast.error("No smart lock device found for this property.");
          setConfirmAction(null);
          return;
        }
        result = await remoteUnlockAction(selectedTenant.smartLock.tuyaDeviceId);
      } else if (confirmAction === "vendorPin") {
        if (!selectedTenant.smartLock?.tuyaDeviceId) return;
        if (!vendorPinName.trim()) {
          toast.error("Please enter a name for this temporary PIN.");
          return;
        }
        result = await generateVendorPinAction(selectedTenant.smartLock.tuyaDeviceId, vendorPinHours, vendorPinName.trim());
        if (result?.success) {
           setNewPinResult({ pin: result.pin as string, name: vendorPinName.trim() });
           setConfirmAction(null);
           setVendorPinName("");
           setVendorPinHours(2);
           return;
        }
      } else if (confirmAction === "revokePin") {
        if (!selectedTenant.smartLock?.tuyaDeviceId || !pinToRevoke) return;
        result = await revokeTemporaryPinAction(selectedTenant.smartLock.tuyaDeviceId, pinToRevoke.pinId);
        if (result?.success) {
           toast.success(`Revoked PIN for ${pinToRevoke.name}`);
           setConfirmAction(null);
           setPinToRevoke(null);
           return;
        }
      } else if (confirmAction === "resetPin") {
        if (!selectedTenant.smartLock?.tuyaDeviceId) return;
        result = await resetTenantPinAction(selectedTenant.smartLock.tuyaDeviceId, selectedTenant.lease.id);
      }

      if (result?.success) {
        toast.success(result.message || "Action completed successfully.");
        if (["approve", "reject", "pin"].includes(confirmAction)) {
           // We could close or keep open, up to UX. Let's keep open so they see state update.
        }
      } else {
        toast.error(result?.error || "An error occurred.");
      }
      setConfirmAction(null);
    });
  };

  const requestAction = (action: ActionType, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setConfirmAction(action);
  };

  const dialogContent = {
    approve: {
      title: "Verify Tenant",
      description: "Are you sure you want to approve this tenant's ID and Tenancy Agreement? This confirms their identity and prepares them for move-in.",
      confirmText: "Yes, Verify",
      confirmClass: "bg-black text-white hover:bg-zinc-800",
    },
    reject: {
      title: "Reject Paperwork",
      description: "Are you sure you want to reject these documents? The tenant will be notified to submit new documentation.",
      confirmText: "Yes, Reject",
      confirmClass: "bg-black text-white hover:bg-zinc-800",
    },
    verifyAndOnboard: {
      title: "Verify Identity & Grant Access",
      description: "You confirm that you have physically verified the tenant's Ghana Card in the office. This will provision the Tuya smart lock, change the lease status to Active, and instantly email the access credentials.",
      confirmText: "Verify & Grant Access",
      confirmClass: "bg-black text-white hover:bg-zinc-800",
    },
    pin: {
      title: "Activate Lease & Generate PIN",
      description: "This will provision the Tuya smart lock, change the lease status to Active, and instantly SMS the access PIN to the tenant.",
      confirmText: "Activate & Grant Access",
      confirmClass: "bg-black text-white hover:bg-zinc-800",
    },
    suspend: {
      title: "Suspend Account?",
      description: "This will immediately restrict the tenant's access to their digital portal. Their smart lock PIN will remain active unless manually revoked.",
      confirmText: "Suspend Account",
      confirmClass: "bg-rose-600 text-white hover:bg-rose-700",
    },
    restore: {
      title: "Restore Account?",
      description: "This will restore the tenant's access to their digital portal, allowing them to view documents and log maintenance requests.",
      confirmText: "Restore Account",
      confirmClass: "bg-zinc-900 text-white hover:bg-zinc-800",
    },
    remoteUnlock: {
      title: "Remote Unlock",
      description: "Are you sure you want to remotely unlock this door? This action is immediate.",
      confirmText: "Unlock Door",
      confirmClass: "bg-amber-500 text-white hover:bg-amber-600",
    },
    vendorPin: {
      title: "Generate Temp PIN",
      description: "This will generate a temporary 6-digit PIN valid for the next 2 hours. Use this for maintenance or vendors.",
      confirmText: "Generate PIN",
      confirmClass: "bg-black text-white hover:bg-zinc-800",
    },
    resetPin: {
      title: "Reset Tenant PIN",
      description: "This will instantly revoke the tenant's current PIN and generate a new one. The new PIN will be emailed to them.",
      confirmText: "Reset PIN",
      confirmClass: "bg-rose-600 text-white hover:bg-rose-700",
    },
    revokePin: {
      title: "Revoke Temporary PIN",
      description: `Are you sure you want to revoke the temporary PIN for "${pinToRevoke?.name}"? They will lose access immediately.`,
      confirmText: "Revoke Access",
      confirmClass: "bg-rose-600 text-white hover:bg-rose-700",
    },
  };

  if (isViewingDocument && selectedTenant) {
    // Note: Since TenancyDocument expects `selectedActivation`, we pass selectedTenant as `any` since they share shape
    return (
      <TenancyDocument
        selectedActivation={selectedTenant as any}
        onBack={() => setIsViewingDocument(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200/60 pb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Tenant Directory
            </h1>
            {awaitingCount > 0 && (
              <Badge className="bg-black text-white hover:bg-zinc-800 text-[11px] px-2 h-5 rounded-full">
                {awaitingCount} Pending
              </Badge>
            )}
          </div>

          <Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabStage)} className="w-full md:w-auto">
            <TabsList className="h-9 bg-zinc-100/50 border border-zinc-200/60 p-0.5 rounded-lg">
              <TabsTrigger value="all" className="text-[13px] font-medium data-[state=active]:bg-white rounded-sm px-6">
                All Tenants
              </TabsTrigger>
              <TabsTrigger value="pending" className="text-[13px] font-medium data-[state=active]:bg-white rounded-sm px-6">
                Onboarding
              </TabsTrigger>
              <TabsTrigger value="active" className="text-[13px] font-medium data-[state=active]:bg-white rounded-sm px-6">
                Active Leases
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* SEARCH & FILTER BAR */}
        <section className="flex flex-col xl:flex-row items-center gap-4 bg-white p-1.5 border border-zinc-200/60 rounded-lg shadow-sm w-full">
          <div className="relative flex-1 w-full">
            <HugeiconsIcon icon={Search01Icon} size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <Input
              placeholder="Search by tenant name, email, or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] bg-transparent shadow-none"
            />
          </div>
          <div className="h-4 w-px bg-zinc-200 hidden xl:block" />
          <div className="flex flex-wrap md:flex-nowrap items-center gap-2 w-full xl:w-auto px-2 pb-1 xl:pb-0">
            <Select value={propertyFilter} onValueChange={setPropertyFilter}>
              <SelectTrigger className="w-full md:w-[160px] h-8 border-0 bg-zinc-50/50 hover:bg-zinc-100/50 text-[12px] font-medium text-zinc-700 shadow-none focus:ring-0 rounded-md">
                <SelectValue placeholder="Property" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Properties</SelectItem>
                {availableProperties.map((prop) => (
                  <SelectItem key={prop} value={prop}>{prop}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="h-4 w-px bg-zinc-200 hidden md:block mx-1" />
            <div className="hidden md:flex items-center gap-2 pl-1 pr-2">
              <span className="text-[18px] font-semibold text-zinc-900 leading-none font-tabular-nums">{filteredData.length}</span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">Records</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => { setSearchQuery(""); setPropertyFilter("all"); }}
              className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50 rounded-md"
            >
              <HugeiconsIcon icon={FilterIcon} size={14} />
            </Button>
          </div>
        </section>

        {/* DATA TABLE */}
        <div className="bg-white border border-zinc-200/60 rounded-lg overflow-hidden shadow-sm">
          <Table>
            <TableHeader className="bg-zinc-50/30">
              <TableRow className="border-zinc-200/60 hover:bg-transparent">
                <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[280px]">Tenant Profile</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Property</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Status / Dates</TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">Checklist</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((tenant) => (
                <TableRow
                  key={tenant.id}
                  className="group border-zinc-200/60 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedTenantId(tenant.id)}
                >
                  {/* TENANT PROFILE */}
                  <TableCell className="py-3 align-middle">
                    <div className="flex items-center gap-3">
                      <Avatar className={`h-9 w-9 border shadow-sm ${tenant.user.accountStatus !== "Active" ? "opacity-50 grayscale border-zinc-200/60" : "border-zinc-200/60"}`}>
                        <AvatarImage src={tenant.user.profilePicture} />
                        <AvatarFallback className="bg-zinc-100/50 text-zinc-600 text-xs font-medium">
                          {tenant.user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className={`text-[13px] font-semibold leading-tight tracking-tight ${tenant.user.accountStatus === "Suspended" ? "text-zinc-400 line-through" : "text-zinc-900"}`}>
                            {tenant.user.name}
                          </span>
                          {tenant.user.accountStatus === "Suspended" && (
                            <Badge variant="outline" className="bg-rose-50 text-rose-700 h-4 px-1 py-0 text-[9px] uppercase">Suspended</Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-zinc-500 mt-0.5">{tenant.user.phone}</span>
                      </div>
                    </div>
                  </TableCell>

                  {/* PROPERTY */}
                  <TableCell className="py-3 align-middle">
                    <div className="flex flex-col">
                      <span className="text-[13px] font-medium text-zinc-900 leading-tight">{tenant.lease.propertyName}</span>
                      <span className="text-[11px] text-zinc-500 mt-0.5">{tenant.lease.unitNumber}</span>
                    </div>
                  </TableCell>

                  {/* STATUS */}
                  <TableCell className="py-3 align-middle">
                    <div className="flex flex-col gap-1 items-start">
                      <Badge variant="outline" className={`px-2 py-0 border-0 rounded text-[10px] uppercase tracking-wider font-bold h-5 ${getLeaseBadgeStyle(tenant.status)}`}>
                        {tenant.status.replace(/_/g, " ")}
                      </Badge>
                      {tenant.pipelineStage === "active" && (
                        <span className="text-[11px] text-zinc-500">Exp: {formatDate(tenant.lease.endDate)}</span>
                      )}
                    </div>
                  </TableCell>

                  {/* CHECKLIST */}
                  <TableCell className="py-3 align-middle">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Badge variant="outline" className={`px-1.5 py-0 border-0 rounded text-[9px] uppercase tracking-wider font-bold h-5 flex items-center gap-1 ${tenant.checklist.depositPaid ? "bg-emerald-50/50 text-emerald-700 ring-1 ring-emerald-200/60" : "bg-zinc-100/50 text-zinc-500"}`}>
                        <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} /> Deposit
                      </Badge>
                      <Badge variant="outline" className={`px-1.5 py-0 border-0 rounded text-[9px] uppercase tracking-wider font-bold h-5 flex items-center gap-1 ${tenant.checklist.ghanaCardVerified === "Verified" ? "bg-emerald-50/50 text-emerald-700 ring-1 ring-emerald-200/60" : ""}`}>
                        {tenant.checklist.ghanaCardVerified === "Verified" ? <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} /> : <HugeiconsIcon icon={Clock01Icon} size={10} />} ID
                      </Badge>
                      <Badge variant="outline" className={`px-1.5 py-0 border-0 rounded text-[9px] uppercase tracking-wider font-bold h-5 flex items-center gap-1 ${tenant.checklist.leaseSigned === "Signed" ? "bg-emerald-50/50 text-emerald-700 ring-1 ring-emerald-200/60" : ""}`}>
                        {tenant.checklist.leaseSigned === "Signed" ? <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} /> : <HugeiconsIcon icon={Clock01Icon} size={10} />} Lease
                      </Badge>
                    </div>
                  </TableCell>

                  {/* ACTION DROPDOWN */}
                  <TableCell className="py-3 align-middle text-right" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 rounded-md">
                          <HugeiconsIcon icon={MoreHorizontalIcon} size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-lg shadow-sm border-zinc-200/80 font-sans p-1">
                        <DropdownMenuItem onClick={() => setSelectedTenantId(tenant.id)} className="text-[12px] font-medium cursor-pointer h-8">
                          View Full Profile
                        </DropdownMenuItem>
                        {tenant.pipelineStage === "active" && (
                          <>
                            <div className="h-px bg-zinc-100/50 my-1 mx-2" />
                            <DropdownMenuItem
                              onClick={(e) => requestAction(tenant.user.accountStatus === "Active" ? "suspend" : "restore", e as any)}
                              className={`text-[12px] font-medium cursor-pointer h-8 flex items-center justify-between ${tenant.user.accountStatus === "Active" ? "text-rose-600 focus:text-rose-700 focus:bg-rose-50" : "text-zinc-900"}`}
                            >
                              {tenant.user.accountStatus === "Active" ? "Suspend Account" : "Restore Account"}
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-zinc-500 text-sm">
                    No tenants found matching your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* SMART PROFILE MODAL */}
      <Dialog open={!!selectedTenant} onOpenChange={(open) => !open && setSelectedTenantId(null)}>
        <DialogContent className="w-full sm:max-w-xl md:max-w-2xl p-0 bg-[#FAFAFA] border border-slate-200/80 flex flex-col font-sans shadow-sm rounded-lg max-h-[85vh] overflow-hidden">
          {selectedTenant && (
            <>
              {/* Header */}
              <div className="px-6 py-6 border-b border-zinc-200/60 bg-zinc-50/30 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className={`h-12 w-12 border border-zinc-200/60 shadow-sm ${selectedTenant.user.accountStatus !== "Active" ? "opacity-50 grayscale" : ""}`}>
                    <AvatarImage src={selectedTenant.user.profilePicture} />
                    <AvatarFallback className="bg-zinc-100/50 text-zinc-600 font-medium">
                      {selectedTenant.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-semibold text-zinc-900 tracking-tight">{selectedTenant.user.name}</h2>
                      <Badge variant="outline" className={`px-1.5 py-0 border-0 rounded text-[9px] uppercase tracking-wider font-bold h-4 ${getLeaseBadgeStyle(selectedTenant.status)}`}>
                        {selectedTenant.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-[13px] text-zinc-500 mt-0.5">{selectedTenant.user.email} • {selectedTenant.user.phone}</p>
                  </div>
                </div>
              </div>

              {/* Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-10">
                {selectedTenant.user.accountStatus !== "Active" && (
                  <div className="w-full p-3 rounded-lg flex items-center gap-2 text-xs font-medium bg-rose-50/50 text-rose-700 border border-rose-100">
                    <HugeiconsIcon icon={Cancel01Icon} size={14} /> This account is currently suspended. Portal access is restricted.
                  </div>
                )}

                {/* Property & Lease Details */}
                <section>
                  <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Occupied Asset</h3>
                  <div className="rounded-lg border border-zinc-200/60 overflow-hidden bg-white">
                    <div className="p-4 bg-zinc-50/50 flex gap-4 border-b border-zinc-200/60">
                      <div className="h-12 w-12 shrink-0 bg-white rounded-md overflow-hidden border border-zinc-200/60 shadow-sm">
                        {selectedTenant.lease.propertyImage ? (
                          <img src={selectedTenant.lease.propertyImage} alt="Property" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><HugeiconsIcon icon={Building03Icon} size={16} className="text-zinc-300"/></div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center">
                        <h4 className="text-sm font-semibold tracking-tight text-zinc-900">{selectedTenant.lease.propertyName}</h4>
                        <p className="text-[12px] text-zinc-500 mt-0.5">{selectedTenant.lease.location} · <span className="font-medium text-zinc-700">{selectedTenant.lease.unitNumber}</span></p>
                      </div>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-4 p-4 text-[13px]">
                      <div><dt className="text-zinc-500 mb-1">Lease Start</dt><dd className="font-medium text-zinc-900">{formatDate(selectedTenant.lease.startDate)}</dd></div>
                      <div><dt className="text-zinc-500 mb-1">Lease End</dt><dd className="font-medium text-zinc-900">{formatDate(selectedTenant.lease.endDate)}</dd></div>
                      <div><dt className="text-zinc-500 mb-1">Total Rent</dt><dd className="font-medium text-zinc-900 font-tabular-nums">{formatCurrency(selectedTenant.lease.totalRentAmount).replace("GH", "")}</dd></div>
                      <div><dt className="text-zinc-500 mb-1">Access PIN</dt><dd className="font-mono font-medium tracking-widest text-zinc-900">{selectedTenant.smartLockPin || "N/A"}</dd></div>
                    </dl>
                    {selectedTenant.pipelineStage === "active" && selectedTenant.smartLock && (
                      <div className="p-4 border-t border-zinc-200/60 bg-zinc-50/50 flex flex-col gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5">Hardware Link</p>
                            <div className="flex items-center gap-2 text-[12px] font-medium text-zinc-700">
                               {selectedTenant.smartLock.online ? (
                                 <span className="text-emerald-600 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-600"></span> Online</span>
                               ) : (
                                 <span className="text-rose-600 flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-rose-600"></span> Offline</span>
                               )}
                               <span className="text-zinc-300">•</span>
                               <span className={`capitalize ${selectedTenant.smartLock.batteryLevel === 'low' ? 'text-rose-600 animate-pulse font-bold' : ''}`}>
                                 🔋 {selectedTenant.smartLock.batteryLevel} Battery
                               </span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            <Button 
                              variant="ghost" 
                              className={`h-8 px-3 rounded-md text-[10px] font-bold uppercase tracking-widest border-0 shadow-none transition-colors ${
                                unlockCountdown !== null 
                                  ? 'bg-emerald-50 text-emerald-700 w-36 text-center hover:bg-emerald-50 hover:text-emerald-700' 
                                  : 'bg-amber-50 text-amber-600 hover:bg-amber-100 hover:text-amber-700'
                              }`}
                              onClick={() => handleInlineRemoteUnlock(selectedTenant.smartLock!.tuyaDeviceId)}
                              disabled={!selectedTenant.smartLock.online || isPending || unlockCountdown !== null}
                            >
                              {isPending ? 'Working...' : unlockCountdown !== null ? `Unlocked (${unlockCountdown}s)` : <><HugeiconsIcon icon={Key01Icon} size={12} className="mr-1.5" /> Unlock</>}
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="h-8 px-3 rounded-md text-[10px] font-bold uppercase tracking-widest bg-zinc-100/80 text-zinc-600 hover:bg-zinc-200/80 hover:text-zinc-900 border-0 shadow-none transition-colors" 
                              onClick={() => requestAction("vendorPin")}
                              disabled={!selectedTenant.smartLock.online}
                            >
                              <HugeiconsIcon icon={Clock01Icon} size={12} className="mr-1.5" /> Temp PIN
                            </Button>
                            <Button 
                              variant="ghost" 
                              className="h-8 px-3 rounded-md text-[10px] font-bold uppercase tracking-widest bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700 border-0 shadow-none transition-colors" 
                              onClick={() => requestAction("resetPin")}
                              disabled={!selectedTenant.smartLock.online}
                            >
                              <HugeiconsIcon icon={Shield02Icon} size={12} className="mr-1.5" /> Reset PIN
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                {/* Identity & Documents (Crucial for Onboarding, shown always but actionable in pending) */}
                  <section>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-0">Identity & Documents</h3>
                      {!isEditingDetails && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-7 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black"
                          onClick={() => {
                            setEditPhone(selectedTenant.user.phone || "");
                            setEditGhanaCard(selectedTenant.user.ghanaCardNumber || "");
                            setEditFacePhoto(null);
                            setEditCardScan(null);
                            setIsEditingDetails(true);
                            setRemoveExistingFace(false);
                            setRemoveExistingCard(false);
                          }}
                        >
                          <HugeiconsIcon icon={Alert01Icon} size={12} className="mr-1.5" /> Edit Details
                        </Button>
                      )}
                      {isEditingDetails && (
                        <div className="flex gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-7 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-black"
                            onClick={() => { setIsEditingDetails(false); setRemoveExistingFace(false); setRemoveExistingCard(false); }}
                            disabled={isSavingEdit}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm"
                            className="h-7 text-[10px] font-bold uppercase tracking-widest bg-black text-white hover:bg-zinc-800"
                            onClick={saveEditedDetails}
                            disabled={isSavingEdit}
                          >
                            {isSavingEdit ? "Saving..." : "Save Changes"}
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      {isEditingDetails && (
                        <div className="p-3.5 rounded-lg border border-zinc-200/60 bg-white space-y-3">
                          <div>
                            <label className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-1.5 block">Phone Number</label>
                            <Input 
                              value={editPhone} 
                              onChange={(e) => setEditPhone(e.target.value)} 
                              className="h-9 text-[13px]"
                            />
                          </div>
                        </div>
                      )}

                      {/* ID Card */}
                      <div className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-200/60 bg-white">
                        <div className="flex items-center gap-4 w-full">
                          <div className="h-12 w-12 shrink-0 bg-zinc-50 rounded-md border border-zinc-200/60 flex items-center justify-center">
                            <HugeiconsIcon icon={selectedTenant.user.ghanaCardNumber && selectedTenant.user.ghanaCardNumber !== "Not Provided" ? CheckmarkCircle01Icon : Clock01Icon} size={18} className="text-zinc-400" />
                          </div>
                          <div className="w-full">
                            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-0.5">National ID</p>
                            {isEditingDetails ? (
                              <Input 
                                value={editGhanaCard} 
                                onChange={(e) => setEditGhanaCard(e.target.value)} 
                                className="h-8 text-[13px] font-mono mt-1"
                              />
                            ) : (
                              <p className="font-mono text-[13px] font-medium text-zinc-900 tracking-tight">{selectedTenant.user.ghanaCardNumber || "Not Provided"}</p>
                            )}
                          </div>
                        </div>
                        {!isEditingDetails && <div>{selectedTenant.checklist.ghanaCardVerified === "Verified" ? <HugeiconsIcon icon={CheckmarkCircle01Icon} size={18} /> : <HugeiconsIcon icon={Clock01Icon} size={18} />}</div>}
                      </div>
  
                      {/* Identity Photos */}
                      {(selectedTenant.user.securityPhotoUrl || selectedTenant.user.ghanaCardUrl || isEditingDetails) && (
                        <div className="flex flex-col sm:flex-row gap-3">
                          {/* Face Photo */}
                          {(!removeExistingFace && selectedTenant.user.securityPhotoUrl || isEditingDetails) && (
                            <div className="flex-1 p-3.5 rounded-lg border border-zinc-200/60 bg-white flex flex-col">
                              <div className="flex justify-between items-center mb-2.5">
                                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Security Photo (Face)</p>
                                {isEditingDetails && (selectedTenant.user.securityPhotoUrl || editFacePhoto) && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-5 px-1.5 text-[9px] text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                    onClick={() => {
                                      setEditFacePhoto(null);
                                      if (selectedTenant.user.securityPhotoUrl) setRemoveExistingFace(true);
                                    }}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                              
                              {isEditingDetails && !editFacePhoto && (!selectedTenant.user.securityPhotoUrl || removeExistingFace) ? (
                                <div className="flex-1 flex flex-col justify-center items-center p-4 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors relative cursor-pointer group">
                                  <HugeiconsIcon icon={Alert01Icon} size={20} className="text-zinc-400 group-hover:text-zinc-500 mb-2" />
                                  <p className="text-[10px] font-medium text-zinc-500 text-center">Tap to Take Selfie or Upload</p>
                                  <Input 
                                    type="file" 
                                    accept="image/*" 
                                    capture="user"
                                    onChange={(e) => setEditFacePhoto(e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                  />
                                </div>
                              ) : (
                                <div className="h-40 w-full bg-zinc-50 rounded-md border border-zinc-200/60 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => !isEditingDetails && setExpandedImage(editFacePhoto ? URL.createObjectURL(editFacePhoto) : selectedTenant.user.securityPhotoUrl!)}>
                                  <img src={editFacePhoto ? URL.createObjectURL(editFacePhoto) : selectedTenant.user.securityPhotoUrl} alt="Security Photo" className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          )}
                          
                          {/* Card Scan */}
                          {(!removeExistingCard && selectedTenant.user.ghanaCardUrl || isEditingDetails) && (
                            <div className="flex-1 p-3.5 rounded-lg border border-zinc-200/60 bg-white flex flex-col">
                              <div className="flex justify-between items-center mb-2.5">
                                <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest">Ghana Card Scan</p>
                                {isEditingDetails && (selectedTenant.user.ghanaCardUrl || editCardScan) && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    className="h-5 px-1.5 text-[9px] text-rose-500 hover:text-rose-600 hover:bg-rose-50"
                                    onClick={() => {
                                      setEditCardScan(null);
                                      if (selectedTenant.user.ghanaCardUrl) setRemoveExistingCard(true);
                                    }}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                              
                              {isEditingDetails && !editCardScan && (!selectedTenant.user.ghanaCardUrl || removeExistingCard) ? (
                                <div className="flex-1 flex flex-col justify-center items-center p-4 border-2 border-dashed border-zinc-200 rounded-lg bg-zinc-50 hover:bg-zinc-100 transition-colors relative cursor-pointer group">
                                  <HugeiconsIcon icon={Alert01Icon} size={20} className="text-zinc-400 group-hover:text-zinc-500 mb-2" />
                                  <p className="text-[10px] font-medium text-zinc-500 text-center">Tap to Take Photo or Upload</p>
                                  <Input 
                                    type="file" 
                                    accept="image/*" 
                                    capture="environment"
                                    onChange={(e) => setEditCardScan(e.target.files?.[0] || null)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                                  />
                                </div>
                              ) : (
                                <div className="h-40 w-full bg-zinc-50 rounded-md border border-zinc-200/60 overflow-hidden cursor-pointer hover:opacity-90 transition-opacity" onClick={() => !isEditingDetails && setExpandedImage(editCardScan ? URL.createObjectURL(editCardScan) : selectedTenant.user.ghanaCardUrl!)}>
                                  <img src={editCardScan ? URL.createObjectURL(editCardScan) : selectedTenant.user.ghanaCardUrl} alt="Ghana Card Scan" className="w-full h-full object-cover" />
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}
  
                      {/* Lease Agreement */}
                    <div className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-200/60 bg-white">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-zinc-50 rounded-md border border-zinc-200/60 flex items-center justify-center">
                          <HugeiconsIcon icon={FileDownloadIcon} size={18} className="text-zinc-400" />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-0.5">Tenancy Agreement</p>
                          <button
                            onClick={() => setIsViewingDocument(true)}
                            disabled={selectedTenant.checklist.leaseSigned !== "Signed"}
                            className="text-[13px] font-medium text-zinc-900 hover:underline underline-offset-4 disabled:no-underline disabled:text-zinc-400"
                          >
                            {selectedTenant.checklist.leaseSigned === "Signed" ? "View Signed Document" : "Awaiting Tenant Signature"}
                          </button>
                        </div>
                      </div>
                      <div>{selectedTenant.checklist.leaseSigned === "Signed" ? <HugeiconsIcon icon={CheckmarkCircle01Icon} size={18} /> : <HugeiconsIcon icon={Clock01Icon} size={18} />}</div>
                    </div>
                  </div>
                </section>

                {/* DYNAMIC SECTIONS BASED ON STAGE */}
                {selectedTenant.pipelineStage === "pending" && (
                  <section>
                    <div className="p-5 rounded-lg border border-zinc-200/60 bg-zinc-50/50">
                      <p className="text-[13px] text-zinc-600 leading-relaxed mb-5">
                        <strong className="text-zinc-900 block mb-1">Final Review & Identity Verification</strong>
                        Please review the signed Tenancy Agreement above. Ensure the tenant is physically present in the office with their original Ghana Card. Verify their identity to activate the lease and provision digital access for <span className="font-semibold text-zinc-900">{selectedTenant.lease.propertyName} ({selectedTenant.lease.unitNumber})</span>.
                      </p>
                      <Button className="w-full h-10 bg-zinc-900 text-white hover:bg-zinc-800 text-[13px] font-medium rounded-lg" onClick={() => requestAction("verifyAndOnboard")}>
                        <HugeiconsIcon icon={Key01Icon} size={14} className="mr-2" /> Verify Ghana Card & Grant Access
                      </Button>
                    </div>
                  </section>
                )}

                {selectedTenant.pipelineStage === "active" && (
                  <>
                    {selectedTenant.smartLock?.activeTempPins && selectedTenant.smartLock.activeTempPins.length > 0 && (
                      <section>
                        <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Active Temporary Access</h3>
                        <div className="space-y-2">
                          {selectedTenant.smartLock.activeTempPins.map((pin, i) => (
                            <div key={i} className="flex justify-between items-center p-3 bg-white border border-zinc-200/60 rounded-lg shadow-sm">
                              <div>
                                <p className="text-[13px] font-medium text-zinc-900">{pin.name}</p>
                                <p className="text-[11px] text-zinc-500">Expires {new Date(pin.expiresAt).toLocaleString()}</p>
                              </div>
                              <div className="flex gap-3 items-center">
                                <code className="text-[11px] bg-zinc-100/80 font-mono font-semibold px-2 py-1 rounded text-zinc-700">{pin.pinMasked}</code>
                                <button 
                                  className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 hover:underline"
                                  onClick={() => {
                                    setPinToRevoke({ pinId: pin.pinId, name: pin.name });
                                    setConfirmAction("revokePin");
                                  }}
                                >
                                  Revoke
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    <section>
                    <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Recent Transactions</h3>
                    <div className="space-y-1">
                      {selectedTenant.transactions.length > 0 ? (
                        selectedTenant.transactions.map((tx) => (
                          <div key={tx.id} className="flex items-center justify-between py-2.5 px-3 -mx-3 rounded-lg hover:bg-zinc-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 rounded-full bg-zinc-100/50 flex items-center justify-center border border-zinc-200/60">
                                <HugeiconsIcon icon={File01Icon} size={14} className="text-zinc-500" />
                              </div>
                              <div>
                                <p className="text-[13px] font-medium text-zinc-900 capitalize">{tx.purpose.replace(/_/g, " ")}</p>
                                <p className="text-[11px] text-zinc-500">{tx.date}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-[13px] font-medium text-zinc-900 font-tabular-nums">{formatCurrency(tx.amount).replace("GH", "")}</p>
                              <span className={`text-[10px] font-semibold tracking-wider ${tx.status === "Success" ? "text-teal-600" : tx.status === "Failed" ? "text-rose-600" : "text-amber-600"}`}>{tx.status}</span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-[13px] text-zinc-500 py-4 text-center border border-dashed border-zinc-200/60 rounded-lg">No recent transactions recorded.</p>
                      )}
                    </div>
                  </section>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      <DocumentViewer imageUrl={expandedImage} onClose={() => setExpandedImage(null)} />

      <AlertDialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <AlertDialogContent>
          {confirmAction && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-bold text-zinc-900">{dialogContent[confirmAction].title}</AlertDialogTitle>
                <AlertDialogDescription className="text-[13px] text-zinc-500 leading-relaxed">{dialogContent[confirmAction].description}</AlertDialogDescription>
              </AlertDialogHeader>
              
              {confirmAction === "verifyAndOnboard" && selectedTenant?.user.kycStatus === "Verified" && (
                <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200/60 rounded-lg">
                  <div className="flex items-start gap-3">
                    <HugeiconsIcon icon={CheckmarkBadge01Icon} className="text-emerald-600 shrink-0" size={20} />
                    <div>
                      <h4 className="text-[13px] font-bold text-emerald-900 mb-1">VIP Fast-Track Available</h4>
                      <p className="text-[11px] text-emerald-700/90 leading-relaxed">
                        This tenant is already verified with a valid Ghana Card on file. You do not need to re-upload their documents.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <AlertDialogFooter className="mt-6 gap-2 sm:gap-0">
                <AlertDialogCancel disabled={isPending} className="h-10 text-[13px] font-semibold border-zinc-200/60 hover:bg-zinc-50 rounded-lg">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={executeConfirmedAction} disabled={isPending} className={`h-10 text-[13px] font-semibold rounded-lg ${dialogContent[confirmAction].confirmClass}`}>
                  {isPending ? <><HugeiconsIcon icon={Loading03Icon} className="animate-spin mr-2" size={14} /> Processing...</> : 
                   (confirmAction === "verifyAndOnboard" && selectedTenant?.user.kycStatus === "Verified") ? "Approve & Dispatch Keys" : dialogContent[confirmAction].confirmText}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
      
      <AlertDialog open={!!newPinResult} onOpenChange={(open) => !open && setNewPinResult(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-bold text-zinc-900">Temporary PIN Generated</AlertDialogTitle>
            <AlertDialogDescription className="text-[13px] text-zinc-500 leading-relaxed">
              Successfully generated an access code for <strong className="text-zinc-900 font-semibold">{newPinResult?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="bg-zinc-50 border border-zinc-200/80 rounded-lg p-6 my-4 text-center">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-2">Access Code</p>
            <p className="font-mono text-3xl font-bold tracking-[0.2em] text-zinc-900">{newPinResult?.pin}</p>
          </div>
          <p className="text-[12px] text-rose-600 font-medium text-center">
            Please copy this code now. For security reasons, the full PIN will not be shown again.
          </p>
          <AlertDialogFooter className="mt-4">
            <AlertDialogAction onClick={() => setNewPinResult(null)} className="w-full h-10 text-[13px] font-semibold bg-black text-white hover:bg-zinc-800 rounded-lg">
              Done
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
