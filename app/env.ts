export const LIVEKIT_URL = 'wss://gangio-1iknik3h.livekit.cloud'; 
export const NEXT_PUBLIC_TALKJS_APP_ID = process.env.NEXT_PUBLIC_TALKJS_APP_ID;
export const NEXT_PUBLIC_PUSHER_APP_KEY = process.env.NEXT_PUBLIC_PUSHER_APP_KEY;
export const NEXT_PUBLIC_PUSHER_CLUSTER = process.env.NEXT_PUBLIC_PUSHER_CLUSTER;

if (typeof NEXT_PUBLIC_TALKJS_APP_ID === 'undefined') {
  console.warn('Warning: NEXT_PUBLIC_TALKJS_APP_ID is not set in environment variables.');
}

if (typeof NEXT_PUBLIC_PUSHER_APP_KEY === 'undefined') {
  console.warn('Warning: NEXT_PUBLIC_PUSHER_APP_KEY is not set in environment variables.');
}

if (typeof NEXT_PUBLIC_PUSHER_CLUSTER === 'undefined') {
  console.warn('Warning: NEXT_PUBLIC_PUSHER_CLUSTER is not set in environment variables.');
}