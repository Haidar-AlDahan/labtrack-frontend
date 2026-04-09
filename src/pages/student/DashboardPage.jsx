import DashboardLayout from "../../components/layout/DashboardLayout";
import { useNavigate } from "react-router-dom";

function DashboardPage() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};
  const navigate = useNavigate();
  const stats = [
    { value: "8", label: "Labs Completed", color: "text-cyan-400" },
    { value: "2", label: "Pending", color: "text-yellow-400" },
    { value: "87%", label: "Avg Score", color: "text-green-400" },
    { value: "3", label: "Reviews due", color: "text-cyan-400" },
  ];
  const getProgressColor = (progress) => {
    if (progress <= 60) return "bg-red-500";
    if (progress <= 80) return "bg-yellow-400";
    return "bg-green-500";
  };
  const activeLabs = [
    {
      id: 1,
      title: "Lab 3: React Components",
      dueDate: "Due Apr 12",
      progress: 75,
      status: "In Progress",
      route: "/labs",
    },
    {
      id: 2,
      title: "Lab 4: State and Props",
      dueDate: "Due Apr 15",
      progress: 40,
      status: "Pending Review",
      route: "/labs",
    },
  ];
  const recentActivities = [
    {
      id: 1,
      text: "Submitted Lab 2: JavaScript Basics",
      time: "2 hours ago",
    },
    {
      id: 2,
      text: "Received feedback on Lab 1",
      time: "Yesterday",
    },
    {
      id: 3,
      text: "New grade posted for Quiz 1",
      time: "2 days ago",
    },
  ];
  const today = new Date();

  const formattedDate = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
  const hour = new Date().getHours();

  let greeting = "Good morning";
  if (hour >= 12 && hour < 18) greeting = "Good afternoon";
  if (hour >= 18) greeting = "Good evening";

  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-white">
          {greeting}, {currentUser.fullName || "Student"} 👋
        </h1>

        <p className="mt-2 text-gray-400">{formattedDate}</p>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl bg-[#1a2238] p-6 shadow-sm"
            >
              <h2 className={`text-4xl font-bold ${stat.color}`}>
                {stat.value}
              </h2>
              <p className="mt-2 text-lg text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 grid grid-cols-1 gap-8 xl:grid-cols-3">
          {/* Left side - Active Labs */}
          <div className="xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-white">Active Labs</h2>
              <button
                onClick={() => navigate("/labs")}
                className="text-sm font-medium text-cyan-400 hover:text-cyan-300"
              >
                View all
              </button>
            </div>

            <div className="space-y-6">
              {activeLabs.map((lab) => (
                <div
                  key={lab.id}
                  className="rounded-3xl bg-[#1a2238] p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white">
                        {lab.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-400">
                        {lab.dueDate}
                      </p>
                    </div>

                    <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-400">
                      {lab.status}
                    </span>
                  </div>
                  <div className="mt-6">
                    <div className="mb-2 flex justify-between text-sm text-gray-400">
                      <span>Progress</span>
                      <span>{lab.progress}%</span>
                    </div>

                    <div className="h-2 w-full rounded-full bg-[#0f172a]">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(lab.progress)}`}
                        style={{ width: `${lab.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <button
                      onClick={() => navigate(lab.route)}
                      className="rounded-full bg-cyan-400 px-5 py-2 text-sm font-semibold text-[#0b1220] hover:bg-cyan-300"
                    >
                      Open Lab
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right side - Recent Activity */}
          <div>
            <h2 className="mb-4 text-2xl font-semibold text-white">
              Recent Activity
            </h2>

            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="mt-2 h-3 w-3 rounded-full bg-cyan-400"></div>

                  <div>
                    <p className="text-lg font-medium text-white">
                      {activity.text}
                    </p>
                    <p className="text-sm text-gray-400">{activity.time}</p>
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

export default DashboardPage;
