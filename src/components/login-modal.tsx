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
import Logo from "./logo";

interface LoginModalProps {
  children: ReactNode; 
}

export function LoginModal({ children }: LoginModalProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent 
        className="sm:max-w-[425px] p-0 border-0 max-h-[90vh] overflow-y-auto flex flex-col [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="p-8 bg-background flex-1">
          <DialogHeader className="text-center flex flex-col items-center mb-6 shrink-0">
            <Logo />
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