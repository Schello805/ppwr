import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PPWR Compliance Manager - Revisionsgesicherte Dokumente & Verpackungscodes',
  description:
    'Webapplikation zur Erstellung und Verwaltung von PPWR-Konformitätserklärungen, Anleitungen und Datenblättern mit QR-Code und DataMatrix-Code (Code 128) Erzeugung.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="dark">
      <body className="antialiased min-h-screen bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
