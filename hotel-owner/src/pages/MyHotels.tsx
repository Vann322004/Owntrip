import { useState, useEffect } from 'react';
import { 
  Building2, Edit2, Plus, Star, X, Loader2, AlertCircle, 
  MapPin, Check, Save, Image, Calendar
} from 'lucide-react';
import api from '../lib/axios';

interface Room {
  roomTypeId: string;
  name: string;
  description: string;
  basePrice: number;
  capacity: number;
  totalRooms: number;
}

interface Hotel {
  hotelId: string;
  name: string;
  starRating: number;
  address: {
    fullAddress: string;
    city: string;
  };
  images: string[];
  description: string;
  amenities: string[];
  tags: string[];
  rooms: Room[];
}

export default function MyHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeHotel, setActiveHotel] = useState<Hotel | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [starRating, setStarRating] = useState(4);
  const [fullAddress, setFullAddress] = useState('');
  const [city, setCity] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState('');
  const [amenities, setAmenities] = useState<string[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);

  // Inventory Setup state (for dates pricing setup)
  const [invStart, setInvStart] = useState('');
  const [invEnd, setInvEnd] = useState('');
  const [invRoomType, setInvRoomType] = useState('');
  const [invTotal, setInvTotal] = useState(5);
  const [invPrice, setInvPrice] = useState(1000000);
  const [showInvSetup, setShowInvSetup] = useState(false);

  useEffect(() => {
    loadHotels();
  }, []);

  async function loadHotels() {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/hotels/my-hotels');
      if (res.data?.success) {
        setHotels(res.data.data || []);
      }
    } catch {
      setError('Không thể tải danh sách khách sạn của bạn.');
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (hotel: Hotel) => {
    setActiveHotel(hotel);
    setName(hotel.name);
    setStarRating(hotel.starRating);
    setFullAddress(hotel.address.fullAddress);
    setCity(hotel.address.city);
    setDescription(hotel.description || '');
    setImages(hotel.images || []);
    setAmenities(hotel.amenities || []);
    setRooms(hotel.rooms || []);
    setIsEditing(true);
    setIsCreating(false);
    setShowInvSetup(false);
  };

  const handleCreateNew = () => {
    setName('');
    setStarRating(4);
    setFullAddress('');
    setCity('');
    setDescription('');
    setImages([]);
    setAmenities([]);
    setRooms([]);
    setIsEditing(false);
    setIsCreating(true);
    setShowInvSetup(false);
  };

  const addImage = () => {
    if (imageUrl.trim()) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl('');
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput('');
    }
  };

  const removeAmenity = (item: string) => {
    setAmenities(amenities.filter(a => a !== item));
  };

  const addRoom = () => {
    const newRoom: Room = {
      roomTypeId: `room_${Date.now()}`,
      name: 'Phòng Deluxe',
      description: 'Phòng Deluxe rộng rãi, đầy đủ tiện nghi.',
      basePrice: 1200000,
      capacity: 2,
      totalRooms: 5
    };
    setRooms([...rooms, newRoom]);
  };

  const updateRoomField = (index: number, field: keyof Room, value: string | number) => {
    const updated = [...rooms];
    updated[index] = { ...updated[index], [field]: value };
    setRooms(updated);
  };

  const removeRoom = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const hotelPayload: any = {
      name,
      starRating,
      address: {
        fullAddress,
        city,
        coordinates: { lat: 10.762622, lng: 106.660172 } // Default coordinates
      },
      images,
      description,
      amenities,
      rooms
    };

    // If inventory setup is configured
    if (showInvSetup && invStart && invEnd && invRoomType) {
      hotelPayload.inventorySetup = [
        {
          start: invStart,
          end: invEnd,
          roomTypeId: invRoomType,
          total: Number(invTotal),
          price: Number(invPrice)
        }
      ];
    }

    try {
      if (isCreating) {
        await api.post('/hotels/create', hotelPayload);
      } else if (isEditing && activeHotel) {
        await api.patch(`/hotels/${activeHotel.hotelId}`, hotelPayload);
      }
      setIsEditing(false);
      setIsCreating(false);
      loadHotels();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Lỗi khi lưu thông tin khách sạn.');
    }
  };

  if (loading && hotels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm">Đang tải khách sạn của bạn...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Khách sạn của tôi</h1>
          <p className="text-slate-500 text-sm mt-1">Quản lý cơ sở vật chất, loại phòng và giá cả</p>
        </div>
        {!isEditing && !isCreating && (
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/10"
          >
            <Plus className="w-4 h-4" />
            Thêm khách sạn
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Editor / Creator Panel */}
      {(isEditing || isCreating) ? (
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-950">
              {isCreating ? 'Tạo khách sạn mới' : `Chỉnh sửa: ${activeHotel?.name}`}
            </h2>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setIsCreating(false);
              }}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tên khách sạn */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tên khách sạn</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 font-medium transition-all"
              />
            </div>

            {/* Hạng sao */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hạng sao</label>
              <select
                value={starRating}
                onChange={e => setStarRating(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 font-medium transition-all"
              >
                {[1, 2, 3, 4, 5].map(s => (
                  <option key={s} value={s}>{s} sao</option>
                ))}
              </select>
            </div>

            {/* Thành phố */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Thành phố</label>
              <input
                type="text"
                required
                value={city}
                onChange={e => setCity(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 font-medium transition-all"
              />
            </div>

            {/* Địa chỉ chi tiết */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Địa chỉ chi tiết</label>
              <input
                type="text"
                required
                value={fullAddress}
                onChange={e => setFullAddress(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 font-medium transition-all"
              />
            </div>
          </div>

          {/* Mô tả */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mô tả khách sạn</label>
            <textarea
              rows={4}
              value={description}
              onChange={e => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 font-medium transition-all"
            />
          </div>

          {/* Hình ảnh */}
          <div className="space-y-4">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Quản lý hình ảnh</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Link ảnh (URL)"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 font-medium transition-all"
              />
              <button
                type="button"
                onClick={addImage}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
              >
                Thêm ảnh
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {images.map((img, i) => (
                <div key={i} className="relative group rounded-xl overflow-hidden aspect-video border border-slate-100 bg-slate-50">
                  <img src={img} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Tiện nghi */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">Tiện ích khách sạn</label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Ví dụ: WiFi miễn phí, Bể bơi, Spa..."
                value={amenityInput}
                onChange={e => setAmenityInput(e.target.value)}
                className="flex-1 px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-slate-900 font-medium transition-all"
              />
              <button
                type="button"
                onClick={addAmenity}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
              >
                Thêm tiện ích
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {amenities.map(a => (
                <span key={a} className="inline-flex items-center gap-1 bg-slate-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-medium">
                  {a}
                  <button type="button" onClick={() => removeAmenity(a)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Cấu hình Phòng */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cấu hình loại phòng</label>
              <button
                type="button"
                onClick={addRoom}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm loại phòng
              </button>
            </div>

            {rooms.length === 0 ? (
              <p className="text-sm text-slate-400 italic">Vui lòng thêm ít nhất một loại phòng</p>
            ) : (
              <div className="space-y-4">
                {rooms.map((room, index) => (
                  <div key={room.roomTypeId} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4 relative group">
                    <button
                      type="button"
                      onClick={() => removeRoom(index)}
                      className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Tên phòng</label>
                        <input
                          type="text"
                          required
                          value={room.name}
                          onChange={e => updateRoomField(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Giá cơ bản (VND)</label>
                        <input
                          type="number"
                          required
                          value={room.basePrice}
                          onChange={e => updateRoomField(index, 'basePrice', Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs mt-1 font-bold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Sức chứa (Người)</label>
                        <input
                          type="number"
                          required
                          value={room.capacity}
                          onChange={e => updateRoomField(index, 'capacity', Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">Tổng số lượng phòng</label>
                        <input
                          type="number"
                          required
                          value={room.totalRooms}
                          onChange={e => updateRoomField(index, 'totalRooms', Number(e.target.value))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Thiết lập nhanh Inventory Setup */}
          {rooms.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInvSetup}
                  onChange={e => {
                    setShowInvSetup(e.target.checked);
                    if (e.target.checked && rooms.length > 0) {
                      setInvRoomType(rooms[0].roomTypeId);
                    }
                  }}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Thiết lập nhanh Giá / Tồn kho phòng theo lịch
                </span>
              </label>

              {showInvSetup && (
                <div className="p-5 border border-dashed border-slate-200 rounded-2xl bg-amber-50/20 space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Từ ngày</label>
                    <input
                      type="date"
                      required={showInvSetup}
                      value={invStart}
                      onChange={e => setInvStart(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Đến ngày</label>
                    <input
                      type="date"
                      required={showInvSetup}
                      value={invEnd}
                      onChange={e => setInvEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-500">Áp dụng cho phòng</label>
                    <select
                      value={invRoomType}
                      onChange={e => setInvRoomType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      {rooms.map(r => (
                        <option key={r.roomTypeId} value={r.roomTypeId}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">Giá phòng (VND)</label>
                      <input
                        type="number"
                        required={showInvSetup}
                        value={invPrice}
                        onChange={e => setInvPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-500">Số phòng mở</label>
                      <input
                        type="number"
                        required={showInvSetup}
                        value={invTotal}
                        onChange={e => setInvTotal(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setIsCreating(false);
              }}
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-sm font-semibold"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold"
            >
              <Save className="w-4 h-4" /> Lưu lại
            </button>
          </div>
        </form>
      ) : (
        /* Grid of Hotels */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hotels.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center col-span-full shadow-sm">
              <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-800">Chưa có khách sạn nào</h3>
              <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                Nhấn vào nút "Thêm khách sạn" góc trên bên phải để cấu hình nơi lưu trú đầu tiên của bạn.
              </p>
            </div>
          ) : (
            hotels.map(h => (
              <div key={h.hotelId} className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow">
                {/* Images */}
                <div className="aspect-video bg-slate-100 relative overflow-hidden">
                  {h.images?.[0] ? (
                    <img src={h.images[0]} alt={h.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <Image className="w-8 h-8" />
                    </div>
                  )}
                  <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-700 shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    {h.starRating} sao
                  </span>
                  <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white shadow-sm">
                    {h.hotelId}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-900 truncate">{h.name}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-300" />
                      {h.address.city}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                      {h.description || 'Chưa có thông tin mô tả chi tiết khách sạn.'}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {h.rooms?.length || 0} loại phòng
                    </span>
                    <button
                      onClick={() => handleEdit(h)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold transition-colors"
                    >
                      <Edit2 className="w-3 h-3" /> Chỉnh sửa
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
