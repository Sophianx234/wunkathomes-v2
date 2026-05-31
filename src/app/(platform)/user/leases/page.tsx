"use client"

import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Camera02Icon,
  Chat01Icon,
  CheckmarkBadge01Icon,
  UserCircleIcon
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { AnimatePresence, motion } from "framer-motion"
import React, { Suspense, useEffect, useRef, useState } from "react"

// ============================================================================
// MAIN DASHBOARD COMPONENT
// ============================================================================
function VerificationDashboard() {
  const [step, setStep] = useState(1)
  
  // Form State
  const [firstName, setFirstName] = useState("Sophian")
  const [lastName, setLastName] = useState("Abdul Rahman")
  const [dob, setDob] = useState("1998-08-15")
  const [ghaNumber, setGhaNumber] = useState("")
  const [phone, setPhone] = useState("+233 54 000 0000")
  
  // Camera State
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [photoData, setPhotoData] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Camera Management for Step 2
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
      setStream(mediaStream)
      if (videoRef.current) videoRef.current.srcObject = mediaStream
    } catch (err) {
      console.error("Camera error:", err)
    }
  }

  const stopCamera = () => {
    if (stream) stream.getTracks().forEach(track => track.stop())
  }

  useEffect(() => {
    if (step === 2 && !photoData) {
      startCamera()
    } else {
      stopCamera()
    }
    return stopCamera
  }, [step, photoData])

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      if (ctx) {
        canvasRef.current.width = videoRef.current.videoWidth
        canvasRef.current.height = videoRef.current.videoHeight
        ctx.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height)
        setPhotoData(canvasRef.current.toDataURL('image/jpeg'))
        stopCamera()
      }
    }
  }

  const handleSubmit = () => {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      setStep(3)
      setIsSubmitting(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#F4F7F9] p-4 md:p-8 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
        
        {/* ========================================================= */}
        {/* LEFT SIDEBAR */}
        {/* ========================================================= */}
        <div className="w-full lg:w-72 flex flex-col gap-6 shrink-0">
          
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center text-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Profile</p>
            
            <div className="relative mb-4">
              {/* Profile Picture Placeholder */}
              <div className="w-24 h-24 bg-slate-200 rounded-full border-4 border-white shadow-sm overflow-hidden flex items-center justify-center">
                <HugeiconsIcon icon={UserCircleIcon} size={48} className="text-slate-400" />
              </div>
              {/* Upload Picture Badge */}
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full border-2 border-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer shadow-sm">
                <HugeiconsIcon icon={Camera02Icon} size={14} className="text-white" />
              </button>
            </div>
            
            <h2 className="text-lg font-bold text-slate-900">{firstName} {lastName}</h2>
            <p className="text-xs text-slate-500 mt-1">Tenant ID: 88492</p>
          </div>

          {/* Help Card */}
          <div className="bg-white rounded-xl shadow-sm p-8 flex flex-col items-center text-center">
            <div className="mb-6 opacity-30">
              <HugeiconsIcon icon={Chat01Icon} size={48} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Need help?</h3>
            <p className="text-xs text-slate-500 leading-relaxed mb-6">
              Have questions or concerns regarding your WunkateHomes verification? Our experts are here to help!
            </p>
            <button className="w-full py-3 bg-primary hover:bg-black text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors  shadow-primary/20">
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
                <h1 className="text-xl font-bold text-slate-900 mb-2">Complete Identity Verification</h1>
                <p className="text-sm text-slate-500">Required by NIA to generate your Smart Lock PIN.</p>
              </div>
              {step < 3 && (
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Estimated time</p>
                  <p className="text-sm font-medium text-slate-900">2 mins left</p>
                </div>
              )}
            </div>

            {/* Stepper Logic */}
            <div className="flex items-center w-full max-w-2xl">
              {[1, 2, 3].map((s, index) => (
                <React.Fragment key={s}>
                  <div className="flex flex-col items-center relative">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 transition-colors ${
                      step > s ? 'bg-primary text-white' : 
                      step === s ? 'bg-primary border-4 border-blue-100 text-transparent' : 
                      'bg-slate-100 border-2 border-slate-200 text-transparent'
                    }`}>
                      {step > s && <HugeiconsIcon icon={CheckmarkBadge01Icon} size={12} />}
                    </div>
                  </div>
                  {index < 2 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-colors ${step > s ? 'bg-primary' : 'bg-slate-200'}`} />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="flex justify-between w-full max-w-2xl mt-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
              <span className={step >= 1 ? 'text-primary' : ''}>Details</span>
              <span className={`text-center ${step >= 2 ? 'text-primary' : ''}`}>Selfie ID</span>
              <span className={`text-right ${step >= 3 ? 'text-primary' : ''}`}>Review</span>
            </div>
          </div>

          {/* Form Area */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
            
            {/* Tabs (Aesthetic matching the image) */}
            <div className="flex border-b border-slate-100 px-8 pt-4">
              <div className="pb-4 border-b-2 border-primary text-sm font-bold text-slate-900 px-2">
                Verification Steps
              </div>
              <div className="pb-4 text-sm font-medium text-slate-400 px-6 opacity-50 cursor-not-allowed">
                Settings
              </div>
            </div>

            {/* Step Content */}
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
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Personal Details</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
                      <div className="relative">
                        <label className="text-xs font-medium text-slate-500 absolute -top-5 left-0">First Name</label>
                        <input 
                          type="text" 
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full pb-2 text-sm font-medium text-slate-900 bg-transparent border-0 border-b border-slate-200 focus:ring-0 focus:border-primary outline-none transition-colors"
                        />
                      </div>
                      <div className="relative">
                        <label className="text-xs font-medium text-slate-500 absolute -top-5 left-0">Last Name</label>
                        <input 
                          type="text" 
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full pb-2 text-sm font-medium text-slate-900 bg-transparent border-0 border-b border-primary focus:ring-0 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
                      <div className="relative">
                        <label className="text-xs font-medium text-slate-500 absolute -top-5 left-0">Date of Birth</label>
                        <input 
                          type="date" 
                          value={dob}
                          onChange={(e) => setDob(e.target.value)}
                          className="w-full pb-2 text-sm font-medium text-slate-900 bg-transparent border-0 border-b border-slate-200 focus:ring-0 focus:border-primary outline-none transition-colors"
                        />
                      </div>
                      <div className="relative">
                        <label className="text-xs font-medium text-slate-500 absolute -top-5 left-0">Mobile Phone</label>
                        <input 
                          type="text" 
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full pb-2 text-sm font-medium text-slate-900 bg-transparent border-0 border-b border-slate-200 focus:ring-0 focus:border-primary outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <hr className="border-slate-100 mb-10" />

                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">Identity Document</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="relative">
                        <label className="text-xs font-medium text-slate-500 absolute -top-5 left-0">Ghana Card Number</label>
                        <input 
                          type="text" 
                          placeholder="GHA-000000000-0"
                          value={ghaNumber}
                          onChange={(e) => setGhaNumber(e.target.value.toUpperCase())}
                          className="w-full pb-2 text-sm font-medium text-slate-900 bg-transparent border-0 border-b border-slate-200 focus:ring-0 focus:border-primary outline-none transition-colors uppercase"
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
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Live Verification</h3>
                    <p className="text-sm text-slate-500 mb-8 max-w-lg">
                      Please hold your physical Ghana Card next to your face. Ensure the card number is visible, well-lit, and your face is clear.
                    </p>
                    
                    <div className="w-full max-w-lg mx-auto bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden aspect-[4/3] relative">
                      {!photoData ? (
                        <>
                          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover transform -scale-x-100" />
                          <div className="absolute bottom-6 inset-x-0 flex justify-center">
                            <button onClick={takePhoto} className="w-14 h-14 bg-white border-4 border-slate-200 rounded-full hover:border-blue-300 transition-colors shadow-lg" />
                          </div>
                        </>
                      ) : (
                        <>
                          <img src={photoData} alt="Selfie Verification" className="w-full h-full object-cover transform -scale-x-100" />
                          <div className="absolute bottom-6 inset-x-0 flex justify-center">
                            <button onClick={() => { setPhotoData(null); startCamera(); }} className="px-6 py-2 bg-white text-slate-800 text-xs font-bold uppercase tracking-widest rounded-lg shadow-lg hover:bg-slate-50">
                              Retake
                            </button>
                          </div>
                        </>
                      )}
                      <canvas ref={canvasRef} className="hidden" />
                    </div>
                  </motion.div>
                )}

                {/* --- STEP 3: Review / Success --- */}
                {step === 3 && (
                  <motion.div 
                    key="step3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center text-center py-10"
                  >
                    <div className="w-20 h-20 bg-blue-50 text-primary rounded-full flex items-center justify-center mb-6">
                      <HugeiconsIcon icon={CheckmarkBadge01Icon} size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Verification Submitted</h3>
                    <p className="text-sm text-slate-500 max-w-sm">
                      Your identity documents are securely being reviewed. Your Smart Lock PIN will be generated shortly.
                    </p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Footer Navigation Buttons */}
            {step < 3 && (
              <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center mt-auto">
                {step === 1 ? (
                  <div /> // Spacer if no prev button
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
                    disabled={!ghaNumber || !firstName || !lastName}
                    className="px-8 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:bg-slate-300 flex items-center gap-2 shadow-md shadow-primary/20"
                  >
                    Next Step <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
                  </button>
                ) : (
                  <button 
                    onClick={handleSubmit}
                    disabled={!photoData || isSubmitting}
                    className="px-8 py-3 bg-primary text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:bg-slate-300 flex items-center gap-2 shadow-md shadow-primary/20"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Verification"} <HugeiconsIcon icon={CheckmarkBadge01Icon} size={16} />
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// EXPORT (Wrapped in Suspense)
// ============================================================================
export default function LeasesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F4F7F9] p-8 text-center text-slate-500 font-medium">Loading Dashboard...</div>}>
      <VerificationDashboard />
    </Suspense>
  )
}