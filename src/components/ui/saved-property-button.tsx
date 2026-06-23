"use client"

import { toggleSavePropertyAction } from "@/actions/user/saved.action"
import { BookmarkAdd01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { useState } from "react"
import { toast } from "sonner"

interface SavePropertyButtonProps {
  propertyId: string;
  initialIsSaved?: boolean;
}

export default function SavePropertyButton({ 
  propertyId, 
  initialIsSaved = false 
}: SavePropertyButtonProps) {
  const [isSaved, setIsSaved] = useState(initialIsSaved)
  const [isPending, setIsPending] = useState(false)

  const handleToggleSave = async () => {
    setIsPending(true)
    
    // Optimistic UI update for instant feedback
    setIsSaved(!isSaved)

    const result = await toggleSavePropertyAction(propertyId)
    
    if (result.error) {
      toast.error(result.error)
      // Revert the optimistic update if the server failed
      setIsSaved(isSaved)
    } else {
      toast.success(result.message)
    }
    
    setIsPending(false)
  }

  return (
    <button 
      onClick={handleToggleSave}
      disabled={isPending}
      className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors hover:opacity-80 disabled:opacity-50"
      aria-label={isSaved ? "Remove from saved properties" : "Save property"}
    >
      <HugeiconsIcon 
        icon={BookmarkAdd01Icon} 
        size={24} 
        // Fill red if saved, otherwise outline black
        className={`transition-colors duration-200 ${isSaved ? "text-red-500 fill-red-500" : "text-black"}`} 
      />
      <span className="underline underline-offset-4 hidden sm:inline-block">
        {isSaved ? "Saved" : "Save"}
      </span>
    </button>
  )
}
