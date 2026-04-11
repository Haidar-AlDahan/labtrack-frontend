import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";

const assignedReviews = [
  {
    id: 1,
    labId: 7,
    title: "Peer Review - Lab 7",
    course: "ICS 202 - SEC 03",
    studentLabel: "Anonymous Submission",
    dueText: "Due in 2 days",
    submittedAt: "Submitted Feb 28",
    status: "Pending",
  },
  {
    id: 2,
    labId: 8,
    title: "Peer Review - Lab 8",
    course: "ICS 202 - SEC 03",
    studentLabel: "Anonymous Submission",
    dueText: "Completed",
    submittedAt: "Submitted Mar 02",
    status: "Completed",
  },
];

const receivedReviews = [
  {
    id: 101,
    labId: 6,
    title: "Lab 6 Feedback",
    course: "ICS 202 - SEC 03",
    reviewCount: 2,
    averageRating: 4.3,
    status: "Available",
  },
  {
    id: 102,
    labId: 5,
    title: "Lab 5 Feedback",
    course: "ICS 202 - SEC 03",
    reviewCount: 1,
    averageRating: 3.7,
    status: "Available",
  },
];

function StatusBadge({ text, type = "default" }) {
  const styles = {
    pending: "bg-yellow-500/20 text-yellow-400",
    completed: "bg-green-500/20 text-green-400",
    available: "bg-cyan-500/20 text-cyan-400",
    default: "bg-slate-700 text-slate-200",
  };

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${
        styles[type] || styles.default
      }`}
    >
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

function PeerReviewsPage() {
  const navigate = useNavigate();

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
          <SectionCard title="Assigned Reviews">
            {assignedReviews.map((review) => (
              <div
                key={review.id}
                className="bg-[#1a2438] border border-white/5 rounded-xl p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white">{review.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{review.course}</p>
                  <p className="text-sm text-slate-400">{review.studentLabel}</p>
                  <p className="text-sm text-slate-500 mt-2">{review.submittedAt}</p>
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[140px]">
                  <StatusBadge
                    text={review.status}
                    type={review.status === "Pending" ? "pending" : "completed"}
                  />
                  <span className="text-sm text-yellow-400 font-medium">
                    {review.dueText}
                  </span>
                  <button
                    onClick={() => navigate(`/peer-reviews/assigned/${review.id}`)}
                    className="bg-blue-500 hover:bg-blue-600 transition px-4 py-2 rounded-lg text-white font-semibold text-sm"
                  >
                    {review.status === "Pending" ? "Open Review" : "View Review"}
                  </button>
                </div>
              </div>
            ))}
          </SectionCard>

          <SectionCard title="Reviews Received">
            {receivedReviews.map((review) => (
              <div
                key={review.id}
                className="bg-[#1a2438] border border-white/5 rounded-xl p-5 flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-lg font-semibold text-white">{review.title}</h3>
                  <p className="text-sm text-slate-400 mt-1">{review.course}</p>
                  <p className="text-sm text-slate-400">
                    {review.reviewCount} review{review.reviewCount > 1 ? "s" : ""} received
                  </p>
                  <p className="text-sm text-cyan-400 mt-2 font-medium">
                    Average rating: {review.averageRating}/5
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3 min-w-[140px]">
                  <StatusBadge text={review.status} type="available" />
                  <button
                    onClick={() => navigate(`/peer-reviews/received/${review.id}`)}
                    className="bg-blue-500 hover:bg-blue-600 transition px-4 py-2 rounded-lg text-white font-semibold text-sm"
                  >
                    View Feedback
                  </button>
                </div>
              </div>
            ))}
          </SectionCard>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default PeerReviewsPage;