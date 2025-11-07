import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { TopNav } from "@/components/layout/top-nav";
import { ThemeProvider } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";
import "./globals.css";
import "@docsearch/css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenTimelineIO",
  description:
    "OpenTimelineIO is an open-source interchange format and API for editorial timeline information, \
    facilitating collaboration and interoperability among various post-production tools",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background text-foreground antialiased", inter.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <div className="flex flex-col min-h-screen">
            <TopNav />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
