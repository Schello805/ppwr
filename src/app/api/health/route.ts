import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Verify database connectivity
    await prisma.user.findFirst({ select: { id: true } });

    return NextResponse.json({
      status: 'healthy',
      version: '1.1.0',
      database: 'connected',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
    }, { status: 200 });
  } catch (error: any) {
    console.error('Healthcheck failed:', error);
    return NextResponse.json({
      status: 'unhealthy',
      version: '1.1.0',
      database: 'disconnected',
      error: error?.message || 'Database connection error',
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
