'use server';

import { revalidatePath } from 'next/cache';
import { connectToDatabase } from '@/config/DbConnect';
import SmartLock from '@/models/smartlock';
import { getDevicesByUser } from '@/lib/tuya';

/**
 * Syncs all devices from the Tuya Cloud and saves new ones to the database.
 */
export async function syncLocksFromCloud() {
  try {
    await connectToDatabase();
    
    // Fetch all devices from Tuya Cloud
    const tuyaDevices = await getDevicesByUser();
    
    // --- DEV ONLY: Duplicate the first lock 14 times for UI testing ---
    if (tuyaDevices.length > 0 && process.env.NODE_ENV === 'development') {
      const realDevice = tuyaDevices[0];
      for (let i = 1; i <= 14; i++) {
        tuyaDevices.push({
          ...realDevice,
          id: `${realDevice.id}_mock_${i}`,
          name: `${realDevice.name} (Mock ${i})`,
        });
      }
    }
    // ------------------------------------------------------------------
    
    let newLocksAdded = 0;

    // Loop through each device and add to DB if it doesn't exist
    for (const device of tuyaDevices) {
      const existing = await SmartLock.findOne({ tuyaDeviceId: device.id });
      
      if (!existing) {
        await SmartLock.create({
          tuyaDeviceId: device.id,
          name: device.name,
          status: device.online ? 'unassigned' : 'offline',
          batteryLevel: 'high', // Note: fetch detailed status if battery is needed immediately
        });
        newLocksAdded++;
      } else if (existing.name !== device.name && existing.status === 'unassigned') {
         // Optional: Auto-update name if it was changed in Tuya app and hasn't been assigned yet
         await SmartLock.updateOne({ _id: existing._id }, { name: device.name });
      }
    }

    revalidatePath('/admin/smartlocks');
    return { success: true, message: `Synced successfully. ${newLocksAdded} new locks found.` };
  } catch (error: any) {
    console.error('Failed to sync Tuya locks:', error);
    return { success: false, error: error.message || 'Failed to sync locks' };
  }
}

/**
 * Renames a lock in the database.
 */
export async function renameSmartLock(lockId: string, newName: string) {
  try {
    await connectToDatabase();
    await SmartLock.findByIdAndUpdate(lockId, { name: newName });
    revalidatePath('/admin/smartlocks');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: 'Failed to rename lock' };
  }
}

/**
 * Assigns a smart lock to a specific property or listing.
 */
export async function assignLockToProperty(lockId: string, propertyId: string, listingId?: string) {
  try {
    await connectToDatabase();

    const lock = await SmartLock.findByIdAndUpdate(
      lockId,
      { 
        propertyId,
        listingId: listingId || null,
        status: 'online'
      },
      { new: true }
    );

    if (!lock) throw new Error('Lock not found');

    revalidatePath('/admin/properties');
    return { success: true, lock: JSON.parse(JSON.stringify(lock)) };
  } catch (error: any) {
    console.error('Failed to assign lock:', error);
    return { success: false, error: error.message || 'Failed to assign lock' };
  }
}

/**
 * Gets all unassigned locks for the admin dropdown.
 */
export async function getUnassignedLocks() {
  try {
    await connectToDatabase();
    const locks = await SmartLock.find({ status: 'unassigned' }).lean();
    return { success: true, locks: JSON.parse(JSON.stringify(locks)) };
  } catch (error: any) {
    return { success: false, error: 'Failed to fetch unassigned locks' };
  }
}

/**
 * Remotely unlocks a smart lock for emergency access.
 */
export async function remoteUnlockAction(tuyaDeviceId: string) {
  try {
    const { remoteUnlock } = await import('@/lib/tuya');
    await remoteUnlock(tuyaDeviceId);
    return { success: true, message: 'Door unlocked successfully.' };
  } catch (error: any) {
    console.error('Failed to remote unlock:', error);
    return { success: false, error: error.message || 'Failed to unlock door' };
  }
}

/**
 * Generates a short-lived temporary PIN for vendors/maintenance.
 */
export async function generateVendorPinAction(tuyaDeviceId: string, hoursValid: number = 2) {
  try {
    const { createTemporaryPin } = await import('@/lib/tuya');
    
    // Generate a random 6 digit PIN
    const generatedPin = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(n => (n % 10).toString())
      .join('');
      
    const effectiveTime = Date.now();
    const invalidTime = effectiveTime + (hoursValid * 60 * 60 * 1000);

    await createTemporaryPin({
      deviceId: tuyaDeviceId,
      pin: generatedPin,
      name: `Vendor_${Math.floor(Math.random() * 1000)}`,
      effectiveTime,
      invalidTime
    });

    return { success: true, pin: generatedPin, message: `Created vendor PIN valid for ${hoursValid} hours.` };
  } catch (error: any) {
    console.error('Failed to generate vendor PIN:', error);
    return { success: false, error: error.message || 'Failed to generate PIN' };
  }
}

/**
 * Resets a tenant's PIN (Deletes old conceptually by overwriting in DB and syncing new temp pin for 1 year)
 */
export async function resetTenantPinAction(tuyaDeviceId: string, leaseId: string) {
  try {
    const { createTemporaryPin } = await import('@/lib/tuya');
    await connectToDatabase();
    
    // Cryptographically secure 6-digit PIN
    const generatedPin = Array.from(crypto.getRandomValues(new Uint8Array(6)))
      .map(n => (n % 10).toString())
      .join('');
      
    const effectiveTime = Date.now();
    const invalidTime = effectiveTime + (365 * 24 * 60 * 60 * 1000); // Valid for 1 year

    // 1. Sync to Tuya Hardware
    await createTemporaryPin({
      deviceId: tuyaDeviceId,
      pin: generatedPin,
      name: `Tenant_${leaseId.slice(-4)}`,
      effectiveTime,
      invalidTime
    });

    // 2. Update DB
    const Lease = (await import('@/models/lease')).default;
    await Lease.findByIdAndUpdate(leaseId, { smartLockPin: generatedPin });

    // Note: You would typically send an email here to the tenant with the new PIN.
    
    revalidatePath('/admin/manage/tenants');
    return { success: true, pin: generatedPin, message: 'Tenant PIN reset successfully.' };
  } catch (error: any) {
    console.error('Failed to reset tenant PIN:', error);
    return { success: false, error: error.message || 'Failed to reset PIN' };
  }
}
