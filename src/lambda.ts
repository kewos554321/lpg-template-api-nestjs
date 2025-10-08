import type { Handler } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { createApp } from './bootstrap';

let server: Handler;

async function bootstrap() {
  const app = await createApp();
  await app.init(); // Don't call listen()
  const expressApp = app.getHttpAdapter().getInstance();
  // Enable binary responses so files are not re-encoded by API Gateway/Lambda
  return serverlessExpress({
    app: expressApp,
    binarySettings: {
      contentTypes: [
        'application/octet-stream',
        'image/*',
        'application/pdf',
        'application/zip',
        'application/x-zip-compressed',
        'video/*',
        'audio/*',
      ],
    },
  });
}

export const handler: Handler = async (event, context, callback) => {
  if (!server) server = await bootstrap();
  return server(event, context, callback);
};