import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { ToastProvider } from '@/components/ui/Toast';
import ConsoleSilencer from '@/components/layout/ConsoleSilencer';
import ThemeInitializer from '@/components/layout/ThemeInitializer';
import LayoutShell from '@/components/layout/LayoutShell';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'الريناد - نظام إدارة النقل الذكي',
  description: 'نظام شامل لإدارة النقل والحافلات المدرسية',
};



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <ToastProvider>
            <ConsoleSilencer />
            <ThemeInitializer />
            <LayoutShell>{children}</LayoutShell>
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
