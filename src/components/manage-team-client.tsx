"use client";

import {
  Add01Icon,
  FilterIcon,
  Loading03Icon,
  MoreHorizontalIcon,
  Search01Icon,
  Shield02Icon,
  Mail01Icon,
  UserCircleIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HugeiconsIcon } from "@hugeicons/react";

// Import all required Server Actions
import {
  inviteTeamMemberAction,
  updateTeamMemberRole,
  toggleTeamAccountStatus,
  cancelInvitation,
} from "@/actions/admin/invitation.action";

// --- TYPES ---
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  profilePicture?: string;
  role: "Admin" | "Manager";
  accountStatus: "Active" | "Suspended" | "Pending_Invite";
  lastActive?: string;
}

interface ManageTeamClientProps {
  data: TeamMember[];
}

// --- UTILS ---
const getRoleBadgeStyle = (role: string) => {
  if (role === "Admin") return "bg-zinc-900 text-zinc-50 hover:bg-zinc-800";
  return "bg-blue-50/80 text-blue-700 border-blue-200 hover:bg-blue-100";
};

const getStatusBadgeStyle = (status: string) => {
  if (status === "Suspended")
    return "bg-rose-50 text-rose-700 border-rose-200/60";
  if (status === "Pending_Invite")
    return "bg-amber-50 text-amber-700 border-amber-200/60";
  return "bg-teal-50 text-teal-700 border-teal-200/60"; // Active
};

// --- MAIN PAGE COMPONENT ---
export default function ManageTeamClient({ data }: ManageTeamClientProps) {
  const [activeTab, setActiveTab] = useState<"team" | "pending">("team");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [isPending, startTransition] = useTransition();

  // Invite Modal State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"Admin" | "Manager">("Manager");

  // Edit Role Modal State
  const [isEditRoleOpen, setIsEditRoleOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<TeamMember | null>(null);
  const [newRole, setNewRole] = useState<"Admin" | "Manager">("Manager");

  // --- NEW: Universal Confirmation State ---
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    actionText: string;
    isDestructive: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    actionText: "Confirm",
    isDestructive: false,
    onConfirm: () => {},
  });

  const openConfirm = (config: Omit<typeof confirmDialog, "isOpen">) => {
    setConfirmDialog({ ...config, isOpen: true });
  };

  // Derived Counts
  const pendingCount = useMemo(() => {
    return data.filter((m) => m.accountStatus === "Pending_Invite").length;
  }, [data]);

  // Search & Filter implementation
  const filteredData = useMemo(() => {
    return data.filter((member) => {
      const matchesTab =
        activeTab === "team"
          ? member.accountStatus !== "Pending_Invite"
          : member.accountStatus === "Pending_Invite";

      const matchesSearch =
        !searchQuery ||
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesRole = roleFilter === "all" || member.role === roleFilter;

      return matchesTab && matchesSearch && matchesRole;
    });
  }, [data, activeTab, searchQuery, roleFilter]);

  // --- ACTIONS ---
  const handleToggleStatus = (userId: string, currentStatus: string) => {
    startTransition(async () => {
      const result = await toggleTeamAccountStatus(userId, currentStatus);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleCancelInvite = (inviteId: string) => {
    startTransition(async () => {
      const result = await cancelInvitation(inviteId);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleRemoveUser = (userId: string) => {
    startTransition(async () => {
      // NOTE: Replace with your actual remove action
      // const result = await removeTeamMemberAction(userId);
      await new Promise((res) => setTimeout(res, 1000));
      toast.success("User revoked and removed from team.");
    });
  };

  const handleInviteUser = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const result = await inviteTeamMemberAction(inviteEmail, inviteRole);

      if (result.success) {
        toast.success(result.message);
        setIsInviteOpen(false);
        setInviteEmail("");
        setInviteRole("Manager");
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleOpenEditRole = (member: TeamMember) => {
    setMemberToEdit(member);
    setNewRole(member.role);
    setIsEditRoleOpen(true);
  };

  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberToEdit) return;

    startTransition(async () => {
      const result = await updateTeamMemberRole(memberToEdit.id, newRole);

      if (result.success) {
        toast.success(result.message);
        setIsEditRoleOpen(false);
        setMemberToEdit(null);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
      <div className="max-w-[1200px] mx-auto space-y-6">
        {/* PAGE HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200/60 pb-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
              Team & Access Control
            </h1>
            <p className="text-sm text-zinc-500 mt-1">
              Manage internal staff members and their permission levels.
            </p>
          </div>
          <Button
            onClick={() => setIsInviteOpen(true)}
            className="bg-zinc-900 hover:bg-zinc-800 rounded-sm text-white shadow-sm h-10 px-5 shrink-0"
          >
            <HugeiconsIcon icon={Add01Icon} size={18} className="mr-2" />
            Invite Member
          </Button>
        </div>

        {/* TAB NAVIGATION */}
        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val as "team" | "pending")}
          className="w-full"
        >
          <TabsList className="h-9 bg-zinc-100/50 border border-zinc-200/60 p-0.5 rounded-lg mb-2">
            <TabsTrigger
              value="team"
              className="text-[13px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4"
            >
              Active Team
            </TabsTrigger>
            <TabsTrigger
              value="pending"
              className="text-[13px] font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md px-4"
            >
              Pending Invites
              {pendingCount > 0 && (
                <span className="ml-2 inline-flex items-center justify-center bg-black text-white text-[10px] font-bold h-4 w-4 rounded-full">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* SEARCH & FILTER CHROME */}
        <section className="flex flex-col sm:flex-row items-center gap-4 bg-white p-2 border border-zinc-200/80 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.02)] w-full">
          <div className="relative flex-1 w-full">
            <HugeiconsIcon
              icon={Search01Icon}
              size={16}
              strokeWidth={2}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 h-10 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 text-[14px] bg-transparent shadow-none placeholder:text-zinc-400"
            />
          </div>

          <div className="h-5 w-px bg-zinc-200 hidden sm:block" />

          <div className="flex items-center gap-2 w-full sm:w-auto px-2 pb-2 sm:pb-0">
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-[160px] h-9 border-0 bg-zinc-50 hover:bg-zinc-100 text-[13px] font-medium text-zinc-700 shadow-none focus:ring-0">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="Admin">Administrators</SelectItem>
                <SelectItem value="Manager">Managers</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
              }}
              className="h-9 w-9 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 shrink-0 ml-auto sm:ml-0"
              title="Clear Filters"
            >
              <HugeiconsIcon icon={FilterIcon} size={16} strokeWidth={2} />
            </Button>
          </div>
        </section>

        {/* TEAM TABLE */}
        <div className="bg-white border border-zinc-200/80 rounded-xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
          <Table>
            <TableHeader className="bg-zinc-50/50">
              <TableRow className="border-zinc-200/80 hover:bg-transparent">
                <TableHead className="font-medium text-zinc-500 text-xs h-10">
                  Team Member
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">
                  System Role
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10">
                  Status
                </TableHead>
                <TableHead className="font-medium text-zinc-500 text-xs h-10 hidden md:table-cell">
                  Last Active
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.map((member) => (
                <TableRow
                  key={member.id}
                  className="group border-zinc-100 hover:bg-zinc-50/80 transition-colors"
                >
                  {/* MEMBER PROFILE */}
                  <TableCell className="py-4">
                    <div className="flex items-center gap-3">
                      <Avatar
                        className={`h-10 w-10 border ${member.accountStatus === "Suspended" ? "opacity-50 grayscale border-zinc-200" : "border-zinc-200"}`}
                      >
                        <AvatarImage src={member.profilePicture} />
                        <AvatarFallback className="bg-zinc-100 text-zinc-600 text-xs">
                          {member.name ? (
                            member.name.charAt(0)
                          ) : (
                            <HugeiconsIcon icon={UserCircleIcon} size={16} />
                          )}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span
                          className={`text-sm font-semibold leading-tight ${member.accountStatus === "Suspended" ? "text-zinc-400 line-through" : "text-zinc-900"}`}
                        >
                          {member.name || "Pending User"}
                        </span>
                        <span className="text-xs text-zinc-500 mt-0.5 font-medium">
                          {member.email}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* ROLE BADGE */}
                  <TableCell className="py-4 align-middle">
                    <Badge
                      variant="outline"
                      className={`px-2 py-0.5 rounded-sm font-semibold text-[11px] uppercase tracking-widest border-transparent ${getRoleBadgeStyle(member.role)}`}
                    >
                      {member.role === "Admin" && (
                        <HugeiconsIcon
                          icon={Shield02Icon}
                          size={12}
                          className="mr-1.5"
                        />
                      )}
                      {member.role}
                    </Badge>
                  </TableCell>

                  {/* STATUS */}
                  <TableCell className="py-4 align-middle">
                    <Badge
                      variant="outline"
                      className={`px-2 py-0.5 rounded-sm font-medium border text-[11px] uppercase tracking-wider ${getStatusBadgeStyle(member.accountStatus)}`}
                    >
                      {member.accountStatus.replace("_", " ")}
                    </Badge>
                  </TableCell>

                  {/* LAST ACTIVE */}
                  <TableCell className="py-4 align-middle hidden md:table-cell">
                    <span className="text-xs text-zinc-500">
                      {member.lastActive || "Never"}
                    </span>
                  </TableCell>

                  {/* ACTIONS */}
                  <TableCell className="py-4 align-middle text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-zinc-400 hover:text-zinc-900 data-[state=open]:bg-zinc-100 data-[state=open]:text-zinc-900"
                        >
                          <HugeiconsIcon
                            icon={MoreHorizontalIcon}
                            size={18}
                            strokeWidth={2}
                          />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-48 rounded-xl shadow-lg border-zinc-200 font-sans p-1"
                      >
                        {member.accountStatus === "Pending_Invite" ? (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                toast.info("Resend feature coming soon")
                              }
                              className="text-sm cursor-pointer text-zinc-700 rounded-lg"
                            >
                              Resend Invitation
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-zinc-100 mx-2" />
                            <DropdownMenuItem
                              onClick={() =>
                                openConfirm({
                                  title: "Cancel Invitation",
                                  description: `Are you sure you want to cancel the pending invitation for ${member.email}? The link will no longer work.`,
                                  actionText: "Cancel Invite",
                                  isDestructive: true,
                                  onConfirm: () =>
                                    handleCancelInvite(member.id),
                                })
                              }
                              className="text-sm cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700 rounded-lg"
                            >
                              Cancel Invitation
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <>
                            <DropdownMenuItem
                              onClick={() => handleOpenEditRole(member)}
                              className="text-sm cursor-pointer text-zinc-700 rounded-lg"
                            >
                              Edit Role
                            </DropdownMenuItem>

                            <DropdownMenuSeparator className="bg-zinc-100 mx-2" />

                            {member.accountStatus === "Active" ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  openConfirm({
                                    title: "Suspend User Access",
                                    description: `Are you sure you want to suspend ${member.name}? They will immediately lose access to the dashboard.`,
                                    actionText: "Suspend Access",
                                    isDestructive: true,
                                    onConfirm: () =>
                                      handleToggleStatus(
                                        member.id,
                                        member.accountStatus,
                                      ),
                                  })
                                }
                                className="text-sm cursor-pointer text-amber-600 focus:bg-amber-50 focus:text-amber-700 rounded-lg"
                              >
                                Suspend Access
                              </DropdownMenuItem>
                            ) : member.accountStatus === "Suspended" ? (
                              <DropdownMenuItem
                                onClick={() =>
                                  openConfirm({
                                    title: "Restore User Access",
                                    description: `Are you sure you want to restore access for ${member.name}? They will regain their previous permissions.`,
                                    actionText: "Restore Access",
                                    isDestructive: false,
                                    onConfirm: () =>
                                      handleToggleStatus(
                                        member.id,
                                        member.accountStatus,
                                      ),
                                  })
                                }
                                className="text-sm cursor-pointer text-teal-600 focus:bg-teal-50 focus:text-teal-700 rounded-lg"
                              >
                                Restore Access
                              </DropdownMenuItem>
                            ) : null}

                            <DropdownMenuItem
                              onClick={() =>
                                openConfirm({
                                  title: "Revoke & Remove User",
                                  description: `This action is permanent. ${member.name} will be removed from the team and all active sessions will be terminated.`,
                                  actionText: "Remove User",
                                  isDestructive: true,
                                  onConfirm: () => handleRemoveUser(member.id),
                                })
                              }
                              className="text-sm cursor-pointer text-rose-600 focus:bg-rose-50 focus:text-rose-700 rounded-lg"
                            >
                              Revoke & Remove User
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
                  <TableCell
                    colSpan={5}
                    className="h-32 text-center text-zinc-500 text-sm"
                  >
                    {activeTab === "team"
                      ? "No active team members found."
                      : "No pending invites."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* --- UNIVERSAL CONFIRMATION DIALOG --- */}
      <AlertDialog
        open={confirmDialog.isOpen}
        onOpenChange={(open) =>
          setConfirmDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <AlertDialogContent className="font-sans border-zinc-200 rounded-2xl p-0 overflow-hidden sm:max-w-[400px]">
          <div className="p-6 pb-4">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-bold text-zinc-900">
                {confirmDialog.title}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-sm text-zinc-500 leading-relaxed mt-2">
                {confirmDialog.description}
              </AlertDialogDescription>
            </AlertDialogHeader>
          </div>
          <AlertDialogFooter className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 sm:justify-between items-center">
            <AlertDialogCancel className="mt-0 border-0 shadow-none hover:bg-zinc-200/50 text-zinc-500 font-medium">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // Prevent auto-close until our action finishes if desired, but we'll manually close it
                confirmDialog.onConfirm();
                setConfirmDialog((prev) => ({ ...prev, isOpen: false }));
              }}
              className={
                confirmDialog.isDestructive
                  ? "bg-rose-600 text-white hover:bg-rose-700 min-w-[120px]"
                  : "bg-zinc-900 text-white hover:bg-zinc-800 min-w-[120px]"
              }
            >
              {confirmDialog.actionText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* INVITE DIALOG */}
      <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white rounded-2xl border border-zinc-200 font-sans">
          <form onSubmit={handleInviteUser}>
            <div className="px-6 pt-6 pb-4 border-b border-zinc-100">
              <DialogTitle className="text-xl font-bold text-zinc-900">
                Invite Team Member
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-500 mt-1">
                They will receive an email with a secure link to join the
                dashboard.
              </DialogDescription>
            </div>

            <div className="p-6 space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                  Email Address
                </label>
                <div className="relative">
                  <HugeiconsIcon
                    icon={Mail01Icon}
                    size={16}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
                  />
                  <Input
                    type="email"
                    required
                    placeholder="colleague@wunkathomeshomes.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="pl-9 h-11 border-zinc-200 bg-zinc-50 focus-visible:ring-1 focus-visible:ring-zinc-900 focus-visible:bg-white transition-all shadow-none"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">
                  System Role
                </label>
                <div className="grid gap-3">
                  <label
                    className={`relative flex cursor-pointer rounded-xl border p-4 transition-all hover:bg-zinc-50 ${inviteRole === "Manager" ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900" : "border-zinc-200 bg-white"}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="Manager"
                      className="sr-only"
                      checked={inviteRole === "Manager"}
                      onChange={() => setInviteRole("Manager")}
                    />
                    <div className="flex w-full items-center justify-between">
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="text-sm font-bold text-zinc-900">
                          Manager
                        </span>
                        <span className="text-xs text-zinc-500 leading-relaxed">
                          Can view tenants, approve KYC, and manage smart locks.
                          Cannot view overall financials.
                        </span>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${inviteRole === "Manager" ? "border-zinc-900 bg-zinc-900" : "border-zinc-300"}`}
                      >
                        {inviteRole === "Manager" && (
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            size={12}
                            className="text-white"
                          />
                        )}
                      </div>
                    </div>
                  </label>

                  <label
                    className={`relative flex cursor-pointer rounded-xl border p-4 transition-all hover:bg-zinc-50 ${inviteRole === "Admin" ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900" : "border-zinc-200 bg-white"}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="Admin"
                      className="sr-only"
                      checked={inviteRole === "Admin"}
                      onChange={() => setInviteRole("Admin")}
                    />
                    <div className="flex w-full items-center justify-between">
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="text-sm font-bold text-zinc-900">
                          Administrator
                        </span>
                        <span className="text-xs text-zinc-500 leading-relaxed">
                          Full system access including financial ledger, global
                          settings, and role management.
                        </span>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${inviteRole === "Admin" ? "border-zinc-900 bg-zinc-900" : "border-zinc-300"}`}
                      >
                        {inviteRole === "Admin" && (
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            size={12}
                            className="text-white"
                          />
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 sm:justify-between items-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsInviteOpen(false)}
                className="text-zinc-500 hover:text-zinc-900"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="bg-zinc-900 hover:bg-zinc-800 text-white min-w-[120px]"
              >
                {isPending ? (
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  "Send Invitation"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT ROLE DIALOG */}
      <Dialog open={isEditRoleOpen} onOpenChange={setIsEditRoleOpen}>
        <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden bg-white rounded-2xl border border-zinc-200 font-sans">
          <form onSubmit={handleUpdateRole}>
            <div className="px-6 pt-6 pb-4 border-b border-zinc-100">
              <DialogTitle className="text-xl font-bold text-zinc-900">
                Edit System Role
              </DialogTitle>
              <DialogDescription className="text-sm text-zinc-500 mt-1">
                Change permission level for{" "}
                <span className="font-semibold text-zinc-900">
                  {memberToEdit?.name}
                </span>
                .
              </DialogDescription>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-2 block">
                  System Role
                </label>
                <div className="grid gap-3">
                  <label
                    className={`relative flex cursor-pointer rounded-xl border p-4 transition-all hover:bg-zinc-50 ${newRole === "Manager" ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900" : "border-zinc-200 bg-white"}`}
                  >
                    <input
                      type="radio"
                      name="edit-role"
                      value="Manager"
                      className="sr-only"
                      checked={newRole === "Manager"}
                      onChange={() => setNewRole("Manager")}
                    />
                    <div className="flex w-full items-center justify-between">
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="text-sm font-bold text-zinc-900">
                          Manager
                        </span>
                        <span className="text-xs text-zinc-500 leading-relaxed">
                          Can view tenants, approve KYC, and manage smart locks.
                          Cannot view overall financials.
                        </span>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${newRole === "Manager" ? "border-zinc-900 bg-zinc-900" : "border-zinc-300"}`}
                      >
                        {newRole === "Manager" && (
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            size={12}
                            className="text-white"
                          />
                        )}
                      </div>
                    </div>
                  </label>

                  <label
                    className={`relative flex cursor-pointer rounded-xl border p-4 transition-all hover:bg-zinc-50 ${newRole === "Admin" ? "border-zinc-900 bg-zinc-50 ring-1 ring-zinc-900" : "border-zinc-200 bg-white"}`}
                  >
                    <input
                      type="radio"
                      name="edit-role"
                      value="Admin"
                      className="sr-only"
                      checked={newRole === "Admin"}
                      onChange={() => setNewRole("Admin")}
                    />
                    <div className="flex w-full items-center justify-between">
                      <div className="flex flex-col gap-1 pr-4">
                        <span className="text-sm font-bold text-zinc-900">
                          Administrator
                        </span>
                        <span className="text-xs text-zinc-500 leading-relaxed">
                          Full system access including financial ledger, global
                          settings, and role management.
                        </span>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-full border flex items-center justify-center shrink-0 ${newRole === "Admin" ? "border-zinc-900 bg-zinc-900" : "border-zinc-300"}`}
                      >
                        {newRole === "Admin" && (
                          <HugeiconsIcon
                            icon={Tick02Icon}
                            size={12}
                            className="text-white"
                          />
                        )}
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 bg-zinc-50 border-t border-zinc-100 sm:justify-between items-center">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsEditRoleOpen(false)}
                className="text-zinc-500 hover:text-zinc-900"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending || newRole === memberToEdit?.role}
                className="bg-zinc-900 hover:bg-zinc-800 text-white min-w-[120px]"
              >
                {isPending ? (
                  <HugeiconsIcon
                    icon={Loading03Icon}
                    size={16}
                    className="animate-spin"
                  />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
