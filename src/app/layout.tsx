import type { Metadata } from "next";
import { Inter, Rajdhani } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";
import ChatSidebar from "@/components/layout/ChatSidebar";
import AgeGateModal from "@/components/AgeGateModal";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-rajdhani",
});

export const metadata: Metadata = {
  title: "RustFight — Rust Skin Gaming (Demo)",
  description:
    "Demo Rust skin gaming site: cases, case battles, coinflip, upgrader, mines, jackpot and marketplace. No real money involved.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${rajdhani.variable} font-sans`}>
        <TopBar />
        <div className="flex">
          <Sidebar />
          <div className="flex min-h-[calc(100vh-4rem)] min-w-0 flex-1 flex-col">
            <main className="flex-1 px-4 py-6 sm:px-6">{children}</main>
            <Footer />
          </div>
        </div>
        <ChatSidebar />
        <AgeGateModal />
      </body>
    </html>
  );
}
