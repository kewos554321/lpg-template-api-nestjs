import { registerAs } from '@nestjs/config';

export default registerAs('lineAuth', () => ({
  channelId: process.env.LINE_CHANNEL_ID || 'your_channel_id',
  channelSecret: process.env.LINE_CHANNEL_SECRET || 'your_channel_secret',
  redirectUri: process.env.LINE_REDIRECT_URI || 'http://localhost:4012/app-api/line-auth/callback',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:4012',
  liffId: process.env.LIFF_ID || 'your_liff_id',
}));