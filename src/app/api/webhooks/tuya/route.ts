import { NextResponse } from 'next/server';
import { pusherServer } from '@/lib/pusher-server';
import SmartLock from '@/models/smartlock';
import { connectToDatabase } from '@/config/DbConnect';

export async function POST(req: Request) {
  try {
    const payload = await req.json();

    // Tuya Pulsar Message Payload typically looks like this depending on how you configure HTTP push:
    // { devId: "vdevo123...", status: [{ code: "battery_state", value: "low" }] }
    
    // For now, we handle a generic structure that you can adapt
    const tuyaDeviceId = payload.devId || payload.deviceId;
    if (!tuyaDeviceId) {
      return NextResponse.json({ error: 'Missing device ID' }, { status: 400 });
    }

    await connectToDatabase();

    // Parse Tuya status updates
    let updates: any = {};
    if (Array.isArray(payload.status)) {
      for (const stat of payload.status) {
        if (stat.code === 'battery_state' || stat.code === 'residual_electricity') {
          updates.batteryLevel = stat.value;
        } else if (stat.code === 'doorcontact_state') {
          // true/false or open/closed depending on DP
          updates.doorState = (stat.value === 'open' || stat.value === true) ? 'open' : 'closed';
        } else if (stat.code === 'closed_opened_status' || stat.code === 'open_close_status') {
          updates.lockState = (stat.value === 'unlocked' || stat.value === 'open') ? 'unlocked' : 'locked';
        } else if (stat.code === 'hijack') {
          // could trigger alert
        }
      }
    }

    // You could also receive online/offline events directly
    if (payload.bizCode === 'online') updates.status = 'online';
    if (payload.bizCode === 'offline') updates.status = 'offline';

    if (Object.keys(updates).length > 0) {
      // 1. Update Database
      await SmartLock.findOneAndUpdate(
        { tuyaDeviceId },
        { $set: updates },
        { new: true }
      );

      // 2. Trigger Pusher Event to update the Live Dashboard
      await pusherServer.trigger('smartlocks', 'status_update', {
        tuyaDeviceId,
        updates,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Tuya Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
