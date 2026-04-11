import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";

const PEER_REVIEWS_KEY = "labtrack_peer_reviews";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.warn(`Failed to read ${key}`, e);
    return fallback;
  }
}

function StarRating({ label, value, onChange, readonly }) {
  return (
    <div>
      <p className="text-white font-semibold mb-2">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => { if (!readonly) onChange(star); }}
            className={`text-3xl transition ${star <= value ? "text-yellow-400" : "text-slate-500"} ${readonly ? "cursor-default" : "hover:text-yellow-300"}`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

export default function AssignedReviewPage() {
  const { reviewId } = useParams();
  const navigate = useNavigate();

  const [review, setReview]               = useState(null);
  const [activeFile, setActiveFile]       = useState(null);
  const [readability, setReadability]     = useState(0);
  const [efficiency, setEfficiency]       = useState(0);
  const [commentsRating, setCommentsRating] = useState(0);
  const [strengths, setStrengths]         = useState("");
  const [improvements, setImprovements]   = useState("");
  const [overallComment, setOverallComment] = useState("");
  const [submitted, setSubmitted]         = useState(false);

  useEffect(() => {
    const all = readJson(PEER_REVIEWS_KEY, []);
    const found = all.find((r) => r.id === reviewId) || all[0] || null;
    if (found) {
      setReview(found);
      setActiveFile(found.files?.[0] || null);
      if (found.review) {
        setReadability(found.review.readability);
        setEfficiency(found.review.efficiency);
        setCommentsRating(found.review.comments);
        setStrengths(found.review.strengths);
        setImprovements(found.review.improvements);
        setOverallComment(found.review.overallComment);
        setSubmitted(true);
      }
    }
  }, [reviewId]);

  if (!review) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-slate-400">Loading review…</div>
      </DashboardLayout>
    );
  }

  const isCompleted = review.status === "completed";
  const code = review.fileContents?.[activeFile] || "";

  const isFormValid =
    readability > 0 &&
    efficiency > 0 &&
    commentsRating > 0 &&
    strengths.trim().length >= 10 &&
    improvements.trim().length >= 10 &&
    overallComment.trim().length >= 10;

  const handleSubmit = () => {
    if (!isFormValid || submitted) return;

    const reviewData = {
      readability,
      efficiency,
      comments: commentsRating,
      strengths: strengths.trim(),
      improvements: improvements.trim(),
      overallComment: overallComment.trim(),
      submittedAt: new Date().toISOString(),
    };

    try {
      const all = readJson(PEER_REVIEWS_KEY, []);
      const updated = all.map((r) => {
        if (r.id !== review.id) return r;
        return { ...r, status: "completed", review: reviewData };
      });
      localStorage.setItem(PEER_REVIEWS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save review", e);
    }

    setSubmitted(true);
    setTimeout(() => navigate("/peer-review"), 1500);
  };

  const relDue = () => {
    const ms = new Date(review.dueDate).getTime() - Date.now();
    if (ms < 0) return "Overdue";
    const h = Math.floor(ms / 3600000);
    if (h < 24) return `Due in ${h}h`;
    return `Due in ${Math.floor(h / 24)}d`;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="border border-cyan-400 rounded-2xl bg-[#111a2e] px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{review.labTitle} — Peer Review</h1>
            <p className="text-slate-400 mt-2">Anonymous Submission · {review.testsPassed} tests passed</p>
          </div>
          <div className={`font-bold px-5 py-2 rounded-full text-sm ${isCompleted ? "bg-green-500/20 text-green-400" : "bg-yellow-500 text-black"}`}>
            {isCompleted ? "Completed" : relDue()}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left — file list */}
          <div className="xl:col-span-2 bg-[#111a2e] border border-white/5 rounded-2xl p-5">
            <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4">Files</p>
            <div className="space-y-2">
              {review.files?.map((file) => (
                <button
                  key={file}
                  onClick={() => setActiveFile(file)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                    activeFile === file
                      ? "bg-[#1b2942] text-cyan-400 border border-cyan-500/30"
                      : "bg-[#0f172a] text-slate-300 border border-transparent"
                  }`}
                >
                  {file}
                </button>
              ))}
            </div>
            <div className="mt-6 space-y-3 text-sm">
              <div>
                <p className="text-slate-500">Submitted</p>
                <p className="text-white font-medium">
                  {new Date(review.sharedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </p>
              </div>
              <div>
                <p className="text-slate-500">Tests</p>
                <p className="text-green-400 font-semibold">{review.testsPassed}</p>
              </div>
            </div>
          </div>

          {/* Center — code */}
          <div className="xl:col-span-6 bg-[#111a2e] border border-white/5 rounded-2xl overflow-hidden">
            <div className="border-b border-white/5 px-5 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Submission to Review</h2>
              <span className="text-sm text-slate-400">{activeFile}</span>
            </div>
            <div className="p-5">
              <pre className="bg-[#09111f] rounded-xl p-5 overflow-x-auto text-sm text-slate-200 leading-7 font-mono border border-cyan-500/10 min-h-[550px] whitespace-pre-wrap">
                {code}
              </pre>
            </div>
          </div>

          {/* Right — review form */}
          <div className="xl:col-span-4 bg-[#111a2e] border border-white/5 rounded-2xl p-5">
            <h2 className="text-2xl font-bold text-white mb-6">
              {isCompleted ? "Your Review" : "Write Review"}
            </h2>
            <div className="space-y-6">
              {StarRating({ label: "Code Readability",    value: readability,    onChange: setReadability,    readonly: isCompleted })}
              {StarRating({ label: "Algorithm Efficiency", value: efficiency,  onChange: setEfficiency,     readonly: isCompleted })}
              {StarRating({ label: "Code Comments",        value: commentsRating, onChange: setCommentsRating, readonly: isCompleted })}

              {[
                { label: "Strengths (min 10 chars)",            val: strengths,      set: setStrengths,      ph: "What did the student do well?" },
                { label: "Areas of Improvement (min 10 chars)", val: improvements,   set: setImprovements,   ph: "What can be improved?" },
                { label: "Overall Comment (min 10 chars)",       val: overallComment, set: setOverallComment, ph: "Your final feedback…" },
              ].map(({ label, val, set, ph }) => (
                <div key={label}>
                  <label className="block text-white font-semibold mb-2">{label}</label>
                  <textarea
                    value={val}
                    onChange={(e) => { if (!isCompleted) set(e.target.value); }}
                    readOnly={isCompleted}
                    className="w-full min-h-[80px] bg-[#1a2438] border border-white/5 rounded-xl px-4 py-3 text-white outline-none resize-none"
                    placeholder={isCompleted ? "" : ph}
                  />
                </div>
              ))}

              {!isCompleted && (
                <button
                  onClick={handleSubmit}
                  disabled={!isFormValid || submitted}
                  className={`w-full py-3 rounded-xl font-bold text-lg transition ${
                    !isFormValid || submitted
                      ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                      : "bg-blue-500 hover:bg-blue-600 text-white"
                  }`}
                >
                  {submitted ? "Review Submitted ✓" : "Submit Review"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
