import { generateDocsManifest } from '@/lib/docs-manifest';
import { getNavStructure } from '@/lib/docs-manifest';
import { DocumentationNavClient } from './documentation-nav-client';

export async function DocumentationLeftNav() {
  try {
    const manifest = await generateDocsManifest();
    const navItems = getNavStructure(manifest);
    
    return <DocumentationNavClient navItems={navItems} />;
  } catch (error) {
    // Fallback to basic nav
    return (
      <DocumentationNavClient
        navItems={[
          { title: 'Documentation', path: '/docs' },
          {
            title: 'ReadTheDocs Reference',
            path: 'https://opentimelineio.readthedocs.io/en/latest/',
            external: true,
          },
        ]}
      />
    );
  }
}
