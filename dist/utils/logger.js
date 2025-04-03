"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const logDir = path_1.default.dirname(process.env.LOG_FILE || 'logs/app.log');
const logFile = process.env.LOG_FILE || 'logs/app.log';
// Create logs directory if it doesn't exist
require('fs').mkdirSync(logDir, { recursive: true });
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.json()),
    transports: [
        // Write all logs to file
        new winston_1.default.transports.File({
            filename: logFile,
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            tailable: true
        }),
        // Write to console in development
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.simple())
        })
    ]
});
