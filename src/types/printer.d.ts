declare module 'printer' {
  interface Printer {
    name: string;
    description: string;
    status: number;
    isDefault: boolean;
    options: Record<string, any>;
  }

  interface PrintOptions {
    data: string | Buffer;
    printer: string;
    type?: string;
    success?: () => void;
    error?: (error: Error) => void;
  }

  export function getPrinters(): Printer[];
  export function printDirect(options: PrintOptions): void;
  export function getDefaultPrinterName(): string;
} 