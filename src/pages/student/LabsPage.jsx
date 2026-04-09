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

export default function LabsPage() {
  return (
    <DashboardLayout>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <h2 style={{ margin: "0 0 14px", fontSize: 22, fontWeight: 700 }}>
          Available Labs
        </h2>

        <p style={{ margin: "0 0 18px", color: "#94a3b8", fontSize: 13 }}>
          Choose your lab and click "Open" to start working on it.
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
              }}
            >
              <div>
                <div style={{ fontSize: 15, fontWeight: 600 }}>
                  {lab.title}
                </div>
                <div style={{ color: "#94a3b8", fontSize: 12 }}>
                  {lab.course} • Due {lab.dueDate}
                </div>
              </div>

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
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
