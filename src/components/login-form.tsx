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
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import Link from "next/link";
import { useFormState, useFormStatus } from "react-dom";
import { loginAction, verifyTwoFactorAction, resendTwoFactorAction } from "@/actions/user/auth.action";
import { toast } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import { Loading03Icon } from "@hugeicons/core-free-icons";
import { useRouter, useSearchParams } from "next/navigation";

// --- Submit Button Component ---
function SubmitButton({ label, loadingLabel }: { label: string, loadingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <Button className="rounded-md w-full" type="submit" disabled={pending}>
      {pending && (
        <HugeiconsIcon icon={Loading03Icon} className="animate-spin mr-2" />
      )}
      {pending ? loadingLabel : label}
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

  const [loginState, loginFormAction] = useFormState(loginAction, null);
  const [verifyState, verifyFormAction] = useFormState(verifyTwoFactorAction, null);

  const [is2FA, setIs2FA] = useState(false);
  const [savedEmail, setSavedEmail] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  // Handle Countdown Timer
  useEffect(() => {
    if (is2FA && countdown > 0) {
      const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
      return () => clearInterval(timer);
    }
  }, [is2FA, countdown]);

  // Handle Login State
  useEffect(() => {
    if (loginState?.error) {
      toast.error(loginState.error);
    } else if (loginState?.success) {
      if (loginState.requiresTwoFactor) {
        toast.success(loginState.message);
        setIs2FA(true);
        setSavedEmail(loginState.email);
        setCountdown(60);
      } else {
        toast.success(loginState.message);
        handleRedirect(loginState.redirectUrl);
      }
    }
  }, [loginState]);

  // Handle Verify State
  useEffect(() => {
    if (verifyState?.error) {
      toast.error(verifyState.error);
    } else if (verifyState?.success) {
      toast.success(verifyState.message);
      handleRedirect(verifyState.redirectUrl);
    }
  }, [verifyState]);

  const handleResend = async () => {
    if (countdown > 0 || isResending) return;
    setIsResending(true);
    const result = await resendTwoFactorAction(savedEmail);
    if (result.success) {
      toast.success(result.message);
      setCountdown(60);
    } else {
      toast.error(result.error);
    }
    setIsResending(false);
  };

  const handleRedirect = (target: string) => {
    if (target === "REFRESH") {
      window.location.reload(); 
    } else {
      const destination = callbackUrl || target || "/";
      router.push(destination);
    }
  };

  if (is2FA) {
    return (
      <form className={cn("flex flex-col gap-6", className)} action={verifyFormAction} {...props}>
        {isModal && <input type="hidden" name="isModal" value="true" />}
        <input type="hidden" name="email" value={savedEmail} />
        
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Two-Factor Authentication</h1>
            <p className="text-sm text-balance text-muted-foreground">
              We&apos;ve sent a 6-digit verification code to your email.
            </p>
          </div>

          <Field className="items-center">
            <FieldLabel htmlFor="otp">Verification Code</FieldLabel>
            <InputOTP maxLength={6} id="otp" name="otp" autoFocus>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          </Field>

          <Field>
            <SubmitButton label="Verify Code" loadingLabel="Verifying..." />
          </Field>
          
          <div className="flex flex-col items-center gap-2 mt-2">
            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0 || isResending}
              className="text-sm font-medium text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:hover:text-muted-foreground transition-colors"
            >
              {isResending 
                ? "Sending..." 
                : countdown > 0 
                  ? `Didn't receive a code? Resend in ${countdown}s` 
                  : "Didn't receive a code? Resend Code"}
            </button>
            <Button 
              variant="ghost" 
              type="button" 
              className="w-full text-sm mt-1" 
              onClick={() => setIs2FA(false)}
            >
              Cancel & go back
            </Button>
          </div>
        </FieldGroup>
      </form>
    );
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} action={loginFormAction} {...props}>
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
            name="email"
            type="email"
            placeholder="Please enter your email"
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
            name="password"
            type="password"
            required
            className="bg-background rounded-md"
          />
        </Field>

        <Field>
          <SubmitButton label="Login" loadingLabel="Authenticating..." />
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
