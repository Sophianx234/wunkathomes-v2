import { useFormStatus } from "react-dom"
import { HugeiconsIcon } from "@hugeicons/react"
import { Logout03Icon, Loading03Icon } from "@hugeicons/core-free-icons"

export function LogoutButton() {
  const { pending } = useFormStatus()

  return (
    <button 
      type="submit" 
      disabled={pending}
      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 transition disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (
        <HugeiconsIcon icon={Loading03Icon} size={18} className="animate-spin" />
      ) : (
        <HugeiconsIcon icon={Logout03Icon} size={18} />
      )}
      {pending ? "Logging out..." : "Log Out"}
    </button>
  )
}