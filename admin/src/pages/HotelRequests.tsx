import { useState, useEffect } from 'react';
import { Search, CheckCircle2, XCircle, Loader2, Eye, MessageSquare } from 'lucide-react';
import api from '../lib/axios';

interface HotelRequest {
  _id: string;
  requestId: string;
  userId: string;
  hotelName: string;
  address: string;
  city: string;
  phone: string;
  description: string;
  images: string[];
  legalDocuments: {
    businessLicense: string;
    securityCertificate: string;
    pcccCertificate: string;
    identityCardFront: string;
    identityCardBack: string;
    leaseContract?: string;
  };
  amenities: string[];
  businessPolicies: {
    cancellationPolicy: string;
    childPolicy: string;
    checkInTime: string;
    checkOutTime: string;
    extraCosts?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  createdAt: string;
}

export default function HotelRequests() {
  const [requests, setRequests] = useState<HotelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected'>('pending');

  // === Modal: Xem chi tiết & Duyệt ===
  const [selectedRequest, setSelectedRequest] = useState<HotelRequest | null>(null);
  const [isAdminCommentModalOpen, setIsAdminCommentModalOpen] = useState(false);
  const [adminComment, setAdminComment] = useState('');
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
      const res = await api.get('/hotel-requests');
      if (res.data?.success) setRequests(res.data.data);
    } catch (err: any) {
      setError('Lỗi khi tải danh sách đơn đăng ký');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: 'approved' | 'rejected') => {
    if (!selectedRequest) return;
    setProcessingStatus(status);
    setIsProcessing(true);
    try {
      const res = await api.patch(`/hotel-requests/${selectedRequest._id}/status`, {
        status,
        adminComment: adminComment.trim() || undefined
      });
      if (res.data?.success) {
        setRequests(prev => prev.map(r => r._id === selectedRequest._id ? { ...r, status, adminComment: adminComment.trim() } : r));
        setIsAdminCommentModalOpen(false);
        setSelectedRequest(null);
        setAdminComment('');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Thao tác thất bại');
    } finally {
      setIsProcessing(false);
      setProcessingStatus(null);
    }
  };

  const countPending = requests.filter(r => r.status === 'pending').length;
  const countApproved = requests.filter(r => r.status === 'approved').length;
  const countRejected = requests.filter(r => r.status === 'rejected').length;

  const filteredRequests = requests.filter(r => {
    const matchesTab = r.status === activeTab;
    const matchesSearch = r.hotelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phone.includes(searchTerm) ||
      r.city.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Quản lý đơn đăng ký Hotel Owner</h1>
          <p className="text-gray-500 text-sm mt-1">Duyệt các đơn đăng ký trở thành chủ khách sạn</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 gap-6">
        <button
          onClick={() => setActiveTab('pending')}
          className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 focus:outline-none cursor-pointer ${
            activeTab === 'pending'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Chờ duyệt
          <span className={`px-2 py-0.5 text-xs rounded-full font-bold transition-colors ${
            activeTab === 'pending' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {countPending}
          </span>
          {activeTab === 'pending' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full animate-in fade-in duration-200" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 focus:outline-none cursor-pointer ${
            activeTab === 'approved'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Đã duyệt
          <span className={`px-2 py-0.5 text-xs rounded-full font-bold transition-colors ${
            activeTab === 'approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {countApproved}
          </span>
          {activeTab === 'approved' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full animate-in fade-in duration-200" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`pb-3 text-sm font-semibold transition-all relative flex items-center gap-2 focus:outline-none cursor-pointer ${
            activeTab === 'rejected'
              ? 'text-blue-600'
              : 'text-gray-500 hover:text-gray-900'
          }`}
        >
          Từ chối
          <span className={`px-2 py-0.5 text-xs rounded-full font-bold transition-colors ${
            activeTab === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
          }`}>
            {countRejected}
          </span>
          {activeTab === 'rejected' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full animate-in fade-in duration-200" />
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
              placeholder="Tìm theo tên khách sạn, SĐT..."
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
            <div className="py-20 text-center text-gray-400 text-sm">Không tìm thấy đơn đăng ký nào.</div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
                  <th className="px-6 py-3.5 font-semibold">Khách sạn</th>
                  <th className="px-6 py-3.5 font-semibold">Liên hệ</th>
                  <th className="px-6 py-3.5 font-semibold">Thành phố</th>
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
                        <p className="text-sm font-semibold text-gray-900">{req.hotelName}</p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">{req.address}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{req.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{req.city}</td>
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
                          onClick={() => { setSelectedRequest(req); setIsAdminCommentModalOpen(true); setAdminComment(req.adminComment || ''); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Chi tiết
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
      {isAdminCommentModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">Chi tiết đơn đăng ký - {selectedRequest.requestId}</h2>
              <button onClick={() => setIsAdminCommentModalOpen(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8 max-h-[75vh] overflow-y-auto">
              {/* Cột 1: Thông tin cơ bản */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-blue-600 uppercase mb-3">Thông tin cơ sở</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tên khách sạn</label>
                      <p className="text-sm font-semibold text-gray-900">{selectedRequest.hotelName}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Địa chỉ</label>
                      <p className="text-sm text-gray-700">{selectedRequest.address}, {selectedRequest.city}</p>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Số điện thoại</label>
                      <p className="text-sm text-gray-700">{selectedRequest.phone}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-blue-600 uppercase mb-3">Chính sách kinh doanh</h3>
                  <div className="space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-xs text-gray-600"><strong>Hủy phòng:</strong> {selectedRequest.businessPolicies?.cancellationPolicy || 'N/A'}</p>
                    <p className="text-xs text-gray-600"><strong>Check-in:</strong> {selectedRequest.businessPolicies?.checkInTime} - <strong>Check-out:</strong> {selectedRequest.businessPolicies?.checkOutTime}</p>
                    <p className="text-xs text-gray-600"><strong>Trẻ em:</strong> {selectedRequest.businessPolicies?.childPolicy || 'N/A'}</p>
                  </div>
                </div>
              </div>
              
              {/* Cột 2: Hồ sơ & Tiện nghi */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-blue-600 uppercase mb-3">Hồ sơ pháp lý</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <DocThumbnail label="GP Kinh doanh" url={selectedRequest.legalDocuments?.businessLicense} />
                    <DocThumbnail label="An ninh trật tự" url={selectedRequest.legalDocuments?.securityCertificate} />
                    <DocThumbnail label="PCCC" url={selectedRequest.legalDocuments?.pcccCertificate} />
                    <DocThumbnail label="CCCD (Mặt trước)" url={selectedRequest.legalDocuments?.identityCardFront} />
                    <DocThumbnail label="CCCD (Mặt sau)" url={selectedRequest.legalDocuments?.identityCardBack} />
                    {selectedRequest.legalDocuments?.leaseContract && (
                      <DocThumbnail label="Hợp đồng/Sổ đỏ" url={selectedRequest.legalDocuments.leaseContract} />
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-blue-600 uppercase mb-3">Tiện nghi</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRequest.amenities?.map(a => (
                      <span key={a} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold">{a}</span>
                    )) || <span className="text-xs text-gray-400 italic">N/A</span>}
                  </div>
                </div>
              </div>

              {/* Cột 3: Hình ảnh & Phản hồi */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold text-blue-600 uppercase mb-3">Hình ảnh cơ sở</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {selectedRequest.images.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noreferrer" className="block relative aspect-video rounded-lg overflow-hidden border border-gray-100 hover:ring-2 hover:ring-blue-500 transition-all">
                        <img src={img} alt="Hotel registration" className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
                
                <div className="pt-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Phản hồi của Admin
                  </label>
                  <textarea
                    value={adminComment}
                    onChange={e => setAdminComment(e.target.value)}
                    placeholder="Lý do từ chối hoặc lời nhắn..."
                    className="w-full mt-2 px-4 py-3 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm outline-none transition-all min-h-[80px]"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 flex gap-3 bg-gray-50/50">
              <button 
                onClick={() => setIsAdminCommentModalOpen(false)} 
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
                    {isProcessing && processingStatus === 'rejected' ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Từ chối
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('approved')} 
                    disabled={isProcessing}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-emerald-500/25"
                  >
                    {isProcessing && processingStatus === 'approved' ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    Duyệt hồ sơ
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

// Helper component
function DocThumbnail({ label, url }: { label: string; url?: string }) {
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noreferrer" className="block group">
      <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden border border-gray-200 group-hover:border-blue-500 transition-colors relative">
        <img src={url} alt={label} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
          <Eye className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-[10px] font-bold text-gray-500 text-center mt-1 truncate">{label}</p>
    </a>
  );
}
