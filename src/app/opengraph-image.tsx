import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Rift — Cross-chain crypto swaps";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#000000",
          color: "#ffffff",
          padding: "72px 80px",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 28,
              height: 28,
              border: "2px solid rgba(255,255,255,0.85)",
              borderRadius: 2,
            }}
          />
          <span
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: "-0.04em",
            }}
          >
            Rift
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              letterSpacing: "-0.05em",
              lineHeight: 1.02,
            }}
          >
            Enter one side.
            <br />
            Exit another.
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#9a9a9a",
              letterSpacing: "-0.02em",
            }}
          >
            Cross-chain swaps, wallet to wallet.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 28,
            color: "#767676",
            fontSize: 22,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          <span>200+ assets</span>
          <span>Cross-chain</span>
          <span>rft.money</span>
        </div>
      </div>
    ),
    size,
  );
}
