import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

export const loggerOptions: winston.LoggerOptions = {
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.ms(),
        winston.format.colorize(),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message} ${info.ms || ''} ${info.context ? '[' + info.context + ']' : ''} ${info.stack || ''}`,
        ),
      ),
    }),
    new winston.transports.File({
      filename: 'logs/application.log',
      format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.ms(),
        winston.format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message} ${info.ms || ''} ${info.context ? '[' + info.context + ']' : ''} ${info.stack || ''}`,
        ),
      ),
    }),
  ],
};

export const loggerConfig = WinstonModule.createLogger(loggerOptions);
