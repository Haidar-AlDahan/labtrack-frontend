import { useNavigate } from "react-router-dom";

export default function TopBar({ title, lastSaved = null, course = null }) {
  const navigate = useNavigate();

  const bg1 = "#080f1e";
  const bg2 = "#0b1424";
  const border = "#1a2540";
  const accent = "#22d3ee";
  const muted = "#8898b3";
  const dimmed = "#4a5568";

  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        height: 52,
        background: bg1,
        borderBottom: `1px solid ${border}`,
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            background: "none",
            border: "none",
            color: accent,
            fontSize: 18,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "-0.5px",
          }}
        >
          LabTrack
        </button>
        <span style={{ color: border, fontSize: 18 }}>›</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>
          {title}
        </span>
      </div>
      <span style={{ fontSize: 11, color: dimmed }}>
        {lastSaved ? `Last saved at ${lastSaved}` : "Auto-saves every 30s"}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {course && (
          <span
            style={{
              background: bg2,
              border: `1px solid ${border}`,
              borderRadius: 20,
              padding: "4px 12px",
              fontSize: 12,
              color: muted,
            }}
          >
            {course}
          </span>
        )}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#22d3ee,#0369a1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 700,
            color: "#fff",
            cursor: "pointer",
          }}
        >
          M
        </div>
      </div>
    </header>
  );
}
