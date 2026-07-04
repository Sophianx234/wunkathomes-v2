"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("A global error occurred:", error);
    // TODO: Send error to a third-party service like Sentry
    // Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="antialiased">
        {/* Outer Background matching the grey canvas in the image */}
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-200 p-4 md:p-8">
          
          {/* Main Card (Mimicking the browser window in insp.jpg) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            {/* macOS Style Window Header */}
            <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-400"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>

            <div className="flex flex-col md:flex-row md:py-12">
              {/* Left Side: Unplugged Illustration */}
              <div className="flex w-full items-center justify-center p-8 md:w-1/2">
                <div className="relative flex h-64 w-64 items-center justify-center rounded-full bg-slate-50 md:h-80 md:w-80">
                  <svg
                    viewBox="0 0 200 200"
                    className="absolute h-full w-full text-black"
                    fill="none"
                    stroke="currentColor"
                  >
                    {/* Top Cord & Plug */}
                    <path d="M 20 20 Q 20 90, 85 90 T 85 110" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 75 110 H 95 V 125 H 75 Z" fill="currentColor" strokeWidth="0" />
                    <path d="M 80 125 V 135 M 90 125 V 135" strokeWidth="3" strokeLinecap="round" />

                    {/* Bottom Cord & Socket */}
                    <path d="M 180 180 Q 180 110, 115 110 T 115 90" strokeWidth="4" strokeLinecap="round" />
                    <path d="M 105 75 H 125 V 90 H 105 Z" fill="currentColor" strokeWidth="0" />
                    <path d="M 110 65 V 75 M 120 65 V 75" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Right Side: Text & Actions */}
              <div className="flex w-full flex-col items-center justify-center px-8 pb-12 text-center md:w-1/2 md:items-start md:pb-0 md:text-left">
                <h1 className="mb-2 text-7xl font-bold tracking-tighter text-black md:text-8xl lg:text-9xl">
                  500
                </h1>
                <h2 className="mb-4 text-2xl font-bold tracking-tight text-black md:text-3xl lg:text-4xl">
                  System Disconnected
                </h2>
                <p className="mb-10 max-w-sm text-sm text-slate-500 md:text-base">
                  We're sorry, a critical application error has occurred. Our engineering team has been notified. Please try again or return to the homepage.
                </p>

                <div className="flex w-full flex-col gap-4 sm:max-w-xs sm:flex-row md:max-w-none">
                  <Button
                    onClick={() => reset()}
                    className="rounded-full bg-black px-8 py-6 text-xs font-bold uppercase tracking-widest text-white hover:bg-black/80"
                  >
                    Try Again
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-2 border-black px-8 py-6 text-xs font-bold uppercase tracking-widest text-black hover:bg-slate-100"
                  >
                    <Link href="/">Go Home</Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
          
        </div>
      </body>
    </html>
  );
}