import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import { ToastProvider } from "@/components/ui/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CNC Connect Algérie - Usinage CNC Nouvelle Génération",
  description: "Obtenez vos pièces CNC sur-mesure en quelques clics. Devis instantané, analyse 3D par IA, réseau d'ateliers certifiés en Algérie.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${inter.className} antialiased bg-slate-50`}>
        <ErrorBoundary>
          <ToastProvider>
            <Header />
            <main className="min-h-screen">
              {children}
            </main>
          </ToastProvider>
        </ErrorBoundary>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
