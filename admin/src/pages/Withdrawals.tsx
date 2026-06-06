import { useState, useEffect } from 'react';
import { Search, XCircle, Loader2, CreditCard, Building2, User, Wallet, Star } from 'lucide-react';
import api from '../lib/axios';

interface UserInfo {
  displayName: string;
  email: string;
  image?: string;
}

interface WithdrawalRequest {
  _id: string;
  userId: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
  status: 'pending' | 'approved' | 'rejected';
  adminNote?: string;
  createdAt: string;
  user?: UserInfo | null;
}

interface DepositTransaction {
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

export default function Withdrawals() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [deposits, setDeposits] = useState<DepositTransaction[]>([]);
  const [systemWalletBalance, setSystemWalletBalance] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'deposits'>('withdrawals');

  // === Modal: Xem chi tiết & Duyệt ===
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [processingStatus, setProcessingStatus] = useState<'approved' | 'rejected' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchRequests(true);
    const interval = setInterval(() => {
      fetchRequests(false);
    }, 15000); // Poll every 15 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchRequests = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const res = await api.get('/withdrawals/admin');
      if (res.data?.success) {
        setRequests(res.data.data || []);
        setDeposits(res.data.deposits || []);
        setSystemWalletBalance(res.data.systemWalletBalance || 0);
      }
    } catch (err: any) {
      setError('Lỗi khi tải danh sách nạp/rút tiền');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    setProcessingStatus(status);
    setIsProcessing(true);
    try {
      const res = await api.put(`/withdrawals/admin/${selectedRequest._id}`, {
        status,
        adminNote: adminNote.trim() || undefined
      });
      if (res.data?.success) {
        setRequests(prev => prev.map(r => r._id === selectedRequest._id ? { ...r, status, adminNote: adminNote.trim() } : r));
        // Update local system wallet balance on approval
        if (status === 'approved') {
          setSystemWalletBalance(prev => prev - selectedRequest.amount);
        }
        setIsModalOpen(false);
        setSelectedRequest(null);
        setAdminNote('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setIsProcessing(false);
      setProcessingStatus(null);
    }
  };

  // Filter requests based on search term
  const filteredRequests = requests.filter(r =>
    r.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.accountNumber.includes(searchTerm) ||
    r.accountName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.user?.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (r.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter deposits based on search term
  const filteredDeposits = deposits.filter(d =>
    d.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.bookingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(d.orderCode).includes(searchTerm)
  );

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    approved: 'bg-emerald-100 text-emerald-700',
    rejected: 'bg-red-100 text-red-700',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Đang chờ',
    approved: 'Đã duyệt',
    rejected: 'Từ chối',
  };

  const depositStatusColors: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    paid: 'bg-emerald-100 text-emerald-700',
    cancelled: 'bg-red-100 text-red-700',
  };

  const depositStatusLabels: Record<string, string> = {
    pending: 'Đang xử lý',
    paid: 'Thành công',
    cancelled: 'Đã hủy',
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nạp rút tiền</h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">Quản lý dòng tiền nạp và yêu cầu rút tiền của người dùng</p>
        </div>
        <button
          onClick={() => fetchRequests(true)}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          Làm mới
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Wallet Balance Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-3xl p-6 shadow-[0_8px_30px_rgba(59,130,246,0.15)] relative overflow-hidden group">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Wallet className="w-36 h-36" />
          </div>
          <p className="text-blue-100 text-xs font-bold uppercase tracking-wider">Số dư Ví Hệ Thống</p>
          <p className="text-3xl font-black mt-2 tracking-tight">{formatCurrency(systemWalletBalance)}</p>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-blue-200 font-medium">
            <span>Dùng để đối soát & chi trả yêu cầu rút tiền</span>
          </div>
        </div>

        {/* Pending Withdrawals Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Yêu cầu rút chờ duyệt</p>
            <p className="text-3xl font-extrabold text-amber-600 mt-2">
              {requests.filter(r => r.status === 'pending').length} <span className="text-sm font-semibold text-gray-400">yêu cầu</span>
            </p>
          </div>
          <p className="text-[11px] text-gray-400 font-medium mt-4">Cần chuyển khoản và phê duyệt cho Creator</p>
        </div>

        {/* Total Deposits Card */}
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Tổng nạp thành công</p>
            <p className="text-3xl font-extrabold text-emerald-600 mt-2">
              {formatCurrency(deposits.filter(d => d.status === 'paid').reduce((s, t) => s + t.amount, 0))}
            </p>
          </div>
          <p className="text-[11px] text-gray-400 font-medium mt-4">Tổng tiền người dùng đã nạp vào hệ thống</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-100 gap-6">
        <button
          onClick={() => { setActiveTab('withdrawals'); setSearchTerm(''); }}
          className={`pb-4 text-sm font-bold transition-all relative ${
            activeTab === 'withdrawals' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Yêu cầu Rút Tiền ({filteredRequests.length})
          {activeTab === 'withdrawals' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
        <button
          onClick={() => { setActiveTab('deposits'); setSearchTerm(''); }}
          className={`pb-4 text-sm font-bold transition-all relative ${
            activeTab === 'deposits' ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Lịch sử Nạp Tiền ({filteredDeposits.length})
          {activeTab === 'deposits' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative max-w-xs w-full group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder={activeTab === 'withdrawals' ? "Tìm theo ngân hàng, STK, Tên, User..." : "Tìm tên, email, mã giao dịch..."}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
          </div>
          <span className="text-sm text-gray-500 font-medium whitespace-nowrap">
            Kết quả: {activeTab === 'withdrawals' ? filteredRequests.length : filteredDeposits.length}
          </span>
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
          ) : activeTab === 'withdrawals' ? (
            // ================= WITHDRAWALS TABLE =================
            filteredRequests.length === 0 ? (
              <div className="py-20 text-center text-gray-400 text-sm">Không tìm thấy yêu cầu rút tiền nào.</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-3.5 font-semibold">Creator</th>
                    <th className="px-6 py-3.5 font-semibold">Tài khoản nhận</th>
                    <th className="px-6 py-3.5 font-semibold">Số tiền</th>
                    <th className="px-6 py-3.5 font-semibold">Trạng thái</th>
                    <th className="px-6 py-3.5 font-semibold">Ngày gửi</th>
                    <th className="px-6 py-3.5 font-semibold text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredRequests.map(req => (
                    <tr key={req._id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {req.user?.image ? (
                            <img src={req.user.image} alt={req.user.displayName} className="w-9 h-9 rounded-full object-cover border border-gray-100 bg-gray-50" />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                              {(req.user?.displayName || 'C').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{req.user?.displayName || 'Chưa cập nhật'}</p>
                            <p className="text-xs text-gray-500">{req.user?.email || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-bold text-gray-900">{req.accountName}</p>
                          <p className="text-xs font-medium text-gray-500 mt-0.5">{req.bankName} - <span className="font-semibold text-gray-700">{req.accountNumber}</span></p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-extrabold text-blue-600">{formatCurrency(req.amount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${statusColors[req.status]}`}>
                          {statusLabels[req.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {new Date(req.createdAt).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => { setSelectedRequest(req); setIsModalOpen(true); setAdminNote(req.adminNote || ''); }}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            Xử lý
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          ) : (
            // ================= DEPOSITS TABLE =================
            filteredDeposits.length === 0 ? (
              <div className="py-20 text-center text-gray-400 text-sm">Không tìm thấy lịch sử nạp tiền nào.</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                    <th className="px-6 py-3.5 font-semibold">Người dùng</th>
                    <th className="px-6 py-3.5 font-semibold">Mã giao dịch</th>
                    <th className="px-6 py-3.5 font-semibold">Số tiền</th>
                    <th className="px-6 py-3.5 font-semibold">Loại nạp</th>
                    <th className="px-6 py-3.5 font-semibold">Trạng thái</th>
                    <th className="px-6 py-3.5 font-semibold">Thời gian</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredDeposits.map(dep => (
                    <tr key={dep._id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-bold text-sm">
                            {(dep.displayName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{dep.displayName}</p>
                            <p className="text-xs text-gray-500">{dep.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-xs font-mono text-gray-600 bg-gray-50 px-2 py-1 rounded-md inline-block">
                            {dep.orderCode ? `#${dep.orderCode}` : '—'}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-1 font-mono truncate max-w-[160px]" title={dep.bookingId}>
                            {dep.bookingId}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-extrabold text-emerald-600">{formatCurrency(dep.amount)}</span>
                      </td>
                      <td className="px-6 py-4">
                        {dep.bookingId.startsWith('topup_points_') ? (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">
                            <Star className="w-3 h-3 fill-amber-400" />
                            Nạp Điểm ({dep.pointsEarned.toLocaleString()})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                            <Wallet className="w-3 h-3" />
                            Nạp Số Dư Virtual
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${depositStatusColors[dep.status]}`}>
                          {depositStatusLabels[dep.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                        {new Date(dep.createdAt).toLocaleString('vi-VN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          )}
        </div>
      </div>

      {/* ====== Modal Chi tiết & Xử lý ====== */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-blue-50/50">
              <h2 className="text-lg font-bold text-blue-900">Chi tiết lệnh rút tiền</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white rounded-full transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              {/* Creator details in modal */}
              <div className="mb-4 flex items-center gap-3 bg-blue-50/30 p-4 rounded-2xl border border-blue-100/50">
                {selectedRequest.user?.image ? (
                  <img src={selectedRequest.user.image} alt={selectedRequest.user.displayName} className="w-10 h-10 rounded-full object-cover border border-white shadow-sm" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                    {(selectedRequest.user?.displayName || 'C').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xs font-bold text-blue-500 uppercase tracking-wider">Người yêu cầu rút</p>
                  <p className="text-sm font-bold text-gray-900 leading-tight">{selectedRequest.user?.displayName || 'N/A'}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{selectedRequest.user?.email || 'N/A'}</p>
                </div>
              </div>

              {/* Box thông tin chuyển khoản */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100 space-y-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Building2 className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Ngân hàng</p>
                    <p className="text-sm font-bold text-gray-900">{selectedRequest.bankName}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><User className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Tên tài khoản</p>
                    <p className="text-sm font-bold text-gray-900">{selectedRequest.accountName}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><CreditCard className="w-5 h-5" /></div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Số tài khoản</p>
                    <p className="text-lg font-black text-gray-900 tracking-wider">{selectedRequest.accountNumber}</p>
                  </div>
                </div>
              </div>

              {/* Số tiền rút */}
              <div className="flex justify-between items-end mb-6 pb-6 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-500">Số tiền cần chuyển:</p>
                <p className="text-2xl font-black text-blue-600">{formatCurrency(selectedRequest.amount)}</p>
              </div>

              {/* System Balance check message */}
              {selectedRequest.status === 'pending' && (
                <div className={`p-3.5 rounded-xl border text-xs font-semibold flex items-center gap-2 mb-4 ${
                  systemWalletBalance < selectedRequest.amount
                    ? 'bg-red-50 border-red-100 text-red-700'
                    : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                }`}>
                  <Wallet className="w-4.5 h-4.5 flex-shrink-0" />
                  <div>
                    <span>Số dư ví hệ thống hiện có: </span>
                    <span className="font-bold">{formatCurrency(systemWalletBalance)}</span>
                    {systemWalletBalance < selectedRequest.amount && (
                      <p className="mt-1 font-bold text-red-500">Cảnh báo: Không đủ số dư hệ thống để duyệt!</p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Lời nhắn admin */}
              <div>
                <label className="text-xs font-bold text-gray-500 mb-2 block">Ghi chú / Lý do từ chối (Tùy chọn)</label>
                <textarea
                  value={adminNote}
                  onChange={e => setAdminNote(e.target.value)}
                  placeholder="Nhập phản hồi cho Creator..."
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 focus:border-blue-500 focus:bg-white rounded-xl text-sm outline-none transition-all min-h-[80px]"
                />
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 flex gap-3 bg-gray-50/50">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 font-semibold rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                Đóng
              </button>
              
              {selectedRequest.status === 'pending' && (
                <>
                  <button 
                    onClick={() => handleUpdateStatus('rejected')} 
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-bold rounded-xl text-sm transition-all border border-red-200"
                  >
                    {isProcessing && processingStatus === 'rejected' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Từ chối'}
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('approved')} 
                    disabled={isProcessing || systemWalletBalance < selectedRequest.amount}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25"
                  >
                    {isProcessing && processingStatus === 'approved' ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Đã chuyển tiền'}
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
