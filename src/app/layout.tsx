import type { Metadata } from "next";
import "./globals.css";
import AuthGuard from '@/components/AuthGuard';
import ConditionalLayout from '@/components/ConditionalLayout';

export const metadata: Metadata = {
  title: "EpiGlossa - Apprends l'anglais en t'amusant",
  description: "Une application ludique et interactive pour apprendre l'anglais avec des exercices, des jeux et des défis quotidiens",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;600;700;800;900&family=Poppins:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 min-h-screen antialiased">
        <AuthGuard>
          <ConditionalLayout>
            {children}
          </ConditionalLayout>
        </AuthGuard>
      </body>
    </html>
  );
}
