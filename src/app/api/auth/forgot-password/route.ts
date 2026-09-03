import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendPasswordResetEmail } from '@/lib/email';
import { getActiveBaseUrl } from '@/lib/domain';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const { username } = await req.json();

    if (!username) {
      return NextResponse.json({ error: 'Benutzername ist erforderlich.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      // Return vague message to prevent user enumeration
      return NextResponse.json({
        success: true,
        message: 'Falls dieser Benutzer existiert und SMTP eingerichtet ist, wurde eine E-Mail gesendet.',
      });
    }

    // Check if SMTP is configured
    const settings = await prisma.setting.findMany();
    const map: Record<string, string> = {};
    settings.forEach((s) => (map[s.key] = s.value));

    const contactEmail = map.contact_email || map.smtp_from || map.smtp_user;
    if (!contactEmail) {
      return NextResponse.json(
        { error: 'SMTP oder Support E-Mail ist nicht eingerichtet. Bitte kontaktiere den System-Administrator.' },
        { status: 400 }
      );
    }

    // Create reset token (valid for 1 hour)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        username: user.username,
        token,
        expiresAt,
      },
    });

    const baseUrl = await getActiveBaseUrl();
    const resetLink = `${baseUrl}/reset-password?token=${token}`;

    await sendPasswordResetEmail(contactEmail, resetLink);

    return NextResponse.json({
      success: true,
      message: `Zurücksetzungs-E-Mail wurde an ${contactEmail} gesendet!`,
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: error.message || 'Fehler beim Senden der Passwort-Reset E-Mail' },
      { status: 500 }
    );
  }
}
