import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";

const LABS_KEY     = "labtrack_instructor_labs";
const VERSIONS_KEY = "labtrack_versions";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Failed to read ${key}`, e);
    return fallback;
  }
}

export default function HistoryPage() {
  const [labs, setLabs]               = useState([]);
  const [labsWithHistory, setLabsWithHistory] = useState(new Set());

  useEffect(() => {
    const activeLabs = readJson(LABS_KEY, []).filter((l) => l.status === "active");
    const versions   = readJson(VERSIONS_KEY, {});

    // Lab 9 always has history (seed data in HistoryLabPage)
    const withHistory = new Set(
      activeLabs
        .filter((l) => versions[l.id]?.length > 0 || l.id === 9)
        .map((l) => l.id)
    );

    // If no active labs in storage, show the seed lab so the page is not empty
    if (activeLabs.length === 0) {
      setLabs([
        { id: 9,  title: "Lab 9 — Binary Trees",     course: "ICS 202 · SEC 03", dueDate: "Apr 12, 2026" },
        { id: 10, title: "Lab 10 — Graph Traversal",  course: "ICS 202 · SEC 03", dueDate: "Apr 19, 2026" },
        { id: 11, title: "Lab 11 — Hash Tables",      course: "ICS 202 · SEC 03", dueDate: "Apr 26, 2026" },
      ]);
      setLabsWithHistory(new Set([9]));
    } else {
      setLabs(activeLabs.map((l) => ({
        id: l.id,
        title: l.title,
        course: l.courseCode || "Lab Assignment",
        dueDate: l.dueDate
          ? new Date(l.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          : "No due date",
      })));
      setLabsWithHistory(withHistory);
    }
  }, []);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        <div style={{
          borderRadius: 16, border: "1px solid #1a2540",
          background: "#0b1220", padding: "20px 22px",
        }}>
          <div style={{
            fontSize: 10, fontWeight: 600, letterSpacing: "0.1em",
            textTransform: "uppercase", color: "#94a3b8", marginBottom: 8,
          }}>
            Available Labs
          </div>
          <h2 style={{ margin: 0, fontSize: 22, lineHeight: 1.25, fontWeight: 700, color: "#e2e8f0" }}>
            Version History
          </h2>
          <p style={{ margin: "8px 0 0", color: "#9fb2ca", fontSize: 13 }}>
            Pick any lab to inspect version snapshots, compare attempts, and
            restore a previous version into your workspace.
          </p>
        </div>

        <div style={{
          marginTop: 18, display: "grid", gap: 14,
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        }}>
          {labs.map((lab) => {
            const hasHistory = labsWithHistory.has(lab.id);
            return (
              <div key={lab.id} style={{
                background: "#0b1424",
                border: `1px solid ${hasHistory ? "#1f3555" : "#1a2540"}`,
                borderRadius: 16, padding: 18, minHeight: 170,
                display: "flex", flexDirection: "column", justifyContent: "space-between",
              }}>
                <div style={{ width: "100%" }}>
                  <div style={{ marginBottom: 12 }} />
                  <div style={{ fontSize: 17, fontWeight: 700, color: "#e2e8f0" }}>{lab.title}</div>
                  <div style={{ marginTop: 6, color: "#9fb2ca", fontSize: 13 }}>{lab.course}</div>
                  <div style={{ marginTop: 2, color: "#8aa0bc", fontSize: 12 }}>Due {lab.dueDate}</div>
                </div>

                {hasHistory ? (
                  <Link
                    to={`/history/${lab.id}`}
                    style={{
                      marginTop: 16, textDecoration: "none", color: "#e2e8f0",
                      background: "#0369a1", border: "1px solid #0b4f7a",
                      borderRadius: 10, padding: "9px 14px",
                      fontSize: 12, fontWeight: 700, letterSpacing: "0.02em",
                      alignSelf: "flex-start",
                    }}
                  >
                    Open History
                  </Link>
                ) : (
                  <button type="button" disabled style={{
                    marginTop: 16, color: "#64748b", background: "#111b31",
                    border: "1px dashed #334155", borderRadius: 10,
                    padding: "9px 14px", fontSize: 12, fontWeight: 700,
                    cursor: "not-allowed", alignSelf: "flex-start",
                  }}>
                    No History Yet
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
