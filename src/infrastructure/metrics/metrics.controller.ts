import { Controller, Get, Res } from '@nestjs/common';
import { register } from 'prom-client';
import { Response } from 'express';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class MetricsController {
  @Get('metrics') 
  @ApiExcludeEndpoint()
  async getMetrics(@Res() res: Response) {
    res.header('Content-Type', register.contentType);
    res.send(await register.metrics());
  }
}