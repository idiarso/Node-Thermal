import { SerialPort } from 'serialport';
import { logger } from '../utils/logger';

export class ArduinoService {
  private static instance: ArduinoService;
  private port: SerialPort;
  private isConnected: boolean = false;

  private constructor() {
    const portPath = process.env.ARDUINO_PORT || 'COM3';
    const baudRate = parseInt(process.env.ARDUINO_BAUDRATE || '9600');

    this.port = new SerialPort({
      path: portPath,
      baudRate: baudRate,
      autoOpen: false
    });

    this.setupPortListeners();
  }

  public static getInstance(): ArduinoService {
    if (!ArduinoService.instance) {
      ArduinoService.instance = new ArduinoService();
    }
    return ArduinoService.instance;
  }

  private setupPortListeners(): void {
    this.port.on('open', () => {
      this.isConnected = true;
      logger.info('Arduino connection opened');
    });

    this.port.on('close', () => {
      this.isConnected = false;
      logger.info('Arduino connection closed');
    });

    this.port.on('error', (error) => {
      this.isConnected = false;
      logger.error('Arduino connection error:', error);
    });

    this.port.on('data', (data) => {
      logger.debug('Received data from Arduino:', data.toString());
    });
  }

  public async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnected) {
        resolve();
        return;
      }

      this.port.open((error) => {
        if (error) {
          logger.error('Failed to connect to Arduino:', error);
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  public async disconnect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isConnected) {
        resolve();
        return;
      }

      this.port.close((error) => {
        if (error) {
          logger.error('Failed to disconnect from Arduino:', error);
          reject(error);
          return;
        }
        resolve();
      });
    });
  }

  public async openGate(): Promise<void> {
    return this.sendCommand('OPEN');
  }

  public async closeGate(): Promise<void> {
    return this.sendCommand('CLOSE');
  }

  private async sendCommand(command: string): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Arduino not connected');
    }

    return new Promise((resolve, reject) => {
      this.port.write(`${command}\n`, (error) => {
        if (error) {
          logger.error(`Failed to send command ${command}:`, error);
          reject(error);
          return;
        }
        logger.info(`Command sent successfully: ${command}`);
        resolve();
      });
    });
  }

  public async listPorts(): Promise<string[]> {
    try {
      const ports = await SerialPort.list();
      const portPaths = ports.map(port => port.path);
      logger.info('Available serial ports:', portPaths);
      return portPaths;
    } catch (error) {
      logger.error('Error listing serial ports:', error);
      throw error;
    }
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }
} 