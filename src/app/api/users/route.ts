import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

// GET /api/users - List users (Admin only)
export async function GET() {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Nur Administratoren haben Zugriff auf die Benutzerverwaltung.' }, { status: 403 });
  }

  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Benutzer' }, { status: 500 });
  }
}

// POST /api/users - Create user (Admin only)
export async function POST(req: NextRequest) {
  const currentUser = getCurrentUser();
  if (!currentUser || currentUser.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Nur Administratoren können neue Benutzer anlegen.' }, { status: 403 });
  }

  try {
    const { username, password, name, role } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Benutzername und Passwort sind erforderlich.' }, { status: 400 });
    }

    const validRoles = ['ADMIN', 'MANAGER', 'VIEWER'];
    const assignedRole = validRoles.includes(role) ? role : 'MANAGER';

    const existing = await prisma.user.findUnique({
      where: { username: username.trim() },
    });

    if (existing) {
      return NextResponse.json({ error: 'Dieser Benutzername existiert bereits.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: username.trim(),
        name: name ? name.trim() : username.trim(),
        passwordHash,
        role: assignedRole,
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    // Audit Log
    await prisma.auditLog.create({
      data: {
        action: 'USER_CREATED',
        details: `Neuer Benutzer "${newUser.username}" mit Rolle ${newUser.role} angelegt.`,
        user: currentUser.username,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen des Benutzers' }, { status: 500 });
  }
}
