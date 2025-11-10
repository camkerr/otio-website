import { generateOGImage } from "@/lib/og-image-generator";

export const runtime = "nodejs";
export const alt = "Contributors";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function Image() {
  return generateOGImage({
    title: "Contributors",
    description: "Built by the community",
  });
}

