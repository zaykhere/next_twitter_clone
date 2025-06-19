import "./globals.css";

import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import QueryProvider from "@/providers/QueryProvider";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "ZTD X Clone",
  description: "Next.js social media application project",
};

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <QueryProvider>
        <html lang="en">
          <body>
          <Toaster
              position="top-center"
              richColors
              toastOptions={{
                className: "bg-[#16181c] text-white border border-[#2f3336] rounded-xl shadow-md px-4 py-3",
                style: {
                  backdropFilter: "blur(6px)",
                },
              }}
            />
            {children}
          </body>
        </html>
      </QueryProvider>
    </ClerkProvider>
  );
}