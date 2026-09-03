import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  const documentId = params.id;

  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { revisions: { orderBy: { revisionNumber: 'desc' } } },
    });

    if (!document) {
      return NextResponse.json({ error: 'Dokument nicht gefunden' }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const comment = (formData.get('comment') as string)?.trim() || 'Neue Revision';

    if (!file) {
      return NextResponse.json({ error: 'Datei ist erforderlich' }, { status: 400 });
    }

    const nextRevisionNumber = (document.revisions[0]?.revisionNumber || 0) + 1;

    // Read file & calculate SHA-256
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sha256Hash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Create unique filename
    const fileExt = path.extname(file.name) || '.pdf';
    const storedFileName = `${Date.now()}_rev${nextRevisionNumber}_${crypto.randomBytes(6).toString('hex')}${fileExt}`;
    const filePath = path.join(UPLOADS_DIR, storedFileName);

    await fs.writeFile(filePath, buffer);

    // Create revision and update document
    const newRevision = await prisma.documentRevision.create({
      data: {
        documentId: document.id,
        revisionNumber: nextRevisionNumber,
        fileName: file.name,
        filePath: storedFileName,
        fileSize: file.size,
        mimeType: file.type || 'application/pdf',
        sha256Hash,
        comment,
        uploadedBy: currentUser.username,
      },
    });

    await prisma.document.update({
      where: { id: document.id },
      data: { updatedAt: new Date() },
    });

    await prisma.auditLog.create({
      data: {
        documentId: document.id,
        action: 'REVISION_ADDED',
        details: `Neue Revision ${nextRevisionNumber} für "${document.title}" hochgeladen. SHA-256: ${sha256Hash}`,
        user: currentUser.username,
      },
    });

    return NextResponse.json({
      success: true,
      revision: newRevision,
    });
  } catch (error) {
    console.error('Error adding revision:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen der neuen Revision' }, { status: 500 });
  }
}
