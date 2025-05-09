import { Injectable, OnModuleInit } from '@nestjs/common';
import { Counter, Histogram, Gauge, register, collectDefaultMetrics } from 'prom-client';

@Injectable()
export class MetricsService implements OnModuleInit {
  public readonly httpRequestCounter: Counter<string>;
  public readonly httpRequestDurationHistogram: Histogram<string>;
  public readonly activeTransactionsGauge: Gauge<string>; // Exemplo de métrica customizada

  constructor() {
    // Contador para requisições HTTP totais por rota e status
    this.httpRequestCounter = new Counter({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests processed',
      labelNames: ['method', 'route', 'status_code'],
    });

    // Histograma para a duração das requisições HTTP
    this.httpRequestDurationHistogram = new Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10], // Buckets em segundos
    });

    // Gauge para o número de transações ativas (exemplo)
    // (Neste desafio, "ativas" significaria "nos últimos 60s",
    // então isso seria atualizado pelo GetStatisticsUseCase)
    this.activeTransactionsGauge = new Gauge({
        name: 'active_transactions_count',
        help: 'Current number of active transactions (e.g., in the last 60 seconds)',
    });

  }

  onModuleInit() {
    collectDefaultMetrics({ register });
    console.log('INFO: Default Prometheus metrics collected and registered.');
  }

  // Métodos para incrementar/observar métricas
  incrementRequestCounter(method: string, route: string, statusCode: number) {
    this.httpRequestCounter.labels(method, route, String(statusCode)).inc();
  }

  observeRequestDuration(method: string, route: string, statusCode: number, durationSeconds: number) {
    this.httpRequestDurationHistogram.labels(method, route, String(statusCode)).observe(durationSeconds);
  }

  setActiveTransactions(count: number) {
    this.activeTransactionsGauge.set(count);
  }
}