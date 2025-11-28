import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "./components/Providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: "Flappy Bird Base - Mini App",
  description: "Classic Flappy Bird game on Base Network - Play and mint NFTs with Farcaster wallet!",
  keywords: ["Flappy Bird", "Base", "Mini App", "NFT", "Farcaster", "Game"],
  authors: [{ name: "Flappy Bird Base Team" }],
  creator: "Base Community",
  publisher: "Vercel",
  robots: "index, follow",
  openGraph: {
    title: "Flappy Bird Base - Mini App",
    description: "Play the classic Flappy Bird game and mint NFTs on Base Network!",
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://flappy-bird-base.vercel.app',
    siteName: "Flappy Bird Base",
    images: [
      {
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://flappy-bird-base.vercel.app'}/images/og.png`,
        width: 1200,
        height: 630,
        alt: "Flappy Bird Base Game",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flappy Bird Base - Mini App",
    description: "Play the classic Flappy Bird game and mint NFTs!",
    images: [`${process.env.NEXT_PUBLIC_APP_URL || 'https://flappy-bird-base.vercel.app'}/images/og.png`],
  },
  icons: {
    icon: "/images/icon.png",
    shortcut: "/images/icon.png",
    apple: "/images/icon.png",
  },
  other: {
    // Farcaster Frame metadata
    "fc:frame": "vNext",
    "fc:frame:image": `${process.env.NEXT_PUBLIC_APP_URL || 'https://flappy-bird-base.vercel.app'}/images/og.png`,
    "fc:frame:button:1": "🐦 Play Flappy Bird",
    "fc:frame:post_url": process.env.NEXT_PUBLIC_APP_URL || 'https://flappy-bird-base.vercel.app',
    "fc:frame:image:aspect_ratio": "1.91:1",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} antialiased h-full`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
