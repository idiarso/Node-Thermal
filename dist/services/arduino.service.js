"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArduinoService = void 0;
const serialport_1 = require("serialport");
const logger_1 = require("../utils/logger");
class ArduinoService {
    constructor() {
        this.isConnected = false;
        const portPath = process.env.ARDUINO_PORT || 'COM3';
        const baudRate = parseInt(process.env.ARDUINO_BAUDRATE || '9600');
        this.port = new serialport_1.SerialPort({
            path: portPath,
            baudRate: baudRate,
            autoOpen: false
        });
        this.setupPortListeners();
    }
    static getInstance() {
        if (!ArduinoService.instance) {
            ArduinoService.instance = new ArduinoService();
        }
        return ArduinoService.instance;
    }
    setupPortListeners() {
        this.port.on('open', () => {
            this.isConnected = true;
            logger_1.logger.info('Arduino connection opened');
        });
        this.port.on('close', () => {
            this.isConnected = false;
            logger_1.logger.info('Arduino connection closed');
        });
        this.port.on('error', (error) => {
            this.isConnected = false;
            logger_1.logger.error('Arduino connection error:', error);
        });
        this.port.on('data', (data) => {
            logger_1.logger.debug('Received data from Arduino:', data.toString());
        });
    }
    async connect() {
        return new Promise((resolve, reject) => {
            if (this.isConnected) {
                resolve();
                return;
            }
            this.port.open((error) => {
                if (error) {
                    logger_1.logger.error('Failed to connect to Arduino:', error);
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
    async disconnect() {
        return new Promise((resolve, reject) => {
            if (!this.isConnected) {
                resolve();
                return;
            }
            this.port.close((error) => {
                if (error) {
                    logger_1.logger.error('Failed to disconnect from Arduino:', error);
                    reject(error);
                    return;
                }
                resolve();
            });
        });
    }
    async openGate() {
        return this.sendCommand('OPEN');
    }
    async closeGate() {
        return this.sendCommand('CLOSE');
    }
    async sendCommand(command) {
        if (!this.isConnected) {
            throw new Error('Arduino not connected');
        }
        return new Promise((resolve, reject) => {
            this.port.write(`${command}\n`, (error) => {
                if (error) {
                    logger_1.logger.error(`Failed to send command ${command}:`, error);
                    reject(error);
                    return;
                }
                logger_1.logger.info(`Command sent successfully: ${command}`);
                resolve();
            });
        });
    }
    async listPorts() {
        try {
            const ports = await serialport_1.SerialPort.list();
            const portPaths = ports.map(port => port.path);
            logger_1.logger.info('Available serial ports:', portPaths);
            return portPaths;
        }
        catch (error) {
            logger_1.logger.error('Error listing serial ports:', error);
            throw error;
        }
    }
    getConnectionStatus() {
        return this.isConnected;
    }
}
exports.ArduinoService = ArduinoService;
