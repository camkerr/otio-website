import { LeftNav } from "@/components/ui/documentation-nav";
export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 4fr 8fr",
        width: "100%",
        height: "calc(100vh - 65px)",
      }}
    >
      <LeftNav />
      {children}
    </div>
  );
}
