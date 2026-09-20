import { ImageResponse } from "next/og";

/**
 * Generated favicon, replacing the create-next-app default.
 *
 * Kept deliberately simple — a single bold letter on a solid ground. At 32px
 * (and 16px once the browser scales it) anything more detailed turns to mush.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

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
          background: "#4f46e5",
          color: "#ffffff",
          fontSize: 22,
          fontWeight: 700,
          borderRadius: 7,
        }}
      >
        T
      </div>
    ),
    size,
  );
}
