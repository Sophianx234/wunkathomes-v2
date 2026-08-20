import crypto from 'crypto';

const TUYA_ACCESS_ID = process.env.TUYA_ACCESS_ID || '';
const TUYA_ACCESS_SECRET = process.env.TUYA_ACCESS_SECRET || '';
const TUYA_ENDPOINT = process.env.TUYA_ENDPOINT || 'https://openapi.tuyaeu.com';
const TUYA_LOCK_DEVICE_ID = process.env.TUYA_LOCK_DEVICE_ID || '';
const TUYA_ADMIN_UID = process.env.TUYA_ADMIN_UID || '';

// Cache the access token in memory
let cachedToken = '';
let tokenExpiration = 0; // Timestamp in ms

/**
 * Calculates the Tuya OpenAPI Signature.
 * Standard formula: UPPERCASE(HMAC-SHA256(client_id + access_token + t + stringToSign, secret))
 */
function calculateSignature(
  method: string,
  url: string,
  body: string = '',
  accessToken: string = ''
) {
  const t = Date.now().toString();
  
  // Calculate SHA256 of the body (if empty string, gives standard empty SHA256 hash)
  const contentHash = crypto.createHash('sha256').update(body, 'utf8').digest('hex');
  
  // Tuya's stringToSign: Method + \n + Content-SHA256 + \n + Headers (empty here) + \n + Url
  const stringToSign = `${method}\n${contentHash}\n\n${url}`;
  
  const strToSign = TUYA_ACCESS_ID + accessToken + t + stringToSign;
  const sign = crypto
    .createHmac('sha256', TUYA_ACCESS_SECRET)
    .update(strToSign, 'utf8')
    .digest('hex')
    .toUpperCase();
    
  return { sign, t };
}

/**
 * Helper function to execute requests against the Tuya OpenAPI.
 */
async function tuyaRequest(method: string, path: string, body?: any, useToken: boolean = true) {
  if (useToken && (!cachedToken || Date.now() > tokenExpiration)) {
    await getAccessToken();
  }

  const token = useToken ? cachedToken : '';
  const bodyStr = body ? JSON.stringify(body) : '';
  
  const { sign, t } = calculateSignature(method, path, bodyStr, token);

  const headers: Record<string, string> = {
    client_id: TUYA_ACCESS_ID,
    sign: sign,
    t: t,
    sign_method: 'HMAC-SHA256',
  };

  if (useToken) {
    headers.access_token = token;
  }
  
  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${TUYA_ENDPOINT}${path}`, {
    method,
    headers,
    body: bodyStr || undefined,
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(`Tuya API Error: ${data.msg || data.code}`);
  }

  return data;
}

/**
 * Fetches and caches the Tuya Access Token.
 */
export async function getAccessToken() {
  const path = '/v1.0/token?grant_type=1';
  // Do not use token for the token request itself
  const data = await tuyaRequest('GET', path, undefined, false);
  
  cachedToken = data.result.access_token;
  // Tuya expire_time is usually in seconds. We subtract 60s to be safe.
  tokenExpiration = Date.now() + (data.result.expire_time * 1000) - 60000;
  
  return cachedToken;
}

/**
 * Get Device Details (Status, Online Status, Battery Levels)
 */
export async function getDeviceDetails(deviceId?: string) {
  const targetId = deviceId || TUYA_LOCK_DEVICE_ID;
  if (!targetId) throw new Error('Device ID is missing');
  const path = `/v1.0/devices/${targetId}`;
  const data = await tuyaRequest('GET', path);
  
  // The device details normally return `online` status and an array of `status` items.
  return data.result;
}

export interface TempPinParams {
  pin: string;
  name: string;
  effectiveTime: number; // Start timestamp in ms
  invalidTime: number;   // End timestamp in ms
}

/**
 * Generates a time-bound, temporary passcode for tenant access.
 * Target Endpoint typically involves /v1.0/devices/{device_id}/door-lock/temp-passwords or similar.
 */
export async function createTemporaryPin({ pin, name, effectiveTime, invalidTime }: TempPinParams) {
  if (!TUYA_LOCK_DEVICE_ID) throw new Error('TUYA_LOCK_DEVICE_ID is missing from environment variables');
  
  const path = `/v1.0/devices/${TUYA_LOCK_DEVICE_ID}/door-lock/temp-passwords`;
  
  const body = {
    password: pin,
    name: name,
    // Convert ms to seconds if required by Tuya
    effective_time: Math.floor(effectiveTime / 1000), 
    invalid_time: Math.floor(invalidTime / 1000),
    type: 1 // 1 typically denotes a time-bound PIN in Tuya docs
  };

  const data = await tuyaRequest('POST', path, body);
  return data.result;
}

/**
 * Get all devices associated with the Tuya Admin App Account.
 */
export async function getDevicesByUser() {
  if (!TUYA_ADMIN_UID) {
    throw new Error('TUYA_ADMIN_UID is missing from environment variables. Please add the UID of your Tuya Smart app account.');
  }
  
  const path = `/v1.0/users/${TUYA_ADMIN_UID}/devices`;
  const data = await tuyaRequest('GET', path);
  
  // Tuya returns an array of device objects in data.result
  return data.result || [];
}
