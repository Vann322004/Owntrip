import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2 } from 'lucide-react';
import api from '../lib/axios';

interface CreatorPackage {
  _id: string;
  name: string;
  durationInMonths: number;
  price: number;
  description: string;
  isActive: boolean;
}

export default function CreatorPackages() {
  const [packages, setPackages] = useState<CreatorPackage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    durationInMonths: 1,
    price: 0,
    description: '',
    isActive: true
  });

  const fetchPackages = async () => {
    try {
      const response = await api.get('/creator-packages/admin');
      setPackages(response.data.data);
    } catch (error) {
      console.error('Error fetching packages', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/creator-packages/admin/${editingId}`, formData);
      } else {
        await api.post('/creator-packages/admin', formData);
      }
      setShowModal(false);
      fetchPackages();
    } catch (error) {
      console.error('Error saving package', error);
      alert('Có lỗi xảy ra khi lưu!');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa gói này?')) return;
    try {
      await api.delete(`/creator-packages/admin/${id}`);
      fetchPackages();
    } catch (error) {
      console.error('Error deleting package', error);
      alert('Có lỗi xảy ra khi xóa!');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-blue-600" />
            Quản lý Gói Creator
          </h1>
          <p className="text-gray-500 mt-1">Cấu hình các gói đăng ký Creator cho người dùng</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ name: '', durationInMonths: 1, price: 0, description: '', isActive: true });
            setShowModal(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Thêm gói mới
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Đang tải...</div>
        ) : packages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Chưa có gói nào. Hãy tạo gói đầu tiên!</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Tên gói</th>
                <th className="px-6 py-4">Thời hạn</th>
                <th className="px-6 py-4">Giá</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {packages.map((pkg) => (
                <tr key={pkg._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{pkg.name}</div>
                    <div className="text-sm text-gray-500">{pkg.description}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{pkg.durationInMonths} tháng</td>
                  <td className="px-6 py-4 font-medium text-green-600">{pkg.price.toLocaleString()} đ</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-lg ${pkg.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {pkg.isActive ? 'Đang bán' : 'Đã ẩn'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => {
                        setEditingId(pkg._id);
                        setFormData({
                          name: pkg.name,
                          durationInMonths: pkg.durationInMonths,
                          price: pkg.price,
                          description: pkg.description || '',
                          isActive: pkg.isActive
                        });
                        setShowModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(pkg._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">{editingId ? 'Chỉnh sửa gói' : 'Thêm gói mới'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên gói</label>
                <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="VD: Gói Creator 1 Tháng" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thời hạn (Tháng)</label>
                  <input required type="number" min="1" value={formData.durationInMonths} onChange={(e) => setFormData({...formData, durationInMonths: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VNĐ)</label>
                  <input required type="number" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả quyền lợi</label>
                <textarea rows={3} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-xl" placeholder="Được đăng bán lịch trình..." />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="isActive" checked={formData.isActive} onChange={(e) => setFormData({...formData, isActive: e.target.checked})} className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600" />
                <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Đang bán (Hiển thị trên App)</label>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium">Hủy</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">Lưu lại</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
