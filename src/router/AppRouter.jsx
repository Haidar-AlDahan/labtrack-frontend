import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage.jsx';
import DashboardPage from '../pages/student/DashboardPage.jsx';
import LabWorkspacePage from '../pages/student/LabWorkspacePage.jsx';
import GradesPage from '../pages/student/GradesPage.jsx';
import UserManagementPage from '../pages/admin/UserManagementPage.jsx';

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/lab" element={<LabWorkspacePage />} />
        <Route path="/grades" element={<GradesPage />} />
        <Route path="/admin/users" element={<UserManagementPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;