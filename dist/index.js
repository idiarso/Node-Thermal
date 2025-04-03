"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = require("dotenv");
const logger_1 = require("./utils/logger");
const camera_service_1 = require("./services/camera.service");
const printer_service_1 = require("./services/printer.service");
const arduino_service_1 = require("./services/arduino.service");
// Load environment variables
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Initialize services
const cameraService = camera_service_1.CameraService.getInstance();
const printerService = printer_service_1.PrinterService.getInstance();
const arduinoService = arduino_service_1.ArduinoService.getInstance();
// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date() });
});
// Camera endpoints
app.get('/camera/list', async (req, res) => {
    try {
        const cameras = await cameraService.listCameras();
        res.json({ cameras });
    }
    catch (error) {
        logger_1.logger.error('Error listing cameras:', error);
        res.status(500).json({ error: 'Failed to list cameras' });
    }
});
app.post('/camera/capture', async (req, res) => {
    try {
        const result = await cameraService.capture();
        res.json(result);
    }
    catch (error) {
        logger_1.logger.error('Error capturing image:', error);
        res.status(500).json({ error: 'Failed to capture image' });
    }
});
// Printer endpoints
app.get('/printer/status', async (req, res) => {
    try {
        const isConnected = await printerService.isConnected();
        res.json({ connected: isConnected });
    }
    catch (error) {
        logger_1.logger.error('Error checking printer status:', error);
        res.status(500).json({ error: 'Failed to check printer status' });
    }
});
app.post('/printer/test', async (req, res) => {
    try {
        await printerService.printTestPage();
        res.json({ status: 'success' });
    }
    catch (error) {
        logger_1.logger.error('Error printing test page:', error);
        res.status(500).json({ error: 'Failed to print test page' });
    }
});
app.post('/printer/ticket', async (req, res) => {
    try {
        const ticketData = req.body;
        await printerService.printTicket(ticketData);
        res.json({ status: 'success' });
    }
    catch (error) {
        logger_1.logger.error('Error printing ticket:', error);
        res.status(500).json({ error: 'Failed to print ticket' });
    }
});
// Arduino endpoints
app.get('/arduino/ports', async (req, res) => {
    try {
        const ports = await arduinoService.listPorts();
        res.json({ ports });
    }
    catch (error) {
        logger_1.logger.error('Error listing serial ports:', error);
        res.status(500).json({ error: 'Failed to list serial ports' });
    }
});
app.get('/arduino/status', (req, res) => {
    const status = arduinoService.getConnectionStatus();
    res.json({ connected: status });
});
app.post('/arduino/connect', async (req, res) => {
    try {
        await arduinoService.connect();
        res.json({ status: 'connected' });
    }
    catch (error) {
        logger_1.logger.error('Error connecting to Arduino:', error);
        res.status(500).json({ error: 'Failed to connect to Arduino' });
    }
});
app.post('/arduino/disconnect', async (req, res) => {
    try {
        await arduinoService.disconnect();
        res.json({ status: 'disconnected' });
    }
    catch (error) {
        logger_1.logger.error('Error disconnecting from Arduino:', error);
        res.status(500).json({ error: 'Failed to disconnect from Arduino' });
    }
});
app.post('/arduino/gate/open', async (req, res) => {
    try {
        await arduinoService.openGate();
        res.json({ status: 'success' });
    }
    catch (error) {
        logger_1.logger.error('Error opening gate:', error);
        res.status(500).json({ error: 'Failed to open gate' });
    }
});
app.post('/arduino/gate/close', async (req, res) => {
    try {
        await arduinoService.closeGate();
        res.json({ status: 'success' });
    }
    catch (error) {
        logger_1.logger.error('Error closing gate:', error);
        res.status(500).json({ error: 'Failed to close gate' });
    }
});
// Start the server
app.listen(port, () => {
    logger_1.logger.info(`Server is running on port ${port}`);
});
