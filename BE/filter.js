const fs = require('fs');
const path = require('path');

/**
 * HƯỚNG DẪN:
 * 1. Đảm bảo file đầu vào (ví dụ: dalat.json) nằm cùng thư mục.
 * 2. Thay đổi INPUT_FILE và OUTPUT_FILE tương ứng bên dưới.
 * 3. Chạy lệnh: node filter.js
 */

const INPUT_FILE = path.join(__dirname, 'Gia_Lai.json');
const OUTPUT_FILE = path.join(__dirname, 'Gia_Lai_clean.json');


const TRANSLATIONS = {
  "måndag": "Thứ 2", "tisdag": "Thứ 3", "onsdag": "Thứ 4", "torsdag": "Thứ 5",
  "fredag": "Thứ 6", "lördag": "Thứ 7", "söndag": "Chủ nhật",
  "uteservering": "Chỗ ngồi ngoài trời",
  "servering": "Phục vụ tại chỗ",
  "avhämtning": "Mua mang về",
  "hemkörning": "Giao hàng",
  "kontaktfri leverans": "Giao hàng không tiếp xúc",
  "bra vinlista": "Rượu vang ngon",
  "bra ölutbud": "Bia đa dạng",
  "goda desserter": "Tráng miệng ngon",
  "gott kaffe": "Cà phê ngon",
  "bra teutbud": "Trà ngon",
  "öppen spis": "Có lò sưởi",
  "middag": "Bữa tối",
  "lunch": "Bữa trưa",
  "äta ute själv": "Phù hợp ăn một mình",
  "hamburgare": "Hamburger",
  "spagetti": "Mì Ý",
  "alkohol": "Có đồ uống cồn",
  "drinkar": "Cocktail/Đồ uống",
  "happy hour på dryck": "Giờ vàng đồ uống",
  "tjänster på plats": "Phục vụ tại chỗ",
  "restaurang": "Nhà hàng",
  "café": "Cà phê",
  "bar": "Quán Bar/Club",
  "grupper": "Phù hợp nhóm đông",
  "turister": "Khách du lịch",
  "mysigt": "Ấm cúng",
  "romantiskt": "Lãng mạn",
  "fint": "Sang trọng",
  "avslappnat": "Thoải mái"
};

// 2. LOGIC TẠO TAG FILTER KIỂU VIỆT NAM
function getVietnameseFilterTags(title, preferences) {
  const allText = (title + " " + preferences.join(" ")).toLowerCase();
  const vnTags = new Set();

  // Hàm helper để kiểm tra từ đứng độc lập (syllable-based matching)
  const hasWord = (word) => new RegExp(`(^|\\s)${word}(\\s|$)`, 'i').test(allText);

  if (allText.includes("mì cay") || allText.includes("sasin")) vnTags.add("Mì cay");
  if (allText.includes("chay") || allText.includes("vegetarian") || allText.includes("vegan")) vnTags.add("Ăn chay");
  if (hasWord("lẩu") || allText.includes("hotpot")) vnTags.add("Lẩu");
  if (hasWord("nướng") || allText.includes("bbq") || allText.includes("steak")) vnTags.add("Đồ nướng");

  // Tránh khớp sai "âu" trong "đầu", "sau"...
  if (hasWord("âu") || allText.includes("món âu") || allText.includes("pizza") || allText.includes("spagetti") || allText.includes("mì ý")) vnTags.add("Món Âu");

  if (allText.includes("nhật") || allText.includes("sushi") || allText.includes("sashimi")) vnTags.add("Món Nhật");

  // Tránh khớp sai "hàn" trong "hàng", "khánh"...
  if (hasWord("hàn") || allText.includes("món hàn") || allText.includes("hàn quốc") || allText.includes("kimbap")) vnTags.add("Món Hàn");

  if (hasWord("cà phê") || allText.includes("coffee") || allText.includes("cafe")) vnTags.add("Cà phê");
  if (allText.includes("burger") || allText.includes("gà rán") || allText.includes("fast food")) vnTags.add("Đồ ăn nhanh");
  if (hasWord("nhậu") || allText.includes("beer") || allText.includes("bia") || allText.includes("pub")) vnTags.add("Quán nhậu");
  if (allText.includes("hẹn hò") || allText.includes("lãng mạn") || allText.includes("sang trọng")) vnTags.add("Hẹn hò/Sang trọng");

  return Array.from(vnTags);
}

console.log('--- 🚀 Đang bắt đầu xử lý dữ liệu chuẩn hóa cho OwnTrip ---');

try {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ Lỗi: Không tìm thấy file ${INPUT_FILE}`);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
  console.log(`📊 Đang xử lý ${rawData.length} địa điểm...`);

  const cleanData = rawData.map(item => {
    // A. NHẬN DIỆN THÀNH PHỐ TỪ ĐỊA CHỈ
    let cityDetected = "Khác";
    const addr = (item.address || "").toLowerCase();
    if (addr.includes("đà nẵng")) cityDetected = "Da Nang";
    else if (addr.includes("hồ chí minh") || addr.includes("saigon") || addr.includes("an khánh") || addr.includes("quận")) cityDetected = "Ho Chi Minh";
    else if (addr.includes("hà nội")) cityDetected = "Ha Noi";
    else if (addr.includes("đà lạt") || addr.includes("lâm đồng") || addr.includes("xuan huong")) cityDetected = "Da Lat";

    // B. XỬ LÝ PREFERENCES & DỊCH THUẬT
    const rawPrefs = new Set();
    const ignoreWords = ["alla", "senaste", "videor", "meny", "mat och dryck", "stämning", "av ägaren", "street view"];

    if (item.imageCategories) {
      item.imageCategories.forEach(cat => {
        if (!ignoreWords.some(word => cat.toLowerCase().includes(word))) rawPrefs.add(cat);
      });
    }

    if (item.additionalInfo) {
      Object.values(item.additionalInfo).forEach(group => {
        if (Array.isArray(group)) {
          group.forEach(obj => {
            const key = Object.keys(obj)[0];
            if (obj[key] === true) rawPrefs.add(key);
          });
        }
      });
    }

    // Dịch các tag sang tiếng Việt
    const translatedPrefs = Array.from(rawPrefs).map(tag => TRANSLATIONS[tag.toLowerCase()] || tag);

    // C. TẠO TAG FILTER KIỂU VIỆT NAM
    const cuisineFilter = getVietnameseFilterTags(item.title, translatedPrefs);

    // D. CHUẨN HÓA GIỜ MỞ CỬA
    let hoursString = "Liên hệ";
    if (Array.isArray(item.openingHours) && item.openingHours.length > 0) {
      hoursString = item.openingHours
        .map(h => `${TRANSLATIONS[h.day.toLowerCase()] || h.day}: ${h.hours}`)
        .join(', ');
    }

    return {
      placeId: item.placeId || `temp_${Math.random().toString(36).substr(2, 9)}`,
      name: item.title,
      category: TRANSLATIONS[item.categoryName?.toLowerCase()] || item.categoryName || "Nhà hàng",
      city: cityDetected, // Đã sửa: Tự động nhận diện thành phố
      address: item.address,
      location: item.location || { lat: 0, lng: 0 },
      rating: item.totalScore || 0,
      reviewCount: item.reviewsCount || 0,
      price: item.price || "Liên hệ",
      phoneNumber: item.phone || "Không có",
      website: item.website || "",
      images: item.imageUrls ? item.imageUrls.slice(0, 5) : (item.imageUrl ? [item.imageUrl] : []),
      openingHours: hoursString,
      cuisineTags: cuisineFilter, // Trường dùng để hiển thị bộ lọc món ăn trên App
      detailedPreferences: translatedPrefs.slice(0, 15), // Đặc điểm chi tiết đã dịch
      source: "Google Maps via Apify"
    };
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(cleanData, null, 2));

  console.log('------------------------------------------');
  console.log(`✅ CHUẨN HÓA THÀNH CÔNG!`);
  console.log(`📁 Kết quả: ${OUTPUT_FILE}`);
  console.log(`✨ Tổng số địa điểm: ${cleanData.length}`);
  console.log('------------------------------------------');

} catch (err) {
  console.error('❌ Lỗi xử lý:', err.message);
}