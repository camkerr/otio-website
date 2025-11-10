import { ImageResponse } from "next/og";
import { readFile } from "fs/promises";
import { join } from "path";

interface OGImageOptions {
  title: string;
  description?: string;
}

export async function generateOGImage({
  title,
  description,
}: OGImageOptions): Promise<ImageResponse> {
  // Load the icon SVG as a data URL
  const iconPath = join(process.cwd(), "public/icons/open-timeline-io-icon-color.svg");
  const iconData = await readFile(iconPath, "utf8");
  const iconDataUrl = `data:image/svg+xml;base64,${Buffer.from(iconData).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          height: "100%",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          padding: "60px",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Header with logo/icon */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          {/* OTIO Icon */}
          <img
            src={iconDataUrl}
            alt="OTIO Icon"
            style={{
              width: "80px",
              height: "60px",
              objectFit: "contain",
            }}
          />
        </div>

        {/* Main title */}
        <h1
          style={{
            fontSize: "56px",
            fontWeight: "700",
            margin: "0 0 20px 0",
            color: "white",
            lineHeight: "1.3",
            textAlign: "center",
          }}
        >
          {title}
        </h1>

        {/* Description if provided */}
        {description && (
          <p
            style={{
              fontSize: "28px",
              color: "#a0aec0",
              margin: "20px 0 0 0",
              textAlign: "center",
              maxWidth: "90%",
            }}
          >
            {description}
          </p>
        )}

        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "40px",
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            background: "#00d4ff",
            opacity: 0.1,
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "40px",
            width: "80px",
            height: "80px",
            borderRadius: "50%",
            background: "#00d4ff",
            opacity: 0.05,
          }}
        />
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  );
}

