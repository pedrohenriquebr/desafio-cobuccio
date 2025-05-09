import { Transaction } from '../entities/transaction.entity';

export interface ITransactionRepository {
  create(transaction: Transaction): Promise<Transaction>;
  findAll(): Promise<Transaction[]>;
  findRecent(seconds: number): Promise<Transaction[]>; // Para estatísticas
  deleteAll(): Promise<void>;
}

// Token para injeção de dependência
export const TRANSACTION_REPOSITORY = 'TRANSACTION_REPOSITORY';
