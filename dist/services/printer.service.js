"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrinterService = void 0;
const escpos = require("escpos");
const usb = require("escpos-usb");
const logger_1 = require("../utils/logger");
// Register USB adapter with type assertion
escpos.USB = usb;
class PrinterService {
    constructor() {
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
            logger_1.logger.info('Printer service initialized');
        }
        catch (error) {
            logger_1.logger.error('Error initializing printer:', error);
            throw error;
        }
    }
    static getInstance() {
        if (!PrinterService.instance) {
            PrinterService.instance = new PrinterService();
        }
        return PrinterService.instance;
    }
    async isConnected() {
        try {
            const deviceList = usb.findPrinter();
            return deviceList.length > 0;
        }
        catch (error) {
            logger_1.logger.error('Error checking printer connection:', error);
            return false;
        }
    }
    async printTicket(ticketData) {
        try {
            const isConnected = await this.isConnected();
            if (!isConnected) {
                throw new Error('Printer not connected');
            }
            return new Promise((resolve, reject) => {
                this.device.open((error) => {
                    if (error) {
                        logger_1.logger.error('Error opening printer:', error);
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
                        logger_1.logger.info('Ticket printed successfully:', ticketData.ticketNo);
                        resolve();
                    });
                });
            });
        }
        catch (error) {
            logger_1.logger.error('Error printing ticket:', error);
            throw error;
        }
    }
    async printTestPage() {
        try {
            const isConnected = await this.isConnected();
            if (!isConnected) {
                throw new Error('Printer not connected');
            }
            return new Promise((resolve, reject) => {
                this.device.open((error) => {
                    if (error) {
                        logger_1.logger.error('Error opening printer:', error);
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
                        logger_1.logger.info('Test page printed successfully');
                        resolve();
                    });
                });
            });
        }
        catch (error) {
            logger_1.logger.error('Error printing test page:', error);
            throw error;
        }
    }
}
exports.PrinterService = PrinterService;
