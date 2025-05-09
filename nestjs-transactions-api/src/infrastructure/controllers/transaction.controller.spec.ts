import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction/create-transaction.use-case';
import { GetStatisticsUseCase } from '../../application/use-cases/get-statistics/get-statistics.use-case';
import { DeleteAllTransactionsUseCase } from '../../application/use-cases/delete-all-transactions/delete-all-transactions.use-case';

describe('TransactionController', () => {
  let controller: TransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        { provide: CreateTransactionUseCase, useValue: { execute: jest.fn() } },
        { provide: GetStatisticsUseCase, useValue: { execute: jest.fn() } },
        { provide: DeleteAllTransactionsUseCase, useValue: { execute: jest.fn() } },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
