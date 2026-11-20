import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { getDevicesByUser, getAccessToken } from '../src/lib/tuya';

async function test() {
  console.log('🧪 Testing Dual Tuya Account Integration...\n');

  try {
    // 1. Fetch devices across all configured accounts
    const allDevices = await getDevicesByUser();
    
    console.log(`\n🎉 Connection Successful! Discovered ${allDevices.length} total device(s) across your Tuya accounts:`);

    if (allDevices.length === 0) {
      console.log('ℹ️  No locks found in linked mobile apps yet. (Make sure you pair locks in the app!)');
    } else {
      allDevices.forEach((dev: any, idx: number) => {
        console.log(`  [${idx + 1}] "${dev.name || 'Unnamed Lock'}"`);
        console.log(`      ID: ${dev.id}`);
        console.log(`      Account: ${dev._tuyaAccountId || 'account_1'}`);
        console.log(`      Online: ${dev.online ? '🟢 Online' : '⚪ Offline'}`);
      });
    }

    console.log('\n✅ Both Tuya accounts are fully authenticated and communicating with your Next.js project.');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Tuya Integration Test Failed:', error.message);
    process.exit(1);
  }
}

test();
