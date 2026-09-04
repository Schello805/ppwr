import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { generateDocumentCodes } from '@/lib/barcode';

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
async function ensureUploadsDir() {
  try {
    await fs.access(UPLOADS_DIR);
  } catch {
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
  }
}

export async function GET(req: NextRequest) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  try {
    const documents = await prisma.document.findMany({
      include: {
        revisions: {
          orderBy: { revisionNumber: 'desc' },
        },
        auditLogs: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Dokumente' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const sku = (formData.get('sku') as string)?.trim();
    const title = (formData.get('title') as string)?.trim();
    const category = (formData.get('category') as string)?.trim() || 'Konformitätserklärung';
    const language = (formData.get('language') as string)?.trim() || 'DE';
    const comment = (formData.get('comment') as string)?.trim() || 'Initialer Upload (v1)';
    const validUntilStr = formData.get('validUntil') as string | null;
    const notifyBeforeExpiry = formData.get('notifyBeforeExpiry') !== 'false';

    const validUntil = validUntilStr ? new Date(validUntilStr) : null;

    if (!file || !sku || !title) {
      return NextResponse.json(
        { error: 'Datei, SKU und Dokumententitel sind erforderlich.' },
        { status: 400 }
      );
    }

    await ensureUploadsDir();

    // Read file buffer & calculate SHA-256 hash
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const sha256Hash = crypto.createHash('sha256').update(buffer).digest('hex');

    // Create unique filename
    const fileExt = path.extname(file.name) || '.pdf';
    const storedFileName = `${Date.now()}_${crypto.randomBytes(8).toString('hex')}${fileExt}`;
    const filePath = path.join(UPLOADS_DIR, storedFileName);

    // Save file to disk
    await fs.writeFile(filePath, buffer);

    // Create document & revision v1 in database
    const document = await prisma.document.create({
      data: {
        sku,
        title,
        category,
        language,
        validUntil,
        notifyBeforeExpiry,
        revisions: {
          create: {
            revisionNumber: 1,
            fileName: file.name,
            filePath: storedFileName,
            fileSize: file.size,
            mimeType: file.type || 'application/pdf',
            sha256Hash,
            comment,
            uploadedBy: currentUser.username,
          },
        },
        auditLogs: {
          create: {
            action: 'DOCUMENT_CREATED',
            details: `Dokument "${title}" (SKU: ${sku}, Sprache: ${language}) mit Revision 1 erstellt. Hash: ${sha256Hash}`,
            user: currentUser.username,
          },
        },
      },
      include: {
        revisions: true,
      },
    });

    // Generate codes with Custom Domain if set
    const { getActiveBaseUrl } = await import('@/lib/domain');
    const baseUrl = await getActiveBaseUrl();
    const publicUrl = `${baseUrl}/doc/${document.publicToken}`;
    const codes = await generateDocumentCodes(publicUrl, document.sku);

    return NextResponse.json({
      success: true,
      document,
      publicUrl,
      codes,
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen des Dokuments' }, { status: 500 });
  }
}
