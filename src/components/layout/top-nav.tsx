"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DocSearch } from "@docsearch/react";
import { ModeToggle } from "@/components/layout/dark-mode";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { Menu, Search, Moon, Sun, ChevronRight } from "lucide-react";
import { useNavWidth } from "@/contexts/nav-width-context";
import { motion } from "motion/react";
import { MobileDocsNavWrapper } from "@/components/docs/mobile-docs-nav-wrapper";

export function TopNav() {
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { navWidth } = useNavWidth();
  const pathname = usePathname();
  
  const isDocsPage = pathname?.startsWith('/docs');

  // Avoid hydration mismatch by only rendering theme-dependent content after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Mark that initial render is complete to enable animations
  React.useEffect(() => {
    // Allow animations after a brief moment to prevent initial load jank
    const timer = setTimeout(() => {
      setHasAnimated(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Determine the color mode for DocSearch
  const colorMode = mounted
    ? resolvedTheme === "dark"
      ? "dark"
      : "light"
    : "light";

  const navItems = [
    { href: "/features", label: "Features" },
    { href: "/apps-and-tools", label: "Apps and Tools" },
    { href: "/docs", label: "Documentation" },
  ];

  const getCurrentPageLabel = () => {
    if (!pathname || pathname === '/') return null;
    const item = navItems.find(item => pathname.startsWith(item.href));
    return item?.label || null;
  };

  const currentPageLabel = getCurrentPageLabel();

  const containerClass = navWidth === "full" ? "w-full" : "max-w-7xl";
  const maxWidthValue = navWidth === "full" ? "100%" : "80rem"; // 80rem = max-w-7xl

  return (
    <div className="sticky top-0 z-10 bg-background border-b">
      <motion.div
        className={cn("mx-auto", containerClass)}
        animate={{ maxWidth: maxWidthValue }}
        transition={{ 
          duration: hasAnimated ? 0.2 : 0, 
          ease: "easeInOut" 
        }}
        style={{ width: "100%" }}
      >
        {/* Desktop Navigation */}
        <div
          className="hidden md:grid md:grid-cols-[33%_33%_33%] items-center pl-4 py-4"
        >
          <div className="flex items-center">
            <Link href="/">
              {mounted ? (
                <Image
                  src={resolvedTheme === "dark" ? "/images/OpenTimelineIO@3xLight.png" : "/images/OpenTimelineIO@3xDark.png"}
                  alt="OTIO Logo"
                  width={250}
                  objectFit="contain"
                  height={18}
                />
              ) : (
                <Image
                  src={"/images/OpenTimelineIO@3xDark.png"}
                  alt="OTIO Logo"
                  width={250}
                  objectFit="contain"
                  height={18}
                />
              )}
            </Link>
          </div>
          <div className="flex justify-center"></div>
          <div className="flex justify-end items-center gap-3">
            <NavigationMenu>
              <NavigationMenuList>
                {navItems.map((item) => (
                  <NavigationMenuItem key={item.href}>
                    <NavigationMenuLink asChild>
                      <Link href={item.href} className={navigationMenuTriggerStyle()}>
                        {item.label}
                      </Link>
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                ))}
              </NavigationMenuList>
            </NavigationMenu>
            <div className="DocSearch-Button-Wrapper">
              <DocSearch
                appId="R2IYF7ETH7"
                apiKey="599cec31baffa4868cae4e79f180729b"
                indexName="docsearch"
                placeholder="Search..."
                theme={colorMode}
              />
            </div>
            <Link href="https://github.com/AcademySoftwareFoundation/OpenTimelineIO">
              <Button variant="outline" size="icon">
                {mounted ? (
                  <Image
                    objectFit="contain"
                    width={16}
                    height={16}
                    src={resolvedTheme === "dark" ? "/icons/github/github-mark-white.png" : "/icons/github/github-mark.png"}
                    alt="GitHub"
                  />
                ) : (
                  <Image
                    objectFit="contain"
                    width={16}
                    height={16}
                    src="/icons/github/github-mark.png"
                    alt="GitHub"
                  />
                )}
              </Button>
            </Link>
            <ModeToggle style={{ minWidth: "40px" }} />
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center justify-between p-4 relative">
          {/* Left: Hamburger Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 gap-0">
              <SheetHeader className="px-4 border-b border-border h-(--top-nav-height) flex flex-col justify-center py-0 space-y-0">
                <SheetTitle className="text-left m-0">
                  {currentPageLabel ? (
                    <span className="flex items-center gap-2 text-base">
                      <Link
                        href="/"
                        onClick={() => setIsOpen(false)}
                        className="hover:text-primary transition-colors py-1 -ml-1 px-1 rounded"
                      >
                        Home
                      </Link>
                      <ChevronRight className="h-4 w-4" />
                      <span>{currentPageLabel}</span>
                    </span>
                  ) : (
                    "Home"
                  )}
                </SheetTitle>
              </SheetHeader>
              {isDocsPage ? (
                // Documentation navigation for docs pages
                <div className="flex-1 overflow-hidden">
                  <MobileDocsNavWrapper onClose={() => setIsOpen(false)} />
                </div>
              ) : (
                // Standard navigation for other pages
                <nav className="flex flex-col flex-1">
                  <div className="flex flex-col gap-0 px-6 py-4">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="text-2xl font-medium py-3 hover:text-primary transition-colors"
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </nav>
              )}
              <SheetFooter className="p-0 border-t border-border mt-auto">
                <div
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="w-full flex items-center justify-between pl-4 pr-6 py-4 hover:bg-accent transition-colors cursor-pointer"
                >
                  <span className="text-sm font-medium">Theme</span>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={resolvedTheme === "dark"}
                      onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                      onClick={(e) => e.stopPropagation()}
                    />
                    {resolvedTheme === "dark" ? (
                      <Moon className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <Sun className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </div>
              </SheetFooter>
            </SheetContent>
          </Sheet>

          {/* Center: Logo */}
          <div className="absolute left-1/2 -translate-x-1/2 z-100">
            <Link href="/">
              {mounted ? (
                <Image
                  src={resolvedTheme === "dark" ? "/images/OpenTimelineIO@3xLight.png" : "/images/OpenTimelineIO@3xDark.png"}
                  alt="OTIO Logo"
                  width={150}
                  height={11}
                  priority
                />
              ) : (
                <Image
                  src={"/images/OpenTimelineIO@3xDark.png"}
                  alt="OTIO Logo"
                  width={150}
                  height={11}
                  priority
                />
              )}
            </Link>
          </div>

          {/* Right: Search Icon + GitHub */}
          <div className="flex items-center gap-2 relative z-20">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                // Trigger DocSearch programmatically
                const button = document.querySelector('.DocSearch-Button') as HTMLButtonElement;
                button?.click();
              }}
            >
              <Search className="h-5 w-5" />
            </Button>
            <Link href="https://github.com/AcademySoftwareFoundation/OpenTimelineIO">
              <Button variant="outline" size="icon">
                {mounted ? (
                  <Image
                    objectFit="contain"
                    width={16}
                    height={16}
                    src={resolvedTheme === "dark" ? "/icons/github/github-mark-white.svg" : "/icons/github/github-mark.svg"}
                    alt="GitHub"
                  />
                ) : (
                  <Image
                    objectFit="contain"
                    width={16}
                    height={16}
                    src="/icons/github/github-mark.svg"
                    alt="GitHub"
                  />
                )}
              </Button>
            </Link>
          </div>
        </div>

        {/* Hidden DocSearch for mobile trigger */}
        <div className="hidden">
          <DocSearch
            appId="R2IYF7ETH7"
            apiKey="599cec31baffa4868cae4e79f180729b"
            indexName="docsearch"
            placeholder="Search..."
            theme={colorMode}
          />
        </div>
      </motion.div >
    </div >
  );
}

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
