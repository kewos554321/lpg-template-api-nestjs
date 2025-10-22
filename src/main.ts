import { createApp } from './bootstrap';
import { LogDecorator } from './common/decorators/log.decorator';

@LogDecorator(Main.name)
export class Main {
  async bootstrap() {
    const app = await createApp();
    await app.listen(4012);
    this.logger.log(`Application is running on: http://localhost:4012`);
    this.logger.log(`Swagger documentation: http://localhost:4012/docs`);
  }
}
new Main().bootstrap();
