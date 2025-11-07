"use client";

import { useEffect, useState } from 'react';
import { MobileDocsNav } from './mobile-docs-nav';

interface NavItem {
  title: string;
  path: string;
  external?: boolean;
  children?: NavItem[];
}

interface MobileDocsNavWrapperProps {
  onClose?: () => void;
}

const fallbackNavItems: NavItem[] = [
  { title: 'Documentation', path: '/docs' },
  {
    title: 'ReadTheDocs Reference',
    path: 'https://opentimelineio.readthedocs.io/en/latest/',
    external: true,
  },
];

export function MobileDocsNavWrapper({ onClose }: MobileDocsNavWrapperProps) {
  const [navItems, setNavItems] = useState<NavItem[]>(fallbackNavItems);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNavItems() {
      try {
        const response = await fetch('/api/docs-nav');
        const data = await response.json();
        setNavItems(data.navItems || fallbackNavItems);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching nav items:', error);
        setNavItems(fallbackNavItems);
        setLoading(false);
      }
    }

    fetchNavItems();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return <MobileDocsNav navItems={navItems} onClose={onClose} />;
}

