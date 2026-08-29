"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { PhoneInput } from "./phone-input";
import { signupAction } from "@/actions/user/auth.action";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { useRouter, useSearchParams } from "next/navigation"; // <-- 1. Import useRouter

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="rounded-md w-full sm:py-4" type="submit" disabled={pending}>
      {pending && (
        <HugeiconsIcon icon={Loading03Icon} className="animate-spin mr-2" />
      )}
      {pending ? "Creating account..." : "Create account"}
    </Button>
  );
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter(); // <-- 2. Initialize router
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');
  const [phone, setPhone] = useState("");
  const [countryCode, setCountryCode] = useState("+233");
  const [state, formAction] = useFormState(signupAction, null);

  // Trigger toasts whenever the server state updates
  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    } else if (state?.success) {
      toast.success(state.message);
      // <-- 3. Redirect on the client AFTER the toast triggers
      const userRole = state?.userRole;
      const targetDestination = callbackUrl || (userRole === "Admin" ? "/admin/overview" : "/");
      router.push(targetDestination);
    }
  }, [state, router, callbackUrl]);

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      action={formAction}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center mb-2">
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your details below to get started
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="name">Full Name</FieldLabel>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder="John Doe"
            required
            className="bg-background rounded-md"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="m@example.com"
            required
            className="bg-background rounded-md"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
          <PhoneInput
            id="phone"
            name="phoneNumber"
            value={phone}
            onChange={setPhone}
            countryCode={countryCode}
            onCountryCodeChange={setCountryCode}
            required
          />
          <input type="hidden" name="countryCode" value={countryCode} />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            className="bg-background rounded-md"
          />
        </Field>

        <Field className="mt-2">
          <SubmitButton />
        </Field>

        <FieldSeparator>Or</FieldSeparator>

        <Field>
         
          <FieldDescription className="text-center mt-4">
            Already have an account?{" "}
            <Link href={`/login${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="underline underline-offset-4">
              Login
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>

      <div className="px-8 text-center text-xs text-muted-foreground">
        By clicking create account, you agree to our{" "}
        <a href="#" className="underline hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline hover:text-primary">
          Privacy Policy
        </a>
        .
      </div>
    </form>
  );
}
