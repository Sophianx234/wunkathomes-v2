"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFormState, useFormStatus } from "react-dom";
import { resetPasswordAction } from "@/actions/user/auth.action";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, Alert01Icon } from "@hugeicons/core-free-icons";
import { useRouter, useSearchParams } from "next/navigation";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="rounded-md w-full" type="submit" disabled={pending}>
      {pending && (
        <HugeiconsIcon icon={Loading03Icon} className="animate-spin mr-2" />
      )}
      {pending ? "Resetting Password..." : "Reset Password"}
    </Button>
  );
}

export function ResetPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [state, formAction] = useFormState(resetPasswordAction, null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (state?.error) {
      setErrorMessage(state.error);
    } else if (state?.success) {
      setErrorMessage("");
      if (state.redirectUrl) {
        router.push(state.redirectUrl);
      }
    }
  }, [state, router]);

  // Defensive check
  if (!token) {
    return (
      <div className="text-center space-y-3">
        <h2 className="text-xl font-bold text-destructive">Invalid Link</h2>
        <p className="text-sm text-muted-foreground">
          This password reset link is missing or malformed. Please request a new link.
        </p>
      </div>
    );
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      action={formAction}
      {...props}
    >
      {errorMessage && (
        <div className="bg-destructive/15 text-destructive p-3 rounded-md flex items-center gap-2 text-sm font-medium">
          <HugeiconsIcon icon={Alert01Icon} size={18} />
          {errorMessage}
        </div>
      )}
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Set New Password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Please enter your new secure password below.
          </p>
        </div>

        {/* Hidden Input for the Token */}
        <input type="hidden" name="token" value={token} />

        <Field>
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            placeholder="••••••••"
            className="bg-background rounded-md"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            placeholder="••••••••"
            className="bg-background rounded-md"
          />
        </Field>

        <Field>
          <SubmitButton />
        </Field>
      </FieldGroup>
    </form>
  );
}
