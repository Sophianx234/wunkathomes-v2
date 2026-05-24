"use client";

import { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { LoginForm } from "./login-form";
import { HugeiconsIcon } from "@hugeicons/react";
import { GalleryHorizontalEndIcon } from "@hugeicons/core-free-icons";

interface LoginModalProps {
  children: ReactNode; // This allows you to wrap any button/link to trigger the modal
}

export function LoginModal({ children }: LoginModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-0">
        <div className="p-8 bg-background">
          <DialogHeader className="text-center flex flex-col items-center mb-6">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary text-primary-foreground mb-4">
              <HugeiconsIcon icon={GalleryHorizontalEndIcon} className="size-5" />
            </div>
            <DialogTitle className="text-2xl font-bold">Welcome back</DialogTitle>
            <DialogDescription className="text-sm">
              Login with your Apple or Google account
            </DialogDescription>
          </DialogHeader>
          
          <LoginForm />
        </div>
      </DialogContent>
    </Dialog>
  );
}