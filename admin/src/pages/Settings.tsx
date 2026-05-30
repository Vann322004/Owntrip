import { useState, useEffect } from 'react';
import { 
  User, Lock, Trophy, Info, Save, Loader2, 
  CheckCircle2, AlertCircle, Shield, Database, 
  Cpu, HardDrive, RefreshCw, Package, Plus, Edit, Trash2, Percent
} from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'points' | 'packages' | 'commission' | 'system'>('profile');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  // Profile State
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [imageUrl, setImageUrl] = useState(user?.image || '');

  // Password State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Points Config State
  const [pointsConfig, setPointsConfig] = useState({
    points_per_vnpay_1000: 1,
    points_daily_login: 10,
    points_review_bonus: 50,
  });

  // System Info State
  const [systemInfo, setSystemInfo] = useState<any>(null);

  // Creator Packages State
  const [packages, setPackages] = useState<any[]>([]);
  const [showPkgModal, setShowPkgModal] = useState(false);
  const [editingPkgId, setEditingPkgId] = useState<string | null>(null);
  const [pkgForm, setPkgForm] = useState({ name: '', durationInMonths: 1, price: 0, description: '', isActive: true });

  // Commission Config State
  const [commissionConfig, setCommissionConfig] = useState({
    commission_hotel_owner_percent: 90,
    commission_hotel_admin_percent: 10,
    commission_trip_creator_percent: 70,
    commission_trip_admin_percent: 30,
  });

  useEffect(() => {
    if (activeTab === 'points') fetchPointsConfig();
    if (activeTab === 'system') fetchSystemInfo();
    if (activeTab === 'packages') fetchPackages();
    if (activeTab === 'commission') fetchCommissionConfig();
  }, [activeTab]);

  const fetchPointsConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get('/system/config');
      if (res.data?.success) {
        setPointsConfig(p => ({ ...p, ...res.data.data }));
        setCommissionConfig(c => ({ ...c, ...res.data.data }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommissionConfig = async () => {
    try {
      setLoading(true);
      const res = await api.get('/system/config');
      if (res.data?.success) {
        const d = res.data.data;
        setCommissionConfig({
          commission_hotel_owner_percent: d.commission_hotel_owner_percent ?? 90,
          commission_hotel_admin_percent: d.commission_hotel_admin_percent ?? 10,
          commission_trip_creator_percent: d.commission_trip_creator_percent ?? 70,
          commission_trip_admin_percent: d.commission_trip_admin_percent ?? 30,
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSystemInfo = async () => {
    try {
      setLoading(true);
      const res = await api.get('/system/info');
      if (res.data?.success) setSystemInfo(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await api.put(`/users/updateProfile/${user.userId}`, { displayName, image: imageUrl });
      if (res.data?.success) {
        setSuccess('Cập nhật hồ sơ thành công!');
        // Cập nhật auth context nếu cần (ở đây giả định login function cập nhật local storage)
        const updatedUser = { ...user, displayName, image: imageUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Bạn có thể cần một hàm reloadUser trong AuthContext để mượt hơn
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi cập nhật hồ sơ');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (!user) return;
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await api.put(`/users/updatePassword/${user.userId}`, { oldPassword, newPassword });
      if (res.data?.success) {
        setSuccess('Đổi mật khẩu thành công!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePointsConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await api.post('/system/config', pointsConfig);
      if (res.data?.success) {
        setSuccess('Cập nhật cấu hình điểm thành công!');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi cập nhật cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCommissionConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate: hotel must sum to 100, trip must sum to 100
    if (commissionConfig.commission_hotel_owner_percent + commissionConfig.commission_hotel_admin_percent !== 100) {
      setError('Tổng % đặt phòng khách sạn phải bằng 100%');
      return;
    }
    if (commissionConfig.commission_trip_creator_percent + commissionConfig.commission_trip_admin_percent !== 100) {
      setError('Tổng % mua lịch trình phải bằng 100%');
      return;
    }
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      const res = await api.post('/system/config', commissionConfig);
      if (res.data?.success) setSuccess('Cập nhật cấu hình hoa hồng thành công! Sẽ áp dụng cho các giao dịch mới.');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi cập nhật cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/creator-packages/admin');
      if (res.data?.success) setPackages(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess('');
    setError('');
    try {
      if (editingPkgId) {
        await api.put(`/creator-packages/admin/${editingPkgId}`, pkgForm);
      } else {
        await api.post('/creator-packages/admin', pkgForm);
      }
      setSuccess(editingPkgId ? 'Cập nhật gói thành công!' : 'Tạo gói mới thành công!');
      setShowPkgModal(false);
      fetchPackages();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi lưu gói');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa gói này?')) return;
    try {
      await api.delete(`/creator-packages/admin/${id}`);
      setSuccess('Đã xóa gói!');
      fetchPackages();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi xóa gói');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Cài đặt hệ thống</h1>
        <p className="text-gray-500 text-sm mt-1">Quản lý tài khoản cá nhân và cấu hình ứng dụng</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 space-y-1">
          {[
        { id: 'profile',    label: 'Hồ sơ Admin',          icon: User },
            { id: 'password',   label: 'Mật khẩu',              icon: Lock },
            { id: 'points',     label: 'Cấu hình Điểm',        icon: Trophy },
            { id: 'packages',   label: 'Gói Creator',           icon: Package },
            { id: 'commission', label: 'Cấu hình Hoa hồng',    icon: Percent },
            { id: 'system',     label: 'Thông tin hệ thống',   icon: Info },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSuccess('');
                  setError('');
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  activeTab === tab.id 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' 
                  : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-2xl shadow-[0_2px_20px_rgba(0,0,0,0.04)] border border-gray-100 overflow-hidden min-h-[400px]">
          <div className="p-6">
            {success && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-sm font-medium">{success}</span>
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="w-5 h-5" />
                <span className="text-sm font-medium">{error}</span>
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="max-w-md space-y-5">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="relative group">
                    <img 
                      src={imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName || 'Admin')}&background=random&size=128`}
                      alt="Avatar"
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md group-hover:opacity-75 transition-opacity"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded-md">Ảnh hồ sơ</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Tên hiển thị</label>
                  <input 
                    type="text" 
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">URL ảnh đại diện</label>
                  <input 
                    type="url" 
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Email (Không thể đổi)</label>
                  <input 
                    type="email" 
                    disabled
                    value={user?.email}
                    className="w-full px-4 py-2.5 bg-gray-100 border border-transparent rounded-xl text-sm text-gray-500"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold transition-all disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu thay đổi
                </button>
              </form>
            )}

            {/* Password Tab */}
            {activeTab === 'password' && (
              <form onSubmit={handleUpdatePassword} className="max-w-md space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Mật khẩu hiện tại</label>
                  <input 
                    type="password" 
                    required
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Mật khẩu mới</label>
                  <input 
                    type="password" 
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Xác nhận mật khẩu mới</label>
                  <input 
                    type="password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm transition-all outline-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold transition-all disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Cập nhật mật khẩu
                </button>
              </form>
            )}

            {/* Points Config Tab */}
            {activeTab === 'points' && (
              <form onSubmit={handleUpdatePointsConfig} className="max-w-md space-y-5">
                <div className="p-4 bg-blue-50 text-blue-700 rounded-xl text-sm mb-4">
                  <div className="flex gap-2">
                    <Trophy className="w-5 h-5 shrink-0" />
                    <p>Các thiết lập này sẽ áp dụng toàn hệ thống cho việc tích lũy và sử dụng Points.</p>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Points mỗi 1,000 VND nạp</label>
                  <input 
                    type="number" 
                    value={pointsConfig.points_per_vnpay_1000}
                    onChange={(e) => setPointsConfig(p => ({ ...p, points_per_vnpay_1000: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Thưởng đăng nhập hàng ngày</label>
                  <input 
                    type="number" 
                    value={pointsConfig.points_daily_login}
                    onChange={(e) => setPointsConfig(p => ({ ...p, points_daily_login: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm transition-all outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-gray-700">Thưởng viết đánh giá</label>
                  <input 
                    type="number" 
                    value={pointsConfig.points_review_bonus}
                    onChange={(e) => setPointsConfig(p => ({ ...p, points_review_bonus: Number(e.target.value) }))}
                    className="w-full px-4 py-2.5 bg-gray-50 border border-transparent focus:border-blue-500 focus:bg-white rounded-xl text-sm transition-all outline-none"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold transition-all disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Cập nhật cấu hình
                </button>
              </form>
            )}

            {/* Creator Packages Tab */}
            {activeTab === 'packages' && (
              <div className="space-y-5">
                <div className="flex justify-between items-center">
                  <div className="p-4 bg-amber-50 text-amber-700 rounded-xl text-sm flex gap-2 flex-1">
                    <Package className="w-5 h-5 shrink-0" />
                    <p>Quản lý các gói đăng ký Creator. Người dùng mua gói để được quyền bán lịch trình trên Marketplace.</p>
                  </div>
                  <button
                    onClick={() => {
                      setEditingPkgId(null);
                      setPkgForm({ name: '', durationInMonths: 1, price: 0, description: '', isActive: true });
                      setShowPkgModal(true);
                    }}
                    className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm gói
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-blue-600" /></div>
                ) : packages.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">Chưa có gói Creator nào. Bấm "Thêm gói" để tạo.</p>
                ) : (
                  <div className="space-y-3">
                    {packages.map((pkg) => (
                      <div key={pkg._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:shadow-sm transition-shadow">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-gray-900">{pkg.name}</h3>
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${pkg.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>
                              {pkg.isActive ? 'Đang bán' : 'Đã ẩn'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {pkg.durationInMonths} tháng · <span className="font-semibold text-green-600">{pkg.price.toLocaleString()}đ</span>
                            {pkg.description ? ` · ${pkg.description}` : ''}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          <button
                            onClick={() => {
                              setEditingPkgId(pkg._id);
                              setPkgForm({ name: pkg.name, durationInMonths: pkg.durationInMonths, price: pkg.price, description: pkg.description || '', isActive: pkg.isActive });
                              setShowPkgModal(true);
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeletePackage(pkg._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Package Modal */}
                {showPkgModal && (
                  <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                      <h2 className="text-lg font-bold mb-4">{editingPkgId ? 'Chỉnh sửa gói' : 'Thêm gói mới'}</h2>
                      <form onSubmit={handleSavePackage} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Tên gói</label>
                          <input required type="text" value={pkgForm.name} onChange={(e) => setPkgForm({...pkgForm, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl text-sm" placeholder="VD: Gói Creator 1 Tháng" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thời hạn (Tháng)</label>
                            <input required type="number" min="1" value={pkgForm.durationInMonths} onChange={(e) => setPkgForm({...pkgForm, durationInMonths: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-xl text-sm" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                            <input required type="number" min="0" value={pkgForm.price} onChange={(e) => setPkgForm({...pkgForm, price: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-xl text-sm" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả quyền lợi</label>
                          <textarea rows={2} value={pkgForm.description} onChange={(e) => setPkgForm({...pkgForm, description: e.target.value})} className="w-full px-4 py-2 border rounded-xl text-sm" placeholder="Được đăng bán lịch trình..." />
                        </div>
                        <div className="flex items-center gap-2">
                          <input type="checkbox" id="pkgActive" checked={pkgForm.isActive} onChange={(e) => setPkgForm({...pkgForm, isActive: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-blue-600" />
                          <label htmlFor="pkgActive" className="text-sm font-medium text-gray-700">Đang bán (Hiển thị trên App)</label>
                        </div>
                        <div className="flex justify-end gap-3 pt-4 border-t">
                          <button type="button" onClick={() => setShowPkgModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium text-sm">Hủy</button>
                          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 text-sm flex items-center gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            Lưu lại
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Commission Config Tab */}
            {activeTab === 'commission' && (
              <form onSubmit={handleUpdateCommissionConfig} className="space-y-8 max-w-lg">
                <div className="p-4 bg-violet-50 text-violet-700 rounded-xl text-sm flex gap-2">
                  <Percent className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>Cấu hình tỷ lệ phân chia doanh thu cho từng loại giao dịch. Thay đổi sẽ áp dụng cho <strong>các giao dịch mới</strong>, không ảnh hưởng đến giao dịch đã hoàn thành.</p>
                </div>

                {/* Hotel Booking */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <h3 className="font-bold text-gray-800 text-sm">🏨 Đặt phòng Khách sạn</h3>
                  </div>

                  {/* Hotel Owner Percent */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-gray-700">Chủ khách sạn nhận</label>
                      <span className="text-lg font-bold text-blue-600">{commissionConfig.commission_hotel_owner_percent}%</span>
                    </div>
                    <input
                      type="range" min={50} max={99} step={1}
                      value={commissionConfig.commission_hotel_owner_percent}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setCommissionConfig(c => ({ ...c, commission_hotel_owner_percent: v, commission_hotel_admin_percent: 100 - v }));
                      }}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>50%</span><span>99%</span>
                    </div>
                  </div>

                  {/* Hotel Admin Percent */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Admin (Nền tảng) nhận</p>
                      <p className="text-xs text-gray-400">Tự động tính = 100% - phần chủ khách sạn</p>
                    </div>
                    <span className="text-lg font-bold text-emerald-600">{commissionConfig.commission_hotel_admin_percent}%</span>
                  </div>

                  {/* Preview */}
                  <div className="p-3 bg-blue-50 rounded-xl text-xs text-blue-700 space-y-1">
                    <p className="font-semibold">Ví dụ với đơn 1,000,000đ:</p>
                    <p>• Chủ khách sạn nhận: <strong>{(1000000 * commissionConfig.commission_hotel_owner_percent / 100).toLocaleString('vi-VN')}đ</strong></p>
                    <p>• Admin nhận: <strong>{(1000000 * commissionConfig.commission_hotel_admin_percent / 100).toLocaleString('vi-VN')}đ</strong></p>
                  </div>
                </div>

                {/* Trip Marketplace */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                    <div className="w-2 h-2 rounded-full bg-violet-500"></div>
                    <h3 className="font-bold text-gray-800 text-sm">🗺️ Mua lịch trình (Marketplace)</h3>
                  </div>

                  {/* Trip Creator Percent */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-gray-700">Creator nhận</label>
                      <span className="text-lg font-bold text-violet-600">{commissionConfig.commission_trip_creator_percent}%</span>
                    </div>
                    <input
                      type="range" min={50} max={99} step={1}
                      value={commissionConfig.commission_trip_creator_percent}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        setCommissionConfig(c => ({ ...c, commission_trip_creator_percent: v, commission_trip_admin_percent: 100 - v }));
                      }}
                      className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-violet-600"
                    />
                    <div className="flex justify-between text-xs text-gray-400">
                      <span>50%</span><span>99%</span>
                    </div>
                  </div>

                  {/* Trip Admin Percent */}
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Admin (Nền tảng) nhận</p>
                      <p className="text-xs text-gray-400">Tự động tính = 100% - phần Creator</p>
                    </div>
                    <span className="text-lg font-bold text-emerald-600">{commissionConfig.commission_trip_admin_percent}%</span>
                  </div>

                  {/* Preview */}
                  <div className="p-3 bg-violet-50 rounded-xl text-xs text-violet-700 space-y-1">
                    <p className="font-semibold">Ví dụ với giao dịch 500,000đ:</p>
                    <p>• Creator nhận: <strong>{(500000 * commissionConfig.commission_trip_creator_percent / 100).toLocaleString('vi-VN')}đ</strong></p>
                    <p>• Admin nhận: <strong>{(500000 * commissionConfig.commission_trip_admin_percent / 100).toLocaleString('vi-VN')}đ</strong></p>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-700 text-white py-2.5 rounded-xl font-semibold transition-all disabled:opacity-70"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Lưu cấu hình hoa hồng
                </button>
              </form>
            )}

            {/* System Info Tab */}
            {activeTab === 'system' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">Nền tảng</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{systemInfo?.platform || '--'}</p>
                    <p className="text-xs text-gray-500 mt-1">Node {systemInfo?.nodeVersion}</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                        <Database className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">Database</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{systemInfo?.dbStatus || '--'}</p>
                    <p className="text-xs text-gray-500 mt-1">MongoDB Atlas</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
                        <RefreshCw className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">Thời gian chạy</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{systemInfo?.uptime || '--'}</p>
                    <p className="text-xs text-gray-500 mt-1">Kể từ lần khởi động cuối</p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                        <HardDrive className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-bold text-gray-900">Phiên bản</span>
                    </div>
                    <p className="text-xl font-bold text-gray-900">{systemInfo?.version || '1.0.0'}</p>
                    <p className="text-xs text-gray-500 mt-1">Owntrip Admin API</p>
                  </div>
                </div>

                <div className="p-4 border border-dashed border-gray-200 rounded-2xl">
                  <div className="flex items-center gap-2 mb-3 text-gray-600">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-wider">Bảo mật hệ thống</span>
                  </div>
                  <ul className="text-xs text-gray-500 space-y-2">
                    <li className="flex items-center gap-2">• Sử dụng JWT Token xác thực mọi yêu cầu.</li>
                    <li className="flex items-center gap-2">• Phân quyền chặt chẽ giữa Admin và Staff.</li>
                    <li className="flex items-center gap-2">• Dữ liệu nhạy cảm được mã hóa trước khi lưu trữ.</li>
                  </ul>
                </div>

                <button 
                  onClick={fetchSystemInfo}
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-semibold transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Làm mới trạng thái
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
