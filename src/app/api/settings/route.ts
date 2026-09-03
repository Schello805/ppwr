import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { sendTestEmail } from '@/lib/email';

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
      contactCompany: settingsMap.contact_company || '',
      contactEmail: settingsMap.contact_email || '',
      contactPhone: settingsMap.contact_phone || '',
      contactWebsite: settingsMap.contact_website || '',
      smtpHost: settingsMap.smtp_host || '',
      smtpPort: settingsMap.smtp_port || '587',
      smtpUser: settingsMap.smtp_user || '',
      smtpPass: settingsMap.smtp_pass ? '••••••••' : '',
      smtpFrom: settingsMap.smtp_from || '',
      smtpSecure: settingsMap.smtp_secure === 'true',
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
    const body = await req.json();

    // Handle SMTP Test Email Trigger
    if (body.action === 'test_smtp') {
      const targetEmail = body.testEmail || body.contactEmail || body.smtpUser;
      if (!targetEmail) {
        return NextResponse.json({ error: 'Bitte gib eine Ziel-E-Mail Adresse für den Test ein.' }, { status: 400 });
      }
      const testResult = await sendTestEmail(targetEmail);
      return NextResponse.json(testResult, { status: testResult.success ? 200 : 400 });
    }

    const {
      customDomain,
      categories,
      contactCompany,
      contactEmail,
      contactPhone,
      contactWebsite,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPass,
      smtpFrom,
      smtpSecure,
    } = body;

    const upsertSetting = async (key: string, value: string) => {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    };

    if (customDomain !== undefined) await upsertSetting('custom_domain', customDomain.trim().replace(/\/+$/, ''));
    if (categories && Array.isArray(categories)) await upsertSetting('categories', JSON.stringify(categories));

    if (contactCompany !== undefined) await upsertSetting('contact_company', contactCompany.trim());
    if (contactEmail !== undefined) await upsertSetting('contact_email', contactEmail.trim());
    if (contactPhone !== undefined) await upsertSetting('contact_phone', contactPhone.trim());
    if (contactWebsite !== undefined) await upsertSetting('contact_website', contactWebsite.trim());

    if (smtpHost !== undefined) await upsertSetting('smtp_host', smtpHost.trim());
    if (smtpPort !== undefined) await upsertSetting('smtp_port', smtpPort.toString());
    if (smtpUser !== undefined) await upsertSetting('smtp_user', smtpUser.trim());
    if (smtpPass !== undefined && smtpPass !== '••••••••') await upsertSetting('smtp_pass', smtpPass);
    if (smtpFrom !== undefined) await upsertSetting('smtp_from', smtpFrom.trim());
    if (smtpSecure !== undefined) await upsertSetting('smtp_secure', smtpSecure ? 'true' : 'false');

    return NextResponse.json({ success: true, message: 'Einstellungen erfolgreich gespeichert!' });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json({ error: 'Fehler beim Speichern der Einstellungen' }, { status: 500 });
  }
}
