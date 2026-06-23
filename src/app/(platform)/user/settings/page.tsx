import { getSession } from "@/lib/session";
import { connectToDatabase } from "@/config/DbConnect";
import User from "@/models/user";
import { redirect } from "next/navigation";
import AccountSettingsForm from "@/components/account-settings-form";

export default async function AccountSettingsPage() {
  const session = await getSession();

  await connectToDatabase();

  // Fetch complete profile straight from MongoDB
  const dbUser = await User.findById(session.userId)
    .select("-password -idDocumentNumber -idVerificationPhotoUrl")
    .lean();

  if (!dbUser) {
    redirect("/login");
  }

  let extractedCountryCode = "+233";
  let extractedPhone = dbUser.phone || "";

  const knownCodes = ["+233", "+234", "+254", "+44", "+1"];
  for (const code of knownCodes) {
    if (extractedPhone.startsWith(code)) {
      extractedCountryCode = code;
      extractedPhone = extractedPhone.slice(code.length);
      break;
    }
  }

  // Serialize the database fields explicitly for the client
  const initialUserData = {
    name: dbUser.name || "",
    email: dbUser.email || "",
    phone: extractedPhone,
    profilePicture: dbUser.profilePicture || null,
    countryCode: extractedCountryCode,
  };

  return <AccountSettingsForm initialUser={initialUserData} />;
}
