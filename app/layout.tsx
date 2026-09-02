import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { LazyMotion, domAnimation, MotionConfig } from "motion/react";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "VokasIn: Asisten Analitik Kurikulum SMK",
  description:
    "Menerjemahkan SKKNI menjadi jobsheet, rencana praktikum, dan rubrik penilaian, dengan keputusan akhir di tangan guru.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <MotionConfig reducedMotion="user">
          <LazyMotion features={domAnimation} strict>
            {children}
          </LazyMotion>
        </MotionConfig>
      </body>
    </html>
  );
}
