import escpos = require('escpos');
import usb = require('escpos-usb');
import { logger } from '../utils/logger';

// Register USB adapter with type assertion
(escpos as any).USB = usb;

export class PrinterService {
  private static instance: PrinterService;
  private device: escpos.USB;
  private printer: escpos.Printer;

  private constructor() {
    try {
      // Parse USB vendor ID and product ID from PRINTER_INTERFACE
      const usbMatch = (process.env.PRINTER_INTERFACE || '').match(/usb:\/\/([0-9a-f]{4})\/([0-9a-f]{4})/i);
      if (!usbMatch) {
        throw new Error('Invalid USB printer interface format');
      }

      const [, vendorId, productId] = usbMatch;
      const vid = parseInt(vendorId, 16);
      const pid = parseInt(productId, 16);

      // Find EPSON TM-T82X
      const deviceList = usb.findPrinter();
      if (deviceList.length === 0) {
        throw new Error('No USB printer found');
      }

      this.device = new escpos.USB(vid, pid);
      this.printer = new escpos.Printer(this.device);
      logger.info('Printer service initialized');
    } catch (error) {
      logger.error('Error initializing printer:', error);
      throw error;
    }
  }

  public static getInstance(): PrinterService {
    if (!PrinterService.instance) {
      PrinterService.instance = new PrinterService();
    }
    return PrinterService.instance;
  }

  public async isConnected(): Promise<boolean> {
    try {
      const deviceList = usb.findPrinter();
      return deviceList.length > 0;
    } catch (error) {
      logger.error('Error checking printer connection:', error);
      return false;
    }
  }

  public async printTicket(ticketData: {
    ticketNo: string;
    plateNumber?: string;
    entryTime: Date;
    vehicleType: string;
  }): Promise<void> {
    try {
      const isConnected = await this.isConnected();
      if (!isConnected) {
        throw new Error('Printer not connected');
      }

      return new Promise((resolve, reject) => {
        this.device.open((error: Error | null) => {
          if (error) {
            logger.error('Error opening printer:', error);
            reject(error);
            return;
          }

          this.printer
            .font('a')
            .align('ct')
            .style('b')
            .size(1, 1)
            .text('PARKING TICKET')
            .text('----------------')
            .align('lt')
            .text(`Ticket No : ${ticketData.ticketNo}`)
            .text(ticketData.plateNumber ? `Plate No  : ${ticketData.plateNumber}` : '')
            .text(`Entry Time: ${ticketData.entryTime.toLocaleString()}`)
            .text(`Type      : ${ticketData.vehicleType}`)
            .text('')
            .align('ct')
            .barcode(ticketData.ticketNo, 'CODE128', {
              width: 2,
              height: 80,
              position: 'OFF',
              includeParity: true
            })
            .text('')
            .text('Please keep this ticket safe')
            .text('Thank you')
            .cut()
            .close(() => {
              logger.info('Ticket printed successfully:', ticketData.ticketNo);
              resolve();
            });
        });
      });
    } catch (error) {
      logger.error('Error printing ticket:', error);
      throw error;
    }
  }

  public async printTestPage(): Promise<void> {
    try {
      const isConnected = await this.isConnected();
      if (!isConnected) {
        throw new Error('Printer not connected');
      }

      return new Promise((resolve, reject) => {
        this.device.open((error: Error | null) => {
          if (error) {
            logger.error('Error opening printer:', error);
            reject(error);
            return;
          }

          this.printer
            .font('a')
            .align('ct')
            .style('b')
            .size(1, 1)
            .text('TEST PAGE')
            .text('----------------')
            .text('Printer is working correctly')
            .text(new Date().toLocaleString())
            .cut()
            .close(() => {
              logger.info('Test page printed successfully');
              resolve();
            });
        });
      });
    } catch (error) {
      logger.error('Error printing test page:', error);
      throw error;
    }
  }
} 