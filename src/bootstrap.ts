import { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export async function createApp(): Promise<INestApplication> {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('app-api', { exclude: ['/', 'health', 'docs'] });
  app.enableCors({
    origin: true,
    credentials: true,
    methods: ['GET','HEAD','PUT','PATCH','POST','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','Accept','Origin','X-Requested-With'],
    exposedHeaders: ['Content-Length','Date'],
  });

  // Swagger (OpenAPI) configuration
  const swaggerConfig = new DocumentBuilder()
    .setTitle('LPG Template API')
    .setDescription('API documentation. Use the top-right Authorize button to set a Bearer token (optional). For quick test, try Order2 → POST /order2/list with the pre-filled query parameters below: page=1, size=10, firstDate=2025-09-01, lastDate=2025-09-15, sortColumnName=delivery_time_stamp, orderType=DESC')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'LPG Template API Docs',
    customCssUrl: 'https://unpkg.com/swagger-ui-dist@5/swagger-ui.css',
    customfavIcon: 'https://unpkg.com/swagger-ui-dist@5/favicon-32x32.png',
    customJs: [
      'https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js',
      'https://unpkg.com/swagger-ui-dist@5/swagger-ui-standalone-preset.js',
    ],
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      displayRequestDuration: true,
      tryItOutEnabled: true,
      explorer: true,
    },
  });
  return app;
}