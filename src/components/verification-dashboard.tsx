"use client";

import { submitIdentityVerification } from "@/actions/user/verification.action";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Camera02Icon,
  Chat01Icon,
  CheckmarkBadge01Icon,
  Loading03Icon,
  UserCircleIcon,
  Shield02Icon,
  SignatureIcon,
  Time01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export interface CurrentUser {
  id: string;
  name: string;
  legalName?: string;
  dateOfBirth?: string | Date;
  idDocumentType?: string;
  idDocumentNumber?: string;
  profilePicture?: string;
  kycStatus?: "Unverified" | "Pending" | "Verified" | "Rejected";
}

interface VerificationDashboardProps {
  currentUser?: CurrentUser | null;
  leaseId: string;
  isLeaseSigned: boolean;
}

export function VerificationDashboard({
  currentUser,
  leaseId,
  isLeaseSigned,
}: VerificationDashboardProps) {
  const router = useRouter();

  // --- Calculate initial step based on KYC Status ---
  const initialStep =
    currentUser?.kycStatus === "Verified"
      ? 4
      : currentUser?.kycStatus === "Pending"
        ? 3
        : 1;

  const [step, setStep] = useState(initialStep);

  // Form State
  const [fullName, setFullName] = useState(
    currentUser?.legalName || currentUser?.name || "",
  );

  const initialDob = currentUser?.dateOfBirth
    ? new Date(currentUser.dateOfBirth).toISOString().split("T")[0]
    : "";
  const [dob, setDob] = useState(initialDob);

  // ID State
  const [idType, setIdType] = useState(currentUser?.idDocumentType || "GHA");
  const [idNumber, setIdNumber] = useState(currentUser?.idDocumentNumber || "");

  // Camera & Image State
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [profilePreview, setProfilePreview] = useState<string | null>(
    currentUser?.profilePicture || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Auto-Formatting Logic ---
  const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.toUpperCase();

    if (idType === "GHA") {
      let chars = val.replace(/[^A-Z0-9]/g, "");
      if (!chars.startsWith("GHA")) chars = "GHA" + chars.replace(/^GHA/, "");

      let nums = chars.slice(3).replace(/\D/g, "");

      let formatted = "GHA";
      if (nums.length > 0) formatted += "-" + nums.slice(0, 9);
      if (nums.length > 9) formatted += "-" + nums.slice(9, 10);

      setIdNumber(formatted);
    } else if (idType === "VOTER") {
      setIdNumber(val.replace(/\D/g, "").slice(0, 10));
    }
  };

  const handleIdTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIdType(e.target.value);
    setIdNumber("");
  };

  // --- Profile Image Upload Logic ---
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Camera Management ---
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
    } catch (err) {
      console.error("Camera error:", err);
    }
  };

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach((track) => track.stop());
  };

  useEffect(() => {
    if (step === 2 && !photoData) {
      startCamera();
    } else {
      stopCamera();
    }
    return stopCamera;
  }, [step, photoData]);

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        ctx.drawImage(
          videoRef.current,
          0,
          0,
          canvasRef.current.width,
          canvasRef.current.height,
        );
        setPhotoData(canvasRef.current.toDataURL("image/jpeg"));
        stopCamera();
      }
    }
  };

  // --- Submission Logic ---
  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("userId", currentUser?.id || "");
      formData.append("leaseId", leaseId);
      formData.append("fullName", fullName);
      formData.append("dob", dob);
      formData.append("idType", idType);
      formData.append("idNumber", idNumber);

      if (profilePreview) {
        if (profilePreview.startsWith("data:image")) {
          formData.append("profilePhotoBase64", profilePreview);
        } else {
          formData.append("existingProfileUrl", profilePreview);
        }
      }

      if (photoData) {
        formData.append("verificationPhotoBase64", photoData);
      }

      const result = await submitIdentityVerification(formData);

      if (result.success) {
        setTimeout(() => {
          setStep(3); // Moves to Handoff/Approval screen
          setIsSubmitting(false);
        }, 1000);
      } else {
        toast.error(result.error || "Submission failed. Please try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      toast.error("A network error occurred.");
      setIsSubmitting(false);
    }
  };

  const hasProfilePicture = !!(profilePhoto || profilePreview);

  return (
    <div className="min-h-screen bg-[#F4F7F9] p-2 md:p-8 font-sans text-slate-800 w-full overflow-x-hidden box-border">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-4 md:gap-6 w-full box-border">
        {/* ========================================================= */}
        {/* LEFT SIDEBAR */}
        {/* ========================================================= */}
        <div className="w-full lg:w-72 flex flex-col gap-4 md:gap-6 shrink-0 box-border">
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-8 flex flex-col items-center text-center w-full box-border">
            <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 md:mb-6">
              Profile
            </p>

            <div className="relative mb-2 md:mb-4">
              <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-200 rounded-full border-2 md:border-4 border-white shadow-sm overflow-hidden flex items-center justify-center shrink-0">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="scale-75 md:scale-100 flex items-center">
                    <HugeiconsIcon
                      icon={UserCircleIcon}
                      size={48}
                      className="text-slate-400"
                    />
                  </span>
                )}
              </div>

              {step !== 4 && step !== 3 && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfileImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-6 h-6 md:w-8 md:h-8 bg-black rounded-full border-2 border-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer shadow-sm"
                  >
                    <span className="scale-75 md:scale-100 flex items-center">
                      <HugeiconsIcon
                        icon={Camera02Icon}
                        size={14}
                        className="text-white"
                      />
                    </span>
                  </button>
                </>
              )}
            </div>

            {!hasProfilePicture && step !== 4 && (
              <p className="text-[8px] md:text-[10px] font-bold text-red-500 uppercase tracking-widest mb-1 md:mb-2">
                * Required
              </p>
            )}
            {step === 4 && (
              <span className="mb-2 md:mb-3 px-2 py-0.5 md:px-3 md:py-1 bg-green-50 text-green-600 text-[8px] md:text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                <span className="scale-75 md:scale-100 flex items-center">
                  <HugeiconsIcon icon={Shield02Icon} size={12} />
                </span>
                Verified
              </span>
            )}
            <h2 className="text-sm md:text-lg font-bold text-slate-900 truncate w-full px-2">
              {fullName || "Your Name"}
            </h2>
            <p className="text-[10px] md:text-xs text-slate-500 mt-0.5 md:mt-1">
              Tenant ID: {currentUser?.id?.slice(-5) || "88492"}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-4 md:p-8 flex flex-col items-center text-center w-full box-border">
            <div className="mb-3 md:mb-6 opacity-30">
              <span className="scale-75 md:scale-100 flex items-center">
                <HugeiconsIcon
                  icon={Chat01Icon}
                  size={48}
                  className="text-slate-400"
                />
              </span>
            </div>
            <h3 className="text-sm md:text-lg font-bold text-slate-900 mb-1 md:mb-2">
              Need help?
            </h3>
            <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed mb-3 md:mb-6 px-2 break-words">
              Have questions or concerns regarding your verification? Our
              experts are here to help!
            </p>
            <button className="w-full min-w-0 box-border py-2.5 md:py-3 bg-black hover:bg-zinc-800 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-lg transition-colors shadow-primary/20 truncate px-2">
              Chat With Us
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN CONTENT AREA */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col gap-4 md:gap-6 w-full min-w-0 box-border">
          <div className="bg-white rounded-xl shadow-sm p-4 md:p-8 w-full box-border">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 md:mb-8 gap-3 md:gap-4 w-full min-w-0">
              <div className="min-w-0">
                <h1 className="text-sm md:text-xl font-bold text-slate-900 mb-1 md:mb-2 truncate">
                  {step === 4
                    ? "Identity Verification Complete"
                    : "Complete Identity Verification"}
                </h1>
                <p className="text-[10px] md:text-sm text-slate-500 break-words">
                  {step === 4
                    ? "Your identity is secured. You can now access your properties."
                    : "Required to generate your Smart Lock PIN."}
                </p>
              </div>
              {step < 3 && (
                <div className="text-left md:text-right shrink-0">
                  <p className="text-[8px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Estimated time
                  </p>
                  <p className="text-[11px] md:text-sm font-medium text-slate-900">
                    2 mins left
                  </p>
                </div>
              )}
            </div>

            {/* Stepper Grid */}
            <div className="flex items-center w-full max-w-3xl box-border">
              {[1, 2, 3, 4].map((s, index) => (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center relative shrink-0">
                    <div
                      className={`w-4 h-4 md:w-6 md:h-6 rounded-full flex items-center justify-center z-10 transition-colors ${
                        step > s
                          ? "bg-black text-white"
                          : step === s
                            ? "bg-black border-2 md:border-4 border-blue-100 text-transparent"
                            : "bg-slate-100 border-2 border-slate-200 text-transparent"
                      }`}
                    >
                      {step >= s && (
                        <span className="scale-50 md:scale-100 flex items-center">
                          <HugeiconsIcon
                            icon={CheckmarkBadge01Icon}
                            size={12}
                            className={step === s ? "text-primary" : ""}
                          />
                        </span>
                      )}
                    </div>
                  </div>
                  {index < 3 && (
                    <div
                      className={`flex-1 h-0.5 mx-1 md:mx-2 transition-colors ${step > s ? "bg-black" : "bg-slate-200"}`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Dynamic Stepper Labels */}
            <div className="flex justify-between w-full max-w-3xl mt-2 md:mt-3 text-[7px] md:text-xs font-bold text-slate-400 uppercase tracking-widest box-border">
              <span className={`truncate ${step >= 1 ? "text-primary" : ""}`}>
                Details
              </span>
              <span
                className={`text-center pl-2 md:pl-4 truncate ${step >= 2 ? "text-primary" : ""}`}
              >
                Selfie
              </span>
              <span
                className={`text-center pl-4 md:pl-8 truncate ${step >= 3 ? "text-primary" : ""}`}
              >
                {isLeaseSigned ? "Approval" : "Sign Lease"}
              </span>
              <span
                className={`text-right truncate ${step >= 4 ? "text-primary" : ""}`}
              >
                Verified
              </span>
            </div>
          </div>

          {/* Form Area */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col w-full min-w-0 box-border">
            <div className="flex border-b border-slate-100 px-4 md:px-8 pt-2 md:pt-4 w-full box-border">
              <div className="pb-2 md:pb-4 border-b-2 border-primary text-[10px] md:text-sm font-bold text-slate-900 px-1 md:px-2 truncate">
                Verification Status
              </div>
            </div>

            <div className="p-4 md:p-8 flex-1 w-full min-w-0 box-border">
              <AnimatePresence mode="wait">
                {/* --- STEP 1: Personal Details --- */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="w-full min-w-0 box-border"
                  >
                    {currentUser?.kycStatus === "Rejected" && (
                      <div className="mb-4 md:mb-6 p-3 md:p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-2 md:gap-3 w-full box-border">
                        <div className="min-w-0 break-words">
                          <p className="text-[9px] md:text-xs font-bold uppercase tracking-widest text-red-800 mb-0.5 md:mb-1">
                            Verification Rejected
                          </p>
                          <p className="text-[10px] md:text-xs font-medium text-red-600 leading-relaxed">
                            Your previous submission was declined. Please ensure
                            your ID number is correct and the photo of you
                            holding your ID is clear and well-lit.
                          </p>
                        </div>
                      </div>
                    )}

                    <h3 className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 md:mb-8">
                      Personal Details
                    </h3>

                    <div className="mb-6 md:mb-10 w-full min-w-0 box-border mt-4 md:mt-6">
                      <div className="relative w-full min-w-0 box-border">
                        <label className="text-[9px] md:text-xs font-medium text-slate-500 absolute -top-4 md:-top-5 left-0">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="As it appears on your ID"
                          className="block w-full min-w-0 max-w-full box-border m-0 appearance-none rounded-none pb-1 md:pb-2 pt-1 text-[11px] md:text-sm font-medium text-slate-900 bg-transparent border-0 border-b border-slate-200 focus:ring-0 focus:border-primary outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 mb-2 w-full min-w-0 box-border mt-4 md:mt-6">
                      <div className="relative w-full min-w-0 box-border">
                        <label className="text-[9px] md:text-xs font-medium text-slate-500 absolute -top-4 md:-top-5 left-0">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="block w-full min-w-0 max-w-full box-border m-0 appearance-none rounded-none pb-1 md:pb-2 pt-1 text-[11px] md:text-sm font-medium text-slate-900 bg-transparent border-0 border-b border-slate-200 focus:ring-0 focus:border-primary outline-none transition-colors"
                        />
                      </div>

                      <div className="relative flex items-end border-b border-slate-200 focus-within:border-primary transition-colors pb-1 w-full min-w-0 box-border mt-4 md:mt-0">
                        <label className="text-[9px] md:text-xs font-medium text-slate-500 absolute -top-4 md:-top-5 left-0">
                          Document Number
                        </label>
                        <select
                          value={idType}
                          onChange={handleIdTypeChange}
                          className="bg-transparent text-[11px] md:text-sm font-bold text-slate-900 border-none outline-none cursor-pointer pr-2 md:pr-4 shrink-0 m-0 appearance-none md:appearance-auto"
                        >
                          <option value="GHA">Ghana Card</option>
                          <option value="VOTER">Voter ID</option>
                        </select>
                        <input
                          type="text"
                          placeholder={
                            idType === "GHA" ? "GHA-000000000-0" : "1234567890"
                          }
                          value={idNumber}
                          onChange={handleIdChange}
                          className="block w-full min-w-0 max-w-full box-border m-0 appearance-none rounded-none text-[11px] md:text-sm font-medium text-slate-900 bg-transparent border-none focus:ring-0 outline-none pb-1 pl-2 md:pl-4 uppercase"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* --- STEP 2: Selfie ID --- */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="w-full box-border"
                  >
                    <h3 className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 md:mb-4">
                      Live Verification
                    </h3>
                    <p className="text-[11px] md:text-sm text-slate-500 mb-4 md:mb-8 max-w-lg break-words">
                      Please hold your physical{" "}
                      {idType === "GHA" ? "Ghana Card" : "Voter ID"} next to
                      your face. Ensure the card number is visible, well-lit,
                      and your face is clear.
                    </p>

                    <div className="w-full max-w-lg mx-auto bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl overflow-hidden aspect-[4/3] relative box-border">
                      {!photoData ? (
                        <>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform -scale-x-100"
                          />
                          <div className="absolute bottom-4 md:bottom-6 inset-x-0 flex justify-center">
                            <button
                              onClick={takePhoto}
                              className="w-10 h-10 md:w-14 md:h-14 bg-white border-2 md:border-4 border-slate-200 rounded-full hover:border-blue-300 transition-colors shadow-lg"
                            />
                          </div>
                        </>
                      ) : (
                        <>
                          <img
                            src={photoData}
                            alt="Selfie Verification"
                            className="w-full h-full object-cover transform -scale-x-100"
                          />
                          <div className="absolute bottom-4 md:bottom-6 inset-x-0 flex justify-center">
                            <button
                              onClick={() => {
                                setPhotoData(null);
                                startCamera();
                              }}
                              className="px-4 md:px-6 py-1.5 md:py-2 bg-white text-slate-800 text-[9px] md:text-xs font-bold uppercase tracking-widest rounded-md md:rounded-lg shadow-lg hover:bg-slate-50"
                            >
                              Retake
                            </button>
                          </div>
                        </>
                      )}
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  </motion.div>
                )}

                {/* --- STEP 3: The Handoff / Awaiting Approval --- */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-6 md:py-10 w-full box-border"
                  >
                    {isLeaseSigned ? (
                      <>
                        <div className="w-12 h-12 md:w-20 md:h-20 bg-black text-white rounded-full flex items-center justify-center mb-4 md:mb-6 shrink-0">
                          <span className="scale-75 md:scale-100 flex items-center">
                            <HugeiconsIcon icon={Time01Icon} size={40} />
                          </span>
                        </div>
                        <h3 className="text-lg md:text-2xl font-bold text-slate-900 mb-1 md:mb-2 px-2 break-words w-full">
                          Awaiting Admin Approval
                        </h3>
                        <p className="text-[11px] md:text-sm text-slate-500 max-w-sm mb-6 md:mb-8 px-4 break-words">
                          Your identity documents and tenancy agreement have
                          been successfully submitted. Our team is reviewing
                          them to securely generate your Smart Lock PIN.
                        </p>

                        <button
                          onClick={() => router.push("/user/dashboard")}
                          className="px-6 py-2.5 md:px-8 md:py-3 bg-zinc-950 hover:bg-zinc-800 text-white text-[9px] md:text-xs font-bold uppercase tracking-widest rounded-lg transition-colors shadow-lg shadow-black/10 flex items-center gap-1.5 md:gap-2 max-w-full truncate"
                        >
                          <span className="truncate">Go to Dashboard</span>
                          <span className="scale-75 md:scale-100 flex items-center shrink-0">
                            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                          </span>
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 md:w-20 md:h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 md:mb-6 shrink-0">
                          <span className="scale-75 md:scale-100 flex items-center text-blue-500">
                            <HugeiconsIcon icon={SignatureIcon} size={40} />
                          </span>
                        </div>
                        <h3 className="text-lg md:text-2xl font-bold text-slate-900 mb-1 md:mb-2 px-2 break-words w-full">
                          Verification Submitted
                        </h3>
                        <p className="text-[11px] md:text-sm text-slate-500 max-w-sm mb-6 md:mb-8 px-4 break-words">
                          Your identity documents have been securely
                          transmitted. You can now review and legally bind your
                          Tenancy Agreement to finalize your booking.
                        </p>

                        <button
                          onClick={() =>
                            router.push(`/user/sign-lease?leaseId=${leaseId}`)
                          }
                          className="px-4 md:px-8 py-2.5 md:py-3 bg-zinc-950 hover:bg-zinc-800 text-white text-[9px] md:text-xs font-bold uppercase tracking-widest rounded-lg transition-colors shadow-lg shadow-black/10 flex items-center gap-1.5 md:gap-2 max-w-full truncate"
                        >
                          <span className="truncate">
                            Sign Tenancy Agreement
                          </span>
                          <span className="scale-75 md:scale-100 flex items-center shrink-0">
                            <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                          </span>
                        </button>
                      </>
                    )}
                  </motion.div>
                )}

                {/* --- STEP 4: Verified --- */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-6 md:py-10 w-full box-border"
                  >
                    <div className="w-12 h-12 md:w-20 md:h-20 bg-green-50 border border-green-100 text-green-500 rounded-full flex items-center justify-center mb-4 md:mb-6 shrink-0">
                      <span className="scale-75 md:scale-100 flex items-center">
                        <HugeiconsIcon icon={CheckmarkBadge01Icon} size={40} />
                      </span>
                    </div>
                    <h3 className="text-lg md:text-2xl font-bold text-slate-900 mb-1 md:mb-2 break-words w-full px-2">
                      Identity Verified
                    </h3>
                    <p className="text-[11px] md:text-sm text-slate-500 max-w-sm mb-6 md:mb-8 break-words px-4">
                      Your identity documents have been approved. Your account
                      is fully active and you are ready to access your
                      properties.
                    </p>
                    <button
                      onClick={() => router.push("/user/dashboard")}
                      className="px-6 py-2.5 md:px-8 md:py-3 bg-zinc-950 hover:bg-zinc-800 text-white text-[9px] md:text-xs font-bold uppercase tracking-widest rounded-lg transition-colors shadow-lg shadow-black/10 max-w-full truncate"
                    >
                      Return to Dashboard
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Navigation Buttons */}
            {step < 3 && (
              <div className="p-4 md:p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center mt-auto w-full box-border">
                {step === 1 ? (
                  <div />
                ) : (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-4 py-2 md:px-6 md:py-3 bg-white border border-slate-200 text-slate-600 text-[9px] md:text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 md:gap-2 shrink-0 max-w-[45%]"
                  >
                    <span className="scale-75 md:scale-100 flex items-center shrink-0">
                      <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
                    </span>
                    <span className="truncate">Previous</span>
                  </button>
                )}

                {step === 1 ? (
                  <button
                    onClick={() => setStep(2)}
                    disabled={!idNumber || !fullName || !dob}
                    className="px-6 py-2 md:px-8 md:py-3 bg-black text-white text-[9px] md:text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:bg-slate-300 flex items-center gap-1.5 md:gap-2 shrink-0 max-w-[50%]"
                  >
                    <span className="truncate">Next Step</span>
                    <span className="scale-75 md:scale-100 flex items-center shrink-0">
                      <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                    </span>
                  </button>
                ) : (
                  <div className="flex flex-col items-end min-w-0 max-w-[50%]">
                    <button
                      onClick={handleSubmit}
                      disabled={
                        !photoData || !hasProfilePicture || isSubmitting
                      }
                      className="px-4 py-2 md:px-8 md:py-3 bg-black text-white text-[9px] md:text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:bg-slate-300 flex items-center gap-1.5 md:gap-2 w-full justify-center shrink-0"
                    >
                      {isSubmitting && (
                        <span className="scale-75 md:scale-100 flex items-center shrink-0">
                          <HugeiconsIcon
                            icon={Loading03Icon}
                            size={16}
                            className="animate-spin"
                          />
                        </span>
                      )}
                      <span className="truncate">
                        {isSubmitting ? "Submitting..." : "Submit Verification"}
                      </span>
                      {!isSubmitting && (
                        <span className="scale-75 md:scale-100 flex items-center shrink-0">
                          <HugeiconsIcon
                            icon={CheckmarkBadge01Icon}
                            size={16}
                          />
                        </span>
                      )}
                    </button>
                    {!hasProfilePicture && (
                      <p className="text-[7px] md:text-[10px] font-bold text-red-500 uppercase tracking-widest mt-1 md:mt-2 truncate w-full text-right">
                        * Profile picture required
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
