"use client";

import { useRouter } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";

export default function BackButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black transition-colors"
    >
      <HugeiconsIcon icon={ArrowLeft02Icon} size={16} />
      Back
    </button>
  );
}
