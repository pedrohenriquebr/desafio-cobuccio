import { Injectable, Inject } from '@nestjs/common';
import { ITransactionRepository, TRANSACTION_REPOSITORY } from '../../../domain/repositories/transaction.repository.interface';

@Injectable()
export class DeleteAllTransactionsUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(): Promise<void> {
    await this.transactionRepository.deleteAll();
  }
}
