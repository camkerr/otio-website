import { generateOGImage } from "@/lib/og-image-generator";

export const runtime = "nodejs";
export const alt = "Documentation";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Documentation",
    description: "Complete guides and API reference",
  });
}

