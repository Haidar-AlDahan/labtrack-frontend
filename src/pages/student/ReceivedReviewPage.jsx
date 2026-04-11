import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";

const receivedReviewData = {
  101: {
    id: 101,
    title: "Lab 6 Feedback",
    course: "ICS 202 - SEC 03",
    files: ["solution.py"],
    fileContents: {
      "solution.py": `def binary_search(arr, target):
    left = 0
    right = len(arr) - 1

    while left <= right:
        mid = (left + right) // 2

        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1

    return -1
`,
    },
    reviews: [
      {
        reviewer: "Reviewer 1",
        readability: 4,
        efficiency: 5,
        comments: 3,
        strengths:
          "Good structure and the binary search logic is correct. Variable naming is clear.",
        improvements:
          "Add short comments for the loop and edge cases like empty input.",
        overall:
          "Strong solution overall. A bit more explanation would improve readability.",
      },
      {
        reviewer: "Reviewer 2",
        readability: 5,
        efficiency: 4,
        comments: 2,
        strengths:
          "Clean code and easy to follow. Good use of iterative approach.",
        improvements:
          "Could include more comments and maybe test examples in the file.",
        overall:
          "Well done. The main issue is limited documentation inside the code.",
      },
    ],
  },
  102: {
    id: 102,
    title: "Lab 5 Feedback",
    course: "ICS 202 - SEC 03",
    files: ["solution.py"],
    fileContents: {
      "solution.py": `def factorial(n):
    if n == 0:
        return 1
    return n * factorial(n - 1)
`,
    },
    reviews: [
      {
        reviewer: "Reviewer 1",
        readability: 3,
        efficiency: 3,
        comments: 2,
        strengths: "The logic is short and correct for the main case.",
        improvements: "Handle invalid input and explain recursion more clearly.",
        overall: "Works, but needs stronger edge case handling.",
      },
    ],
  },
};

function renderStars(value) {
  return "★".repeat(value) + "☆".repeat(5 - value);
}

function ReceivedReviewPage() {
  const { reviewId } = useParams();

  const reviewData = useMemo(() => {
    return receivedReviewData[reviewId] || receivedReviewData[101];
  }, [reviewId]);

  const [activeFile, setActiveFile] = useState(reviewData.files[0]);

  const average =
    reviewData.reviews.reduce(
      (sum, review) =>
        sum + (review.readability + review.efficiency + review.comments) / 3,
      0
    ) / reviewData.reviews.length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="border border-cyan-400 rounded-2xl bg-[#111a2e] px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">{reviewData.title}</h1>
            <p className="text-slate-400 mt-2">{reviewData.course}</p>
          </div>
          <div className="bg-cyan-500/20 text-cyan-400 font-bold px-5 py-2 rounded-full text-sm">
            Avg Rating {average.toFixed(1)}/5
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          {/* Left */}
          <div className="xl:col-span-2 bg-[#111a2e] border border-white/5 rounded-2xl p-5">
            <p className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-4">
              Feedback Summary
            </p>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-slate-500">Reviews received</p>
                <p className="text-white font-semibold">{reviewData.reviews.length}</p>
              </div>

              <div>
                <p className="text-slate-500">Average score</p>
                <p className="text-cyan-400 font-semibold">{average.toFixed(1)}/5</p>
              </div>

              <div>
                <p className="text-slate-500 mb-2">Files</p>
                <div className="space-y-2">
                  {reviewData.files.map((file) => (
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
          <div className="xl:col-span-5 bg-[#111a2e] border border-white/5 rounded-2xl overflow-hidden">
            <div className="border-b border-white/5 px-5 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Your Submission</h2>
              <span className="text-sm text-slate-400">{activeFile}</span>
            </div>

            <div className="p-5">
              <pre className="bg-[#09111f] rounded-xl p-5 overflow-x-auto text-sm text-slate-200 leading-7 font-mono border border-cyan-500/10 min-h-[550px] whitespace-pre-wrap">
                {reviewData.fileContents[activeFile]}
              </pre>
            </div>
          </div>

          {/* Right */}
          <div className="xl:col-span-5 bg-[#111a2e] border border-white/5 rounded-2xl p-5">
            <h2 className="text-2xl font-bold text-white mb-6">Classmate Feedback</h2>

            <div className="space-y-5 max-h-[700px] overflow-y-auto pr-1">
              {reviewData.reviews.map((review, index) => (
                <div
                  key={index}
                  className="bg-[#1a2438] border border-white/5 rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">{review.reviewer}</h3>
                    <span className="text-cyan-400 font-semibold">
                      {(
                        (review.readability + review.efficiency + review.comments) /
                        3
                      ).toFixed(1)}
                      /5
                    </span>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div>
                      <p className="text-slate-400">Code Readability</p>
                      <p className="text-yellow-400">{renderStars(review.readability)}</p>
                    </div>

                    <div>
                      <p className="text-slate-400">Algorithm Efficiency</p>
                      <p className="text-yellow-400">{renderStars(review.efficiency)}</p>
                    </div>

                    <div>
                      <p className="text-slate-400">Code Comments</p>
                      <p className="text-yellow-400">{renderStars(review.comments)}</p>
                    </div>

                    <div>
                      <p className="text-slate-400">Strengths</p>
                      <p className="text-white">{review.strengths}</p>
                    </div>

                    <div>
                      <p className="text-slate-400">Areas of Improvement</p>
                      <p className="text-white">{review.improvements}</p>
                    </div>

                    <div>
                      <p className="text-slate-400">Overall Comment</p>
                      <p className="text-white">{review.overall}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ReceivedReviewPage;