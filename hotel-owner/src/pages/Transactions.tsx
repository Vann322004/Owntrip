import { useState, useEffect } from 'react';
import { 
  TrendingUp, ArrowDownLeft, ArrowUpRight, Loader2, 
  AlertCircle, RefreshCw, DollarSign
} from 'lucide-react';
import api from '../lib/axios';

interface Hotel {
  hotelId: string;
  name: string;
}

interface Transaction {
  bookingId: string;
  guestName: string;
  roomTypeName: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  amount: number;
  paymentMethod: string;
  paymentStatus: 'paid' | 'refunded';
  bookingStatus: string;
  refundAmount: number;
  createdAt: string;
}

interface Summary {
  totalRevenue: number;
  totalRefunded: number;
  netRevenue: number;
  transactionCount: number;
}

export default function Transactions() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotelId, setSelectedHotelId] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary>({
    totalRevenue: 0,
    totalRefunded: 0,
    netRevenue: 0,
    transactionCount: 0
  });
  const [loading, setLoading] = useState(false);
  const [loadingHotels, setLoadingHotels] = useState(true);
  const [error, setError] = useState('');

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
      loadTransactions(selectedHotelId);
    }
  }, [selectedHotelId]);

  async function loadTransactions(hotelId: string) {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/bookings/hotel/${hotelId}/transactions`);
      if (res.data?.success) {
        setTransactions(res.data.data || []);
        setSummary(res.data.summary || {
          totalRevenue: 0,
          totalRefunded: 0,
          netRevenue: 0,
          transactionCount: 0
        });
      }
    } catch {
      setError('Lỗi khi tải thông tin giao dịch của khách sạn.');
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(val: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  }

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('vi-VN');
  }

  if (loadingHotels) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm font-medium">Đang tải lịch sử tài chính...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Doanh thu & Giao dịch</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý dòng tiền, giao dịch thanh toán và hoàn trả tiền phòng</p>
        </div>

        {hotels.length > 0 && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase">Khách sạn:</span>
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
              onClick={() => loadTransactions(selectedHotelId)}
              className="p-2.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl transition-colors shadow-sm"
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

      {hotels.length > 0 && (
        <>
          {/* Revenue Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Tổng doanh thu */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group">
              <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
                <ArrowUpRight className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Tổng Doanh Thu</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(summary.totalRevenue)}</p>
              </div>
            </div>

            {/* Đã hoàn tiền */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group">
              <div className="bg-red-50 p-4 rounded-2xl text-red-600">
                <ArrowDownLeft className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Đã hoàn trả</p>
                <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(summary.totalRefunded)}</p>
              </div>
            </div>

            {/* Doanh thu thuần */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 relative overflow-hidden group">
              <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Doanh Thu Thuần</p>
                <p className="text-xl font-bold text-slate-950 mt-1">{formatCurrency(summary.netRevenue)}</p>
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-sm font-bold text-slate-900">Danh sách các giao dịch thanh toán</h2>
              <span className="text-xs font-bold text-slate-400 uppercase">
                {summary.transactionCount} giao dịch
              </span>
            </div>

            <div className="overflow-x-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-3 text-emerald-500" />
                  <p className="text-xs">Đang tìm giao dịch...</p>
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  <TrendingUp className="w-12 h-12 mx-auto mb-3 text-slate-200" />
                  <p className="text-sm">Chưa phát sinh giao dịch nào</p>
                </div>
              ) : (
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-3.5">Mã booking</th>
                      <th className="px-6 py-3.5">Khách hàng</th>
                      <th className="px-6 py-3.5">Loại phòng</th>
                      <th className="px-6 py-3.5">Ngày GD</th>
                      <th className="px-6 py-3.5">Giá trị</th>
                      <th className="px-6 py-3.5">Phương thức</th>
                      <th className="px-6 py-3.5">Trạng thái GD</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 text-slate-700">
                    {transactions.map(t => (
                      <tr key={t.bookingId} className="hover:bg-slate-50/20 transition-colors">
                        <td className="px-6 py-4">
                          <span className="text-xs font-mono font-bold text-slate-950">{t.bookingId}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-800">{t.guestName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-xs">
                            <p className="font-bold text-slate-800">{t.roomTypeName}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">{t.nights} đêm</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                          {formatDate(t.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold">
                          {t.paymentStatus === 'refunded' ? (
                            <div className="text-red-600">
                              <p>-{formatCurrency(t.refundAmount)}</p>
                              <p className="text-[9px] text-slate-400 font-normal line-through mt-0.5">
                                {formatCurrency(t.amount)}
                              </p>
                            </div>
                          ) : (
                            <span className="text-emerald-600">+{formatCurrency(t.amount)}</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs uppercase font-semibold text-slate-500">{t.paymentMethod}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                            t.paymentStatus === 'paid'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-red-50 text-red-700'
                          }`}>
                            {t.paymentStatus === 'paid' ? 'Thành công' : 'Đã hoàn tiền'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
