import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/redux/Provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "NexLearn | Futuristic Learning Platform",
    template: "%s | NexLearn",
  },
  description:
    "NexLearn is a next-generation learning platform for online assessments and professional skill development.",
  keywords: ["NexLearn", "online learning", "MCQ exam", "skill assessment", "e-learning"],
  authors: [{ name: "NexLearn" }],
  creator: "NexLearn",
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [
      { url: '/apple-icon.png', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
  manifest: '/manifest.webmanifest',
  openGraph: {
    type: "website",
    locale: "en_IN",
    title: "NexLearn | Futuristic Learning Platform",
    description: "Take online skill assessments and track your performance with NexLearn.",
    siteName: "NexLearn",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0993ba",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-(family-name:--font-inter)">
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
