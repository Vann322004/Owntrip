import { useState, useEffect } from 'react';
import { 
  Building2, CalendarDays, TrendingUp, Star, Loader2, 
  ArrowUpRight, AlertCircle, ShoppingBag
} from 'lucide-react';
import api from '../lib/axios';

interface Hotel {
  hotelId: string;
  name: string;
  starRating: number;
  address: {
    fullAddress: string;
    city: string;
  };
  reviewSummary?: {
    score: number;
    count: number;
  };
}

interface Booking {
  bookingId: string;
  guest: {
    name: string;
    email: string;
    phone: string;
  };
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomCount: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  createdAt: string;
}

export default function Dashboard() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        setError('');
        
        // 1. Lấy danh sách khách sạn
        const hotelsRes = await api.get('/hotels/my-hotels');
        if (hotelsRes.data?.success) {
          const list: Hotel[] = hotelsRes.data.data || [];
          setHotels(list);

          // 2. Lấy bookings cho từng khách sạn
          const allBookings: Booking[] = [];
          for (const hotel of list) {
            try {
              const bookingsRes = await api.get(`/bookings/hotel/${hotel.hotelId}`);
              if (bookingsRes.data?.success) {
                allBookings.push(...(bookingsRes.data.data || []));
              }
            } catch (err) {
              console.error(`Lỗi tải đơn của hotel ${hotel.hotelId}:`, err);
            }
          }
          // Sắp xếp booking mới nhất lên đầu
          allBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setBookings(allBookings);
        }
      } catch (err: any) {
        setError('Không thể tải thông tin Dashboard. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    }

    loadDashboardData();
  }, []);

  // Tính toán số liệu thống kê
  const totalRevenue = bookings
    .filter(b => b.paymentStatus === 'paid' && b.status !== 'cancelled')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const pendingBookings = bookings.filter(b => b.status === 'pending').length;

  function formatCurrency(val: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm font-medium">Đang tải dữ liệu báo cáo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3">
        <AlertCircle className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Chào buổi sáng!</h1>
        <p className="text-slate-500 text-sm mt-1">Dưới đây là thông số hoạt động của các khách sạn của bạn.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Doanh thu */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 relative overflow-hidden group">
          <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600 transition-colors group-hover:bg-emerald-600 group-hover:text-white">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Doanh thu thực</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(totalRevenue)}</p>
          </div>
          <ArrowUpRight className="absolute top-4 right-4 w-4 h-4 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        {/* Khách sạn */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 relative overflow-hidden group">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Khách sạn sở hữu</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{hotels.length}</p>
          </div>
        </div>

        {/* Tổng đặt phòng */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 relative overflow-hidden group">
          <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tổng Đơn Đặt</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{bookings.length}</p>
          </div>
        </div>

        {/* Chờ duyệt */}
        <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] flex items-center gap-4 relative overflow-hidden group">
          <div className="bg-amber-50 p-4 rounded-2xl text-amber-600 transition-colors group-hover:bg-amber-600 group-hover:text-white">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Đơn chờ duyệt</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{pendingBookings}</p>
          </div>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Bookings */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Đặt phòng gần đây</h2>
            <span className="text-xs text-slate-400 font-semibold">Hiện {Math.min(bookings.length, 5)} đơn</span>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <CalendarDays className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="text-sm">Chưa có đơn đặt phòng nào</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {bookings.slice(0, 5).map(b => (
                <div key={b.bookingId} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{b.guest.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {b.roomTypeName} · {b.nights} đêm · {b.roomCount} phòng
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1">{b.bookingId}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">{formatCurrency(b.totalPrice)}</p>
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold mt-1.5 ${
                      b.status === 'confirmed' || b.status === 'completed'
                        ? 'bg-emerald-50 text-emerald-700'
                        : b.status === 'pending'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {b.status === 'confirmed' ? 'Thành công' : b.status === 'pending' ? 'Chờ duyệt' : b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hotels Summary Card */}
        <div className="bg-white border border-slate-100 rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] p-6 space-y-4">
          <h2 className="text-base font-bold text-slate-900">Danh sách khách sạn</h2>
          
          {hotels.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Building2 className="w-12 h-12 mx-auto mb-3 text-slate-200" />
              <p className="text-sm">Bạn chưa tạo khách sạn nào</p>
            </div>
          ) : (
            <div className="space-y-4">
              {hotels.map(h => (
                <div key={h.hotelId} className="flex items-center gap-3 p-3 rounded-2xl border border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500 font-bold">
                    {h.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-slate-800 truncate">{h.name}</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">{h.address.city}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                      <span className="text-[10px] text-slate-500 font-semibold">
                        {h.reviewSummary?.score.toFixed(1) || '0.0'} ({h.reviewSummary?.count || 0})
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
