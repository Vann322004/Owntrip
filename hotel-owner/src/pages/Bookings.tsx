import { useState, useEffect } from 'react';
import { 
  CalendarDays, Search, Loader2, AlertCircle, 
  CheckCircle, XCircle, RefreshCw, Eye,
  Building, User, Phone, Mail, Clock
} from 'lucide-react';
import api from '../lib/axios';

interface Hotel {
  hotelId: string;
  name: string;
}

interface Booking {
  bookingId: string;
  guest: {
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  roomCount: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show';
  paymentMethod: string;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  specialRequests?: string;
  createdAt: string;
}

export default function Bookings() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [error, setError] = useState('');
  
  // Filtering states
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal details
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    async function loadInitialHotels() {
      try {
        setLoadingHotels(true);
        const res = await api.get('/hotels/my-hotels');
        if (res.data?.success) {
          const list: Hotel[] = res.data.data || [];
          setHotels(list);
          if (list.length > 0) {
            setSelectedHotelId(list[0].hotelId);
          }
        }
      } catch {
        setError('Không thể tải danh sách khách sạn của đối tác.');
      } finally {
        setLoadingHotels(false);
      }
    }
    loadInitialHotels();
  }, []);

  useEffect(() => {
    if (selectedHotelId) {
      loadBookings(selectedHotelId);
    }
  }, [selectedHotelId]);

  async function loadBookings(hotelId: string) {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/bookings/hotel/${hotelId}`);
      if (res.data?.success) {
        setBookings(res.data.data || []);
      }
    } catch {
      setError('Lỗi khi tải đơn đặt phòng của khách sạn.');
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (bookingId: string, newStatus: string, newPaymentStatus?: string) => {
    try {
      const payload: any = { status: newStatus };
      if (newPaymentStatus) {
        payload.paymentStatus = newPaymentStatus;
      }
      
      const res = await api.patch(`/bookings/${bookingId}/status`, payload);
      if (res.data?.success) {
        // Cập nhật lại state bookings
        setBookings(bookings.map(b => b.bookingId === bookingId ? { 
          ...b, 
          status: newStatus as any,
          paymentStatus: newPaymentStatus ? newPaymentStatus as any : b.paymentStatus 
        } : b));
        
        // Cập nhật modal đang xem nếu cần
        if (selectedBooking && selectedBooking.bookingId === bookingId) {
          setSelectedBooking({
            ...selectedBooking,
            status: newStatus as any,
            paymentStatus: newPaymentStatus ? newPaymentStatus as any : selectedBooking.paymentStatus
          });
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể cập nhật trạng thái đơn.');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn đặt phòng này?')) return;
    try {
      const res = await api.post(`/bookings/${bookingId}/cancel`, { reason: 'Hủy bởi chủ khách sạn' });
      if (res.data?.success) {
        loadBookings(selectedHotelId);
        setSelectedBooking(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Lỗi khi hủy đơn.');
    }
  };

  function formatCurrency(val: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('vi-VN');
  }

  const filteredBookings = bookings.filter(b => {
    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;
    const matchesSearch = b.guest.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.bookingId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (loadingHotels) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm font-medium">Đang tải khách sạn và đơn phòng...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Đơn đặt phòng</h1>
          <p className="text-slate-500 text-sm mt-1">Duyệt, xác nhận và quản lý trạng thái lưu trú của khách hàng</p>
        </div>

        {hotels.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Chọn khách sạn:</span>
            <select
              value={selectedHotelId}
              onChange={e => setSelectedHotelId(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 shadow-sm text-slate-800"
            >
              {hotels.map(h => (
                <option key={h.hotelId} value={h.hotelId}>{h.name}</option>
              ))}
            </select>
            <button
              onClick={() => loadBookings(selectedHotelId)}
              className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-sm"
              title="Làm mới đơn"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Main Content Area */}
      {hotels.length === 0 ? (
        <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
          <Building className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <h3 className="text-base font-bold text-slate-800">Chưa tìm thấy khách sạn</h3>
          <p className="text-slate-400 text-xs mt-1">Vui lòng tạo khách sạn trong mục "Khách sạn của tôi" trước.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Filters toolbar */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center bg-slate-50/50 justify-between">
            <div className="flex flex-wrap gap-1.5">
              {['All', 'pending', 'confirmed', 'completed', 'cancelled', 'no-show'].map(status => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
                    statusFilter === status 
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {status === 'All' ? 'Tất cả' : status === 'pending' ? 'Chờ duyệt' : status === 'confirmed' ? 'Đã xác nhận' : status === 'completed' ? 'Hoàn thành' : status === 'cancelled' ? 'Đã hủy' : 'Vắng mặt'}
                </button>
              ))}
            </div>

            <div className="relative group max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input
                type="text"
                placeholder="Tìm tên khách, mã đặt phòng..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
              />
            </div>
          </div>

          {/* Bookings list table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-emerald-500" />
                <p className="text-xs font-medium">Đang tìm kiếm đơn đặt phòng...</p>
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                <CalendarDays className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                <p className="text-sm font-medium">Không tìm thấy đơn đặt phòng nào</p>
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-3.5">Mã đơn & Ngày đặt</th>
                    <th className="px-6 py-3.5">Khách hàng</th>
                    <th className="px-6 py-3.5">Phòng / Đêm</th>
                    <th className="px-6 py-3.5">Lưu trú (Check-in/out)</th>
                    <th className="px-6 py-3.5">Tổng tiền</th>
                    <th className="px-6 py-3.5">Trạng thái</th>
                    <th className="px-6 py-3.5 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-700">
                  {filteredBookings.map(b => (
                    <tr key={b.bookingId} className="hover:bg-slate-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-xs font-mono font-bold text-slate-900">{b.bookingId}</p>
                        <p className="text-[10px] text-slate-400 mt-1">{formatDate(b.createdAt)}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-800">{b.guest.name}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{b.guest.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xs font-bold text-slate-800">{b.roomTypeName}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{b.roomCount} phòng · {b.nights} đêm</p>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        <p>{formatDate(b.checkIn)}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">đến {formatDate(b.checkOut)}</p>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900 text-xs">
                        {formatCurrency(b.totalPrice)}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : b.status === 'completed'
                            ? 'bg-blue-50 text-blue-700'
                            : b.status === 'pending'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {b.status === 'pending' ? 'Chờ duyệt' : b.status === 'confirmed' ? 'Xác nhận' : b.status === 'completed' ? 'Hoàn thành' : b.status === 'cancelled' ? 'Hủy' : 'Vắng'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-bold transition-colors inline-flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" /> Xem
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-200 text-left">
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-950 flex items-center gap-2 mb-6">
              <CalendarDays className="w-5 h-5 text-emerald-600" />
              Chi tiết đặt phòng #{selectedBooking.bookingId}
            </h3>

            {/* Guest info card */}
            <div className="bg-slate-50 rounded-2xl p-4 mb-6 space-y-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Thông tin khách hàng</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="font-semibold">{selectedBooking.guest.name}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{selectedBooking.guest.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 sm:col-span-2">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span>{selectedBooking.guest.email}</span>
                </div>
              </div>
            </div>

            {/* Stay details */}
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Ngày nhận phòng (Check-in)</p>
                  <p className="font-semibold text-slate-800 mt-1">{formatDate(selectedBooking.checkIn)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Ngày trả phòng (Check-out)</p>
                  <p className="font-semibold text-slate-800 mt-1">{formatDate(selectedBooking.checkOut)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Phòng lựa chọn</p>
                  <p className="font-semibold text-slate-800 mt-1">{selectedBooking.roomTypeName}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Số lượng</p>
                  <p className="font-semibold text-slate-800 mt-1">
                    {selectedBooking.roomCount} phòng · {selectedBooking.nights} đêm
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Phương thức thanh toán</p>
                  <p className="font-semibold text-slate-800 mt-1 uppercase">{selectedBooking.paymentMethod}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Thanh toán</p>
                  <p className="font-semibold text-slate-800 mt-1 uppercase">{selectedBooking.paymentStatus}</p>
                </div>
              </div>

              {selectedBooking.specialRequests && (
                <div className="pb-4 border-b border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Yêu cầu đặc biệt</p>
                  <p className="text-slate-600 mt-1 italic leading-relaxed">{selectedBooking.specialRequests}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2">
                <span className="text-sm font-bold text-slate-900">Tổng thanh toán:</span>
                <span className="text-base font-bold text-emerald-600">{formatCurrency(selectedBooking.totalPrice)}</span>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="mt-8 pt-4 border-t border-slate-100 flex flex-wrap gap-2 justify-end">
              {selectedBooking.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.bookingId, 'confirmed', 'paid')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm shadow-emerald-500/10"
                  >
                    <CheckCircle className="w-4 h-4" /> Xác nhận & Thanh toán
                  </button>
                  <button
                    onClick={() => handleCancelBooking(selectedBooking.bookingId)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-semibold"
                  >
                    <XCircle className="w-4 h-4" /> Từ chối đơn
                  </button>
                </>
              )}

              {selectedBooking.status === 'confirmed' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.bookingId, 'completed')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold"
                  >
                    <CheckCircle className="w-4 h-4" /> Đã hoàn thành lưu trú
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(selectedBooking.bookingId, 'no-show')}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
                  >
                    <Clock className="w-4 h-4" /> Đánh dấu Vắng mặt (No-Show)
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
