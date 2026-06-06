import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Users from './pages/Users';
import Hotels from './pages/Hotels';
import AvatarShop from './pages/AvatarShop';
import SettingsPage from './pages/Settings';
import HotelRequests from './pages/HotelRequests';
import CreatorPackages from './pages/CreatorPackages';
import Withdrawals from './pages/Withdrawals';
import Frames from './pages/Frames';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Các route yêu cầu đăng nhập */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="hotels" element={<Hotels />} />
            <Route path="avatar-shop" element={<AvatarShop />} />
            <Route path="frames" element={<Frames />} />
            <Route path="creator-packages" element={<CreatorPackages />} />
            <Route path="hotel-requests" element={<HotelRequests />} />
            <Route path="withdrawals" element={<Withdrawals />} />
            <Route path="settings" element={<SettingsPage />} />
            {/* Thêm các trang quản trị khác ở đây */}
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
