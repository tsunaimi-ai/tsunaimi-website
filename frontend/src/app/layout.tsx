import "./globals.css";
import { Inter } from "next/font/google";
import { headers } from 'next/headers';
import { Metadata } from 'next';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'TsunAImi'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get the locale from the accept-language header, defaulting to 'en'
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language') || '';
  const preferredLocale = acceptLanguage.includes('fr') ? 'fr' : 'en';
  
  return (
    <html className="scroll-smooth" lang={preferredLocale}>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
