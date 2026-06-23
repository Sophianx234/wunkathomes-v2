'use client'
import { useFormStatus } from "react-dom"
import { Button } from "./ui/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon } from "@hugeicons/core-free-icons"

export function PasswordSubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button 
      className="flex-1 bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl h-12 font-medium" 
      type="submit"
      disabled={pending}
    >
      {pending && <HugeiconsIcon icon={Loading03Icon} className="animate-spin mr-2" size={18} />}
      {pending ? "Updating..." : "Apply Changes"}
    </Button>
  )
}
