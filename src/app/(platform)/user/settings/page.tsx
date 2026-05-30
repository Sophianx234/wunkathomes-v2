"use client"

import React, { useState, useCallback, useEffect } from "react"
import { useUserStore } from "@/store/user-store"
import { useDropzone } from "react-dropzone"
import { toast } from "sonner"
import Image from "next/image"
import { useFormState, useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Field, FieldLabel } from "@/components/ui/field" // Assuming you use these wrappers
import { PhoneInput } from "@/components/phone-input" // Adjust path as needed
import { HugeiconsIcon } from "@hugeicons/react"
import { 
  UserCircleIcon, 
  LockPasswordIcon, 
  Notification01Icon, 
  CheckmarkBadge01Icon,
  Camera01Icon,
  Loading03Icon,
  CheckmarkBadge02Icon,
  CancelCircleIcon,
  ViewOffIcon,
  ViewIcon
} from "@hugeicons/core-free-icons"

import { changePasswordAction } from "@/actions/auth.action"

// --- Password Submit Button (Must be inside the password <form>) ---
function PasswordSubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button 
      className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-md px-8 h-11 font-medium mt-2" 
      type="submit"
      disabled={pending}
    >
      {pending && <HugeiconsIcon icon={Loading03Icon} className="animate-spin mr-2" size={18} />}
      {pending ? "Updating Password..." : "Update Password"}
    </Button>
  )
}

const initialPasswordState = {
  success: false,
  message: "",
  error: "",
}

export default function AccountSettingsPage() {
  const { user } = useUserStore()

  // --- Profile State ---
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [countryCode, setCountryCode] = useState("+233") // Added Country Code State
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [isProfileSubmitting, setIsProfileSubmitting] = useState(false)
  const [passwordState, passwordAction] = useFormState(changePasswordAction, initialPasswordState)

  // --- Password State ---
// --- Password Form State ---
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  // --- Password Visibility State ---
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  // --- Password Strength Logic ---
  const hasUppercase = /[A-Z]/.test(newPassword)
  const hasNumber = /[0-9]/.test(newPassword)
  const hasMinLength = newPassword.length >= 8
  const strengthCount = [hasUppercase, hasNumber, hasMinLength].filter(Boolean).length

  let strengthLabel = "Password strength"
  if (newPassword.length > 0) {
    if (strengthCount === 1) strengthLabel = "Weak password"
    if (strengthCount === 2) strengthLabel = "Fair password"
    if (strengthCount === 3) strengthLabel = "Strong password"
  }
  
  const handleDiscard = () => {
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
  }
  const [activeTab, setActiveTab] = useState("profile")

  // Hydrate form when user data loads
  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setEmail(user.email || "")
      setPhone((user as any).phone || "") 
      setAvatarPreview(user.avatar || null)
    }
  }, [user])

  // Watch for Password Form success/errors
  useEffect(() => {
    if (passwordState?.error) {
      toast.error(passwordState.error)
    } else if (passwordState?.success) {
      toast.success(passwordState.message)
      // Optional: Reset form fields here by interacting with a ref, 
      // or simply rely on the success toast.
    }
  }, [passwordState])

  // React-Dropzone Configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    maxSize: 5242880, // 5MB
  })

  const removeAvatar = () => {
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  // Profile Form Submission Handler
  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsProfileSubmitting(true)

    try {
      const formData = new FormData()
      formData.append("name", name)
      formData.append("email", email)
      formData.append("phoneNumber", phone)
      formData.append("countryCode", countryCode)
      if (avatarFile) formData.append("profilePicture", avatarFile)

      // Simulating network request for Profile update
      await new Promise((resolve) => setTimeout(resolve, 1500))
      toast.success("Profile updated successfully!")
    } catch (error) {
      toast.error("Failed to update profile. Please try again.")
    } finally {
      setIsProfileSubmitting(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Account settings</h1>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* --- SIDEBAR NAVIGATION --- */}
        <aside className="w-full md:w-64 shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden hidden md:block">
          <nav className="flex flex-col">
            <button 
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-5 py-4 text-sm font-medium transition-colors border-l-4 ${
                activeTab === "profile" 
                  ? "border-zinc-950 bg-slate-50 text-zinc-950" 
                  : "border-transparent text-slate-600 hover:bg-slate-50"
              }`}
            >
              <HugeiconsIcon icon={UserCircleIcon} size={18} />
              Profile Settings
            </button>
            <button 
              onClick={() => setActiveTab("password")}
              className={`flex items-center gap-3 px-5 py-4 text-sm font-medium transition-colors border-l-4 ${
                activeTab === "password" 
                  ? "border-zinc-950 bg-slate-50 text-zinc-950" 
                  : "border-transparent text-slate-600 hover:bg-slate-50"
              }`}
            >
              <HugeiconsIcon icon={LockPasswordIcon} size={18} />
              Password
            </button>
            <button 
              onClick={() => setActiveTab("verification")}
              className={`flex items-center gap-3 px-5 py-4 text-sm font-medium transition-colors border-l-4 ${
                activeTab === "verification" 
                  ? "border-zinc-950 bg-slate-50 text-zinc-950" 
                  : "border-transparent text-slate-600 hover:bg-slate-50"
              }`}
            >
              <HugeiconsIcon icon={CheckmarkBadge01Icon} size={18} />
              Identity Verification
            </button>
          
          </nav>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 w-full bg-white border border-slate-200 rounded-xl p-6 md:p-10 min-h-[500px]">
          
          {/* ======================= */}
          {/* TAB 1: PROFILE SETTINGS */}
          {/* ======================= */}
          {activeTab === "profile" && (
            <form onSubmit={handleProfileSubmit} className="space-y-10 animate-in fade-in duration-300">
              
              {/* Avatar Upload */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div 
                  {...getRootProps()} 
                  className={`relative h-28 w-28 rounded-full flex items-center justify-center border-2 border-dashed overflow-hidden cursor-pointer group transition-colors shrink-0 ${
                    isDragActive ? "border-zinc-950 bg-slate-50" : "border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <input {...getInputProps()} />
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="Profile Avatar" fill className="object-cover" />
                  ) : (
                    <HugeiconsIcon icon={UserCircleIcon} size={40} className="text-slate-400" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <HugeiconsIcon icon={Camera01Icon} size={24} className="text-white" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <Button 
                      type="button" 
                      onClick={() => (document.querySelector('input[type="file"]') as HTMLInputElement)?.click()}
                      className="bg-primary hover:bg-zinc-800 text-white rounded-sm text-sm font-medium"
                    >
                      Upload New
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={removeAvatar}
                      disabled={!avatarPreview}
                      className="text-slate-600 hover:bg-red-50 rounded-sm hover:text-red-600 hover:border-red-200 transition-colors"
                    >
                      Delete avatar
                    </Button>
                  </div>
                  <p className="text-[13px] text-slate-500">Recommended: Square JPG, PNG, or WebP. Max 5MB.</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                <Field>
                  <FieldLabel htmlFor="name" className="text-sm font-medium text-slate-700">Full Name *</FieldLabel>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    placeholder="Enter your full name" 
                    className="h-11 bg-slate-50/50 rounded-xl border-slate-200 focus:ring-zinc-950" 
                    required 
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="email" className="text-sm font-medium text-slate-700">Email Address *</FieldLabel>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="example@wunkathomes.com" 
                    className="h-11 bg-slate-50/50 rounded-xl border-slate-200 focus:ring-zinc-950 disabled:opacity-60" 
                    required
                    disabled
                  />
                </Field>

                {/* UPDATED: PhoneInput Integration */}
                <Field>
                  <FieldLabel htmlFor="phone" className="text-sm font-medium text-slate-700">Mobile Number *</FieldLabel>
                  <PhoneInput
                    id="phone"
                    name="phoneNumber"
                    value={phone}
                    onChange={setPhone}
                    countryCode={countryCode}
                    onCountryCodeChange={setCountryCode}
                    required
                  />
                  <input type="hidden" name="countryCode" value={countryCode} />
                </Field>

                <Field>
  <FieldLabel className="text-sm font-medium text-slate-700">Account Role</FieldLabel>
  <Input 
    value={user?.role || "User"} 
    className="h-11 bg-slate-100 rounded-xl border-slate-200 text-slate-500 font-medium cursor-not-allowed" 
    readOnly 
  />
</Field>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Button 
                  type="submit" 
                  disabled={isProfileSubmitting}
                  className="bg-primary hover:bg-zinc-800 text-white rounded-md px-8 h-11 font-medium"
                >
                  {isProfileSubmitting && <HugeiconsIcon icon={Loading03Icon} className="animate-spin mr-2" size={18} />}
                  {isProfileSubmitting ? "Saving Changes..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}

         {/* ======================= */}
         {/* ======================= */}
          {/* TAB 2: PASSWORD         */}
          {/* ======================= */}
          {activeTab === "password" && (
            <form action={passwordAction} className="max-w-md animate-in fade-in duration-300">
              
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 border border-slate-200 rounded-full text-slate-700 bg-white ">
                  <HugeiconsIcon icon={LockPasswordIcon} size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Change Password</h2>
                  <p className="text-[14px] text-slate-500 mt-1">Update password for enhanced account security.</p>
                </div>
              </div>

              <hr className="border-slate-100 mb-6" />

              <div className="space-y-5">
                {/* Current Password */}
                <Field>
                  <FieldLabel htmlFor="currentPassword" className="text-sm font-medium text-slate-900">Current Password <span className="">*</span></FieldLabel>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      name="currentPassword"
                      type={showCurrent ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="bg-white rounded-xl h-12 border-slate-200 focus:ring-zinc-950 pr-10"
                    />
                    <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {!showCurrent ? <HugeiconsIcon icon={ViewOffIcon} className="w-5 h-5" /> : <HugeiconsIcon icon={ViewIcon} className="w-5 h-5" />}
                    </button>
                  </div>
                </Field>

                {/* New Password */}
                <Field>
                  <FieldLabel htmlFor="newPassword" className="text-sm font-medium text-slate-900">New Password <span className="">*</span></FieldLabel>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      className="bg-white rounded-xl h-12 border-slate-200 focus:ring-zinc-950 pr-10"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {!showNew ? <HugeiconsIcon icon={ViewOffIcon} className="w-5 h-5" /> : <HugeiconsIcon icon={ViewIcon} className="w-5 h-5" />}
                    </button>
                  </div>
                </Field>

                {/* Confirm Password */}
                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="confirmPassword" className="text-sm font-medium text-slate-900">Confirm New Password <span className="">*</span></FieldLabel>
                    <button type="button" onClick={() => setConfirmPassword("")} className="text-sm text-slate-500 hover:text-slate-800">Clear</button>
                  </div>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="bg-white rounded-xl h-12 border-slate-200 focus:ring-zinc-950 pr-10"
                      placeholder="••••••••"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showConfirm ? <HugeiconsIcon icon={ViewOffIcon} className="w-5 h-5" /> : <HugeiconsIcon icon={ViewIcon} className="w-5 h-5" />}
                    </button>
                  </div>
                </Field>

                {/* Strength Meter */}
                <div className="pt-2">
                  <div className="flex gap-2 h-1.5 w-full">
                    <div className={`flex-1 rounded-full transition-colors duration-300 ${newPassword.length === 0 ? 'bg-slate-200' : strengthCount >= 1 ? (strengthCount === 1 ? 'bg-red-500' : strengthCount === 2 ? 'bg-amber-400' : 'bg-green-500') : 'bg-red-500'}`} />
                    <div className={`flex-1 rounded-full transition-colors duration-300 ${newPassword.length === 0 ? 'bg-slate-200' : strengthCount >= 2 ? (strengthCount === 2 ? 'bg-amber-400' : 'bg-green-500') : 'bg-slate-200'}`} />
                    <div className={`flex-1 rounded-full transition-colors duration-300 ${newPassword.length === 0 ? 'bg-slate-200' : strengthCount >= 3 ? 'bg-green-500' : 'bg-slate-200'}`} />
                  </div>
                  
                  <p className="text-[13px] text-slate-500 mt-3 font-medium">
                    <span className={strengthCount === 3 ? "text-green-600" : "text-slate-700"}>{strengthLabel}.</span> Must contain;
                  </p>

                  <ul className="text-[13px] space-y-2 mt-3">
                    <li className={`flex items-center gap-2 ${hasUppercase ? "text-slate-900" : "text-slate-500"}`}>
                      {hasUppercase ? <HugeiconsIcon icon={CheckmarkBadge02Icon} className="w-5 h-5 text-green-500" /> : <HugeiconsIcon icon={CancelCircleIcon} className="w-5 h-5 text-slate-400" />}
                      At least 1 uppercase
                    </li>
                    <li className={`flex items-center gap-2 ${hasNumber ? "text-slate-900" : "text-slate-500"}`}>
                      {hasNumber ? <HugeiconsIcon icon={CheckmarkBadge02Icon} className="w-5 h-5 text-green-500" /> : <HugeiconsIcon icon={CancelCircleIcon} className="w-5 h-5 text-slate-400" />}
                      At least 1 number
                    </li>
                    <li className={`flex items-center gap-2 ${hasMinLength ? "text-slate-900" : "text-slate-500"}`}>
                      {hasMinLength ? <HugeiconsIcon icon={CheckmarkBadge02Icon} className="w-5 h-5 text-green-500" /> : <HugeiconsIcon icon={CancelCircleIcon} className="w-5 h-5 text-slate-400" />}
                      At least 8 characters
                    </li>
                  </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 pt-4 ">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleDiscard}
                    className="flex-1 rounded-sm py-3 px-8 h-11 mt-2 text-slate-700 font-medium"
                  >
                    Discard
                  </Button>
                  <PasswordSubmitButton />
                </div>
              </div>
            </form>
          )}

          {/* Placeholder states for other tabs */}
          {activeTab !== "profile" && activeTab !== "password" && (
            <div className="h-64 flex items-center justify-center text-slate-500 font-medium animate-in fade-in">
              {activeTab === "verification" ? "Identity Verification (Ghana Card) Flow goes here." : "This section is under construction."}
            </div>
          )}

        </main>
      </div>
    </div>
  )
}