import { Suspense } from "react";
import InquiryClient from "@/components/inquiry-client";
import { getInquiries } from "@/actions/inquiry.actions";

export const dynamic = "force-dynamic";

function InquirySkeleton() {
  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-xl overflow-hidden animate-[pulse_1.8s_ease-in-out_infinite]">
      <div className="h-14 border-b border-slate-200/80 bg-slate-50/50" />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="h-16 border-b border-slate-100 flex items-center px-6 gap-6">
          <div className="flex-1 space-y-2">
            <div className="h-3 bg-slate-100 rounded w-1/3" />
            <div className="h-2 bg-slate-100 rounded w-1/4" />
          </div>
          <div className="w-1/3 h-3 bg-slate-100 rounded shrink-0 hidden md:block" />
          <div className="w-16 h-4 bg-slate-100 rounded shrink-0 hidden md:block" />
          <div className="w-20 h-3 bg-slate-100 rounded shrink-0 hidden md:block" />
          <div className="w-10 h-6 bg-slate-100 rounded shrink-0 hidden md:block" />
        </div>
      ))}
    </div>
  );
}

async function DataLoader() {
  const result = await getInquiries();
  
  if (!result.success || !result.data) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
        Failed to load inquiries. Please refresh the page.
      </div>
    );
  }

  return <InquiryClient initialInquiries={result.data} />;
}

export default async function InquiriesPage() {
  return (
    <div className="min-h-screen bg-[#FAFAFA] p-6 lg:pb-10 font-sans">
      <div className="max-w-[1200px] mx-auto">
        <Suspense fallback={<InquirySkeleton />}>
          <DataLoader />
        </Suspense>
      </div>
    </div>
  );
}
