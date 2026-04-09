import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function fileIcon(name) {
  if (name.endsWith(".py")) return "🐍";
  if (name.endsWith(".md")) return "📄";
  return "📋";
}

export default function SideBar({
  children,
  files = null,
  activeFile = null,
  onFileSelect = null,
}) {
  const navigate = useNavigate();
  const location = useLocation();
  const [hoveredNav, setHoveredNav] = useState(null);

  const navItems = [
    { label: "Dashboard", icon: "🧭", path: "/dashboard" },
    { label: "My Labs", icon: "🧪", path: "/labs", matchPaths: ["/labs"] },
    { label: "Peer Review", icon: "💬", path: "/peer-review" },
    { label: "Grades", icon: "📊", path: "/grades" },
    { label: "History", icon: "🕐", path: "/history" },
  ];

  const bg1 = "#080f1e";
  const border = "#1a2540";
  const accent = "#22d3ee";
  const muted = "#8898b3";
  const dimmed = "#4a5568";

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      {/* ── Left Nav ── */}
      <aside
        style={{
          width: 188,
          minWidth: 188,
          background: bg1,
          borderRight: `1px solid ${border}`,
          display: "flex",
          flexDirection: "column",
          padding: 0,
        }}
      >
        <div
          style={{
            height: 46,
            padding: "0 20px",
            borderBottom: `1px solid ${border}`,
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: dimmed,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Navigation
          </span>
        </div>
        <nav
          style={{ padding: "12px 0 8px", flex: 1 }}
          onMouseLeave={() => setHoveredNav(null)}
        >
          {navItems.map((item) => {
            const matchedPaths = item.matchPaths ?? [item.path];
            const isActive = matchedPaths.some(
              (path) =>
                location.pathname === path ||
                location.pathname.startsWith(`${path}/`),
            );
            const isHighlighted = isActive || hoveredNav === item.label;

            return (
              <button
                key={item.label}
                onClick={() => navigate(item.path)}
                onMouseEnter={() => setHoveredNav(item.label)}
                onMouseLeave={() => setHoveredNav(null)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "9px 20px",
                  background: isHighlighted ? "#0d1e3a" : "none",
                  border: "none",
                  borderLeft: `2px solid ${isHighlighted ? accent : "transparent"}`,
                  color: isHighlighted ? "#e2e8f0" : muted,
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Files (optional) */}
        {files && files.length > 0 && (
          <div style={{ borderTop: `1px solid ${border}`, padding: "12px 0" }}>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: dimmed,
                letterSpacing: "0.1em",
                padding: "0 20px 8px",
                textTransform: "uppercase",
              }}
            >
              Files
            </p>
            {files.map((f) => (
              <button
                key={f}
                onClick={() => onFileSelect && onFileSelect(f)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "6px 20px",
                  background: activeFile === f ? "#0d1e3a" : "none",
                  borderLeft:
                    activeFile === f
                      ? `2px solid ${accent}`
                      : "2px solid transparent",
                  border: "none",
                  borderRight: "none",
                  borderTop: "none",
                  borderBottom: "none",
                  color: activeFile === f ? "#e2e8f0" : "#6b7a99",
                  fontSize: 12,
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <span style={{ fontSize: 13 }}>{fileIcon(f)}</span>
                {f}
              </button>
            ))}
          </div>
        )}
      </aside>

      {/* ── Content ── */}
      {children}
    </div>
  );
}
