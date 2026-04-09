import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "../pages/auth/LoginPage.jsx";
import DashboardPage from "../pages/student/DashboardPage.jsx";
import LabsPage from "../pages/student/LabsPage.jsx";
import LabWorkspacePage from "../pages/student/LabWorkspacePage.jsx";
import GradesPage from "../pages/student/GradesPage.jsx";
import UserManagementPage from "../pages/admin/UserManagementPage.jsx";
import LabsManagementPage from "../pages/instructor/LabsManagementPage.jsx";
import CreateLabPage from "../pages/instructor/CreateLabPage.jsx";
import SubmissionsPage from "../pages/instructor/SubmissionsPage.jsx";
import GradingPage from "../pages/instructor/GradingPage.jsx";
import AnalyticsPage from "../pages/instructor/AnalyticsPage.jsx";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/labs" element={<LabsPage />} />
        <Route path="/labs/:labId" element={<LabWorkspacePage />} />
        <Route path="/grades" element={<GradesPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
        {/* Instructor routes */}
        <Route path="/instructor/labs" element={<LabsManagementPage />} />
        <Route path="/instructor/labs/create" element={<CreateLabPage />} />
        <Route path="/instructor/labs/:labId/edit" element={<CreateLabPage />} />
        <Route path="/instructor/labs/:labId/submissions" element={<SubmissionsPage />} />
        <Route path="/instructor/labs/:labId/submissions/:subId/grade" element={<GradingPage />} />
        <Route path="/instructor/analytics" element={<AnalyticsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
