import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  try {
    const document = await prisma.document.findUnique({
      where: { publicToken: params.token },
      include: {
        revisions: {
          orderBy: { revisionNumber: 'desc' },
        },
      },
    });

    if (!document) {
      return NextResponse.json({ error: 'Dokument nicht gefunden oder ungültiger Code.' }, { status: 404 });
    }

    // Log public audit access
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'Unbekannt';
    await prisma.auditLog.create({
      data: {
        documentId: document.id,
        action: 'PUBLIC_VIEWED',
        details: `Öffentlicher Aufruf von "${document.title}" (SKU: ${document.sku})`,
        ipAddress: ip,
      },
    });

    // Check if document is expired
    const isExpired = document.validUntil ? new Date(document.validUntil) < new Date() : false;

    if (isExpired) {
      const settings = await prisma.setting.findMany();
      const settingsMap: Record<string, string> = {};
      settings.forEach((s) => (settingsMap[s.key] = s.value));

      return NextResponse.json({
        isExpired: true,
        sku: document.sku,
        title: document.title,
        validUntil: document.validUntil,
        contactInfo: {
          company: settingsMap.contact_company || '',
          email: settingsMap.contact_email || '',
          phone: settingsMap.contact_phone || '',
          website: settingsMap.contact_website || '',
        },
      });
    }

    return NextResponse.json({
      isExpired: false,
      sku: document.sku,
      title: document.title,
      category: document.category,
      language: document.language,
      validUntil: document.validUntil,
      latestRevision: document.revisions[0],
      revisionsHistory: document.revisions.map((r) => ({
        revisionNumber: r.revisionNumber,
        fileName: r.fileName,
        fileSize: r.fileSize,
        sha256Hash: r.sha256Hash,
        createdAt: r.createdAt,
        comment: r.comment,
        revisionId: r.id,
      })),
    });
  } catch (error) {
    console.error('Public doc fetch error:', error);
    return NextResponse.json({ error: 'Fehler beim Laden des Dokuments' }, { status: 500 });
  }
}
