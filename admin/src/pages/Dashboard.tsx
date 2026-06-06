import { useState, useEffect } from 'react';
import { Users, DollarSign, MoreHorizontal, ArrowUpRight, ArrowDownRight, Loader2, Wallet, Hotel, ShoppingBag, Sparkles, X } from 'lucide-react';
import api from '../lib/axios';
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface DashboardData {
  totalUsers: number;
  usersChange: number;
  totalHotels: number;
  hotelsChange: number;
  pendingHotelRequests: number;
  pendingWithdrawals: number;
  tripsThisMonth: number;
  tripsChange: number;
  totalRevenue: number;
  totalBookingRevenue?: number;
  totalOrderRevenue?: number;
  totalCreatorRevenue?: number;
  revenueThisMonth: number;
  revenueChange: number;
  totalBookings: number;
  bookingsThisMonth: number;
  bookingsChange: number;
  recentBookings: {
    id: string;
    user: string;
    userAvatar?: string | null;
    destination: string;
    date: string;
    amount: number;
    status: string;
  }[];
  monthlyRevenue: number[];
  monthlyRevenueBreakdown?: {
    booking: number;
    order: number;
    creator: number;
    total: number;
  }[];
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
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number | null>(null);
  const [isTotalRevenueModalOpen, setIsTotalRevenueModalOpen] = useState(false);

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
    { name: 'Tổng khách sạn', value: data.totalHotels.toLocaleString(), change: data.hotelsChange, icon: Hotel, color: 'text-emerald-600', bg: 'bg-emerald-100' },
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
            <div 
              key={stat.name} 
              className={cn(
                "bg-white rounded-2xl p-6 shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] transition-all duration-300 group",
                stat.name === 'Tổng doanh thu' && "cursor-pointer hover:border-violet-200 hover:shadow-[0_8px_30px_rgba(109,40,217,0.08)]"
              )}
              onClick={stat.name === 'Tổng doanh thu' ? () => setIsTotalRevenueModalOpen(true) : undefined}
            >
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
                <div className="flex items-center gap-1.5">
                  <h3 className="text-gray-500 text-sm font-medium">{stat.name}</h3>
                  {stat.name === 'Tổng doanh thu' && (
                    <span className="text-[10px] text-violet-500 font-semibold bg-violet-50 px-1.5 py-0.5 rounded">Chi tiết</span>
                  )}
                </div>
                <p className="text-3xl font-bold text-gray-900 mt-1 tracking-tight">{stat.value}</p>
                {stat.name === 'Tổng doanh thu' && (
                  <p className="text-[11px] text-gray-400 mt-1 group-hover:text-violet-500 transition-colors">Nhấp để xem nguồn thu</p>
                )}
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
              const barHeight = revenue > 0 ? Math.max(heightPercent, 2) : 0;
              return (
                <div key={i} className="h-full w-full bg-blue-50 rounded-t-lg relative group cursor-pointer" onClick={() => setSelectedMonthIndex(i)}>
                  <div
                    className="absolute bottom-0 w-full bg-blue-600 rounded-t-lg group-hover:bg-blue-500 transition-colors"
                    style={{ height: `${barHeight}%` }}
                  ></div>
                  
                  {/* Premium Hover Tooltip */}
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] font-semibold px-2 py-1 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none whitespace-nowrap z-10 flex flex-col items-center scale-95 group-hover:scale-100">
                    <span className="text-gray-400 text-[9px]">{chartLabels[i]}</span>
                    <span className="text-white font-bold">{revenue.toLocaleString()}đ</span>
                    <div className="w-1.5 h-1.5 bg-gray-900 rotate-45 absolute left-1/2 -translate-x-1/2" style={{ bottom: '-3px' }}></div>
                  </div>
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
                    {booking.userAvatar ? (
                      <img 
                        src={booking.userAvatar} 
                        alt={booking.user} 
                        className="w-10 h-10 rounded-full object-cover border border-gray-100 shadow-sm"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-600 text-sm">
                        {booking.user.charAt(0)}
                      </div>
                    )}
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

      {/* Revenue Breakdown Modal */}
      {selectedMonthIndex !== null && data.monthlyRevenueBreakdown && data.monthlyRevenueBreakdown[selectedMonthIndex] && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setSelectedMonthIndex(null)}>
          <div 
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedMonthIndex(null)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">Chi tiết doanh thu</span>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                Tháng {chartLabels[selectedMonthIndex]}
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Phân tích các nguồn thu nhập thực tế trong tháng.
              </p>
            </div>

            {/* Breakdown Content */}
            <div className="space-y-5">
              {(() => {
                const breakdown = data.monthlyRevenueBreakdown[selectedMonthIndex];
                const total = breakdown.total || 1; // avoid division by zero
                const bookingPercent = Math.round((breakdown.booking / total) * 100);
                const orderPercent = Math.round((breakdown.order / total) * 100);
                const creatorPercent = Math.round((breakdown.creator / total) * 100);

                const items = [
                  { 
                    name: 'Hoa hồng đặt phòng (10%)', 
                    value: breakdown.booking, 
                    percent: bookingPercent,
                    color: 'bg-violet-600',
                    textColor: 'text-violet-600',
                    bgColor: 'bg-violet-50',
                    icon: Hotel 
                  },
                  { 
                    name: 'Mua vật phẩm Shop', 
                    value: breakdown.order, 
                    percent: orderPercent,
                    color: 'bg-blue-600',
                    textColor: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    icon: ShoppingBag 
                  },
                  { 
                    name: 'Gói Creator', 
                    value: breakdown.creator, 
                    percent: creatorPercent,
                    color: 'bg-amber-600',
                    textColor: 'text-amber-600',
                    bgColor: 'bg-amber-50',
                    icon: Sparkles 
                  },
                ];

                return (
                  <>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.name} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${item.bgColor} ${item.textColor}`}>
                                <item.icon className="w-5 h-5" />
                              </div>
                              <span className="text-sm font-bold text-gray-800">{item.name}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{item.value.toLocaleString()}đ</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${item.color} rounded-full transition-all duration-500`}
                              style={{ width: `${item.percent}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-end mt-1">
                            <span className="text-[10px] font-bold text-gray-400">{item.percent}% doanh thu</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 pt-6 mt-6 flex justify-between items-center">
                      <div>
                        <span className="text-gray-500 text-xs font-medium">Tổng doanh thu tháng</span>
                        <p className="text-2xl font-bold text-gray-900 tracking-tight">{breakdown.total.toLocaleString()}đ</p>
                      </div>
                      <button 
                        onClick={() => setSelectedMonthIndex(null)}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-blue-600/20"
                      >
                        Đóng
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Total Revenue Breakdown Modal */}
      {isTotalRevenueModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200" onClick={() => setIsTotalRevenueModalOpen(false)}>
          <div 
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-in zoom-in-95 slide-in-from-bottom-4 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => setIsTotalRevenueModalOpen(false)}
              className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="mb-6">
              <span className="text-[11px] font-bold text-violet-600 uppercase tracking-wider">Tổng quan tài chính</span>
              <h3 className="text-2xl font-bold text-gray-900 mt-1">
                Phân tích tổng doanh thu
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Thống kê lũy kế các nguồn thu nhập từ trước đến nay.
              </p>
            </div>

            {/* Breakdown Content */}
            <div className="space-y-5">
              {(() => {
                const totalBookingVal = data.totalBookingRevenue || 0;
                const totalOrderVal = data.totalOrderRevenue || 0;
                const totalCreatorVal = data.totalCreatorRevenue || 0;
                const totalVal = data.totalRevenue || 1; // avoid division by zero
                
                const bookingPercent = Math.round((totalBookingVal / totalVal) * 100);
                const orderPercent = Math.round((totalOrderVal / totalVal) * 100);
                const creatorPercent = Math.round((totalCreatorVal / totalVal) * 100);

                const items = [
                  { 
                    name: 'Hoa hồng đặt phòng (10%)', 
                    value: totalBookingVal, 
                    percent: bookingPercent,
                    color: 'bg-violet-600',
                    textColor: 'text-violet-600',
                    bgColor: 'bg-violet-50',
                    icon: Hotel 
                  },
                  { 
                    name: 'Mua vật phẩm Shop', 
                    value: totalOrderVal, 
                    percent: orderPercent,
                    color: 'bg-blue-600',
                    textColor: 'text-blue-600',
                    bgColor: 'bg-blue-50',
                    icon: ShoppingBag 
                  },
                  { 
                    name: 'Gói Creator', 
                    value: totalCreatorVal, 
                    percent: creatorPercent,
                    color: 'bg-amber-600',
                    textColor: 'text-amber-600',
                    bgColor: 'bg-amber-50',
                    icon: Sparkles 
                  },
                ];

                return (
                  <>
                    <div className="space-y-4">
                      {items.map((item) => (
                        <div key={item.name} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                          <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${item.bgColor} ${item.textColor}`}>
                                <item.icon className="w-5 h-5" />
                              </div>
                              <span className="text-sm font-bold text-gray-800">{item.name}</span>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{item.value.toLocaleString()}đ</span>
                          </div>
                          
                          {/* Progress bar */}
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`h-full ${item.color} rounded-full transition-all duration-500`}
                              style={{ width: `${item.percent}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-end mt-1">
                            <span className="text-[10px] font-bold text-gray-400">{item.percent}% tổng doanh thu</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-gray-100 pt-6 mt-6 flex justify-between items-center">
                      <div>
                        <span className="text-gray-500 text-xs font-medium">Tổng doanh thu lũy kế</span>
                        <p className="text-2xl font-bold text-gray-900 tracking-tight">{data.totalRevenue.toLocaleString()}đ</p>
                      </div>
                      <button 
                        onClick={() => setIsTotalRevenueModalOpen(false)}
                        className="px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-lg shadow-violet-600/20"
                      >
                        Đóng
                      </button>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
