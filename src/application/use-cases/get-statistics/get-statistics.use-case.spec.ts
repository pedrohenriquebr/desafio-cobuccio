import { Test, TestingModule } from '@nestjs/testing';
import { GetStatisticsUseCase } from './get-statistics.use-case';
import {
  ITransactionRepository,
  TRANSACTION_REPOSITORY,
} from '../../../domain/repositories/transaction.repository.interface';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { StatisticsDto } from './get-statistics.dto';

const mockTransactionRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findRecent: jest.fn(),
  deleteAll: jest.fn(),
  _clearStore: jest.fn(),
};

describe('GetStatisticsUseCase', () => {
  let useCase: GetStatisticsUseCase;
  let repository: ITransactionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetStatisticsUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetStatisticsUseCase>(GetStatisticsUseCase);
    repository = module.get<ITransactionRepository>(TRANSACTION_REPOSITORY);
    mockTransactionRepository.findRecent.mockClear();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return zero statistics if no recent transactions are found', async () => {
    mockTransactionRepository.findRecent.mockResolvedValue([]);
    const expectedStatistics: StatisticsDto = {
      sum: 0,
      avg: 0,
      max: 0,
      min: 0,
      count: 0,
    };

    const result = await useCase.execute();

    expect(result).toEqual(expectedStatistics);
    expect(repository.findRecent).toHaveBeenCalledWith(60);
  });

  it('should calculate statistics correctly for recent transactions', async () => {
    const now = new Date();
    const transactions = [
      new Transaction(10.5, new Date(now.getTime() - 10000)), // 10s ago
      new Transaction(20.0, new Date(now.getTime() - 20000)), // 20s ago
      new Transaction(5.25, new Date(now.getTime() - 30000)), // 30s ago
    ];
    mockTransactionRepository.findRecent.mockResolvedValue(transactions);

    const result = await useCase.execute();

    expect(result.count).toBe(3);
    expect(result.sum).toBeCloseTo(35.75);
    expect(result.avg).toBeCloseTo(11.92); // 35.75 / 3
    expect(result.max).toBeCloseTo(20.0);
    expect(result.min).toBeCloseTo(5.25);
    expect(repository.findRecent).toHaveBeenCalledWith(60);
  });

  it('should handle a single transaction correctly', async () => {
    const now = new Date();
    const transactions = [
      new Transaction(100.0, new Date(now.getTime() - 5000)), // 5s ago
    ];
    mockTransactionRepository.findRecent.mockResolvedValue(transactions);

    const result = await useCase.execute();

    expect(result.count).toBe(1);
    expect(result.sum).toBeCloseTo(100.0);
    expect(result.avg).toBeCloseTo(100.0);
    expect(result.max).toBeCloseTo(100.0);
    expect(result.min).toBeCloseTo(100.0);
  });
});
