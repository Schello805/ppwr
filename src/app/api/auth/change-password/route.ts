import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Bitte alle Passwort-Felder ausfüllen.' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Das neue Passwort muss mindestens 6 Zeichen lang sein.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { username: currentUser.username },
    });

    if (!user) {
      return NextResponse.json({ error: 'Benutzer nicht gefunden' }, { status: 404 });
    }

    const validCurrent = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!validCurrent) {
      return NextResponse.json({ error: 'Das aktuelle Passwort ist falsch.' }, { status: 400 });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { username: currentUser.username },
      data: { passwordHash: newHash },
    });

    await prisma.auditLog.create({
      data: {
        action: 'PASSWORD_CHANGED',
        details: `Passwort für Admin "${currentUser.username}" geändert.`,
        user: currentUser.username,
      },
    });

    return NextResponse.json({ success: true, message: 'Passwort erfolgreich geändert!' });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: 'Fehler beim Ändern des Passworts' }, { status: 500 });
  }
}
