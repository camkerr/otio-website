import { generateOGImage } from "@/lib/og-image-generator";

export const runtime = "nodejs";
export const alt = "Tutorials";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Tutorials",
    description: "Learn by doing with practical examples",
  });
}

