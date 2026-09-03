import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateDocumentCodes } from '@/lib/barcode';
import { getActiveBaseUrl } from '@/lib/domain';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const document = await prisma.document.findUnique({
      where: { id: params.id },
    });

    if (!document) {
      return NextResponse.json({ error: 'Dokument nicht gefunden' }, { status: 404 });
    }

    const baseUrl = await getActiveBaseUrl();
    const publicUrl = `${baseUrl}/doc/${document.publicToken}`;
    const codes = await generateDocumentCodes(publicUrl, document.sku);

    return NextResponse.json({
      publicUrl,
      sku: document.sku,
      title: document.title,
      codes,
    });
  } catch (error) {
    console.error('Error generating document codes:', error);
    return NextResponse.json({ error: 'Fehler beim Generieren der Codes' }, { status: 500 });
  }
}
