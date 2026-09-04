import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendExpiryNotification } from '@/lib/email';
import { getCurrentUser } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => (map[s.key] = s.value));

    // Security Check: Token or active admin session
    const configuredSecret = map.cron_secret || process.env.CRON_SECRET;
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : null;
    const queryToken = req.nextUrl.searchParams.get('token');
    const providedToken = bearerToken || queryToken;

    const currentUser = getCurrentUser();
    const isAuthorizedByToken = configuredSecret && providedToken === configuredSecret;
    const isAuthorizedBySession = !!currentUser;

    if (!isAuthorizedByToken && !isAuthorizedBySession) {
      return NextResponse.json(
        { error: 'Nicht autorisiert: Ungültiger oder fehlender Cron-Sicherheitstoken.' },
        { status: 401 }
      );
    }

    const adminEmail = map.contact_email || map.smtp_user;
    if (!adminEmail) {
      return NextResponse.json({ error: 'Keine Support/Admin E-Mail konfiguriert.' }, { status: 400 });
    }

    const now = new Date();
    const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const expiringDocuments = await prisma.document.findMany({
      where: {
        notifyBeforeExpiry: true,
        expiryNotified: false,
        validUntil: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
    });

    let notifiedCount = 0;
    for (const doc of expiringDocuments) {
      if (doc.validUntil) {
        await sendExpiryNotification(doc.title, doc.sku, doc.validUntil, adminEmail);
        await prisma.document.update({
          where: { id: doc.id },
          data: { expiryNotified: true },
        });
        notifiedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      expiringFound: expiringDocuments.length,
      notifiedCount,
    });
  } catch (error) {
    console.error('Error checking document expirations:', error);
    return NextResponse.json({ error: 'Fehler beim Prüfen der Ablaufdaten' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
