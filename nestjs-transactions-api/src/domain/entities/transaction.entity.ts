import * as crypto from 'crypto'; // Required for crypto.randomUUID()

export class Transaction {
  public readonly id: string; // Gerado internamente
  public readonly amount: number;
  public readonly type: 'credit' | 'debit'; // Retaining type from previous version, guide focuses on amount and timestamp
  public readonly timestamp: Date;

  constructor(amount: number, timestamp: Date, id?: string, type?: 'credit' | 'debit') { // Added type back
    if (amount < 0) {
      throw new Error('Transaction amount cannot be negative.');
    }
    // Ensure timestamp is a Date object before comparison
    const ts = timestamp instanceof Date ? timestamp : new Date(timestamp);
    if (ts > new Date()) {
      throw new Error('Transaction timestamp cannot be in the future.');
    }

    this.id = id || crypto.randomUUID();
    this.amount = amount;
    this.timestamp = ts;
    this.type = type || (amount >= 0 ? 'credit' : 'debit'); // Default type based on amount if not provided
  }
}
