# 📋 WunkatHomes v2 — Session Handover & Conversation History

> **Status:** Saved for PC Restart  
> **Date:** October 12, 2026  
> **Repository:** `wunkat-homes-v2`  
> **Author:** Antigravity AI Assistant & Engineering Lead

---

## 📑 Table of Contents
1. [Session Overview & Context](#session-overview--context)
2. [Completed Work & Pushed Commits](#completed-work--pushed-commits)
   - [1. Success Receipt Page Redesign](#1-success-receipt-page-redesign)
   - [2. Payment Method String Formatting](#2-payment-method-string-formatting)
   - [3. Transaction Receipt Redesign & PDF Engine](#3-transaction-receipt-redesign--pdf-engine)
   - [4. Build & Export Error Resolution](#4-build--export-error-resolution)
   - [5. Hero Floating Success Pill Alignment](#5-hero-floating-success-pill-alignment)
3. [Tuya Smart Lock & Gateway Hardware Deep-Dive (Q&A Breakdown)](#tuya-smart-lock--gateway-hardware-deep-dive-qa-breakdown)
   - [Issue 1: "No wireless detected" on the Lock](#issue-1-no-wireless-detected-on-the-lock)
   - [Issue 2: Lock Missing Under Zigbee Hub](#issue-2-lock-missing-under-zigbee-hub)
   - [Issue 3: Direct Bluetooth Pairing Works, But Hub Cannot Find It](#issue-3-direct-bluetooth-pairing-works-but-hub-cannot-find-it)
   - [Issue 4: Hub Says "No Sub-devices Can Be Added"](#issue-4-hub-says-no-sub-devices-can-be-added)
   - [Issue 5: Phone Hotspot vs Real Wi-Fi](#issue-5-phone-hotspot-vs-real-wi-fi)
   - [Issue 6: The "Phone Bluetooth Lock" Conflict](#issue-6-the-phone-bluetooth-lock-conflict)
   - [Issue 7: Standalone Bluetooth vs Gateway-Enabled vs Direct Wi-Fi Locks](#issue-7-standalone-bluetooth-vs-gateway-enabled-vs-direct-wi-fi-locks)
   - [Issue 8: Direct Wi-Fi Locks & Tuya Cloud API](#issue-8-direct-wi-fi-locks--tuya-cloud-api)
   - [Issue 9: How to Identify Lock Hardware in 10 Seconds](#issue-9-how-to-identify-lock-hardware-in-10-seconds)
4. [Pending Task To Resume After Restart](#pending-task-to-resume-after-restart)
   - [Modal Scrolling & Scrollbar Hiding](#modal-scrolling--scrollbar-hiding)

---

## 🚀 Session Overview & Context
This session focused on two primary tracks:
1. **Frontend Perfection & Enterprise Document Systems:** Modernizing success receipts, implementing `@react-pdf/renderer` for official 1-to-1 PDF previews across receipts and the tenancy Document Vault, fixing CSP headers, and aligning UI components.
2. **IoT Smart Lock Hardware Integration:** Comprehensive troubleshooting and architectural review of the Tuya Smart Lock, Bluetooth + Wi-Fi Hub, network topologies, and cloud compatibility with the WunkatHomes platform backend.

---

## 🛠️ Completed Work & Pushed Commits

### 1. Success Receipt Page Redesign
* **Goal:** Industry-standard, cardless aesthetic.
* **Changes in `src/components/success-reciept.tsx`:**
  * Replaced the boxed `max-w-[500px]` card container with a full-bleed hero banner taking up `40vh - 50vh`.
  * Positioned receipt information directly on the canvas with clean grid layouts (`max-w-5xl`).
  * Removed shadows and unnecessary border nesting.

### 2. Payment Method String Formatting
* **Goal:** Clean up raw payment gateway strings like `Paystack (mobile_money)`.
* **Changes in `success-reciept.tsx`, `print-reciept.tsx`, `print-reciept-cleint.tsx`, `transaction-reciept.tsx`:**
  * Stripped the `Paystack (...)` wrapping prefix.
  * Replaced all underscores with spaces (`.replace(/_/g, " ")`).
  * Applied `capitalize` so `mobile_money` formats cleanly as **Mobile Money**, `bank_transfer` as **Bank Transfer**, etc.

### 3. Transaction Receipt Redesign & PDF Engine
* **Goal:** Replace standard HTML/browser print dialogs with high-fidelity embedded PDF previewers for both the **Transaction Receipt** and the **Document Vault**.
* **Installed:** `@react-pdf/renderer` v4.9.0.
* **New Components:**
  * `src/components/pdf-viewer-wrapper.tsx`: Client-side wrapper utilizing `next/dynamic` (`ssr: false`) to prevent Next.js SSR hydration crashes. Styled with clean flat borders and **zero drop shadows**.
  * `src/components/pdf/transaction-receipt-pdf.tsx`: React-PDF document template for transaction receipts.
  * `src/components/pdf/tenancy-document-pdf.tsx`: React-PDF document template for tenancy lease agreements.
* **Production Fixes (Preventing Blank PDF Previews):**
  * Removed external Google Fonts network calls (`Font.register`) that failed via CORS, standardizing on built-in `Helvetica`.
  * Added extensive optional chaining (`?.`) across all document fields to prevent fatal AST compilation failures.
  * Updated `src/proxy.ts` Content Security Policy (CSP):
    * Added `frame-src 'self' blob: ...`
    * Added `object-src 'self' blob: data:`
    * Adjusted `X-Frame-Options` from `DENY` to `SAMEORIGIN` to allow `blob:` iframes to render safely.

### 4. Build & Export Error Resolution
* **Issue:** Next.js build failed with: `Export TransactionReceipt doesn't exist in target module`.
* **Root Cause:** `transaction-reciept.tsx` exported as `default`, while `transactions-client.tsx`, `transaction-client.tsx`, and `success-reciept.tsx` used named imports `{ TransactionReceipt }`.
* **Fix:** Standardized all imports to `import TransactionReceipt from "./transaction-reciept";`. Build passed with 0 errors.

### 5. Hero Floating Success Pill Alignment
* **Goal:** Align `{/* Floating Success Pill */}` with `{/* Property Info at Bottom of Image */}`.
* **Fix in `src/components/success-reciept.tsx`:**
  * Wrapped the floating badge in `<div className="absolute top-6 md:top-10 inset-x-0"><div className="max-w-5xl mx-auto px-6 md:px-10 w-full flex">...</div></div>`.
  * Perfectly matches the left-alignment grid of the property title and location.

---

## 🔒 Tuya Smart Lock & Gateway Hardware Deep-Dive (Q&A Breakdown)

### Issue 1: "No wireless detected" on the Lock
* **User Question:** *"now when i try to add the network on the tuya smartlock it says no wireless detected meanwhile i've setup the smarthub"* / *"there are hotspots or wifi in the room but it says no wireless device detected"*
* **Technical Cause:** Tuya smart locks do not have a Wi-Fi browser screen. When the lock's internal voice speaker announces *"No wireless detected"*, it is a translation of *"No wireless module detected"*.
* **Solution:** Inside the rear panel/battery compartment, there is a small detachable communication chip (Wi-Fi/Zigbee/BLE module). If this chip is loose or unseated, the motherboard cannot detect it. Reseating the module firmly into its pin header resolved the issue.

---

### Issue 2: Lock Missing Under Zigbee Hub
* **User Question:** *"now it working. however when i try to add the sub device under the zigbee hub it doesn't appear. how do we fix this"*
* **Technical Cause:** Protocol mismatch. The smart lock in hand was a **Bluetooth (BLE)** smart lock, not a Zigbee smart lock. Zigbee hubs have no Bluetooth antenna and cannot discover Bluetooth devices.

---

### Issue 3: Direct Bluetooth Pairing Works, But Hub Cannot Find It
* **User Observation:** *"now on the app when i try adding the smartlock directly with the bluetooth it works. however when i try to add it as a sub device to the zigbee hub it doesn't detect the smart lock"* / *"it says bluetooth + wifi on the case"*
* **Confirmation:** The gateway is a **Tuya Bluetooth + Wi-Fi Gateway**, and the lock is a **Bluetooth Lock**. They are on the exact same radio standard!
* **Pairing Rule for Bluetooth Gateways:** Unlike Zigbee (where devices must be discovered as raw sub-devices), Bluetooth devices are first paired to your phone's Tuya app via Bluetooth, and then **associated/bound** to the Bluetooth Gateway.

---

### Issue 4: Hub Says "No Sub-devices Can Be Added"
* **User Question:** *"under the add existing device it says no sub devices can be added"*
* **Root Causes & Solutions:**
  1. **Lock is Asleep:** Locks enter deep sleep after 30 seconds to conserve battery. Waking the keypad (`*#`) right before tapping "Add existing" wakes the BLE radio.
  2. **Proximity:** The hub must be within 2-3 meters of the lock during initial binding.
  3. **Tuya "Home" Mismatch:** Both the Lock and Gateway must belong to the exact same Home in the Tuya app dropdown.
  4. **Alternative Binding:** Binding can also be triggered from the Lock side: *Smart Lock $\rightarrow$ Settings $\rightarrow$ Remote Unlock $\rightarrow$ ON*.

---

### Issue 5: Phone Hotspot vs Real Wi-Fi
* **User Question:** *"still not connecting is it because i'm using my phone hotspot and not actual wifi"*
* **Answer:** **Yes, phone hotspots are a major failure point for IoT gateways.**
  1. **Same-Device Conflict:** When a phone broadcasts a hotspot, its Wi-Fi chip is in Access Point (AP) mode. It cannot route local discovery packets (mDNS/UDP) between an app on the phone and a device on its own hotspot.
  2. **Client/AP Isolation:** Mobile hotspots isolate connected clients from talking to each other.
  3. **5 GHz vs 2.4 GHz:** Phones default to 5 GHz hotspots; Tuya gateways only support 2.4 GHz.
  4. **Production Requirement:** For WunkatHomes to issue real-time PINs and execute remote unlock via API, the gateway needs 24/7 internet from a dedicated router, not a hotspot that disconnects when the phone leaves or sleeps.

---

### Issue 6: The "Phone Bluetooth Lock" Conflict
* **User Question:** *"i'm able to connect the smarthub to the hotspot with the tuya app. however when i add the smart lock via the tuya app it works but when i try to add it to the smart lock to the smarthub it never finds it. it keeps scanning forever. i'm frustrated"*
* **The Breakthrough:** Bluetooth Low Energy (BLE) smart locks are **point-to-point** (single connection).
  * While your phone has the Tuya app open and Bluetooth turned on, **your phone holds the active connection to the lock**.
  * While connected to the phone, the lock **stops broadcasting advertising packets**.
  * The hub scans, hears silence, and spins forever!
* **The Fix:**
  1. Turn **OFF Bluetooth on your phone**.
  2. Keep your phone connected to internet/data.
  3. Wake the lock keypad.
  4. Trigger the Hub search in the app.
  5. The lock is now free to broadcast to the Hub!

---

### Issue 7: Standalone Bluetooth vs Gateway-Enabled vs Direct Wi-Fi Locks
* **User Discovery:** *"i learn there are two types of tuya smartlocks. 1. Standalone Bluetooth Locks and 2. Gateway-Enabled / Dual-Mode Locks"*
* **Breakdown:**
  * **Standalone Bluetooth Locks:** Designed *only* for local phone app access. No gateway firmware support. Cannot be bound to any hub. PINs are generated via an offline mathematical algorithm (like a bank authenticator token) without internet on the lock.
  * **Gateway-Enabled Bluetooth Locks:** Include gateway-docking firmware beacons. Can be bridged to Wi-Fi via a Tuya Bluetooth Gateway for real-time cloud API control.
  * **Direct Wi-Fi Smart Locks:** Contain built-in 2.4 GHz Wi-Fi chips. Connect directly to your router **without needing any hub at all**.

---

### Issue 8: Direct Wi-Fi Locks & Tuya Cloud API
* **User Question:** *"i also learn if the smart lock connects with wifi then it automatically supports communicating with the tuya cloud. is this true"* / *"does that mean we'll have to change the flow of the application"*
* **Answer:** **Yes, it is 100% true, and NO, we do not have to change any code!**
  * Wi-Fi locks connect directly to the Tuya Cloud MQTT servers.
  * The **WunkatHomes** platform (`src/lib/tuya.ts`, `src/services/tenant.service.ts`, `src/app/api/webhooks/tuya/route.ts`) was already architected from day one to interact with **Tuya Cloud OpenAPI** using `tuyaDeviceId`.
  * Whether you use a Direct Wi-Fi lock or a Gateway-bridged Bluetooth lock, **the backend flow is 100% identical and works out of the box.**

---

### Issue 9: How to Identify Lock Hardware in 10 Seconds
* **User Question:** *"how do i know if the lock is Bluetooth Lock + Compatible Gateway or Direct Wi-Fi Smart Lock"*
* **Quick Diagnostics:**
  1. **Tuya App Device Info:** Open Lock $\rightarrow$ Settings `✏️` $\rightarrow$ Device Information $\rightarrow$ Check **Communication Protocol** (says "Wi-Fi" or "Bluetooth").
  2. **Setup Prompt:** Did the app ask for your Wi-Fi name and password during pairing? (Wi-Fi locks require this; Bluetooth locks do not).
  3. **Gateway Option:** If Bluetooth, does the lock's settings menu contain a **"Gateway"** or **"Remote Unlock"** option? (If present = Gateway-Compatible; If absent = Standalone).
  4. **Hardware Model Code:** Check the sticker/manual: `-WF`/`-WiFi` = Direct Wi-Fi; `-BT`/`-BLE` = Bluetooth.

---

## 📌 Pending Task To Resume After Restart

### Modal Scrolling & Scrollbar Hiding
* **User's Request:**
  > *"now let's fix the modals the scroll is not working it rather scrolls the main page instead. also ensure to hide the modal scroll bar however it should still scroll"*
* **Technical Plan:**
  1. **Inspect Modal Implementations:**
     * Check `src/components/ui/dialog.tsx` (Radix Dialog / Shadcn Dialog).
     * Check any custom modal containers (e.g. `AlertDialog`, `DialogContent`, custom fixed overlays).
  2. **Fix Background Scroll Lock (`overscroll-contain` / body lock):**
     * Ensure modal overlay traps scroll events using `overflow-y-auto max-h-[85vh]` or `max-h-[90vh]` on the dialog body.
     * Add `overscroll-contain` so scrolling inside the modal does not chain to the document body behind it.
  3. **Hide Scrollbar While Maintaining Scrollability:**
     * Add utility classes: `scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]`.

---

## 🏁 Quick Command to Resume
Once your PC restarts, open your terminal and run:
```bash
# Verify git status and existing branch
git status

# Start dev server
pnpm dev
```
Then ask: *"Let's fix the modal scrolling and scrollbar hiding now"*, and we will immediately execute the fix!
