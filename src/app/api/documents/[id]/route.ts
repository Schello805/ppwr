import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import path from 'path';
import fs from 'fs/promises';

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  const documentId = params.id;

  try {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { revisions: true },
    });

    if (!document) {
      return NextResponse.json({ error: 'Dokument nicht gefunden' }, { status: 404 });
    }

    // Delete associated physical files
    for (const rev of document.revisions) {
      try {
        const filePath = path.join(UPLOADS_DIR, rev.filePath);
        await fs.unlink(filePath);
      } catch (err) {
        console.warn(`Could not delete physical file ${rev.filePath}:`, err);
      }
    }

    // Record audit log before deleting
    await prisma.auditLog.create({
      data: {
        action: 'DOCUMENT_DELETED',
        details: `Dokument "${document.title}" (SKU: ${document.sku}) wurde von ${currentUser.username} gelöscht.`,
        user: currentUser.username,
      },
    });

    // Delete document (cascade deletes revisions)
    await prisma.document.delete({
      where: { id: documentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Fehler beim Löschen des Dokuments' }, { status: 500 });
  }
}
