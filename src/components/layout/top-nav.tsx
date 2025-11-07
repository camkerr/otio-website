"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
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
import { Menu, Search, Moon, Sun } from "lucide-react";
import { useNavWidth } from "@/contexts/nav-width-context";
import { motion } from "motion/react";

export function TopNav() {
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);
  const [hasAnimated, setHasAnimated] = React.useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const { navWidth } = useNavWidth();

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
            <SheetContent side="left" className="flex flex-col">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col flex-1">
                <div className="flex flex-col gap-0 px-6">
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
              <SheetFooter className="p-0">
                <button
                  onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-accent transition-colors"
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
                </button>
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
