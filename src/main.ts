import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, BadRequestException, Logger } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { loggerOptions } from './infrastructure/logging/logger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(loggerOptions),
  });

  app.use(helmet());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      exceptionFactory: (errors) => {
        const messages = errors.map(
          (error) =>
            `${error.property}: ${Object.values(error.constraints).join(', ')}`,
        );
        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: messages,
        });
      },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Transactions API')
    .setDescription('API for managing financial transactions and statistics.')
    .setVersion('1.0')
    .addTag('Transactions')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `Application is running on: http://localhost:${port}`,
    'Bootstrap',
  );
  Logger.log(
    `Swagger documentation available at: http://localhost:${port}/api-docs`,
    'Bootstrap',
  );
}
bootstrap();
