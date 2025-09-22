import { createApp } from './bootstrap';

async function bootstrap() {
  const app = await createApp();
  await app.listen(3000);
}
bootstrap();
