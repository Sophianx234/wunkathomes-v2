"use client";

import Image from "next/image";
import React, { useActionState, useCallback, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

import { PhoneInput } from "@/components/phone-input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Camera01Icon,
  Cancel01Icon,
  CheckmarkBadge01Icon,
  CheckmarkBadge02Icon,
  Loading03Icon,
  LockPasswordIcon,
  UserCircleIcon,
  ViewIcon,
  ViewOffIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

import { changePasswordAction } from "@/actions/user/auth.action";
import { updateProfileAction } from "@/actions/user/profile.action";

interface InitialUser {
  name: string;
  email: string;
  phone: string;
  profilePicture: string | null;
  countryCode: string;
}

function PasswordSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-md px-4 md:px-8 h-9 md:h-11 text-[10px] md:text-sm font-medium mt-1 md:mt-2 w-full sm:w-auto"
      type="submit"
      disabled={pending}
    >
      {pending && (
        <span className="scale-75 md:scale-100 flex items-center shrink-0">
          <HugeiconsIcon
            icon={Loading03Icon}
            className="animate-spin mr-1 md:mr-2"
            size={18}
          />
        </span>
      )}
      <span className="truncate">{pending ? "Updating..." : "Update Password"}</span>
    </Button>
  );
}

const initialPasswordState = {
  success: false,
  message: "",
  error: "",
};

export default function AccountSettingsForm({
  initialUser,
}: {
  initialUser: InitialUser;
}) {
  const [activeTab, setActiveTab] = useState("profile");

  // --- Profile State ---
  const [name, setName] = useState(initialUser.name);
  const [email, setEmail] = useState(initialUser.email);
  const [phone, setPhone] = useState(initialUser.phone);
  const [countryCode, setCountryCode] = useState(initialUser.countryCode);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialUser.profilePicture,
  );
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false);

  // --- React 19 useActionState ---
  const [passwordState, passwordAction] = useActionState(
    changePasswordAction,
    initialPasswordState,
  );

  // --- Password Form State ---
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // --- Logic Checks ---
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasMinLength = newPassword.length >= 8;
  const strengthCount = [hasUppercase, hasNumber, hasMinLength].filter(
    Boolean,
  ).length;

  let strengthLabel = "Password strength";
  if (newPassword.length > 0) {
    if (strengthCount === 1) strengthLabel = "Weak password";
    if (strengthCount === 2) strengthLabel = "Fair password";
    if (strengthCount === 3) strengthLabel = "Strong password";
  }

  const shouldShowConfirmField =
    currentPassword.length > 0 && newPassword.length > 0;

  const isProfileDirty =
    name !== initialUser.name ||
    phone !== initialUser.phone ||
    countryCode !== initialUser.countryCode ||
    avatarPreview !== initialUser.profilePicture ||
    avatarFile !== null; 

  const handleDiscard = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  useEffect(() => {
    if (passwordState?.error) {
      toast.error(passwordState.error);
    } else if (passwordState?.success) {
      toast.success(passwordState.message);
      handleDiscard();
    }
  }, [passwordState]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    maxSize: 5242880,
  });

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProfileDirty) return; 

    setIsProfileSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phoneNumber", phone);
      formData.append("countryCode", countryCode);
      if (avatarFile) formData.append("profilePicture", avatarFile);

      const result = await updateProfileAction(formData);
      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsProfileSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-2 md:p-8 w-full overflow-x-hidden box-border">
      <h1 className="text-xl md:text-2xl font-bold text-slate-900 mb-4 md:mb-8 truncate px-2 md:px-0">
        Account settings
      </h1>

      <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-start w-full box-border">
        {/* --- NAVIGATION (Mobile Horizontal Scroll / Desktop Sidebar) --- */}
        <aside className="w-full md:w-64 shrink-0 bg-white border border-slate-200 rounded-lg md:rounded-xl overflow-x-auto md:overflow-hidden box-border scrollbar-hide">
          <nav className="flex flex-row md:flex-col min-w-max md:min-w-0">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-1.5 md:gap-3 px-3 py-2.5 md:px-5 md:py-4 text-[11px] md:text-sm font-medium transition-colors border-b-2 md:border-b-0 md:border-l-4 shrink-0 md:shrink-none ${
                activeTab === "profile"
                  ? "border-zinc-950 bg-slate-50 text-zinc-950"
                  : "border-transparent text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="scale-75 md:scale-100 flex items-center shrink-0">
                <HugeiconsIcon icon={UserCircleIcon} size={18} />
              </span>
              <span className="truncate">Profile Settings</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("password")}
              className={`flex items-center gap-1.5 md:gap-3 px-3 py-2.5 md:px-5 md:py-4 text-[11px] md:text-sm font-medium transition-colors border-b-2 md:border-b-0 md:border-l-4 shrink-0 md:shrink-none ${
                activeTab === "password"
                  ? "border-zinc-950 bg-slate-50 text-zinc-950"
                  : "border-transparent text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="scale-75 md:scale-100 flex items-center shrink-0">
                 <HugeiconsIcon icon={LockPasswordIcon} size={18} />
              </span>
              <span className="truncate">Password</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("verification")}
              className={`flex items-center gap-1.5 md:gap-3 px-3 py-2.5 md:px-5 md:py-4 text-[11px] md:text-sm font-medium transition-colors border-b-2 md:border-b-0 md:border-l-4 shrink-0 md:shrink-none ${
                activeTab === "verification"
                  ? "border-zinc-950 bg-slate-50 text-zinc-950"
                  : "border-transparent text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className="scale-75 md:scale-100 flex items-center shrink-0">
                <HugeiconsIcon icon={CheckmarkBadge01Icon} size={18} />
              </span>
              <span className="truncate">Identity Verification</span>
            </button>
          </nav>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 w-full min-w-0 max-w-full box-border bg-white border border-slate-200 rounded-lg md:rounded-xl p-4 md:p-10 min-h-[300px] md:min-h-[500px]">
          {activeTab === "profile" && (
            <form
              onSubmit={handleProfileSubmit}
              className="space-y-6 md:space-y-10 animate-in fade-in duration-300 w-full min-w-0 box-border"
            >
              {/* Avatar Upload */}
              <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 md:gap-6 w-full box-border">
                <div
                  {...getRootProps()}
                  className={`relative h-16 w-16 md:h-28 md:w-28 rounded-full flex items-center justify-center border-2 border-dashed overflow-hidden cursor-pointer group transition-colors shrink-0 ${
                    isDragActive
                      ? "border-zinc-950 bg-slate-50"
                      : "border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <input {...getInputProps()} className="hidden" />
                  {avatarPreview ? (
                    <Image
                      src={avatarPreview}
                      alt="Profile Avatar"
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="scale-75 md:scale-100 flex items-center">
                      <HugeiconsIcon
                        icon={UserCircleIcon}
                        size={40}
                        className="text-slate-400"
                      />
                    </span>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="scale-75 md:scale-100 flex items-center">
                      <HugeiconsIcon
                        icon={Camera01Icon}
                        className="w-4 h-4 md:w-6 md:h-6 text-white"
                      />
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5 md:gap-2 items-center sm:items-start w-full min-w-0">
                  <div className="flex items-center gap-2 md:gap-3 w-full sm:w-auto">
                    <Button
                      type="button"
                      onClick={() =>
                        (
                          document.querySelector(
                            'input[type="file"]',
                          ) as HTMLInputElement
                        )?.click()
                      }
                      className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-md text-[10px] md:text-sm font-medium h-8 md:h-10 px-3 md:px-4 w-full sm:w-auto truncate shrink-0"
                    >
                      Upload New
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={removeAvatar}
                      disabled={!avatarPreview}
                      className="text-slate-600 hover:bg-red-50 rounded-md hover:text-red-600 hover:border-red-200 transition-colors text-[10px] md:text-sm h-8 md:h-10 px-3 md:px-4 w-full sm:w-auto truncate shrink-0"
                    >
                      Delete avatar
                    </Button>
                  </div>
                  <p className="text-[9px] md:text-[13px] text-slate-500 text-center sm:text-left break-words w-full px-2 sm:px-0">
                    Recommended: Square JPG, PNG, or WebP. Max 5MB.
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-6 gap-y-4 md:gap-y-8 w-full box-border min-w-0">
                <Field className="w-full min-w-0 max-w-full box-border">
                  <FieldLabel
                    htmlFor="name"
                    className="text-[11px] md:text-sm font-medium text-slate-700"
                  >
                    Full Name *
                  </FieldLabel>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="h-9 md:h-11 bg-slate-50/50 rounded-lg md:rounded-xl border-slate-200 focus:ring-zinc-950 text-[11px] md:text-sm block w-full min-w-0 max-w-full box-border appearance-none m-0 px-3"
                    required
                  />
                </Field>

                <Field className="w-full min-w-0 max-w-full box-border">
                  <FieldLabel
                    htmlFor="email"
                    className="text-[11px] md:text-sm font-medium text-slate-700"
                  >
                    Email Address *
                  </FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 md:h-11 bg-slate-50/50 rounded-lg md:rounded-xl border-slate-200 focus:ring-zinc-950 disabled:opacity-60 text-[11px] md:text-sm block w-full min-w-0 max-w-full box-border appearance-none m-0 px-3"
                    required
                    disabled
                  />
                </Field>

                <Field className="w-full min-w-0 max-w-full box-border md:col-span-2 lg:col-span-1">
                  <FieldLabel
                    htmlFor="phone"
                    className="text-[11px] md:text-sm font-medium text-slate-700"
                  >
                    Mobile Number *
                  </FieldLabel>
                  <div className="block w-full min-w-0 max-w-full box-border">
                    <PhoneInput
                      id="phone"
                      name="phoneNumber"
                      value={phone}
                      onChange={setPhone}
                      countryCode={countryCode}
                      onCountryCodeChange={setCountryCode}
                      required
                    />
                  </div>
                  <input type="hidden" name="countryCode" value={countryCode} />
                </Field>
              </div>

              <div className="pt-3 md:pt-4 border-t border-slate-100 w-full box-border">
                <Button
                  type="submit"
                  disabled={!isProfileDirty || isProfileSubmitting}
                  className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-md px-4 md:px-8 h-9 md:h-11 text-[10px] md:text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto shrink-0 truncate"
                >
                  {isProfileSubmitting && (
                    <span className="scale-75 md:scale-100 flex items-center shrink-0">
                      <HugeiconsIcon
                        icon={Loading03Icon}
                        className="animate-spin mr-1 md:mr-2"
                        size={18}
                      />
                    </span>
                  )}
                  {isProfileSubmitting ? "Saving Changes..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}

          {activeTab === "password" && (
            <form
              action={passwordAction}
              className="max-w-md animate-in fade-in duration-300 w-full min-w-0 box-border"
            >
              <div className="flex items-start gap-2 md:gap-4 mb-4 md:mb-6 w-full box-border min-w-0">
                <div className="p-2 md:p-3 border border-slate-200 rounded-full text-slate-700 bg-white shrink-0">
                  <span className="scale-75 md:scale-100 flex items-center">
                    <HugeiconsIcon icon={LockPasswordIcon} size={24} />
                  </span>
                </div>
                <div className="min-w-0">
                  <h2 className="text-base md:text-xl font-semibold text-slate-900 truncate">
                    Change Password
                  </h2>
                  <p className="text-[10px] md:text-[14px] text-slate-500 mt-0.5 md:mt-1 break-words">
                    Update password for enhanced account security.
                  </p>
                </div>
              </div>

              <hr className="border-slate-100 mb-4 md:mb-6" />

              <div className="space-y-3 md:space-y-5 w-full min-w-0 box-border">
                <Field className="w-full min-w-0 box-border">
                  <FieldLabel
                    htmlFor="currentPassword"
                    className="text-[11px] md:text-sm font-medium text-slate-900"
                  >
                    Current Password *
                  </FieldLabel>
                  <div className="relative w-full min-w-0 box-border">
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="bg-white rounded-lg md:rounded-xl h-9 md:h-12 border-slate-200 focus:ring-zinc-950 pr-8 md:pr-10 text-[11px] md:text-sm block w-full min-w-0 box-border appearance-none m-0 px-3"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 shrink-0"
                    >
                      <span className="scale-75 md:scale-100 flex items-center">
                        {!showCurrent ? (
                          <HugeiconsIcon icon={ViewOffIcon} className="w-5 h-5" />
                        ) : (
                          <HugeiconsIcon icon={ViewIcon} className="w-5 h-5" />
                        )}
                      </span>
                    </button>
                  </div>
                </Field>

                <Field className="w-full min-w-0 box-border">
                  <FieldLabel
                    htmlFor="newPassword"
                    className="text-[11px] md:text-sm font-medium text-slate-900"
                  >
                    New Password *
                  </FieldLabel>
                  <div className="relative w-full min-w-0 box-border">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="bg-white rounded-lg md:rounded-xl h-9 md:h-12 border-slate-200 focus:ring-zinc-950 pr-8 md:pr-10 text-[11px] md:text-sm block w-full min-w-0 box-border appearance-none m-0 px-3"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 shrink-0"
                    >
                      <span className="scale-75 md:scale-100 flex items-center">
                        {!showNew ? (
                          <HugeiconsIcon icon={ViewOffIcon} className="w-5 h-5" />
                        ) : (
                          <HugeiconsIcon icon={ViewIcon} className="w-5 h-5" />
                        )}
                      </span>
                    </button>
                  </div>
                </Field>
                
                {/* Confirm Password (Hidden until ready) */}
                {shouldShowConfirmField && (
                  <div className="animate-in slide-in-from-top-4 fade-in duration-300 w-full min-w-0 box-border">
                    <Field className="w-full min-w-0 box-border">
                      <div className="flex items-center justify-between w-full box-border">
                        <FieldLabel
                          htmlFor="confirmPassword"
                          className="text-[11px] md:text-sm font-medium text-slate-900 truncate"
                        >
                          Confirm New Password *
                        </FieldLabel>
                      </div>
                      <div className="relative w-full min-w-0 box-border">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirm ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          required
                          className="bg-white rounded-lg md:rounded-xl h-9 md:h-12 border-slate-200 focus:ring-zinc-950 pr-8 md:pr-10 text-[11px] md:text-sm block w-full min-w-0 box-border appearance-none m-0 px-3"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 shrink-0"
                        >
                          <span className="scale-75 md:scale-100 flex items-center">
                            {showConfirm ? (
                              <HugeiconsIcon
                                icon={ViewOffIcon}
                                className="w-5 h-5"
                              />
                            ) : (
                              <HugeiconsIcon
                                icon={ViewIcon}
                                className="w-5 h-5"
                              />
                            )}
                          </span>
                        </button>
                      </div>
                    </Field>
                  </div>
                )}

                <div className="pt-1 md:pt-2 pb-1 md:pb-2 w-full box-border">
                  <div className="flex gap-1 md:gap-2 h-1 md:h-1.5 w-full box-border">
                    <div
                      className={`flex-1 rounded-full transition-colors duration-300 ${newPassword.length === 0 ? "bg-slate-200" : strengthCount >= 1 ? (strengthCount === 1 ? "bg-red-500" : strengthCount === 2 ? "bg-amber-400" : "bg-green-500") : "bg-red-500"}`}
                    />
                    <div
                      className={`flex-1 rounded-full transition-colors duration-300 ${newPassword.length === 0 ? "bg-slate-200" : strengthCount >= 2 ? (strengthCount === 2 ? "bg-amber-400" : "bg-green-500") : "bg-slate-200"}`}
                    />
                    <div
                      className={`flex-1 rounded-full transition-colors duration-300 ${newPassword.length === 0 ? "bg-slate-200" : strengthCount >= 3 ? "bg-green-500" : "bg-slate-200"}`}
                    />
                  </div>
                  <p className="text-[10px] md:text-[13px] text-slate-500 mt-2 md:mt-3 font-medium break-words px-1">
                    <span
                      className={
                        strengthCount === 3
                          ? "text-green-600"
                          : "text-slate-700"
                      }
                    >
                      {strengthLabel}.
                    </span>{" "}
                    Must contain:
                  </p>
                  <ul className="text-[10px] md:text-[13px] space-y-1 md:space-y-2 mt-2 md:mt-3 px-1">
                    <li
                      className={`flex items-center gap-1.5 md:gap-2 ${hasUppercase ? "text-slate-900" : "text-slate-500"}`}
                    >
                      <span className="scale-75 md:scale-100 flex items-center shrink-0">
                        {hasUppercase ? (
                          <HugeiconsIcon
                            icon={CheckmarkBadge02Icon}
                            className="w-4 h-4 md:w-5 md:h-5 text-green-500"
                          />
                        ) : (
                          <HugeiconsIcon
                            icon={Cancel01Icon}
                            className="w-4 h-4 md:w-5 md:h-5 text-slate-400"
                          />
                        )}
                      </span>
                      At least 1 uppercase
                    </li>
                    <li
                      className={`flex items-center gap-1.5 md:gap-2 ${hasNumber ? "text-slate-900" : "text-slate-500"}`}
                    >
                      <span className="scale-75 md:scale-100 flex items-center shrink-0">
                        {hasNumber ? (
                          <HugeiconsIcon
                            icon={CheckmarkBadge02Icon}
                            className="w-4 h-4 md:w-5 md:h-5 text-green-500"
                          />
                        ) : (
                          <HugeiconsIcon
                            icon={Cancel01Icon}
                            className="w-4 h-4 md:w-5 md:h-5 text-slate-400"
                          />
                        )}
                      </span>
                      At least 1 number
                    </li>
                    <li
                      className={`flex items-center gap-1.5 md:gap-2 ${hasMinLength ? "text-slate-900" : "text-slate-500"}`}
                    >
                      <span className="scale-75 md:scale-100 flex items-center shrink-0">
                        {hasMinLength ? (
                          <HugeiconsIcon
                            icon={CheckmarkBadge02Icon}
                            className="w-4 h-4 md:w-5 md:h-5 text-green-500"
                          />
                        ) : (
                          <HugeiconsIcon
                            icon={Cancel01Icon}
                            className="w-4 h-4 md:w-5 md:h-5 text-slate-400"
                          />
                        )}
                      </span>
                      At least 8 characters
                    </li>
                  </ul>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-2 md:gap-4 pt-2 md:pt-4 w-full box-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleDiscard}
                    className="w-full sm:flex-1 rounded-sm py-2 md:py-3 px-4 md:px-8 h-9 md:h-11 md:mt-2 text-[10px] md:text-sm text-slate-700 font-medium shrink-0 truncate"
                  >
                    Discard
                  </Button>
                  <PasswordSubmitButton />
                </div>
              </div>
            </form>
          )}

          {activeTab !== "profile" && activeTab !== "password" && (
            <div className="h-40 md:h-64 flex items-center justify-center text-slate-500 font-medium animate-in fade-in text-[10px] md:text-sm break-words text-center px-4 w-full box-border">
              {activeTab === "verification"
                ? "Identity Verification (Ghana Card) Flow goes here."
                : "This section is under construction."}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}