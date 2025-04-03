declare namespace escpos {
  export class Printer {
    constructor(device: any);
    font(type: string): this;
    align(alignment: string): this;
    style(style: string): this;
    size(width: number, height: number): this;
    text(content: string): this;
    barcode(content: string, type: string, options: any): this;
    cut(): this;
    close(callback: () => void): this;
  }

  export class USB {
    constructor(vid: number, pid: number);
    open(callback: (error: Error | null) => void): void;
  }
}

declare module 'escpos' {
  export = escpos;
}

declare module 'escpos-usb' {
  export function findPrinter(): any[];
} 