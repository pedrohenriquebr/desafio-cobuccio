import { Test, TestingModule } from '@nestjs/testing';
import { CreateTransactionUseCase } from './create-transaction.use-case';
import { TRANSACTION_REPOSITORY } from '../../../domain/repositories/transaction.repository.interface';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { UnprocessableEntityException } from '@nestjs/common';
import { CreateTransactionDto } from './create-transaction.dto';

const mockTransactionRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findRecent: jest.fn(),
  deleteAll: jest.fn(),
  _clearStore: jest.fn(),
};

describe('CreateTransactionUseCase', () => {
  let useCase: CreateTransactionUseCase;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTransactionUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateTransactionUseCase>(CreateTransactionUseCase);
    mockTransactionRepository.create.mockClear();
  });

  it('should create a transaction successfully', async () => {
    const dto: CreateTransactionDto = {
      amount: 100,
      timestamp: new Date(Date.now() - 1000).toISOString(),
    };
    const expectedTransaction = new Transaction(
      dto.amount,
      new Date(dto.timestamp),
    );
    mockTransactionRepository.create.mockResolvedValue(expectedTransaction);

    const result = await useCase.execute(dto);

    expect(result).toEqual(expectedTransaction);
    expect(mockTransactionRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: expectedTransaction.amount,
        timestamp: expectedTransaction.timestamp,
      }),
    );
  });

  it('should throw UnprocessableEntityException for future timestamp', async () => {
    const futureDate = new Date(Date.now() + 1000 * 60 * 60).toISOString(); // 1 hora no futuro
    const dto: CreateTransactionDto = { amount: 100, timestamp: futureDate };

    await expect(useCase.execute(dto)).rejects.toThrow(
      UnprocessableEntityException,
    );
    await expect(useCase.execute(dto)).rejects.toThrow(
      'Transaction timestamp cannot be in the future.',
    );
  });

  it('should throw UnprocessableEntityException for negative amount', async () => {
    const dto: CreateTransactionDto = {
      amount: -50,
      timestamp: new Date().toISOString(),
    };

    await expect(useCase.execute(dto)).rejects.toThrow(
      UnprocessableEntityException,
    );
    await expect(useCase.execute(dto)).rejects.toThrow(
      'Transaction amount cannot be negative.',
    );
  });
});
