import { NavLink } from "react-router-dom";

const menuItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "My Labs", path: "/labs" },
  { name: "Peer Review", path: "/peer-review" },
  { name: "Grades", path: "/grades" },
  { name: "History", path: "/history" },
];

function SideBar() {
  return (
    <div className="w-64 bg-[#0f172a] border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="p-6 text-xl font-bold text-blue-400">
        LabTrack
      </div>

      {/* Menu */}
      <nav className="flex-1 px-3 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) =>
              `block px-4 py-3 rounded-lg transition ${
                isActive
                  ? "bg-[#1e293b] text-white"
                  : "text-gray-400 hover:bg-[#1e293b] hover:text-white"
              }`
            }
          >
            {item.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default SideBar;