import QRCode from 'qrcode';
import bwipjs from 'bwip-js';

export interface GeneratedCodes {
  qrCodeSvg: string;
  qrCodePng: string;
  dataMatrixSvg: string;
  dataMatrixPng: string;
}

export async function generateDocumentCodes(targetUrl: string, _sku: string): Promise<GeneratedCodes> {
  // 1. QR Code
  const qrCodeSvg = await QRCode.toString(targetUrl, { type: 'svg', margin: 1 });
  const qrCodePng = await QRCode.toDataURL(targetUrl, { margin: 1, width: 600 });

  // 2. DataMatrix 2D Code (ISO/IEC 16022 standard for packaging)
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

  return {
    qrCodeSvg,
    qrCodePng,
    dataMatrixSvg,
    dataMatrixPng,
  };
}
