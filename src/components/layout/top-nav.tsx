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
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DocSearch } from "@docsearch/react";
import { ModeToggle } from "@/components/layout/dark-mode";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import { Menu, Search } from "lucide-react";

const components: { title: string; href: string; description: string }[] = [
  {
    title: "Alert Dialog",
    href: "/docs/primitives/alert-dialog",
    description:
      "A modal dialog that interrupts the user with important content and expects a response.",
  },
  {
    title: "Hover Card",
    href: "/docs/primitives/hover-card",
    description:
      "For sighted users to preview content available behind a link.",
  },
  {
    title: "Progress",
    href: "/docs/primitives/progress",
    description:
      "Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.",
  },
  {
    title: "Scroll-area",
    href: "/docs/primitives/scroll-area",
    description: "Visually or semantically separates content.",
  },
  {
    title: "Tabs",
    href: "/docs/primitives/tabs",
    description:
      "A set of layered sections of content—known as tab panels—that are displayed one at a time.",
  },
  {
    title: "Tooltip",
    href: "/docs/primitives/tooltip",
    description:
      "A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.",
  },
];

export function TopNav() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isOpen, setIsOpen] = React.useState(false);

  // Avoid hydration mismatch by only rendering theme-dependent content after mount
  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Determine the color mode for DocSearch
  const colorMode = mounted
    ? resolvedTheme === "dark"
      ? "dark"
      : "light"
    : "light";

  const navItems = [
    { href: "/features", label: "Features" },
    { href: "/tools-and-apps", label: "Apps and Tools" },
    { href: "/docs", label: "Documentation" },
  ];

  return (
    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
      {/* Desktop Navigation */}
      <div className="hidden md:grid md:grid-cols-[33%_33%_33%] items-center p-4">
        <div className="flex items-center">
          <Link href="/">
            <Image
              src={"/images/OpenTimelineIO@3xLight.png"}
              className="absolute scale-0 dark:scale-100"
              alt="OTIO Logo"
              width={250}
              objectFit="contain"
              height={18}
            />
            <Image
              src={"/images/OpenTimelineIO@3xDark.png"}
              alt="OTIO Logo"
              className="scale-100 dark:scale-0"
              width={250}
              objectFit="contain"
              height={18}
            />
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
              <Image
                objectFit="contain"
                width={16}
                height={16}
                className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                src="/icons/github/github-mark.png"
                alt="GitHub"
              />
              <Image
                objectFit="contain"
                width={16}
                height={16}
                className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                src="/icons/github/github-mark-white.png"
                alt="GitHub"
              />
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
          <SheetContent side="left">
            <SheetHeader>
              <SheetTitle>Menu</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-lg hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 border-t">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Theme:</span>
                  <ModeToggle />
                </div>
              </div>
            </nav>
          </SheetContent>
        </Sheet>

        {/* Center: Logo */}
        <div className="absolute left-1/2 -translate-x-1/2 z-100">
          <Link href="/">
            <Image
              src={"/images/OpenTimelineIO@3xLight.png"}
              className="absolute scale-0 dark:scale-100"
              alt="OTIO Logo"
              width={150}
              height={11}
              priority
            />
            <Image
              src={"/images/OpenTimelineIO@3xDark.png"}
              alt="OTIO Logo"
              className="scale-100 dark:scale-0"
              width={150}
              height={11}
              priority
            />
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
              <Image
                objectFit="contain"
                width={16}
                height={16}
                className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
                src="/icons/github/github-mark.png"
                alt="GitHub"
              />
              <Image
                objectFit="contain"
                width={16}
                height={16}
                className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
                src="/icons/github/github-mark-white.png"
                alt="GitHub"
              />
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
    </div>
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
