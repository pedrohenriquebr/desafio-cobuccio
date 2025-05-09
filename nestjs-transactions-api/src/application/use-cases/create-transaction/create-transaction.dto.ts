import { IsNotEmpty, IsNumber, IsISO8601, Min, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTransactionDto {
  @IsNumber({}, { message: 'Amount must be a number.' })
  @IsNotEmpty({ message: 'Amount is required.' })
  amount: number;

  @IsISO8601({ strict: false }, { message: 'Timestamp must be a valid ISO 8601 date string.' })
  @IsNotEmpty({ message: 'Timestamp is required.' })
  timestamp: string;
}
