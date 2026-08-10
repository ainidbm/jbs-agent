/** Lightweight skeleton placeholders — no dependency on antd Skeleton. */

export function KpiSkeleton() {
  return (
    <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            flex: "1 1 200px",
            minWidth: 180,
            height: 120,
            borderRadius: 8,
            background: "#fafafa",
            border: "1px solid #f0f0f0",
            padding: "20px 24px",
          }}
        >
          <div style={{ width: 60, height: 18, borderRadius: 4, background: "#eee" }} />
          <div style={{ width: 120, height: 32, borderRadius: 4, background: "#f0f0f0", marginTop: 12 }} />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton({ height = 360 }: { height?: number }) {
  return (
    <div
      style={{
        height,
        borderRadius: 8,
        background: "linear-gradient(90deg, #fafafa 25%, #f5f5f5 50%, #fafafa 75%)",
        backgroundSize: "200% 100%",
        animation: "shimmer 1.5s infinite",
        marginBottom: 24,
      }}
    />
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 36,
            borderRadius: 6,
            background: i === 0 ? "#f0f0f0" : "#fafafa",
            width: i === 0 ? "100%" : `${85 + Math.random() * 15}%`,
          }}
        />
      ))}
    </div>
  );
}
