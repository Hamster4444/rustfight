import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

// Simple flat favicon: purple rounded square with the RF monogram.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#8b5cf6",
          borderRadius: 7,
          color: "#ffffff",
          fontSize: 16,
          fontWeight: 800,
          fontFamily: "Arial, sans-serif",
          letterSpacing: -1,
        }}
      >
        RF
      </div>
    ),
    size
  );
}
