import type { Metadata } from "next";
import { Open_Sans } from "next/font/google";
import { TopNav } from "@/components/layout/top-nav";
import { ThemeProvider } from "@/providers/theme-provider";
import { NavWidthProvider } from "@/contexts/nav-width-context";
import { cn } from "@/lib/utils";
import "./globals.css";
import "@docsearch/css";

const openSans = Open_Sans({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OpenTimelineIO",
  description:
    "OpenTimelineIO is an open-source interchange format and API for editorial timeline information, \
    facilitating collaboration and interoperability among various post-production tools",
  icons: {
    icon: [
      { url: '/icons/open-timeline-io-icon-color.svg', type: 'image/svg+xml' },
      { url: '/icons/open-timeline-io-icon-color.png', type: 'image/png' },
    ],
    apple: '/icons/open-timeline-io-icon-color.png',
    shortcut: '/icons/open-timeline-io-icon-color.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background text-foreground antialiased", openSans.className)}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange={false}
        >
          <NavWidthProvider>
          <div className="flex flex-col min-h-screen">
            <TopNav />
            <main className="flex-1 flex flex-col">
              {children}
            </main>
          </div>
          </NavWidthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
