import type { Metadata } from "next";
import { Geist, Geist_Mono ,Inter, Merriweather} from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "welp - wrapper that can actually help you learn",
    template: "%s | welp",
  },
  description: "welp gives you the content, but broken down into clear nodes and subnodes so it's actually usable for learning, studying, or researching.",
  keywords: [
    "welp",
    "ai study",
    "ai learning",
    "study ai",
    "research ai",
    "learn ai",
  ],
  twitter: {
    card: "summary_large_image",
    title: "welp - an AI wrapper that can actually help you learn, study or research",
    description: "welp gives you the content, but broken down into clear nodes and subnodes so it's actually usable for learning, studying, or researching.",
    images: ["/logo/logo-welp.svg"],
    creator: "@welp",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  }
};

const merriweather= Merriweather(
  {
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
  variable: "--font-merriweather",
  }
);
const inter = Inter({ subsets: ["latin"] });


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${inter.className} ${merriweather.className}`}
      >
        {children}
      </body>
    </html>
  );
}
