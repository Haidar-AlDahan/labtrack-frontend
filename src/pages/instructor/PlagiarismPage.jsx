import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InstructorLayout from "../../components/layout/InstructorLayout";

const LABS_KEY = "labtrack_instructor_labs";
const SUBS_KEY = "labtrack_submissions";
const PLAG_KEY = "labtrack_plagiarism";

// ── Mock code variants per student ──────────────────────────────────────────
const CODE_VARIANTS = {
  s1: `def max_of_three(a, b, c):
    return max(a, b, c)

# Read input
nums = list(map(int, input().split()))
print(max_of_three(nums[0], nums[1], nums[2]))`,

  s2: `def find_maximum(x, y, z):
    if x >= y and x >= z:
        return x
    elif y >= z:
        return y
    return z

nums = list(map(int, input().split()))
print(find_maximum(nums[0], nums[1], nums[2]))`,

  s3: `def max_of_three(a, b, c):
    return max(a, b, c)

# Read input
nums = list(map(int, input().split()))
print(max_of_three(nums[0], nums[1], nums[2]))`,

  s4: `def find_maximum(x, y, z):
    if x >= y and x >= z:
        return x
    elif y >= z:
        return y
    return z

# parse input
data = list(map(int, input().split()))
print(find_maximum(data[0], data[1], data[2]))`,

  s5: `def max_of_three(a, b, c):
    # find the max value
    return max(a, b, c)

n = list(map(int, input().split()))
print(max_of_three(n[0], n[1], n[2]))`,

  s9: `def max_of_three(a, b, c):
    return max(a, b, c)

nums = list(map(int, input().split()))
# Print result
print(max_of_three(nums[0], nums[1], nums[2]))`,
};

// Pre-computed mock pairs (similarity is fixed for demo)
const BASE_PAIRS = [
  { pairKey: "s3-s9", studentAId: "s3", studentBId: "s9", similarity: 91 },
  { pairKey: "s1-s3", studentAId: "s1", studentBId: "s3", similarity: 87 },
  { pairKey: "s2-s4", studentAId: "s2", studentBId: "s4", similarity: 72 },
  { pairKey: "s1-s5", studentAId: "s1", studentBId: "s5", similarity: 65 },
  { pairKey: "s4-s5", studentAId: "s4", studentBId: "s5", similarity: 58 },
];

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtDateTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function similarityColor(pct) {
  if (pct >= 80) return { text: "#f87171", bg: "rgba(248,113,113,0.12)", border: "rgba(248,113,113,0.3)" };
  if (pct >= 60) return { text: "#fb923c", bg: "rgba(251,146,60,0.12)",  border: "rgba(251,146,60,0.3)" };
  return           { text: "#facc15", bg: "rgba(250,204,21,0.12)",  border: "rgba(250,204,21,0.3)" };
}

function computeMatchedLines(codeA, codeB) {
  const linesA = codeA.split("\n");
  const linesB = codeB.split("\n");
  const matchedA = new Set();
  const matchedB = new Set();

  linesA.forEach((lineA, iA) => {
    const trimA = lineA.trim();
    if (!trimA) return;
    linesB.forEach((lineB, iB) => {
      if (trimA === lineB.trim()) {
        matchedA.add(iA);
        matchedB.add(iB);
      }
    });
  });
  return { matchedA, matchedB };
}

function CodePanel({ label, name, code, matchedLines }) {
  const lines = code.split("\n");
  return (
    <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
      <div style={{
        padding: "10px 16px", background: "#0d1f3c",
        borderBottom: "1px solid #1e3a5f",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <span style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 13, color: "#e2e8f0", fontWeight: 700 }}>{name}</span>
      </div>
      <div style={{
        flex: 1, overflowY: "auto", fontFamily: "monospace",
        fontSize: 12, lineHeight: "20px", background: "#060f20",
      }}>
        {lines.map((line, i) => {
          const isMatch = matchedLines.has(i);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                background: isMatch ? "rgba(251,146,60,0.15)" : "transparent",
                borderLeft: isMatch ? "3px solid #fb923c" : "3px solid transparent",
              }}
            >
              <span style={{
                width: 36, textAlign: "right", padding: "0 8px",
                color: isMatch ? "#fb923c" : "#334155",
                userSelect: "none", flexShrink: 0, fontSize: 11,
              }}>
                {i + 1}
              </span>
              <span style={{
                whiteSpace: "pre-wrap", wordBreak: "break-all",
                padding: "0 12px 0 4px",
                color: isMatch ? "#fed7aa" : "#94a3b8",
              }}>
                {line || " "}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function PlagiarismPage() {
  const { labId } = useParams();
  const navigate = useNavigate();

  const [lab, setLab]               = useState(null);
  const [submissions, setSubmissions] = useState({});
  const [scanState, setScanState]   = useState("idle"); // idle | scanning | done
  const [scanProgress, setScanProgress] = useState(0);
  const [pairs, setPairs]           = useState([]);
  const [scannedAt, setScannedAt]   = useState(null);
  const [selectedPairKey, setSelectedPairKey] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [toast, setToast]           = useState(null);

  const scanIntervalRef = useRef(null);

  // ── Load lab + submissions ──────────────────────────────────────────────────
  useEffect(() => {
    const labs = JSON.parse(localStorage.getItem(LABS_KEY) || "[]");
    const found = labs.find((l) => l.id === labId);
    if (found) setLab(found);

    const allSubs = JSON.parse(localStorage.getItem(SUBS_KEY) || "{}");
    setSubmissions(allSubs[labId] || {});

    // Load existing scan if present
    const plagData = JSON.parse(localStorage.getItem(PLAG_KEY) || "{}");
    const existing = plagData[labId];
    if (existing) {
      setPairs(existing.pairs || []);
      setScannedAt(existing.scannedAt);
      setScanState("done");
      if (existing.pairs?.length > 0) setSelectedPairKey(existing.pairs[0].pairKey);
    }
  }, [labId]);

  // ── Toast auto-dismiss ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // ── Scan simulation ─────────────────────────────────────────────────────────
  function startScan() {
    if (scanState === "scanning") return;
    setScanState("scanning");
    setScanProgress(0);
    setSelectedPairKey(null);

    let progress = 0;
    scanIntervalRef.current = setInterval(() => {
      progress += Math.random() * 12 + 4;
      if (progress >= 100) {
        progress = 100;
        clearInterval(scanIntervalRef.current);
        finishScan();
      }
      setScanProgress(Math.min(progress, 100));
    }, 150);
  }

  function finishScan() {
    const allSubs = JSON.parse(localStorage.getItem(SUBS_KEY) || "{}");
    const labSubs = allSubs[labId] || {};

    // Resolve names from submissions
    const pairsWithMeta = BASE_PAIRS.map((p) => {
      const subA = Object.values(labSubs).find((s) => s.studentId === p.studentAId);
      const subB = Object.values(labSubs).find((s) => s.studentId === p.studentBId);
      if (!subA || !subB) return null;
      return {
        ...p,
        studentAName: subA.studentName,
        studentBName: subB.studentName,
        status: "pending",
      };
    }).filter(Boolean);

    const scanned = new Date().toISOString();

    const plagData = JSON.parse(localStorage.getItem(PLAG_KEY) || "{}");
    plagData[labId] = { pairs: pairsWithMeta, scannedAt: scanned };
    localStorage.setItem(PLAG_KEY, JSON.stringify(plagData));

    setPairs(pairsWithMeta);
    setScannedAt(scanned);
    setScanState("done");
    if (pairsWithMeta.length > 0) setSelectedPairKey(pairsWithMeta[0].pairKey);
    setToast({ type: "success", msg: `Scan complete — ${pairsWithMeta.length} suspicious pair(s) found` });
  }

  useEffect(() => () => clearInterval(scanIntervalRef.current), []);

  // ── Actions ─────────────────────────────────────────────────────────────────
  function updatePairStatus(pairKey, newStatus) {
    const updated = pairs.map((p) =>
      p.pairKey === pairKey ? { ...p, status: newStatus } : p
    );
    setPairs(updated);

    const plagData = JSON.parse(localStorage.getItem(PLAG_KEY) || "{}");
    if (plagData[labId]) {
      plagData[labId].pairs = updated;
      localStorage.setItem(PLAG_KEY, JSON.stringify(plagData));
    }

    const action = newStatus === "flagged" ? "Flagged as plagiarism" : "Dismissed";
    setToast({ type: newStatus === "flagged" ? "danger" : "info", msg: `${action} — ${getPair(pairKey)?.studentAName} & ${getPair(pairKey)?.studentBName}` });

    // Auto-select next pending
    const remaining = updated.filter((p) => p.pairKey !== pairKey && p.status === "pending");
    if (remaining.length > 0) setSelectedPairKey(remaining[0].pairKey);
  }

  function getPair(key) {
    return pairs.find((p) => p.pairKey === key);
  }

  // ── Derived ─────────────────────────────────────────────────────────────────
  const filteredPairs = pairs.filter((p) => {
    if (filterStatus === "all") return true;
    return p.status === filterStatus;
  });

  const selectedPair = getPair(selectedPairKey);
  const codeA = selectedPair ? (CODE_VARIANTS[selectedPair.studentAId] || "") : "";
  const codeB = selectedPair ? (CODE_VARIANTS[selectedPair.studentBId] || "") : "";
  const { matchedA, matchedB } = selectedPair
    ? computeMatchedLines(codeA, codeB)
    : { matchedA: new Set(), matchedB: new Set() };

  const counts = {
    all: pairs.length,
    pending: pairs.filter((p) => p.status === "pending").length,
    flagged: pairs.filter((p) => p.status === "flagged").length,
    dismissed: pairs.filter((p) => p.status === "dismissed").length,
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <InstructorLayout>
      <div style={{ height: "100vh", display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ── Header ── */}
        <div style={{
          padding: "18px 28px", borderBottom: "1px solid #1e3a5f",
          background: "#060f20",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button
              onClick={() => navigate(`/instructor/labs/${labId}/submissions`)}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: "#64748b", fontSize: 20, lineHeight: 1, padding: 0,
              }}
              title="Back to submissions"
            >
              ←
            </button>
            <div>
              <div style={{ fontSize: 11, color: "#475569", marginBottom: 2 }}>
                Plagiarism Detection
              </div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>
                {lab?.title || labId}
              </div>
            </div>
            {scanState === "done" && scannedAt && (
              <span style={{
                fontSize: 11, color: "#475569", background: "#0d1f3c",
                padding: "4px 10px", borderRadius: 20, border: "1px solid #1e3a5f",
              }}>
                Last scan: {fmtDateTime(scannedAt)}
              </span>
            )}
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            {counts.flagged > 0 && (
              <span style={{
                fontSize: 12, fontWeight: 700,
                color: "#f87171", background: "rgba(248,113,113,0.1)",
                border: "1px solid rgba(248,113,113,0.3)",
                padding: "5px 12px", borderRadius: 20,
              }}>
                ⚑ {counts.flagged} Flagged
              </span>
            )}
            <button
              onClick={startScan}
              disabled={scanState === "scanning"}
              style={{
                padding: "8px 18px", borderRadius: 9, fontWeight: 700,
                fontSize: 13, cursor: scanState === "scanning" ? "not-allowed" : "pointer",
                border: "1px solid rgba(34,211,238,0.4)",
                background: scanState === "scanning"
                  ? "rgba(34,211,238,0.04)"
                  : "rgba(34,211,238,0.1)",
                color: scanState === "scanning" ? "#475569" : "#22d3ee",
              }}
            >
              {scanState === "scanning" ? "Scanning…" : scanState === "done" ? "↻ Re-scan" : "Run Plagiarism Scan"}
            </button>
          </div>
        </div>

        {/* ── Toast ── */}
        {toast && (
          <div style={{
            position: "fixed", top: 24, right: 24, zIndex: 999,
            padding: "12px 20px", borderRadius: 10, fontSize: 13, fontWeight: 600,
            background:
              toast.type === "danger" ? "rgba(248,113,113,0.95)" :
              toast.type === "success" ? "rgba(74,222,128,0.95)" :
              "rgba(148,163,184,0.95)",
            color: "#0a1628",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
          }}>
            {toast.msg}
          </div>
        )}

        {/* ── Body ── */}
        {scanState === "idle" && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 20,
          }}>
            <div style={{ fontSize: 64 }}>🔍</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#e2e8f0" }}>
              No scan results yet
            </div>
            <div style={{ fontSize: 14, color: "#64748b", maxWidth: 360, textAlign: "center" }}>
              Run a plagiarism scan to compare all submitted code and detect suspicious similarities.
            </div>
            <button
              onClick={startScan}
              style={{
                padding: "11px 28px", borderRadius: 10, fontWeight: 700,
                fontSize: 14, cursor: "pointer",
                border: "1px solid rgba(34,211,238,0.4)",
                background: "rgba(34,211,238,0.1)", color: "#22d3ee",
              }}
            >
              Run Plagiarism Scan
            </button>
          </div>
        )}

        {scanState === "scanning" && (
          <div style={{
            flex: 1, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", gap: 24,
          }}>
            <div style={{ fontSize: 48, animation: "spin 1.5s linear infinite" }}>⚙</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>
              Plagiarism scan in progress…
            </div>
            <div style={{ fontSize: 13, color: "#64748b" }}>
              Comparing {Object.keys(submissions).length} submissions using token-based similarity analysis
            </div>
            {/* Progress bar */}
            <div style={{
              width: 360, background: "#0d1f3c",
              border: "1px solid #1e3a5f", borderRadius: 8, overflow: "hidden",
            }}>
              <div style={{
                height: 10,
                width: `${scanProgress}%`,
                background: "linear-gradient(90deg, #22d3ee, #7c3aed)",
                transition: "width 0.15s ease",
                borderRadius: 8,
              }} />
            </div>
            <div style={{ fontSize: 13, color: "#475569", fontWeight: 600 }}>
              {Math.round(scanProgress)}%
            </div>
          </div>
        )}

        {scanState === "done" && (
          <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>

            {/* ── Left: pairs list ── */}
            <div style={{
              width: 300, flexShrink: 0, borderRight: "1px solid #1e3a5f",
              display: "flex", flexDirection: "column", background: "#060f20",
              overflow: "hidden",
            }}>
              {/* Filter tabs */}
              <div style={{
                display: "flex", borderBottom: "1px solid #1e3a5f",
                padding: "0 12px", gap: 0,
              }}>
                {["all", "pending", "flagged", "dismissed"].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterStatus(f)}
                    style={{
                      flex: 1, padding: "10px 4px",
                      background: "none", border: "none",
                      borderBottom: filterStatus === f ? "2px solid #22d3ee" : "2px solid transparent",
                      color: filterStatus === f ? "#22d3ee" : "#475569",
                      fontSize: 11, fontWeight: 600, cursor: "pointer",
                      textTransform: "capitalize",
                      transition: "color 0.15s",
                    }}
                  >
                    {f} {counts[f] > 0 && (
                      <span style={{
                        marginLeft: 4,
                        background: filterStatus === f ? "rgba(34,211,238,0.15)" : "rgba(148,163,184,0.1)",
                        color: filterStatus === f ? "#22d3ee" : "#64748b",
                        borderRadius: 10, padding: "1px 5px", fontSize: 10,
                      }}>
                        {counts[f]}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Pair items */}
              <div style={{ flex: 1, overflowY: "auto" }}>
                {filteredPairs.length === 0 ? (
                  <div style={{
                    padding: 24, textAlign: "center",
                    fontSize: 13, color: "#475569",
                  }}>
                    No pairs in this category
                  </div>
                ) : (
                  filteredPairs.map((pair) => {
                    const col = similarityColor(pair.similarity);
                    const isSelected = selectedPairKey === pair.pairKey;
                    const statusIcon =
                      pair.status === "flagged" ? "⚑" :
                      pair.status === "dismissed" ? "✓" : "";
                    return (
                      <div
                        key={pair.pairKey}
                        onClick={() => setSelectedPairKey(pair.pairKey)}
                        style={{
                          padding: "14px 16px",
                          borderBottom: "1px solid #0d1f3c",
                          background: isSelected ? "rgba(34,211,238,0.06)" : "transparent",
                          borderLeft: isSelected ? "3px solid #22d3ee" : "3px solid transparent",
                          cursor: "pointer",
                          transition: "background 0.15s",
                          opacity: pair.status === "dismissed" ? 0.5 : 1,
                        }}
                      >
                        <div style={{
                          display: "flex", justifyContent: "space-between",
                          alignItems: "center", marginBottom: 6,
                        }}>
                          <span style={{
                            fontSize: 18, fontWeight: 800,
                            color: col.text,
                          }}>
                            {pair.similarity}%
                          </span>
                          {statusIcon ? (
                            <span style={{
                              fontSize: 11, fontWeight: 700,
                              color: pair.status === "flagged" ? "#f87171" : "#4ade80",
                              background: pair.status === "flagged" ? "rgba(248,113,113,0.1)" : "rgba(74,222,128,0.1)",
                              border: `1px solid ${pair.status === "flagged" ? "rgba(248,113,113,0.3)" : "rgba(74,222,128,0.3)"}`,
                              padding: "2px 8px", borderRadius: 10,
                            }}>
                              {statusIcon} {pair.status}
                            </span>
                          ) : (
                            <span style={{
                              fontSize: 10, fontWeight: 600,
                              color: "#fb923c", background: "rgba(251,146,60,0.08)",
                              border: "1px solid rgba(251,146,60,0.2)",
                              padding: "2px 8px", borderRadius: 10,
                            }}>
                              pending
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600, marginBottom: 2 }}>
                          {pair.studentAName}
                        </div>
                        <div style={{ fontSize: 11, color: "#64748b", marginBottom: 2 }}>vs</div>
                        <div style={{ fontSize: 12, color: "#e2e8f0", fontWeight: 600 }}>
                          {pair.studentBName}
                        </div>
                        {/* Similarity bar */}
                        <div style={{
                          marginTop: 8, height: 4, borderRadius: 4,
                          background: "#0d1f3c", overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%", width: `${pair.similarity}%`,
                            background: col.text, borderRadius: 4,
                          }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Summary footer */}
              <div style={{
                padding: "10px 16px", borderTop: "1px solid #1e3a5f",
                background: "#0d1f3c", fontSize: 11, color: "#475569",
                display: "flex", justifyContent: "space-between",
              }}>
                <span>{counts.pending} pending review</span>
                <span>{counts.flagged} flagged · {counts.dismissed} dismissed</span>
              </div>
            </div>

            {/* ── Right: detail view ── */}
            {selectedPair ? (
              <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

                {/* Detail header */}
                <div style={{
                  padding: "14px 20px", borderBottom: "1px solid #1e3a5f",
                  background: "#0d1f3c",
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  flexShrink: 0,
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 2 }}>
                        <strong style={{ color: "#e2e8f0" }}>{selectedPair.studentAName}</strong>
                        <span style={{ margin: "0 8px", color: "#334155" }}>vs</span>
                        <strong style={{ color: "#e2e8f0" }}>{selectedPair.studentBName}</strong>
                      </div>
                      <div style={{ fontSize: 11, color: "#475569" }}>
                        Highlighted lines indicate matching code segments
                      </div>
                    </div>
                    <div style={{
                      padding: "6px 14px", borderRadius: 8,
                      background: similarityColor(selectedPair.similarity).bg,
                      border: `1px solid ${similarityColor(selectedPair.similarity).border}`,
                      color: similarityColor(selectedPair.similarity).text,
                      fontSize: 20, fontWeight: 800,
                    }}>
                      {selectedPair.similarity}% similar
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      onClick={() => updatePairStatus(selectedPair.pairKey, "dismissed")}
                      disabled={selectedPair.status === "dismissed"}
                      style={{
                        padding: "7px 16px", borderRadius: 8, fontWeight: 600,
                        fontSize: 13, cursor: selectedPair.status === "dismissed" ? "not-allowed" : "pointer",
                        border: "1px solid #1e3a5f",
                        background: selectedPair.status === "dismissed" ? "rgba(74,222,128,0.1)" : "transparent",
                        color: selectedPair.status === "dismissed" ? "#4ade80" : "#94a3b8",
                        opacity: selectedPair.status === "dismissed" ? 0.7 : 1,
                      }}
                    >
                      {selectedPair.status === "dismissed" ? "✓ Dismissed" : "Dismiss"}
                    </button>
                    <button
                      onClick={() => updatePairStatus(selectedPair.pairKey, "flagged")}
                      disabled={selectedPair.status === "flagged"}
                      style={{
                        padding: "7px 16px", borderRadius: 8, fontWeight: 700,
                        fontSize: 13, cursor: selectedPair.status === "flagged" ? "not-allowed" : "pointer",
                        border: `1px solid ${selectedPair.status === "flagged" ? "rgba(248,113,113,0.4)" : "rgba(248,113,113,0.5)"}`,
                        background: selectedPair.status === "flagged"
                          ? "rgba(248,113,113,0.15)"
                          : "rgba(248,113,113,0.1)",
                        color: "#f87171",
                        opacity: selectedPair.status === "flagged" ? 0.7 : 1,
                      }}
                    >
                      {selectedPair.status === "flagged" ? "⚑ Flagged" : "⚑ Flag as Plagiarism"}
                    </button>
                  </div>
                </div>

                {/* Legend */}
                <div style={{
                  padding: "6px 20px", background: "#060f20",
                  borderBottom: "1px solid #0d1f3c",
                  display: "flex", alignItems: "center", gap: 16, flexShrink: 0,
                }}>
                  <span style={{ fontSize: 11, color: "#475569" }}>Legend:</span>
                  <span style={{
                    fontSize: 11, color: "#fb923c",
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{
                      display: "inline-block", width: 12, height: 12,
                      background: "rgba(251,146,60,0.3)", border: "1px solid #fb923c",
                      borderRadius: 2,
                    }} />
                    Matching line
                  </span>
                  <span style={{ fontSize: 11, color: "#64748b" }}>
                    ({matchedA.size} of {codeA.split("\n").length} lines matched in left ·{" "}
                    {matchedB.size} of {codeB.split("\n").length} lines in right)
                  </span>
                </div>

                {/* Side-by-side code */}
                <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
                  <CodePanel
                    label="Student A"
                    name={selectedPair.studentAName}
                    code={codeA}
                    matchedLines={matchedA}
                  />
                  <div style={{ width: 1, background: "#1e3a5f", flexShrink: 0 }} />
                  <CodePanel
                    label="Student B"
                    name={selectedPair.studentBName}
                    code={codeB}
                    matchedLines={matchedB}
                  />
                </div>
              </div>
            ) : (
              <div style={{
                flex: 1, display: "flex", alignItems: "center",
                justifyContent: "center", flexDirection: "column", gap: 12,
              }}>
                <div style={{ fontSize: 40 }}>👈</div>
                <div style={{ fontSize: 14, color: "#475569" }}>
                  Select a pair to view side-by-side comparison
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </InstructorLayout>
  );
}
