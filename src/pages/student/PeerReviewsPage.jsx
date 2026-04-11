import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { getCurrentUser } from "../../utils/authStorage.js";

const PEER_REVIEWS_KEY = "labtrack_peer_reviews";

const SEED_CODE = `class Node:
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
                node.right = Node(val)`;

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Failed to read ${key}`, e);
    return fallback;
  }
}

function seedReviews(uid, email) {
  const existing = readJson(PEER_REVIEWS_KEY, []);
  const alreadySeeded = existing.some(
    (r) => r.ownerUid === uid || r.reviewerEmail === email
  );
  if (alreadySeeded) return;

  const seeds = [
    {
      id: "pr_seed_1",
      labId: 9,
      labTitle: "Lab 9 — Binary Trees",
      ownerUid: "seed_student_456",
      ownerName: "Anonymous Student",
      reviewerEmail: email,
      files: ["solution.py"],
      fileContents: { "solution.py": SEED_CODE },
      testsPassed: "3/5",
      sharedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString(),
      status: "pending",
      review: null,
    },
    {
      id: "pr_seed_2",
      labId: 9,
      labTitle: "Lab 9 — Binary Trees",
      ownerUid: uid,
      ownerName: "You",
      reviewerEmail: "peer@kfupm.edu.sa",
      files: ["solution.py"],
      fileContents: { "solution.py": SEED_CODE },
      testsPassed: "3/5",
      sharedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      dueDate: new Date(Date.now() - 86400000).toISOString(),
      status: "completed",
      review: {
        readability: 4,
        efficiency: 5,
        comments: 3,
        strengths: "Good structure and the binary tree logic is correct. Variable naming is clear.",
        improvements: "Add short comments for recursive methods and edge cases like empty input.",
        overallComment: "Strong solution overall. A bit more documentation would improve readability.",
        submittedAt: new Date(Date.now() - 86400000).toISOString(),
      },
    },
  ];
  localStorage.setItem(PEER_REVIEWS_KEY, JSON.stringify([...existing, ...seeds]));
}

function StatusBadge({ text, type = "default" }) {
  const styles = {
    pending:   "bg-yellow-500/20 text-yellow-400",
    completed: "bg-green-500/20 text-green-400",
    available: "bg-cyan-500/20 text-cyan-400",
    default:   "bg-slate-700 text-slate-200",
  };
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[type] || styles.default}`}>
      {text}
    </span>
  );
}

function SectionCard({ title, children }) {
  return (
    <div className="bg-[#111a2e] border border-cyan-500/20 rounded-2xl p-6 shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-5">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function relDue(iso) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms < 0) return "Overdue";
  const h = Math.floor(ms / 3600000);
  if (h < 24) return `Due in ${h}h`;
  return `Due in ${Math.floor(h / 24)}d`;
}

export default function PeerReviewsPage() {
  const navigate = useNavigate();
  const [assigned, setAssigned]   = useState([]);
  const [received, setReceived]   = useState([]);

  useEffect(() => {
    const user  = getCurrentUser() || {};
    const uid   = user.id || user.email || "guest";
    const email = user.email || "";

    seedReviews(uid, email);

    const all = readJson(PEER_REVIEWS_KEY, []);
    setAssigned(all.filter((r) => r.reviewerEmail === email));
    setReceived(all.filter((r) => r.ownerUid === uid && r.status === "completed"));
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="border border-cyan-400 rounded-2xl bg-[#111a2e] px-6 py-5">
          <h1 className="text-3xl font-bold text-white">Peer Reviews</h1>
          <p className="text-slate-400 mt-2">
            View reviews received on your labs and complete reviews assigned by your instructor.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <SectionCard title={`Assigned Reviews (${assigned.length})`}>
            {assigned.length === 0 ? (
              <p className="text-slate-500 text-sm">No reviews assigned yet.</p>
            ) : (
              assigned.map((review) => (
                <div key={review.id} className="bg-[#1a2438] border border-white/5 rounded-xl p-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{review.labTitle}</h3>
                    <p className="text-sm text-slate-400 mt-1">Anonymous Submission</p>
                    <p className="text-sm text-slate-500 mt-2">
                      Shared {new Date(review.sharedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-3 min-w-[140px]">
                    <StatusBadge
                      text={review.status === "pending" ? "Pending" : "Completed"}
                      type={review.status === "pending" ? "pending" : "completed"}
                    />
                    <span className="text-sm text-yellow-400 font-medium">
                      {relDue(review.dueDate)}
                    </span>
                    <button
                      onClick={() => navigate(`/peer-reviews/assigned/${review.id}`)}
                      className="bg-blue-500 hover:bg-blue-600 transition px-4 py-2 rounded-lg text-white font-semibold text-sm"
                    >
                      {review.status === "pending" ? "Open Review" : "View Review"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </SectionCard>

          <SectionCard title={`Reviews Received (${received.length})`}>
            {received.length === 0 ? (
              <p className="text-slate-500 text-sm">No feedback received yet. Share your code from the lab workspace to request a review.</p>
            ) : (
              received.map((review) => {
                const avg = review.review
                  ? ((review.review.readability + review.review.efficiency + review.review.comments) / 3).toFixed(1)
                  : "—";
                return (
                  <div key={review.id} className="bg-[#1a2438] border border-white/5 rounded-xl p-5 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{review.labTitle}</h3>
                      <p className="text-sm text-slate-400 mt-1">1 review received</p>
                      <p className="text-sm text-cyan-400 mt-2 font-medium">Average rating: {avg}/5</p>
                    </div>
                    <div className="flex flex-col items-end gap-3 min-w-[140px]">
                      <StatusBadge text="Available" type="available" />
                      <button
                        onClick={() => navigate(`/peer-reviews/received/${review.id}`)}
                        className="bg-blue-500 hover:bg-blue-600 transition px-4 py-2 rounded-lg text-white font-semibold text-sm"
                      >
                        View Feedback
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
}
