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
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { forgotPasswordAction } from "@/actions/user/auth.action";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon, Alert01Icon } from "@hugeicons/core-free-icons";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="rounded-md w-full" type="submit" disabled={pending}>
      {pending && (
        <HugeiconsIcon icon={Loading03Icon} className="animate-spin mr-2" />
      )}
      {pending ? "Sending Link..." : "Send Reset Link"}
    </Button>
  );
}

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [state, formAction] = useFormState(forgotPasswordAction, null);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (state?.error) {
      setErrorMessage(state.error);
    } else if (state?.success) {
      setErrorMessage("");
    }
  }, [state]);

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
          <h1 className="text-2xl font-bold">Forgot Password</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Please enter your email"
            required
            className="bg-background rounded-md"
          />
        </Field>

        <Field>
          <SubmitButton />
        </Field>

        <div className="text-center text-sm">
          Remember your password?{" "}
          <Link href="/login" className="underline underline-offset-4 hover:text-primary">
            Back to login
          </Link>
        </div>
      </FieldGroup>
    </form>
  );
}
