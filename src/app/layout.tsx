import type { Metadata } from "next";
import "./globals.css";
import VisualEditsMessenger from "../visual-edits/VisualEditsMessenger";
import ErrorReporter from "@/components/ErrorReporter";
import Script from "next/script";
import { BottomNav } from "@/components/bottom-nav";

export const metadata: Metadata = {
  title: "Taco Track — Restaurant Inventory Management",
  description: "Track your tacos, ingredients, and orders with ease.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Script
          id="orchids-browser-logs"
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts/orchids-browser-logs.js"
          strategy="afterInteractive"
          data-orchids-project-id="bf09de79-466f-420c-a94b-8abffbedbb6d"
        />
        <ErrorReporter />
        <Script
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/scripts//route-messenger.js"
          strategy="afterInteractive"
          data-target-origin="*"
          data-message-type="ROUTE_CHANGE"
          data-include-search-params="true"
          data-only-in-iframe="true"
          data-debug="true"
          data-custom-data='{"appName": "YourApp", "version": "1.0.0", "greeting": "hi"}'
        />
        <BottomNav />
        <div className="min-h-screen bg-background pl-56">
          <header className="relative w-full h-48 overflow-hidden border-b border-primary/20 shadow-2xl shadow-primary/5">
            <div className="absolute inset-0 bg-background/10 z-10" />
            <img
              src="/header-banner-v4.png"
              alt="Taco Track"
              className="h-full w-full object-cover object-center"
            />
          </header>
          {children}
        </div>
        <VisualEditsMessenger />
      </body>
    </html>
  );
}
