import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs/promises';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

export async function GET(req: NextRequest, { params }: { params: { revisionId: string } }) {
  try {
    const revision = await prisma.documentRevision.findUnique({
      where: { id: params.revisionId },
      include: { document: true },
    });

    if (!revision) {
      return NextResponse.json({ error: 'Revisionsdatei nicht gefunden' }, { status: 404 });
    }

    const filePath = path.join(UPLOADS_DIR, revision.filePath);

    try {
      const fileBuffer = await fs.readFile(filePath);
      const download = req.nextUrl.searchParams.get('download') === 'true';

      const headers = new Headers();
      headers.set('Content-Type', revision.mimeType || 'application/pdf');
      headers.set('Content-Length', fileBuffer.length.toString());

      if (download) {
        headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(revision.fileName)}"`);
      } else {
        headers.set('Content-Disposition', `inline; filename="${encodeURIComponent(revision.fileName)}"`);
      }

      // Add revision audit headers for compliance verification
      headers.set('X-PPWR-Revision', revision.revisionNumber.toString());
      headers.set('X-PPWR-SHA256', revision.sha256Hash);

      return new NextResponse(fileBuffer, { headers });
    } catch (err) {
      console.error('File read error:', err);
      return NextResponse.json({ error: 'Datei konnte auf dem Server nicht gefunden werden.' }, { status: 404 });
    }
  } catch (error) {
    console.error('Public file serve error:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Datei' }, { status: 500 });
  }
}
