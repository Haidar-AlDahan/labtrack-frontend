import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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

function renderStars(value) {
  return "★".repeat(value) + "☆".repeat(5 - value);
}

export default function ReceivedReviewPage() {
  const { reviewId } = useParams();
  const [reviewData, setReviewData] = useState(null);
  const [activeFile, setActiveFile] = useState(null);

  useEffect(() => {
    const all = readJson(PEER_REVIEWS_KEY, []);
    const found = all.find((r) => r.id === reviewId) || all.find((r) => r.status === "completed") || null;
    if (found) {
      setReviewData(found);
      setActiveFile(found.files?.[0] || null);
    }
  }, [reviewId]);

  if (!reviewData) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64 text-slate-400">Loading feedback…</div>
      </DashboardLayout>
    );
  }

  const r = reviewData.review;
  const average = r
    ? ((r.readability + r.efficiency + r.comments) / 3).toFixed(1)
    : "—";

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="border border-cyan-400 rounded-2xl bg-[#111a2e] px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{reviewData.labTitle} — Feedback</h1>
            <p className="text-slate-400 mt-2">Peer review received on your submission</p>
          </div>
          <div className="bg-cyan-500/20 text-cyan-400 font-bold px-5 py-2 rounded-full text-sm">
            Avg {average}/5
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left — summary */}
          <div className="xl:col-span-2 bg-[#111a2e] border border-white/5 rounded-2xl p-5">
            <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4">Feedback Summary</p>
            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-500">Reviews received</p>
                <p className="text-white font-semibold">1</p>
              </div>
              <div>
                <p className="text-slate-500">Average score</p>
                <p className="text-cyan-400 font-semibold">{average}/5</p>
              </div>
              <div>
                <p className="text-slate-500 mb-2">Files</p>
                <div className="space-y-2">
                  {reviewData.files?.map((file) => (
                    <button
                      key={file}
                      type="button"
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
              </div>
            </div>
          </div>

          {/* Center — your code */}
          <div className="xl:col-span-5 bg-[#111a2e] border border-white/5 rounded-2xl overflow-hidden">
            <div className="border-b border-white/5 px-5 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Your Submission</h2>
              <span className="text-sm text-slate-400">{activeFile}</span>
            </div>
            <div className="p-5">
              <pre className="bg-[#09111f] rounded-xl p-5 overflow-x-auto text-sm text-slate-200 leading-7 font-mono border border-cyan-500/10 min-h-[550px] whitespace-pre-wrap">
                {reviewData.fileContents?.[activeFile] || ""}
              </pre>
            </div>
          </div>

          {/* Right — review feedback */}
          <div className="xl:col-span-5 bg-[#111a2e] border border-white/5 rounded-2xl p-5">
            <h2 className="text-2xl font-bold text-white mb-6">Classmate Feedback</h2>
            {r ? (
              <div className="bg-[#1a2438] border border-white/5 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">Anonymous Reviewer</h3>
                  <span className="text-cyan-400 font-semibold">{average}/5</span>
                </div>
                <div className="space-y-3 text-sm">
                  {[
                    { label: "Code Readability",    val: r.readability },
                    { label: "Algorithm Efficiency", val: r.efficiency  },
                    { label: "Code Comments",        val: r.comments    },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <p className="text-slate-400">{label}</p>
                      <p className="text-yellow-400 text-base">{renderStars(val)}</p>
                    </div>
                  ))}
                  <div>
                    <p className="text-slate-400">Strengths</p>
                    <p className="text-white mt-1">{r.strengths}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Areas of Improvement</p>
                    <p className="text-white mt-1">{r.improvements}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Overall Comment</p>
                    <p className="text-white mt-1">{r.overallComment}</p>
                  </div>
                  <p className="text-slate-600 text-xs pt-2">
                    Submitted {new Date(r.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No review submitted yet.</p>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
