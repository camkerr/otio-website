import { LeftNav } from "@/components/ui/documentation-nav";
import { NavWidthSetter } from "@/components/layout/nav-width-setter";

export default function DocsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <NavWidthSetter width="full">
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "2fr 4fr 8fr",
        width: "100%",
        height: "calc(100vh - 73px)",
      }}
    >
      <LeftNav />
      {children}
    </div>
    </NavWidthSetter>
  );
}
