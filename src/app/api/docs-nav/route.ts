import { NextResponse } from 'next/server';
import { generateDocsManifest, getNavStructure } from '@/lib/docs-manifest';

export async function GET() {
  try {
    const manifest = await generateDocsManifest();
    const navItems = getNavStructure(manifest);
    
    return NextResponse.json({ navItems });
  } catch (error) {
    console.error('Error generating docs nav:', error);
    
    // Return fallback nav items
    return NextResponse.json({
      navItems: [
        { title: 'Documentation', path: '/docs' },
        {
          title: 'ReadTheDocs Reference',
          path: 'https://opentimelineio.readthedocs.io/en/latest/',
          external: true,
        },
      ],
    });
  }
}

