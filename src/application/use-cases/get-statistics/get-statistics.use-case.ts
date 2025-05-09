import { Injectable, Inject } from '@nestjs/common';
import {
  ITransactionRepository,
  TRANSACTION_REPOSITORY,
} from '../../../domain/repositories/transaction.repository.interface';
import { StatisticsDto } from './get-statistics.dto';
import { MetricsService } from '../../../infrastructure/metrics/metrics.service'; // Importar


@Injectable()
export class GetStatisticsUseCase {
  constructor(
    @Inject(TRANSACTION_REPOSITORY)
    private readonly transactionRepository: ITransactionRepository,
    private readonly metricsService: MetricsService,
  ) {}

  async execute(): Promise<StatisticsDto> {
    const recentTransactions = await this.transactionRepository.findRecent(60); // Últimos 60 segundos
    

    if (recentTransactions.length === 0) {
      return { sum: 0, avg: 0, max: 0, min: 0, count: 0 };
    }

    const amounts = recentTransactions.map((t) =>
      t.type == 'credit' ? t.amount : -t.amount,
    );

    this.metricsService.setActiveTransactions(recentTransactions.length); // Atualiza o gauge

    const sum = amounts.reduce((acc, current) => acc + current, 0);
    const count = amounts.length;
    const avg = sum / count;
    const max = Math.max(...amounts);
    const min = Math.min(...amounts);

    return {
      sum: parseFloat(sum.toFixed(2)),
      avg: parseFloat(avg.toFixed(2)),
      max: parseFloat(max.toFixed(2)),
      min: parseFloat(min.toFixed(2)),
      count,
    };
  }
}
