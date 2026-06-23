import ManageTeamClient from "@/components/manage-team-client";
import { connectToDatabase } from "@/config/DbConnect"; 
import User from "@/models/user"; 
import Invitation from "@/models/invitation"; // <-- Make sure to import this

// Force Next.js to always fetch fresh data for this admin page
export const dynamic = 'force-dynamic';

export default async function TeamManagementPage() {
  // 1. Connect to MongoDB
  await connectToDatabase();

  // 2. Fetch Active & Suspended Staff from the User collection
  const rawUsers = await User.find({
    role: { $in: ["Admin", "Manager"] },
  })
    .select("name email profilePicture role accountStatus updatedAt")
    .sort({ createdAt: -1 })
    .lean();

  // 3. Fetch Pending Invites from the Invitation collection
  const rawInvites = await Invitation.find()
    .select("email role createdAt expiresAt")
    .sort({ createdAt: -1 })
    .lean();

  // 4. Format the Users
  const formattedUsers = rawUsers.map((member: any) => ({
    id: member._id.toString(),
    name: member.name,
    email: member.email,
    profilePicture: member.profilePicture || "",
    role: member.role,
    accountStatus: member.accountStatus || "Active",
    lastActive: member.updatedAt 
      ? new Date(member.updatedAt).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "Never",
  }));

  // 5. Format the Invitations to seamlessly match the TeamMember interface
  const formattedInvites = rawInvites.map((invite: any) => ({
    id: invite._id.toString(),
    name: "Awaiting Registration", // Placeholder since we don't have their name yet
    email: invite.email,
    profilePicture: "", // They haven't uploaded one yet
    role: invite.role,
    accountStatus: "Pending_Invite", // This perfectly triggers your "Pending Invites" tab logic!
    lastActive: `Expires ${new Date(invite.expiresAt).toLocaleDateString("en-GB", {
      day: "2-digit", month: "short"
    })}`,
  }));

  // 6. Merge the two arrays together
  const combinedTeamData = [...formattedUsers, ...formattedInvites];

  // 7. Pass the combined data to the Client Component
  return (
    <main>
      <ManageTeamClient data={combinedTeamData} />
    </main>
  );
}
