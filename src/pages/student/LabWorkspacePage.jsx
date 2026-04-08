import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── Sample Lab Data ─────────────────────────────────────────────────────────
const LAB_DATA = {
  id: 9,
  title: "Lab 9 — Binary Trees",
  course: "ICS 202 - SEC 03",
  language: "Python",
  dueDate: "Apr 12, 2026",
  description: `Implement a Binary Search Tree (BST) in Python.

Your BST class must support:
  1. insert(val)   — Insert a value into the BST
  2. search(val)   — Return True if val exists
  3. inorder()     — Return values in sorted order
  4. delete(val)   — Remove a value from the BST

Constraints:
  • Do not use any built-in sort functions
  • All values are unique integers
  • Handle edge cases: empty tree, single node`,
  starterCode: `# Binary Tree Implementation
# ICS 202 - Lab 9

class Node:
    def __init__(self, val):
        self.val = val
        self.left = None
        self.right = None

class BinaryTree:
    def __init__(self):
        self.root = None

    def insert(self, val):
        # TODO: implement insert
        pass

    def search(self, val):
        # TODO: implement search
        pass

    def inorder(self, node=None):
        # TODO: implement inorder traversal
        pass

    def delete(self, val):
        # TODO: implement delete
        pass


# Test your implementation here
if __name__ == "__main__":
    tree = BinaryTree()
    tree.insert(5)
    tree.insert(3)
    tree.insert(7)
    print(tree.inorder())   # Expected: [3, 5, 7]
    print(tree.search(3))   # Expected: True
    print(tree.search(9))   # Expected: False
`,
  files: ["solution.py", "helpers.py", "tests.py", "README.md"],
  testCases: [
    { name: "test_insert_root", status: "pass", points: 10 },
    { name: "test_insert_left", status: "pass", points: 10 },
    { name: "test_search_node", status: "fail", points: 10 },
    { name: "test_inorder_traverse", status: "fail", points: 10 },
    { name: "test_delete_leaf", status: "hidden", points: 20 },
    { name: "test_delete_node", status: "hidden", points: 20 },
  ],
};

const KEYWORDS = ["def","class","return","if","else","elif","while","for","in",
  "not","and","or","True","False","None","import","from","pass","self","print",
  "range","len","append"];

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
  const tokens = text.split(/(\b\w+\b|[(),:.\[\]{}=+\-*/<>!"']|\s+)/g).filter(Boolean);
  return tokens.map((tok, i) => {
    if (KEYWORDS.includes(tok))
      return <span key={i} style={{ color: "#c792ea" }}>{tok}</span>;
    if (/^["'].*["']$/.test(tok))
      return <span key={i} style={{ color: "#c3e88d" }}>{tok}</span>;
    if (/^\d+$/.test(tok))
      return <span key={i} style={{ color: "#f78c6c" }}>{tok}</span>;
    return <span key={i}>{tok}</span>;
  });
}

function fileIcon(name) {
  if (name.endsWith(".py")) return "🐍";
  if (name.endsWith(".md")) return "📄";
  return "📋";
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LabWorkspacePage() {
  const navigate = useNavigate();
  const [code, setCode] = useState(LAB_DATA.starterCode);
  const [activeFile, setActiveFile] = useState("solution.py");
  const [testResults, setTestResults] = useState(LAB_DATA.testCases);
  const [consoleOutput, setConsoleOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [descCollapsed, setDescCollapsed] = useState(false);

  // Auto-save simulation
  useEffect(() => {
    const iv = setInterval(() => setLastSaved(new Date().toLocaleTimeString()), 30000);
    return () => clearInterval(iv);
  }, []);

  const handleRun = () => {
    setIsRunning(true);
    setConsoleOutput(null);
    setTimeout(() => {
      const hasInsert = code.includes("self.root") && !code.includes("# TODO: implement insert");
      const hasSearch = code.includes("def search") && !code.includes("# TODO: implement search");
      const hasInorder = code.includes("append") && code.includes("inorder");

      const updated = testResults.map((t) => {
        if (t.status === "hidden") return t;
        if (t.name === "test_insert_root") return { ...t, status: hasInsert ? "pass" : "fail" };
        if (t.name === "test_insert_left") return { ...t, status: hasInsert ? "pass" : "fail" };
        if (t.name === "test_search_node") return { ...t, status: hasSearch ? "pass" : "fail" };
        if (t.name === "test_inorder_traverse") return { ...t, status: hasInorder ? "pass" : "fail" };
        return t;
      });
      setTestResults(updated);

      const fails = updated.filter((r) => r.status === "fail");
      setConsoleOutput(
        fails.length > 0
          ? { isError: true, text: "AssertionError: Expected [1,2,3]\nGot [1,3]\nLine 16, inorder()", time: new Date().toLocaleTimeString(), runtime: "0.043s" }
          : { isError: false, text: "[3, 5, 7]\nTrue\nFalse\n\nAll visible tests passed! ✓", time: new Date().toLocaleTimeString(), runtime: "0.031s" }
      );
      setIsRunning(false);
    }, 1400);
  };

  const handleConfirmSubmit = () => {
    setShowSubmit(false);
    setSubmitted(true);
    setTimeout(() => navigate("/dashboard"), 2200);
  };

  const passed = testResults.filter((r) => r.status === "pass").length;
  const visibleTotal = testResults.filter((r) => r.status !== "hidden").length;
  const lines = code.split("\n");

  // ── Styles ──────────────────────────────────────────────────────────────────
  const bg0 = "#050b18";
  const bg1 = "#080f1e";
  const bg2 = "#0b1424";
  const border = "#1a2540";
  const accent = "#22d3ee";
  const muted = "#8898b3";
  const dimmed = "#4a5568";

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", background:bg0,
      color:"#e2e8f0", fontFamily:"-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif", overflow:"hidden" }}>

      {/* ── Top Bar ── */}
      <header style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 24px", height:52, background:bg1, borderBottom:`1px solid ${border}`, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <button onClick={() => navigate("/dashboard")}
            style={{ background:"none", border:"none", color:accent, fontSize:18, fontWeight:700,
              cursor:"pointer", letterSpacing:"-0.5px" }}>
            LabTrack
          </button>
          <span style={{ color:border, fontSize:18 }}>›</span>
          <span style={{ fontSize:14, fontWeight:600, color:"#e2e8f0" }}>{LAB_DATA.title}</span>
        </div>
        <span style={{ fontSize:11, color:dimmed }}>
          {lastSaved ? `Last saved at ${lastSaved}` : "Auto-saves every 30s"}
        </span>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <span style={{ background:bg2, border:`1px solid ${border}`, borderRadius:20,
            padding:"4px 12px", fontSize:12, color:muted }}>
            {LAB_DATA.course}
          </span>
          <div style={{ width:32, height:32, borderRadius:"50%",
            background:"linear-gradient(135deg,#22d3ee,#0369a1)",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, fontWeight:700, color:"#fff", cursor:"pointer" }}>
            M
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

        {/* ── Left Nav ── */}
        <aside style={{ width:188, minWidth:188, background:bg1, borderRight:`1px solid ${border}`,
          display:"flex", flexDirection:"column", padding:"16px 0" }}>
          <div style={{ padding:"0 20px 16px", borderBottom:`1px solid ${border}` }}>
            <span style={{ fontSize:10, fontWeight:700, color:dimmed, letterSpacing:"0.1em",
              textTransform:"uppercase" }}>Navigation</span>
          </div>
          <nav style={{ padding:"8px 0", flex:1 }}>
            {[
              { label:"Dashboard", icon:"⊞", path:"/dashboard" },
              { label:"My Labs", icon:"🧪", path:"/labs", active:true },
              { label:"Peer Review", icon:"👁", path:"/peer-review" },
              { label:"Grades", icon:"📊", path:"/grades" },
              { label:"History", icon:"🕐", path:"/history" },
            ].map((item) => (
              <button key={item.label} onClick={() => navigate(item.path)}
                style={{ display:"flex", alignItems:"center", gap:10, width:"100%",
                  padding:"9px 20px", background:item.active?"#0d1e3a":"none",
                  borderLeft: item.active ? `2px solid ${accent}` : "2px solid transparent",
                  border:"none", borderRight:"none", borderTop:"none", borderBottom:"none",
                  color: item.active ? "#e2e8f0" : muted, fontSize:13, fontWeight:500,
                  cursor:"pointer", textAlign:"left" }}>
                <span style={{ fontSize:14 }}>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          {/* Files */}
          <div style={{ borderTop:`1px solid ${border}`, padding:"12px 0" }}>
            <p style={{ fontSize:10, fontWeight:700, color:dimmed, letterSpacing:"0.1em",
              padding:"0 20px 8px", textTransform:"uppercase" }}>Files</p>
            {LAB_DATA.files.map((f) => (
              <button key={f} onClick={() => setActiveFile(f)}
                style={{ display:"flex", alignItems:"center", gap:8, width:"100%",
                  padding:"6px 20px",
                  background: activeFile===f ? "#0d1e3a" : "none",
                  borderLeft: activeFile===f ? `2px solid ${accent}` : "2px solid transparent",
                  border:"none", borderRight:"none", borderTop:"none", borderBottom:"none",
                  color: activeFile===f ? "#e2e8f0" : "#6b7a99", fontSize:12, cursor:"pointer",
                  textAlign:"left" }}>
                <span style={{ fontSize:13 }}>{fileIcon(f)}</span>
                {f}
              </button>
            ))}
          </div>
        </aside>

        {/* ── Description Panel ── */}
        <div style={{ width: descCollapsed ? 40 : 260, minWidth: descCollapsed ? 40 : 260,
          background:bg1, borderRight:`1px solid ${border}`, display:"flex", flexDirection:"column",
          transition:"width 0.2s,min-width 0.2s", overflow:"hidden" }}>
          <div style={{ padding:"12px", display:"flex", alignItems:"center",
            justifyContent: descCollapsed ? "center" : "space-between",
            borderBottom:`1px solid ${border}` }}>
            {!descCollapsed && <span style={{ fontSize:10, fontWeight:700, color:dimmed,
              letterSpacing:"0.1em", textTransform:"uppercase" }}>Lab Details</span>}
            <button onClick={() => setDescCollapsed(!descCollapsed)}
              style={{ background:"none", border:"none", color:muted, cursor:"pointer",
                fontSize:18, lineHeight:1, padding:2 }}>
              {descCollapsed ? "›" : "‹"}
            </button>
          </div>
          {!descCollapsed && (
            <div style={{ padding:16, overflow:"auto", flex:1 }}>
              <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
                <span style={{ background:"#1a2540", borderRadius:20, padding:"3px 10px",
                  fontSize:11, color:"#f59e0b" }}>⏰ Due: {LAB_DATA.dueDate}</span>
                <span style={{ background:"#1a2540", borderRadius:20, padding:"3px 10px",
                  fontSize:11, color:accent }}>🐍 {LAB_DATA.language}</span>
              </div>
              <pre style={{ fontSize:12, lineHeight:1.7, color:"#94a3b8",
                whiteSpace:"pre-wrap", fontFamily:"inherit", margin:0 }}>
                {LAB_DATA.description}
              </pre>
            </div>
          )}
        </div>

        {/* ── Code Editor ── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", background:bg2, overflow:"hidden" }}>
          {/* Tab bar */}
          <div style={{ display:"flex", borderBottom:`1px solid ${border}`, background:bg1 }}>
            {LAB_DATA.files.map((f) => (
              <button key={f} onClick={() => setActiveFile(f)}
                style={{ padding:"10px 20px", fontSize:12, background:"none",
                  borderBottom: f===activeFile ? `2px solid ${accent}` : "2px solid transparent",
                  border:"none", borderTop:"none", borderLeft:"none", borderRight:"none",
                  color: f===activeFile ? accent : "#6b7a99", cursor:"pointer" }}>
                {f}
              </button>
            ))}
          </div>

          {/* Editor */}
          <div style={{ flex:1, overflow:"auto", position:"relative" }}>
            <div style={{ display:"flex", minHeight:"100%" }}>
              {/* Line numbers */}
              <div style={{ minWidth:50, padding:"16px 0", textAlign:"right", color:"#2d3f5c",
                fontSize:13, lineHeight:"1.6", userSelect:"none",
                fontFamily:"'JetBrains Mono','Fira Code',monospace",
                background:bg1, borderRight:`1px solid ${border}` }}>
                {lines.map((_,i) => (
                  <div key={i} style={{ paddingRight:12 }}>{i+1}</div>
                ))}
              </div>

              {/* Highlighted + textarea overlay */}
              <div style={{ flex:1, position:"relative" }}>
                <pre style={{ margin:0, padding:"16px", fontSize:13, lineHeight:"1.6",
                  fontFamily:"'JetBrains Mono','Fira Code','Courier New',monospace",
                  color:"#cdd6f4", pointerEvents:"none", whiteSpace:"pre", minHeight:"100%" }}>
                  {lines.map((line,i) => (
                    <div key={i} style={{ minHeight:"1.6em" }}>{syntaxHighlight(line)}</div>
                  ))}
                </pre>
                <textarea value={code} onChange={(e) => setCode(e.target.value)}
                  spellCheck={false}
                  style={{ position:"absolute", top:0, left:0, width:"100%", height:"100%",
                    padding:"16px", fontSize:13, lineHeight:"1.6",
                    fontFamily:"'JetBrains Mono','Fira Code','Courier New',monospace",
                    background:"transparent", color:"transparent", caretColor:accent,
                    border:"none", outline:"none", resize:"none", whiteSpace:"pre",
                    overflow:"hidden" }} />
              </div>
            </div>
          </div>
        </div>

        {/* ── Test Results Panel ── */}
        <div style={{ width:290, minWidth:290, background:bg1, borderLeft:`1px solid ${border}`,
          display:"flex", flexDirection:"column", overflow:"hidden" }}>
          <div style={{ padding:"14px 16px 12px", borderBottom:`1px solid ${border}`,
            display:"flex", alignItems:"center", justifyContent:"space-between" }}>
            <span style={{ fontSize:13, fontWeight:600, color:"#e2e8f0" }}>Test Results</span>
            <span style={{ fontSize:14, fontWeight:700,
              color: passed===visibleTotal ? "#4ade80" : "#f87171" }}>
              {passed}/{visibleTotal}
            </span>
          </div>

          <div style={{ flex:1, overflow:"auto" }}>
            {testResults.map((t) => (
              <div key={t.name} style={{ display:"flex", alignItems:"center",
                justifyContent:"space-between", padding:"9px 16px",
                borderBottom:`1px solid #0f1b30` }}>
                <span style={{ fontSize:12, fontFamily:"monospace",
                  color: t.status==="pass"?"#4ade80": t.status==="fail"?"#f87171":"#6b7a99" }}>
                  {t.name}
                </span>
                <span style={{ fontSize:14 }}>
                  {t.status==="pass"?"✓": t.status==="fail"?"✗":"🔒"}
                </span>
              </div>
            ))}

            {consoleOutput && (
              <div style={{ padding:"14px 16px" }}>
                <p style={{ fontSize:10, fontWeight:700, color:dimmed, letterSpacing:"0.1em",
                  textTransform:"uppercase", marginBottom:8 }}>Output / Error</p>
                <div style={{ background:bg0, borderRadius:8, padding:12, fontSize:12,
                  fontFamily:"monospace", lineHeight:1.5,
                  color: consoleOutput.isError ? "#f87171" : "#4ade80",
                  whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
                  {consoleOutput.text}
                </div>
              </div>
            )}
          </div>

          {consoleOutput && (
            <div style={{ padding:"8px 16px 10px", borderTop:`1px solid ${border}` }}>
              <p style={{ fontSize:10, fontWeight:700, color:dimmed, letterSpacing:"0.1em",
                textTransform:"uppercase", marginBottom:4 }}>Console</p>
              <p style={{ fontSize:11, color:"#6b7a99", margin:"2px 0" }}>
                Run at {consoleOutput.time}
              </p>
              <p style={{ fontSize:11, color:"#6b7a99" }}>
                Runtime: {consoleOutput.runtime}
              </p>
            </div>
          )}

          {/* Buttons */}
          <div style={{ padding:"12px 16px", borderTop:`1px solid ${border}`, display:"flex", gap:8 }}>
            <button onClick={handleRun} disabled={isRunning}
              style={{ flex:1, padding:"10px 0", background: isRunning ? "#1a2540" : "#16a34a",
                border:"none", borderRadius:8, color:"#fff", fontSize:13, fontWeight:600,
                cursor: isRunning ? "not-allowed" : "pointer" }}>
              {isRunning ? "Running…" : "▶  Run"}
            </button>
            <button onClick={() => setShowSubmit(true)}
              style={{ flex:1, padding:"10px 0", background:"#0369a1", border:"none",
                borderRadius:8, color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
              Submit
            </button>
          </div>
        </div>
      </div>

      {/* ── Submit Modal ── */}
      {showSubmit && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.7)",
          display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000 }}>
          <div style={{ background:bg2, borderRadius:16, padding:32, width:400,
            border:`1px solid ${border}` }}>
            <h2 style={{ fontSize:18, fontWeight:700, color:"#e2e8f0", marginTop:0, marginBottom:8 }}>
              Submit Lab 9?
            </h2>
            <p style={{ fontSize:13, color:muted, marginBottom:20 }}>
              Current score:{" "}
              <span style={{ color:accent, fontWeight:700 }}>{passed}/{visibleTotal}</span> visible
              tests passing. Hidden tests will be evaluated after submission.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowSubmit(false)}
                style={{ flex:1, padding:"10px 0", background:"#1a2540", border:"none",
                  borderRadius:8, color:muted, fontWeight:600, cursor:"pointer" }}>
                Cancel
              </button>
              <button onClick={handleConfirmSubmit}
                style={{ flex:1, padding:"10px 0", background:"#0369a1", border:"none",
                  borderRadius:8, color:"#fff", fontWeight:600, cursor:"pointer" }}>
                Submit ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Toast ── */}
      {submitted && (
        <div style={{ position:"fixed", bottom:32, left:"50%", transform:"translateX(-50%)",
          background:"#16a34a", color:"#fff", padding:"12px 28px", borderRadius:12,
          fontSize:14, fontWeight:600, zIndex:2000, boxShadow:"0 4px 24px rgba(0,0,0,0.4)" }}>
          ✓ Lab submitted! Redirecting to dashboard…
        </div>
      )}
    </div>
  );
}
