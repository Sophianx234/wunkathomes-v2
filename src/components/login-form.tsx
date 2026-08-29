"use client";

import { useEffect } from "react";
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
import { loginAction } from "@/actions/user/auth.action";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { useRouter, useSearchParams } from "next/navigation";

// --- Submit Button Component ---
function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="rounded-md w-full" type="submit" disabled={pending}>
      {pending && (
        <HugeiconsIcon icon={Loading03Icon} className="animate-spin mr-2" />
      )}
      {pending ? "Authenticating..." : "Login"}
    </Button>
  );
}

// --- Main Form Component ---
interface LoginFormProps extends React.ComponentProps<"form"> {
  isModal?: boolean;
}

export function LoginForm({
  className,
  isModal = false,
  ...props
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl');

  // Initialize server action state hook
  const [state, formAction] = useFormState(loginAction, null);

  // Trigger toasts on state change
  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    } else if (state?.success) {
      toast.success(state.message);
      if (state.redirectUrl === "REFRESH") {
        window.location.reload(); // Hard reload guarantees checkout page gets the updated session
      } else {
        const userRole = state?.userRole;
        const targetDestination = callbackUrl || (userRole === "Admin" ? "/admin/overview" : (state?.redirectUrl || "/"));
        router.push(targetDestination);
      }
    }
  }, [state, router, callbackUrl]);

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      action={formAction}
      {...props}
    >
      {isModal && <input type="hidden" name="isModal" value="true" />}
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Login to your account</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email below to login to your account
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email" // <-- Required for FormData
            type="email"
            placeholder="m@example.com"
            required
            className="bg-background rounded-md"
          />
        </Field>

        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Password</FieldLabel>
            <Link
              href="/forgot-password"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
          <Input
            id="password"
            name="password" // <-- Required for FormData
            type="password"
            required
            className="bg-background rounded-md"
          />
        </Field>

        <Field>
          <SubmitButton />
        </Field>

        <FieldSeparator>Or</FieldSeparator>

        <Field>
         
          <FieldDescription className="text-center mt-4">
            Don&apos;t have an account?{" "}
            <Link href={`/signup${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="underline underline-offset-4">
              Sign up
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  );
}
