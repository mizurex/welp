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
  title: "welp",
  description: "welp is a tool that helps you to actually study",
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
        className={`${inter.className} ${merriweather.className}`}
      >
        {children}
      </body>
    </html>
  );
}
