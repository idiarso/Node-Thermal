"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CameraService = void 0;
const node_webcam_1 = __importDefault(require("node-webcam"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../utils/logger");
class CameraService {
    constructor() {
        // Ensure capture directory exists
        const captureDir = process.env.CAMERA_OUTPUT_DIR || './captures';
        if (!fs_1.default.existsSync(captureDir)) {
            fs_1.default.mkdirSync(captureDir, { recursive: true });
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
        this.webcam = node_webcam_1.default.create(this.opts);
    }
    static getInstance() {
        if (!CameraService.instance) {
            CameraService.instance = new CameraService();
        }
        return CameraService.instance;
    }
    async capture() {
        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `capture-${timestamp}.jpg`;
            const filepath = path_1.default.join(process.env.CAMERA_OUTPUT_DIR || './captures', filename);
            return new Promise((resolve, reject) => {
                this.webcam.capture(filepath, (err, buffer) => {
                    if (err) {
                        logger_1.logger.error('Error capturing image:', err);
                        reject(err);
                        return;
                    }
                    logger_1.logger.info(`Image captured successfully: ${filename}`);
                    resolve({ buffer, filename });
                });
            });
        }
        catch (error) {
            logger_1.logger.error('Error in capture:', error);
            throw error;
        }
    }
    async listCameras() {
        return new Promise((resolve, reject) => {
            node_webcam_1.default.list((list) => {
                logger_1.logger.info('Available cameras:', list);
                resolve(list);
            });
        });
    }
    getSettings() {
        return this.opts;
    }
    updateSettings(newSettings) {
        this.opts = { ...this.opts, ...newSettings };
        this.webcam = node_webcam_1.default.create(this.opts);
        logger_1.logger.info('Camera settings updated:', this.opts);
    }
}
exports.CameraService = CameraService;
