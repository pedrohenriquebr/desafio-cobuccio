import { Controller, Post, Body, Delete, Get, HttpCode, HttpStatus, ValidationPipe, UsePipes, BadRequestException, UnprocessableEntityException } from '@nestjs/common';
import { CreateTransactionUseCase } from '../../application/use-cases/create-transaction/create-transaction.use-case';
import { DeleteAllTransactionsUseCase } from '../../application/use-cases/delete-all-transactions/delete-all-transactions.use-case';
import { GetStatisticsUseCase } from '../../application/use-cases/get-statistics/get-statistics.use-case';
import { CreateTransactionDto } from '../../application/use-cases/create-transaction/create-transaction.dto';
import { StatisticsDto } from '../../application/use-cases/get-statistics/get-statistics.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

@ApiTags('Transactions')
@Controller('transactions')
export class TransactionController {
  constructor(
    private readonly createTransactionUseCase: CreateTransactionUseCase,
    private readonly deleteAllTransactionsUseCase: DeleteAllTransactionsUseCase,
    private readonly getStatisticsUseCase: GetStatisticsUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  // The global ValidationPipe in main.ts will handle this.
  // If specific pipe configuration is needed here, it can be added.
  // @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true, exceptionFactory: (errors) => new BadRequestException(errors) }))
  @ApiOperation({ summary: 'Create a new transaction' })
  @ApiBody({ type: CreateTransactionDto })
  @ApiResponse({ status: 201, description: 'Transaction accepted and registered.'})
  @ApiResponse({ status: 400, description: 'Bad Request: Malformed JSON or validation error.'})
  @ApiResponse({ status: 422, description: 'Unprocessable Entity: Transaction rejected due to business rule violation.'})
  async createTransaction(@Body() createTransactionDto: CreateTransactionDto) {
    try {
        await this.createTransactionUseCase.execute(createTransactionDto);
        // No body in 201 response as per guide
    } catch (error) {
        if (error instanceof UnprocessableEntityException) {
            throw new UnprocessableEntityException(error.getResponse());
        }
        if (error instanceof BadRequestException) {
            throw new BadRequestException(error.getResponse());
        }
        throw error; // Re-throw other errors for NestJS default handling
    }
  }

  @Delete()
  @HttpCode(HttpStatus.OK) // Changed from NO_CONTENT to OK as per guide
  @ApiOperation({ summary: 'Delete all transactions' })
  @ApiResponse({ status: 200, description: 'All transactions were successfully deleted.'})
  async deleteAllTransactions(): Promise<void> {
    await this.deleteAllTransactionsUseCase.execute();
    // No body in 200 response
  }

  @Get('statistics') // Route is /transactions/statistics
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get transaction statistics for the last 60 seconds' })
  @ApiResponse({ status: 200, description: 'Statistics returned successfully.', type: StatisticsDto })
  async getStatistics(): Promise<StatisticsDto> {
    return this.getStatisticsUseCase.execute();
  }

  @Get('/health') // As per Passo 13
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy.'})
  healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }
}
