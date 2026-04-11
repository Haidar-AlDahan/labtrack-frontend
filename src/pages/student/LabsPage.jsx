import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";

const LABS_KEY     = "labtrack_instructor_labs";
const COURSES_KEY  = "labtrack_courses";
const PROGRESS_KEY = "labtrack_student_progress";

// ─── Storage helpers ──────────────────────────────────────────────────────────
function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Failed to read ${key} from localStorage`, e);
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Failed to write ${key} to localStorage`, e);
  }
}

// ─── Seed demo progress so the page is not empty on first load ────────────────
function seedProgress(uid) {
  const all = readJson(PROGRESS_KEY, {});
  if (all[uid]) return;
  all[uid] = {
    9:  { status: "submitted",  submittedAt: "2026-04-01T22:14:00Z", score: 60 },
    10: { status: "in_progress", submittedAt: null, score: null },
  };
  writeJson(PROGRESS_KEY, all);
}

function getProgress(uid) {
  return readJson(PROGRESS_KEY, {})[uid] || {};
}

function getStoredLabs() {
  return readJson(LABS_KEY, []).filter((l) => l.status === "active");
}

function getEnrolledCourses(user) {
  const courses = readJson(COURSES_KEY, []);
  const uid = user.id || user.email;
  return courses.filter((c) =>
    c.sections?.some((s) => s.enrolledStudentIds?.includes(uid))
  );
}

// ─── Deadline helpers ─────────────────────────────────────────────────────────
function parseDeadline(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

function deadlineLabel(deadline) {
  return deadline.toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

// "overdue" | "soon" (< 48 h) | "ok"
function deadlineStatus(deadline) {
  if (!deadline) return "ok";
  const ms = deadline.getTime() - Date.now();
  if (ms < 0)             return "overdue";
  if (ms < 48 * 3600000) return "soon";
  return "ok";
}

function resolveLabStatus(labId, progress) {
  return progress[labId]?.status ?? "not_started";
}

// ─── Lookup tables ────────────────────────────────────────────────────────────
const STATUS_META = {
  not_started: { label: "Not Started", color: "#8898b3", bg: "rgba(136,152,179,0.1)", border: "rgba(136,152,179,0.2)" },
  in_progress:  { label: "In Progress", color: "#fbbf24", bg: "rgba(251,191,36,0.1)",  border: "rgba(251,191,36,0.2)"  },
  submitted:    { label: "Submitted",   color: "#60a5fa", bg: "rgba(96,165,250,0.1)",  border: "rgba(96,165,250,0.2)"  },
  graded:       { label: "Graded",      color: "#34d399", bg: "rgba(52,211,153,0.1)",  border: "rgba(52,211,153,0.2)"  },
};

const OPEN_LABEL = {
  not_started: "Start Lab",
  in_progress:  "Continue",
  submitted:    "View Submission",
  graded:       "View Feedback",
};

const FILTERS = ["all", "not_started", "in_progress", "submitted", "graded"];

// ─── Style tokens ─────────────────────────────────────────────────────────────
const card   = "#0b1424";
const border = "#1a2540";
const accent = "#22d3ee";
const muted  = "#8898b3";
const dimmed = "#4a5568";
const danger = "#f87171";
const warn   = "#fbbf24";

// ─── Derived card-border colour ───────────────────────────────────────────────
function cardBorderColor(ds) {
  if (ds === "overdue") return "#f87171";
  if (ds === "soon")    return "#fbbf24";
  return border;
}

function deadlineLabelColor(ds) {
  if (ds === "overdue") return danger;
  if (ds === "soon")    return warn;
  return muted;
}

function deadlinePrefix(ds) {
  if (ds === "overdue") return "⚠ Overdue · ";
  if (ds === "soon")    return "⏰ Due soon · ";
  return "";
}

function scoreColor(score) {
  if (score >= 90) return "#34d399";
  if (score >= 60) return warn;
  return danger;
}

function completionBarColor(pct) {
  if (pct >= 80) return "#34d399";
  if (pct >= 40) return warn;
  return accent;
}

// ─── Lab card ─────────────────────────────────────────────────────────────────
function LabCard({ lab, statusEntry, deadline, onOpen }) {
  const labStatus = statusEntry?.status ?? "not_started";
  const meta      = STATUS_META[labStatus] ?? STATUS_META.not_started;
  const ds        = deadlineStatus(deadline);
  const score     = statusEntry?.score ?? null;
  const isGraded  = labStatus === "graded";

  return (
    <div style={{
      background: card,
      border: `1px solid ${cardBorderColor(ds)}`,
      borderRadius: 14,
      padding: "18px 20px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
    }}>
      {/* Top row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }}>
        <div style={{ minWidth: 0 }}>
          {lab.labNumber && (
            <div style={{ fontSize: 10, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>
              Lab {lab.labNumber}
            </div>
          )}
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0", marginBottom: 3 }}>{lab.title}</div>
          <div style={{ fontSize: 12, color: muted }}>
            {lab.languages?.join(", ") || "Python"} · {lab.points ?? "—"} pts
          </div>
        </div>
        <span style={{
          background: meta.bg, color: meta.color, border: `1px solid ${meta.border}`,
          borderRadius: 7, fontSize: 10, fontWeight: 700,
          padding: "3px 9px", textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0,
        }}>
          {meta.label}
        </span>
      </div>

      {/* Due date row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontSize: 12 }}>
          {deadline ? (
            <span style={{ color: deadlineLabelColor(ds) }}>
              {deadlinePrefix(ds)}Due {deadlineLabel(deadline)}
            </span>
          ) : (
            <span style={{ color: dimmed }}>No due date</span>
          )}
        </div>
        {isGraded && score !== null && (
          <span style={{ fontSize: 13, fontWeight: 700, color: scoreColor(score) }}>
            {score}/100
          </span>
        )}
      </div>

      {/* Open button */}
      <button type="button" onClick={onOpen} style={{
        background: isGraded ? "transparent" : accent,
        border: isGraded ? `1px solid ${border}` : "none",
        borderRadius: 9,
        color: isGraded ? muted : "#081018",
        fontSize: 12, fontWeight: 700, padding: "9px 0",
        cursor: "pointer", width: "100%",
      }}>
        {OPEN_LABEL[labStatus] ?? "Open Lab"}
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function LabsPage() {
  const navigate = useNavigate();
  const [labs, setLabs]               = useState([]);
  const [progress, setProgress]       = useState({});
  const [courses, setCourses]         = useState([]);
  const [filter, setFilter]           = useState("all");
  const [courseFilter, setCourseFilter] = useState("all");
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const user = readJson("currentUser", {});
    const uid  = user.id || user.email || "guest";

    seedProgress(uid);

    const storedLabs = getStoredLabs();
    storedLabs.sort((a, b) => {
      const da = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const db = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return da - db;
    });

    setLabs(storedLabs);
    setProgress(getProgress(uid));
    setCourses(getEnrolledCourses(user));
    setLoading(false);
  }, []);

  const filtered = useMemo(() =>
    labs.filter((lab) => {
      if (filter === "all") return true;
      return resolveLabStatus(lab.id, progress) === filter;
    }),
  [labs, filter, progress]);

  const counts = useMemo(() => {
    const c = { all: labs.length };
    FILTERS.slice(1).forEach((f) => {
      c[f] = labs.filter((l) => resolveLabStatus(l.id, progress) === f).length;
    });
    return c;
  }, [labs, progress]);

  const completedCount = (counts.submitted ?? 0) + (counts.graded ?? 0);
  const completionPct  = labs.length > 0 ? Math.round((completedCount / labs.length) * 100) : 0;

  const overdueCount = labs.filter((l) => {
    const d = parseDeadline(l.dueDate);
    return d && d < new Date() && resolveLabStatus(l.id, progress) === "not_started";
  }).length;

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 960, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <h2 style={{ margin: "0 0 6px", fontSize: 22, fontWeight: 700, color: "#e2e8f0" }}>My Labs</h2>
          <p style={{ margin: 0, color: muted, fontSize: 13 }}>
            All active lab assignments — sorted by due date
          </p>
        </div>

        {/* Enrolled courses strip */}
        {courses.length > 0 && (
          <div style={{ marginBottom: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button type="button" onClick={() => setCourseFilter("all")} style={{
              background: courseFilter === "all" ? "#1e3a5f" : "transparent",
              border: `1px solid ${courseFilter === "all" ? accent : border}`,
              borderRadius: 8, color: courseFilter === "all" ? "#e2e8f0" : muted,
              fontSize: 12, fontWeight: 600, padding: "6px 14px", cursor: "pointer",
            }}>All Courses</button>
            {courses.map((c) => (
              <button key={c.id} type="button" onClick={() => setCourseFilter(c.id)} style={{
                background: courseFilter === c.id ? "#1e3a5f" : "transparent",
                border: `1px solid ${courseFilter === c.id ? accent : border}`,
                borderRadius: 8, color: courseFilter === c.id ? "#e2e8f0" : muted,
                fontSize: 12, fontWeight: 600, padding: "6px 14px", cursor: "pointer",
              }}>{c.courseCode} — {c.name}</button>
            ))}
          </div>
        )}

        {/* Stats + completion bar */}
        <div style={{
          background: card, border: `1px solid ${border}`, borderRadius: 14,
          padding: "16px 20px", marginBottom: 20,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20,
        }}>
          <div style={{ display: "flex", gap: 28 }}>
            {[
              { label: "Total Active", value: labs.length,        color: accent   },
              { label: "Completed",    value: completedCount,     color: "#34d399" },
              { label: "In Progress",  value: counts.in_progress ?? 0, color: warn },
              { label: "Overdue",      value: overdueCount,       color: danger   },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div style={{ fontSize: 11, color: muted, marginBottom: 3 }}>{label}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, maxWidth: 240 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12 }}>
              <span style={{ color: muted }}>Overall completion</span>
              <span style={{ color: "#e2e8f0", fontWeight: 700 }}>{completedCount}/{labs.length} labs</span>
            </div>
            <div style={{ height: 8, borderRadius: 4, background: "#0f1b33", overflow: "hidden" }}>
              <div style={{
                height: "100%", width: `${completionPct}%`,
                background: completionBarColor(completionPct),
                borderRadius: 4, transition: "width 0.4s ease",
              }} />
            </div>
          </div>
        </div>

        {/* Status filter pills */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {FILTERS.map((f) => {
            const isActive = filter === f;
            const meta     = f === "all" ? null : STATUS_META[f];
            let btnBg     = "transparent";
            let btnBorder = border;
            let btnColor  = muted;
            if (isActive) {
              btnBg     = meta ? meta.bg     : "#1e3a5f";
              btnBorder = meta ? meta.border : accent;
              btnColor  = meta ? meta.color  : "#e2e8f0";
            }
            return (
              <button key={f} type="button" onClick={() => setFilter(f)} style={{
                background: btnBg, border: `1px solid ${btnBorder}`,
                borderRadius: 8, padding: "7px 14px", cursor: "pointer",
                color: btnColor, fontSize: 12, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <span style={{ textTransform: "capitalize" }}>
                  {f === "all" ? "All" : STATUS_META[f].label}
                </span>
                <span style={{
                  background: isActive ? "rgba(255,255,255,0.15)" : "#0f1b33",
                  borderRadius: 5, fontSize: 10, fontWeight: 700,
                  padding: "1px 6px", color: isActive ? "inherit" : dimmed,
                }}>{counts[f] ?? 0}</span>
              </button>
            );
          })}
        </div>

        {/* Lab list */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "48px 0", color: muted }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
            Loading labs…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            background: card, border: `1px solid ${border}`, borderRadius: 14,
            padding: "48px 0", textAlign: "center",
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>🧪</div>
            <div style={{ fontSize: 14, color: muted, marginBottom: 6 }}>
              {labs.length === 0 ? "No labs assigned yet" : "No labs match this filter"}
            </div>
            <div style={{ fontSize: 12, color: dimmed }}>
              {labs.length === 0
                ? "Your instructor has not published any labs yet"
                : "Try selecting a different status filter"}
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {filtered.map((lab) => (
              <div key={lab.id}>
                {LabCard({
                  lab,
                  statusEntry: progress[lab.id],
                  deadline: parseDeadline(lab.dueDate),
                  onOpen: () => navigate(`/labs/${lab.id}`),
                })}
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
