import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  ChevronRight, 
  Star, 
  ShieldCheck, 
  Percent, 
  MapPin, 
  Search, 
  Hotel, 
  Compass, 
  Bell, 
  Calendar, 
  Sparkles,
  ArrowRight,
  Map,
  Clock,
  Menu,
  X,
  Download
} from 'lucide-react';
import qrCodeImg from '../assets/qr-code.png';
import logoImg from '../assets/logo.png';

const QRCodeImg = ({ className = "w-full h-full object-contain rounded-lg" }: { className?: string }) => (
  <img 
    src={qrCodeImg} 
    alt="QR Code" 
    className={className}
  />
);

const AppStoreBadge = () => (
  <a 
    href="#" 
    onClick={(e) => e.preventDefault()}
    className="flex items-center gap-3 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 border border-slate-800 duration-200"
  >
    <svg viewBox="0 0 384 512" className="w-6 h-6 fill-white">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 47.5-24.4 76.5 26.9 2.4 51.2-16 68.3-38.9z"/>
    </svg>
    <div className="text-left leading-none">
      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Tải về trên</p>
      <p className="text-sm font-semibold mt-1 font-sans">App Store</p>
    </div>
  </a>
);

const GooglePlayBadge = () => (
  <a 
    href="#" 
    onClick={(e) => e.preventDefault()}
    className="flex items-center gap-3 px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 border border-slate-800 duration-200"
  >
    <svg viewBox="0 0 512 512" className="w-6 h-6 fill-white">
      <path d="M325.3 234.3L104.6 13l280.8 161.2-60.1 60.1zM47 0C34 6.8 25.3 19.2 25.3 35.3v441.3c0 16.1 8.7 28.5 21.7 35.3l256.6-256L47 0zm425.2 225.6l-58 33.3-60.1-60.1 60.1-60.1 58 33.3c13 7.5 21.7 19.3 21.7 33.6s-8.7 26.1-21.7 33.3zm-86.4 52.1L104.6 499l220.7-126.7-60.1-60.1z"/>
    </svg>
    <div className="text-left leading-none">
      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Tải về trên</p>
      <p className="text-sm font-semibold mt-1 font-sans">Google Play</p>
    </div>
  </a>
);

const ExpoBuildBadge = () => (
  <a 
    href="https://expo.dev/accounts/khoale3004/projects/owntrip/builds/36906c47-0020-45b8-bfbb-11186dee3365" 
    target="_blank"
    rel="noopener noreferrer"
    className="flex items-center gap-3 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all shadow-md hover:shadow-lg active:scale-95 border border-emerald-500 duration-200"
  >
    <Download className="w-6 h-6 text-white" />
    <div className="text-left leading-none">
      <p className="text-[10px] text-emerald-100 font-medium uppercase tracking-wider">Tải bản thử nghiệm</p>
      <p className="text-sm font-semibold mt-1 font-sans">Expo EAS Build</p>
    </div>
  </a>
);

export default function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'search' | 'promo' | 'ticket'>('search');

  // Auto transition screens on mockup to feel alive
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTab((prev) => {
        if (prev === 'search') return 'promo';
        if (prev === 'promo') return 'ticket';
        return 'search';
      });
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 selection:bg-emerald-500 selection:text-white relative font-sans">
      {/* Background Blobs Wrapper */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-br from-emerald-200/30 to-teal-200/30 blur-[130px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-gradient-to-tr from-blue-200/20 to-emerald-200/20 blur-[130px]"></div>
      </div>

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/75 border-b border-slate-100/80 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src={logoImg} alt="Owntrip Logo" className="h-10 sm:h-12 object-contain" />
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
              <a href="#features" className="hover:text-emerald-600 transition-colors">Tính năng</a>
              <a href="#download" className="hover:text-emerald-600 transition-colors">Cách tải app</a>
              <a href="#about" className="hover:text-emerald-600 transition-colors">Về chúng tôi</a>
            </nav>

            {/* Header Login / Dashboard CTA */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? (
                <button 
                  onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/20 active:scale-[0.98] transition-all"
                >
                  Kênh quản trị
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <Link 
                    to="/login"
                    className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    Đăng nhập đối tác
                  </Link>
                  <button 
                    onClick={() => {
                      const element = document.getElementById('download');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition-all"
                  >
                    Tải App Ngay
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-100 bg-white/95 backdrop-blur-lg animate-in slide-in-from-top-4 duration-200">
            <div className="px-4 pt-2 pb-6 space-y-3">
              <a 
                href="#features" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                Tính năng
              </a>
              <a 
                href="#download" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                Cách tải app
              </a>
              <a 
                href="#about" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-slate-700 hover:text-emerald-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                Về chúng tôi
              </a>
              <hr className="border-slate-100 my-2" />
              {isAuthenticated ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/dashboard');
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl shadow-md"
                >
                  Kênh quản trị
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex flex-col gap-2 pt-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-3 text-center text-slate-700 font-semibold border border-slate-200 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    Đăng nhập đối tác
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      const element = document.getElementById('download');
                      element?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="w-full py-3 text-center bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-all"
                  >
                    Tải App Ngay
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16 sm:py-20 lg:py-24">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left Column: Heading & Downloads */}
          <div className="lg:col-span-7 text-center lg:text-left space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 text-sm font-semibold">
              <Sparkles className="w-4 h-4 fill-emerald-100" />
              <span>Ứng dụng chính thức dành cho khách hàng</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none sm:leading-[1.1]">
                Tự lập kế hoạch <br />
                Làm chủ mọi <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Chuyến Đi</span>
              </h1>
              <p className="text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                Tải ngay ứng dụng di động Owntrip. Công cụ thiết lập lịch trình du lịch thông minh, giúp bạn tự tạo kế hoạch chi tiết, đặt phòng khách sạn nhanh chóng và làm chủ trọn vẹn hành trình.
              </p>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-slate-500 text-sm">
              <div className="flex items-center gap-1.5 font-medium">
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span className="text-slate-800 font-bold">4.9/5</span> Đánh giá
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
              <div className="flex items-center gap-1.5 font-medium">
                <ShieldCheck className="w-5 h-5 text-emerald-500" />
                Đảm bảo an toàn 100%
              </div>
              <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
              <div className="flex items-center gap-1.5 font-medium">
                <Percent className="w-5 h-5 text-teal-500" />
                Ưu đãi độc quyền App
              </div>
            </div>

            {/* QR + Store Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8 bg-white/40 border border-slate-100 rounded-3xl p-6 backdrop-blur-sm max-w-xl mx-auto lg:mx-0 shadow-sm">
              <div className="w-36 h-36 flex-shrink-0 bg-white p-3 rounded-2xl shadow-md border border-slate-100 flex items-center justify-center group relative overflow-hidden transition-all duration-300 hover:scale-[1.02]">
                <QRCodeImg />
              </div>
              
              <div className="space-y-4 text-center sm:text-left flex-1">
                <h3 className="font-bold text-slate-900 text-base leading-tight">Quét mã QR để tải ứng dụng</h3>
                <p className="text-sm text-slate-500 leading-snug">
                  Mở máy ảnh trên điện thoại của bạn, quét mã và cài đặt nhanh chóng cho cả iOS và Android.
                </p>
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <AppStoreBadge />
                  <GooglePlayBadge />
                  <ExpoBuildBadge />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D-effect Interactive Phone Mockup */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative animate-in fade-in zoom-in-95 duration-1000">
            {/* Soft decorative background circles */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
            
            {/* Mockup Frame */}
            <div className="relative w-[300px] h-[610px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-4 border-slate-900 ring-1 ring-slate-800 flex-shrink-0 z-10 transition-transform duration-500 hover:rotate-2">
              {/* Speaker / Camera Island notch */}
              <div className="absolute top-5 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-950 rounded-full z-30 flex items-center justify-center">
                <div className="w-10 h-1 bg-slate-850 rounded-full mr-2"></div>
                <div className="w-2.5 h-2.5 bg-slate-900 rounded-full border border-slate-800"></div>
              </div>

              {/* Volume / Power Buttons */}
              <div className="absolute left-[-6px] top-28 w-[6px] h-10 bg-slate-900 rounded-l-md"></div>
              <div className="absolute left-[-6px] top-40 w-[6px] h-14 bg-slate-900 rounded-l-md"></div>
              <div className="absolute right-[-6px] top-32 w-[6px] h-16 bg-slate-900 rounded-r-md"></div>

              {/* Screen Contents */}
              <div className="w-full h-full bg-slate-50 rounded-[38px] overflow-hidden relative flex flex-col select-none text-slate-800 font-sans z-20">
                {/* Phone Status Bar */}
                <div className="h-8 pt-1 px-6 flex justify-between items-center text-[11px] font-semibold text-slate-700 z-30 bg-white">
                  <span>9:41</span>
                  <div className="flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 fill-slate-700" viewBox="0 0 16 16"><path d="M2 11.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11a.5.5 0 0 1-.5-.5z"/></svg>
                    <svg className="w-3.5 h-3.5 fill-slate-700" viewBox="0 0 16 16"><path d="M12 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h8zM4 2v12h8V2H4z"/></svg>
                  </div>
                </div>

                {/* SCREEN: HOME/SEARCH */}
                {activeTab === 'search' && (
                  <div className="flex-1 flex flex-col overflow-y-auto animate-in fade-in duration-300">
                    {/* Header */}
                    <div className="bg-white px-4 pb-3 pt-1 flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-md bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">O</div>
                        <span className="font-bold text-xs tracking-tight">Owntrip</span>
                      </div>
                      <Bell className="w-4 h-4 text-slate-500" />
                    </div>

                    {/* Banner Slider */}
                    <div className="px-3 pt-3">
                      <div className="h-28 bg-gradient-to-tr from-emerald-600 to-teal-500 rounded-2xl p-3 text-white flex flex-col justify-between relative overflow-hidden shadow-sm shadow-emerald-500/10">
                        <div className="absolute right-[-10px] bottom-[-10px] w-20 h-20 rounded-full bg-white/10"></div>
                        <div className="space-y-0.5">
                          <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 bg-white/20 rounded-full">Summer Flash</span>
                          <h4 className="text-[13px] font-bold mt-1">Giảm tới 30%</h4>
                          <p className="text-[9px] text-emerald-100">Áp dụng khi đặt phòng từ 2 đêm</p>
                        </div>
                        <button className="text-[9px] font-bold bg-white text-emerald-700 px-3 py-1 rounded-lg w-max shadow-sm self-start">
                          Đặt Ngay
                        </button>
                      </div>
                    </div>

                    {/* Search Field */}
                    <div className="px-3 pt-3">
                      <div className="bg-white rounded-xl p-2.5 shadow-sm border border-slate-100 flex items-center gap-2">
                        <Search className="w-3.5 h-3.5 text-slate-400" />
                        <div className="flex-1 text-left">
                          <p className="text-[9px] text-slate-400 font-medium">Bạn muốn đi đâu?</p>
                          <p className="text-[11px] text-slate-800 font-semibold leading-tight">Đà Lạt, Lâm Đồng</p>
                        </div>
                      </div>
                    </div>

                    {/* Popular categories */}
                    <div className="px-3 pt-3">
                      <div className="flex justify-between items-center px-1">
                        <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Danh mục</h4>
                        <span className="text-[9px] text-emerald-600 font-semibold">Tất cả</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mt-1.5">
                        <div className="flex flex-col items-center gap-1 p-1 bg-white rounded-lg border border-slate-100">
                          <div className="w-6 h-6 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><Hotel className="w-3.5 h-3.5" /></div>
                          <span className="text-[8px] font-semibold">Khách sạn</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-1 bg-white rounded-lg border border-slate-100">
                          <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Compass className="w-3.5 h-3.5" /></div>
                          <span className="text-[8px] font-semibold">Resort</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-1 bg-white rounded-lg border border-slate-100">
                          <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><MapPin className="w-3.5 h-3.5" /></div>
                          <span className="text-[8px] font-semibold">Tour</span>
                        </div>
                        <div className="flex flex-col items-center gap-1 p-1 bg-white rounded-lg border border-slate-100">
                          <div className="w-6 h-6 rounded-full bg-rose-50 flex items-center justify-center text-rose-600"><Percent className="w-3.5 h-3.5" /></div>
                          <span className="text-[8px] font-semibold">Ưu đãi</span>
                        </div>
                      </div>
                    </div>

                    {/* Hotels nearby */}
                    <div className="px-3 pt-3 pb-4 flex-1">
                      <div className="flex justify-between items-center px-1 mb-1.5">
                        <h4 className="text-[10px] font-bold text-slate-900 uppercase tracking-wider">Khách sạn gợi ý</h4>
                      </div>
                      <div className="space-y-2">
                        {/* Hotel 1 */}
                        <div className="bg-white rounded-xl overflow-hidden border border-slate-100 flex p-1.5 gap-2 shadow-sm">
                          <div className="w-14 h-14 bg-gradient-to-tr from-teal-500 to-indigo-500 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-bold relative">
                            <span>HB</span>
                            <span className="absolute top-0.5 left-0.5 bg-emerald-500 text-white text-[6px] px-1 rounded-sm">Hot</span>
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                              <h5 className="text-[10px] font-bold text-slate-800 truncate">Royal Beach Palace</h5>
                              <div className="flex items-center gap-0.5 text-[8px] text-slate-500 mt-0.5">
                                <MapPin className="w-2 h-2 text-slate-400" />
                                <span className="truncate">Đà Nẵng, Việt Nam</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-end">
                              <span className="text-[9px] font-bold text-slate-900">1.250.000đ<span className="text-[7px] text-slate-400 font-normal">/đêm</span></span>
                              <div className="flex items-center gap-0.5 bg-amber-50 text-amber-700 px-1 py-0.5 rounded text-[7px] font-bold">
                                <Star className="w-1.5 h-1.5 fill-amber-400 text-amber-400" />
                                4.9
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Hotel 2 */}
                        <div className="bg-white rounded-xl overflow-hidden border border-slate-100 flex p-1.5 gap-2 shadow-sm">
                          <div className="w-14 h-14 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-lg flex-shrink-0 flex items-center justify-center text-white text-xs font-bold">
                            <span>VH</span>
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                            <div>
                              <h5 className="text-[10px] font-bold text-slate-800 truncate">Valley Pine Homestay</h5>
                              <div className="flex items-center gap-0.5 text-[8px] text-slate-500 mt-0.5">
                                <MapPin className="w-2 h-2 text-slate-400" />
                                <span className="truncate">Đà Lạt, Lâm Đồng</span>
                              </div>
                            </div>
                            <div className="flex justify-between items-end">
                              <span className="text-[9px] font-bold text-slate-900">680.000đ<span className="text-[7px] text-slate-400 font-normal">/đêm</span></span>
                              <div className="flex items-center gap-0.5 bg-amber-50 text-amber-700 px-1 py-0.5 rounded text-[7px] font-bold">
                                <Star className="w-1.5 h-1.5 fill-amber-400 text-amber-400" />
                                4.8
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SCREEN: PROMOTIONS */}
                {activeTab === 'promo' && (
                  <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50 animate-in fade-in duration-300">
                    <div className="bg-white px-4 py-3 flex items-center gap-2 border-b border-slate-100 shadow-sm">
                      <Percent className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-xs">Mã Giảm Giá Của Bạn</span>
                    </div>

                    <div className="p-3 space-y-3">
                      {/* Coupon 1 */}
                      <div className="bg-white rounded-xl border border-dashed border-emerald-300 p-3 shadow-sm relative overflow-hidden flex items-center gap-2">
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 border-r border-dashed border-emerald-300"></div>
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 border-l border-dashed border-emerald-300"></div>
                        
                        <div className="flex-1 pl-1">
                          <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">ƯU ĐÃI THÀNH VIÊN MỚI</span>
                          <h4 className="text-[12px] font-black text-slate-900 mt-1">GIẢM 50% PHÒNG</h4>
                          <p className="text-[8px] text-slate-400">Giảm tối đa 300k cho khách hàng lần đầu tải ứng dụng</p>
                          <div className="flex justify-between items-center mt-2.5">
                            <span className="text-[9px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 select-all">OWNTRIP50</span>
                            <span className="text-[8px] font-bold text-emerald-600">HSD: 30/06/2026</span>
                          </div>
                        </div>
                      </div>

                      {/* Coupon 2 */}
                      <div className="bg-white rounded-xl border border-dashed border-teal-300 p-3 shadow-sm relative overflow-hidden flex items-center gap-2">
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 border-r border-dashed border-teal-300"></div>
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 border-l border-dashed border-teal-300"></div>
                        
                        <div className="flex-1 pl-1">
                          <span className="text-[8px] font-bold text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">MÙA HÈ RỰC RỠ</span>
                          <h4 className="text-[12px] font-black text-slate-900 mt-1">GIẢM 150K ĐƠN HÀNG</h4>
                          <p className="text-[8px] text-slate-400">Áp dụng cho đặt phòng từ 1.200.000đ trở lên</p>
                          <div className="flex justify-between items-center mt-2.5">
                            <span className="text-[9px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600 select-all">SUMMER150</span>
                            <span className="text-[8px] font-bold text-teal-600">HSD: 15/07/2026</span>
                          </div>
                        </div>
                      </div>

                      {/* Coupon 3 */}
                      <div className="bg-white rounded-xl border border-dashed border-slate-200 p-3 shadow-sm relative overflow-hidden opacity-75 flex items-center gap-2">
                        <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 border-r border-dashed border-slate-200"></div>
                        <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-50 border-l border-dashed border-slate-200"></div>
                        
                        <div className="flex-1 pl-1">
                          <span className="text-[8px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">THANH TOÁN MOMO</span>
                          <h4 className="text-[12px] font-black text-slate-800 mt-1">HOÀN TIỀN 10%</h4>
                          <p className="text-[8px] text-slate-400">Hoàn tiền vào ví MoMo khi chọn thanh toán qua ứng dụng</p>
                          <div className="flex justify-between items-center mt-2.5">
                            <span className="text-[9px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">MOMOTRIP</span>
                            <span className="text-[8px] font-semibold text-slate-400">Hết hạn</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* SCREEN: TICKETS/BOOKING */}
                {activeTab === 'ticket' && (
                  <div className="flex-1 flex flex-col overflow-y-auto bg-slate-100 animate-in fade-in duration-300">
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-b border-slate-100 shadow-sm">
                      <span className="font-bold text-xs">Vé của tôi</span>
                      <span className="text-[9px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">Đã xác nhận</span>
                    </div>

                    <div className="p-3">
                      {/* Ticket UI design */}
                      <div className="bg-white rounded-2xl shadow-md overflow-hidden flex flex-col border border-slate-200">
                        {/* Upper card part */}
                        <div className="p-4 bg-gradient-to-tr from-emerald-600 to-teal-500 text-white relative">
                          <div className="absolute -right-4 bottom-[-10px] w-16 h-16 rounded-full bg-white/10"></div>
                          <span className="text-[8px] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full font-bold">PHÒNG ĐÃ ĐẶT</span>
                          <h4 className="text-sm font-bold mt-1.5">Royal Beach Resort & Spa</h4>
                          <p className="text-[9px] text-emerald-100 mt-0.5">Võ Nguyên Giáp, Sơn Trà, Đà Nẵng</p>
                        </div>
                        
                        {/* Ticket separator dashes and punch hole circles */}
                        <div className="relative h-4 bg-white flex items-center justify-between">
                          <div className="absolute -left-2 w-4 h-4 rounded-full bg-slate-100 border-r border-slate-200"></div>
                          <div className="absolute -right-2 w-4 h-4 rounded-full bg-slate-100 border-l border-slate-200"></div>
                          <div className="w-full border-t border-dashed border-slate-200 mx-3"></div>
                        </div>

                        {/* Lower details part */}
                        <div className="px-4 pb-4 pt-1 space-y-3 bg-white">
                          <div className="grid grid-cols-2 gap-3 text-[10px]">
                            <div>
                              <p className="text-slate-400 font-medium">Khách hàng</p>
                              <p className="text-slate-800 font-bold mt-0.5">Nguyễn Văn A</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-medium">Mã đặt phòng</p>
                              <p className="text-slate-800 font-bold mt-0.5">OT-94810</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-medium">Check-in</p>
                              <p className="text-slate-800 font-bold mt-0.5">14:00 - 28/05/2026</p>
                            </div>
                            <div>
                              <p className="text-slate-400 font-medium">Check-out</p>
                              <p className="text-slate-800 font-bold mt-0.5">12:00 - 30/05/2026</p>
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-3 flex flex-col items-center">
                            {/* SVG Check-in QR Code */}
                            <svg className="w-20 h-20 text-slate-800" viewBox="0 0 100 100">
                              <rect width="100" height="100" fill="none" />
                              <rect x="5" y="5" width="20" height="20" fill="currentColor" />
                              <rect x="8" y="8" width="14" height="14" fill="white" />
                              <rect x="11" y="11" width="8" height="8" fill="currentColor" />
                              
                              <rect x="75" y="5" width="20" height="20" fill="currentColor" />
                              <rect x="78" y="8" width="14" height="14" fill="white" />
                              <rect x="81" y="11" width="8" height="8" fill="currentColor" />

                              <rect x="5" y="75" width="20" height="20" fill="currentColor" />
                              <rect x="8" y="78" width="14" height="14" fill="white" />
                              <rect x="11" y="81" width="8" height="8" fill="currentColor" />

                              {/* mock codes */}
                              <rect x="35" y="10" width="15" height="4" fill="currentColor" />
                              <rect x="55" y="15" width="10" height="8" fill="currentColor" />
                              <rect x="30" y="30" width="12" height="12" fill="currentColor" />
                              <rect x="50" y="40" width="16" height="4" fill="currentColor" />
                              
                              <rect x="5" y="35" width="8" height="15" fill="currentColor" />
                              <rect x="15" y="55" width="12" height="4" fill="currentColor" />
                              <rect x="40" y="60" width="25" height="6" fill="currentColor" />

                              <rect x="75" y="40" width="8" height="20" fill="currentColor" />
                              <rect x="85" y="65" width="10" height="10" fill="currentColor" />
                              
                              <rect x="35" y="80" width="20" height="8" fill="currentColor" />
                              <rect x="65" y="85" width="8" height="10" fill="currentColor" />
                            </svg>
                            <span className="text-[8px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Đưa mã này cho lễ tân khi check-in</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tabbar Navigation of Mockup */}
                <div className="h-14 bg-white border-t border-slate-100 flex items-center justify-around text-slate-400 z-30 px-2 pb-1.5">
                  <button 
                    onClick={() => setActiveTab('search')}
                    className={`flex flex-col items-center gap-0.5 flex-1 transition-colors ${activeTab === 'search' ? 'text-emerald-600' : 'hover:text-slate-700'}`}
                  >
                    <Hotel className="w-4 h-4" />
                    <span className="text-[8px] font-bold">Khách Sạn</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('promo')}
                    className={`flex flex-col items-center gap-0.5 flex-1 transition-colors ${activeTab === 'promo' ? 'text-emerald-600' : 'hover:text-slate-700'}`}
                  >
                    <Percent className="w-4 h-4" />
                    <span className="text-[8px] font-bold">Ưu Đãi</span>
                  </button>
                  <button 
                    onClick={() => setActiveTab('ticket')}
                    className={`flex flex-col items-center gap-0.5 flex-1 transition-colors ${activeTab === 'ticket' ? 'text-emerald-600' : 'hover:text-slate-700'}`}
                  >
                    <Calendar className="w-4 h-4" />
                    <span className="text-[8px] font-bold">Đặt Chỗ</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Interaction Instructions above/below phone */}
            <div className="mt-6 flex items-center gap-2 bg-white/80 border border-slate-100 rounded-full px-4 py-1.5 shadow-sm text-xs font-semibold text-slate-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Ấn vào các tab bên dưới điện thoại để xem thử</span>
            </div>
          </div>

        </div>
      </section>

      {/* CORE FEATURES SECTION */}
      <section id="features" className="bg-white border-y border-slate-100 py-20 sm:py-24 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-xs uppercase tracking-widest text-emerald-600 font-extrabold">Tính năng nổi bật</h2>
            <p className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-none">
              Mọi thứ bạn cần cho một chuyến đi trọn vẹn
            </p>
            <p className="text-base text-slate-500">
              Được thiết kế để tối ưu hóa trải nghiệm tự lên lịch trình, thiết lập kế hoạch và đặt các dịch vụ du lịch một cách trơn tru, hiện đại.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 bg-slate-50 hover:bg-slate-50/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 rounded-3xl border border-transparent hover:border-slate-100 flex flex-col gap-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-inner">
                <Compass className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Lập kế hoạch thông minh</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Tự tạo lộ trình chi tiết từng ngày, quản lý điểm đến, ẩm thực, vui chơi và tối ưu đường đi cực kỳ dễ dàng.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="p-8 bg-slate-50 hover:bg-slate-50/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 rounded-3xl border border-transparent hover:border-slate-100 flex flex-col gap-6">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 flex items-center justify-center text-teal-700 shadow-inner">
                <Hotel className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Đặt phòng & dịch vụ nhanh chóng</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Tích hợp đặt phòng khách sạn chất lượng tốt, homestay xinh xắn ngay trên lộ trình chuyến đi của bạn với giá ưu đãi.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="p-8 bg-slate-50 hover:bg-slate-50/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 rounded-3xl border border-transparent hover:border-slate-100 flex flex-col gap-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-700 shadow-inner">
                <Percent className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Ưu đãi độc quyền App</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Nhận mã giảm giá và voucher đặc quyền thành viên ngay sau khi tạo và hoàn thành kế hoạch chuyến đi của bạn.
                </p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="p-8 bg-slate-50 hover:bg-slate-50/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 rounded-3xl border border-transparent hover:border-slate-100 flex flex-col gap-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 shadow-inner">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Đồng hành thời gian thực</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Cập nhật nhắc nhở thời gian lịch trình, thông báo điểm đến tiếp theo và giờ check-in, check-out từ khách sạn.
                </p>
              </div>
            </div>

            {/* Feature 5 */}
            <div className="p-8 bg-slate-50 hover:bg-slate-50/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 rounded-3xl border border-transparent hover:border-slate-100 flex flex-col gap-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center text-indigo-700 shadow-inner">
                <Map className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Bản đồ & Gợi ý điểm đến</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Tích hợp bản đồ trực quan gợi ý các nhà hàng, quán cafe, điểm tham quan hot nhất dọc theo hành trình của bạn.
                </p>
              </div>
            </div>

            {/* Feature 6 */}
            <div className="p-8 bg-slate-50 hover:bg-slate-50/50 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 rounded-3xl border border-transparent hover:border-slate-100 flex flex-col gap-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-700 shadow-inner">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-900">Chia sẻ & Tương tác nhóm</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Dễ dàng chia sẻ kế hoạch hành trình cho bạn bè, người thân hoặc mời họ cùng tham gia thiết kế lịch trình nhóm.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW TO DOWNLOAD SECTION */}
      <section id="download" className="py-20 sm:py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left side: Guide description */}
            <div className="lg:col-span-6 space-y-8 text-center lg:text-left">
              <div className="space-y-4">
                <h2 className="text-xs uppercase tracking-widest text-emerald-600 font-extrabold">Cách thức tải ứng dụng</h2>
                <h3 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight leading-none">
                  Chỉ 3 bước đơn giản để bắt đầu chuyến hành trình
                </h3>
                <p className="text-base text-slate-500 max-w-2xl mx-auto lg:mx-0">
                  Ứng dụng Owntrip đã có sẵn trên các kho ứng dụng lớn. Tương thích tốt với hầu hết thiết bị di động hiện nay.
                </p>
              </div>

              {/* Step list */}
              <div className="space-y-6 max-w-xl mx-auto lg:mx-0 text-left">
                {/* Step 1 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Quét mã QR hoặc Nhấn link tải</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Mở ứng dụng Camera trên điện thoại và quét mã QR ở phía trên, hoặc nhấn trực tiếp vào nút tải App Store / Google Play.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Cài đặt ứng dụng lên thiết bị</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Nhấn "Tải về" / "Cài đặt" trên giao diện chợ ứng dụng và chờ đợi thiết bị tự động cài đặt trong vài giây.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Lập kế hoạch & Nhận voucher chào mừng</h4>
                    <p className="text-sm text-slate-500 mt-1">
                      Tạo tài khoản mới, lên lịch trình chuyến đi đầu tiên và nhận ngay ưu đãi đặt phòng đặc quyền chào mừng thành viên mới!
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right side: Mock QR + Downloads big card */}
            <div className="lg:col-span-6 bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 text-center space-y-8 relative">
              <div className="absolute top-[-10px] right-[-10px] w-12 h-12 bg-emerald-500/10 rounded-full blur-xl pointer-events-none"></div>
              
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-slate-900">Tải ngay ứng dụng miễn phí</h4>
                <p className="text-sm text-slate-500">Owntrip hỗ trợ tốt nhất trên iOS 14.0+ và Android 8.0+</p>
              </div>

              {/* Huge QR Code Box */}
              <div className="w-48 h-48 bg-slate-50 rounded-2xl p-4 mx-auto flex items-center justify-center border border-slate-100 shadow-inner group">
                <QRCodeImg />
              </div>

              <div className="flex flex-wrap gap-4 justify-center items-center">
                <AppStoreBadge />
                <GooglePlayBadge />
                <ExpoBuildBadge />
              </div>

              <p className="text-xs text-slate-400">Phiên bản hiện tại: v2.4.0 • Cập nhật gần nhất: Hôm qua</p>
            </div>

          </div>
        </div>
      </section>

      {/* CALL TO ACTION FOR HOTEL PARTNERS */}
      <section className="bg-slate-900 text-white py-16 sm:py-20 relative overflow-hidden">
        {/* Glowing visual grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30"></div>
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          <div className="w-20 h-20 rounded-2xl bg-white p-2 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
            <img src={logoImg} alt="Owntrip Logo" className="w-full h-full object-contain" />
          </div>
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Bạn là Chủ Khách Sạn / Đối Tác Kinh Doanh?
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
              Truy cập vào hệ thống quản lý phòng, theo dõi đơn đặt của khách, quản lý doanh thu và cấu hình giá phòng nhanh chóng trên kênh quản trị dành riêng cho chủ khách sạn.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            {isAuthenticated ? (
              <button 
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                Vào trang quản lý của bạn
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <Link 
                  to="/login"
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                >
                  Đăng nhập Kênh Đối Tác
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Hệ thống đăng ký đối tác mới đang được nâng cấp. Vui lòng liên hệ Hotline: 1900 6868.');
                  }}
                  className="w-full sm:w-auto px-8 py-3.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white rounded-xl font-bold text-sm transition-all"
                >
                  Đăng ký hợp tác mới
                </a>
              </>
            )}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="about" className="bg-slate-950 text-slate-400 py-12 sm:py-16 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Upper row: brand + links */}
          <div className="grid md:grid-cols-12 gap-8 items-start">
            <div className="md:col-span-5 space-y-4">
              <div className="flex items-center gap-2">
                <img src={logoImg} alt="Owntrip Logo" className="h-10 object-contain bg-white p-1 rounded-lg" />
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                Owntrip là nền tảng lập kế hoạch du lịch thông minh và đặt phòng trực tuyến hàng đầu. Chúng tôi giúp bạn dễ dàng tự thiết kế lịch trình hành trình và kết nối với các điểm lưu trú tuyệt vời nhất.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 md:col-span-7">
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Sản Phẩm</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><a href="#" className="hover:text-emerald-500 transition-colors">Tải ứng dụng Owntrip</a></li>
                  <li><a href="/login" className="hover:text-emerald-500 transition-colors">Kênh chủ khách sạn</a></li>
                  <li><a href="#" className="hover:text-emerald-500 transition-colors">Tích lũy điểm thưởng</a></li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest">Hỗ Trợ</h4>
                <ul className="space-y-2 text-sm text-slate-500">
                  <li><span className="font-semibold text-slate-400">Hotline:</span> 1900 6868</li>
                  <li><span className="font-semibold text-slate-400">Email:</span> support@owntrip.vn</li>
                  <li><a href="#" className="hover:text-emerald-500 transition-colors">Điều khoản dịch vụ</a></li>
                </ul>
              </div>
            </div>
          </div>

          <hr className="border-slate-900" />

          {/* Lower row: copy status */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <span>© 2026 Owntrip Co., Ltd. Tất cả quyền lợi được bảo lưu.</span>
            <div className="flex gap-4">
              <a href="#" className="hover:underline">Chính sách bảo mật</a>
              <span>•</span>
              <a href="#" className="hover:underline">Giải quyết tranh chấp</a>
            </div>
          </div>

        </div>
      </footer>
    </div>
  );
}
