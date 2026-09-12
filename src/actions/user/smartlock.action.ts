"use server";

import { connectToDatabase } from "@/config/DbConnect";
import SmartLock from "@/models/smartlock";
import Lease from "@/models/lease";
import Listing from "@/models/listing";
import AccessLog from "@/models/accesslog";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

/**
 * Validates that the current user has an Active lease for the given leaseId,
 * and returns the associated SmartLock if it exists.
 */
async function validateTenantAccess(leaseId: string) {
  const session = await getSession();
  if (!session?.userId) {
    throw new Error("UNAUTHORIZED");
  }

  await connectToDatabase();

  const lease = await Lease.findOne({
    _id: leaseId,
    userId: session.userId,
    status: "Active",
  });

  if (!lease) {
    throw new Error("You do not have an active lease for this property.");
  }

  // BUSINESS LOGIC & SECURITY ENFORCEMENT
  // Even if the lease is marked "Active" (e.g. by admin or after payment), 
  // the tenant MUST NOT be able to unlock the door or generate PINs before their lease explicitly starts.
  if (lease.startDate) {
    const today = new Date();
    const leaseStartDate = new Date(lease.startDate);
    
    // Zero out the time to allow access on the exact day of move-in
    today.setHours(0, 0, 0, 0);
    leaseStartDate.setHours(0, 0, 0, 0);
    
    if (today < leaseStartDate) {
      throw new Error("Your lease has not started yet. Digital key access is disabled until move-in day.");
    }
  }

  const listing = await Listing.findById(lease.listingId);
  if (!listing) {
    throw new Error("Property listing not found.");
  }

  const lock = await SmartLock.findOne({
    $or: [{ propertyId: listing.propertyId }, { listingId: listing._id }],
  });

  if (!lock || !lock.tuyaDeviceId) {
    throw new Error("No active smart lock found for this property.");
  }

  return { session, lock, lease };
}

/**
 * Tenant triggers a remote unlock.
 */
export async function tenantRemoteUnlockAction(leaseId: string) {
  try {
    const { session, lock } = await validateTenantAccess(leaseId);
    
    const { remoteUnlock } = await import('@/lib/tuya');
    await remoteUnlock(lock.tuyaDeviceId);
    
    await AccessLog.create({
      lockId: lock._id,
      propertyId: lock.propertyId,
      action: 'REMOTE_UNLOCK',
      actorId: session.userId,
      actorType: 'Tenant',
      performedBy: 'Tenant'
    });

    revalidatePath('/user/dashboard');
    return { success: true, message: 'Door unlocked successfully.' };
  } catch (error: any) {
    console.error('Tenant remote unlock failed:', error);
    return { success: false, error: error.message || 'Failed to unlock door.' };
  }
}

/**
 * Tenant creates a temporary PIN for guests.
 */
export async function tenantCreateGuestPinAction(leaseId: string, customName: string, hoursValid: number) {
  try {
    if (hoursValid > 48) {
      return { success: false, error: 'Guest passes cannot exceed 48 hours for security reasons.' };
    }

    const { session, lock } = await validateTenantAccess(leaseId);
    
    // Clean up expired PINs from the array before checking limit
    lock.activeTempPins = (lock.activeTempPins || []).filter(
      (pin: any) => !pin.expiresAt || new Date(pin.expiresAt) > new Date()
    );

    if (lock.activeTempPins.length >= 5) {
      return { success: false, error: 'Maximum of 5 active guest passes allowed. Please revoke an old one first.' };
    }

    const { createTemporaryPin } = await import('@/lib/tuya');
    
    // Generate a random 7 digit PIN
    const generatedPin = Array.from(crypto.getRandomValues(new Uint8Array(7)))
      .map(n => (n % 10).toString())
      .join('');
      
    const effectiveTime = Date.now();
    const invalidTime = effectiveTime + (hoursValid * 60 * 60 * 1000);

    // Enforce lease end date boundary
    if (lease.endDate) {
      const leaseEndTime = new Date(lease.endDate).getTime();
      
      // If the lease is already expired (shouldn't happen with status: "Active" usually, but just in case)
      if (effectiveTime >= leaseEndTime) {
         return { success: false, error: 'Your lease has expired. Cannot generate guest passes.' };
      }
      
      // If the requested PIN extends beyond the lease
      if (invalidTime > leaseEndTime) {
        const hoursLeft = Math.floor((leaseEndTime - effectiveTime) / (60 * 60 * 1000));
        return { 
          success: false, 
          error: `Guest pass cannot exceed your lease end date. Maximum duration allowed: ${Math.max(1, hoursLeft)} hour(s).` 
        };
      }
    }

    const result = await createTemporaryPin({
      deviceId: lock.tuyaDeviceId,
      pin: generatedPin,
      name: customName,
      effectiveTime,
      invalidTime
    });

    lock.activeTempPins.push({
      pinId: result?.id?.toString() || Math.random().toString(),
      name: customName,
      pinMasked: `***${generatedPin.slice(-4)}`,
      validFrom: new Date(effectiveTime),
      expiresAt: new Date(invalidTime)
    });
    await lock.save();

    await AccessLog.create({
      lockId: lock._id,
      propertyId: lock.propertyId,
      action: 'TEMP_PIN_CREATED',
      actorId: session.userId,
      actorType: 'Tenant',
      performedBy: 'Tenant', 
      metadata: { targetName: customName, expiresAt: new Date(invalidTime) }
    });

    revalidatePath('/user/dashboard');
    return { success: true, pin: generatedPin, message: `Created guest PIN valid for ${hoursValid} hours.` };
  } catch (error: any) {
    console.error('Tenant create guest PIN failed:', error);
    return { success: false, error: error.message || 'Failed to generate PIN.' };
  }
}

/**
 * Tenant revokes an active guest PIN.
 */
export async function tenantRevokeGuestPinAction(leaseId: string, pinId: string) {
  try {
    const { session, lock } = await validateTenantAccess(leaseId);
    const { deleteTemporaryPin } = await import('@/lib/tuya');

    const pinIndex = lock.activeTempPins.findIndex((p: any) => p.pinId === pinId);
    if (pinIndex === -1) {
      return { success: false, error: 'Guest pass not found.' };
    }

    const pinTarget = lock.activeTempPins[pinIndex].name;

    await deleteTemporaryPin(lock.tuyaDeviceId, pinId);

    lock.activeTempPins.splice(pinIndex, 1);
    await lock.save();

    await AccessLog.create({
      lockId: lock._id,
      propertyId: lock.propertyId,
      action: 'PIN_REVOKED',
      actorId: session.userId,
      actorType: 'Tenant',
      performedBy: 'Tenant',
      metadata: { targetName: pinTarget, pinId }
    });

    revalidatePath('/user/dashboard');
    return { success: true, message: `Guest pass for ${pinTarget} revoked.` };
  } catch (error: any) {
    console.error('Tenant revoke PIN failed:', error);
    return { success: false, error: error.message || 'Failed to revoke PIN.' };
  }
}
