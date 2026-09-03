declare module 'bwip-js' {
  export interface ToSVGOptions {
    bcid: string;
    text: string;
    scale?: number;
    height?: number;
    width?: number;
    padding?: number;
    backgroundcolor?: string;
    includetext?: boolean;
    textxalign?: string;
    [key: string]: any;
  }

  export function toSVG(options: ToSVGOptions): string;
  export function toBuffer(options: ToSVGOptions): Promise<Buffer>;
}
