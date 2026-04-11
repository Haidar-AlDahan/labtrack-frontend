import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";

// ─── Style tokens ─────────────────────────────────────────────────────────────
const accent  = "#22d3ee";
const muted   = "#8898b3";
const dimmed  = "#4a5568";
const success = "#34d399";
const warn    = "#fbbf24";
const danger  = "#f87171";
const border  = "#1a2540";
const card    = "#0b1424";

// ─── Seed lab catalogue ───────────────────────────────────────────────────────
// deadline is in the past for labs 9 & 10 so solutions are unlocked;
// lab 11 deadline is in the future so it stays locked.
const LABS = [
  {
    id: 9,
    title: "Lab 9 — Binary Trees",
    course: "ICS 202 - SEC 03",
    deadline: new Date("2026-04-01T23:59:00"),   // past → unlocked
    submitted: true,
  },
  {
    id: 10,
    title: "Lab 10 — Graph Traversal",
    course: "ICS 202 - SEC 03",
    deadline: new Date("2026-04-08T23:59:00"),   // past → unlocked
    submitted: true,
  },
  {
    id: 11,
    title: "Lab 11 — Hash Tables",
    course: "ICS 202 - SEC 03",
    deadline: new Date("2026-04-26T23:59:00"),   // future → locked
    submitted: false,
  },
];

const GRACE_DAYS = 2;

function isUnlocked(lab) {
  if (!lab.submitted) return false;
  const unlock = new Date(lab.deadline);
  unlock.setDate(unlock.getDate() + GRACE_DAYS);
  return Date.now() >= unlock.getTime();
}

function unlockDate(lab) {
  const d = new Date(lab.deadline);
  d.setDate(d.getDate() + GRACE_DAYS);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ─── Reference solutions content ──────────────────────────────────────────────
const SOLUTIONS = {
  9: {
    instructor: {
      label: "Instructor Solution",
      author: "Dr. Ahmad Al-Sayed",
      description: "Clean recursive BST with proper edge-case handling and O(h) complexity on all operations.",
      code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

class BinaryTree:
    def __init__(self):
        self.root = None

    # O(h) average, O(n) worst (unbalanced)
    def insert(self, val):
        self.root = self._insert(self.root, val)

    def _insert(self, node, val):
        if node is None:
            return Node(val)
        if val < node.val:
            node.left = self._insert(node.left, val)
        elif val > node.val:
            node.right = self._insert(node.right, val)
        return node  # duplicate — no change

    # Returns True / False
    def search(self, val):
        return self._search(self.root, val)

    def _search(self, node, val):
        if node is None:
            return False
        if val == node.val:
            return True
        if val < node.val:
            return self._search(node.left, val)
        return self._search(node.right, val)

    # In-order gives sorted list
    def inorder(self, node=None):
        if node is None:
            node = self.root
        result = []
        if node:
            result += self.inorder(node.left)
            result.append(node.val)
            result += self.inorder(node.right)
        return result

    def delete(self, val):
        self.root = self._delete(self.root, val)

    def _delete(self, node, val):
        if node is None:
            return None
        if val < node.val:
            node.left = self._delete(node.left, val)
        elif val > node.val:
            node.right = self._delete(node.right, val)
        else:
            # Node to delete found
            if node.left is None:
                return node.right
            if node.right is None:
                return node.left
            # Two children: replace with in-order successor
            successor = self._min_node(node.right)
            node.val = successor.val
            node.right = self._delete(node.right, successor.val)
        return node

    def _min_node(self, node):
        while node.left:
            node = node.left
        return node`,
      mistakes: [
        "Forgetting to return the node in `_insert` breaks the recursive link — the tree never grows.",
        "Using `=` instead of recursion in delete for the two-children case corrupts the BST property.",
        "`inorder()` must pass `node` explicitly or default to `self.root`, not a new `None` each call.",
        "Not handling duplicate values — decide policy (ignore / overwrite) and be consistent.",
      ],
    },
    top_student: {
      label: "Top Student Solution",
      author: "Student (anonymised) — 100/100",
      description: "Iterative insert and search for reduced call-stack depth, recursive delete.",
      code: `class Node:
    def __init__(self, val):
        self.val = val
        self.left = self.right = None

class BinaryTree:
    def __init__(self):
        self.root = None

    def insert(self, val):
        if not self.root:
            self.root = Node(val)
            return
        cur = self.root
        while True:
            if val < cur.val:
                if cur.left is None:
                    cur.left = Node(val)
                    return
                cur = cur.left
            elif val > cur.val:
                if cur.right is None:
                    cur.right = Node(val)
                    return
                cur = cur.right
            else:
                return  # duplicate

    def search(self, val):
        cur = self.root
        while cur:
            if val == cur.val:
                return True
            cur = cur.left if val < cur.val else cur.right
        return False

    def inorder(self, node=None):
        node = node if node is not None else self.root
        if node is None:
            return []
        return self.inorder(node.left) + [node.val] + self.inorder(node.right)

    def delete(self, val):
        self.root = self._del(self.root, val)

    def _del(self, n, val):
        if not n:
            return None
        if val < n.val:
            n.left = self._del(n.left, val)
        elif val > n.val:
            n.right = self._del(n.right, val)
        else:
            if not n.left: return n.right
            if not n.right: return n.left
            m = n.right
            while m.left:
                m = m.left
            n.val = m.val
            n.right = self._del(n.right, m.val)
        return n`,
      mistakes: [],
    },
    own: {
      label: "Your Submission",
      author: "You",
      description: "Your submitted code — compare it side-by-side with the reference.",
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

    def search(self, val):
        # BUG: always returns False
        return False

    def inorder(self, node=None):
        # BUG: missing node param
        result = []
        if self.root:
            result += self.inorder(self.root.left)
            result.append(self.root.val)
            result += self.inorder(self.root.right)
        return result

    def delete(self, val):
        pass  # not implemented`,
      mistakes: [],
    },
  },
  10: {
    instructor: {
      label: "Instructor Solution",
      author: "Dr. Ahmad Al-Sayed",
      description: "Textbook BFS using deque and iterative DFS using explicit stack.",
      code: `from collections import deque

class Graph:
    def __init__(self):
        self.adj = {}

    def add_edge(self, u, v):
        self.adj.setdefault(u, []).append(v)
        self.adj.setdefault(v, self.adj.get(v, []))  # ensure v exists

    def bfs(self, start):
        visited = set()
        queue = deque([start])
        order = []
        visited.add(start)
        while queue:
            node = queue.popleft()
            order.append(node)
            for neighbor in self.adj.get(node, []):
                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append(neighbor)
        return order

    def dfs(self, start):
        visited = set()
        stack = [start]
        order = []
        while stack:
            node = stack.pop()
            if node not in visited:
                visited.add(node)
                order.append(node)
                for neighbor in reversed(self.adj.get(node, [])):
                    if neighbor not in visited:
                        stack.append(neighbor)
        return order`,
      mistakes: [
        "Using recursion for BFS is incorrect — the spec requires an explicit deque.",
        "Not marking nodes as visited before enqueuing causes duplicates in the output.",
        "Forgetting `reversed()` in iterative DFS gives a reversed traversal order.",
        "Not initialising un-visited nodes in `adj` leads to KeyError on isolated vertices.",
      ],
    },
    top_student: {
      label: "Top Student Solution",
      author: "Student (anonymised) — 100/100",
      description: "Compact and readable BFS/DFS with clear variable names.",
      code: `from collections import deque

class Graph:
    def __init__(self):
        self.adj = {}

    def add_edge(self, u, v):
        for node in (u, v):
            self.adj.setdefault(node, [])
        self.adj[u].append(v)

    def bfs(self, start):
        seen, q, out = {start}, deque([start]), []
        while q:
            v = q.popleft()
            out.append(v)
            for w in self.adj.get(v, []):
                if w not in seen:
                    seen.add(w)
                    q.append(w)
        return out

    def dfs(self, start):
        seen, stack, out = set(), [start], []
        while stack:
            v = stack.pop()
            if v in seen: continue
            seen.add(v)
            out.append(v)
            for w in reversed(self.adj.get(v, [])):
                stack.append(w)
        return out`,
      mistakes: [],
    },
    own: {
      label: "Your Submission",
      author: "You",
      description: "Your submitted code.",
      code: `from collections import deque

class Graph:
    def __init__(self):
        self.adj = {}

    def add_edge(self, u, v):
        if u not in self.adj:
            self.adj[u] = []
        self.adj[u].append(v)

    def bfs(self, start):
        # BUG: doesn't mark visited before enqueue
        queue = deque([start])
        order = []
        while queue:
            node = queue.popleft()
            order.append(node)
            for n in self.adj.get(node, []):
                queue.append(n)
        return order

    def dfs(self, start):
        pass  # not implemented`,
      mistakes: [],
    },
  },
};

// ─── Syntax helpers ───────────────────────────────────────────────────────────
const KEYWORDS = ["def","class","return","if","else","elif","while","for","in","not","and","or",
  "True","False","None","import","from","pass","self","print","range","len","append","set","while",
  "with","as","try","except","raise","yield","lambda","continue","break","assert","del","global"];

function syntaxHighlight(line) {
  const commentIdx = line.indexOf("#");
  if (commentIdx !== -1) {
    return (
      <>
        {tokenize(line.slice(0, commentIdx))}
        <span style={{ color: "#546e8a" }}>{line.slice(commentIdx)}</span>
      </>
    );
  }
  return tokenize(line);
}

function tokenize(text) {
  return text
    .split(/(\b\w+\b|\[|\]|[(),:.{}=+\-*/<>!"']|\s+)/g)
    .filter(Boolean)
    .map((tok, i) => {
      if (KEYWORDS.includes(tok)) return <span key={i} style={{ color: "#c792ea" }}>{tok}</span>;
      if (/^["'].*["']$/.test(tok)) return <span key={i} style={{ color: "#c3e88d" }}>{tok}</span>;
      if (/^\d+$/.test(tok)) return <span key={i} style={{ color: "#f78c6c" }}>{tok}</span>;
      return <span key={i}>{tok}</span>;
    });
}

function buildDiff(refCode, studentCode) {
  const refLines     = refCode.split("\n");
  const studentLines = studentCode.split("\n");
  const len = Math.max(refLines.length, studentLines.length);
  const diff = [];
  for (let i = 0; i < len; i++) {
    const r = refLines[i];
    const s = studentLines[i];
    if (r === s) {
      if (r !== undefined) diff.push({ type: "same", text: r });
    } else {
      if (r !== undefined) diff.push({ type: "added",   text: r });
      if (s !== undefined) diff.push({ type: "removed", text: s });
    }
  }
  return diff;
}

// ─── Code viewer ──────────────────────────────────────────────────────────────
function CodeViewer({ code, diffWith, downloadName }) {
  const lines = code.split("\n");
  const diffLines = diffWith ? buildDiff(code, diffWith) : null;

  function handleDownload() {
    const blob = new Blob([code], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = downloadName ?? "solution.py";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div style={{ background: "#070d1a", border: `1px solid ${border}`, borderRadius: 12, overflow: "hidden" }}>
      {/* toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 14px", borderBottom: `1px solid ${border}`, background: "#0a1220" }}>
        <span style={{ fontSize: 11, color: muted, fontFamily: "monospace" }}>
          {downloadName ?? "solution.py"} · {lines.length} lines
        </span>
        <button type="button" onClick={handleDownload} style={{
          background: "rgba(34,211,238,0.08)", border: `1px solid ${accent}33`,
          borderRadius: 6, color: accent, fontSize: 11, fontWeight: 600,
          padding: "4px 12px", cursor: "pointer",
        }}>⬇ Download</button>
      </div>

      {/* code */}
      <div style={{ overflowY: "auto", maxHeight: 480, padding: "14px 0" }}>
        {diffLines ? (
          diffLines.map((dl, i) => {
            const bgColor = dl.type === "added" ? "rgba(52,211,153,0.08)" : dl.type === "removed" ? "rgba(248,113,113,0.08)" : "transparent";
            const prefix  = dl.type === "added" ? "+" : dl.type === "removed" ? "−" : " ";
            const prefixColor = dl.type === "added" ? success : dl.type === "removed" ? danger : dimmed;
            return (
              <div key={i} style={{ display: "flex", background: bgColor, minHeight: 20 }}>
                <span style={{ width: 24, textAlign: "center", fontSize: 12, color: prefixColor, flexShrink: 0, userSelect: "none", fontFamily: "monospace" }}>{prefix}</span>
                <pre style={{ margin: 0, fontSize: 12, fontFamily: "monospace", color: "#cdd6f4", whiteSpace: "pre-wrap", wordBreak: "break-all", flex: 1, paddingRight: 12 }}>
                  {syntaxHighlight(dl.text)}
                </pre>
              </div>
            );
          })
        ) : (
          lines.map((line, i) => (
            <div key={i} style={{ display: "flex", minHeight: 20 }}>
              <span style={{ width: 36, textAlign: "right", paddingRight: 12, fontSize: 11, color: dimmed, flexShrink: 0, userSelect: "none", fontFamily: "monospace" }}>{i + 1}</span>
              <pre style={{ margin: 0, fontSize: 12, fontFamily: "monospace", color: "#cdd6f4", whiteSpace: "pre-wrap", wordBreak: "break-all", flex: 1, paddingRight: 12 }}>
                {syntaxHighlight(line)}
              </pre>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── Lab selector card ────────────────────────────────────────────────────────
function LabCard({ lab, onClick }) {
  const unlocked = isUnlocked(lab);
  const color = unlocked ? accent : muted;

  return (
    <div style={{
      background: card,
      border: `1px solid ${unlocked ? "#1f3555" : border}`,
      borderRadius: 16,
      padding: 18,
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      minHeight: 160,
    }}>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#e2e8f0" }}>{lab.title}</div>
          <span style={{
            background: unlocked ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
            color: unlocked ? success : danger,
            border: `1px solid ${unlocked ? success : danger}33`,
            borderRadius: 6, fontSize: 10, fontWeight: 700,
            padding: "3px 8px", textTransform: "uppercase", letterSpacing: "0.05em", flexShrink: 0,
          }}>
            {unlocked ? "Available" : lab.submitted ? "Pending" : "Not Submitted"}
          </span>
        </div>
        <div style={{ fontSize: 12, color: muted }}>{lab.course}</div>
        <div style={{ fontSize: 12, color: dimmed, marginTop: 4 }}>
          Deadline: {lab.deadline.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
        {!unlocked && lab.submitted && (
          <div style={{ fontSize: 11, color: warn, marginTop: 6 }}>
            Solutions unlock on {unlockDate(lab)}
          </div>
        )}
        {!lab.submitted && (
          <div style={{ fontSize: 11, color: danger, marginTop: 6 }}>
            You must submit the lab to view solutions
          </div>
        )}
      </div>

      {unlocked ? (
        <button type="button" onClick={onClick} style={{
          marginTop: 14, background: "#0369a1", border: "1px solid #0b4f7a",
          borderRadius: 10, color: "#e2e8f0", fontSize: 12, fontWeight: 700,
          padding: "9px 14px", cursor: "pointer", alignSelf: "flex-start",
        }}>
          View Reference Solutions
        </button>
      ) : (
        <button type="button" disabled style={{
          marginTop: 14, background: "#111b31", border: "1px dashed #334155",
          borderRadius: 10, color: "#64748b", fontSize: 12, fontWeight: 700,
          padding: "9px 14px", cursor: "not-allowed", alignSelf: "flex-start",
        }}>
          {lab.submitted ? `Unlocks ${unlockDate(lab)}` : "Submit Lab First"}
        </button>
      )}
    </div>
  );
}

// ─── Solutions viewer ─────────────────────────────────────────────────────────
const TAB_KEYS = ["instructor", "top_student", "own"];

function SolutionsViewer({ lab, onBack }) {
  const [activeTab, setActiveTab]   = useState("instructor");
  const [showDiff, setShowDiff]     = useState(false);
  const [toast, setToast]           = useState("");

  const solutions = SOLUTIONS[lab.id];
  if (!solutions) return null;

  const current   = solutions[activeTab];
  const ownCode   = solutions.own?.code;
  const refCode   = solutions[activeTab]?.code;
  const diffCode  = (showDiff && activeTab !== "own" && ownCode) ? ownCode : null;

  const TAB_LABELS = {
    instructor:  { label: "Instructor Solution", icon: "🎓" },
    top_student: { label: "Top Student",          icon: "🏆" },
    own:         { label: "Your Submission",      icon: "👤" },
  };

  function handleDownload() {
    const blob = new Blob([current.code], { type: "text/plain" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `${lab.title.replace(/\s/g, "_")}_${activeTab}.py`;
    a.click();
    URL.revokeObjectURL(url);
    setToast("Solution downloaded successfully");
    setTimeout(() => setToast(""), 2500);
  }

  return (
    <div>
      {/* Back header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button type="button" onClick={onBack} style={{
          background: "transparent", border: `1px solid ${border}`,
          borderRadius: 8, color: muted, fontSize: 12, fontWeight: 600,
          padding: "7px 14px", cursor: "pointer",
        }}>← Back</button>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>{lab.title}</div>
          <div style={{ fontSize: 12, color: muted }}>{lab.course} · Reference Solutions</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, background: "#0a1628", borderRadius: 12, padding: 4, width: "fit-content" }}>
        {TAB_KEYS.map((key) => (
          <button key={key} type="button" onClick={() => { setActiveTab(key); setShowDiff(false); }} style={{
            background: activeTab === key ? card : "transparent",
            border: activeTab === key ? `1px solid ${border}` : "1px solid transparent",
            borderRadius: 9, padding: "8px 16px", cursor: "pointer",
            color: activeTab === key ? "#e2e8f0" : muted, fontSize: 13, fontWeight: 600,
          }}>
            {TAB_LABELS[key].icon} {TAB_LABELS[key].label}
          </button>
        ))}
      </div>

      {/* Solution meta card */}
      <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: "16px 20px", marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#e2e8f0", marginBottom: 4 }}>{current.label}</div>
          <div style={{ fontSize: 12, color: muted, marginBottom: 6 }}>by {current.author}</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>{current.description}</div>
        </div>
        <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
          {activeTab !== "own" && ownCode && (
            <button type="button" onClick={() => setShowDiff(!showDiff)} style={{
              background: showDiff ? "rgba(251,191,36,0.12)" : "transparent",
              border: `1px solid ${showDiff ? warn : border}`,
              borderRadius: 8, color: showDiff ? warn : muted, fontSize: 12, fontWeight: 600,
              padding: "7px 14px", cursor: "pointer",
            }}>
              {showDiff ? "Hide Diff" : "Diff with My Code"}
            </button>
          )}
          <button type="button" onClick={handleDownload} style={{
            background: "rgba(34,211,238,0.08)", border: `1px solid ${accent}33`,
            borderRadius: 8, color: accent, fontSize: 12, fontWeight: 600,
            padding: "7px 14px", cursor: "pointer",
          }}>⬇ Download</button>
        </div>
      </div>

      {/* Diff legend */}
      {showDiff && (
        <div style={{ display: "flex", gap: 16, marginBottom: 12, fontSize: 11, color: muted }}>
          <span><span style={{ color: success, fontWeight: 700 }}>+</span> Reference solution line</span>
          <span><span style={{ color: danger, fontWeight: 700 }}>−</span> Your code line (differs)</span>
          <span><span style={{ color: dimmed }}>·</span> Identical lines</span>
        </div>
      )}

      {/* Code viewer */}
      <CodeViewer
        code={refCode}
        diffWith={diffCode}
        downloadName={`${lab.title.replace(/[^a-z0-9]/gi, "_")}_${activeTab}.py`}
      />

      {/* Common mistakes */}
      {current.mistakes?.length > 0 && (
        <div style={{ background: "rgba(251,191,36,0.05)", border: `1px solid ${warn}33`, borderRadius: 14, padding: "18px 20px", marginTop: 20 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: warn, marginBottom: 12 }}>⚠ Common Mistakes</div>
          <ul style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
            {current.mistakes.map((m, i) => (
              <li key={i} style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6 }}>{m}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 999,
          background: card, border: `1px solid ${success}`, borderRadius: 12,
          padding: "12px 20px", color: success, fontSize: 13, fontWeight: 600,
          boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        }}>{toast}</div>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ReferenceSolutionsPage() {
  const [selectedLab, setSelectedLab] = useState(null);

  return (
    <DashboardLayout>
      <div style={{ maxWidth: 1080, margin: "0 auto" }}>
        {!selectedLab ? (
          <>
            {/* Header */}
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 16, padding: "20px 24px", marginBottom: 22 }}>
              <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: muted, marginBottom: 6 }}>
                Reference Solutions
              </div>
              <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#e2e8f0" }}>Solution Library</h2>
              <p style={{ margin: "8px 0 0", color: "#9fb2ca", fontSize: 13 }}>
                Instructor and top-student solutions become available 2 days after each lab deadline.
                You must submit a lab before viewing its solutions.
              </p>
            </div>

            {/* Info bar */}
            <div style={{
              display: "flex", gap: 16, marginBottom: 20,
              background: "rgba(34,211,238,0.04)", border: `1px solid ${accent}22`,
              borderRadius: 12, padding: "12px 18px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: success, display: "inline-block" }} />
                <span style={{ fontSize: 12, color: muted }}><span style={{ color: success, fontWeight: 700 }}>Available</span> — deadline + 2 days passed</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: warn, display: "inline-block" }} />
                <span style={{ fontSize: 12, color: muted }}><span style={{ color: warn, fontWeight: 700 }}>Pending</span> — submitted, grace period not over</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: danger, display: "inline-block" }} />
                <span style={{ fontSize: 12, color: muted }}><span style={{ color: danger, fontWeight: 700 }}>Not Submitted</span> — must submit to unlock</span>
              </div>
            </div>

            {/* Lab cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              {LABS.map((lab) => (
                <LabCard key={lab.id} lab={lab} onClick={() => setSelectedLab(lab)} />
              ))}
            </div>
          </>
        ) : (
          <SolutionsViewer lab={selectedLab} onBack={() => setSelectedLab(null)} />
        )}
      </div>
    </DashboardLayout>
  );
}
