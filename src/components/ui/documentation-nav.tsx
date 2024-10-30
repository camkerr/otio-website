"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  title: string;
  path: string;
  children?: NavItem[];
}

const navItems: NavItem[] = [
  // { title: "Introduction", path: "/docs" },
  {
    title: "Tutorial",
    path: "/docs",
    // children: [
    //   { title: "Installation", path: "/docs/getting-started/installation" },
    //   { title: "Configuration", path: "/docs/getting-started/configuration" },
    // ],
  },
  { title: "Python API", path: "/docs/python" },
  { title: "OTIO Schema Reference", path: "/docs/reference/schema" },
  { title: "Examples", path: "/docs/examples" },
];

const NavItem = ({
  item,
  currentPath,
}: {
  item: NavItem;
  currentPath: string;
}) => {
  const [isOpen, setIsOpen] = useState(currentPath.startsWith(item.path));
  const isActive = currentPath === item.path;

  return (
    <li>
      <Link
        href={item.path}
        className={`block py-2 px-4 transition-colors ${
          isActive 
            ? "bg-accent text-accent-foreground font-bold" 
            : "hover:bg-accent/50"
        }`}
        onClick={() => item.children && setIsOpen(!isOpen)}
      >
        {item.title}
      </Link>
      {item.children && isOpen && (
        <ul className="pl-4">
          {item.children.map((child) => (
            <NavItem key={child.path} item={child} currentPath={currentPath} />
          ))}
        </ul>
      )}
    </li>
  );
};

export const LeftNav = () => {
  const pathname = usePathname();

  return (
    <nav className="bg-background border-r border-border h-full overflow-y-auto">
      <ul className="py-4">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} currentPath={pathname} />
        ))}
      </ul>
    </nav>
  );
};
