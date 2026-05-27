import { useState, useEffect } from 'react';
import { Search, XCircle, Loader2, CreditCard, Building2, User } from 'lucide-react';
import api from '../lib/axios';

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
}

export default function Withdrawals() {
  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // === Modal: Xem chi tiết & Duyệt ===
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [adminNote, setAdminNote] = useState('');
  const [processingStatus, setProcessingStatus] = useState<'approved' | 'rejected' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/withdrawals/admin');
      if (res.data?.success) setRequests(res.data.data);
    } catch (err: any) {
      setError('Lỗi khi tải danh sách rút tiền');
    } finally {
      setLoading(false);
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

  const filteredRequests = requests.filter(r =>
    r.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.accountNumber.includes(searchTerm) ||
    r.accountName.toLowerCase().includes(searchTerm.toLowerCase())
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Duyệt yêu cầu rút tiền</h1>
          <p className="text-gray-500 text-sm mt-1">Quản lý và chuyển khoản cho Creator</p>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between gap-4 bg-gray-50/50">
          <div className="relative max-w-xs w-full group">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Tìm theo ngân hàng, STK, Tên..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
            />
          </div>
          <span className="text-sm text-gray-500 font-medium whitespace-nowrap">Tổng cộng: {filteredRequests.length}</span>
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
          ) : filteredRequests.length === 0 ? (
            <div className="py-20 text-center text-gray-400 text-sm">Không tìm thấy yêu cầu rút tiền nào.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
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
                      <div>
                        <p className="text-sm font-bold text-gray-900">{req.accountName}</p>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">{req.bankName} - {req.accountNumber}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-blue-600">{formatCurrency(req.amount)}</span>
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
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25"
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
