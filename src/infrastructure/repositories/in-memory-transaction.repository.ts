import { Injectable } from '@nestjs/common';
import { Transaction } from '../../domain/entities/transaction.entity';
import { ITransactionRepository } from '../../domain/repositories/transaction.repository.interface';

@Injectable()
export class InMemoryTransactionRepository implements ITransactionRepository {
  private transactions: Transaction[] = [];

  async create(transaction: Transaction): Promise<Transaction> {

    const existingTransaction = this.transactions.find(
      (t) => t.timestamp.getTime() === transaction.timestamp.getTime() && t.amount === transaction.amount,
    );

    if (existingTransaction) {
      throw new Error('Transaction with the same timestamp and amount already exists.');
    }

    this.transactions.push(transaction);
    return transaction;
  }

  async findAll(): Promise<Transaction[]> {
    // Retorna uma cópia para evitar modificação externa do array interno
    return [...this.transactions];
  }

  async findRecent(seconds: number): Promise<Transaction[]> {
    const now = new Date();
    const limitDate = new Date(now.getTime() - seconds * 1000);
    return this.transactions.filter(
      (transaction) => transaction.timestamp >= limitDate && transaction.timestamp <= now,
    );
  }

  async deleteAll(): Promise<void> {
    this.transactions = [];
  }

  // Método auxiliar para testes, se necessário
  async _clearStore(): Promise<void> {
    this.transactions = [];
  }
}
