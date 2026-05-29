import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
