import type { Handler } from 'aws-lambda';
import serverlessExpress from '@vendia/serverless-express';
import { createApp } from './bootstrap';

let server: Handler;

async function bootstrap() {
  const app = await createApp();
  await app.init(); // Don't call listen()
  const expressApp = app.getHttpAdapter().getInstance();
  return serverlessExpress({ app: expressApp });
}

export const handler: Handler = async (event, context, callback) => {
  if (!server) server = await bootstrap();
  return server(event, context, callback);
};