import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export async function getSmtpTransporter() {
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  settings.forEach((s) => (map[s.key] = s.value));

  const host = map.smtp_host || process.env.SMTP_HOST;
  const port = parseInt(map.smtp_port || process.env.SMTP_PORT || '587', 10);
  const user = map.smtp_user || process.env.SMTP_USER;
  const pass = map.smtp_pass || process.env.SMTP_PASS;
  const secure = map.smtp_secure === 'true';

  if (!host || !user || !pass) {
    return null;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
  });

  return {
    transporter,
    from: map.smtp_from || process.env.SMTP_FROM || user,
  };
}

export async function sendTestEmail(targetEmail: string): Promise<{ success: boolean; message: string }> {
  try {
    const smtp = await getSmtpTransporter();
    if (!smtp) {
      return { success: false, message: 'SMTP ist nicht konfiguriert. Bitte alle SMTP-Felder ausfüllen.' };
    }

    await smtp.transporter.sendMail({
      from: `"PPWR Compliance Manager" <${smtp.from}>`,
      to: targetEmail,
      subject: 'PPWR SMTP Test-E-Mail',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2>Test-E-Mail von deinem PPWR Compliance Manager</h2>
          <p>Deine SMTP-Konfiguration wurde erfolgreich eingerichtet und funktioniert einwandfrei!</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">PPWR Compliance Manager • Revisionsgesichertes Dokumentensystem</p>
        </div>
      `,
    });

    return { success: true, message: `Test-E-Mail erfolgreich an ${targetEmail} gesendet!` };
  } catch (error: any) {
    console.error('SMTP test error:', error);
    return { success: false, message: `Fehler beim E-Mail-Versand: ${error.message}` };
  }
}

export async function sendExpiryNotification(
  documentTitle: string,
  sku: string,
  validUntil: Date,
  adminEmail: string
) {
  try {
    const smtp = await getSmtpTransporter();
    if (!smtp) return;

    const formattedDate = validUntil.toLocaleDateString('de-DE');

    await smtp.transporter.sendMail({
      from: `"PPWR Compliance Alert" <${smtp.from}>`,
      to: adminEmail,
      subject: `⚠️ PPWR Warnung: Dokument läuft bald ab (${sku})`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2 style="color: #d97706;">⚠️ Dokumenten-Ablaufwarnung (7 Tage verbleibend)</h2>
          <p>Das folgende PPWR-Compliance-Dokument läuft in Kürze ab:</p>
          <ul>
            <li><strong>Dokumententitel:</strong> ${documentTitle}</li>
            <li><strong>Verpackungs-SKU:</strong> ${sku}</li>
            <li><strong>Ablaufdatum:</strong> ${formattedDate}</li>
          </ul>
          <p>Bitte lade rechtzeitig eine neue Revisionsstufe hoch, um abgelaufene Links auf Verpackungen zu vermeiden.</p>
          <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
          <p style="font-size: 12px; color: #64748b;">PPWR Compliance System Automatischer Alert</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending expiry email:', error);
  }
}

export async function sendPasswordResetEmail(targetEmail: string, resetLink: string) {
  try {
    const smtp = await getSmtpTransporter();
    if (!smtp) {
      throw new Error('SMTP-Server ist nicht eingerichtet.');
    }

    await smtp.transporter.sendMail({
      from: `"PPWR Security" <${smtp.from}>`,
      to: targetEmail,
      subject: '🔐 PPWR Admin Passwort zurücksetzen',
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
          <h2>Passwort zurücksetzen Anforderung</h2>
          <p>Du hast das Zurücksetzen deines Admin-Passworts angefordert.</p>
          <p>Klicke auf den folgenden Button, um ein neues Passwort festzulegen (Link 1 Stunde gültig):</p>
          <p style="margin: 25px 0;">
            <a href="${resetLink}" style="background-color: #16a34a; color: #ffffff; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Neues Passwort festlegen</a>
          </p>
          <p style="font-size: 12px; color: #64748b;">Falls du diese Anforderung nicht ausgelöst hast, kannst du diese E-Mail ignorieren.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
}
