import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Hotel, 
  CalendarDays, 
  TrendingUp, 
  Settings, 
  LogOut,
  Bell,
  Menu,
  ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Khách sạn của tôi', path: '/my-hotels', icon: Hotel },
  { name: 'Đơn đặt phòng', path: '/bookings', icon: CalendarDays },
  { name: 'Doanh thu & GD', path: '/transactions', icon: TrendingUp },
  { name: 'Cài đặt tài khoản', path: '/settings', icon: Settings },
];

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 font-sans text-left">
      {/* Sidebar */}
      <aside
        className={`flex flex-col w-64 bg-white border-r border-slate-100 transition-all duration-300 shadow-sm z-20 ${
          !sidebarOpen ? '-ml-64 lg:ml-0 lg:w-20' : ''
        }`}
      >
        <div className="flex items-center justify-between h-20 px-6 border-b border-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-blue-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-emerald-500/30">
              H
            </div>
            {sidebarOpen && (
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 tracking-tight">
                Owntrip Host
              </span>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4">
          <nav className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative
                  ${isActive 
                    ? 'bg-emerald-50 text-emerald-700 font-semibold' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    {sidebarOpen && <span>{item.name}</span>}
                    {isActive && sidebarOpen && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-emerald-600 rounded-r-full" />
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-50">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            {sidebarOpen && <span className="font-semibold text-sm">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2.5 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="text-sm font-medium text-slate-500 flex items-center gap-1.5">
              <span>Cổng đối tác</span>
              <ChevronRight className="w-4 h-4 text-slate-300" />
              <span className="text-slate-800 font-semibold">Khách sạn</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <button className="relative p-2.5 rounded-full hover:bg-slate-100 text-slate-500 transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex items-center gap-3 cursor-pointer">
              <img 
                src={user?.image || "https://i.pravatar.cc/150?img=12"} 
                alt={user?.displayName || "Đối tác"} 
                className="w-10 h-10 rounded-full border-2 border-white shadow-sm object-cover bg-slate-100"
              />
              <div className="hidden md:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">
                  {user?.displayName || user?.email || "Đối tác"}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.role === 'admin' ? 'Quản trị viên' : 'Chủ khách sạn'}
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
