import CreatePropertyForm from "@/components/create-property-form";

export const metadata = {
  title: "Create Property | Portfolio Management",
  description: "Deploy a new real estate asset into the operational portfolio.",
};

export default function CreatePropertyPage() {
  return (
    <div className="flex flex-col flex-1 w-full min-h-screen bg-slate-50 font-sans">
      <div className="min-w-4xl w-full mx-auto p-6 md:p-8 space-y-6 pb-20">
        {/* Pass control to the Client Component */}
        <CreatePropertyForm />
      </div>
    </div>
  );
}