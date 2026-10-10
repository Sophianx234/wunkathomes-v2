"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[600px] flex items-center justify-center bg-zinc-50 border border-zinc-200">
        <p className="text-zinc-500 text-sm animate-pulse">Loading PDF Preview...</p>
      </div>
    ),
  }
);

export default function PDFViewerWrapper({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="w-full h-[800px] md:h-screen max-h-[1000px] bg-white border border-zinc-200 overflow-hidden">
      <PDFViewer width="100%" height="100%" className="border-none" showToolbar={true}>
        {children as any}
      </PDFViewer>
    </div>
  );
}
