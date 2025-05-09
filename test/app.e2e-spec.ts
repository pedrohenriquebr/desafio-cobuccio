import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';
import { InMemoryTransactionRepository } from '../src/infrastructure/repositories/in-memory-transaction.repository';
import { TRANSACTION_REPOSITORY } from '../src/domain/repositories/transaction.repository.interface';

describe('TransactionController (e2e)', () => {
  let app: INestApplication;
  let transactionRepository: InMemoryTransactionRepository;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(TRANSACTION_REPOSITORY)
      .useClass(InMemoryTransactionRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: { enableImplicitConversion: true },
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
    await app.init();
    transactionRepository = moduleFixture.get<InMemoryTransactionRepository>(
      TRANSACTION_REPOSITORY,
    );
  });

  beforeEach(async () => {
    await transactionRepository._clearStore();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/transactions (POST)', () => {
    it('should create a transaction and return 201', () => {
      const validTimestamp = new Date(Date.now() - 10000).toISOString();
      return request(app.getHttpServer())
        .post('/transactions')
        .send({ amount: 123.45, timestamp: validTimestamp })
        .expect(HttpStatus.CREATED);
    });

    it('should return 400 for malformed JSON (e.g. invalid timestamp format for DTO)', () => {
      return request(app.getHttpServer())
        .post('/transactions')
        .set('Content-Type', 'application/json')
        .send({ amount: 10, timestamp: 'bad-date-format' })
        .expect(HttpStatus.BAD_REQUEST)
        .then((response) => {
          expect(response.body.message).toEqual('Validation failed');
          expect(response.body.errors).toContain(
            'timestamp: Timestamp must be a valid ISO 8601 date string.',
          );
        });
    });

    it('should return 400 for missing amount', () => {
      const validTimestamp = new Date(Date.now() - 10000).toISOString();
      return request(app.getHttpServer())
        .post('/transactions')
        .send({ timestamp: validTimestamp })
        .expect(HttpStatus.BAD_REQUEST)
        .then((response) => {
          expect(response.body.message).toEqual('Validation failed');
          expect(response.body.errors).toEqual(
            expect.arrayContaining([
              'amount: Amount must be a number.',
              'amount: Amount cannot be negative.',
              'amount: Amount is required.',
            ]),
          );
        });
    });

    it('should return 422 for future timestamp', () => {
      const futureTimestamp = new Date(Date.now() + 3600000).toISOString();
      return request(app.getHttpServer())
        .post('/transactions')
        .send({ amount: 50, timestamp: futureTimestamp })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
        .then((response) => {
          expect(response.body.message).toContain(
            'Transaction timestamp cannot be in the future.',
          );
        });
    });

    it('should return 422 for negative amount (handled by UseCase/Entity)', () => {
      const validTimestamp = new Date().toISOString();
      return request(app.getHttpServer())
        .post('/transactions')
        .send({ amount: -10, timestamp: validTimestamp })
        .expect(HttpStatus.UNPROCESSABLE_ENTITY)
        .then((response) => {
          expect(response.body.message).toContain(
            'Transaction amount cannot be negative.',
          );
        });
    });
  });

  describe('/transactions (DELETE)', () => {
    it('should delete all transactions and return 200', async () => {
      const validTimestamp = new Date(Date.now() - 10000).toISOString();
      await request(app.getHttpServer())
        .post('/transactions')
        .send({ amount: 10, timestamp: validTimestamp });
      await request(app.getHttpServer())
        .post('/transactions')
        .send({ amount: 20, timestamp: validTimestamp });

      return request(app.getHttpServer())
        .delete('/transactions')
        .expect(HttpStatus.OK);
    });
  });

  describe('/transactions/statistics (GET)', () => {
    it('should return zero statistics for no transactions in the last 60 seconds', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions/statistics')
        .expect(HttpStatus.OK);

      expect(response.body).toEqual({
        sum: 0,
        avg: 0,
        max: 0,
        min: 0,
        count: 0,
      });
    });

    it('should return correct statistics for transactions in the last 60 seconds', async () => {
      const now = Date.now();
      await request(app.getHttpServer())
        .post('/transactions')
        .send({ amount: 10.5, timestamp: new Date(now - 10000).toISOString() });
      await request(app.getHttpServer())
        .post('/transactions')
        .send({ amount: 20.0, timestamp: new Date(now - 20000).toISOString() });
      await request(app.getHttpServer())
        .post('/transactions')
        .send({ amount: 5.25, timestamp: new Date(now - 30000).toISOString() });
      await request(app.getHttpServer())
        .post('/transactions')
        .send({
          amount: 100.0,
          timestamp: new Date(now - 70000).toISOString(),
        });

      const response = await request(app.getHttpServer())
        .get('/transactions/statistics')
        .expect(HttpStatus.OK);

      expect(response.body.count).toBe(3);
      expect(response.body.sum).toBeCloseTo(35.75);
      expect(response.body.avg).toBeCloseTo(11.92);
      expect(response.body.max).toBeCloseTo(20.0);
      expect(response.body.min).toBeCloseTo(5.25);
    });
  });

  describe('/health (GET)', () => {
    it('should return health status and timestamp', async () => {
      const response = await request(app.getHttpServer())
        .get('/transactions/health')
        .expect(HttpStatus.OK);

      expect(response.body.status).toEqual('ok');
      expect(response.body.timestamp).toBeDefined();
      expect(new Date(response.body.timestamp).getTime()).toBeLessThanOrEqual(
        new Date().getTime(),
      );
    });
  });
});
