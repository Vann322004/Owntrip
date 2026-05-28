import { useState, useEffect } from 'react';
import { 
  User, Mail, Lock, Save, Loader2, AlertCircle, 
  CheckCircle, Key, Wallet
} from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { user: authUser, login } = useAuth();
  const [profile, setProfile] = useState({
    userId: '',
    displayName: '',
    email: '',
    phone: '',
    image: '',
    balance: 0
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Password fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passSaving, setPassSaving] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const res = await api.get('/users/me');
        if (res.data?.success) {
          const u = res.data.data || res.data.user;
          setProfile({
            userId: u.userId || '',
            displayName: u.displayName || '',
            email: u.email || '',
            phone: u.phone || '',
            image: u.image || '',
            balance: u.balance || 0
          });
        }
      } catch {
        setError('Không thể tải thông tin cá nhân.');
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const res = await api.put(`/users/updateProfile/${profile.userId}`, {
        displayName: profile.displayName,
        phone: profile.phone,
        image: profile.image
      });
      if (res.data?.success) {
        setSuccess('Cập nhật thông tin thành công!');
        // Update context
        if (authUser) {
          login({
            ...authUser,
            displayName: profile.displayName,
            image: profile.image
          }, sessionStorage.getItem('token') || localStorage.getItem('token') || '');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (newPassword !== confirmPassword) {
      setPassError('Mật khẩu xác nhận không trùng khớp.');
      return;
    }

    setPassSaving(true);
    try {
      const res = await api.put(`/users/updatePassword/${profile.userId}`, {
        oldPassword,
        newPassword
      });
      if (res.data?.success) {
        setPassSuccess('Đổi mật khẩu thành công!');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      setPassError(err.response?.data?.message || 'Lỗi đổi mật khẩu.');
    } finally {
      setPassSaving(false);
    }
  };

  function formatCurrency(val: number) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm">Đang tải cấu hình tài khoản...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cài đặt tài khoản</h1>
        <p className="text-slate-500 text-sm mt-1">Thông tin cá nhân, cập nhật mật khẩu và số dư tài khoản</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Avatar & Balance */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm text-center space-y-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-slate-100 mx-auto shadow-inner bg-slate-50">
              <img 
                src={profile.image || 'https://i.pravatar.cc/150?img=12'} 
                alt={profile.displayName} 
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">{profile.displayName}</h3>
              <p className="text-[10px] font-mono text-slate-400 mt-0.5">{profile.userId}</p>
            </div>
          </div>

          {/* Balance card */}
          <div className="bg-gradient-to-tr from-emerald-600 to-emerald-500 rounded-3xl p-6 text-white shadow-md shadow-emerald-500/10 space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-bold uppercase tracking-wider opacity-85">Số dư tài khoản</span>
              <Wallet className="w-5 h-5 opacity-75" />
            </div>
            <div>
              <p className="text-2xl font-black">{formatCurrency(profile.balance)}</p>
              <p className="text-[9px] opacity-75 mt-1">Nhận doanh thu từ khách đặt phòng</p>
            </div>
          </div>
        </div>

        {/* Right Side: Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Form */}
          <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-50 pb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Thông tin cá nhân
            </h3>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3.5 rounded-xl flex items-center gap-2 text-xs">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Họ & Tên</label>
                  <input
                    type="text"
                    required
                    value={profile.displayName}
                    onChange={e => setProfile({ ...profile, displayName: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none font-semibold text-slate-800"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Số điện thoại</label>
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={e => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Địa chỉ Email</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    disabled
                    value={profile.email}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-transparent rounded-xl text-xs text-slate-500 cursor-not-allowed font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Link ảnh đại diện (URL)</label>
                <input
                  type="text"
                  value={profile.image}
                  onChange={e => setProfile({ ...profile, image: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none font-semibold text-slate-800"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-75"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                Cập nhật hồ sơ
              </button>
            </div>
          </form>

          {/* Password Form */}
          <form onSubmit={handleUpdatePassword} className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-50 pb-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" />
              Đổi mật khẩu bảo mật
            </h3>

            {passError && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3.5 rounded-xl flex items-center gap-2 text-xs">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{passSuccess}</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Mật khẩu hiện tại</label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={oldPassword}
                    onChange={e => setOldPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none font-semibold text-slate-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Mật khẩu mới</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none font-semibold text-slate-800"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-xs focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 outline-none font-semibold text-slate-800"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                disabled={passSaving}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors disabled:opacity-75"
              >
                {passSaving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Key className="w-3.5 h-3.5" />
                )}
                Đổi mật khẩu
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
