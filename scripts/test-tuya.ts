import 'dotenv/config';
import { getDeviceDetails } from '../src/lib/tuya';

async function test() {
  console.log('Testing Tuya Integration...');
  try {
    const details = await getDeviceDetails();
    console.log('✅ Connection Successful!');
    console.log('Device Details:', JSON.stringify(details, null, 2));
  } catch (error) {
    console.error('❌ Connection Failed:', error);
  }
}

test();
