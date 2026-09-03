import { prisma } from '@/lib/prisma';

export async function getActiveBaseUrl(): Promise<string> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'custom_domain' },
    });
    if (setting && setting.value.trim().length > 0) {
      return setting.value.trim().replace(/\/+$/, '');
    }
  } catch (err) {
    console.error('Error reading custom domain setting:', err);
  }
  return process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
}
