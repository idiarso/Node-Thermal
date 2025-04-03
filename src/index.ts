import express from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { logger } from './utils/logger';
import { CameraService } from './services/camera.service';
import { PrinterService } from './services/printer.service';
import { ArduinoService } from './services/arduino.service';

// Load environment variables
config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const cameraService = CameraService.getInstance();
const printerService = PrinterService.getInstance();
const arduinoService = ArduinoService.getInstance();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Camera endpoints
app.get('/camera/list', async (req, res) => {
  try {
    const cameras = await cameraService.listCameras();
    res.json({ cameras });
  } catch (error) {
    logger.error('Error listing cameras:', error);
    res.status(500).json({ error: 'Failed to list cameras' });
  }
});

app.post('/camera/capture', async (req, res) => {
  try {
    const result = await cameraService.capture();
    res.json(result);
  } catch (error) {
    logger.error('Error capturing image:', error);
    res.status(500).json({ error: 'Failed to capture image' });
  }
});

// Printer endpoints
app.get('/printer/status', async (req, res) => {
  try {
    const isConnected = await printerService.isConnected();
    res.json({ connected: isConnected });
  } catch (error) {
    logger.error('Error checking printer status:', error);
    res.status(500).json({ error: 'Failed to check printer status' });
  }
});

app.post('/printer/test', async (req, res) => {
  try {
    await printerService.printTestPage();
    res.json({ status: 'success' });
  } catch (error) {
    logger.error('Error printing test page:', error);
    res.status(500).json({ error: 'Failed to print test page' });
  }
});

app.post('/printer/ticket', async (req, res) => {
  try {
    const ticketData = req.body;
    await printerService.printTicket(ticketData);
    res.json({ status: 'success' });
  } catch (error) {
    logger.error('Error printing ticket:', error);
    res.status(500).json({ error: 'Failed to print ticket' });
  }
});

// Arduino endpoints
app.get('/arduino/ports', async (req, res) => {
  try {
    const ports = await arduinoService.listPorts();
    res.json({ ports });
  } catch (error) {
    logger.error('Error listing serial ports:', error);
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
  } catch (error) {
    logger.error('Error connecting to Arduino:', error);
    res.status(500).json({ error: 'Failed to connect to Arduino' });
  }
});

app.post('/arduino/disconnect', async (req, res) => {
  try {
    await arduinoService.disconnect();
    res.json({ status: 'disconnected' });
  } catch (error) {
    logger.error('Error disconnecting from Arduino:', error);
    res.status(500).json({ error: 'Failed to disconnect from Arduino' });
  }
});

app.post('/arduino/gate/open', async (req, res) => {
  try {
    await arduinoService.openGate();
    res.json({ status: 'success' });
  } catch (error) {
    logger.error('Error opening gate:', error);
    res.status(500).json({ error: 'Failed to open gate' });
  }
});

app.post('/arduino/gate/close', async (req, res) => {
  try {
    await arduinoService.closeGate();
    res.json({ status: 'success' });
  } catch (error) {
    logger.error('Error closing gate:', error);
    res.status(500).json({ error: 'Failed to close gate' });
  }
});

// Start the server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
}); 