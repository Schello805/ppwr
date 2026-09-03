import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

const DEFAULT_CATEGORIES = [
  'Konformitätserklärung',
  'Anleitung',
  'Datenblatt',
  'Sonstiges Compliance-Dokument',
];

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};

    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const categories = settingsMap.categories
      ? JSON.parse(settingsMap.categories)
      : DEFAULT_CATEGORIES;

    return NextResponse.json({
      customDomain: settingsMap.custom_domain || '',
      categories,
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json({ error: 'Fehler beim Laden der Einstellungen' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
  }

  try {
    const { customDomain, categories } = await req.json();

    if (customDomain !== undefined) {
      const sanitizedDomain = customDomain.trim().replace(/\/+$/, ''); // Remove trailing slashes
      await prisma.setting.upsert({
        where: { key: 'custom_domain' },
        update: { value: sanitizedDomain },
        create: { key: 'custom_domain', value: sanitizedDomain },
      });
    }

    if (categories && Array.isArray(categories)) {
      await prisma.setting.upsert({
        where: { key: 'categories' },
        update: { value: JSON.stringify(categories) },
        create: { key: 'categories', value: JSON.stringify(categories) },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Fehler beim Speichern der Einstellungen' }, { status: 500 });
  }
}
