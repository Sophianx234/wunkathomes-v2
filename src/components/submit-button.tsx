"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";

type SubmitButtonProps = {
  pending?: boolean;
};
export function SubmitButton({ pending }: SubmitButtonProps) {
  

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full md:w-auto h-11 rounded-md px-8 text-[14px] font-medium hover:bg-zinc-800 bg-zinc-950 text-white transition-colors"
    >
      {pending && <HugeiconsIcon icon={Loading03Icon} className="animate-spin mr-2" />}
      {pending ? "Processing..." : "Publish Asset"}
    </Button>
  );
}
