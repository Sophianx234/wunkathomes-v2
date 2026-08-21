# Tuya Smart Lock Integration Guide & Status

This document serves as a handover for any developer or AI agent continuing the Tuya Smart Lock integration for the Wunkat Homes platform. 

## 🏗️ Architecture Overview
The application acts as a SaaS middleman between the end-users and the Tuya Cloud API. Users do not use the official Tuya App. Instead:
1. **Admins/Installers** pair physical locks to a master Tuya account (App Account UID) via the Tuya app.
2. **The Next.js Backend** authenticates with the Tuya Cloud API using HMAC-SHA256 signatures and syncs the fleet using the `TUYA_ADMIN_UID`.
3. **MongoDB** tracks which `tuyaDeviceId` belongs to which `Property` / `Listing`.
4. **Users/Tenants** click buttons on the web app, and the Next.js server relays those commands to Tuya.

---

## ✅ What Has Been Completed (Admin Phase Complete)

### 1. API Wrapper & Authentication (`src/lib/tuya.ts`)
- Custom Tuya OpenAPI request wrapper using native `crypto`.
- Handles dynamic token generation, caching, and HMAC signature calculation.
- Includes functions: `getAccessToken()`, `getDeviceDetails(deviceId)`, `getDevicesByUser(uid)` and `createTemporaryPin()`.

### 2. Environment Variables
The following variables are active in `.env`:
- `TUYA_ACCESS_ID`
- `TUYA_ACCESS_SECRET`
- `TUYA_ENDPOINT`
- `TUYA_ADMIN_UID` (The App Account UID from Tuya IoT platform used to sync the fleet).

### 3. Database Schema (`src/models/smartlock.ts`)
- A Mongoose model (`SmartLock`) bridges Tuya devices to properties.
- Fields: `tuyaDeviceId`, `name`, `propertyId`, `listingId`, `status` ('unassigned', 'online', 'offline'), `batteryLevel`, `lockState` ('locked', 'unlocked', 'unknown'), `doorState` ('closed', 'open', 'unknown').

### 4. Fleet Auto-Sync & Admin Actions (`src/actions/admin/smartlock.action.ts`)
- `syncLocksFromCloud()`: Fetches the entire fleet of devices from Tuya's servers and saves new ones to MongoDB. 
  - *Dev Note: There is currently a mock data loop inside this function that clones the first Tuya device 14 times. This is strictly for UI testing in `NODE_ENV === 'development'` and should be ignored/removed for production.*
- `renameSmartLock()`: Updates the human-readable name of a lock directly in MongoDB.

### 5. Hardware Fleet Dashboard (`src/app/admin/smartlocks/page.tsx`)
- A full Admin UI is available at `/admin/smartlocks`.
- Uses client component `src/components/admin/smartlock-manager.tsx`.
- Features real-time search, status filtering, renaming, and an "Edit Property" link that jumps directly to the property a lock is assigned to.
- **UI Architecture:** Completely redesigned to match the Wunkat monochrome/zinc aesthetic, heavily relying on Shadcn UI (`Badge`, `DropdownMenu`) and minimalist Lucide icons over flashy colored backgrounds.

### 6. Property Assignment Integration
- Locks are assigned to properties during the Property Creation or Edit flow.
- `src/components/smart-lock-toggle.tsx` provides a dropdown of unassigned locks.
- Server Actions (`createPropertyAction`, `editPropertyAction`, `deletePropertyAction`) handle the assignment atomically using **Mongoose Transactions**, guaranteeing data consistency. If a property is deleted, the hardware is safely unassigned and returned to the fleet pool.

### 7. Security & Edge Cases (Important for Future Queries)
- **Private Data:** In the `Listing` model, `smartLock.accessInstructions` is explicitly configured with `select: false`. This ensures sensitive entry codes are never accidentally leaked in public API queries.
- **Querying Private Data:** If you ever need to retrieve the instructions (e.g., to display in the secure Tenant Dashboard or the Admin Edit Page), you **MUST** explicitly append `.select('+smartLock.accessInstructions')` to your Mongoose query.

### 8. Admin Tenant Onboarding & Activation
- The provisioning flow is fully integrated into `src/app/admin/manage/tenants` (Unified Tenant Directory).
- The "Tenant Profile Modal" automatically adapts to the lease stage. For `Pending_Verification` leases that are fully approved, Admins can click **"Activate Lease & Generate PIN"**.
- This action triggers `activateLeaseAndGeneratePin()` which provisions the Tuya lock, changes the lease status to Active, and securely stores the PIN.

### 9. Admin Emergency Access Control
- The unified Tenant Directory also features an **Emergency Unlock** button inside the "Occupied Asset" panel for active leases.
- This queries `getTenantsData()` in `tenant.service.ts` to map the specific `SmartLock` to the active lease's `propertyId`.
- The Tuya command uses `remote_no_dp_key` (with a value of `true`) to remotely trigger the lock via the `remoteUnlockAction`.

### 10. Temporary PIN Encryption
- Tuya's temporary password API requires a specific encryption flow which has been implemented.
- First, a `password-ticket` is fetched. The `ticket_key` is decrypted using AES-256-ECB with the `TUYA_ACCESS_SECRET`.
- The desired PIN is then encrypted using AES-128-ECB with the decrypted original key, and passed to the API with `password_type: 'ticket'`.
- Wi-Fi locks require a 7-digit PIN, so the PIN generation logic in `src/actions/admin/smartlock.action.ts` has been updated to generate 7-digit PINs.

### 11. Audit Logging and Temporary PIN Management
- The system maintains a robust security audit trail. A Mongoose model (`AccessLog`) tracks every critical smart lock event: `PIN_RESET`, `TEMP_PIN_CREATED`, `REMOTE_UNLOCK`, and `PIN_REVOKED`.
- When an admin generates a temporary/vendor PIN, they can provide a custom name and duration. The hardware issues the PIN, and the backend securely stores it in the `SmartLock.activeTempPins` array (saving only the last 4 digits, e.g., `***1234`, for security) along with its expiration date.
- Admins have the ability to explicitly revoke active temporary PINs before they expire using the `revokeTemporaryPinAction`, which hits Tuya's `DELETE /v1.0/devices/{device_id}/door-lock/temp-passwords/{password_id}` endpoint and prunes the database array.

### 12. Real-Time Hardware Monitoring Dashboard
- The platform uses a **Zero-Polling Architecture** via Pusher to monitor fleet health and activity in real-time.
- `src/lib/pusher-server.ts` handles API route triggers, and `src/lib/pusher-client.ts` connects the React UI using `pusher-js`.
- Tuya's Webhooks post to `src/app/api/webhooks/tuya/route.ts` whenever a lock goes online/offline or its battery drops.
- The webhook automatically updates the `SmartLock` document in MongoDB, parsing granular telemetry like `battery_state`, `doorcontact_state`, and `closed_opened_status`.
- It then fires a `pusherServer.trigger('smartlocks', 'status_update')` event.
- The `/admin/smartlocks` dashboard subscribes to this channel. Upon receiving an event, it instantly updates the UI (including Lock State and Door State) and re-sorts the "Real-Time Activity Log" table so the most recently updated lock jumps to the top.

---

## 🚀 Next Steps (For the Next Agent/Developer)

The Admin Phase (Fleet Management, Tenant PIN Provisioning, and Emergency Access) is **100% complete**. 
If you are picking up this project, you need to build the **User/Tenant Phase**:

### Step 1: User Dashboard UI Component
Create a reusable React component (e.g., `src/components/smartlock/tenant-controls.tsx`) meant for the tenant's digital portal. It should contain:
1. A large "Unlock Door" button that calls the existing `remoteUnlockAction` (or a tenant-specific version).
2. A form to call the existing `createTemporaryPin()` function so users can generate time-bound access for guests.

### Step 2: Subscription & Lease Verification Middleware
Before the server executes the Tuya "Unlock" command triggered by a user, you must query the database to ensure that the `User` has an **Active Lease** or **Subscription** for the `Property` linked to that specific `SmartLock`. If their lease is expired, suspended, or unpaid, the backend must firmly reject the unlock request.
