import crypto from 'crypto';

export interface TuyaAccountConfig {
  id: 'account_1' | 'account_2';
  name: string;
  accessId: string;
  accessSecret: string;
  endpoint: string;
  adminUid: string;
}

/**
 * Configure both Tuya developer accounts.
 * If Account 2 credentials are not set, the system gracefully operates on Account 1 only.
 */
function getTuyaAccounts(): TuyaAccountConfig[] {
  const accounts: TuyaAccountConfig[] = [];

  // Account 1 (Primary: Locks 1-8)
  const accessId1 = process.env.TUYA_ACCESS_ID_1 || process.env.TUYA_ACCESS_ID;
  const accessSecret1 = process.env.TUYA_ACCESS_SECRET_1 || process.env.TUYA_ACCESS_SECRET;
  if (accessId1 && accessSecret1) {
    accounts.push({
      id: 'account_1',
      name: 'Primary (Cluster 1)',
      accessId: accessId1.trim(),
      accessSecret: accessSecret1.trim(),
      endpoint: (process.env.TUYA_ENDPOINT_1 || process.env.TUYA_ENDPOINT)?.trim() || 'https://openapi.tuyaeu.com',
      adminUid: (process.env.TUYA_ADMIN_UID_1 || process.env.TUYA_ADMIN_UID)?.trim() || '',
    });
  }

  // Account 2 (Secondary: Locks 9-15)
  if (process.env.TUYA_ACCESS_ID_2 && process.env.TUYA_ACCESS_SECRET_2) {
    accounts.push({
      id: 'account_2',
      name: 'Secondary (Cluster 2)',
      accessId: process.env.TUYA_ACCESS_ID_2.trim(),
      accessSecret: process.env.TUYA_ACCESS_SECRET_2.trim(),
      endpoint: process.env.TUYA_ENDPOINT_2?.trim() || process.env.TUYA_ENDPOINT_1?.trim() || process.env.TUYA_ENDPOINT?.trim() || 'https://openapi.tuyaeu.com',
      adminUid: process.env.TUYA_ADMIN_UID_2?.trim() || '',
    });
  }

  return accounts;
}

// In-memory cache for access tokens per account: accountId -> { token, expiration }
const tokenCache: Record<string, { token: string; expiration: number }> = {};

// In-memory routing map: deviceId -> accountId ('account_1' | 'account_2')
const deviceAccountMap = new Map<string, TuyaAccountConfig['id']>();

/**
 * Calculates the Tuya OpenAPI Signature for a specific account.
 * Standard formula: UPPERCASE(HMAC-SHA256(client_id + access_token + t + stringToSign, secret))
 */
function calculateSignature(
  account: TuyaAccountConfig,
  method: string,
  url: string,
  body: string = '',
  accessToken: string = ''
) {
  const t = Date.now().toString();
  const contentHash = crypto.createHash('sha256').update(body, 'utf8').digest('hex');
  const stringToSign = `${method}\n${contentHash}\n\n${url}`;
  const strToSign = account.accessId + accessToken + t + stringToSign;

  const sign = crypto
    .createHmac('sha256', account.accessSecret)
    .update(strToSign, 'utf8')
    .digest('hex')
    .toUpperCase();

  return { sign, t };
}

/**
 * Fetches and caches the Tuya Access Token for a specific account.
 */
export async function getAccessToken(account?: TuyaAccountConfig): Promise<string> {
  const targetAccount = account || getTuyaAccounts()[0];
  if (!targetAccount) {
    throw new Error('No Tuya accounts configured. Please check TUYA_ACCESS_ID and TUYA_ACCESS_SECRET.');
  }

  const cached = tokenCache[targetAccount.id];
  if (cached && Date.now() < cached.expiration) {
    return cached.token;
  }

  const path = '/v1.0/token?grant_type=1';
  const data = await tuyaRequest(targetAccount, 'GET', path, undefined, false);

  const token = data.result.access_token;
  tokenCache[targetAccount.id] = {
    token,
    expiration: Date.now() + (data.result.expire_time * 1000) - 60000,
  };

  return token;
}

/**
 * Helper function to execute requests against the Tuya OpenAPI for a specific account.
 */
async function tuyaRequest(
  account: TuyaAccountConfig,
  method: string,
  path: string,
  body?: any,
  useToken: boolean = true
) {
  let token = '';
  if (useToken) {
    const cached = tokenCache[account.id];
    if (cached && Date.now() < cached.expiration) {
      token = cached.token;
    } else {
      token = await getAccessToken(account);
    }
  }

  const bodyStr = body ? JSON.stringify(body) : '';
  const { sign, t } = calculateSignature(account, method, path, bodyStr, token);

  const headers: Record<string, string> = {
    client_id: account.accessId,
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

  const response = await fetch(`${account.endpoint}${path}`, {
    method,
    headers,
    body: bodyStr || undefined,
  });

  const data = await response.json();
  if (!data.success) {
    throw new Error(`Tuya API Error [${account.id}]: ${data.msg || data.code}`);
  }

  return data;
}

/**
 * Automatically discovers which Tuya account owns a given device ID.
 * Probes cached mapping first, then probes configured accounts dynamically.
 */
export async function findAccountForDevice(deviceId: string): Promise<TuyaAccountConfig> {
  const accounts = getTuyaAccounts();
  if (accounts.length === 0) {
    throw new Error('No Tuya accounts configured in environment variables.');
  }

  // 1. Check in-memory mapping
  const mappedAccountId = deviceAccountMap.get(deviceId);
  if (mappedAccountId) {
    const match = accounts.find((acc) => acc.id === mappedAccountId);
    if (match) return match;
  }

  // If only 1 account configured, default to it
  if (accounts.length === 1) {
    return accounts[0];
  }

  // 2. Probe accounts dynamically
  for (const account of accounts) {
    try {
      const path = `/v1.0/devices/${deviceId}`;
      const data = await tuyaRequest(account, 'GET', path);
      if (data?.success) {
        deviceAccountMap.set(deviceId, account.id);
        return account;
      }
    } catch {
      // Device does not belong to this account; try next
    }
  }

  // Fallback to first account
  return accounts[0];
}

/**
 * Get Device Details (Status, Online Status, Battery Levels)
 * Automatically routes to the correct Tuya account.
 */
export async function getDeviceDetails(deviceId?: string) {
  const targetId = deviceId || process.env.TUYA_LOCK_DEVICE_ID || '';
  if (!targetId) throw new Error('Device ID is missing');

  const account = await findAccountForDevice(targetId);
  const path = `/v1.0/devices/${targetId}`;
  const data = await tuyaRequest(account, 'GET', path);

  return data.result;
}

export interface TempPinParams {
  deviceId: string;
  pin: string;
  name: string;
  effectiveTime: number; // Start timestamp in ms
  invalidTime: number;   // End timestamp in ms
}

/**
 * Generates a time-bound, temporary passcode for tenant access.
 * Automatically resolves the owning Tuya account, fetches ticket, decrypts with matching secret, and creates PIN.
 */
export async function createTemporaryPin({ deviceId, pin, name, effectiveTime, invalidTime }: TempPinParams) {
  if (!deviceId) throw new Error('Device ID is required to create a PIN');

  const account = await findAccountForDevice(deviceId);

  // 1. Get Ticket from the owning account
  const ticketPath = `/v1.0/devices/${deviceId}/door-lock/password-ticket`;
  const ticketRes = await tuyaRequest(account, 'POST', ticketPath);
  const { ticket_id, ticket_key } = ticketRes.result;

  // 2. Decrypt Ticket Key using AES-256-ECB with the matching Account Access Secret
  const decipher = crypto.createDecipheriv('aes-256-ecb', account.accessSecret, null);
  let originalKey = decipher.update(ticket_key, 'hex', 'utf8');
  originalKey += decipher.final('utf8');

  // 3. Encrypt PIN using AES-128-ECB with the decrypted original Key
  const cipher = crypto.createCipheriv('aes-128-ecb', originalKey, null);
  let encryptedPin = cipher.update(pin, 'utf8', 'hex');
  encryptedPin += cipher.final('hex');

  const path = `/v1.0/devices/${deviceId}/door-lock/temp-password`;

  const body = {
    password: encryptedPin.toUpperCase(),
    password_type: 'ticket',
    ticket_id: ticket_id,
    name: name,
    effective_time: Math.floor(effectiveTime / 1000),
    invalid_time: Math.floor(invalidTime / 1000),
    type: 1,
  };

  const data = await tuyaRequest(account, 'POST', path, body);
  return data.result;
}

/**
 * Revokes a temporary passcode from the owning Tuya account.
 */
export async function deleteTemporaryPin(deviceId: string, passwordId: string) {
  if (!deviceId || !passwordId) throw new Error('Device ID and Password ID are required');

  const account = await findAccountForDevice(deviceId);
  const path = `/v1.0/devices/${deviceId}/door-lock/temp-passwords/${passwordId}`;
  const data = await tuyaRequest(account, 'DELETE', path);

  return data.result;
}

/**
 * Sends a remote unlock command to the specific smart lock.
 * Automatically resolves the owning Tuya account.
 */
export async function remoteUnlock(deviceId: string) {
  if (!deviceId) throw new Error('Device ID is required to remote unlock');

  const account = await findAccountForDevice(deviceId);

  try {
    // 1. Obtain temporary password ticket for the lock
    const ticketPath = `/v1.0/devices/${deviceId}/door-lock/password-ticket`;
    const ticketRes = await tuyaRequest(account, 'POST', ticketPath);
    const ticketId = ticketRes?.result?.ticket_id;

    if (ticketId) {
      // 2. Send official password-free remote open door command
      const openPath = `/v1.1/devices/${deviceId}/door-lock/password-free/open-door`;
      const openRes = await tuyaRequest(account, 'POST', openPath, { ticket_id: ticketId });
      return openRes.result;
    }
  } catch (ticketError) {
    console.warn(`Ticket-based unlock failed on ${account.id}, falling back to legacy command:`, ticketError);
  }

  // Fallback for simple devices/switches
  const path = `/v1.0/devices/${deviceId}/commands`;
  const body = {
    commands: [
      {
        code: 'remote_no_dp_key',
        value: true,
      },
    ],
  };

  const data = await tuyaRequest(account, 'POST', path, body);
  return data.result;
}

/**
 * Fetches all devices associated with ALL configured Tuya Admin App Accounts.
 * Queries Account 1 and Account 2, merges them, and registers device routing.
 */
export async function getDevicesByUser() {
  const accounts = getTuyaAccounts();
  if (accounts.length === 0) {
    throw new Error('No Tuya accounts configured. Please add TUYA_ADMIN_UID and API keys.');
  }

  const allDevices: any[] = [];

  for (const account of accounts) {
    if (!account.adminUid) continue;

    try {
      const path = `/v1.0/users/${account.adminUid}/devices`;
      const data = await tuyaRequest(account, 'GET', path);
      const devices = data.result || [];

      for (const dev of devices) {
        if (dev?.id) {
          deviceAccountMap.set(dev.id, account.id);
        }
        allDevices.push({
          ...dev,
          _tuyaAccountId: account.id,
        });
      }
    } catch (error: any) {
      console.warn(`[TUYA] Failed to fetch devices for account ${account.id}:`, error.message);
    }
  }

  return allDevices;
}
