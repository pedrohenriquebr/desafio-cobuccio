import { Module } from '@nestjs/common';
import { TransactionController } from '../controllers/transaction.controller';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction/create-transaction.use-case';
import { DeleteAllTransactionsUseCase } from '../../application/use-cases/delete-all-transactions/delete-all-transactions.use-case';
import { GetStatisticsUseCase } from '../../application/use-cases/get-statistics/get-statistics.use-case';
import { InMemoryTransactionRepository } from '../repositories/in-memory-transaction.repository';
import { TRANSACTION_REPOSITORY } from '../../domain/repositories/transaction.repository.interface';

@Module({
  controllers: [TransactionController],
  providers: [
    CreateTransactionUseCase,
    DeleteAllTransactionsUseCase,
    GetStatisticsUseCase,
    {
      provide: TRANSACTION_REPOSITORY, // Token de injeção
      useClass: InMemoryTransactionRepository, // Implementação concreta
    },
  ],
})
export class TransactionModule {}
