"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useFormState, useFormStatus } from "react-dom";
import { acceptInviteAction } from "@/actions/admin/invitation.action";
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
      {pending ? "Setting up account..." : "Join the Team"}
    </Button>
  );
}

// --- Main Form Component ---
export function AcceptInviteForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  // Initialize server action state hook
  const [state, formAction] = useFormState(acceptInviteAction, null);

  // Trigger toasts and redirects
  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    } else if (state?.success) {
      toast.success(state.message);
      // Route new staff member to the dashboard
      router.push("/admin/overview");
    }
  }, [state, router]);

  // Defensive check: If they land here without a token
  if (!token) {
    return (
      <div className="text-center space-y-3">
        <h2 className="text-xl font-bold text-destructive">Invalid Link</h2>
        <p className="text-sm text-muted-foreground">
          This invitation link is missing or malformed. Please request a new
          invitation from your administrator.
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
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Accept Invitation</h1>
          <p className="text-sm text-balance text-muted-foreground">
            You've been invited to join the wunkathomes management team.
            Complete your profile below.
          </p>
        </div>

        {/* Hidden Token Field */}
        <input type="hidden" name="token" value={token} />

        <Field>
          <FieldLabel htmlFor="name">Full Legal Name</FieldLabel>
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
          <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
          <Input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+233 55 000 0000"
            required
            className="bg-background rounded-md"
          />
        </Field>

        <Field>
          <FieldLabel htmlFor="password">Create a Secure Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="bg-background rounded-md"
            minLength={8}
          />
        </Field>

        <Field>
          <SubmitButton />
        </Field>
      </FieldGroup>
    </form>
  );
}
