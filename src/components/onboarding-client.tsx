"use client";

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
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

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
  activateLeaseAndGeneratePin,
  approveTenantPaperwork,
  rejectTenantPaperwork,
} from "@/actions/admin/onboarding.action";
import { TenancyDocument } from "./lease-document viewer";

// IMPORT YOUR NEW ISOLATED COMPONENT HERE

// --- TYPES ---
type TabStage = "pending" | "active";
type ActionType = "approve" | "reject" | "pin";

interface ActivationRecord {
  id: string;
  pipelineStage: TabStage;
  status:
    | "Awaiting_Payment"
    | "Pending_Verification"
    | "Awaiting_Admin_Approval"
    | "Active"
    | "Expired"
    | "Cancelled";
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    profilePicture: string;
    ghanaCardNumber: string;
    ghanaCardUrl: string;
  };
  lease: {
    id: string;
    propertyName: string;
    propertyLocation?: string;
    unitNumber: string;
    startDate: string;
    endDate?: string;
    documentUrl?: string;
    totalRentAmount: number;
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
  smartLockPin?: string;
}

interface ActivationsClientProps {
  data: ActivationRecord[];
  availableProperties: string[];
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// --- MAIN COMPONENT ---
export default function OnboardingClient({
  data,
  availableProperties,
}: ActivationsClientProps) {
  const [activeTab, setActiveTab] = useState<TabStage>("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [propertyFilter, setPropertyFilter] = useState("all");

  const [selectedActivationId, setSelectedActivationId] = useState<
    string | null
  >(null);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const [isViewingDocument, setIsViewingDocument] = useState<boolean>(false);
  const [confirmAction, setConfirmAction] = useState<ActionType | null>(null);
  const [isPending, startTransition] = useTransition();

  const selectedActivation = useMemo(() => {
    return data.find((r) => r.id === selectedActivationId) || null;
  }, [data, selectedActivationId]);

  // Tab Filtering matches the server's pipelineStage exactly
  const filteredData = useMemo(() => {
    return data.filter((record) => {
      const matchesTab = record.pipelineStage === activeTab;
      const matchesSearch =
        record.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.lease.propertyName
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesProperty =
        propertyFilter === "all" ||
        record.lease.propertyName === propertyFilter;

      return matchesTab && matchesSearch && matchesProperty;
    });
  }, [data, activeTab, searchQuery, propertyFilter]);

  const awaitingCount = data.filter(
    (r) => r.pipelineStage === "pending",
  ).length;

  const isLegalApproved =
    selectedActivation?.checklist.ghanaCardVerified === "Verified" &&
    selectedActivation?.checklist.leaseSigned === "Signed";

  const executeConfirmedAction = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedActivation || !confirmAction) return;

    startTransition(async () => {
      let result;
      if (confirmAction === "approve") {
        result = await approveTenantPaperwork(
          selectedActivation.id,
          selectedActivation.user.id,
        );
      } else if (confirmAction === "reject") {
        result = await rejectTenantPaperwork(
          selectedActivation.id,
          selectedActivation.user.id,
        );
      } else if (confirmAction === "pin") {
        result = await activateLeaseAndGeneratePin(selectedActivation.id);
      }

      if (result?.success) {
        toast.success(result.message || "Action completed successfully.");
      } else {
        toast.error(result?.error || "An error occurred.");
      }
      setConfirmAction(null);
    });
  };

  const dialogContent = {
    approve: {
      title: "Verify Tenant",
      description:
        "Are you sure you want to approve this tenant's ID and Tenancy Agreement? This confirms their identity and prepares them for move-in.",
      confirmText: "Yes, Verify",
      confirmClass: "bg-black text-white hover:bg-zinc-800",
    },
    reject: {
      title: "Reject Paperwork",
      description:
        "Are you sure you want to reject these documents? The tenant will be notified to submit new documentation.",
      confirmText: "Yes, Reject",
      confirmClass: "bg-black text-white hover:bg-zinc-800",
    },
    pin: {
      title: "Activate Lease & Generate PIN",
      description:
        "This will provision the Tuya smart lock, change the lease status to Active, and instantly SMS the access PIN to the tenant.",
      confirmText: "Activate & Grant Access",
      confirmClass: "bg-black text-white hover:bg-zinc-800",
    },
  };

  // =====================================================================
  // INVOCATION OF THE ISOLATED DOCUMENT COMPONENT
  // =====================================================================
  if (isViewingDocument && selectedActivation) {
    return (
      <TenancyDocument
        selectedActivation={selectedActivation}
        onBack={() => setIsViewingDocument(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
      <div className="max-w-[1400px] mx-auto space-y-6">
        {/* PAGE HEADER & TWO-TAB PIPELINE */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200/60 pb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Lease Activations
            </h1>
            {awaitingCount > 0 && (
              <Badge
                variant="secondary"
                className="bg-black text-white hover:bg-zinc-800 text-[11px] px-2 h-5 flex items-center justify-center rounded-full"
              >
                {awaitingCount} Pending
              </Badge>
            )}
          </div>

          <Tabs
            value={activeTab}
            onValueChange={(val) => setActiveTab(val as TabStage)}
            className="w-full md:w-auto"
          >
            <TabsList className="h-9 bg-zinc-100/50 border border-zinc-200/60 p-0.5 rounded-lg">
              <TabsTrigger
                value="pending"
                className="text-[13px] font-medium data-[state=active]:bg-white rounded-sm px-6"
              >
                Pending Reviews
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="text-[13px] font-medium data-[state=active]:bg-white rounded-sm px-6"
              >
                Active Leases
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* INLINE FILTER CHROME */}
        <section className="flex flex-col xl:flex-row items-center gap-4 bg-white p-1.5 border border-zinc-200/60 rounded-lg shadow-[0_1px_4px_rgba(0,0,0,0.01)] w-full">
          <div className="relative flex-1 w-full">
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <Input
              placeholder="Search by tenant name or property..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 h-9 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[13px] bg-transparent shadow-none placeholder:text-zinc-400"
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
                  <SelectItem key={prop} value={prop}>
                    {prop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="h-4 w-px bg-zinc-200 hidden md:block mx-1" />
            <div className="hidden md:flex items-center gap-2 pl-1 pr-2">
              <span className="text-[18px] font-semibold tracking-tighter text-zinc-900 leading-none font-tabular-nums">
                {filteredData.length}
              </span>
              <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest leading-tight">
                Records
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchQuery("");
                setPropertyFilter("all");
              }}
              className="h-8 w-8 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100/50 shrink-0 ml-auto md:ml-0 rounded-md"
            >
              <HugeiconsIcon icon={FilterIcon} size={14} />
            </Button>
          </div>
        </section>

        {/* ACTIVATIONS DATA TABLE */}
        <div className="bg-white border border-zinc-200/60 rounded-lg overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.01)]">
          <Table>
            <TableHeader className="bg-zinc-50/30">
              <TableRow className="border-zinc-200/60 hover:bg-transparent">
                <TableHead className="font-medium text-zinc-500 text-xs h-10 w-[220px]">
                  Tenant
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">
                  Property
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">
                  Move-in Date
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">
                  Checklist
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10 text-right w-[180px]">
                  Action
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((record) => {
                const recordIsLegalApproved =
                  record.checklist.ghanaCardVerified === "Verified" &&
                  record.checklist.leaseSigned === "Signed";

                return (
                  <TableRow
                    key={record.id}
                    className="group border-zinc-200/60 hover:bg-zinc-50/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedActivationId(record.id)}
                  >
                    <TableCell className="py-3 align-middle">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9 border border-zinc-200/60 shadow-sm">
                          <AvatarImage src={record.user.profilePicture} />
                          <AvatarFallback className="bg-zinc-100/50 text-zinc-600 text-xs">
                            {record.user.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-semibold text-zinc-900 leading-tight">
                            {record.user.name}
                          </span>
                          <span className="text-[11px] text-zinc-500 mt-0.5">
                            {record.user.phone}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 align-middle">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-medium text-zinc-900 leading-tight">
                          {record.lease.propertyName}
                        </span>
                        <span className="text-[11px] text-zinc-500 mt-0.5">
                          {record.lease.unitNumber}
                        </span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 align-middle">
                      <span className="text-[13px] font-medium text-zinc-700">
                        {formatDate(record.lease.startDate)}
                      </span>
                    </TableCell>

                    <TableCell className="py-3 align-middle">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant="outline"
                          className={`px-1.5 py-0 border-0 rounded text-[9px] uppercase tracking-wider font-bold h-5 flex items-center gap-1 ${record.checklist.depositPaid ? "bg-emerald-50/50 text-emerald-700 ring-1 ring-emerald-200/60" : "bg-zinc-100/50 text-zinc-500"}`}
                        >
                          <HugeiconsIcon
                            icon={CheckmarkCircle01Icon}
                            size={10}
                          />{" "}
                          Deposit
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`px-1.5 py-0 border-0 rounded text-[9px] uppercase tracking-wider font-bold h-5 flex items-center gap-1 ${record.checklist.ghanaCardVerified === "Verified" ? "bg-emerald-50/50 text-emerald-700 ring-1 ring-emerald-200/60" : ""}`}
                        >
                          {record.checklist.ghanaCardVerified === "Verified" ? (
                            <HugeiconsIcon
                              icon={CheckmarkCircle01Icon}
                              size={10}
                            />
                          ) : (
                            <HugeiconsIcon icon={Clock01Icon} size={10} />
                          )}{" "}
                          ID
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`px-1.5 py-0 border-0 rounded text-[9px] uppercase tracking-wider font-bold h-5 flex items-center gap-1 ${record.checklist.leaseSigned === "Signed" ? "bg-emerald-50/50 text-emerald-700 ring-1 ring-emerald-200/60" : ""}`}
                        >
                          {record.checklist.leaseSigned === "Signed" ? (
                            <HugeiconsIcon
                              icon={CheckmarkCircle01Icon}
                              size={10}
                            />
                          ) : (
                            <HugeiconsIcon icon={Clock01Icon} size={10} />
                          )}{" "}
                          Lease
                        </Badge>
                      </div>
                    </TableCell>

                    <TableCell className="py-3 align-middle text-right">
                      {activeTab === "pending" && (
                        <Button
                          size="sm"
                          variant={
                            recordIsLegalApproved ? "default" : "outline"
                          }
                          className={`h-8 text-[11px] font-semibold rounded-lg ${recordIsLegalApproved ? "bg-primary text-white hover:bg-zinc-800" : "border-zinc-200/60 text-zinc-700"}`}
                        >
                          {recordIsLegalApproved
                            ? "Activate Key"
                            : "Review Application"}
                        </Button>
                      )}
                      {activeTab === "active" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 text-[11px] font-semibold text-zinc-500 hover:text-zinc-900 rounded-lg"
                        >
                          View Details
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}

              {filteredData.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-zinc-500 text-sm"
                  >
                    {activeTab === "pending"
                      ? "No tenants awaiting review."
                      : "No active leases found."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* IMAGE VIEWER OVERLAY */}
      {expandedImage && (
        <div
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm print:hidden"
          style={{ pointerEvents: "auto" }}
          onClick={() => setExpandedImage(null)}
        >
          <div
            className="relative max-w-4xl w-full h-full max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors z-10"
              onClick={() => setExpandedImage(null)}
            >
              <HugeiconsIcon icon={Cancel01Icon} size={24} />
            </button>
            <img
              src={expandedImage}
              alt="Expanded View"
              className="max-w-full max-h-full object-contain rounded-lg shadow-sm relative z-0"
            />
          </div>
        </div>
      )}

      {/* COMMAND CENTER SHEET */}
      <Dialog
        open={!!selectedActivation && !isViewingDocument}
        onOpenChange={(open) => !open && setSelectedActivationId(null)}
      >
        <DialogContent className="w-full sm:max-w-xl md:max-w-2xl p-0 bg-[#FAFAFA] border border-slate-200/80 flex flex-col font-sans shadow-sm rounded-lg max-h-[85vh] overflow-hidden">
          {selectedActivation && (
            <>
              {/* --- 1. CLEAN HEADER --- */}
              <div className="px-6 py-6 border-b border-zinc-200/60 bg-zinc-50/30 flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12 border border-zinc-200/60 shadow-sm">
                    <AvatarImage src={selectedActivation.user.profilePicture} />
                    <AvatarFallback className="bg-zinc-100/50 text-zinc-600 font-medium">
                      {selectedActivation.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-base font-semibold text-zinc-900 tracking-tight">
                      {selectedActivation.user.name}
                    </h2>
                    <p className="text-[13px] text-zinc-500 mt-0.5">
                      {selectedActivation.user.email}
                    </p>
                    <Badge
                      variant="outline"
                      className={`px-0 py-0.5 border-0 rounded-full text-[10px] uppercase tracking-widest font-bold ${
                        selectedActivation.status === "Active"
                          ? "bg-green-50 text-green-700"
                          : "bg-zinc-100/50 text-zinc-600"
                      }`}
                    >
                      {selectedActivation.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* --- 2. SCROLLABLE BODY --- */}
              <div className="flex-1 overflow-y-auto p-6 space-y-10">
                {/* A. Document Verification Section */}
                <section>
                  <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-4">
                    Identity & Documents
                  </h3>

                  <div className="space-y-3">
                    {/* Ghana Card Row */}
                    <div className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-200/60 bg-white ">
                      <div className="flex items-center gap-4">
                        {/* Professional Thumbnail Viewer */}
                        <button
                          onClick={() =>
                            selectedActivation.user.ghanaCardUrl &&
                            setExpandedImage(
                              selectedActivation.user.ghanaCardUrl,
                            )
                          }
                          disabled={!selectedActivation.user.ghanaCardUrl}
                          className="relative h-12 w-16 bg-zinc-50 rounded-md border border-zinc-200/60 overflow-hidden group transition-all hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2"
                        >
                          {selectedActivation.user.ghanaCardUrl ? (
                            <>
                              <img
                                src={selectedActivation.user.ghanaCardUrl}
                                alt="ID Document"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <HugeiconsIcon
                                  icon={Search01Icon}
                                  size={14}
                                  className="text-white"
                                />
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <HugeiconsIcon
                                icon={Cancel01Icon}
                                size={14}
                                className="text-zinc-300"
                              />
                            </div>
                          )}
                        </button>

                        <div>
                          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-0.5">
                            National ID
                          </p>
                          <p className="font-mono text-[13px] font-medium text-zinc-900 tracking-tight">
                            {selectedActivation.user.ghanaCardNumber ||
                              "Not Provided"}
                          </p>
                        </div>
                      </div>

                      <div>
                        {selectedActivation.checklist.ghanaCardVerified ===
                        "Verified" ? (
                          <HugeiconsIcon
                            icon={CheckmarkCircle01Icon}
                            size={18}
                            className=""
                          />
                        ) : (
                          <HugeiconsIcon
                            icon={Clock01Icon}
                            size={18}
                            className=""
                          />
                        )}
                      </div>
                    </div>

                    {/* Lease Agreement Row */}
                    <div className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-200/60 bg-white ">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 bg-zinc-50 rounded-md border border-zinc-200/60 flex items-center justify-center">
                          <HugeiconsIcon
                            icon={FileDownloadIcon}
                            size={18}
                            className="text-zinc-400"
                          />
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-widest mb-0.5">
                            Tenancy Agreement
                          </p>
                          <button
                            onClick={() => setIsViewingDocument(true)}
                            disabled={
                              selectedActivation.checklist.leaseSigned !==
                              "Signed"
                            }
                            className="text-[13px] font-medium text-zinc-900 hover:underline underline-offset-4 disabled:no-underline disabled:text-zinc-400 text-left"
                          >
                            {selectedActivation.checklist.leaseSigned ===
                            "Signed"
                              ? "View Signed Document"
                              : "Awaiting Tenant Signature"}
                          </button>
                        </div>
                      </div>
                      <div>
                        {selectedActivation.checklist.leaseSigned ===
                        "Signed" ? (
                          <HugeiconsIcon
                            icon={CheckmarkCircle01Icon}
                            size={18}
                            className=""
                          />
                        ) : (
                          <HugeiconsIcon
                            icon={Clock01Icon}
                            size={18}
                            className=""
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Admin Decision Actions */}
                  {!isLegalApproved &&
                    selectedActivation.status !== "Active" && (
                      <div className="mt-4 flex gap-3">
                        <Button
                          className="flex-1 h-9 bg-zinc-900 text-white hover:bg-zinc-800 text-[12px] font-medium rounded-lg"
                          onClick={() => setConfirmAction("approve")}
                        >
                          Approve Documents
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 h-9 border-zinc-200/60 text-zinc-700 hover:bg-zinc-50 text-[12px] font-medium rounded-lg"
                          onClick={() => setConfirmAction("reject")}
                        >
                          Request Resubmission
                        </Button>
                      </div>
                    )}
                </section>

                <div className="h-px w-full bg-zinc-100/50" />

                {/* B. Property Access Section */}
                <section
                  className={`transition-opacity duration-300 ${!isLegalApproved ? "opacity-40 pointer-events-none" : ""}`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest">
                      Property Access
                    </h3>
                    {!isLegalApproved && (
                      <HugeiconsIcon
                        icon={Key01Icon}
                        size={14}
                        className="text-zinc-300"
                      />
                    )}
                  </div>

                  <div className="p-5 rounded-lg border border-zinc-200/60 bg-zinc-50/50">
                    <p className="text-[13px] text-zinc-600 leading-relaxed mb-5">
                      Provision digital access for{" "}
                      <span className="font-semibold text-zinc-900">
                        {selectedActivation.lease.propertyName} (
                        {selectedActivation.lease.unitNumber})
                      </span>
                      . The tenant will receive their entry PIN securely via
                      SMS.
                    </p>

                    {selectedActivation.smartLockPin ? (
                      <div className="flex items-center justify-between p-4 bg-white border border-zinc-200/60 rounded-lg shadow-sm">
                        <div>
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-1">
                            Active PIN Code
                          </p>
                          <p className="text-xl font-mono font-semibold tracking-[0.2em] text-zinc-900">
                            {selectedActivation.smartLockPin}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 text-[10px]"
                        >
                          Synced
                        </Badge>
                      </div>
                    ) : (
                      <Button
                        className="w-full h-10 bg-zinc-900 text-white hover:bg-zinc-800 text-[13px] font-medium rounded-lg shadow-sm"
                        onClick={() => setConfirmAction("pin")}
                      >
                        <HugeiconsIcon
                          icon={Key01Icon}
                          size={14}
                          className="mr-2"
                        />
                        Generate Smart Lock PIN
                      </Button>
                    )}
                  </div>

                  {!isLegalApproved && (
                    <div className="mt-3 flex items-start gap-2 text-zinc-500">
                      <HugeiconsIcon
                        icon={Alert01Icon}
                        size={14}
                        className="mt-0.5 shrink-0"
                      />
                      <p className="text-[12px] leading-tight">
                        Access provisioning is disabled until all tenant
                        documents are approved.
                      </p>
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* =====================================================
        SHADCN UI CONFIRMATION DIALOG 
        ===================================================== */}
      <AlertDialog
        open={!!confirmAction}
        onOpenChange={(open) => !open && setConfirmAction(null)}
      >
        <AlertDialogContent>
          {confirmAction && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle className="text-lg font-bold text-zinc-900">
                  {dialogContent[confirmAction].title}
                </AlertDialogTitle>
                <AlertDialogDescription className="text-[13px] text-zinc-500 leading-relaxed">
                  {dialogContent[confirmAction].description}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="mt-6 gap-2 sm:gap-0">
                <AlertDialogCancel
                  disabled={isPending}
                  className="h-10 text-[13px] font-semibold border-zinc-200/60 hover:bg-zinc-50 rounded-lg"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={executeConfirmedAction}
                  disabled={isPending}
                  className={`h-10 text-[13px] font-semibold rounded-lg ${dialogContent[confirmAction].confirmClass}`}
                >
                  {isPending ? (
                    <>
                      <HugeiconsIcon
                        icon={Loading03Icon}
                        className="animate-spin mr-2"
                        size={14}
                      />{" "}
                      Processing...
                    </>
                  ) : (
                    dialogContent[confirmAction].confirmText
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
