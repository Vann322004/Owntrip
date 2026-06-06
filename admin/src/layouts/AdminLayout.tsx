import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Map, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Menu,
  Sparkles,
  ClipboardList,
  Package,
  CreditCard,
  Image
} from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Người dùng', path: '/users', icon: Users },
  { name: 'Khách sạn', path: '/hotels', icon: Map },
  { name: 'Avatar Shop', path: '/avatar-shop', icon: Sparkles },
  { name: 'Khung hình', path: '/frames', icon: Image },
  { name: 'Gói Creator', path: '/creator-packages', icon: Package },
  { name: 'Đơn Đăng kí đối tác', path: '/hotel-requests', icon: ClipboardList },
  { name: 'Quản lý Giao dịch', path: '/withdrawals', icon: CreditCard },
  { name: 'Cài đặt', path: '/settings', icon: Settings },
];



export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();

  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotiDropdown, setShowNotiDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications');
      if (response.data.success) {
        setNotifications(response.data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 20000); // Poll every 20 seconds
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotiDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string) => {
    try {
      const response = await api.patch(`/notifications/${id}/read`);
      if (response.data.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotis = notifications.filter(n => !n.isRead);
      await Promise.all(unreadNotis.map(n => api.patch(`/notifications/${n._id}/read`)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc] font-sans">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col w-64 bg-white border-r border-gray-100 transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20",
          !sidebarOpen && "-ml-64 lg:ml-0 lg:w-20"
        )}
      >
        <div className="flex items-center justify-center h-20 border-b border-gray-50 px-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="OwnTrip Logo" className="w-10 h-10 object-contain" />
            {sidebarOpen && <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 tracking-tight">OwnTrip</span>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative",
                  isActive 
                    ? "bg-blue-50 text-blue-700 font-medium" 
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={cn("w-5 h-5 transition-transform duration-200", isActive ? "scale-110" : "group-hover:scale-110")} />
                    {sidebarOpen && <span>{item.name}</span>}
                    {isActive && sidebarOpen && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-blue-600 rounded-r-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-50">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {sidebarOpen && <span className="font-medium">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative hidden md:block">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm kiếm..." 
                className="pl-10 pr-4 py-2.5 bg-gray-50 border-transparent rounded-full text-sm focus:bg-white focus:border-blue-200 focus:ring-4 focus:ring-blue-100 transition-all w-64 outline-none placeholder:text-gray-400 text-gray-700"
              />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div ref={dropdownRef} className="relative">
              <button 
                onClick={() => setShowNotiDropdown(!showNotiDropdown)}
                className="relative p-2.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors focus:outline-none"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-2 right-2.5 min-w-[16px] h-4 bg-red-500 rounded-full border-2 border-white text-[9px] font-bold text-white flex items-center justify-center px-0.5">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotiDropdown && (
                <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-50 mb-1">
                    <span className="font-bold text-gray-900 text-sm">Thông báo ({unreadCount})</span>
                    {unreadCount > 0 && (
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        Đọc tất cả
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center text-gray-400 text-xs font-medium">
                        Không có thông báo nào
                      </div>
                    ) : (
                      notifications.map((noti) => (
                        <div 
                          key={noti._id} 
                          onClick={() => handleMarkAsRead(noti._id)}
                          className={cn(
                            "px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer flex gap-3 relative border-b border-gray-50 last:border-b-0",
                            !noti.isRead && "bg-blue-50/40"
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <p className={cn("text-xs text-gray-900 mb-0.5", !noti.isRead ? "font-semibold" : "font-medium")}>
                              {noti.title}
                            </p>
                            <p className="text-[11px] text-gray-500 leading-normal line-clamp-2">
                              {noti.message}
                            </p>
                            <p className="text-[9px] text-gray-400 mt-1.5 font-medium">
                              {new Date(noti.createdAt).toLocaleString('vi-VN')}
                            </p>
                          </div>
                          {!noti.isRead && (
                            <span className="w-2 h-2 bg-blue-600 rounded-full self-center flex-shrink-0" />
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <img 
                src={user?.image || "https://i.pravatar.cc/150?img=11"} 
                alt={user?.displayName || "Admin"} 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover bg-gray-100"
              />
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-gray-900 leading-tight">
                  {user?.displayName || user?.email || "Admin User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user?.role === 'admin' ? 'Quản trị viên' : user?.role || 'User'}
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
