import winston from 'winston';
import path from 'path';

const logDir = path.dirname(process.env.LOG_FILE || 'logs/app.log');
const logFile = process.env.LOG_FILE || 'logs/app.log';

// Create logs directory if it doesn't exist
require('fs').mkdirSync(logDir, { recursive: true });

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Write all logs to file
    new winston.transports.File({
      filename: logFile,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
      tailable: true
    }),
    // Write to console in development
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
}); 