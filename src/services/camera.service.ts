import NodeWebcam from 'node-webcam';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';

export class CameraService {
  private static instance: CameraService;
  private webcam: any;
  private opts: any;

  private constructor() {
    // Ensure capture directory exists
    const captureDir = process.env.CAMERA_OUTPUT_DIR || './captures';
    if (!fs.existsSync(captureDir)) {
      fs.mkdirSync(captureDir, { recursive: true });
    }

    this.opts = {
      width: parseInt(process.env.CAMERA_WIDTH || '1280'),
      height: parseInt(process.env.CAMERA_HEIGHT || '720'),
      quality: parseInt(process.env.CAMERA_QUALITY || '100'),
      delay: 0,
      saveShots: true,
      output: 'jpeg',
      device: process.env.CAMERA_DEVICE || false,
      callbackReturn: 'buffer',
      verbose: false
    };

    this.webcam = NodeWebcam.create(this.opts);
  }

  public static getInstance(): CameraService {
    if (!CameraService.instance) {
      CameraService.instance = new CameraService();
    }
    return CameraService.instance;
  }

  public async capture(): Promise<{ buffer: Buffer; filename: string }> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `capture-${timestamp}.jpg`;
      const filepath = path.join(process.env.CAMERA_OUTPUT_DIR || './captures', filename);

      return new Promise((resolve, reject) => {
        this.webcam.capture(filepath, (err: Error, buffer: Buffer) => {
          if (err) {
            logger.error('Error capturing image:', err);
            reject(err);
            return;
          }

          logger.info(`Image captured successfully: ${filename}`);
          resolve({ buffer, filename });
        });
      });
    } catch (error) {
      logger.error('Error in capture:', error);
      throw error;
    }
  }

  public async listCameras(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      NodeWebcam.list((list: string[]) => {
        logger.info('Available cameras:', list);
        resolve(list);
      });
    });
  }

  public getSettings(): any {
    return this.opts;
  }

  public updateSettings(newSettings: Partial<typeof this.opts>): void {
    this.opts = { ...this.opts, ...newSettings };
    this.webcam = NodeWebcam.create(this.opts);
    logger.info('Camera settings updated:', this.opts);
  }
} 