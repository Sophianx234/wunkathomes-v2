import { getSession, SessionPayload } from "@/lib/session";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft01Icon, Wrench01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import MaintenanceRequestForm from "@/components/maintenance-request-form";

export const metadata = {
  title: "Service Request | WunkatHomes",
  description: "Submit a new maintenance request for your property.",
};

export default async function MaintenancePage() {
  // Secure the route
  const session = await getSession() as SessionPayload;
  if (!session?.userId) redirect("/login");

  return (
    <div className="flex flex-col flex-1 w-full min-h-screen bg-slate-50 font-sans">
      <div className="max-w-4xl w-full mx-auto p-6 md:p-8 space-y-8 pb-20 pt-12 md:pt-16">
        
        {/* --- NAVIGATION & INFORMATION HEADER --- */}
        <div className="space-y-6">
          
          <div className=" pb-6">
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
        
        {/* --- PASS CONTROL TO CLIENT FORM --- */}
        <MaintenanceRequestForm />
        
      </div>
    </div>
  );
}