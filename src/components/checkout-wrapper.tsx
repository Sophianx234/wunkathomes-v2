"use client";

import dynamic from "next/dynamic";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

// Dynamically import the real checkout client and completely disable SSR
const CheckoutClient = dynamic(() => import("@/components/checkout-client"), { 
  ssr: false,
  loading: () => (
    <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA]">
      <HugeiconsIcon icon={Loading03Icon} className="animate-spin text-zinc-400" size={32} />
    </div>
  )
});

export default function CheckoutWrapper(props: any) {
  return <CheckoutClient {...props} />;
}