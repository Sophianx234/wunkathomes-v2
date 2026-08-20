import dotenv from 'dotenv';
dotenv.config();
import crypto from 'crypto';

const TUYA_ACCESS_ID = process.env.TUYA_ACCESS_ID || '';
const TUYA_ACCESS_SECRET = process.env.TUYA_ACCESS_SECRET || '';
const TUYA_ENDPOINT = process.env.TUYA_ENDPOINT || 'https://openapi.tuyaeu.com';

function calculateSignature(method, url, body = '', accessToken = '') {
  const t = Date.now().toString();
  const contentHash = crypto.createHash('sha256').update(body, 'utf8').digest('hex');
  const stringToSign = `${method}\n${contentHash}\n\n${url}`;
  const strToSign = TUYA_ACCESS_ID + accessToken + t + stringToSign;
  const sign = crypto.createHmac('sha256', TUYA_ACCESS_SECRET).update(strToSign, 'utf8').digest('hex').toUpperCase();
  return { sign, t };
}

async function tuyaFetch(method, path, bodyObj, token) {
  const bodyStr = bodyObj ? JSON.stringify(bodyObj) : '';
  const { sign, t } = calculateSignature(method, path, bodyStr, token);
  const headers = { 
    client_id: TUYA_ACCESS_ID, 
    sign, 
    t, 
    sign_method: 'HMAC-SHA256', 
    access_token: token,
    ...(bodyObj && { 'Content-Type': 'application/json' })
  };
  
  const res = await fetch(`${TUYA_ENDPOINT}${path}`, { method, headers, body: bodyStr || undefined });
  const data = await res.json();
  console.log(`[${method} ${path}] =>`, JSON.stringify(data));
}

async function testPins() {
  const path1 = '/v1.0/token?grant_type=1';
  const { sign: sign1, t: t1 } = calculateSignature('GET', path1, '', '');
  const res1 = await fetch(`${TUYA_ENDPOINT}${path1}`, {
    headers: { client_id: TUYA_ACCESS_ID, sign: sign1, t: t1, sign_method: 'HMAC-SHA256' }
  });
  const data1 = await res1.json();
  const token = data1.result.access_token;
  const deviceId = 'vdevo178708823868913';

  await tuyaFetch('POST', `/v1.0/devices/${deviceId}/door-lock/password-ticket`, {}, token);
  await tuyaFetch('POST', `/v1.0/smart-lock/devices/${deviceId}/password`, { password: "123", name: "t", effective_time: 1, invalid_time: 1, type: 1 }, token);
}

testPins().catch(console.error);
