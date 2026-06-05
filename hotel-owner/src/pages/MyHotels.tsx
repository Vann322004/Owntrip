import { useState, useEffect } from "react";
import {
  Building2,
  Edit2,
  Plus,
  Star,
  X,
  Loader2,
  AlertCircle,
  MapPin,
  Save,
  Image,
  ShieldCheck,
  FileText,
  Clock,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";
import api from "../lib/axios";
import ImageUploader from "../components/ImageUploader";
import SingleImageUploader from "../components/SingleImageUploader";

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

interface HotelRequest {
  requestId: string;
  hotelName: string;
  address: string;
  city: string;
  phone: string;
  description: string;
  images: string[];
  legalDocuments?: {
    businessLicense?: string;
    securityCertificate?: string;
    pcccCertificate?: string;
    identityCardFront?: string;
    identityCardBack?: string;
    leaseContract?: string;
  };
  amenities: string[];
  businessPolicies?: {
    cancellationPolicy?: string;
    childPolicy?: string;
    checkInTime?: string;
    checkOutTime?: string;
    extraCosts?: string;
  };
  status: "pending" | "approved" | "rejected";
  adminComment?: string;
  createdAt: string;
}

export default function MyHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [requests, setRequests] = useState<HotelRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Mode controllers
  const [activeHotel, setActiveHotel] = useState<Hotel | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreatingRequest, setIsCreatingRequest] = useState(false);

  // Tab control
  const [activeTab, setActiveTab] = useState<"approved" | "requests">(
    "approved",
  );
  const [requestSubTab, setRequestSubTab] = useState<"pending" | "approved" | "rejected">(
    "pending",
  );

  // --- Step Wizard State for Hotel Request ---
  const [step, setStep] = useState(1);
  const [hasAgreedTerms, setHasAgreedTerms] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [hotelName, setHotelName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [amenityInput, setAmenityInput] = useState("");
  const [amenities, setAmenities] = useState<string[]>([]);

  // Legal docs
  const [businessLicense, setBusinessLicense] = useState("");
  const [securityCertificate, setSecurityCertificate] = useState("");
  const [pcccCertificate, setPcccCertificate] = useState("");
  const [identityCardFront, setIdentityCardFront] = useState("");
  const [identityCardBack, setIdentityCardBack] = useState("");
  const [leaseContract, setLeaseContract] = useState("");

  // Business policies
  const [cancellationPolicy, setCancellationPolicy] = useState(
    "Miễn phí hủy phòng trước 24 giờ",
  );
  const [childPolicy, setChildPolicy] = useState(
    "Trẻ em dưới 6 tuổi được ở miễn phí cùng bố mẹ",
  );
  const [checkInTime, setCheckInTime] = useState("14:00");
  const [checkOutTime, setCheckOutTime] = useState("12:00");
  const [extraCosts, setExtraCosts] = useState("Phụ thu kê thêm giường phụ");

  // --- Normal Editing states (approved hotels) ---
  const [starRating, setStarRating] = useState(4);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [invStart, setInvStart] = useState("");
  const [invEnd, setInvEnd] = useState("");
  const [invRoomType, setInvRoomType] = useState("");
  const [invTotal, setInvTotal] = useState(5);
  const [invPrice, setInvPrice] = useState(1000000);
  const [showInvSetup, setShowInvSetup] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [hotelsRes, requestsRes] = await Promise.all([
        api.get("/hotels/my-hotels"),
        api.get("/hotel-requests/me"),
      ]);

      if (hotelsRes.data?.success) {
        setHotels(hotelsRes.data.data || []);
      }
      if (requestsRes.data?.success) {
        setRequests(requestsRes.data.data || []);
      }
    } catch {
      setError("Không thể tải danh sách dữ liệu.");
    } finally {
      setLoading(false);
    }
  }

  const handleEdit = (hotel: Hotel) => {
    setActiveHotel(hotel);
    setHotelName(hotel.name);
    setStarRating(hotel.starRating);
    setAddress(hotel.address.fullAddress);
    setCity(hotel.address.city);
    setDescription(hotel.description || "");
    setImages(hotel.images || []);
    setAmenities(hotel.amenities || []);
    setRooms(hotel.rooms || []);
    setIsEditing(true);
    setIsCreatingRequest(false);
    setShowInvSetup(false);
  };

  const startCreateRequest = () => {
    // Reset registration request states
    setStep(1);
    setHasAgreedTerms(false);
    setIsAccepted(false);
    setHotelName("");
    setPhone("");
    setAddress("");
    setCity("");
    setDescription("");
    setImages([]);
    setAmenities([]);
    setBusinessLicense("");
    setSecurityCertificate("");
    setPcccCertificate("");
    setIdentityCardFront("");
    setIdentityCardBack("");
    setLeaseContract("");
    setCancellationPolicy("Miễn phí hủy phòng trước 24 giờ");
    setChildPolicy("Trẻ em dưới 6 tuổi được ở miễn phí cùng bố mẹ");
    setCheckInTime("14:00");
    setCheckOutTime("12:00");
    setExtraCosts("Phụ thu kê thêm giường phụ");

    setIsCreatingRequest(true);
    setIsEditing(false);
  };

  const addAmenity = () => {
    if (amenityInput.trim() && !amenities.includes(amenityInput.trim())) {
      setAmenities([...amenities, amenityInput.trim()]);
      setAmenityInput("");
    }
  };

  const removeAmenity = (item: string) => {
    setAmenities(amenities.filter((a) => a !== item));
  };

  // Approved hotel editing room setup
  const addRoom = () => {
    const newRoom: Room = {
      roomTypeId: `room_${Date.now()}`,
      name: "Phòng Deluxe",
      description: "Phòng Deluxe rộng rãi, đầy đủ tiện nghi.",
      basePrice: 1200000,
      capacity: 2,
      totalRooms: 5,
    };
    setRooms([...rooms, newRoom]);
  };

  const updateRoomField = (
    index: number,
    field: keyof Room,
    value: string | number,
  ) => {
    const updated = [...rooms];
    updated[index] = { ...updated[index], [field]: value };
    setRooms(updated);
  };

  const removeRoom = (index: number) => {
    setRooms(rooms.filter((_, i) => i !== index));
  };

  // Submit request flow
  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const payload = {
      hotelName,
      address,
      city,
      phone,
      description,
      images,
      legalDocuments: {
        businessLicense,
        securityCertificate,
        pcccCertificate,
        identityCardFront,
        identityCardBack,
        leaseContract,
      },
      amenities,
      businessPolicies: {
        cancellationPolicy,
        childPolicy,
        checkInTime,
        checkOutTime,
        extraCosts,
      },
    };

    try {
      const res = await api.post("/hotel-requests", payload);
      if (res.data?.success) {
        setSuccess(
          "Đơn yêu cầu đăng ký khách sạn của bạn đã được gửi thành công!",
        );
        setIsCreatingRequest(false);
        setActiveTab("requests");
        loadData();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Có lỗi xảy ra khi gửi yêu cầu đăng ký.",
      );
    }
  };

  // Save changes to approved hotel
  const handleSaveHotel = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const hotelPayload: any = {
      name: hotelName,
      starRating,
      address: {
        fullAddress: address,
        city,
        coordinates: { lat: 10.762622, lng: 106.660172 },
      },
      images,
      description,
      amenities,
      rooms,
    };

    if (showInvSetup && invStart && invEnd && invRoomType) {
      hotelPayload.inventorySetup = [
        {
          start: invStart,
          end: invEnd,
          roomTypeId: invRoomType,
          total: Number(invTotal),
          price: Number(invPrice),
        },
      ];
    }

    try {
      if (activeHotel) {
        await api.patch(`/hotels/${activeHotel.hotelId}`, hotelPayload);
        setSuccess("Cập nhật thông tin khách sạn thành công!");
        setIsEditing(false);
        loadData();
      }
    } catch (err: any) {
      setError(
        err.response?.data?.message || "Lỗi khi cập nhật thông tin khách sạn.",
      );
    }
  };

  const renderRequestCard = (r: HotelRequest) => (
    <div
      key={r.requestId}
      className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between gap-4"
    >
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-slate-900">
            {r.hotelName}
          </h3>
          <span
            className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
              r.status === "approved"
                ? "bg-emerald-50 text-emerald-700"
                : r.status === "rejected"
                  ? "bg-red-50 text-red-700"
                  : "bg-amber-50 text-amber-700"
            }`}
          >
            {r.status === "pending"
              ? "Chờ kiểm duyệt"
              : r.status === "approved"
                ? "Đã duyệt"
                : "Từ chối"}
          </span>
        </div>

        <div className="text-xs text-slate-500 space-y-1">
          <p>
            <span className="font-semibold text-slate-700">
              Địa chỉ:
            </span>{" "}
            {r.address}, {r.city}
          </p>
          <p>
            <span className="font-semibold text-slate-700">
              Điện thoại:
            </span>{" "}
            {r.phone}
          </p>
          {r.adminComment && (
            <p className="mt-2 p-3 bg-slate-50 rounded-xl text-slate-600 border border-slate-100 italic">
              <span className="font-bold text-slate-700 not-italic">
                Lưu ý của Admin:
              </span>{" "}
              "{r.adminComment}"
            </p>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 text-right text-xs text-slate-400 flex flex-col justify-between">
        <p>
          Mã đơn:{" "}
          <span className="font-mono font-bold text-slate-700">
            {r.requestId}
          </span>
        </p>
        <p className="mt-1">
          Gửi ngày:{" "}
          {new Date(r.createdAt).toLocaleDateString("vi-VN")}
        </p>
      </div>
    </div>
  );

  if (loading && hotels.length === 0 && requests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400">
        <Loader2 className="w-10 h-10 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm">Đang tải danh sách khách sạn của bạn...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 text-left">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Khách sạn của tôi
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Quản lý cơ sở lưu trú và theo dõi yêu cầu xét duyệt
          </p>
        </div>
        {!isEditing && !isCreatingRequest && (
          <button
            onClick={startCreateRequest}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/10"
          >
            <Plus className="w-4 h-4" />
            Yêu cầu thêm khách sạn
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-2xl flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">{success}</p>
        </div>
      )}

      {/* --- STEP WIZARD: CREATE NEW HOTEL REGISTRATION REQUEST --- */}
      {isCreatingRequest && (
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md space-y-6">
          {!hasAgreedTerms ? (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Điều khoản & Điều kiện đối tác
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Vui lòng đọc kỹ và đồng ý với các điều khoản hợp tác cùng
                    Owntrip
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingRequest(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="max-h-[400px] overflow-y-auto pr-2 space-y-6 text-sm text-slate-600 leading-relaxed scrollbar-thin">
                <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex gap-3 text-amber-800">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900 text-sm">
                      1. Chính sách hoa hồng (Quan trọng)
                    </h4>
                    <p className="mt-1 text-xs">
                      Owntrip thu{" "}
                      <strong className="text-amber-950">10% hoa hồng</strong>{" "}
                      từ mỗi lượt đặt phòng thành công thông qua hệ thống của
                      ứng dụng.
                    </p>
                    <p className="mt-1 text-[11px] text-amber-700">
                      Phí hoa hồng này được tính dựa trên tổng giá trị đơn đặt
                      phòng của khách hàng và sẽ được tự động khấu trừ vào doanh
                      thu của đối tác sau khi đơn đặt phòng hoàn thành.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-950 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    2. Trách nhiệm của Đối tác
                  </h4>
                  <ul className="list-disc list-inside pl-4 space-y-1 text-xs text-slate-500">
                    <li>
                      Cung cấp thông tin chính xác về cơ sở lưu trú bao gồm tên,
                      địa chỉ, hình ảnh thực tế và các tiện nghi đi kèm.
                    </li>
                    <li>
                      Đảm bảo phòng luôn sẵn sàng đúng như mô tả khi khách hàng
                      đến nhận phòng.
                    </li>
                    <li>
                      Chịu trách nhiệm hoàn toàn về tính pháp lý của cơ sở kinh
                      doanh theo quy định pháp luật hiện hành.
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-950 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    3. Thanh toán & Đối soát
                  </h4>
                  <ul className="list-disc list-inside pl-4 space-y-1 text-xs text-slate-500">
                    <li>
                      Doanh thu của đối tác sẽ được ghi nhận vào ví tích lũy
                      trên hệ thống ngay sau khi khách hàng hoàn tất thủ tục trả
                      phòng.
                    </li>
                    <li>
                      Đối tác có thể thực hiện yêu cầu rút tiền về tài khoản
                      ngân hàng liên kết theo chu kỳ đối soát được thỏa thuận.
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <h4 className="font-bold text-slate-950 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    4. Bảo mật thông tin & Giải quyết khiếu nại
                  </h4>
                  <ul className="list-disc list-inside pl-4 space-y-1 text-xs text-slate-500">
                    <li>
                      Đối tác cam kết bảo mật tuyệt đối thông tin cá nhân của
                      khách hàng đặt phòng.
                    </li>
                    <li>
                      Mọi tranh chấp giữa đối tác và khách hàng sẽ được ưu tiên
                      giải quyết thương lượng. Owntrip sẽ đóng vai trò trung
                      gian hỗ trợ giải quyết nếu cần thiết.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Checkbox and Agreement button */}
              <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isAccepted}
                    onChange={(e) => setIsAccepted(e.target.checked)}
                    className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500/20 cursor-pointer"
                  />
                  <span className="text-xs font-semibold text-slate-600">
                    Tôi đã đọc và đồng ý với các điều khoản đối tác nêu trên.
                  </span>
                </label>

                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCreatingRequest(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-xs font-semibold"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="button"
                    disabled={!isAccepted}
                    onClick={() => setHasAgreedTerms(true)}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:hover:bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow-md transition-all disabled:cursor-not-allowed"
                  >
                    Đồng ý & Tiếp tục <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-base font-bold text-slate-950">
                    Gửi đơn đăng ký khách sạn mới
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Vui lòng hoàn thành 4 bước cung cấp thông tin để gửi kiểm
                    duyệt
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreatingRequest(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stepper HUD */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { num: 1, label: "Thông tin cơ bản", icon: Building2 },
                  { num: 2, label: "Ảnh & Tiện ích", icon: Image },
                  { num: 3, label: "Giấy tờ pháp lý", icon: FileText },
                  { num: 4, label: "Chính sách", icon: ShieldCheck },
                ].map((s) => (
                  <div
                    key={s.num}
                    className={`p-3 rounded-xl border transition-all flex items-center gap-3 ${
                      step === s.num
                        ? "border-emerald-500 bg-emerald-50/50 text-emerald-700 font-semibold"
                        : step > s.num
                          ? "border-slate-200 bg-slate-50 text-slate-500"
                          : "border-slate-100 text-slate-400"
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        step >= s.num
                          ? "bg-emerald-600 text-white"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {s.num}
                    </div>
                    <div className="hidden md:block">
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">
                        Bước {s.num}
                      </p>
                      <p className="text-xs leading-none mt-0.5">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Step Panels */}
              <div className="py-2">
                {/* STEP 1: Basic Info */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">
                          Tên khách sạn
                        </label>
                        <input
                          type="text"
                          placeholder="Nhập tên chính thức"
                          value={hotelName}
                          onChange={(e) => setHotelName(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800 font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">
                          Số điện thoại liên hệ
                        </label>
                        <input
                          type="text"
                          placeholder="Số điện thoại bàn hoặc di động"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800 font-medium"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">
                          Thành phố / Tỉnh
                        </label>
                        <input
                          type="text"
                          placeholder="Ví dụ: Đà Lạt, Nha Trang, HCM"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800 font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">
                          Địa chỉ chi tiết
                        </label>
                        <input
                          type="text"
                          placeholder="Nhập số nhà, tên đường, phường..."
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800 font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Mô tả khách sạn
                      </label>
                      <textarea
                        rows={4}
                        placeholder="Mô tả chi tiết vị trí, quy mô khách sạn của bạn..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white focus:border-emerald-500 outline-none text-slate-800 font-medium"
                      />
                    </div>
                  </div>
                )}

                {/* STEP 2: Images & Amenities */}
                {step === 2 && (
                  <div className="space-y-6">
                    {/* Images */}
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase block">
                        Hình ảnh khách sạn
                      </label>
                      <ImageUploader
                        images={images}
                        onChange={setImages}
                        maxImages={10}
                      />
                    </div>

                    {/* Amenities */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-slate-500 uppercase block">
                        Tiện ích cơ bản
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Ví dụ: WiFi miễn phí, Điều hòa, Bể bơi"
                          value={amenityInput}
                          onChange={(e) => setAmenityInput(e.target.value)}
                          className="flex-1 px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white outline-none"
                        />
                        <button
                          type="button"
                          onClick={addAmenity}
                          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold"
                        >
                          Thêm
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {amenities.map((a) => (
                          <span
                            key={a}
                            className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-xs font-medium"
                          >
                            {a}
                            <button
                              type="button"
                              onClick={() => removeAmenity(a)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Legal Documents */}
                {step === 3 && (
                  <div className="space-y-6">
                    <p className="text-xs text-amber-600 font-medium">
                      Vui lòng tải ảnh/tài liệu liên quan tới giấy tờ pháp lý cơ
                      sở để bộ phận kiểm duyệt xác minh.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SingleImageUploader
                        label="Giấy phép Đăng ký kinh doanh"
                        value={businessLicense}
                        onChange={setBusinessLicense}
                        hint="Tải lên ảnh chụp giấy phép đăng ký kinh doanh rõ nét"
                      />
                      <SingleImageUploader
                        label="Giấy chứng nhận PCCC"
                        value={pcccCertificate}
                        onChange={setPcccCertificate}
                        hint="Tải lên ảnh chụp chứng nhận phòng cháy chữa cháy"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <SingleImageUploader
                        label="CCCD Người đại diện - Mặt trước"
                        value={identityCardFront}
                        onChange={setIdentityCardFront}
                        hint="Ảnh chụp mặt trước căn cước công dân"
                      />
                      <SingleImageUploader
                        label="CCCD Người đại diện - Mặt sau"
                        value={identityCardBack}
                        onChange={setIdentityCardBack}
                        hint="Ảnh chụp mặt sau căn cước công dân"
                      />
                    </div>

                    <SingleImageUploader
                      label="Hợp đồng thuê mặt bằng / Sở hữu đất"
                      value={leaseContract}
                      onChange={setLeaseContract}
                      hint="Ảnh chụp hợp đồng thuê hoặc giấy tờ sở hữu đất hợp lệ"
                    />
                  </div>
                )}

                {/* STEP 4: Business Policies */}
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">
                          Giờ nhận phòng (Check-in)
                        </label>
                        <input
                          type="text"
                          value={checkInTime}
                          onChange={(e) => setCheckInTime(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white outline-none text-slate-800"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase">
                          Giờ trả phòng (Check-out)
                        </label>
                        <input
                          type="text"
                          value={checkOutTime}
                          onChange={(e) => setCheckOutTime(e.target.value)}
                          className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white outline-none text-slate-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Chính sách hủy phòng
                      </label>
                      <textarea
                        rows={2}
                        value={cancellationPolicy}
                        onChange={(e) => setCancellationPolicy(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white outline-none text-slate-800"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">
                        Chính sách trẻ em / phụ thu
                      </label>
                      <textarea
                        rows={2}
                        value={childPolicy}
                        onChange={(e) => setChildPolicy(e.target.value)}
                        className="w-full px-4 py-2.5 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white outline-none text-slate-800"
                      />
                    </div>
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex gap-3 text-emerald-800 mt-4">
                      <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                      <p className="text-xs font-medium">
                        Bằng cách gửi yêu cầu, bạn đồng ý với các điều khoản đối
                        tác (bao gồm mức hoa hồng 10%) của Owntrip.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stepper Actions footer */}
              <div className="pt-6 border-t border-slate-100 flex justify-between">
                <button
                  type="button"
                  disabled={step === 1}
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-4 h-4" /> Quay lại
                </button>

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold"
                  >
                    Tiếp theo <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleRequestSubmit}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md"
                  >
                    <Save className="w-4 h-4" /> Gửi đơn đăng ký
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* --- EDITOR: EDITING ACTIVE APPROVED HOTEL ROOMS & SETTINGS --- */}
      {isEditing && activeHotel && (
        <form
          onSubmit={handleSaveHotel}
          className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md space-y-6"
        >
          <div className="flex justify-between items-center pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-950">
                Chỉnh sửa phòng & thông tin: {activeHotel.name}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Khách sạn đã được duyệt. Bạn có thể sửa phòng và tiện nghi.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Tên khách sạn
              </label>
              <input
                type="text"
                required
                value={hotelName}
                onChange={(e) => setHotelName(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Hạng sao
              </label>
              <select
                value={starRating}
                onChange={(e) => setStarRating(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border-transparent rounded-xl text-sm focus:bg-white outline-none"
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <option key={s} value={s}>
                    {s} sao
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Images for edit form */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase">
              Hình ảnh khách sạn
            </label>
            <ImageUploader
              images={images}
              onChange={setImages}
              maxImages={10}
            />
          </div>

          {/* Rooms Configurations */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <label className="text-xs font-bold text-slate-500 uppercase">
                Cấu hình phòng lưu trú
              </label>
              <button
                type="button"
                onClick={addRoom}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm loại phòng
              </button>
            </div>

            {rooms.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Vui lòng thiết lập tối thiểu 1 loại phòng để bắt đầu nhận
                booking.
              </p>
            ) : (
              <div className="space-y-4">
                {rooms.map((room, index) => (
                  <div
                    key={room.roomTypeId}
                    className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4 relative"
                  >
                    <button
                      type="button"
                      onClick={() => removeRoom(index)}
                      className="absolute top-4 right-4 p-1 text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">
                          Tên phòng
                        </label>
                        <input
                          type="text"
                          required
                          value={room.name}
                          onChange={(e) =>
                            updateRoomField(index, "name", e.target.value)
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">
                          Giá cơ bản (VND)
                        </label>
                        <input
                          type="number"
                          required
                          value={room.basePrice}
                          onChange={(e) =>
                            updateRoomField(
                              index,
                              "basePrice",
                              Number(e.target.value),
                            )
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">
                          Sức chứa
                        </label>
                        <input
                          type="number"
                          required
                          value={room.capacity}
                          onChange={(e) =>
                            updateRoomField(
                              index,
                              "capacity",
                              Number(e.target.value),
                            )
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase">
                          Tổng số phòng
                        </label>
                        <input
                          type="number"
                          required
                          value={room.totalRooms}
                          onChange={(e) =>
                            updateRoomField(
                              index,
                              "totalRooms",
                              Number(e.target.value),
                            )
                          }
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs mt-1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Pricing Setup */}
          {rooms.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showInvSetup}
                  onChange={(e) => {
                    setShowInvSetup(e.target.checked);
                    if (e.target.checked && rooms.length > 0) {
                      setInvRoomType(rooms[0].roomTypeId);
                    }
                  }}
                  className="w-4 h-4 text-emerald-600 border-slate-300 rounded focus:ring-emerald-500"
                />
                <span className="text-xs font-bold text-slate-600 uppercase">
                  Cập nhật nhanh Lịch phòng & Giá phòng
                </span>
              </label>

              {showInvSetup && (
                <div className="p-5 border border-dashed border-slate-200 rounded-2xl bg-amber-50/20 space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">
                      Từ ngày
                    </label>
                    <input
                      type="date"
                      required={showInvSetup}
                      value={invStart}
                      onChange={(e) => setInvStart(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">
                      Đến ngày
                    </label>
                    <input
                      type="date"
                      required={showInvSetup}
                      value={invEnd}
                      onChange={(e) => setInvEnd(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500">
                      Phòng áp dụng
                    </label>
                    <select
                      value={invRoomType}
                      onChange={(e) => setInvRoomType(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                    >
                      {rooms.map((r) => (
                        <option key={r.roomTypeId} value={r.roomTypeId}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">
                        Giá phòng (VND)
                      </label>
                      <input
                        type="number"
                        required={showInvSetup}
                        value={invPrice}
                        onChange={(e) => setInvPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-500">
                        Tổng phòng mở
                      </label>
                      <input
                        type="number"
                        required={showInvSetup}
                        value={invTotal}
                        onChange={(e) => setInvTotal(Number(e.target.value))}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="pt-6 border-t border-slate-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-sm font-semibold"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-md"
            >
              <Save className="w-4 h-4" /> Lưu thông tin
            </button>
          </div>
        </form>
      )}

      {/* --- TABS: APPROVED HOTELS vs REQUESTS IN REVIEW --- */}
      {!isEditing && !isCreatingRequest && (
        <div className="space-y-6">
          <div className="border-b border-slate-100 flex gap-4">
            <button
              onClick={() => setActiveTab("approved")}
              className={`pb-3 font-semibold text-sm transition-colors relative ${
                activeTab === "approved"
                  ? "text-emerald-700"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Khách sạn đang hoạt động ({hotels.length})
              {activeTab === "approved" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("requests")}
              className={`pb-3 font-semibold text-sm transition-colors relative ${
                activeTab === "requests"
                  ? "text-emerald-700"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              Yêu cầu duyệt ({requests.length})
              {activeTab === "requests" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-600" />
              )}
            </button>
          </div>

          {/* TAB 1: Approved Active Hotels */}
          {activeTab === "approved" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center col-span-full shadow-sm">
                  <Building2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-base font-bold text-slate-800">
                    Chưa có khách sạn hoạt động
                  </h3>
                  <p className="text-slate-400 text-xs mt-1 max-w-sm mx-auto">
                    Bấm "Yêu cầu thêm khách sạn" ở góc trên bên phải để gửi
                    thông tin phê duyệt cơ sở mới.
                  </p>
                </div>
              ) : (
                hotels.map((h) => (
                  <div
                    key={h.hotelId}
                    className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm flex flex-col group hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                      {h.images?.[0] ? (
                        <img
                          src={h.images[0]}
                          alt={h.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <Image className="w-8 h-8" />
                        </div>
                      )}
                      <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-0.5 rounded-full text-[10px] font-bold text-slate-700 shadow-sm flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                        {h.starRating} sao
                      </span>
                    </div>

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold text-slate-900 truncate">
                          {h.name}
                        </h3>
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-300" />
                          {h.address.city}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-2 mt-2 leading-relaxed">
                          {h.description ||
                            "Chưa có thông tin mô tả chi tiết khách sạn."}
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
                          <Edit2 className="w-3 h-3" /> Cấu hình & sửa
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 2: Submitted Requests list */}
          {activeTab === "requests" && (
            <div className="space-y-6">
              {requests.length === 0 ? (
                <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
                  <Clock className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                  <h3 className="text-base font-bold text-slate-800">
                    Chưa gửi yêu cầu phê duyệt nào
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Các đơn yêu cầu mở khách sạn mới của bạn sẽ hiển thị ở đây
                    để theo dõi.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Horizontal Sub-tabs */}
                  <div className="flex flex-wrap gap-2 p-1 bg-slate-100/80 rounded-2xl w-fit">
                    <button
                      type="button"
                      onClick={() => setRequestSubTab("pending")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        requestSubTab === "pending"
                          ? "bg-white text-amber-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                      Đang chờ duyệt ({requests.filter(r => r.status === "pending").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestSubTab("approved")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        requestSubTab === "approved"
                          ? "bg-white text-emerald-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Đã duyệt ({requests.filter(r => r.status === "approved").length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestSubTab("rejected")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        requestSubTab === "rejected"
                          ? "bg-white text-red-700 shadow-sm"
                          : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-red-500"></span>
                      Từ chối ({requests.filter(r => r.status === "rejected").length})
                    </button>
                  </div>

                  {/* Sub-tab Content */}
                  <div className="mt-2 animate-in fade-in duration-300">
                    {requestSubTab === "pending" && (
                      <div className="space-y-4">
                        {requests.filter(r => r.status === "pending").length === 0 ? (
                          <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
                            <Clock className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <h3 className="text-base font-bold text-slate-800">
                              Không có yêu cầu đang chờ duyệt
                            </h3>
                            <p className="text-slate-400 text-xs mt-1">
                              Các yêu cầu mới gửi duyệt sẽ xuất hiện tại đây.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {requests.filter(r => r.status === "pending").map(renderRequestCard)}
                          </div>
                        )}
                      </div>
                    )}

                    {requestSubTab === "approved" && (
                      <div className="space-y-4">
                        {requests.filter(r => r.status === "approved").length === 0 ? (
                          <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
                            <CheckCircle2 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <h3 className="text-base font-bold text-slate-800">
                              Chưa có yêu cầu nào được duyệt
                            </h3>
                            <p className="text-slate-400 text-xs mt-1">
                              Khi yêu cầu được duyệt, thông tin sẽ được cập nhật tại đây.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {requests.filter(r => r.status === "approved").map(renderRequestCard)}
                          </div>
                        )}
                      </div>
                    )}

                    {requestSubTab === "rejected" && (
                      <div className="space-y-4">
                        {requests.filter(r => r.status === "rejected").length === 0 ? (
                          <div className="bg-white border border-slate-100 rounded-3xl p-16 text-center shadow-sm">
                            <AlertCircle className="w-16 h-16 text-slate-200 mx-auto mb-4" />
                            <h3 className="text-base font-bold text-slate-800">
                              Không có yêu cầu nào bị từ chối
                            </h3>
                            <p className="text-slate-400 text-xs mt-1">
                              Các yêu cầu bị từ chối sẽ hiển thị tại đây kèm lý do của Admin.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {requests.filter(r => r.status === "rejected").map(renderRequestCard)}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
