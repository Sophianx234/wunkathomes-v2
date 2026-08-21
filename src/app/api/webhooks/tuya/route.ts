import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher-server';
import SmartLock from '@/models/smartlock';
import AccessLog from '@/models/accesslog';
import { connectToDatabase } from '@/config/DbConnect';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    const tuyaDeviceId = payload.devId || payload.deviceId;
    if (!tuyaDeviceId) {
      return NextResponse.json({ error: 'Missing device ID' }, { status: 400 });
    }

    await connectToDatabase();

    // Fetch the lock to get its internal ID for AccessLog
    const lock = await SmartLock.findOne({ tuyaDeviceId });
    if (!lock) {
      return NextResponse.json({ error: 'Lock not found' }, { status: 404 });
    }

    // Parse Tuya status updates
    let updates: any = {};
    const newAlarms: string[] = [];
    const clearedAlarms: string[] = [];
    const accessLogsToCreate: any[] = [];
    
    // Arrays of Tuya DP codes that represent alarms
    const alarmCodes = ['alarm_lock', 'hijack', 'door_unclosed_alarm', 'tamper_alarm', 'wrong_finger_alarm', 'wrong_password_alarm'];

    if (Array.isArray(payload.status)) {
      for (const stat of payload.status) {
        // Battery Percentage
        if (stat.code === 'residual_electricity' || stat.code === 'battery_percentage') {
          const val = Number(stat.value);
          if (!isNaN(val)) {
            updates.batteryPercentage = val;
            updates.batteryLevel = val <= 20 ? 'low' : 'high';
          }
        } 
        // Door State
        else if (stat.code === 'doorcontact_state') {
          updates.doorState = (stat.value === 'open' || stat.value === true) ? 'open' : 'closed';
        } 
        // Lock State
        else if (stat.code === 'closed_opened_status' || stat.code === 'open_close_status' || stat.code === 'lock_state') {
          updates.lockState = (stat.value === 'unlocked' || stat.value === 'open' || stat.value === true) ? 'unlocked' : 'locked';
        } 
        // Signal Strength
        else if (stat.code === 'signal' || stat.code === 'rssi') {
          updates.signalStrength = stat.value;
        }
        // Unlock Records (Physical Access)
        else if (stat.code === 'unlock_record' || stat.code === 'unlock_method' || stat.code === 'unlock_fingerprint' || stat.code === 'unlock_password') {
          accessLogsToCreate.push({
            lockId: lock._id,
            propertyId: lock.propertyId,
            action: 'PHYSICAL_UNLOCK',
            actorType: 'Hardware',
            performedBy: `Tuya User/Method: ${stat.value}`,
            metadata: { targetName: stat.code }
          });
        }
        // Alarms
        else if (alarmCodes.includes(stat.code)) {
          // If value is true or non-zero, it's an active alarm. If false/0, it's cleared.
          if (stat.value === true || stat.value === 'true' || stat.value === '1' || stat.value === 1) {
            newAlarms.push(stat.code);
            accessLogsToCreate.push({
              lockId: lock._id,
              propertyId: lock.propertyId,
              action: 'ALARM_TRIGGERED',
              actorType: 'Hardware',
              performedBy: 'Hardware Sensor',
              metadata: { targetName: stat.code }
            });
          } else {
            clearedAlarms.push(stat.code);
            accessLogsToCreate.push({
              lockId: lock._id,
              propertyId: lock.propertyId,
              action: 'ALARM_CLEARED',
              actorType: 'Hardware',
              performedBy: 'Hardware Sensor',
              metadata: { targetName: stat.code }
            });
          }
        }
      }
    }

    if (payload.bizCode === 'online') updates.status = 'online';
    if (payload.bizCode === 'offline') updates.status = 'offline';

    // Manage activeAlarms array natively in Mongo
    let finalAlarms = [...(lock.activeAlarms || [])];
    if (newAlarms.length > 0) {
      newAlarms.forEach(a => { if (!finalAlarms.includes(a)) finalAlarms.push(a); });
      updates.activeAlarms = finalAlarms;
    }
    if (clearedAlarms.length > 0) {
      finalAlarms = finalAlarms.filter(a => !clearedAlarms.includes(a));
      updates.activeAlarms = finalAlarms;
    }

    // 1. Update Database
    if (Object.keys(updates).length > 0) {
      await SmartLock.updateOne({ _id: lock._id }, { $set: updates });

      // Trigger standard status update to Pusher
      await pusherServer.trigger('smartlocks', 'status_update', {
        tuyaDeviceId,
        updates,
        timestamp: new Date().toISOString()
      });
    }

    // 2. Insert Access Logs
    if (accessLogsToCreate.length > 0) {
      await AccessLog.insertMany(accessLogsToCreate);
      
      // Trigger Activity Feed to Pusher
      for (const log of accessLogsToCreate) {
        await pusherServer.trigger('smartlocks', 'activity_log', {
          tuyaDeviceId,
          lockName: lock.name,
          action: log.action,
          performedBy: log.performedBy,
          metadata: log.metadata,
          timestamp: new Date().toISOString()
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Tuya Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
