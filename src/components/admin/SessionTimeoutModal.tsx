"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { logoutAction } from "@/actions/user/auth.action";
import { LogOut, UserCheck } from "lucide-react";

// Total session before logout (10 minutes)
const SESSION_TIMEOUT_MS = 10 * 60 * 1000;
// When to show the warning modal (2 minutes before expiration)
const WARNING_BEFORE_MS = 2 * 60 * 1000; 

export function SessionTimeoutModal() {
  const [showModal, setShowModal] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WARNING_BEFORE_MS / 1000); // Countdown in seconds
  const lastActive = useRef<number>(Date.now());
  const timerInterval = useRef<NodeJS.Timeout | null>(null);

  // Handle User Activity to Reset Timer
  const updateActivity = useCallback(() => {
    // Only update if the modal is NOT showing 
    // (If it's showing, they MUST click "Stay Logged In" to ping the server and slide the middleware cookie)
    if (!showModal) {
      lastActive.current = Date.now();
    }
  }, [showModal]);

  useEffect(() => {
    // Listen for basic browser interaction
    const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, updateActivity));

    // Check timer every second
    timerInterval.current = setInterval(() => {
      const now = Date.now();
      const idleTime = now - lastActive.current;

      if (idleTime >= (SESSION_TIMEOUT_MS - WARNING_BEFORE_MS)) {
        setShowModal(true);
        // Calculate exact seconds left based on total timeout
        const remainingMs = SESSION_TIMEOUT_MS - idleTime;
        if (remainingMs <= 0) {
          handleLogout();
        } else {
          setTimeLeft(Math.floor(remainingMs / 1000));
        }
      } else {
        setShowModal(false);
      }
    }, 1000);

    return () => {
      events.forEach((event) => window.removeEventListener(event, updateActivity));
      if (timerInterval.current) clearInterval(timerInterval.current);
    };
  }, [updateActivity]);

  const handleStayLoggedIn = async () => {
    try {
      // Ping the server to trigger the `middleware.ts` sliding window and refresh the cookie
      await fetch(window.location.href, { method: "HEAD" });
    } catch (e) {
      console.error("Failed to refresh session", e);
    }
    // Hide modal and reset local timers
    setShowModal(false);
    lastActive.current = Date.now();
    setTimeLeft(WARNING_BEFORE_MS / 1000);
  };

  const handleLogout = async () => {
    if (timerInterval.current) clearInterval(timerInterval.current);
    await logoutAction();
  };

  if (!showModal) return null;

  // Format time (MM:SS)
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");

  // SVG Circular Progress Calculations
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const maxTime = WARNING_BEFORE_MS / 1000;
  const strokeDashoffset = circumference - (timeLeft / maxTime) * circumference;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center flex flex-col items-center animate-in fade-in zoom-in duration-300">
        
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-2">
          Are you still there?
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6">
          For your security, your session will expire soon due to inactivity.
        </p>

        {/* Circular Progress Bar */}
        <div className="relative flex items-center justify-center w-36 h-36 mb-8">
          <svg className="w-full h-full transform -rotate-90 drop-shadow-md" viewBox="0 0 120 120">
            {/* Background Track */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              className="stroke-zinc-100 dark:stroke-zinc-800/80"
              strokeWidth="8"
            />
            {/* Animated Progress Ring */}
            <circle
              cx="60"
              cy="60"
              r={radius}
              fill="transparent"
              className="stroke-rose-500 transition-all duration-1000 ease-linear"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          
          {/* Centered Time */}
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-rose-500 tabular-nums tracking-tight">
              {minutes}:{seconds}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={handleStayLoggedIn}
            className="flex items-center justify-center gap-2 w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-medium py-2.5 rounded-lg transition-all active:scale-[0.98]"
          >
            <UserCheck className="w-5 h-5" />
            Stay Logged In
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full bg-transparent hover:bg-rose-50 dark:hover:bg-rose-500/10 text-rose-600 font-medium py-2.5 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Log Out Now
          </button>
        </div>

      </div>
    </div>
  );
}
