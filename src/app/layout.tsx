import type { Metadata } from "next";
import { Playfair_Display, Lora, Caveat } from "next/font/google";
import "../styles/globals.css";
import "../styles/skeuomorphic-variants.css";
import "../styles/animations.css";
import "../styles/skeuomorphic.css";
import { ToastProvider } from "@/components/ui/ToastProvider";

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-title',
});

const lora = Lora({ 
  subsets: ["latin"],
  variable: '--font-body',
});

const caveat = Caveat({ 
  subsets: ["latin"],
  variable: '--font-handwriting',
});

export const metadata: Metadata = {
  title: "妙物记 (MiaoWuJi) - Discover the Magic in Your Possessions",
  description: "A skeuomorphic web app to help you discover the hidden value of products you already own.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className={`${playfair.variable} ${lora.variable} ${caveat.variable}`}>
        <ToastProvider>
          <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {children}
          </main>
        </ToastProvider>
      </body>
    </html>
  );
}
