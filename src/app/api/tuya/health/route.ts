import { NextResponse } from 'next/server';
import { getDeviceDetails } from '@/lib/tuya';

export async function GET() {
  try {
    const deviceDetails = await getDeviceDetails();

    return NextResponse.json({
      connected: true,
      deviceName: deviceDetails.name || 'Unknown Device',
      online: deviceDetails.online === true,
      status: deviceDetails.status || [], // Contains battery levels and other states
    }, { status: 200 });

  } catch (error: any) {
    console.error('Tuya Health Check Error:', error);
    
    return NextResponse.json({
      connected: false,
      error: 'Tuya API Authentication or Connection Failed',
      details: error.message || String(error),
    }, { status: 500 });
  }
}
