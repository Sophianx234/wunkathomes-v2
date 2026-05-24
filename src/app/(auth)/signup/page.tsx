"use client"

import { SignupForm } from "@/components/signup-form"
import Logo from "@/components/logo"

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <SignupForm />
          </div>
        </div>
      </div>
      
      {/* Right side cover image */}
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/images/fam-3.jpg" 
          alt="Family moving into new home"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
        {/* Optional overlay gradient for a more premium feel */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent mix-blend-multiply" />
      </div>
    </div>
  )
}