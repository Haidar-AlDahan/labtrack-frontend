import { Link } from "react-router-dom";
import SideBar from "../../components/layout/SideBar";
import TopBar from "../../components/layout/TopBar";

const LABS = [
  {
    id: 9,
    title: "Lab 9 - Binary Trees",
    course: "ICS 202 - SEC 03",
    dueDate: "Apr 12, 2026",
    status: "In Progress",
  },
  {
    id: 10,
    title: "Lab 10 - Graph Traversal",
    course: "ICS 202 - SEC 03",
    dueDate: "Apr 19, 2026",
    status: "Not Started",
  },
  {
    id: 11,
    title: "Lab 11 - Hash Tables",
    course: "ICS 202 - SEC 03",
    dueDate: "Apr 26, 2026",
    status: "Locked",
  },
];

export default function LabsPage() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "#050b18",
        color: "#e2e8f0",
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        overflow: "hidden",
      }}
    >
      <TopBar title="My Labs" lastSaved={null} course="ICS 202 - SEC 03" />

      <SideBar>
        <div style={{ flex: 1, overflow: "auto", padding: 24 }}>
          <div style={{ maxWidth: 920, margin: "0 auto" }}>
            <h2 style={{ margin: "0 0 14px", fontSize: 22, fontWeight: 700 }}>
              Available Labs
            </h2>
            <p style={{ margin: "0 0 18px", color: "#94a3b8", fontSize: 13 }}>
              Choose your lab and click "Open" to start working on it. Make sure to submit
            </p>

            <div style={{ display: "grid", gap: 12 }}>
              {LABS.map((lab) => (
                <div
                  key={lab.id}
                  style={{
                    background: "#0b1424",
                    border: "1px solid #1a2540",
                    borderRadius: 12,
                    padding: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>
                      {lab.title}
                    </div>
                    <div
                      style={{ color: "#94a3b8", fontSize: 12, marginTop: 4 }}
                    >
                      {lab.course} • Due {lab.dueDate}
                    </div>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: 10 }}
                  >
                    <span style={{ fontSize: 12, color: "#94a3b8" }}>
                      {lab.status}
                    </span>
                    <Link
                      to={`/labs/${lab.id}`}
                      style={{
                        textDecoration: "none",
                        color: "#e2e8f0",
                        background: "#0369a1",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 12,
                        fontWeight: 600,
                      }}
                    >
                      Open
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SideBar>
    </div>
  );
}
