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
  { title: "Introduction", path: "/docs" },
  {
    title: "Getting Started",
    path: "/docs/getting-started",
    children: [
      { title: "Installation", path: "/docs/getting-started/installation" },
      { title: "Configuration", path: "/docs/getting-started/configuration" },
    ],
  },
  { title: "API Reference", path: "/docs/api" },
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
        className={`block py-2 px-4 ${
          isActive ? "bg-gray-200 font-bold" : "hover:bg-gray-100"
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
    <nav className="bg-white border-r border-gray-200 h-full overflow-y-auto">
      <ul className="py-4">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} currentPath={pathname} />
        ))}
      </ul>
    </nav>
  );
};
