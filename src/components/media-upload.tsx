"use client";

import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { HugeiconsIcon } from "@hugeicons/react";
import { Upload01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";

interface MediaUploadProps {
  files: File[];
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
}

export function MediaUpload({ files, setFiles }: MediaUploadProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
    [setFiles],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [],
      "image/jpg": [],
      "image/png": [],
      "image/webp": [],
    },
    maxSize: 5242880, // 5MB limit
  });

  const removeFile = (indexToRemove: number) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-8">
      <h2 className="text-[18px] font-medium text-slate-900 mb-6 pb-3 border-b border-slate-200 flex items-center gap-2.5">
        <HugeiconsIcon
          icon={Upload01Icon}
          size={20}
          className="text-slate-400"
          strokeWidth={1.5}
        />
        Media Upload
      </h2>

      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
          isDragActive
            ? "border-zinc-950 bg-slate-100"
            : "border-slate-200 bg-slate-50 hover:bg-slate-100/50"
        }`}
      >
        <input {...getInputProps()} />
        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center mb-4 border border-slate-100">
          <HugeiconsIcon
            icon={Upload01Icon}
            size={24}
            className="text-slate-500"
            strokeWidth={1.5}
          />
        </div>
        <p className="text-[14px] font-medium text-slate-900 mb-1">
          Click or drag images to upload
        </p>
        <p className="text-[13px] text-slate-500">
          PNG, JPG, JPEG or WEBP (max. 5MB)
        </p>
      </div>

      {files.length > 0 && (
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border border-slate-200 bg-slate-50 aspect-square flex items-center justify-center"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(file)}
                alt={`preview-${index}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents the dropzone from opening if you click remove
                  removeFile(index);
                }}
                className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary/50 hover:bg-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
