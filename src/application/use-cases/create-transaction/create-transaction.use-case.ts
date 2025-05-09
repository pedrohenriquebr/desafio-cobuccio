import { Injectable, Inject, UnprocessableEntityException, BadRequestException } from '@nestjs/common';
import { Transaction } from '../../../domain/entities/transaction.entity';
import { ITransactionRepository, TRANSACTION_REPOSITORY } from '../../../domain/repositories/transaction.repository.interface';
import { CreateTransactionDto } from './create-transaction.dto';

@Injectable()
export class CreateTransactionUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
  ) {}

  async execute(createTransactionDto: CreateTransactionDto): Promise<Transaction> {
    const { amount, timestamp } = createTransactionDto;

    const timestampAsDate = new Date(timestamp);

    const now = new Date();
    // The DTO uses @Type(() => Date) so timestamp should be a Date object here if validation passed
    if (timestampAsDate > now) {
      throw new UnprocessableEntityException('Transaction timestamp cannot be in the future.');
    }

    try {
      // Assuming 'type' is determined by amount or passed differently if needed
      const transaction = new Transaction(amount < 0 ? -amount : amount , timestampAsDate, undefined, amount < 0 ? 'debit' : 'credit');
      return await this.transactionRepository.create(transaction);
    } catch (error) {
      if (error.message.includes('timestamp cannot be in the future')) {
         throw new UnprocessableEntityException(error.message);
      }
      throw new BadRequestException('Invalid transaction data provided or failed to create transaction.');
    }
  }
}
