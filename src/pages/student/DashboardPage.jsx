import DashboardLayout from "../../components/layout/DashboardLayout";

function DashboardPage() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};

  const stats = [
    { value: "8", label: "Labs Completed", color: "text-cyan-400" },
    { value: "2", label: "Pending", color: "text-yellow-400" },
    { value: "87%", label: "Avg Score", color: "text-green-400" },
    { value: "3", label: "Reviews due", color: "text-cyan-400" },
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
      </div>
    </DashboardLayout>
  );
}

export default DashboardPage;
