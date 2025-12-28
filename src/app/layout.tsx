import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {
  ClerkProvider,
  
} from '@clerk/nextjs'

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dentiva - AI Voice Assistant ",
  description: "Get instant dental advice through voice calls with our AI assistant. Avaiable 24/7.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
 
  <ClerkProvider
    appearance={{
      variables: {
       colorPrimary: "#12242e",
colorBackground: "#f3e3ea",
colorText: "#12242e",
colorTextSecondary: "#475569",
colorInputBackground: "#ffffff",


      },
    }}
  >
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased dark`}
      >
        {/* <Toaster /> */}
        {children}
      </body>
    </html>
  </ClerkProvider>


  );
}
