import { getSession, SessionPayload } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import MaintenanceRequestForm from "@/components/maintenance-request-form";
import { connectToDatabase } from "@/config/DbConnect";
import Lease from "@/models/lease";
import "@/models/listing"; 

export const metadata = {
  title: "Service Request | WunkatHomes",
  description: "Submit a new maintenance request for your property.",
};

export default async function MaintenancePage() {
  // 1. Securely get the user ID from the session
  const session = await getSession() as SessionPayload;
  if (!session?.userId) redirect("/login");

  await connectToDatabase();

  // 2. Fetch all active properties owned/rented by this specific user
  const activeLeases = await Lease.find({ 
    userId: session.userId, 
    status: "Active" 
  })
    .populate("listingId")
    .lean();

  // Redirect if they have no active properties to report on
  if (activeLeases.length === 0) {
    redirect("/user/dashboard"); 
  }

  // 3. Serialize the data for the Client Component
  const properties = activeLeases.map((lease: any) => ({
    id: lease._id.toString(),
    title: lease.listingId?.title || "Unknown Property",
  }));

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen bg-slate-50 font-sans">
      <div className="max-w-4xl w-full mx-auto p-6 md:p-8 space-y-8 pb-20 pt-12 md:pt-16">
        
        {/* --- NAVIGATION & HEADER --- */}
        <div className="space-y-6">
          <div className="pb-6">
            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-slate-900 flex items-center gap-3 mb-2">
              Service & Maintenance
            </h1>
          </div>
          <Link 
            href="/user/dashboard" 
            className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors w-fit"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} size={16} /> 
            Return to Dashboard
          </Link>
        </div>
        
        {/* --- PASS PROPERTIES TO THE SELF-CONTAINED CLIENT FORM --- */}
        <MaintenanceRequestForm properties={properties} />
        
      </div>
    </div>
  );
}