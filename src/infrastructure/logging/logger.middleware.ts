import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from '../metrics/metrics.service'; // Importar

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  constructor(private readonly metricsService: MetricsService) {} // Injetar

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl, ip } = req;
    const userAgent = req.get('user-agent') || '';
    const startTime = Date.now(); // Usar Date.now() ou process.hrtime()

    res.on('finish', () => {
      const { statusCode } = res;
      const contentLength = res.get('content-length');
      const durationMs = Date.now() - startTime; // Duração em ms
      const durationSeconds = durationMs / 1000;

      this.logger.log(
        `${method} ${originalUrl} ${statusCode} ${contentLength || '-'} ${durationMs}ms - ${userAgent} ${ip}`,
      );

      // Registrar métricas
      // Normalizar a rota para evitar cardinalidade alta (ex: remover IDs)
      let route = originalUrl.split('?')[0]; // Remove query params
      // Exemplo simples de normalização (pode precisar ser mais robusto)
      route = route.replace(/\/\d+/g, '/:id'); // Substitui números na rota por :id

      this.metricsService.incrementRequestCounter(method, route, statusCode);
      this.metricsService.observeRequestDuration(method, route, statusCode, durationSeconds);
    });
    next();
  }
}