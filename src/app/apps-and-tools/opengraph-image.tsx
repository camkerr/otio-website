import { generateOGImage } from "@/lib/og-image-generator";

export const runtime = "nodejs";
export const alt = "Apps and Tools";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Apps and Tools",
    description: "Discover applications with OpenTimelineIO integration",
  });
}

