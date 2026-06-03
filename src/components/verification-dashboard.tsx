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
  AlarmClock,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AnimatePresence, motion } from "framer-motion";
import React, { Suspense, useEffect, useRef, useState } from "react";

// --- Define the expected user data shape ---
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
}

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================
export function VerificationDashboard({
  currentUser,
}: VerificationDashboardProps) {
  // --- Calculate initial step based on KYC Status ---
  const initialStep =
    currentUser?.kycStatus === "Verified"
      ? 4
      : currentUser?.kycStatus === "Pending"
        ? 3
        : 1;

  const [step, setStep] = useState(initialStep);

  // Form State - Pre-populated with user data if it exists
  const [fullName, setFullName] = useState(
    currentUser?.legalName || currentUser?.name || "",
  );

  // Format Date to YYYY-MM-DD for the input[type="date"]
  const initialDob = currentUser?.dateOfBirth
    ? new Date(currentUser.dateOfBirth).toISOString().split("T")[0]
    : "";
  const [dob, setDob] = useState(initialDob);

  // ID State
  const [idType, setIdType] = useState(currentUser?.idDocumentType || "GHA"); // 'GHA' or 'VOTER'
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

      formData.append("userId", currentUser?.id || "mockUserId_123");
      formData.append("leaseId", "mockLeaseId_456");
      formData.append("fullName", fullName);
      formData.append("dob", dob);
      formData.append("idType", idType);
      formData.append("idNumber", idNumber);

      if (profilePhoto) {
        formData.append("profilePhoto", profilePhoto);
      }

      if (photoData) {
        formData.append("verificationPhotoBase64", photoData);
      }

      const result = await submitIdentityVerification(formData);

      setTimeout(() => {
        // Move to pending review step after submission
        setStep(3);
        setIsSubmitting(false);
      }, 2000);
    } catch (error) {
      console.error("Submission failed", error);
      setIsSubmitting(false);
    }
  };

  const hasProfilePicture = !!(profilePhoto || profilePreview);

  return (
    <div className="min-h-screen bg-[#F4F7F9] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* ========================================================= */}
        {/* LEFT SIDEBAR */}
        {/* ========================================================= */}
        <div className="w-full lg:w-72 flex flex-col gap-6 shrink-0">
          <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
              Profile
            </p>

            <div className="relative mb-4">
              <div className="w-24 h-24 bg-slate-200 rounded-full border-4 border-white shadow-sm overflow-hidden flex items-center justify-center">
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Profile Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <HugeiconsIcon
                    icon={UserCircleIcon}
                    size={48}
                    className="text-slate-400"
                  />
                )}
              </div>

              {/* Hide the upload button if they are already verified */}
              {step !== 4 && (
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
                    className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full border-2 border-white flex items-center justify-center hover:bg-primary transition-colors cursor-pointer shadow-sm"
                  >
                    <HugeiconsIcon
                      icon={Camera02Icon}
                      size={14}
                      className="text-white"
                    />
                  </button>
                </>
              )}
            </div>

            {!hasProfilePicture && step !== 4 && (
              <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">
                * Required
              </p>
            )}
            {step === 4 && (
              <span className="mb-3 px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold uppercase tracking-widest rounded-full flex items-center gap-1">
                <HugeiconsIcon icon={Shield02Icon} size={12} /> Verified
              </span>
            )}
            <h2 className="text-lg font-bold text-slate-900">
              {fullName || "Your Name"}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Tenant ID: {currentUser?.id?.slice(-5) || "88492"}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center text-center">
            <div className="mb-6 opacity-30">
              <HugeiconsIcon
                icon={Chat01Icon}
                size={48}
                className="text-slate-400"
              />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Need help?
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Have questions or concerns regarding your WunkateHomes
              verification? Our experts are here to help!
            </p>
            <button className="w-full py-3 bg-primary hover:bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors shadow-primary/20">
              Chat With Us
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* MAIN CONTENT AREA */}
        {/* ========================================================= */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Progress / Status Header */}
          <div className="bg-white rounded-xl shadow-sm p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900 mb-2">
                  {step === 4
                    ? "Identity Verification Complete"
                    : "Complete Identity Verification"}
                </h1>
                <p className="text-sm text-slate-500">
                  {step === 4
                    ? "Your identity is secured. You can now access your properties."
                    : "Required to generate your Smart Lock PIN."}
                </p>
              </div>
              {step < 3 && (
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Estimated time
                  </p>
                  <p className="text-sm font-medium text-slate-900">
                    2 mins left
                  </p>
                </div>
              )}
            </div>

            {/* Stepper Logic - Expanded to 4 Steps */}
            <div className="flex items-center w-full max-w-3xl">
              {[1, 2, 3, 4].map((s, index) => (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center relative">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors ${
                        step > s
                          ? "bg-primary text-white"
                          : step === s
                            ? "bg-primary border-4 border-blue-100 text-transparent"
                            : "bg-slate-100 border-2 border-slate-200 text-transparent"
                      }`}
                    >
                      {step >= s && (
                        <HugeiconsIcon
                          icon={CheckmarkBadge01Icon}
                          size={12}
                          className={step === s ? "text-primary" : ""}
                        />
                      )}
                    </div>
                  </div>
                  {index < 3 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 transition-colors ${step > s ? "bg-primary" : "bg-slate-200"}`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between w-full max-w-3xl mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span className={step >= 1 ? "text-primary" : ""}>Details</span>
              <span
                className={`text-center pl-4 ${step >= 2 ? "text-primary" : ""}`}
              >
                Selfie ID
              </span>
              <span
                className={`text-center pl-8 ${step >= 3 ? "text-primary" : ""}`}
              >
                Review
              </span>
              <span className={`text-right ${step >= 4 ? "text-primary" : ""}`}>
                Verified
              </span>
            </div>
          </div>

          {/* Form Area */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="flex border-b border-slate-100 px-8 pt-4">
              <div className="pb-4 border-b-2 border-primary text-sm font-bold text-slate-900 px-2">
                Verification Status
              </div>
            </div>

            <div className="p-8 flex-1">
              <AnimatePresence mode="wait">
                {/* --- STEP 1: Personal Details --- */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                  >
                    {/* Rejection Banner - Shown if they were rejected previously */}
                    {currentUser?.kycStatus === "Rejected" && (
                      <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start gap-3">
                        <div className="mt-0.5 w-2 h-2 rounded-full bg-red-500 shrink-0" />
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-red-800 mb-1">
                            Verification Rejected
                          </p>
                          <p className="text-xs font-medium text-red-600 leading-relaxed">
                            Your previous submission was declined. Please ensure
                            your ID number is correct and the photo of you
                            holding your ID is clear and well-lit.
                          </p>
                        </div>
                      </div>
                    )}

                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
                      Personal Details
                    </h3>

                    <div className="mb-10">
                      <div className="relative">
                        <label className="text-xs font-medium text-slate-500 absolute -top-5 left-0">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="As it appears on your ID"
                          className="w-full pb-2 text-sm font-medium text-slate-900 bg-transparent border-0 border-b border-slate-200 focus:ring-0 focus:border-primary outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-2">
                      <div className="relative">
                        <label className="text-xs font-medium text-slate-500 absolute -top-5 left-0">
                          Date of Birth
                        </label>
                        <input
                          type="date"
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full pb-2 text-sm font-medium text-slate-900 bg-transparent border-0 border-b border-slate-200 focus:ring-0 focus:border-primary outline-none transition-colors"
                        />
                      </div>

                      <div className="relative flex items-end border-b border-slate-200 focus-within:border-primary transition-colors pb-1">
                        <label className="text-xs font-medium text-slate-500 absolute -top-5 left-0">
                          Document Number
                        </label>
                        <select
                          value={idType}
                          onChange={handleIdTypeChange}
                          className="bg-transparent text-sm font-bold text-slate-900 border-none outline-none cursor-pointer pr-4"
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
                          className="w-full text-sm font-medium text-slate-900 bg-transparent border-none focus:ring-0 outline-none pb-1 pl-4 uppercase"
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
                  >
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                      Live Verification
                    </h3>
                    <p className="text-sm text-slate-500 mb-8 max-w-lg">
                      Please hold your physical{" "}
                      {idType === "GHA" ? "Ghana Card" : "Voter ID"} next to
                      your face. Ensure the card number is visible, well-lit,
                      and your face is clear.
                    </p>

                    <div className="w-full max-w-lg mx-auto bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden aspect-[4/3] relative">
                      {!photoData ? (
                        <>
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform -scale-x-100"
                          />
                          <div className="absolute bottom-6 inset-x-0 flex justify-center">
                            <button
                              onClick={takePhoto}
                              className="w-14 h-14 bg-white border-4 border-slate-200 rounded-full hover:border-blue-300 transition-colors shadow-lg"
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
                          <div className="absolute bottom-6 inset-x-0 flex justify-center">
                            <button
                              onClick={() => {
                                setPhotoData(null);
                                startCamera();
                              }}
                              className="px-6 py-2 bg-white text-slate-800 text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg hover:bg-slate-50"
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

                {/* --- STEP 3: Pending Review --- */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-10"
                  >
                    <div className="w-20 h-20 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-6">
                      <HugeiconsIcon icon={AlarmClock} size={40} className="" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      Verification Submitted
                    </h3>
                    <p className="text-sm text-slate-500 max-w-sm">
                      Your identity documents are securely being reviewed by our
                      Admin team. This usually takes less than 24 hours.
                    </p>
                  </motion.div>
                )}

                {/* --- STEP 4: Verified --- */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-10"
                  >
                    <div className="w-20 h-20 bg-green-50 border border-green-100 text-green-500 rounded-full flex items-center justify-center mb-6">
                      <HugeiconsIcon icon={CheckmarkBadge01Icon} size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">
                      Identity Verified
                    </h3>
                    <p className="text-sm text-slate-500 max-w-sm mb-8">
                      Your identity documents have been approved. Your account
                      is fully active and you are ready to access your
                      properties.
                    </p>
                    <button
                      onClick={() => (window.location.href = "/user/dashboard")}
                      className="px-8 py-3 bg-zinc-950 hover:bg-zinc-800 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors shadow-lg shadow-black/10"
                    >
                      Review & Sign Lease
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer Navigation Buttons */}
            {step < 3 && (
              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center mt-auto">
                {step === 1 ? (
                  <div />
                ) : (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-3 bg-white border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-2"
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={16} /> Previous
                  </button>
                )}

                {step === 1 ? (
                  <button
                    onClick={() => setStep(2)}
                    disabled={!idNumber || !fullName || !dob}
                    className="px-8 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-primary transition-colors disabled:opacity-50 disabled:bg-slate-300 flex items-center gap-2 "
                  >
                    Next Step{" "}
                    <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                  </button>
                ) : (
                  <div className="flex flex-col items-end">
                    <button
                      onClick={handleSubmit}
                      disabled={
                        !photoData || !hasProfilePicture || isSubmitting
                      }
                      className="px-8 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-primary transition-colors disabled:opacity-50 disabled:bg-slate-300 flex items-center gap-2 "
                    >
                      {isSubmitting && (
                        <HugeiconsIcon
                          icon={Loading03Icon}
                          size={16}
                          className="animate-spin"
                        />
                      )}
                      {isSubmitting ? "Submitting..." : "Submit Verification"}{" "}
                      <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} />
                    </button>
                    {!hasProfilePicture && (
                      <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mt-2">
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
