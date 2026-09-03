import QRCode from 'qrcode';
import bwipjs from 'bwip-js';

export interface GeneratedCodes {
  qrCodeSvg: string;
  qrCodePng: string;
  dataMatrixSvg: string;
  dataMatrixPng: string;
  code128Svg: string;
  code128Png: string;
}

export async function generateDocumentCodes(targetUrl: string, sku: string): Promise<GeneratedCodes> {
  // 1. QR Code
  const qrCodeSvg = await QRCode.toString(targetUrl, { type: 'svg', margin: 1 });
  const qrCodePng = await QRCode.toDataURL(targetUrl, { margin: 1, width: 600 });

  // 2. DataMatrix Code (using bwip-js)
  // DataMatrix can contain the target URL or structured GS1 format
  const dataMatrixSvg = bwipjs.toSVG({
    bcid: 'datamatrix',
    text: targetUrl,
    scale: 3,
    padding: 10,
    backgroundcolor: 'ffffff',
  });

  const dataMatrixPngBuffer = await bwipjs.toBuffer({
    bcid: 'datamatrix',
    text: targetUrl,
    scale: 5,
    padding: 10,
    backgroundcolor: 'ffffff',
  });
  const dataMatrixPng = `data:image/png;base64,${dataMatrixPngBuffer.toString('base64')}`;

  // 3. Code 128 Barcode (for SKU / Product ID or URL)
  const code128Text = sku.trim() || targetUrl;
  const code128Svg = bwipjs.toSVG({
    bcid: 'code128',
    text: code128Text,
    scale: 3,
    height: 15,
    includetext: true,
    textxalign: 'center',
    padding: 10,
    backgroundcolor: 'ffffff',
  });

  const code128PngBuffer = await bwipjs.toBuffer({
    bcid: 'code128',
    text: code128Text,
    scale: 5,
    height: 15,
    includetext: true,
    textxalign: 'center',
    padding: 10,
    backgroundcolor: 'ffffff',
  });
  const code128Png = `data:image/png;base64,${code128PngBuffer.toString('base64')}`;

  return {
    qrCodeSvg,
    qrCodePng,
    dataMatrixSvg,
    dataMatrixPng,
    code128Svg,
    code128Png,
  };
}
