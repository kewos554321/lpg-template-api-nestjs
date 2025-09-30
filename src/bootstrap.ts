import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api', { exclude: ['/', 'health'] });

  // Swagger (OpenAPI) configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('LPG Template API')
    .setDescription('API documentation. Use the top-right Authorize button to set a Bearer token (optional). For quick test, try Order2 → POST /order2/list with the pre-filled query parameters below: page=1, size=10, firstDate=2025-09-01, lastDate=2025-09-15, sortColumnName=delivery_time_stamp, orderType=DESC')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });
  return app;
}