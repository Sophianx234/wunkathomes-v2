'use client';

import PusherClient from 'pusher-js';

declare global {
  interface Window {
    pusherClientInstance: PusherClient | undefined;
  }
}

export const getPusherClient = () => {
  if (typeof window !== 'undefined') {
    if (!window.pusherClientInstance) {
      window.pusherClientInstance = new PusherClient(
        process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'mock_key', 
        {
          cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
        }
      );
    }
    return window.pusherClientInstance;
  }
  return null;
};
