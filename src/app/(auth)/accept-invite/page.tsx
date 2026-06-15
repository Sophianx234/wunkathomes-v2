"use client";

import { AcceptInviteForm } from "@/components/accept-invite-form";
import Logo from "@/components/logo";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Suspense } from "react";

export default function AcceptInvitePage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2 bg-[#FAFAFA]">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo />
        </div>
        
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm   ">
            {/* Suspense is required here because AcceptInviteForm uses useSearchParams */}
            <Suspense fallback={<div className="text-center text-sm text-zinc-500"><HugeiconsIcon icon={Loading03Icon} className="animate-spin" /></div>}>
              <AcceptInviteForm />
            </Suspense>
          </div>
        </div>
      </div>
      
      <div className="relative hidden bg-zinc-900 lg:block border-l border-zinc-200/80">
        <img
          src="/images/fam-9.jpg"
          alt="Modern Architecture"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        <div className="absolute bottom-12 left-12 right-12 text-white">
          <h2 className="text-3xl font-bold tracking-tight mb-2">Build the future of living.</h2>
          <p className="text-zinc-300 font-medium">Join the management portal to securely oversee properties, smart locks, and tenant experiences.</p>
        </div>
      </div>
    </div>
  );
}