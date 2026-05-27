import { useState, useEffect } from 'react';
import { Users, Map, DollarSign, MoreHorizontal, ArrowUpRight, ArrowDownRight, Loader2, Wallet } from 'lucide-react';
import api from '../lib/axios';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DashboardData {
  totalUsers: number;
  usersChange: number;
  tripsThisMonth: number;
  tripsChange: number;
  totalRevenue: number;
  revenueThisMonth: number;
  revenueChange: number;
  totalBookings: number;
  bookingsThisMonth: number;
  bookingsChange: number;
  recentBookings: {
    id: string;
    user: string;
    destination: string;
    date: string;
    amount: number;
    status: string;
  }[];
  monthlyRevenue: number[];
  adminWalletBalance: number;
}

const MONTH_LABELS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return value.toLocaleString();
}

function getMonthLabels(): string[] {
  const now = new Date();
  const labels: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const monthIndex = (now.getMonth() - i + 12) % 12;
    labels.push(MONTH_LABELS[monthIndex]);
  }
  return labels;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get('/system/dashboard-stats');
        setData(response.data.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96 text-gray-500">
        Không thể tải dữ liệu Dashboard.
      </div>
    );
  }

  const stats = [
    { name: 'Tổng người dùng', value: data.totalUsers.toLocaleString(), change: data.usersChange, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Chuyến đi tháng này', value: data.tripsThisMonth.toLocaleString(), change: data.tripsChange, icon: Map, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { name: 'Tổng doanh thu', value: `${formatCurrency(data.totalRevenue)}đ`, change: data.revenueChange, icon: DollarSign, color: 'text-violet-600', bg: 'bg-violet-100' },
    { name: 'Số dư ví hệ thống', value: `${formatCurrency(data.adminWalletBalance)}đ`, change: null as any, icon: Wallet, color: 'text-orange-600', bg: 'bg-orange-100' },
  ];

  const maxRevenue = Math.max(...data.monthlyRevenue, 1);
  const chartLabels = getMonthLabels();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Dashboard tổng quan</h1>
          <p className="text-gray-500 mt-2 text-sm">Dữ liệu thực từ hệ thống OwnTrip.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const isPositive = stat.change >= 0;
          return (
            <div key={stat.name} className="bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group">
              <div className="flex justify-between items-start">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                {stat.change !== null && stat.change !== 0 && (
                  <div className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium",
                    isPositive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                  )}>
                    {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {isPositive ? '+' : ''}{stat.change}%
                  </div>
                )}
              </div>
              <div className="mt-5">
                <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
                <p className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Doanh thu theo tháng</h2>
              <p className="text-sm text-gray-500">12 tháng gần nhất · Tổng: {data.totalRevenue.toLocaleString()}đ</p>
            </div>
            <button className="p-2 hover:bg-gray-50 rounded-lg text-gray-400">
              <MoreHorizontal className="w-5 h-5" />
            </button>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {data.monthlyRevenue.map((revenue, i) => {
              const heightPercent = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
              return (
                <div key={i} className="w-full bg-blue-50 rounded-t-lg relative group cursor-pointer" title={`${chartLabels[i]}: ${revenue.toLocaleString()}đ`}>
                  <div
                    className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg group-hover:bg-blue-500 transition-colors"
                    style={{ height: `${Math.max(heightPercent, 2)}%` }}
                  ></div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between mt-4 text-xs font-medium text-gray-400 px-1">
            {chartLabels.map((label, i) => (
              <span key={i}>{label}</span>
            ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white rounded-3xl p-8 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900">Đặt chỗ gần đây</h2>
          </div>
          <div className="space-y-6">
            {data.recentBookings.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Chưa có đặt chỗ nào</p>
            ) : (
              data.recentBookings.map((booking, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm">
                      {booking.user.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{booking.user}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{booking.destination}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">{booking.amount.toLocaleString()}đ</p>
                    <span className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 inline-block",
                      booking.status === 'Hoàn thành' ? "bg-emerald-100 text-emerald-700" :
                        booking.status === 'Đang xử lý' ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                    )}>
                      {booking.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
