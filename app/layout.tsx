import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { AutoLogoutProvider } from "./components/Auth/AutoLogoutProvider";
import { LanguageProvider } from "./contexts/LanguageContext";
import { OfflineIndicator, ServiceWorkerRegistration } from "./components";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Control de Energía",
  description: "Gestiona tu consumo eléctrico de manera inteligente",
  manifest: "/manifest.json",
  themeColor: "#3b82f6",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Control de Energía",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Control de Energía",
    title: "Control de Energía",
    description: "Gestiona tu consumo eléctrico de manera inteligente",
  },
  twitter: {
    card: "summary",
    title: "Control de Energía",
    description: "Gestiona tu consumo eléctrico de manera inteligente",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <head>
        <meta
          name="format-detection"
          content="telephone=no, date=no, email=no, address=no"
        />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Control de Energía" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16x16.png" />
        <meta name="msapplication-TileColor" content="#3b82f6" />
        <meta name="msapplication-TileImage" content="/icons/icon-144x144.png" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning={true}
      >
        <LanguageProvider>
          <AuthProvider>
            <AutoLogoutProvider>
              <ServiceWorkerRegistration />
              <OfflineIndicator />
              {children}
            </AutoLogoutProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
