import { InMemoryTransactionRepository } from './in-memory-transaction.repository';
import { Transaction } from '../../domain/entities/transaction.entity';

describe('InMemoryTransactionRepository', () => {
  let repository: InMemoryTransactionRepository;

  beforeEach(async () => {
    repository = new InMemoryTransactionRepository();
    await repository._clearStore();
  });

  it('should create a transaction', async () => {
    const transaction = new Transaction(100, undefined, 'credit');
    const createdTransaction = await repository.create(transaction);
    expect(createdTransaction).toEqual(transaction);
    const allTransactions = await repository.findAll();
    expect(allTransactions).toContain(transaction);
  });

  it('should find all transactions', async () => {
    const transaction1 = new Transaction(100, undefined, 'credit');
    const transaction2 = new Transaction(50, undefined, 'debit');
    await repository.create(transaction1);
    await repository.create(transaction2);
    const allTransactions = await repository.findAll();
    expect(allTransactions).toEqual([transaction1, transaction2]);
  });

  it('should delete all transactions', async () => {
    const transaction = new Transaction(100, undefined, 'credit');
    await repository.create(transaction);
    await repository.deleteAll();
    const allTransactions = await repository.findAll();
    expect(allTransactions).toEqual([]);
  });

  describe('findRecent', () => {
    it('should return transactions within the last N seconds', async () => {
      const now = Date.now();
      const transaction1 = new Transaction(10, new Date(now - 10 * 1000)); // 10s ago
      const transaction2 = new Transaction(20, new Date(now - 30 * 1000)); // 30s ago
      const transactionOld = new Transaction(30, new Date(now - 70 * 1000)); // 70s ago

      await repository.create(transaction1);
      await repository.create(transaction2);
      await repository.create(transactionOld);

      const recentTransactions = await repository.findRecent(60); // Find transactions in last 60s

      expect(recentTransactions).toContain(transaction1);
      expect(recentTransactions).toContain(transaction2);
      expect(recentTransactions).not.toContain(transactionOld);
      expect(recentTransactions.length).toBe(2);
    });

    it('should return empty array if no transactions are within the last N seconds', async () => {
      const now = Date.now();
      const transactionOld1 = new Transaction(10, new Date(now - 70 * 1000)); // 70s ago
      const transactionOld2 = new Transaction(20, new Date(now - 80 * 1000)); // 80s ago

      await repository.create(transactionOld1);
      await repository.create(transactionOld2);

      const recentTransactions = await repository.findRecent(60);
      expect(recentTransactions.length).toBe(0);
    });

    it('should return empty array if there are no transactions at all', async () => {
      const recentTransactions = await repository.findRecent(60);
      expect(recentTransactions.length).toBe(0);
    });

    it('should include transactions exactly at the boundary and exclude those just outside', async () => {
      const now = Date.now();
      // Transaction exactly 60 seconds ago (should be included)
      const transactionOnBoundary = new Transaction(
        50,
        new Date(now - 60 * 1000),
      );
      // Transaction 60.001 seconds ago (should be excluded)
      const transactionOutsideBoundary = new Transaction(
        60,
        new Date(now - 60 * 1000 - 1),
      );
      // Transaction 0 seconds ago (now, should be included)
      const transactionNow = new Transaction(70, new Date(now));

      await repository.create(transactionOnBoundary);
      await repository.create(transactionOutsideBoundary);
      await repository.create(transactionNow);

      const recentTransactions = await repository.findRecent(60);

      expect(recentTransactions).toContain(transactionOnBoundary);
      expect(recentTransactions).toContain(transactionNow);
      expect(recentTransactions).not.toContain(transactionOutsideBoundary);
      expect(recentTransactions.length).toBe(2);
    });
  });
});
