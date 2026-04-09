import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InstructorLayout from "../../components/layout/InstructorLayout";

const LABS_KEY = "labtrack_instructor_labs";

const STATUS_STYLES = {
  draft: { bg: "rgba(148,163,184,0.12)", text: "#94a3b8", border: "rgba(148,163,184,0.25)" },
  active: { bg: "rgba(34,197,94,0.12)", text: "#4ade80", border: "rgba(34,197,94,0.25)" },
  closed: { bg: "rgba(239,68,68,0.12)", text: "#f87171", border: "rgba(239,68,68,0.25)" },
};

const DIFFICULTY_STYLES = {
  easy: { text: "#4ade80" },
  medium: { text: "#facc15" },
  hard: { text: "#f87171" },
};

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function LabsManagementPage() {
  const navigate = useNavigate();
  const [labs, setLabs] = useState([]);
  const [filter, setFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState(null); // lab id to confirm delete

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(LABS_KEY) || "[]");
    setLabs(stored);
  }, []);

  const filtered = filter === "all" ? labs : labs.filter((l) => l.status === filter);

  const counts = {
    all: labs.length,
    active: labs.filter((l) => l.status === "active").length,
    draft: labs.filter((l) => l.status === "draft").length,
    closed: labs.filter((l) => l.status === "closed").length,
  };

  const handleDelete = (id) => {
    const updated = labs.filter((l) => l.id !== id);
    localStorage.setItem(LABS_KEY, JSON.stringify(updated));
    setLabs(updated);
    setDeleteConfirm(null);
  };

  const handleQuickPublish = (id) => {
    const updated = labs.map((l) =>
      l.id === id ? { ...l, status: "active", updatedAt: new Date().toISOString() } : l,
    );
    localStorage.setItem(LABS_KEY, JSON.stringify(updated));
    setLabs(updated);
  };

  const handleClose = (id) => {
    const updated = labs.map((l) =>
      l.id === id ? { ...l, status: "closed", updatedAt: new Date().toISOString() } : l,
    );
    localStorage.setItem(LABS_KEY, JSON.stringify(updated));
    setLabs(updated);
  };

  const TABS = ["all", "active", "draft", "closed"];

  return (
    <InstructorLayout>
      <div style={{ padding: "28px 32px", minHeight: "100%" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 28,
          }}
        >
          <div>
            <h1
              style={{ fontSize: 22, fontWeight: 700, color: "#e2e8f0", margin: 0 }}
            >
              Lab Management
            </h1>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#64748b" }}>
              Create, manage, and publish lab assignments for your course
            </p>
          </div>
          <button
            onClick={() => navigate("/instructor/labs/create")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 20px",
              background: "linear-gradient(135deg, #06b6d4, #0891b2)",
              border: "none",
              borderRadius: 10,
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: "0 4px 14px rgba(6,182,212,0.3)",
            }}
          >
            <span style={{ fontSize: 16 }}>+</span> Create New Lab
          </button>
        </div>

        {/* Stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 28,
          }}
        >
          {[
            { label: "Total Labs", value: counts.all, icon: "🧪", color: "#22d3ee" },
            { label: "Active", value: counts.active, icon: "✅", color: "#4ade80" },
            { label: "Drafts", value: counts.draft, icon: "📝", color: "#94a3b8" },
            { label: "Closed", value: counts.closed, icon: "🔒", color: "#f87171" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "#0f1b33",
                border: "1px solid #1a2540",
                borderRadius: 14,
                padding: "18px 20px",
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <span style={{ fontSize: 24 }}>{stat.icon}</span>
              <div>
                <div
                  style={{ fontSize: 22, fontWeight: 700, color: stat.color }}
                >
                  {stat.value}
                </div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div
          style={{
            display: "flex",
            gap: 4,
            marginBottom: 20,
            background: "#0a1628",
            border: "1px solid #1a2540",
            borderRadius: 12,
            padding: 4,
            width: "fit-content",
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              style={{
                padding: "7px 16px",
                borderRadius: 9,
                border: "none",
                background: filter === tab ? "#10213f" : "transparent",
                color: filter === tab ? "#e2e8f0" : "#64748b",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.2s",
              }}
            >
              {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span
                style={{
                  marginLeft: 6,
                  fontSize: 11,
                  color: filter === tab ? "#22d3ee" : "#475569",
                }}
              >
                {counts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Labs list */}
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "64px 32px",
              background: "#0f1b33",
              border: "1px dashed #1e3a5f",
              borderRadius: 16,
            }}
          >
            <div style={{ fontSize: 48, marginBottom: 16 }}>🧪</div>
            <h3 style={{ color: "#e2e8f0", margin: "0 0 8px", fontSize: 18 }}>
              {filter === "all" ? "No labs yet" : `No ${filter} labs`}
            </h3>
            <p style={{ color: "#64748b", margin: "0 0 20px", fontSize: 14 }}>
              {filter === "all"
                ? "Create your first lab assignment to get started"
                : `You don't have any ${filter} labs`}
            </p>
            {filter === "all" && (
              <button
                onClick={() => navigate("/instructor/labs/create")}
                style={{
                  padding: "10px 24px",
                  background: "linear-gradient(135deg, #06b6d4, #0891b2)",
                  border: "none",
                  borderRadius: 10,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Create New Lab
              </button>
            )}
          </div>
        ) : (
          <div
            style={{
              background: "#0a1628",
              border: "1px solid #1a2540",
              borderRadius: 16,
              overflow: "hidden",
            }}
          >
            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "60px 1fr 110px 160px 70px 90px 1fr 130px",
                gap: 0,
                padding: "12px 20px",
                borderBottom: "1px solid #1a2540",
                fontSize: 11,
                fontWeight: 700,
                color: "#475569",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
              }}
            >
              <span>#</span>
              <span>Title</span>
              <span>Status</span>
              <span>Due Date</span>
              <span>Pts</span>
              <span>Level</span>
              <span>Languages</span>
              <span>Actions</span>
            </div>

            {filtered.map((lab, i) => {
              const statusStyle = STATUS_STYLES[lab.status] || STATUS_STYLES.draft;
              const diffStyle = DIFFICULTY_STYLES[lab.difficulty] || DIFFICULTY_STYLES.medium;
              const isLast = i === filtered.length - 1;

              return (
                <div
                  key={lab.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr 110px 160px 70px 90px 1fr 130px",
                    gap: 0,
                    padding: "14px 20px",
                    borderBottom: isLast ? "none" : "1px solid #0f1b33",
                    alignItems: "center",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(16,33,63,0.5)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  <span style={{ color: "#475569", fontSize: 13, fontWeight: 600 }}>
                    {lab.labNumber || "—"}
                  </span>
                  <div>
                    <div
                      style={{
                        color: "#e2e8f0",
                        fontSize: 14,
                        fontWeight: 600,
                        marginBottom: 2,
                      }}
                    >
                      {lab.title || "Untitled Lab"}
                    </div>
                    <div style={{ color: "#475569", fontSize: 11 }}>
                      {lab.starterFiles?.length > 0
                        ? `${lab.starterFiles.length} starter file${lab.starterFiles.length > 1 ? "s" : ""}`
                        : "No files"}
                    </div>
                  </div>
                  <span>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        background: statusStyle.bg,
                        color: statusStyle.text,
                        border: `1px solid ${statusStyle.border}`,
                        textTransform: "capitalize",
                      }}
                    >
                      {lab.status}
                    </span>
                  </span>
                  <span style={{ color: "#94a3b8", fontSize: 12 }}>
                    {formatDate(lab.dueDate)}
                  </span>
                  <span style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>
                    {lab.points || 0}
                  </span>
                  <span
                    style={{
                      color: diffStyle.text,
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: "capitalize",
                    }}
                  >
                    {lab.difficulty || "medium"}
                  </span>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {(lab.languages || []).slice(0, 3).map((lang) => (
                      <span
                        key={lang}
                        style={{
                          padding: "2px 8px",
                          borderRadius: 6,
                          fontSize: 11,
                          background: "rgba(34,211,238,0.1)",
                          color: "#22d3ee",
                          border: "1px solid rgba(34,211,238,0.2)",
                        }}
                      >
                        {lang}
                      </span>
                    ))}
                    {(lab.languages || []).length > 3 && (
                      <span style={{ fontSize: 11, color: "#475569" }}>
                        +{lab.languages.length - 3}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => navigate(`/instructor/labs/${lab.id}/edit`)}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 7,
                        border: "1px solid #1e3a5f",
                        background: "transparent",
                        color: "#94a3b8",
                        fontSize: 12,
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      Edit
                    </button>
                    {lab.status === "draft" && (
                      <button
                        onClick={() => handleQuickPublish(lab.id)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 7,
                          border: "none",
                          background: "rgba(34,211,238,0.15)",
                          color: "#22d3ee",
                          fontSize: 12,
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Publish
                      </button>
                    )}
                    {lab.status === "active" && (
                      <button
                        onClick={() => handleClose(lab.id)}
                        style={{
                          padding: "5px 10px",
                          borderRadius: 7,
                          border: "none",
                          background: "rgba(239,68,68,0.12)",
                          color: "#f87171",
                          fontSize: 12,
                          cursor: "pointer",
                          fontWeight: 600,
                        }}
                      >
                        Close
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteConfirm(lab.id)}
                      style={{
                        padding: "5px 8px",
                        borderRadius: 7,
                        border: "1px solid rgba(239,68,68,0.2)",
                        background: "transparent",
                        color: "#f87171",
                        fontSize: 13,
                        cursor: "pointer",
                      }}
                    >
                      🗑
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            style={{
              background: "#0f1b33",
              border: "1px solid #1e3a5f",
              borderRadius: 16,
              padding: 32,
              width: 380,
            }}
          >
            <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
            <h3 style={{ color: "#e2e8f0", margin: "0 0 8px", fontSize: 17 }}>
              Delete Lab?
            </h3>
            <p style={{ color: "#64748b", margin: "0 0 24px", fontSize: 14 }}>
              This action cannot be undone. All lab data including files and
              settings will be permanently deleted.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                style={{
                  padding: "9px 20px",
                  borderRadius: 9,
                  border: "1px solid #1e3a5f",
                  background: "transparent",
                  color: "#94a3b8",
                  fontSize: 14,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                style={{
                  padding: "9px 20px",
                  borderRadius: 9,
                  border: "none",
                  background: "linear-gradient(135deg, #ef4444, #dc2626)",
                  color: "#fff",
                  fontSize: 14,
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                Delete Lab
              </button>
            </div>
          </div>
        </div>
      )}
    </InstructorLayout>
  );
}
