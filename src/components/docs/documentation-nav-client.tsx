"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  ChevronDown,
  ExternalLink,
  GraduationCap,
  Rocket,
  Search,
  Workflow,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  path: string;
  external?: boolean;
  children?: NavItem[];
}

interface DocumentationNavClientProps {
  navItems: NavItem[];
}

const SECTION_ICONS: Record<string, LucideIcon> = {
  "Quick Start": Rocket,
  Tutorials: GraduationCap,
  "Use Cases": Workflow,
  "API Reference": BookOpen,
};

function getSectionIcon(title: string): LucideIcon {
  return SECTION_ICONS[title] ?? BookOpen;
}

function deepCloneNavItem(item: NavItem): NavItem {
  return {
    ...item,
    children: item.children?.map(deepCloneNavItem),
  };
}

function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.external) {
    return false;
  }

  if (pathname === item.path) {
    return true;
  }

  if (pathname.startsWith(`${item.path}/`)) {
    return true;
  }

  return Boolean(item.children?.some((child) => isNavItemActive(child, pathname)));
}

function createInitialOpenState(items: NavItem[], pathname: string): Record<string, boolean> {
  const state: Record<string, boolean> = {};

  const visit = (item: NavItem) => {
    if (item.children?.length) {
      state[item.path] = isNavItemActive(item, pathname);
      item.children.forEach(visit);
    }
  };

  items.forEach(visit);
  return state;
}

function filterNavItems(items: NavItem[], query: string): NavItem[] {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return items;
  }

  const filterItem = (item: NavItem, depth = 0): NavItem | null => {
    const matches = item.title.toLowerCase().includes(normalized);
    const filteredChildren = item.children
      ?.map((child) => filterItem(child, depth + 1))
      .filter((child): child is NavItem => child !== null);

    if (matches) {
      if (depth === 0 && item.children?.length) {
        return {
          ...item,
          children: item.children.map(deepCloneNavItem),
        };
      }

      return {
        ...item,
        children: filteredChildren,
      };
    }

    if (filteredChildren && filteredChildren.length > 0) {
      return {
        ...item,
        children: filteredChildren,
      };
    }

    return null;
  };

  return items
    .map((item) => filterItem(item))
    .filter((item): item is NavItem => item !== null);
}

export function DocumentationNavClient({ navItems }: DocumentationNavClientProps) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    createInitialOpenState(navItems, pathname),
  );
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const filteredNav = useMemo(() => filterNavItems(navItems, query), [navItems, query]);

  useEffect(() => {
    if (query.trim()) {
      return;
    }

    setOpenSections((previous) => {
      const next = createInitialOpenState(navItems, pathname);
      const sameLength = Object.keys(previous).length === Object.keys(next).length;
      const sameValues = sameLength && Object.keys(next).every((key) => previous[key] === next[key]);

      return sameLength && sameValues ? previous : next;
    });
  }, [navItems, pathname, query]);

  useEffect(() => {
    if (!query.trim()) {
      return;
    }

    setOpenSections((previous) => {
      let changed = false;
      const next = { ...previous };

      filteredNav.forEach((item) => {
        if (item.children?.length && !next[item.path]) {
          next[item.path] = true;
          changed = true;
        }
      });

      return changed ? next : previous;
    });
  }, [filteredNav, query]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSectionClick = (event: React.MouseEvent<HTMLAnchorElement>, item: NavItem) => {
    const hasChildren = Boolean(item.children?.length);
    const isModifiedClick = event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

    if (!hasChildren || item.external || isModifiedClick) {
      return;
    }

    event.preventDefault();

    setOpenSections((previous) => ({
      ...previous,
      [item.path]: !previous[item.path],
    }));
  };

  const handleNestedToggle = (path: string) => {
    setOpenSections((previous) => ({
      ...previous,
      [path]: !previous[path],
    }));
  };

  const renderChildren = (items: NavItem[], depth = 0) => (
    <ul
      className={cn(
        "mt-2 space-y-1",
        depth > 0 && "ml-3 border-l border-border/60 pl-3",
      )}
    >
      {items.map((child) => {
        const hasChildren = Boolean(child.children?.length);
        const isActive = isNavItemActive(child, pathname);
        const isOpen = hasChildren ? openSections[child.path] ?? isActive : false;

        if (child.external) {
          return (
            <li key={child.path}>
              <a
                href={child.path}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <span className="flex h-2.5 w-2.5 items-center justify-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-border" />
                </span>
                <span className="flex-1 truncate">{child.title}</span>
                <ExternalLink className="h-4 w-4 opacity-60" />
              </a>
            </li>
          );
        }

        return (
          <li key={child.path}>
            <Link
              href={child.path}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition-colors",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
              onClick={(event) => {
                const isModifiedClick =
                  event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0;

                if (hasChildren && !isModifiedClick) {
                  event.preventDefault();
                  handleNestedToggle(child.path);
                }
              }}
            >
              <span className="flex-1 truncate text-left">{child.title}</span>
              {hasChildren && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 text-muted-foreground transition-transform",
                    isOpen && "rotate-180",
                  )}
                />
              )}
            </Link>
            <AnimatePresence initial={false}>
              {hasChildren && isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  style={{ overflow: "hidden" }}
                >
                  {renderChildren(child.children!, depth + 1)}
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );

  return (
    <nav className="border-b border-border/60 bg-muted/40 text-foreground md:h-full md:border-b-0 md:border-r">
      <div className="flex flex-col md:h-full">
        <div className="space-y-4 border-b border-border/60 px-4 py-4">
          {/* <Link href="/docs" className="flex items-center gap-3">
            <span className="flex flex-col leading-tight">
              <span className="text-sm font-semibold">OpenTimelineIO</span>
              <span className="text-xs text-muted-foreground">Documentation</span>
            </span>
          </Link> */}
          <Input
            ref={searchInputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search documentation"
            prefix={<Search className="h-4 w-4" />}
            aria-label="Search documentation"
            className="pl-8"
          />
        </div>
        <ScrollArea className="md:flex-1">
          <div className="space-y-2 px-4 py-6">
            {filteredNav.length === 0 ? (
              <p className="px-2 text-sm text-muted-foreground">No matches found.</p>
            ) : (
              filteredNav.map((item) => {
                const Icon = getSectionIcon(item.title);
                const isActive = isNavItemActive(item, pathname);
                const isOpen = item.children?.length ? openSections[item.path] ?? isActive : false;

                return (
                  <div key={item.path} className="overflow-hidden">
                    <Link
                      href={item.path}
                      className={cn(
                        "flex items-center gap-3 px-2 py-2 text-sm font-semibold transition-colors rounded-lg",
                        item.external
                          ? "text-foreground hover:bg-muted/60"
                          : isActive
                            ? "text-primary"
                            : "text-foreground hover:bg-muted/60",
                      )}
                      onClick={(event) => handleSectionClick(event, item)}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-left">{item.title}</span>
                      {item.external ? (
                        <ExternalLink className="h-4 w-4 opacity-60" />
                      ) : item.children?.length ? (
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            isOpen && "rotate-180",
                          )}
                        />
                      ) : null}
                    </Link>
                    <AnimatePresence initial={false}>
                      {item.children && isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                          className="px-2 pb-3"
                        >
                          {renderChildren(item.children)}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
    </nav>
  );
}

