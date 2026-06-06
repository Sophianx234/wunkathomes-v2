import { getSession, SessionPayload } from "@/lib/session";
import { connectToDatabase } from "@/config/DbConnect";
import User from "@/models/user";
import { redirect } from "next/navigation";
import AccountSettingsForm from "@/components/account-settings-form";

export default async function AccountSettingsPage() {
  const session = await getSession() as SessionPayload;

  await connectToDatabase();

  // Fetch complete profile straight from MongoDB
  const dbUser = await User.findById(session.userId)
    .select("-password -idDocumentNumber -idVerificationPhotoUrl")
    .lean();

  if (!dbUser) {
    redirect("/login");
  }

  // Serialize the database fields explicitly for the client
  const initialUserData = {
    name: dbUser.name || "",
    email: dbUser.email || "",
    phone: dbUser.phone || "",
    profilePicture: dbUser.profilePicture || null,
    countryCode: (dbUser as any).countryCode || "+233",
  };

  return <AccountSettingsForm initialUser={initialUserData} />;
}