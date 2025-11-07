import { DocumentationLeftNav } from "@/components/docs/documentation-nav";
import { NavWidthSetter } from "@/components/layout/nav-width-setter";

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NavWidthSetter width="full">
      <div className="flex w-full h-[calc(100vh-73px)]">
        <aside className="sticky top-0 h-[calc(100vh-73px)] w-[280px] md:w-[320px] flex-shrink-0">
          <DocumentationLeftNav />
        </aside>
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </NavWidthSetter>
  );
}
