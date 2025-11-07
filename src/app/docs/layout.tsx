import { DocumentationLeftNav } from "@/components/docs/documentation-nav";
import { NavWidthSetter } from "@/components/layout/nav-width-setter";

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NavWidthSetter width="full">
      <div className="flex w-full h-[calc(100vh-(--top-nav-height))]">
        {/* Hide sidebar on mobile, show only on desktop */}
        <aside className="hidden md:block sticky top-0 h-[calc(100vh-(--top-nav-height))] w-[280px] md:w-[320px] shrink-0">
          <DocumentationLeftNav />
        </aside>
        <main className="flex-1 overflow-y-auto" data-docs-scroll-container>
          {children}
        </main>
      </div>
    </NavWidthSetter>
  );
}
