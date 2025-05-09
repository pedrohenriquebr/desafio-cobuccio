import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TransactionModule } from './infrastructure/modules/transaction.module';
import { LoggerMiddleware } from './infrastructure/logging/logger.middleware';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // WinstonModule.forRoot(loggerConfig), // Configure Winston logger if needed globally here, or use as in main.ts
    ThrottlerModule.forRoot([
      {
        ttl: 30000, // 30 segundos
        limit: 50, // 50 requisições
      },
    ]),
    TransactionModule,
  ],
  controllers: [], // AppController removed if not used
  providers: [
    {
      // Apply ThrottlerGuard globally
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ], // AppService removed if not used
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
