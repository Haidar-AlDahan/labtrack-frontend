import { Link } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";

const LABS = [
  {
    id: 9,
    title: "Lab 9 - Binary Trees",
    course: "ICS 202 - SEC 03",
    dueDate: "Apr 12, 2026",
  },
  {
    id: 10,
    title: "Lab 10 - Graph Traversal",
    course: "ICS 202 - SEC 03",
    dueDate: "Apr 19, 2026",
  },
  {
    id: 11,
    title: "Lab 11 - Hash Tables",
    course: "ICS 202 - SEC 03",
    dueDate: "Apr 26, 2026",
  },
];

const LABS_WITH_HISTORY = new Set([9]);

export default function HistoryPage() {
  return (
    <DashboardLayout>
      <div
        style={{
          maxWidth: 1080,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            borderRadius: 16,
            border: "1px solid #1a2540",
            background: "#0b1220",
            padding: "20px 22px",
          }}
        >
          <div
            style={{
              fontSize: 10,
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#94a3b8",
              marginBottom: 8,
            }}
          >
            Available Labs
          </div>

          <h2
            style={{
              margin: 0,
              fontSize: 22,
              lineHeight: 1.25,
              fontWeight: 700,
              color: "#e2e8f0",
            }}
          >
            Version History 
          </h2>

          <p
            style={{
              margin: "8px 0 0",
              color: "#9fb2ca",
              fontSize: 13,
            }}
          >
            Pick any lab to inspect version snapshots, compare attempts, and
            restore a previous versions into your workspace.
          </p>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gap: 14,
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          }}
        >
          {LABS.map((lab) => {
            const hasHistory = LABS_WITH_HISTORY.has(lab.id);

            return (
              <div
                key={lab.id}
                style={{
                  background: "#0b1424",
                  border: `1px solid ${hasHistory ? "#1f3555" : "#1a2540"}`,
                  borderRadius: 16,
                  padding: 18,
                  minHeight: 170,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "none",
                }}
              >
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      marginBottom: 12,
                    }}
                  />

                  <div
                    style={{ fontSize: 17, fontWeight: 700, color: "#e2e8f0" }}
                  >
                    {lab.title}
                  </div>

                  <div
                    style={{
                      marginTop: 6,
                      color: "#9fb2ca",
                      fontSize: 13,
                    }}
                  >
                    {lab.course}
                  </div>

                  <div
                    style={{
                      marginTop: 2,
                      color: "#8aa0bc",
                      fontSize: 12,
                    }}
                  >
                    Due {lab.dueDate}
                  </div>
                </div>

                {hasHistory ? (
                  <Link
                    to={`/history/${lab.id}`}
                    style={{
                      marginTop: 16,
                      textDecoration: "none",
                      color: "#e2e8f0",
                      background: "#0369a1",
                      border: "1px solid #0b4f7a",
                      borderRadius: 10,
                      padding: "9px 14px",
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: "0.02em",
                      alignSelf: "flex-start",
                    }}
                  >
                    Open History
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    style={{
                      marginTop: 16,
                      color: "#64748b",
                      background: "#111b31",
                      border: "1px dashed #334155",
                      borderRadius: 10,
                      padding: "9px 14px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "not-allowed",
                      alignSelf: "flex-start",
                    }}
                  >
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
