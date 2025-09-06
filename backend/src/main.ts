import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { initSentry, sentryErrorHandler } from './sentry';

// Sentry 초기화 (앱 시작 전)
initSentry();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend integration
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('freee Card Payment API')
    .setDescription('freee Card Payment System API documentation')
    .setVersion('1.0')
    .addTag('cards', 'Card management operations')
    .addTag('transactions', 'Transaction operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Sentry 에러 핸들러 추가 (다른 모든 미들웨어 뒤에)
  app.use(sentryErrorHandler);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 freee Card Payment API is running on: http://localhost:${port}`);
  console.log(`📖 Swagger documentation: http://localhost:${port}/api`);
}

bootstrap();