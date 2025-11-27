import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
