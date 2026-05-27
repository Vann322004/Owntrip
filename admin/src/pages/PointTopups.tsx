import { useState, useEffect, useCallback } from 'react';
import { Search, Loader2, Star, RefreshCw, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import api from '../lib/axios';

interface PointTopup {
  _id: string;
  bookingId: string;
  orderCode: number;
  userId: string;
  displayName: string;
  email: string;
  amount: number;
  pointsEarned: number;
  status: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  paid:      { label: 'Thành công', className: 'bg-emerald-100 text-emerald-700' },
  pending:   { label: 'Đang chờ',   className: 'bg-amber-100 text-amber-700' },
  cancelled: { label: 'Đã hủy',     className: 'bg-red-100 text-red-700' },
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleString('vi-VN', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function PointTopups() {
  const [transactions, setTransactions] = useState<PointTopup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 1 });

  const fetchTopups = useCallback(async (page = 1, status = statusFilter) => {
    try {
      setLoading(true);
      setError('');
      const params: Record<string, string> = { page: String(page), limit: '20' };
      if (status !== 'all') params.status = status;
      const res = await api.get('/system/point-topups', { params });
      if (res.data?.success) {
        setTransactions(res.data.data || []);
        setPagination(res.data.pagination || { page: 1, limit: 20, total: 0, totalPages: 1 });
      }
    } catch {
      setError('Không thể tải danh sách giao dịch nạp điểm.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchTopups(1, statusFilter);
  }, [statusFilter]);

  const handleStatusChange = (s: string) => {
    setStatusFilter(s);
    setPagination(p => ({ ...p, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    fetchTopups(newPage, statusFilter);
  };

  const filtered = transactions.filter(t =>
    t.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(t.orderCode).includes(searchTerm)
  );

  // --- Summary stats (from current page) ---
  const totalPaid    = transactions.filter(t => t.status === 'paid').length;
  const totalRevenue = transactions.filter(t => t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const totalPoints  = transactions.filter(t => t.status === 'paid').reduce((s, t) => s + t.pointsEarned, 0);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Star className="w-6 h-6 text-amber-500" />
            Quản lý Nạp Điểm
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Lịch sử giao dịch nạp điểm từ cửa hàng của người dùng (chỉ xem)
          </p>
        </div>
        <button
          onClick={() => fetchTopups(pagination.page, statusFilter)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Làm mới
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Tổng giao dịch</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{pagination.total.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <p className="text-xs text-emerald-600 font-semibold uppercase tracking-wider">Thành công (trang)</p>
          <p className="text-2xl font-bold text-emerald-700 mt-1">{totalPaid}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <p className="text-xs text-violet-600 font-semibold uppercase tracking-wider">Doanh thu (trang)</p>
          <p className="text-xl font-bold text-violet-700 mt-1">{formatCurrency(totalRevenue)}</p>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
          <p className="text-xs text-amber-600 font-semibold uppercase tracking-wider">Điểm đã phát (trang)</p>
          <div className="flex items-center gap-1.5 mt-1">
            <TrendingUp className="w-4 h-4 text-amber-500" />
            <p className="text-2xl font-bold text-amber-600">{totalPoints.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gray-50/50">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="relative group max-w-xs w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type="text"
                placeholder="Tìm tên, email, mã GD..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {(['all', 'paid', 'pending', 'cancelled'] as const).map(s => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {s === 'all' ? 'Tất cả' : STATUS_CONFIG[s]?.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3 text-blue-500" />
              <p className="text-sm">Đang tải dữ liệu...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center text-red-500 font-medium">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center">
              <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 text-sm">Không tìm thấy giao dịch nào.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-3.5 font-semibold">Người dùng</th>
                  <th className="px-6 py-3.5 font-semibold">Mã giao dịch</th>
                  <th className="px-6 py-3.5 font-semibold">Số tiền</th>
                  <th className="px-6 py-3.5 font-semibold">Điểm nhận</th>
                  <th className="px-6 py-3.5 font-semibold">Trạng thái</th>
                  <th className="px-6 py-3.5 font-semibold">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(t => {
                  const cfg = STATUS_CONFIG[t.status] ?? { label: t.status, className: 'bg-gray-100 text-gray-600' };
                  return (
                    <tr key={t._id} className="hover:bg-blue-50/20 transition-colors group">
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                            {t.displayName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{t.displayName}</p>
                            <p className="text-xs text-gray-500">{t.email}</p>
                          </div>
                        </div>
                      </td>
                      {/* Mã GD */}
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded-md inline-block">
                            {t.orderCode ? `#${t.orderCode}` : '—'}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 font-mono truncate max-w-[160px]" title={t.bookingId}>
                            {t.bookingId}
                          </p>
                        </div>
                      </td>
                      {/* Số tiền */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-gray-900">{formatCurrency(t.amount)}</p>
                      </td>
                      {/* Điểm nhận */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                          <span className="text-sm font-bold text-amber-600">
                            {t.pointsEarned.toLocaleString()} điểm
                          </span>
                        </div>
                      </td>
                      {/* Trạng thái */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.className}`}>
                          {cfg.label}
                        </span>
                      </td>
                      {/* Thời gian */}
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {formatDate(t.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <p className="text-sm text-gray-500">
              Trang <span className="font-semibold text-gray-900">{pagination.page}</span> / {pagination.totalPages}
              &nbsp;·&nbsp;Tổng <span className="font-semibold text-gray-900">{pagination.total}</span> giao dịch
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="p-2 rounded-lg border border-gray-200 hover:bg-white text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
                const p = i + Math.max(1, pagination.page - 2);
                if (p > pagination.totalPages) return null;
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-semibold transition-colors ${
                      p === pagination.page
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'border border-gray-200 hover:bg-white text-gray-600'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
                className="p-2 rounded-lg border border-gray-200 hover:bg-white text-gray-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
