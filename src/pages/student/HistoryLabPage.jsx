import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SideBar from "../../components/layout/SideBar";
import TopBar from "../../components/layout/TopBar";

const KEYWORDS = [
  "def",
  "class",
  "return",
  "if",
  "else",
  "elif",
  "while",
  "for",
  "in",
  "not",
  "and",
  "or",
  "True",
  "False",
  "None",
  "import",
  "from",
  "pass",
  "self",
  "print",
  "range",
  "len",
  "append",
];

function syntaxHighlight(line) {
  const commentIdx = line.indexOf("#");
  if (commentIdx !== -1) {
    const before = line.slice(0, commentIdx);
    const comment = line.slice(commentIdx);
    return (
      <>
        {tokenize(before)}
        <span style={{ color: "#546e8a" }}>{comment}</span>
      </>
    );
  }
  return tokenize(line);
}

function tokenize(text) {
  const tokens = text
    .split(/(\b\w+\b|\[|\]|[(),:.{}=+\-*/<>!"']|\s+)/g)
    .filter(Boolean);
  return tokens.map((tok, i) => {
    if (KEYWORDS.includes(tok)) {
      return (
        <span key={i} style={{ color: "#c792ea" }}>
          {tok}
        </span>
      );
    }
    if (/^["'].*["']$/.test(tok)) {
      return (
        <span key={i} style={{ color: "#c3e88d" }}>
          {tok}
        </span>
      );
    }
    if (/^\d+$/.test(tok)) {
      return (
        <span key={i} style={{ color: "#f78c6c" }}>
          {tok}
        </span>
      );
    }
    return <span key={i}>{tok}</span>;
  });
}

function buildSimpleDiff(oldCode, newCode) {
  const oldLines = oldCode.split("\n");
  const newLines = newCode.split("\n");
  const maxLength = Math.max(oldLines.length, newLines.length);
  const diffLines = [];

  for (let i = 0; i < maxLength; i += 1) {
    const oldLine = oldLines[i];
    const newLine = newLines[i];

    if (oldLine === newLine) {
      if (newLine !== undefined) {
        diffLines.push({ type: "same", text: `  ${newLine}` });
      }
      continue;
    }

    if (oldLine !== undefined) {
      diffLines.push({ type: "removed", text: `- ${oldLine}` });
    }

    if (newLine !== undefined) {
      diffLines.push({ type: "added", text: `+ ${newLine}` });
    }
  }

  return diffLines;
}

const VERSIONS_KEY = "labtrack_versions";

const SEED_HISTORY_9 = [
  {
    id: "v4", labId: 9, label: "v4 — Latest", timestamp: "Mar 01 · 14:32",
    status: "current", testsPassed: 3, totalTests: 5, score: 60,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

class BinaryTree:
    def __init__(self):
        self.root = None

    def insert(self, val):
        if not self.root:
            self.root = Node(val)
        else:
            self._insert_recursive(self.root, val)

    def _insert_recursive(self, node, val):
        if val < node.val:
            if node.left:
                self._insert_recursive(node.left, val)
            else:
                node.left = Node(val)
        else:
            if node.right:
                self._insert_recursive(node.right, val)
            else:
                node.right = Node(val)

    def inorder(self, node=None):
        if node is None:
            node = self.root

        if node.left:
            self.inorder(node.left)
        print(node.val)
        if node.right:
            self.inorder(node.right)`,
  },
  {
    id: "v3", labId: 9, label: "v3", timestamp: "Mar 01 · 13:10",
    status: "submitted", testsPassed: 2, totalTests: 5, score: 40,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

class BinaryTree:
    def __init__(self):
        self.root = None

    def insert(self, val):
        if not self.root:
            self.root = Node(val)
        else:
            self._insert_recursive(self.root, val)

    def _insert_recursive(self, node, val):
        if val < node.val:
            if node.left:
                self._insert_recursive(node.left, val)
            else:
                node.left = Node(val)`,
  },
  {
    id: "v2", labId: 9, label: "v2 — Submitted", timestamp: "Feb 28 · 22:45",
    status: "submitted", testsPassed: 1, totalTests: 5, score: 20,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

class BinaryTree:
    def __init__(self):
        self.root = None

    def insert(self, val):
        # TODO: implement insert`,
  },
  {
    id: "v1", labId: 9, label: "v1 — Initial", timestamp: "Feb 25 · 09:00",
    status: "initial", testsPassed: 0, totalTests: 5, score: 0,
    code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

class BinaryTree:
    def __init__(self):
        self.root = None`,
  },
];

function loadVersions(labId) {
  try {
    const all = JSON.parse(localStorage.getItem(VERSIONS_KEY) || "{}");
    if (all[labId] && all[labId].length > 0) return all[labId];
  } catch (e) {
    console.warn("Could not read versions", e);
  }
  if (labId === 9) return SEED_HISTORY_9;
  return [];
}

export default function HistoryLabPage() {
  const navigate = useNavigate();
  const { labId: labIdParam } = useParams();
  const [compareVersion, setCompareVersion] = useState(null);
  const normalizedLabId = String(labIdParam || "").replace(/^lab/i, "");
  const labId = Number(normalizedLabId) || 9;

  const submissions = loadVersions(labId);
  const [selectedVersion, setSelectedVersion] = useState(submissions[0]?.id ?? "v1");
  const selected = submissions.find((s) => s.id === selectedVersion);
  const selectedIndex = submissions.findIndex((s) => s.id === selectedVersion);
  const previousVersion =
    selectedIndex >= 0 ? submissions[selectedIndex + 1] : null;
  const compared = submissions.find((s) => s.id === compareVersion);
  const diffLines =
    selected && compared ? buildSimpleDiff(compared.code, selected.code) : [];

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <SideBar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <TopBar />
        <div
          style={{
            flex: 1,
            display: "flex",
            overflow: "hidden",
            background: "#0b1220",
          }}
        >
          {/* Left Panel - Snapshots */}
          <div
            style={{
              width: 320,
              background: "#0b1424",
              borderRight: "1px solid #1a2540",
              overflowY: "auto",
              padding: "20px 0",
            }}
          >
            <div
              style={{ paddingLeft: 20, paddingRight: 20, marginBottom: 20 }}
            >
              <h3
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#64748b",
                  textTransform: "uppercase",
                  margin: 0,
                  letterSpacing: 1,
                }}
              >
                Snapshots
              </h3>
            </div>

            {submissions.map((submission) => (
              <div
                key={submission.id}
                onClick={() => {
                  setSelectedVersion(submission.id);
                  setCompareVersion(null);
                }}
                style={{
                  padding: "14px 20px",
                  marginBottom: 8,
                  marginLeft: 8,
                  marginRight: 8,
                  borderRadius: 8,
                  background:
                    selectedVersion === submission.id
                      ? "#1a3a52"
                      : "transparent",
                  border:
                    selectedVersion === submission.id
                      ? "1px solid #0369a1"
                      : "none",
                  cursor: "pointer",
                  transition: "all 0.2s",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#e2e8f0",
                    }}
                  >
                    {submission.label}
                  </div>
                  {submission.status === "current" && (
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: "#0ea5e9",
                        background: "#082f49",
                        padding: "2px 8px",
                        borderRadius: 4,
                      }}
                    >
                      Current
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#94a3b8",
                    marginBottom: 8,
                  }}
                >
                  {submission.timestamp}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#64748b",
                  }}
                >
                  {submission.testsPassed}/{submission.totalTests} tests ·
                  Score: {submission.score}%
                </div>
              </div>
            ))}
          </div>

          {/* Right Panel - Code Display */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: "#0b1220",
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: "16px 24px",
                borderBottom: "1px solid #1a2540",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 18,
                  fontWeight: 600,
                  color: "#e2e8f0",
                }}
              >
                Version History — Lab {labId}
              </h2>
              <button
                onClick={() => navigate(`/labs/${selected?.labId || labId}`)}
                style={{
                  padding: "8px 16px",
                  background: "#0369a1",
                  color: "#e2e8f0",
                  border: "none",
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s",
                }}
                onMouseEnter={(e) => (e.target.style.background = "#0284c7")}
                onMouseLeave={(e) => (e.target.style.background = "#0369a1")}
              >
                ← Editor
              </button>
            </div>

            {/* Code Content */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
              }}
            >
              <div
                style={{
                  minHeight: 26,
                  marginBottom: 10,
                  color: "#94a3b8",
                  fontSize: 12,
                  fontWeight: 600,
                  letterSpacing: 0.5,
                }}
              >
                {selected && compared ? (
                  <span>
                    DIFF — {compared.id} → {selected.id}
                  </span>
                ) : (
                  <span style={{ visibility: "hidden" }}>DIFF</span>
                )}
              </div>

              {selected && !compared && (
                <div
                  style={{
                    background: "#0b1424",
                    border: "1px solid #1a2540",
                    borderRadius: 8,
                    overflow: "hidden",
                    fontSize: 13,
                    lineHeight: 1.6,
                    margin: 0,
                    fontFamily:
                      "'JetBrains Mono','Fira Code','Courier New',monospace",
                  }}
                >
                  <div style={{ display: "flex", minHeight: "100%" }}>
                    <div
                      style={{
                        minWidth: 50,
                        padding: "16px 0",
                        textAlign: "right",
                        color: "#2d3f5c",
                        userSelect: "none",
                        background: "#080f1e",
                        borderRight: "1px solid #1a2540",
                        fontFamily:
                          "'JetBrains Mono','Fira Code','Courier New',monospace",
                      }}
                    >
                      {selected.code.split("\n").map((_, index) => (
                        <div key={`ln-${index}`} style={{ paddingRight: 12 }}>
                          {index + 1}
                        </div>
                      ))}
                    </div>
                    <div
                      style={{
                        flex: 1,
                        padding: "16px",
                        overflowX: "auto",
                        color: "#cdd6f4",
                        whiteSpace: "pre",
                      }}
                    >
                      {selected.code.split("\n").map((line, index) => (
                        <div key={`code-${index}`}>
                          {syntaxHighlight(line || " ")}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {selected && compared && (
                <div>
                  <div
                    style={{
                      background: "#0b1424",
                      border: "1px solid #1a2540",
                      borderRadius: 8,
                      overflow: "hidden",
                      fontSize: 13,
                      lineHeight: 1.6,
                      fontFamily:
                        "'JetBrains Mono','Fira Code','Courier New',monospace",
                    }}
                  >
                    <div style={{ display: "flex", minHeight: "100%" }}>
                      <div
                        style={{
                          minWidth: 50,
                          padding: "16px 0",
                          textAlign: "right",
                          color: "#2d3f5c",
                          userSelect: "none",
                          background: "#080f1e",
                          borderRight: "1px solid #1a2540",
                          fontFamily:
                            "'JetBrains Mono','Fira Code','Courier New',monospace",
                        }}
                      >
                        {diffLines.map((_, index) => (
                          <div
                            key={`dln-${index}`}
                            style={{ paddingRight: 12 }}
                          >
                            {index + 1}
                          </div>
                        ))}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          padding: "16px",
                          overflowX: "auto",
                        }}
                      >
                        {diffLines.map((line, index) => (
                          <div
                            key={`${line.type}-${index}`}
                            style={{
                              color:
                                line.type === "added"
                                  ? "#22c55e"
                                  : line.type === "removed"
                                    ? "#ef4444"
                                    : "#cdd6f4",
                              background:
                                line.type === "added"
                                  ? "rgba(34,197,94,0.1)"
                                  : line.type === "removed"
                                    ? "rgba(239,68,68,0.1)"
                                    : "transparent",
                              whiteSpace: "pre",
                            }}
                          >
                            {line.type === "same"
                              ? syntaxHighlight(line.text || " ")
                              : line.text || " "}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid #1a2540",
                display: "flex",
                gap: 12,
              }}
            >
              {previousVersion && (
                <button
                  onClick={() =>
                    setCompareVersion((current) =>
                      current === previousVersion.id
                        ? null
                        : previousVersion.id,
                    )
                  }
                  style={{
                    padding: "8px 16px",
                    background:
                      compareVersion === previousVersion.id
                        ? "#0369a1"
                        : "#1a2540",
                    color: "#e2e8f0",
                    border: "1px solid #0369a1",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#0369a1";
                  }}
                  onMouseLeave={(e) => {
                    if (compareVersion !== previousVersion.id) {
                      e.target.style.background = "#1a2540";
                    }
                  }}
                >
                  Compare {previousVersion.id}
                </button>
              )}
              {selected && (
                <button
                  onClick={() =>
                    navigate(`/labs/${selected.labId || labId}`, {
                      state: {
                        restoredSnapshot: {
                          versionId: selected.id,
                          labId: selected.labId || labId,
                          code: selected.code || "",
                        },
                      },
                    })
                  }
                  style={{
                    padding: "8px 16px",
                    background: "#1a2540",
                    color: "#e2e8f0",
                    border: "1px solid #0369a1",
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "#0369a1";
                    e.target.style.color = "#e2e8f0";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "#1a2540";
                    e.target.style.color = "#e2e8f0";
                  }}
                >
                  Restore {selected.label}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
