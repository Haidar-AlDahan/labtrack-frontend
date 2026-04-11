import { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import SideBar from "../../components/layout/SideBar";
import TopBar from "../../components/layout/TopBar";

// ─── Sample Lab Data ─────────────────────────────────────────────────────────
const LAB_DATA = {
  id: 9,
  title: "Lab 9 — Binary Trees",
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
        

    def search(self, val):
        # TODO: implement search
        

    def inorder(self, node=None):
        # TODO: implement inorder traversal
        

    def delete(self, val):
        # TODO: implement delete
        


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

const LAB_DATA_BY_ID = {
  9: LAB_DATA,
  10: {
    id: 10,
    title: "Lab 10 — Graph Traversal",
    language: "Python",
    dueDate: "Apr 19, 2026",
    description: `Implement graph traversal methods for an adjacency-list graph.

Your Graph class must support:
  1. add_edge(u, v)  — Add a directed edge
  2. bfs(start)      — Breadth-first traversal order
  3. dfs(start)      — Depth-first traversal order

Constraints:
  • Use collections.deque for BFS queue
  • Do not use recursion for BFS
  • Return traversal as a list`,
    starterCode: `# Graph Traversal Implementation
# ICS 202 - Lab 10

from collections import deque

class Graph:
    def __init__(self):
        self.adj = {}

    def add_edge(self, u, v):
        # TODO: implement add_edge
        pass

    def bfs(self, start):
        # TODO: implement bfs traversal
        pass

    def dfs(self, start):
        # TODO: implement dfs traversal
        pass


if __name__ == "__main__":
    g = Graph()
    g.add_edge("A", "B")
    g.add_edge("A", "C")
    g.add_edge("B", "D")
    print(g.bfs("A"))   # Expected: ["A", "B", "C", "D"]
    print(g.dfs("A"))   # Example: ["A", "B", "D", "C"]
`,
    files: ["solution.py", "graph_utils.py", "tests.py", "README.md"],
    testCases: [
      { name: "test_add_edge", status: "pass", points: 10 },
      { name: "test_bfs_order", status: "fail", points: 20 },
      { name: "test_dfs_order", status: "fail", points: 20 },
      { name: "test_disconnected_graph", status: "hidden", points: 25 },
      { name: "test_cycle_graph", status: "hidden", points: 25 },
    ],
  },
  11: {
    id: 11,
    title: "Lab 11 — Hash Tables",
    language: "Python",
    dueDate: "Apr 26, 2026",
    description: `Build a hash table using chaining.

Your HashTable class must support:
  1. put(key, value)     — Insert or update key
  2. get(key)            — Return value for key or None
  3. remove(key)         — Delete key if it exists

Constraints:
  • Implement your own hash function
  • Handle collisions via list chaining
  • Avoid Python dict for storage`,
    starterCode: `# Hash Table Implementation
# ICS 202 - Lab 11

class HashTable:
    def __init__(self, capacity=10):
        self.capacity = capacity
        self.buckets = [[] for _ in range(capacity)]

    def _hash(self, key):
        # TODO: implement hash function
        pass

    def put(self, key, value):
        # TODO: implement put
        pass

    def get(self, key):
        # TODO: implement get
        pass

    def remove(self, key):
        # TODO: implement remove
        pass


if __name__ == "__main__":
    ht = HashTable()
    ht.put("name", "Lina")
    print(ht.get("name"))  # Expected: Lina
    ht.remove("name")
    print(ht.get("name"))  # Expected: None
`,
    files: ["solution.py", "hash_helpers.py", "tests.py", "README.md"],
    testCases: [
      { name: "test_put_insert", status: "pass", points: 10 },
      { name: "test_get_existing", status: "pass", points: 20 },
      { name: "test_remove_key", status: "pass", points: 20 },
      { name: "test_collision_chain", status: "pass", points: 25 },
      { name: "test_update_existing", status: "pass", points: 25 },
    ],
  },
};

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

const RUNNABLE_EXTENSIONS_BY_LANGUAGE = {
  python: ["py"],
  javascript: ["js"],
  typescript: ["ts"],
  java: ["java"],
  c: ["c"],
  "c++": ["cpp", "cc", "cxx"],
};

function getFileExtension(fileName) {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

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
    if (KEYWORDS.includes(tok))
      return (
        <span key={i} style={{ color: "#c792ea" }}>
          {tok}
        </span>
      );
    if (/^["'].*["']$/.test(tok))
      return (
        <span key={i} style={{ color: "#c3e88d" }}>
          {tok}
        </span>
      );
    if (/^\d+$/.test(tok))
      return (
        <span key={i} style={{ color: "#f78c6c" }}>
          {tok}
        </span>
      );
    return <span key={i}>{tok}</span>;
  });
}

function buildInitialFileContents(files, starterCode) {
  const fallbackTextByType = {
    py: "# Add your Python notes or helper code here\n",
    md: "# Notes\n\nWrite your lab notes for this file here.\n",
  };

  return files.reduce((acc, fileName) => {
    const lowerName = fileName.toLowerCase();
    if (lowerName.includes("solution") && lowerName.endsWith(".py")) {
      acc[fileName] = starterCode;
      return acc;
    }

    const ext = lowerName.split(".").pop();
    if (ext === "py") {
      acc[fileName] = `# ${fileName}\n\n${fallbackTextByType.py}`;
      return acc;
    }

    if (ext === "md") {
      acc[fileName] = `# ${fileName}\n\n${fallbackTextByType.md}`;
      return acc;
    }

    acc[fileName] = "";
    return acc;
  }, {});
}

function buildNewFileContent(fileName) {
  const lowerName = fileName.toLowerCase();

  if (lowerName.endsWith(".py")) {
    return `# ${fileName}\n\n# Start writing here.\n`;
  }

  if (lowerName.endsWith(".md")) {
    return `# ${fileName}\n\nStart writing here.\n`;
  }

  return "";
}

function resolveUniqueFileName(candidateName, existingNames, currentName) {
  const trimmed = candidateName.trim();
  if (!trimmed) return "";

  if (trimmed === currentName) return trimmed;

  if (!existingNames.includes(trimmed)) return trimmed;

  let suffix = 2;
  let nextName = `${trimmed} ${suffix}`;

  while (existingNames.includes(nextName)) {
    suffix += 1;
    nextName = `${trimmed} ${suffix}`;
  }

  return nextName;
}

function sidebarFileIcon(name) {
  if (name.endsWith(".py")) return "🐍";
  if (name.endsWith(".md")) return "📄";
  if (name.endsWith(".java")) return "☕";
  if (name.endsWith(".html")) return "🌐";
  if (name.endsWith(".css")) return "🎨";
  if (name.endsWith(".jsx")) return "⚛️";
  if (name.endsWith(".js")) return "🟨";
  return "📋";
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LabWorkspacePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { labId } = useParams();
  const numericLabId = Number(labId);
  const hasValidLab = Object.prototype.hasOwnProperty.call(
    LAB_DATA_BY_ID,
    numericLabId,
  );
  const selectedLab = LAB_DATA_BY_ID[Number(labId)] ?? LAB_DATA;
  const restoredSnapshot = location.state?.restoredSnapshot;
  const currentLabId = String(selectedLab.id);
  const titleSuffix = selectedLab.title.includes("—")
    ? selectedLab.title.split("—").slice(1).join("—").trim()
    : selectedLab.title;
  const pageTitle = `Lab ${currentLabId} — ${titleSuffix}`;
  const initialSolutionFile =
    selectedLab.files.find(
      (f) =>
        f.toLowerCase().includes("solution") && f.toLowerCase().endsWith(".py"),
    ) || selectedLab.files[0];
  const [files, setFiles] = useState(selectedLab.files);
  const [openFiles, setOpenFiles] = useState(selectedLab.files);
  const [activeFile, setActiveFile] = useState(() => {
    return initialSolutionFile;
  });
  const [fileContents, setFileContents] = useState(() =>
    buildInitialFileContents(selectedLab.files, selectedLab.starterCode),
  );
  const [testResults, setTestResults] = useState(selectedLab.testCases);
  const [consoleTranscript, setConsoleTranscript] = useState("");
  const [consolePromptInput, setConsolePromptInput] = useState("");
  const [consolePendingRun, setConsolePendingRun] = useState(null);
  const consoleRef = useRef(null);
  const [consoleMeta, setConsoleMeta] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [filePendingDelete, setFilePendingDelete] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [versionDesc, setVersionDesc] = useState("");
  const [versionDescErr, setVersionDescErr] = useState("");
  const [versionToast, setVersionToast] = useState("");
  const [descCollapsed, setDescCollapsed] = useState(false);
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPageName, setNewPageName] = useState("");
  const [renamingFile, setRenamingFile] = useState(null);
  const [renameDraft, setRenameDraft] = useState("");
  const [hoveredFile, setHoveredFile] = useState(null);
  const [hoveredSidebarFile, setHoveredSidebarFile] = useState(null);
  const [draggedTab, setDraggedTab] = useState(null);
  const [dragOverTab, setDragOverTab] = useState(null);

  useEffect(() => {
    const nextSolutionFile =
      selectedLab.files.find(
        (f) =>
          f.toLowerCase().includes("solution") &&
          f.toLowerCase().endsWith(".py"),
      ) || selectedLab.files[0];

    setFiles(selectedLab.files);
    setOpenFiles(selectedLab.files);
    setActiveFile(nextSolutionFile);
    setFileContents(
      buildInitialFileContents(selectedLab.files, selectedLab.starterCode),
    );
    setTestResults(selectedLab.testCases);
    setConsoleTranscript("");
    setConsolePromptInput("");
    setConsolePendingRun(null);
    setConsoleMeta(null);

    if (
      restoredSnapshot &&
      Number(restoredSnapshot.labId) === Number(selectedLab.id) &&
      typeof restoredSnapshot.code === "string"
    ) {
      setFileContents((currentContents) => ({
        ...currentContents,
        [nextSolutionFile]: restoredSnapshot.code,
      }));
    }
  }, [restoredSnapshot, selectedLab]);

  const code = fileContents[activeFile] ?? "";

  const handleCreatePage = () => {
    const nextName = resolveUniqueFileName(newPageName, files);

    if (!nextName) return;

    setFiles((currentFiles) => [...currentFiles, nextName]);
    setOpenFiles((currentOpenFiles) => [...currentOpenFiles, nextName]);
    setFileContents((currentContents) => ({
      ...currentContents,
      [nextName]: buildNewFileContent(nextName),
    }));
    setActiveFile(nextName);
    setIsAddingPage(false);
    setNewPageName("");
  };

  const beginRenamePage = (fileName) => {
    setRenamingFile(fileName);
    setRenameDraft(fileName);
  };

  const commitRenamePage = () => {
    if (!renamingFile) return;

    const nextName = resolveUniqueFileName(renameDraft, files, renamingFile);
    if (!nextName || nextName === renamingFile) {
      setRenamingFile(null);
      setRenameDraft("");
      return;
    }

    setFiles((currentFiles) =>
      currentFiles.map((fileName) =>
        fileName === renamingFile ? nextName : fileName,
      ),
    );
    setOpenFiles((currentOpenFiles) =>
      currentOpenFiles.map((fileName) =>
        fileName === renamingFile ? nextName : fileName,
      ),
    );
    setFileContents((currentContents) => {
      const nextContents = { ...currentContents };
      nextContents[nextName] =
        nextContents[renamingFile] ?? buildNewFileContent(nextName);
      delete nextContents[renamingFile];
      return nextContents;
    });
    setActiveFile((currentActiveFile) =>
      currentActiveFile === renamingFile ? nextName : currentActiveFile,
    );
    setRenamingFile(null);
    setRenameDraft("");
  };

  const cancelRenamePage = () => {
    setRenamingFile(null);
    setRenameDraft("");
  };

  const handleRenameKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      commitRenamePage();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelRenamePage();
    }
  };

  const handleNewPageKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleCreatePage();
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsAddingPage(false);
      setNewPageName("");
    }
  };

  const handleCloseTab = (fileToClose) => {
    setOpenFiles((currentOpenFiles) => {
      const nextOpenFiles = currentOpenFiles.filter((f) => f !== fileToClose);

      if (activeFile === fileToClose) {
        setActiveFile(nextOpenFiles[0] ?? null);
      }

      return nextOpenFiles;
    });
  };

  const handleTabDragStart = (event, fileName) => {
    // Needed for consistent drag behavior across browsers.
    event.dataTransfer.setData("text/plain", fileName);
    event.dataTransfer.effectAllowed = "move";
    setDraggedTab(fileName);
    setDragOverTab(fileName);
  };

  const handleTabDragOver = (event, fileName) => {
    event.preventDefault();
    if (dragOverTab !== fileName) {
      setDragOverTab(fileName);
    }
  };

  const handleTabDrop = (event, targetFile) => {
    event.preventDefault();
    event.stopPropagation();

    if (!draggedTab || draggedTab === targetFile) {
      setDragOverTab(null);
      setDraggedTab(null);
      return;
    }

    setOpenFiles((currentOpenFiles) => {
      const sourceIndex = currentOpenFiles.indexOf(draggedTab);
      const targetIndex = currentOpenFiles.indexOf(targetFile);
      if (sourceIndex === -1 || targetIndex === -1) return currentOpenFiles;

      const reordered = [...currentOpenFiles];
      reordered.splice(sourceIndex, 1);
      reordered.splice(targetIndex, 0, draggedTab);
      return reordered;
    });

    setDragOverTab(null);
    setDraggedTab(null);
  };

  const handleTabDragEnd = () => {
    setDraggedTab(null);
    setDragOverTab(null);
  };

  const handleDeleteFile = (fileToDelete) => {
    const remainingFiles = files.filter((f) => f !== fileToDelete);
    const remainingOpenFiles = openFiles.filter((f) => f !== fileToDelete);

    setFiles(remainingFiles);
    setOpenFiles(remainingOpenFiles);

    setFileContents((currentContents) => {
      const nextContents = { ...currentContents };
      delete nextContents[fileToDelete];
      return nextContents;
    });

    if (activeFile === fileToDelete) {
      setActiveFile(remainingOpenFiles[0] ?? remainingFiles[0] ?? null);
    }

    if (renamingFile === fileToDelete) {
      setRenamingFile(null);
      setRenameDraft("");
    }
  };

  const requestDeleteFile = (fileName) => {
    setFilePendingDelete(fileName);
    setShowDeleteConfirm(true);
  };

  const cancelDeleteFile = () => {
    setShowDeleteConfirm(false);
    setFilePendingDelete(null);
  };

  const confirmDeleteFile = () => {
    if (!filePendingDelete) return;
    handleDeleteFile(filePendingDelete);
    setShowDeleteConfirm(false);
    setFilePendingDelete(null);
  };

  const handleRun = () => {
    if (!isActiveFileRunnable) {
      setConsoleTranscript(
        `Cannot run ${activeFile}. This lab only supports ${supportedExtensions.map((ext) => `.${ext}`).join(", ")} files.`,
      );
      setConsolePromptInput("");
      setConsolePendingRun(null);
      setConsoleMeta({
        isError: true,
        time: new Date().toLocaleTimeString(),
        runtime: "0.000s",
      });
      return;
    }

    const shouldPauseForInput = selectedLab.id === 10;

    setIsRunning(true);
    setConsoleTranscript("");
    setConsolePromptInput("");
    setConsolePendingRun(null);
    setConsoleMeta(null);

    setTimeout(() => {
      const sourceCode = fileContents[activeFile] ?? "";
      const hasInsert =
        sourceCode.includes("self.root") &&
        !sourceCode.includes("# TODO: implement insert");
      const hasSearch =
        sourceCode.includes("def search") &&
        !sourceCode.includes("# TODO: implement search");
      const hasInorder =
        sourceCode.includes("append") && sourceCode.includes("inorder");

      const updated = testResults.map((t) => {
        if (t.status === "hidden") return t;
        if (t.name === "test_insert_root")
          return { ...t, status: hasInsert ? "pass" : "fail" };
        if (t.name === "test_insert_left")
          return { ...t, status: hasInsert ? "pass" : "fail" };
        if (t.name === "test_search_node")
          return { ...t, status: hasSearch ? "pass" : "fail" };
        if (t.name === "test_inorder_traverse")
          return { ...t, status: hasInorder ? "pass" : "fail" };
        return t;
      });
      setTestResults(updated);

      const fails = updated.filter((r) => r.status === "fail");
      const isError = fails.length > 0;
      const outputText = isError
        ? "AssertionError: Expected [1,2,3]\nGot [1,3]\nLine 16, inorder()"
        : "[3, 5, 7]\nTrue\nFalse\n\nAll visible tests passed! ✓";

      const needsInput =
        sourceCode.includes("input(") ||
        sourceCode.includes("sys.stdin") ||
        sourceCode.includes("stdin");

      if (needsInput || shouldPauseForInput) {
        setConsoleTranscript("Enter the starting node:\n>>> ");
        setConsolePromptInput("");
        setConsolePendingRun({
          outputText,
          isError,
          time: new Date().toLocaleTimeString(),
          runtime: isError ? "0.043s" : "0.031s",
          requiresInput: shouldPauseForInput,
        });
        setConsoleMeta({
          isError: false,
          time: "Waiting for input",
          runtime: "pending",
        });
        setIsRunning(false);
        return;
      }

      setConsoleTranscript(outputText);
      setConsoleMeta({
        isError,
        time: new Date().toLocaleTimeString(),
        runtime: isError ? "0.043s" : "0.031s",
      });
      setIsRunning(false);
    }, 1400);
  };

  const finalizeConsoleInput = () => {
    if (!consolePendingRun) return;

    const inputLine = consolePromptInput.trim();
    const continuationText = consolePendingRun.requiresInput
      ? `\nStarting traversal from node ${inputLine || "<no input>"}\n\n${consolePendingRun.outputText}`
      : consolePendingRun.outputText;

    setConsoleTranscript((currentTranscript) => {
      const separator = currentTranscript.endsWith(">>> ") ? "" : "\n";
      return `${currentTranscript}${inputLine}${separator}${continuationText}`;
    });
    setConsoleMeta({
      isError: consolePendingRun.isError,
      time: consolePendingRun.time,
      runtime: consolePendingRun.runtime,
    });
    setConsolePendingRun(null);
    setConsolePromptInput("");
    setIsRunning(false);
  };

  const handleConsoleChange = (event) => {
    if (!consolePendingRun) return;

    const nextValue = event.target.value;
    if (!nextValue.startsWith(consoleTranscript)) {
      return;
    }

    setConsolePromptInput(nextValue.slice(consoleTranscript.length));
  };

  const handleConsoleKeyDown = (event) => {
    if (!consolePendingRun) return;

    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      finalizeConsoleInput();
    }
  };

  useEffect(() => {
    if (!consolePendingRun || !consoleRef.current) return;

    const caret = consoleRef.current.value.length;
    consoleRef.current.setSelectionRange(caret, caret);
  }, [consolePendingRun, consoleTranscript, consolePromptInput]);

  const handleSaveVersion = () => {
    const desc = versionDesc.trim();
    if (desc.length < 5) {
      setVersionDescErr("Description must be at least 5 characters.");
      return;
    }
    setVersionDescErr("");

    const VERSIONS_KEY = "labtrack_versions";
    try {
      const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const uid  = user.id || user.email || "guest";
      const all  = JSON.parse(localStorage.getItem(VERSIONS_KEY) || "{}");
      const labVersions = all[selectedLab.id] || [];

      const currentCode = fileContents[activeFile] ?? "";
      if (labVersions.length > 0 && labVersions[0].code === currentCode) {
        setVersionDescErr("No changes since the last saved version.");
        return;
      }
      if (labVersions.length >= 50) {
        labVersions.pop();
      }

      const vNum = labVersions.length + 1;
      const passed2 = testResults.filter((r) => r.status === "pass").length;
      const total2  = testResults.filter((r) => r.status !== "hidden").length;
      const newVersion = {
        id: `v${vNum}`,
        labId: selectedLab.id,
        uid,
        label: `v${vNum} — ${desc}`,
        timestamp: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
        status: "saved",
        testsPassed: passed2,
        totalTests: total2,
        score: null,
        code: currentCode,
      };
      all[selectedLab.id] = [newVersion, ...labVersions];
      localStorage.setItem(VERSIONS_KEY, JSON.stringify(all));

      setShowVersionModal(false);
      setVersionDesc("");
      setVersionToast(`Version v${vNum} saved successfully`);
      setTimeout(() => setVersionToast(""), 3000);
    } catch (e) {
      console.warn("Could not save version", e);
      setVersionDescErr("Failed to save version. Please try again.");
    }
  };

  const handleConfirmSubmit = () => {
    setShowSubmit(false);
    setSubmitted(true);
    // Persist submission status so DashboardPage / LabsPage can read it
    try {
      const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
      const key = "labtrack_student_progress";
      const all = JSON.parse(localStorage.getItem(key) || "{}");
      const uid = user.id || user.email || "guest";
      all[uid] = all[uid] || {};
      all[uid][selectedLab.id] = {
        status: "submitted",
        submittedAt: new Date().toISOString(),
        score: null,
      };
      localStorage.setItem(key, JSON.stringify(all));
    } catch (e) { console.warn("Could not persist submission status", e); }
    setTimeout(() => navigate("/dashboard"), 2200);
  };

  const visibleTests = testResults.filter((r) => r.status !== "hidden");
  const passed = visibleTests.filter((r) => r.status === "pass").length;
  const visibleTotal = visibleTests.length;
  const supportedExtensions =
    RUNNABLE_EXTENSIONS_BY_LANGUAGE[selectedLab.language.toLowerCase()] ?? [];
  const activeFileExtension = activeFile ? getFileExtension(activeFile) : "";
  const isActiveFileRunnable =
    !!activeFile && supportedExtensions.includes(activeFileExtension);
  const lines = code.split("\n");

  const handleEditorChange = (value) => {
    setFileContents((prev) => ({
      ...prev,
      [activeFile]: value,
    }));
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const bg0 = "#050b18";
  const bg1 = "#080f1e";
  const bg2 = "#0b1424";
  const border = "#1a2540";
  const accent = "#22d3ee";
  const muted = "#8898b3";
  const dimmed = "#4a5568";
  const panelHeaderHeight = 46;

  if (!hasValidLab) {
    return null;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        background: bg0,
        color: "#e2e8f0",
        fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        overflow: "hidden",
      }}
    >
      <SideBar
        footer={
          files.length > 0 ? (
            <div
              style={{
                borderTop: `1px solid ${border}`,
                padding: "16px 14px 18px",
                maxHeight: "42%",
                overflow: "auto",
              }}
            >
              <p
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: dimmed,
                  letterSpacing: "0.14em",
                  padding: "0 10px 10px",
                  textTransform: "uppercase",
                  margin: 0,
                }}
              >
                Files
              </p>

              {files.map((f) => (
                <div
                  key={f}
                  onMouseEnter={() => setHoveredSidebarFile(f)}
                  onMouseLeave={() => setHoveredSidebarFile(null)}
                  style={{ position: "relative", marginBottom: 4 }}
                >
                  <button
                    onClick={() => {
                      setOpenFiles((currentOpenFiles) =>
                        currentOpenFiles.includes(f)
                          ? currentOpenFiles
                          : [...currentOpenFiles, f],
                      );
                      setActiveFile(f);
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      width: "100%",
                      padding: "10px 12px",
                      background: activeFile === f ? "#0f1d34" : "transparent",
                      border: `1px solid ${activeFile === f ? "#1c3557" : "transparent"}`,
                      borderRadius: 12,
                      color: activeFile === f ? "#e2e8f0" : "#6b7a99",
                      fontSize: 13,
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <span style={{ fontSize: 14 }}>{sidebarFileIcon(f)}</span>
                    <span
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        flex: 1,
                      }}
                    >
                      {f}
                    </span>
                  </button>

                  {hoveredSidebarFile === f && activeFile === f && (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        requestDeleteFile(f);
                      }}
                      aria-label={`Delete ${f}`}
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 20,
                        height: 20,
                        border: "none",
                        borderRadius: 999,
                        background: "rgba(248,113,113,0.12)",
                        color: "#f87171",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 14,
                        padding: 0,
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : null
        }
      />

      <div
        style={{
          display: "flex",
          flex: 1,
          minWidth: 0,
          flexDirection: "column",
        }}
      >
        <TopBar title={pageTitle} />

        {/* ── Body ── */}
        <main
          style={{
            display: "flex",
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          {/* ── Description Panel ── */}
          <div
            style={{
              width: descCollapsed ? 40 : 260,
              minWidth: descCollapsed ? 40 : 260,
              background: bg1,
              borderRight: `1px solid ${border}`,
              display: "flex",
              flexDirection: "column",
              transition: "width 0.2s,min-width 0.2s",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: panelHeaderHeight,
                padding: "0 12px",
                display: "flex",
                alignItems: "center",
                justifyContent: descCollapsed ? "center" : "space-between",
                borderBottom: `1px solid ${border}`,
              }}
            >
              {!descCollapsed && (
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: dimmed,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                  }}
                >
                  Lab Details
                </span>
              )}
              <button
                onClick={() => setDescCollapsed(!descCollapsed)}
                style={{
                  background: "none",
                  border: "none",
                  color: muted,
                  cursor: "pointer",
                  fontSize: 18,
                  lineHeight: 1,
                  padding: 2,
                }}
              >
                {descCollapsed ? "›" : "‹"}
              </button>
            </div>
            {!descCollapsed && (
              <div style={{ padding: 16, overflow: "auto", flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 6,
                    marginBottom: 14,
                  }}
                >
                  <span
                    style={{
                      background: "#1a2540",
                      borderRadius: 20,
                      padding: "3px 10px",
                      fontSize: 11,
                      color: "#f59e0b",
                    }}
                  >
                    ⏰ Due: {selectedLab.dueDate}
                  </span>
                  <span
                    style={{
                      background: "#1a2540",
                      borderRadius: 20,
                      padding: "3px 10px",
                      fontSize: 11,
                      color: accent,
                    }}
                  >
                    🐍 {selectedLab.language}
                  </span>
                </div>
                <pre
                  style={{
                    fontSize: 12,
                    lineHeight: 1.7,
                    color: "#94a3b8",
                    whiteSpace: "pre-wrap",
                    fontFamily: "inherit",
                    margin: 0,
                  }}
                >
                  {selectedLab.description}
                </pre>
              </div>
            )}
          </div>

          {/* ── Code Editor ── */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              background: bg2,
              overflow: "hidden",
            }}
          >
            {/* Tab bar */}
            <div
              style={{
                display: "flex",
                minHeight: panelHeaderHeight,
                alignItems: "stretch",
                borderBottom: `1px solid ${border}`,
                background: bg1,
              }}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                if (event.target !== event.currentTarget) return;
                if (!draggedTab) return;
                setOpenFiles((currentOpenFiles) => {
                  const sourceIndex = currentOpenFiles.indexOf(draggedTab);
                  if (sourceIndex === -1) return currentOpenFiles;

                  const reordered = [...currentOpenFiles];
                  reordered.splice(sourceIndex, 1);
                  reordered.push(draggedTab);
                  return reordered;
                });
                setDragOverTab(null);
                setDraggedTab(null);
              }}
            >
              {openFiles.map((f) =>
                renamingFile === f ? (
                  <input
                    key={f}
                    value={renameDraft}
                    onChange={(event) => setRenameDraft(event.target.value)}
                    onBlur={commitRenamePage}
                    onKeyDown={handleRenameKeyDown}
                    autoFocus
                    style={{
                      width: 180,
                      height: panelHeaderHeight,
                      padding: "0 14px",
                      fontSize: 12,
                      background: bg2,
                      borderBottom: `2px solid ${accent}`,
                      border: "none",
                      color: "#e2e8f0",
                      outline: "none",
                    }}
                  />
                ) : (
                  <div
                    key={f}
                    draggable
                    onDragStart={(event) => handleTabDragStart(event, f)}
                    onDragOver={(event) => handleTabDragOver(event, f)}
                    onDrop={(event) => handleTabDrop(event, f)}
                    onDragEnd={handleTabDragEnd}
                    onMouseEnter={() => setHoveredFile(f)}
                    onMouseLeave={() => setHoveredFile(null)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      opacity: draggedTab === f ? 0.55 : 1,
                      borderLeft:
                        dragOverTab === f && draggedTab !== f
                          ? `2px solid ${accent}`
                          : "2px solid transparent",
                    }}
                  >
                    <button
                      onClick={() =>
                        f === activeFile ? beginRenamePage(f) : setActiveFile(f)
                      }
                      style={{
                        height: panelHeaderHeight,
                        padding: "0 20px",
                        fontSize: 12,
                        background: "none",
                        borderBottom:
                          f === activeFile
                            ? `2px solid ${accent}`
                            : "2px solid transparent",
                        border: "none",
                        borderTop: "none",
                        borderLeft: "none",
                        borderRight: "none",
                        color: f === activeFile ? accent : "#6b7a99",
                        cursor: "grab",
                      }}
                    >
                      {f}
                    </button>
                    {f === activeFile && hoveredFile === f && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseTab(f);
                        }}
                        aria-label="Close tab"
                        style={{
                          width: 20,
                          height: 20,
                          padding: 0,
                          fontSize: 14,
                          background: "none",
                          border: "none",
                          color: "#f87171",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                ),
              )}
              {isAddingPage ? (
                <input
                  value={newPageName}
                  onChange={(event) => setNewPageName(event.target.value)}
                  onBlur={handleCreatePage}
                  onKeyDown={handleNewPageKeyDown}
                  autoFocus
                  placeholder="Page name"
                  style={{
                    width: 180,
                    height: panelHeaderHeight,
                    padding: "0 14px",
                    fontSize: 12,
                    background: bg2,
                    borderBottom: `2px solid ${accent}`,
                    border: "none",
                    color: "#e2e8f0",
                    outline: "none",
                  }}
                />
              ) : (
                <button
                  onClick={() => setIsAddingPage(true)}
                  aria-label="Add page"
                  style={{
                    width: 40,
                    height: panelHeaderHeight,
                    padding: 0,
                    fontSize: 16,
                    background: "none",
                    borderBottom: "2px solid transparent",
                    border: "none",
                    color: "#6b7a99",
                    cursor: "pointer",
                  }}
                >
                  +
                </button>
              )}
            </div>

            {/* Editor */}
            <div style={{ flex: 1, overflow: "auto", position: "relative" }}>
              <div style={{ display: "flex", minHeight: "100%" }}>
                {/* Line numbers */}
                <div
                  style={{
                    minWidth: 50,
                    padding: "16px 0",
                    textAlign: "right",
                    color: "#2d3f5c",
                    fontSize: 13,
                    lineHeight: "1.6",
                    userSelect: "none",
                    fontFamily: "'JetBrains Mono','Fira Code',monospace",
                    background: bg1,
                    borderRight: `1px solid ${border}`,
                  }}
                >
                  {lines.map((_, i) => (
                    <div key={i} style={{ paddingRight: 12 }}>
                      {i + 1}
                    </div>
                  ))}
                </div>

                {/* Highlighted + textarea overlay */}
                <div style={{ flex: 1, position: "relative" }}>
                  <pre
                    style={{
                      margin: 0,
                      padding: "16px",
                      fontSize: 13,
                      lineHeight: "1.6",
                      fontFamily:
                        "'JetBrains Mono','Fira Code','Courier New',monospace",
                      color: "#cdd6f4",
                      pointerEvents: "none",
                      whiteSpace: "pre",
                      minHeight: "100%",
                    }}
                  >
                    {lines.map((line, i) => (
                      <div key={i} style={{ minHeight: "1.6em" }}>
                        {syntaxHighlight(line)}
                      </div>
                    ))}
                  </pre>
                  <textarea
                    value={code}
                    onChange={(e) => handleEditorChange(e.target.value)}
                    spellCheck={false}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      padding: "16px",
                      fontSize: 13,
                      lineHeight: "1.6",
                      fontFamily:
                        "'JetBrains Mono','Fira Code','Courier New',monospace",
                      background: "transparent",
                      color: "transparent",
                      caretColor: accent,
                      border: "none",
                      outline: "none",
                      resize: "none",
                      whiteSpace: "pre",
                      overflow: "hidden",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── Test Results Panel ── */}
          <div
            style={{
              width: 360,
              minWidth: 360,
              background: bg1,
              borderLeft: `1px solid ${border}`,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: panelHeaderHeight,
                padding: "0 16px",
                borderBottom: `1px solid ${border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600, color: "#e2e8f0" }}>
                Test Results
              </span>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: passed === visibleTotal ? "#4ade80" : "#f87171",
                }}
              >
                {passed}/{visibleTotal}
              </span>
            </div>

            <div style={{ flex: 1, overflow: "auto", padding: "12px 0" }}>
              <div style={{ padding: "0 16px 14px" }}>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: dimmed,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Test Results
                </p>
                <div
                  style={{
                    border: `1px solid #0f1b30`,
                    borderRadius: 12,
                    overflow: "hidden",
                    background: bg2,
                  }}
                >
                  {visibleTests.map((t, index) => (
                    <div
                      key={t.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "9px 14px",
                        borderBottom:
                          index === visibleTests.length - 1
                            ? "none"
                            : `1px solid #0f1b30`,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 12,
                          fontFamily: "monospace",
                          color:
                            t.status === "pass"
                              ? "#4ade80"
                              : t.status === "fail"
                                ? "#f87171"
                                : "#6b7a99",
                        }}
                      >
                        {t.name}
                      </span>
                      <span style={{ fontSize: 14 }}>
                        {t.status === "pass" ? "✓" : "✗"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ padding: "0 16px 14px" }}>
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: dimmed,
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Output
                </p>
                <textarea
                  ref={consoleRef}
                  value={
                    consolePendingRun
                      ? `${consoleTranscript}${consolePromptInput}`
                      : consoleTranscript
                  }
                  onChange={handleConsoleChange}
                  onKeyDown={handleConsoleKeyDown}
                  readOnly={!consolePendingRun}
                  placeholder={
                    consolePendingRun
                      ? "Type input and press Enter"
                      : isActiveFileRunnable
                        ? "Run the lab to see output here."
                        : `Select a ${selectedLab.language} source file to run.`
                  }
                  spellCheck={false}
                  style={{
                    width: "100%",
                    minHeight: 240,
                    padding: 14,
                    background: bg0,
                    border: `1px solid ${border}`,
                    borderRadius: 12,
                    color: consoleMeta
                      ? consoleMeta.isError
                        ? "#f87171"
                        : "#4ade80"
                      : "#e2e8f0",
                    fontSize: 12,
                    fontFamily: "monospace",
                    lineHeight: 1.55,
                    resize: "vertical",
                    outline: "none",
                    whiteSpace: "pre-wrap",
                    overflowY: "auto",
                    overflowX: "hidden",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                padding: "8px 16px 10px",
                borderTop: `1px solid ${border}`,
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  color: dimmed,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                Run Details
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "#6b7a99",
                  margin: "2px 0",
                }}
              >
                {consoleMeta
                  ? `Run at ${consoleMeta.time}`
                  : "Click Run to check details."}
              </p>
              <p
                style={{
                  fontSize: 11,
                  color: "#6b7a99",
                  minHeight: 16,
                }}
              >
                {consoleMeta ? `Runtime: ${consoleMeta.runtime}` : ""}
              </p>
            </div>

            {/* Buttons */}
            <div
              style={{
                padding: "12px 16px",
                borderTop: `1px solid ${border}`,
                display: "flex",
                gap: 8,
              }}
            >
              <button
                onClick={handleRun}
                disabled={isRunning || !isActiveFileRunnable}
                title={
                  isActiveFileRunnable
                    ? "Run active file"
                    : `Running is only available for ${supportedExtensions.map((ext) => `.${ext}`).join(", ")} files.`
                }
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background:
                    isRunning || !isActiveFileRunnable ? "#1a2540" : "#16a34a",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor:
                    isRunning || !isActiveFileRunnable
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {isRunning ? "Running…" : "▶  Run"}
              </button>
              <button
                onClick={() => { setVersionDesc(""); setVersionDescErr(""); setShowVersionModal(true); }}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "transparent",
                  border: `1px solid ${border}`,
                  borderRadius: 8,
                  color: muted,
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                💾 Save Version
              </button>
              <button
                onClick={() => setShowSubmit(true)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "#0369a1",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* ── Version toast ── */}
      {versionToast && (
        <div style={{
          position: "fixed", bottom: 32, right: 32,
          background: "#16a34a", color: "#fff",
          borderRadius: 10, padding: "12px 20px",
          fontSize: 13, fontWeight: 600, zIndex: 2000,
          boxShadow: "0 4px 16px rgba(0,0,0,0.4)",
        }}>
          ✓ {versionToast}
        </div>
      )}

      {/* ── Save Version Modal ── */}
      {showVersionModal && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000,
        }}>
          <div style={{
            background: bg2, borderRadius: 16, padding: 32, width: 440,
            border: `1px solid ${border}`,
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginTop: 0, marginBottom: 8 }}>
              Save Version
            </h2>
            <p style={{ fontSize: 13, color: muted, marginBottom: 20 }}>
              Add a short description so you can identify this snapshot later.
            </p>
            <input
              autoFocus
              type="text"
              value={versionDesc}
              onChange={(e) => { setVersionDesc(e.target.value); setVersionDescErr(""); }}
              onKeyDown={(e) => { if (e.key === "Enter") { handleSaveVersion(); } else if (e.key === "Escape") { setShowVersionModal(false); } }}
              placeholder="e.g. Fixed insert method"
              style={{
                width: "100%", boxSizing: "border-box",
                background: "#0b1424", border: `1px solid ${versionDescErr ? "#f87171" : border}`,
                borderRadius: 8, color: "#e2e8f0", fontSize: 13,
                padding: "10px 14px", outline: "none", marginBottom: 6,
              }}
            />
            {versionDescErr && (
              <p style={{ fontSize: 12, color: "#f87171", margin: "0 0 14px" }}>{versionDescErr}</p>
            )}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button
                onClick={() => setShowVersionModal(false)}
                style={{
                  flex: 1, padding: "10px 0", background: "transparent",
                  border: `1px solid ${border}`, borderRadius: 8,
                  color: muted, fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveVersion}
                style={{
                  flex: 1, padding: "10px 0", background: "#16a34a",
                  border: "none", borderRadius: 8,
                  color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
                }}
              >
                Save Version
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {showDeleteConfirm && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: bg2,
              borderRadius: 16,
              padding: 32,
              width: 420,
              border: `1px solid ${border}`,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#e2e8f0",
                marginTop: 0,
                marginBottom: 8,
              }}
            >
              Delete File?
            </h2>
            <p style={{ fontSize: 13, color: muted, marginBottom: 20 }}>
              This will permanently delete
              <span style={{ color: accent, fontWeight: 700 }}>
                {` ${filePendingDelete || "this file"}`}
              </span>
              . This action cannot be undone.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={cancelDeleteFile}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "#1a2540",
                  border: "none",
                  borderRadius: 8,
                  color: muted,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteFile}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "#b91c1c",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Submit Modal ── */}
      {showSubmit && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: bg2,
              borderRadius: 16,
              padding: 32,
              width: 400,
              border: `1px solid ${border}`,
            }}
          >
            <h2
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: "#e2e8f0",
                marginTop: 0,
                marginBottom: 8,
              }}
            >
              Submit Lab {selectedLab.id}?
            </h2>
            <p style={{ fontSize: 13, color: muted, marginBottom: 20 }}>
              Current score:{" "}
              <span style={{ color: accent, fontWeight: 700 }}>
                {passed}/{visibleTotal}
              </span>{" "}
              Tests passed. Grade will be evaluated after submission.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setShowSubmit(false)}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "#1a2540",
                  border: "none",
                  borderRadius: 8,
                  color: muted,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  background: "#0369a1",
                  border: "none",
                  borderRadius: 8,
                  color: "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Submit ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Success Toast ── */}
      {submitted && (
        <div
          style={{
            position: "fixed",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            background: "#16a34a",
            color: "#fff",
            padding: "12px 28px",
            borderRadius: 12,
            fontSize: 14,
            fontWeight: 600,
            zIndex: 2000,
            boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
          }}
        >
          ✓ Lab submitted! Redirecting to dashboard…
        </div>
      )}
    </div>
  );
}
