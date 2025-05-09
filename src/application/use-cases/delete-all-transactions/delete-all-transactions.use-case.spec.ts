import { Test, TestingModule } from '@nestjs/testing';
import { DeleteAllTransactionsUseCase } from './delete-all-transactions.use-case';
import {
  ITransactionRepository,
  TRANSACTION_REPOSITORY,
} from '../../../domain/repositories/transaction.repository.interface';

const mockTransactionRepository = {
  create: jest.fn(),
  findAll: jest.fn(),
  findRecent: jest.fn(),
  deleteAll: jest.fn(),
  _clearStore: jest.fn(),
};

describe('DeleteAllTransactionsUseCase', () => {
  let useCase: DeleteAllTransactionsUseCase;
  let repository: ITransactionRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteAllTransactionsUseCase,
        {
          provide: TRANSACTION_REPOSITORY,
          useValue: mockTransactionRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteAllTransactionsUseCase>(
      DeleteAllTransactionsUseCase,
    );
    repository = module.get<ITransactionRepository>(TRANSACTION_REPOSITORY);
    mockTransactionRepository.deleteAll.mockClear();
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should call deleteAll on the transaction repository', async () => {
    await useCase.execute();
    expect(repository.deleteAll).toHaveBeenCalledTimes(1);
  });
});
