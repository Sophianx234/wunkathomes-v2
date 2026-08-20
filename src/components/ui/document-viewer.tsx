import React from "react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface DocumentViewerProps {
  imageUrl: string | null;
  onClose: () => void;
}

export function DocumentViewer({ imageUrl, onClose }: DocumentViewerProps) {
  if (!imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm print:hidden"
      style={{ pointerEvents: "auto" }}
      onClick={onClose}
    >
      <div
        className="relative max-w-4xl w-full h-full max-h-[85vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-4 right-4 text-white bg-black/50 hover:bg-black/80 rounded-full p-2 transition-colors z-10"
          onClick={onClose}
        >
          <HugeiconsIcon icon={Cancel01Icon} size={24} />
        </button>
        <img
          src={imageUrl}
          alt="Expanded Document View"
          className="max-w-full max-h-full object-contain rounded-lg shadow-sm relative z-0"
        />
      </div>
    </div>
  );
}
