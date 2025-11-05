import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { esES } from "@clerk/localizations";
import "./globals.css";

export const metadata: Metadata = {
  title: "Maestro-Ya",
  description: "Plataforma de servicios profesionales en Ecuador",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={esES}>
      <html lang="es">
        <body className="antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}