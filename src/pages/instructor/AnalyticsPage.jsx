import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import InstructorLayout from "../../components/layout/InstructorLayout";

const LABS_KEY = "labtrack_instructor_labs";
const SUBS_KEY = "labtrack_submissions";
const TOTAL_STUDENTS = 12; // matches mock data

// ── tiny chart helpers (pure CSS/SVG, no library) ────────────────────────────

/** Score-distribution histogram: buckets 0-9,10-19,...,90-100 */
function Histogram({ scores, maxScore }) {
  const BUCKETS = 10;
  const counts = Array(BUCKETS).fill(0);
  scores.forEach((s) => {
    const pct = maxScore > 0 ? Math.round((s / maxScore) * 100) : 0;
    const idx = Math.min(Math.floor(pct / 10), BUCKETS - 1);
    counts[idx]++;
  });
  const peak = Math.max(...counts, 1);
  const labels = ["0-9","10-19","20-29","30-39","40-49","50-59","60-69","70-79","80-89","90-100"];
  const barColor = (i) => {
    if (i <= 4) return "#f87171";
    if (i <= 6) return "#facc15";
    return "#4ade80";
  };

  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 80, padding: "0 4px" }}>
      {counts.map((c, i) => (
        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
          <span style={{ fontSize: 9, color: "#475569" }}>{c > 0 ? c : ""}</span>
          <div style={{ width: "100%", height: `${(c / peak) * 60}px`, minHeight: c > 0 ? 4 : 0, background: barColor(i), borderRadius: "3px 3px 0 0", transition: "height 0.4s" }} />
          <span style={{ fontSize: 8, color: "#334155", transform: "rotate(-35deg)", transformOrigin: "top left", whiteSpace: "nowrap", marginLeft: 4 }}>{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

/** Submission timeline: dots by hour over last 48h */
function Timeline({ submissions }) {
  const NOW   = Date.now();
  const HOURS = 48;
  const buckets = Array(HOURS).fill(0);
  submissions.forEach((s) => {
    if (!s.submittedAt) return;
    const diffH = Math.floor((NOW - new Date(s.submittedAt).getTime()) / 3_600_000);
    if (diffH >= 0 && diffH < HOURS) buckets[HOURS - 1 - diffH]++;
  });
  const peak = Math.max(...buckets, 1);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 48 }}>
        {buckets.map((c, i) => (
          <div key={i} title={`${c} submission${c !== 1 ? "s" : ""}`} style={{
            flex: 1, height: `${Math.max((c / peak) * 44, c > 0 ? 4 : 0)}px`,
            background: c > 0 ? "linear-gradient(180deg,#06b6d4,#0891b2)" : "#1a2540",
            borderRadius: "2px 2px 0 0", transition: "height 0.3s",
          }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
        <span style={{ fontSize: 10, color: "#334155" }}>48h ago</span>
        <span style={{ fontSize: 10, color: "#334155" }}>Now</span>
      </div>
    </div>
  );
}

/** Donut-style progress ring */
function Ring({ pct, size = 72, stroke = 8, color = "#22d3ee", label }) {
  const r   = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#1a2540" strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dasharray 0.5s ease" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 800, color, lineHeight: 1 }}>{pct}%</span>
        {label && <span style={{ fontSize: 9, color: "#475569", marginTop: 2 }}>{label}</span>}
      </div>
    </div>
  );
}

// ── helpers ──────────────────────────────────────────────────────────────────
const avg = (arr) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
const fmtPct = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0);

function fmtRelative(iso) {
  if (!iso) return "—";
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
  if (diff < 1) return "Just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}

function StatCard({ icon, label, value, sub, color = "#e2e8f0" }) {
  return (
    <div style={{ background: "#0f1b33", border: "1px solid #1a2540", borderRadius: 13, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14 }}>
      <span style={{ fontSize: 24 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
        <div style={{ fontSize: 11, color: "#475569", marginTop: 3 }}>{label}</div>
        {sub && <div style={{ fontSize: 10, color: "#334155", marginTop: 1 }}>{sub}</div>}
      </div>
    </div>
  );
}

// ── main component ────────────────────────────────────────────────────────────
export default function AnalyticsPage() {
  const navigate = useNavigate();

  const [labs, setLabs]       = useState([]);
  const [allSubs, setAllSubs] = useState({}); // { labId: [sub, ...] }
  const [selectedLab, setSelectedLab] = useState(null); // null = course view
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [sinceUpdate, setSinceUpdate] = useState("Just now");
  const [loading, setLoading] = useState(true);

  // ── load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const labList   = JSON.parse(localStorage.getItem(LABS_KEY) || "[]");
    const subsStore = JSON.parse(localStorage.getItem(SUBS_KEY) || "{}");
    const subs = {};
    labList.forEach((l) => {
      subs[l.id] = Object.values(subsStore[l.id] || {});
    });
    setLabs(labList);
    setAllSubs(subs);
    setLastUpdated(new Date());
    setLoading(false);
  }, []);

  // countdown
  useEffect(() => {
    const iv = setInterval(() => {
      const diff = Math.floor((Date.now() - lastUpdated.getTime()) / 1000);
      if (diff < 5) setSinceUpdate("Just now");
      else if (diff < 60) setSinceUpdate(`${diff}s ago`);
      else setSinceUpdate(`${Math.floor(diff / 60)}m ago`);
    }, 5000);
    setSinceUpdate("Just now");
    return () => clearInterval(iv);
  }, [lastUpdated]);

  // ── PDF export (simulated) ─────────────────────────────────────────────────
  const handlePdfExport = () => {
    const lines = [
      "LabTrack Analytics Report",
      `Generated: ${new Date().toLocaleString()}`,
      "",
      `Total Labs: ${labs.length}`,
      `Total Students: ${TOTAL_STUDENTS}`,
      "",
      ...labs.map((l) => {
        const subs = allSubs[l.id] || [];
        const graded = subs.filter((s) => s.score !== null);
        const scores = graded.map((s) => s.score);
        return `Lab ${l.labNumber || "?"}: ${l.title} — avg ${avg(scores) ?? "n/a"}/${l.points || 100}, ${subs.filter((s) => s.status === "submitted" || s.status === "graded").length} submitted`;
      }),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "analytics_report.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  // ── course-level aggregates ────────────────────────────────────────────────
  const activeLabs    = labs.filter((l) => l.status === "active" || l.status === "closed");
  const allSubsFlat   = activeLabs.flatMap((l) => allSubs[l.id] || []);
  const gradedFlat    = allSubsFlat.filter((s) => s.score !== null);
  const submittedFlat = allSubsFlat.filter((s) => s.status === "submitted" || s.status === "graded");
  const onTimeFlat    = submittedFlat.filter((s) => !s.late);
  const avgScoreAll   = avg(gradedFlat.map((s) => s.score));
  const submissionRate = fmtPct(submittedFlat.length, TOTAL_STUDENTS * Math.max(activeLabs.length, 1));
  const onTimeRate    = fmtPct(onTimeFlat.length, Math.max(submittedFlat.length, 1));

  // "at risk" = low avg score or 2+ labs not submitted
  const studentRisk = {};
  MOCK_STUDENTS_ANALYTICS.forEach((st) => {
    let missedCount = 0;
    let scores = [];
    activeLabs.forEach((l) => {
      const sub = (allSubs[l.id] || []).find((s) => s.studentId === st.id);
      if (!sub || sub.status === "not_started") missedCount++;
      else if (sub.score !== null) scores.push(fmtPct(sub.score, l.points || 100));
    });
    const avgPct = avg(scores);
    if (missedCount >= 2 || (avgPct !== null && avgPct < 50)) {
      studentRisk[st.id] = { ...st, missedCount, avgPct, reason: missedCount >= 2 ? `${missedCount} labs not submitted` : `Avg score ${avgPct}%` };
    }
  });
  const atRiskStudents = Object.values(studentRisk);

  // ── per-lab row data ───────────────────────────────────────────────────────
  const labRows = activeLabs.map((l) => {
    const subs    = allSubs[l.id] || [];
    const subCount = subs.filter((s) => s.status === "submitted" || s.status === "graded").length;
    const graded  = subs.filter((s) => s.score !== null);
    const scores  = graded.map((s) => s.score);
    const avgPts  = avg(scores);
    const avgPct  = avgPts !== null ? fmtPct(avgPts, l.points || 100) : null;
    const lateCount = subs.filter((s) => s.late).length;
    const tcPassRates = (l.testCases || []).map((tc) => {
      const passing = subs.filter((s) => s.testResults?.find((t) => t.id === tc.id && t.status === "pass")).length;
      return { ...tc, passRate: fmtPct(passing, Math.max(subCount, 1)) };
    });
    const lowTc = tcPassRates.filter((t) => t.passRate < 40);
    return { lab: l, subCount, avgPts, avgPct, lateCount, scores, tcPassRates, lowTc };
  });

  // ── detail view for selected lab ───────────────────────────────────────────
  const detail = selectedLab ? labRows.find((r) => r.lab.id === selectedLab) : null;
  const detailSubs = selectedLab ? (allSubs[selectedLab] || []) : [];
  const detailScores = detailSubs.filter((s) => s.score !== null).map((s) => s.score);

  if (loading) {
    return (
      <InstructorLayout>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", flexDirection: "column", gap: 16 }}>
          <div style={{ width: 32, height: 32, border: "3px solid #1a2540", borderTopColor: "#22d3ee", borderRadius: "50%", animation: "an-spin 0.8s linear infinite" }} />
          <span style={{ color: "#475569", fontSize: 14 }}>Loading analytics…</span>
          <style>{`@keyframes an-spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </InstructorLayout>
    );
  }

  return (
    <InstructorLayout>
      <style>{`@keyframes an-spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ padding: "28px 32px", minHeight: "100%" }}>

        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            {selectedLab && (
              <button onClick={() => setSelectedLab(null)} style={{ background: "transparent", border: "1px solid #1a2540", borderRadius: 8, color: "#64748b", padding: "5px 10px", cursor: "pointer", fontSize: 12, marginBottom: 8, display: "block" }}>
                ← Course Overview
              </button>
            )}
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>
              {selectedLab ? detail?.lab.title || "Lab Analytics" : "Class Performance Analytics"}
            </h1>
            <p style={{ margin: "3px 0 0", fontSize: 12, color: "#475569" }}>
              Analytics updated {sinceUpdate}
              {activeLabs.length === 0 && <span style={{ marginLeft: 8, color: "#334155" }}>· No active labs yet</span>}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {atRiskStudents.length > 0 && !selectedLab && (
              <span style={{ padding: "6px 12px", borderRadius: 20, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", color: "#f87171", fontSize: 12, fontWeight: 700 }}>
                ⚠ {atRiskStudents.length} at-risk students
              </span>
            )}
            <button
              onClick={handlePdfExport}
              style={{ padding: "8px 16px", borderRadius: 9, border: "1px solid #1e3a5f", background: "transparent", color: "#94a3b8", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
            >
              ⬇ Export Report
            </button>
          </div>
        </div>

        {activeLabs.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 32px", background: "#0f1b33", border: "1px dashed #1e3a5f", borderRadius: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
            <h3 style={{ color: "#e2e8f0", margin: "0 0 8px", fontSize: 17 }}>No data available yet</h3>
            <p style={{ color: "#64748b", margin: "0 0 20px", fontSize: 14 }}>Publish a lab and collect submissions to see analytics.</p>
            <button onClick={() => navigate("/instructor/labs")} style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#06b6d4,#0891b2)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              Go to Labs
            </button>
          </div>
        ) : !selectedLab ? (
          /* ════════════════════ COURSE OVERVIEW ════════════════════ */
          <>
            {/* Course stats */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
              <StatCard icon="🎓" label="Avg Score" value={avgScoreAll !== null ? `${avgScoreAll}` : "—"} sub="across all graded labs" color={avgScoreAll !== null ? (avgScoreAll / 100 >= 0.7 ? "#4ade80" : "#facc15") : "#64748b"} />
              <StatCard icon="📤" label="Submissions" value={submittedFlat.length} sub={`${submissionRate}% rate`} color="#22d3ee" />
              <StatCard icon="⏱" label="On-time Rate" value={`${onTimeRate}%`} sub={`${onTimeFlat.length} on time`} color={onTimeRate >= 70 ? "#4ade80" : "#facc15"} />
              <StatCard icon="🧪" label="Active Labs" value={activeLabs.length} sub={`${labs.length} total`} color="#a78bfa" />
            </div>

            {/* Rings row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 24 }}>
              {[
                { label: "Submission Rate", pct: submissionRate, color: "#22d3ee" },
                { label: "On-time Rate",    pct: onTimeRate,     color: "#4ade80" },
                { label: "Completion",      pct: fmtPct(gradedFlat.length, Math.max(submittedFlat.length, 1)), color: "#a78bfa" },
              ].map((r) => (
                <div key={r.label} style={{ background: "#0f1b33", border: "1px solid #1a2540", borderRadius: 13, padding: "18px", display: "flex", alignItems: "center", gap: 18 }}>
                  <Ring pct={r.pct} color={r.color} />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0" }}>{r.label}</div>
                    <div style={{ fontSize: 12, color: "#475569", marginTop: 4 }}>
                      {r.label === "Completion" ? `${gradedFlat.length} graded / ${submittedFlat.length} submitted` : `${r.pct}% of expected submissions`}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Lab-by-lab breakdown */}
            <div style={{ background: "#0a1628", border: "1px solid #1a2540", borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
              <div style={{ padding: "12px 18px", borderBottom: "1px solid #1a2540", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>Lab-by-Lab Breakdown</span>
                <span style={{ fontSize: 11, color: "#475569" }}>Click a row for detailed analytics</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "60px 1fr 100px 160px 90px 80px 90px", padding: "9px 18px", borderBottom: "1px solid #1a2540", fontSize: 10, fontWeight: 700, color: "#475569", letterSpacing: "0.07em", textTransform: "uppercase" }}>
                <span>#</span><span>Title</span><span>Submitted</span><span>Avg Score</span><span>Late</span><span>Issues</span><span>View</span>
              </div>
              {labRows.map((row, idx) => {
                const isLast = idx === labRows.length - 1;
                const avgColor = row.avgPct === null ? "#475569" : row.avgPct >= 70 ? "#4ade80" : row.avgPct >= 50 ? "#facc15" : "#f87171";
                const hasIssue = row.avgPct !== null && row.avgPct < 50 || row.lowTc.length > 0;
                return (
                  <div
                    key={row.lab.id}
                    onClick={() => setSelectedLab(row.lab.id)}
                    style={{ display: "grid", gridTemplateColumns: "60px 1fr 100px 160px 90px 80px 90px", padding: "13px 18px", alignItems: "center", borderBottom: isLast ? "none" : "1px solid #0f1b33", cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(16,33,63,0.6)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <span style={{ color: "#475569", fontWeight: 700, fontSize: 13 }}>{row.lab.labNumber || "—"}</span>
                    <div>
                      <div style={{ color: "#e2e8f0", fontSize: 13, fontWeight: 600 }}>{row.lab.title}</div>
                      <div style={{ color: "#334155", fontSize: 11, marginTop: 1 }}>{row.lab.difficulty} · {row.lab.points || 100} pts</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>{row.subCount} / {TOTAL_STUDENTS}</div>
                      <div style={{ height: 3, background: "#1a2540", borderRadius: 99, marginTop: 4, overflow: "hidden" }}>
                        <div style={{ width: `${fmtPct(row.subCount, TOTAL_STUDENTS)}%`, height: "100%", background: "#22d3ee", borderRadius: 99 }} />
                      </div>
                    </div>
                    <div>
                      {row.avgPts !== null ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 56, height: 4, background: "#1a2540", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ width: `${row.avgPct}%`, height: "100%", background: avgColor, borderRadius: 99 }} />
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 700, color: avgColor }}>{row.avgPts}/{row.lab.points || 100}</span>
                        </div>
                      ) : <span style={{ color: "#334155", fontSize: 12 }}>No data</span>}
                    </div>
                    <span style={{ fontSize: 12, color: row.lateCount > 0 ? "#fb923c" : "#475569" }}>
                      {row.lateCount > 0 ? `⚠ ${row.lateCount}` : "0"}
                    </span>
                    <span>
                      {hasIssue
                        ? <span style={{ fontSize: 11, color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "2px 7px" }}>Review</span>
                        : <span style={{ fontSize: 11, color: "#4ade80" }}>✓ OK</span>}
                    </span>
                    <span style={{ fontSize: 12, color: "#22d3ee" }}>Details →</span>
                  </div>
                );
              })}
            </div>

            {/* At-risk students */}
            {atRiskStudents.length > 0 && (
              <div style={{ background: "#0a1628", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 14, overflow: "hidden", marginBottom: 24 }}>
                <div style={{ padding: "12px 18px", borderBottom: "1px solid rgba(239,68,68,0.15)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f87171" }}>⚠ Students at Risk ({atRiskStudents.length})</span>
                  <button style={{ padding: "5px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.25)", background: "rgba(239,68,68,0.07)", color: "#f87171", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    Email All
                  </button>
                </div>
                {atRiskStudents.map((st, idx) => (
                  <div key={st.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 18px", borderBottom: idx < atRiskStudents.length - 1 ? "1px solid #0f1b33" : "none" }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>{st.name}</div>
                      <div style={{ fontSize: 11, color: "#475569" }}>{st.email}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 12, color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "2px 9px" }}>
                        {st.reason}
                      </span>
                      {st.avgPct !== null && (
                        <span style={{ fontSize: 12, color: st.avgPct >= 50 ? "#facc15" : "#f87171", fontWeight: 700 }}>
                          {st.avgPct}% avg
                        </span>
                      )}
                      <button style={{ padding: "4px 10px", borderRadius: 7, border: "1px solid #1e3a5f", background: "transparent", color: "#64748b", fontSize: 11, cursor: "pointer" }}>
                        Email
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : detail ? (
          /* ════════════════════ LAB DETAIL VIEW ════════════════════ */
          <>
            {/* Lab stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 24 }}>
              <StatCard icon="📤" label="Submitted" value={`${detail.subCount}/${TOTAL_STUDENTS}`} sub={`${fmtPct(detail.subCount, TOTAL_STUDENTS)}% rate`} color="#22d3ee" />
              <StatCard icon="🏆" label="Avg Score"
                value={detail.avgPts !== null ? `${detail.avgPts}/${detail.lab.points || 100}` : "—"}
                sub={detail.avgPct !== null ? `${detail.avgPct}%` : "No graded submissions"}
                color={detail.avgPct !== null ? (detail.avgPct >= 70 ? "#4ade80" : detail.avgPct >= 50 ? "#facc15" : "#f87171") : "#64748b"} />
              <StatCard icon="⏰" label="Late Submissions" value={detail.lateCount} sub={`${fmtPct(detail.lateCount, Math.max(detail.subCount, 1))}% of submitted`} color={detail.lateCount > 0 ? "#fb923c" : "#4ade80"} />
              <StatCard icon="🧪" label="Test Cases" value={detail.lab.testCases?.length || 0} sub={`${detail.lowTc.length} low pass-rate`} color={detail.lowTc.length > 0 ? "#f87171" : "#4ade80"} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
              {/* Score distribution */}
              <div style={{ background: "#0f1b33", border: "1px solid #1a2540", borderRadius: 14, padding: "18px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 16 }}>Score Distribution</div>
                {detailScores.length === 0 ? (
                  <div style={{ color: "#334155", fontSize: 12, textAlign: "center", padding: "24px 0" }}>No graded submissions yet</div>
                ) : (
                  <Histogram scores={detailScores} maxScore={detail.lab.points || 100} />
                )}
                {detailScores.length > 0 && (
                  <div style={{ display: "flex", justifyContent: "space-around", marginTop: 24, paddingTop: 12, borderTop: "1px solid #1a2540" }}>
                    {[
                      { label: "Min", value: Math.min(...detailScores) },
                      { label: "Avg", value: avg(detailScores) },
                      { label: "Max", value: Math.max(...detailScores) },
                    ].map((s) => (
                      <div key={s.label} style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 17, fontWeight: 800, color: "#22d3ee" }}>{s.value}</div>
                        <div style={{ fontSize: 10, color: "#475569", marginTop: 2 }}>{s.label}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submission timeline */}
              <div style={{ background: "#0f1b33", border: "1px solid #1a2540", borderRadius: 14, padding: "18px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>Submission Timeline</div>
                <div style={{ fontSize: 11, color: "#475569", marginBottom: 14 }}>Last 48 hours</div>
                <Timeline submissions={detailSubs.filter((s) => s.submittedAt)} />
              </div>
            </div>

            {/* Test case pass rates */}
            {detail.tcPassRates.length > 0 && (
              <div style={{ background: "#0f1b33", border: "1px solid #1a2540", borderRadius: 14, padding: "18px", marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0" }}>Test Case Pass Rates</span>
                  {detail.lowTc.length > 0 && (
                    <span style={{ fontSize: 12, color: "#f87171", background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: 6, padding: "3px 9px" }}>
                      ⚠ {detail.lowTc.length} test{detail.lowTc.length !== 1 ? "s" : ""} below 40% — consider revising
                    </span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {detail.tcPassRates.map((tc, i) => {
                    const barColor = tc.passRate >= 70 ? "#4ade80" : tc.passRate >= 40 ? "#facc15" : "#f87171";
                    return (
                      <div key={tc.id || i}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>{tc.description || `Test ${i + 1}`}</span>
                          <span style={{ fontSize: 12, fontWeight: 700, color: barColor }}>{tc.passRate}%</span>
                        </div>
                        <div style={{ height: 5, background: "#1a2540", borderRadius: 99, overflow: "hidden" }}>
                          <div style={{ width: `${tc.passRate}%`, height: "100%", background: barColor, borderRadius: 99, transition: "width 0.4s" }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Common errors */}
            <div style={{ background: "#0f1b33", border: "1px solid #1a2540", borderRadius: 14, padding: "18px", marginBottom: 24 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#e2e8f0", marginBottom: 14 }}>Most Common Submission Patterns</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { pattern: "Off-by-one error in loop bounds",      count: Math.max(1, Math.floor(detail.subCount * 0.35)), severity: "high" },
                  { pattern: "Missing edge case: empty input",        count: Math.max(1, Math.floor(detail.subCount * 0.28)), severity: "medium" },
                  { pattern: "Inefficient nested loop O(n²)",         count: Math.max(1, Math.floor(detail.subCount * 0.20)), severity: "low" },
                  { pattern: "Output formatting mismatch (trailing space)", count: Math.max(1, Math.floor(detail.subCount * 0.15)), severity: "low" },
                ].map((e) => {
                  const sColor = { high: "#f87171", medium: "#facc15", low: "#64748b" }[e.severity];
                  return (
                    <div key={e.pattern} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", background: "#0a1628", border: "1px solid #1a2540", borderRadius: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: "50%", background: sColor, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "#94a3b8" }}>{e.pattern}</span>
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: sColor, flexShrink: 0 }}>{e.count} students</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action: view submissions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button
                onClick={() => navigate(`/instructor/labs/${detail.lab.id}/submissions`)}
                style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#06b6d4,#0891b2)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 14px rgba(6,182,212,0.3)" }}
              >
                View All Submissions →
              </button>
            </div>
          </>
        ) : (
          <div style={{ color: "#475569", textAlign: "center", padding: 48 }}>Lab not found.</div>
        )}
      </div>
    </InstructorLayout>
  );
}

// ── static mock student list (mirrors SubmissionsPage) ───────────────────────
const MOCK_STUDENTS_ANALYTICS = [
  { id: "s1",  name: "Ahmed Al-Rashidi",    email: "ahmed.rashidi@kfupm.edu.sa" },
  { id: "s2",  name: "Sara Al-Otaibi",      email: "sara.otaibi@kfupm.edu.sa" },
  { id: "s3",  name: "Mohammed Al-Zahrani", email: "m.zahrani@kfupm.edu.sa" },
  { id: "s4",  name: "Fatima Al-Ghamdi",    email: "f.ghamdi@kfupm.edu.sa" },
  { id: "s5",  name: "Omar Al-Harbi",       email: "o.harbi@kfupm.edu.sa" },
  { id: "s6",  name: "Nora Al-Qahtani",     email: "n.qahtani@kfupm.edu.sa" },
  { id: "s7",  name: "Khalid Al-Dosari",    email: "k.dosari@kfupm.edu.sa" },
  { id: "s8",  name: "Lina Al-Shehri",      email: "l.shehri@kfupm.edu.sa" },
  { id: "s9",  name: "Yusuf Al-Mutairi",    email: "y.mutairi@kfupm.edu.sa" },
  { id: "s10", name: "Reem Al-Anazi",       email: "r.anazi@kfupm.edu.sa" },
  { id: "s11", name: "Abdullah Al-Sulami",  email: "a.sulami@kfupm.edu.sa" },
  { id: "s12", name: "Hessa Al-Shammari",   email: "h.shammari@kfupm.edu.sa" },
];
