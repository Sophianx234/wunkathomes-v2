import * as dotenv from 'dotenv';
dotenv.config();

import { getDevicesByUser } from './src/lib/tuya';

async function run() {
  try {
    const devices = await getDevicesByUser();
    if (devices.length > 0) {
      console.log(JSON.stringify(devices[0].status, null, 2));
    } else {
      console.log("No devices found.");
    }
  } catch (error) {
    console.error(error);
  }
}

run();
