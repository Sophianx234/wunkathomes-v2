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

async function testUnlock() {
  const path1 = '/v1.0/token?grant_type=1';
  const { sign: sign1, t: t1 } = calculateSignature('GET', path1, '', '');
  const res1 = await fetch(`${TUYA_ENDPOINT}${path1}`, {
    headers: { client_id: TUYA_ACCESS_ID, sign: sign1, t: t1, sign_method: 'HMAC-SHA256' }
  });
  const data1 = await res1.json();
  const token = data1.result.access_token;

  const deviceId = 'vdevo178708823868913';
  const path2 = `/v1.0/devices/${deviceId}/commands`;
  const bodyObj = { commands: [{ code: 'remote_no_dp_key', value: true }] };
  const bodyStr = JSON.stringify(bodyObj);
  
  const { sign: sign2, t: t2 } = calculateSignature('POST', path2, bodyStr, token);
  const res2 = await fetch(`${TUYA_ENDPOINT}${path2}`, {
    method: 'POST',
    headers: { 
      client_id: TUYA_ACCESS_ID, 
      sign: sign2, 
      t: t2, 
      sign_method: 'HMAC-SHA256', 
      access_token: token,
      'Content-Type': 'application/json'
    },
    body: bodyStr
  });
  
  const result = await res2.json();
  console.log(JSON.stringify(result, null, 2));
}

testUnlock().catch(console.error);
