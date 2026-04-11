import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";

const reviewAssignments = {
  1: {
    id: 1,
    title: "Peer Review - Lab 7",
    course: "ICS 202 - SEC 03",
    studentLabel: "Anonymous Submission",
    dueText: "Due in 2 days",
    submittedAt: "Feb 28",
    files: ["solution.py", "README.md"],
    fileContents: {
      "solution.py": `# Linked List implementation

class ListNode:
    def __init__(self, val=0):
        self.val = val
        self.next = None

def reverse(head):
    prev = None
    curr = head

    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt

    return prev
`,
      "README.md": `# Lab 7 Notes

This solution uses an iterative reverse approach.
Time complexity: O(n)
Space complexity: O(1)
`,
    },
    testsPassed: "5/5 Tests pass",
  },
  2: {
    id: 2,
    title: "Peer Review - Lab 8",
    course: "ICS 202 - SEC 03",
    studentLabel: "Anonymous Submission",
    dueText: "Completed",
    submittedAt: "Mar 02",
    files: ["solution.py"],
    fileContents: {
      "solution.py": `def is_palindrome(s):
    s = s.lower()
    return s == s[::-1]
`,
    },
    testsPassed: "4/5 Tests pass",
  },
};

function StarRating({ label, value, onChange }) {
  return (
    <div>
      <p className="text-white font-semibold mb-2">{label}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`text-3xl transition ${
              star <= value ? "text-yellow-400" : "text-slate-500"
            }`}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  );
}

function AssignedReviewPage() {
  const { reviewId } = useParams();
  const navigate = useNavigate();

  const review = useMemo(() => {
    return reviewAssignments[reviewId] || reviewAssignments[1];
  }, [reviewId]);

  const [activeFile, setActiveFile] = useState(review.files[0]);
  const [readability, setReadability] = useState(0);
  const [efficiency, setEfficiency] = useState(0);
  const [commentsRating, setCommentsRating] = useState(0);
  const [strengths, setStrengths] = useState("");
  const [improvements, setImprovements] = useState("");
  const [overallComment, setOverallComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const code = review.fileContents[activeFile] || "";

  const isFormValid =
    readability > 0 &&
    efficiency > 0 &&
    commentsRating > 0 &&
    strengths.trim() &&
    improvements.trim() &&
    overallComment.trim();

  const handleSubmit = () => {
    if (!isFormValid) return;

    setSubmitted(true);

    setTimeout(() => {
      navigate("/peer-review");
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="border border-cyan-400 rounded-2xl bg-[#111a2e] px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{review.title}</h1>
            <p className="text-slate-400 mt-2">
              {review.course} • {review.studentLabel}
            </p>
          </div>
          <div className="bg-yellow-500 text-black font-bold px-5 py-2 rounded-full text-sm">
            {review.dueText}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left */}
          <div className="xl:col-span-2 bg-[#111a2e] border border-white/5 rounded-2xl p-5">
            <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4">
              Review Details
            </p>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-slate-500">Submission</p>
                <p className="text-white font-medium">{review.studentLabel}</p>
              </div>

              <div>
                <p className="text-slate-500">Submitted</p>
                <p className="text-white font-medium">{review.submittedAt}</p>
              </div>

              <div>
                <p className="text-slate-500">Tests</p>
                <p className="text-green-400 font-semibold">{review.testsPassed}</p>
              </div>

              <div>
                <p className="text-slate-500 mb-2">Files</p>
                <div className="space-y-2">
                  {review.files.map((file) => (
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
              </div>
            </div>
          </div>

          {/* Center */}
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

          {/* Right */}
          <div className="xl:col-span-4 bg-[#111a2e] border border-white/5 rounded-2xl p-5">
            <h2 className="text-2xl font-bold text-white mb-6">Your Review</h2>

            <div className="space-y-6">
              <StarRating
                label="Code Readability"
                value={readability}
                onChange={setReadability}
              />

              <StarRating
                label="Algorithm Efficiency"
                value={efficiency}
                onChange={setEfficiency}
              />

              <StarRating
                label="Code Comments"
                value={commentsRating}
                onChange={setCommentsRating}
              />

              <div>
                <label className="block text-white font-semibold mb-2">Strengths</label>
                <textarea
                  value={strengths}
                  onChange={(e) => setStrengths(e.target.value)}
                  className="w-full min-h-[90px] bg-[#1a2438] border border-white/5 rounded-xl px-4 py-3 text-white outline-none"
                  placeholder="Write what the student did well..."
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Areas of Improvement
                </label>
                <textarea
                  value={improvements}
                  onChange={(e) => setImprovements(e.target.value)}
                  className="w-full min-h-[90px] bg-[#1a2438] border border-white/5 rounded-xl px-4 py-3 text-white outline-none"
                  placeholder="Write what can be improved..."
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Overall Comment
                </label>
                <textarea
                  value={overallComment}
                  onChange={(e) => setOverallComment(e.target.value)}
                  className="w-full min-h-[100px] bg-[#1a2438] border border-white/5 rounded-xl px-4 py-3 text-white outline-none"
                  placeholder="Give your final feedback..."
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={!isFormValid || submitted}
                className={`w-full py-3 rounded-xl font-bold text-lg transition ${
                  !isFormValid || submitted
                    ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {submitted ? "Review Submitted" : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AssignedReviewPage;