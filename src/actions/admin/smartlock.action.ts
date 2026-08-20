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
