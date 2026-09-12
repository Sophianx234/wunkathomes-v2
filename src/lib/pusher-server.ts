import Pusher from 'pusher';

declare global {
  var pusherServer: Pusher | undefined;
}

export const pusherServer = global.pusherServer || new Pusher({
  appId: process.env.PUSHER_APP_ID || 'mock_app_id',
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY || 'mock_key',
  secret: process.env.PUSHER_APP_SECRET || 'mock_secret',
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'mt1',
  useTLS: true,
});

if (process.env.NODE_ENV !== 'production') {
  global.pusherServer = pusherServer;
}
