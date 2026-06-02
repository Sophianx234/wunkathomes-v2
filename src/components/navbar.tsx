import { getSession } from "@/lib/session";
import { connectToDatabase } from "@/config/DbConnect";
import User from "@/models/user";
import NavbarClient from "./nav-client";

export default async function Navbar() {
  const session = await getSession();
  let userData = null;

  if (session?.userId) {
    await connectToDatabase();
    
    // Fetch the user to get the absolute latest profile picture and details
    const dbUser = await User.findById(session.userId)
      .select("name email profilePicture")
      .lean();

    if (dbUser) {
      userData = {
        name: dbUser.name || "User",
        email: dbUser.email || "",
        // Account for any schema variations safely
        profilePicture: dbUser.profilePicture || (dbUser as any).avatar || null,
      };
    }
  }

  return <NavbarClient user={userData} />;
}