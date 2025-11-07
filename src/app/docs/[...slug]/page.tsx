import { notFound } from 'next/navigation';
import { getDocContent, getEditUrl, getDocMetadata } from '@/lib/github-docs';
import { generateDocsManifest, findDocBySlug, getPreviousNextDocs } from '@/lib/docs-manifest';
import { convertRstToMarkdown, extractTitle } from '@/lib/rst-converter';
import { extractH1Title } from '@/lib/markdown-utils';
import { Document } from '@/components/docs/document';

interface DocPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  try {
    const manifest = await generateDocsManifest();
    
    // Convert all doc slugs to the format Next.js expects
    return manifest.allDocs.map((doc) => ({
      slug: doc.slug.split('/'),
    }));
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({ params }: DocPageProps) {
  const { slug } = await params;
  const slugPath = slug.join('/');
  
  try {
    const manifest = await generateDocsManifest();
    const doc = findDocBySlug(manifest, slugPath);
    
    if (!doc) {
      return {
        title: 'Documentation Not Found',
      };
    }
    
    const rawContent = await getDocContent(doc.githubPath);
    const title = extractTitle(rawContent);
    
    return {
      title: `${title} | OpenTimelineIO Documentation`,
      description: `OpenTimelineIO documentation: ${title}`,
    };
  } catch (error) {
    return {
      title: 'Documentation | OpenTimelineIO',
    };
  }
}

export default async function DocPage({ params }: DocPageProps) {
  const { slug } = await params;
  const slugPath = slug.join('/');
  
  // Handle empty slug (shouldn't happen, but just in case)
  if (!slugPath || slugPath.trim() === '') {
    notFound();
  }
  
  try {
    // Get the manifest to find the doc
    const manifest = await generateDocsManifest();
    
    const doc = findDocBySlug(manifest, slugPath);
    
    if (!doc) {
      notFound();
    }
    
    // Fetch the content and metadata in parallel
    const [rawContent, metadata] = await Promise.all([
      getDocContent(doc.githubPath),
      getDocMetadata(doc.githubPath),
    ]);
    
    const markdown = doc.githubPath.endsWith('.md') 
      ? rawContent 
      : convertRstToMarkdown(rawContent);
    const editUrl = getEditUrl(doc.githubPath);
    
    // Extract h1 title from markdown
    const { title, content } = extractH1Title(markdown);
    
    // Get previous and next documents
    const { previous, next } = getPreviousNextDocs(manifest, slugPath);
    
    return (
      <div className="px-4 pb-4">
        <div className="w-full mx-auto">
          <div className="max-w-7xl mx-auto px-4">
            <Document 
              markdown={content} 
              title={title} 
              metadata={metadata} 
              editUrl={editUrl}
              previous={previous}
              next={next}
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}

