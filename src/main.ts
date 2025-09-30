import { createApp } from './bootstrap';

async function bootstrap() {
  const app = await createApp();
  await app.listen(4012);
}
bootstrap();
