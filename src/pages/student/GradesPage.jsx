import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getCurrentUser } from "../../utils/authStorage.js";

const LABS_KEY     = "labtrack_instructor_labs";
const COURSES_KEY  = "labtrack_courses";
const PROGRESS_KEY = "labtrack_student_progress";
const SUBS_KEY     = "labtrack_submissions";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Failed to read ${key}`, e);
    return fallback;
  }
}

function scoreToGrade(score) {
  if (score === null || score === undefined) return "—";
  if (score >= 95) return "A+";
  if (score >= 90) return "A";
  if (score >= 85) return "B+";
  if (score >= 80) return "B";
  if (score >= 75) return "C+";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function fmtDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day:   "numeric",
      year:  "numeric",
    });
  } catch (e) {
    console.warn("Invalid date value", e);
    return "—";
  }
}

const SEED_ROWS = [
  { id: 8, lab: "LinkedList",      score: 94,   testsPassed: 5, testsTotal: 5, grade: "A",  feedback: "Excellent O(1) insert. Watch edge cases.",     status: "Graded",      submittedAt: "Apr 21, 2025" },
  { id: 7, lab: "Recursion",       score: 78,   testsPassed: 4, testsTotal: 5, grade: "B+", feedback: "Good base case. Improve memoization.",          status: "Graded",      submittedAt: "Apr 17, 2025" },
  { id: 9, lab: "Stacks & Queues", score: 90,   testsPassed: 5, testsTotal: 5, grade: "A",  feedback: "Clean implementation. Add type hints.",         status: "Graded",      submittedAt: "Apr 25, 2025" },
  { id: 6, lab: "Binary Trees",    score: null, testsPassed: 3, testsTotal: 5, grade: "—",  feedback: "—",                                             status: "In Progress", submittedAt: "—"            },
];

const SEED_COURSES = ["ICS 202 - SEC 03", "COE 301 - SEC 02"];

export default function GradesPage() {
  const [courses, setCourses]           = useState(SEED_COURSES);
  const [selectedCourse, setSelectedCourse] = useState(SEED_COURSES[0]);
  const [rows, setRows]                 = useState(SEED_ROWS);

  useEffect(() => {
    const user = getCurrentUser() || {};
    const uid  = user.id || user.email || "guest";

    // Enrolled courses for dropdown
    const allCourses = readJson(COURSES_KEY, []);
    const enrolled   = allCourses.filter((c) =>
      c.sections?.some((s) => s.enrolledStudentIds?.includes(uid))
    );
    const courseNames = enrolled.length > 0
      ? enrolled.map((c) => `${c.courseCode} — ${c.name}`)
      : SEED_COURSES;
    setCourses(courseNames);
    setSelectedCourse(courseNames[0]);

    // Grades data
    const labs     = readJson(LABS_KEY, []).filter((l) => l.status === "active");
    const progress = readJson(PROGRESS_KEY, {})[uid] || {};
    const subs     = readJson(SUBS_KEY, {});

    if (labs.length === 0) {
      setRows(SEED_ROWS);
      return;
    }

    const built = labs.map((lab) => {
      const labKey = String(lab.id);
      const prog   = progress[labKey] || progress[lab.id] || {};
      const sub    = subs[labKey]?.[uid] || subs[lab.id]?.[uid] || {};
      const score  = sub.score ?? prog.score ?? null;
      let status = "Not Started";
      if (sub.status === "graded") {
        status = "Graded";
      } else if (prog.status === "submitted") {
        status = "Pending";
      } else if (prog.status === "in_progress") {
        status = "In Progress";
      }

      return {
        id: lab.id,
        lab: lab.title,
        score,
        testsPassed: "—",
        testsTotal:  "—",
        grade:       scoreToGrade(score),
        feedback:    sub.overallFeedback || "—",
        status,
        submittedAt: fmtDate(prog.submittedAt || sub.gradedAt || null),
      };
    });

    const hasActivity = built.some((r) => r.status !== "Not Started");
    setRows(hasActivity ? built : SEED_ROWS);
  }, []);

  const gradedLabs = useMemo(() => rows.filter((r) => r.score != null), [rows]);

  const avgScore = useMemo(() => {
    if (gradedLabs.length === 0) return "0";
    return (gradedLabs.reduce((s, r) => s + r.score, 0) / gradedLabs.length).toFixed(1);
  }, [gradedLabs]);

  const bestScore = useMemo(() => {
    if (gradedLabs.length === 0) return "0";
    return String(Math.max(...gradedLabs.map((r) => r.score)));
  }, [gradedLabs]);

  const overallGrade = useMemo(() => scoreToGrade(Number(avgScore)), [avgScore]);

  const trendHeights = gradedLabs.map((r) => `${Math.max(r.score, 20)}%`);

  const getGradeColor = (grade) => {
    if (grade === "A" || grade === "A+") return "text-green-400";
    if (grade === "B+" || grade === "B") return "text-cyan-400";
    if (grade === "C+" || grade === "C") return "text-yellow-400";
    if (grade === "D" || grade === "F")  return "text-red-400";
    return "text-gray-400";
  };

  const getStatusClass = (status) => {
    if (status === "Graded")      return "text-green-400";
    if (status === "Pending")     return "text-cyan-400";
    if (status === "In Progress") return "text-yellow-400";
    return "text-gray-400";
  };

  const getScoreDisplay = (score) => {
    if (score == null) return "—";
    return `${score}/100`;
  };

  const getScoreClass = (score) => {
    if (score == null) return "text-gray-300";
    if (score < 60) return "text-red-400 font-semibold";
    return "text-gray-300";
  };

  const handleExportPDF = () => {
    alert("Export PDF is not implemented in this prototype yet.");
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-[#050b18] text-white">
        <div className="mx-auto max-w-7xl px-6 py-6">

          {/* Header */}
          <div className="mb-6 rounded-xl border border-cyan-500/40 bg-[#0b1424] shadow-lg">
            <div className="flex flex-col gap-4 border-b border-cyan-500/30 px-6 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-cyan-400">LabTrack</h1>
                <p className="text-sm text-gray-400">Collaborative Programming Platform</p>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={selectedCourse}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="rounded-md bg-[#0f1b33] px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  {courses.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleExportPDF}
                  className="rounded-md bg-cyan-500 px-4 py-3 text-sm font-semibold hover:bg-cyan-600"
                >
                  Export PDF
                </button>
              </div>
            </div>
            <div className="px-6 py-4">
              <h2 className="text-center text-2xl font-bold text-white">Grades & Feedback</h2>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-[#0b1424] p-6 shadow-lg">
              <div className="flex flex-col items-center justify-center">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-green-400 text-4xl font-bold text-green-400">
                  {overallGrade}
                </div>
                <p className="mt-4 text-center text-lg font-semibold text-gray-400">Overall Grade</p>
              </div>
            </div>
            <div className="rounded-xl bg-[#0b1424] p-6 shadow-lg">
              <h3 className="text-4xl font-bold text-green-400">{avgScore}</h3>
              <p className="mt-1 text-sm text-gray-400">Avg Score</p>
            </div>
            <div className="rounded-xl bg-[#0b1424] p-6 shadow-lg">
              <h3 className="text-4xl font-bold text-cyan-400">{gradedLabs.length}/{rows.length}</h3>
              <p className="mt-1 text-sm text-gray-400">Labs Done</p>
            </div>
            <div className="rounded-xl bg-[#0b1424] p-6 shadow-lg">
              <h3 className="text-4xl font-bold text-green-400">{bestScore}</h3>
              <p className="mt-1 text-sm text-gray-400">Best Score</p>
            </div>
          </div>

          {/* Trend Graph */}
          <div className="mb-6 rounded-xl bg-[#0b1424] p-6 shadow-lg">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-white">Performance Trend</h3>
              <p className="text-sm text-gray-400">Grade progression across completed labs</p>
            </div>
            {gradedLabs.length === 0 ? (
              <p className="text-sm text-gray-400">No grades available yet.</p>
            ) : (
              <div className="flex h-64 items-end justify-between gap-4">
                {gradedLabs.map((item, index) => (
                  <div key={item.id} className="flex flex-1 flex-col items-center justify-end">
                    <div className="mb-2 text-sm font-semibold text-gray-400">{item.score}</div>
                    <div
                      className={`w-full rounded-t-md ${item.score < 60 ? "bg-red-500/80" : "bg-cyan-500/80"}`}
                      style={{ height: trendHeights[index] }}
                    />
                    <div className="mt-3 text-center text-xs text-gray-400">{item.lab}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grades Table */}
          <div className="overflow-hidden rounded-xl bg-[#0b1424] shadow-lg">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-[#0f1b33]">
                  <tr>
                    {["#", "Lab", "Score", "Tests", "Grade", "Status", "Submitted", "Instructor Feedback"].map((h) => (
                      <th key={h} className="px-4 py-4 text-left text-sm font-semibold text-gray-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((item) => (
                    <tr key={item.id} className="border-t border-[#162238] hover:bg-[#0f1b33]/60">
                      <td className="px-4 py-4 text-sm font-semibold text-gray-400">{item.id}</td>
                      <td className="px-4 py-4 text-sm font-semibold text-white">{item.lab}</td>
                      <td className={`px-4 py-4 text-sm ${getScoreClass(item.score)}`}>
                        {getScoreDisplay(item.score)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-300">
                        {item.testsPassed}/{item.testsTotal}
                      </td>
                      <td className={`px-4 py-4 text-sm font-bold ${getGradeColor(item.grade)}`}>{item.grade}</td>
                      <td className={`px-4 py-4 text-sm font-semibold ${getStatusClass(item.status)}`}>{item.status}</td>
                      <td className="px-4 py-4 text-sm text-gray-300">{item.submittedAt}</td>
                      <td className="px-4 py-4 text-sm text-gray-400">"{item.feedback}"</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            View instructor feedback, track your average, and monitor progress by course.
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
