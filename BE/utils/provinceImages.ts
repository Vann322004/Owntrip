export interface ProvinceImageItem {
  province: string;
  slug: string;
  imageUrl: string;
  keywords: string[];
}

const PROVINCE_NAMES: string[] = [
  "Ha Noi",
  "TP Ho Chi Minh",
  "Hai Phong",
  "Da Nang",
  "Can Tho",
  "An Giang",
  "Ba Ria - Vung Tau",
  "Bac Giang",
  "Bac Kan",
  "Bac Lieu",
  "Bac Ninh",
  "Ben Tre",
  "Binh Dinh",
  "Binh Duong",
  "Binh Phuoc",
  "Binh Thuan",
  "Ca Mau",
  "Cao Bang",
  "Dak Lak",
  "Dak Nong",
  "Dien Bien",
  "Dong Nai",
  "Dong Thap",
  "Gia Lai",
  "Ha Giang",
  "Ha Nam",
  "Ha Tinh",
  "Hai Duong",
  "Hau Giang",
  "Hoa Binh",
  "Hung Yen",
  "Khanh Hoa",
  "Kien Giang",
  "Kon Tum",
  "Lai Chau",
  "Lam Dong",
  "Lang Son",
  "Lao Cai",
  "Long An",
  "Nam Dinh",
  "Nghe An",
  "Ninh Binh",
  "Ninh Thuan",
  "Phu Tho",
  "Phu Yen",
  "Quang Binh",
  "Quang Nam",
  "Quang Ngai",
  "Quang Ninh",
  "Quang Tri",
  "Soc Trang",
  "Son La",
  "Tay Ninh",
  "Thai Binh",
  "Thai Nguyen",
  "Thanh Hoa",
  "Hue",
  "Tien Giang",
  "Tra Vinh",
  "Tuyen Quang",
  "Vinh Long",
  "Vinh Phuc",
  "Yen Bai"
];

const PROVINCE_ALIASES: Record<string, string[]> = {
  "TP Ho Chi Minh": ["ho chi minh", "tp hcm", "hcm", "sai gon"],
  "Ha Noi": ["ha noi", "hoan kiem", "ba dinh", "ho tay"],
  "Da Nang": ["da nang", "ban dao son tra", "ba na", "my khe"],
  "Lam Dong": ["lam dong", "da lat", "dalat", "bao loc", "langbiang"],
  "Khanh Hoa": ["khanh hoa", "nha trang", "cam ranh", "vinh hy"],
  "Quang Ninh": ["quang ninh", "ha long", "halong", "bai chay", "co to"],
  "Lao Cai": ["lao cai", "sa pa", "sapa", "bac ha", "y ty"],
  "Ninh Binh": ["ninh binh", "trang an", "tam coc", "bai dinh"],
  "Quang Binh": ["quang binh", "phong nha", "ke bang", "dong hoi"],
  "Quang Nam": ["quang nam", "hoi an", "cu lao cham", "my son"],
  "Kien Giang": ["kien giang", "phu quoc", "ha tien", "nam du"],
  "Binh Thuan": ["binh thuan", "phan thiet", "mui ne", "dao phu quy"],
  "Ba Ria - Vung Tau": ["ba ria vung tau", "vung tau", "ba ria", "ho tram", "con dao"],
  "Can Tho": ["can tho", "cantho", "ben ninh kieu", "cho noi cai rang"],
  "Hue": ["hue", "thua thien hue", "lang co", "pha tam giang"],
  "Phu Yen": ["phu yen", "ghenh da dia", "tuy hoa", "bai xep"],
  "Binh Dinh": ["binh dinh", "quy nhon", "eo gio", "ky co"],
  "Ha Giang": ["ha giang", "dong van", "meo vac", "lung cu"],
  "Son La": ["son la", "moc chau", "ta xua"],
  "Dien Bien": ["dien bien", "dien bien phu", "muong phang"],
  "An Giang": ["an giang", "chau doc", "nui cam", "rung tram tra su"],
  "Ca Mau": ["ca mau", "mui ca mau", "dat mui"],
  "Tay Ninh": ["tay ninh", "nui ba den", "ho dau tieng"],
  "Ninh Thuan": ["ninh thuan", "vinh hy", "ninh chu", "hang rai"],
  "Dak Lak": ["dak lak", "daklak", "dac lac", "buon ma thuot", "buon don"],
  "Dak Nong": ["dak nong", "daknong", "ta dung"],
  "Gia Lai": ["gia lai", "pleiku", "bien ho"],
  "Kon Tum": ["kon tum", "mang den", "ngoc linh"],
  "Phu Tho": ["phu tho", "den hung"],
  "Thanh Hoa": ["thanh hoa", "sam son", "puluong", "pu luong"],
  "Nghe An": ["nghe an", "cua lo", "que bac"],
  "Quang Tri": ["quang tri", "dao con co", "hien luong"],
  "Thai Nguyen": ["thai nguyen", "ho nui coc"],
  "Hoa Binh": ["hoa binh", "mai chau", "da bac"],
  "Yen Bai": ["yen bai", "mu cang chai", "tu le"],
  "Vinh Phuc": ["vinh phuc", "tam dao", "dai lai"]
};

// Real province images (curated from actual sources)
const PROVINCE_IMAGE_URLS: Record<string, string> = {
  "Ha Noi": "https://t4.ftcdn.net/jpg/03/22/06/63/360_F_322066325_4Pln646BpUpJEVbWDZr7bjYCTrVJaoEV.jpg",
  "TP Ho Chi Minh": "https://t4.ftcdn.net/jpg/03/07/31/03/360_F_307310336_xOhPUlJUZjDb4ARlNCnBtRDMaL9Yc1GQ.jpg",
  "Hai Phong": "https://images.pexels.com/photos/29638490/pexels-photo-29638490/free-photo-of-scenic-limestone-mountains-in-h-i-phong-vietnam.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "Da Nang": "https://image.vietnam.travel/sites/default/files/styles/top_banner/public/2021-12/shutterstock_1741919756_resize_0.jpg?itok=M6I6hZTs",
  "Can Tho": "https://www.shutterstock.com/image-photo/aerial-view-cai-rang-floating-600nw-2760452609.jpg",
  "An Giang": "https://vietnamamazingtours.com/uploads/top-10-must-do-activities-in-an-giang-5.jpg",
  "Ba Ria - Vung Tau": "https://media.istockphoto.com/id/1858701564/photo/vung-tau-city-and-coast-vietnam.jpg?s=612x612&w=0&k=20&c=4Thc6Lh1f_Qsdk3kZUYlKtand5S7oRSKC9Mq_IWJqsA=",
  "Bac Giang": "https://www.asiakingtravel.com/cuploads/files/Bac%20Giang/Bac-Giang-Cam-Son-Lake.jpg",
  "Bac Kan": "https://img.freepik.com/premium-photo/landscape-ba-be-national-park-bac-kan-province-vietnam-this-is-where-largest-natural-freshwater-lake-vn-with-limestone-structure-countless-underground-caves-only-250km-from-hanoi_620624-13436.jpg",
  "Bac Lieu": "https://img.freepik.com/free-photo/vietnamese-landscape-sa-pa_181624-24940.jpg?semt=ais_hybrid&w=740&q=80",
  "Bac Ninh": "https://www.shutterstock.com/image-photo/landscape-bac-ninh-city-260nw-2432173849.jpg",
  "Ben Tre": "https://cdn.vietlongtravel.com/wp-content/uploads/2024/12/Vinh-Long-Mekong-Delta-.jpg",
  "Binh Dinh": "https://vietnam.travel/sites/default/files/inline-images/shutterstock_649093831.jpg",
  "Binh Duong": "https://www.shutterstock.com/image-photo/binh-duong-vietnam-april-9-600nw-2521443505.jpg",
  "Binh Phuoc": "https://thumbs.dreamstime.com/b/tropical-forest-vietnam-stream-stone-binh-phuoc-province-vietnam-tropical-forest-vietnam-stream-stone-104971918.jpg",
  "Binh Thuan": "https://vietnam.travel/sites/default/files/inline-images/shutterstock_2198240981.jpg",
  "Ca Mau": "https://media.istockphoto.com/id/2165659691/photo/ca-mau-ecotourism.jpg?s=612x612&w=0&k=20&c=pXhNFA9BJZBI8bi2uf2PG79QfRmt5FEB2O-CCVjbI5E=",
  "Cao Bang": "https://vietnam.travel/sites/default/files/inline-images/Cao_Bang-Ban_Gioc_Waterfall-0014%20text.jpg",
  "Dak Lak": "https://media.istockphoto.com/id/591441100/photo/the-lak-lake-and-green-rice-field-dak-lak-province.jpg?s=612x612&w=0&k=20&c=y_3IcPhH2NxWliW36Gnva8PtxnN5uVLQOy0i75Ks188=",
  "Dak Nong": "https://www.shutterstock.com/image-photo/ta-dung-lake-dak-som-600nw-2171233007.jpg",
  "Dien Bien": "https://media.istockphoto.com/id/1928402402/photo/a-path-in-the-middle-of-forests-and-rice-fields-on-the-green-mountains-in-asia-vietnam-tonkin.jpg?s=612x612&w=0&k=20&c=mVtXMkNrDD8rwPLAyA9xUIyOPyWnK6eIOzoHjVSn3Ok=",
  "Dong Nai": "https://www.shutterstock.com/image-photo/chua-chan-mountain-landscape-dong-600nw-2683217735.jpg",
  "Dong Thap": "https://c8.alamy.com/comp/2PH9JDD/aerial-view-landscape-of-the-mekong-delta-in-sa-dec-dong-thap-vietnam-residential-development-waterway-transport-and-agricultural-economy-in-viet-2PH9JDD.jpg",
  "Gia Lai": "https://image.vietnam.travel/sites/default/files/inline-images/gialai.bienho.jpg",
  "Ha Giang": "https://cdn1.vietnamtourism.org.vn/files/thumb/600/400//images/content/2018-09-21.04.37.33-hg.jpg",
  "Ha Nam": "https://img.freepik.com/premium-photo/landscape-photography-tam-chuc-pagoda-ha-nam-vietnam_389400-88.jpg",
  "Ha Tinh": "https://c8.alamy.com/comp/B9NB2K/vietnam-ha-tinh-province-huong-tich-rice-field-landscape-B9NB2K.jpg",
  "Hai Duong": "https://www.shutterstock.com/image-photo/ancient-communal-house-resting-middle-260nw-2486273981.jpg",
  "Hau Giang": "https://img.freepik.com/free-photo/blue-peak-natural-hill-nature-asian_1417-1088.jpg?semt=ais_hybrid&w=740&q=80",
  "Hoa Binh": "https://images.pexels.com/photos/6870666/pexels-photo-6870666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "Hung Yen": "https://www.shutterstock.com/image-photo/ancient-communal-house-resting-middle-260nw-2486273981.jpg",
  "Khanh Hoa": "https://vietnam.travel/sites/default/files/inline-images/shutterstock_1160772010.jpg",
  "Kien Giang": "https://media.istockphoto.com/id/1653956344/photo/landscape-photo-of-a-beautiful-island-in-the-ha-tien-archipelago-kien-giang-province.jpg?s=612x612&w=0&k=20&c=Q1Eczj-oQXDTfzVhrm8I_s6YqoqBncjqZytCxn7OgTs=",
  "Kon Tum": "https://images.pexels.com/photos/34940066/pexels-photo-34940066/free-photo-of-scenic-mountain-landscape-in-kon-tum-vietnam.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "Lai Chau": "https://images.pexels.com/photos/14036110/pexels-photo-14036110.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "Lam Dong": "https://www.shutterstock.com/image-photo/landscape-da-lat-lam-dong-260nw-1128618581.jpg",
  "Lang Son": "https://media.istockphoto.com/id/2195115263/photo/aerial-drone-view-of-bac-son-rice-field-valley-at-sunset-lang-son-vietnam.jpg?s=612x612&w=0&k=20&c=_axh-OM4Oso-X_kApgpWT2XadS4xXrfacZWFoYJnL_8=",
  "Lao Cai": "https://images.pexels.com/photos/29118440/pexels-photo-29118440/free-photo-of-scenic-waterfall-in-lao-cai-vietnam.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "Long An": "https://cdn.naturettl.com/wp-content/uploads/2019/06/22002828/long-exposures-landscape-photography-6-800x534.jpg?p=15105",
  "Nam Dinh": "https://media.istockphoto.com/id/2165814484/photo/landscape-of-pho-minh-pagoda-in-nam-dinh-province-vietnam.jpg?s=612x612&w=0&k=20&c=su08gR3lokj7GEOfk7tmX-KDvh_bFUHQWluwB1FU1_k=",
  "Nghe An": "https://vcdn1-english.vnecdn.net/2020/06/21/Nghe-An-1-8223-1592738571.jpg?w=680&h=0&q=100&dpr=2&fit=crop&s=d9GKWD1tcO_VKv9Plts2KA",
  "Ninh Binh": "https://cdn.vietlongtravel.com/wp-content/uploads/2024/10/trang-an-ninh-binh.jpg?strip=all",
  "Ninh Thuan": "https://res.cloudinary.com/billionhands/image/upload/v1770058869/items/upkbpsg4szdybjhat4tu.jpg",
  "Phu Tho": "https://thumbs.dreamstime.com/b/beautiful-aerial-view-long-coc-tea-hills-phu-tho-province-vietnam-plantation-sunrise-hill-334583834.jpg",
  "Phu Yen": "https://image.vietnam.travel/sites/default/files/2023-02/shutterstock_1879642879_0.jpg?v=1779076892",
  "Quang Binh": "https://img.freepik.com/premium-photo/natural-landscape-photography-jumping-rock-beach-quang-binh-vietnam-sunrise-ocean_389400-198.jpg",
  "Quang Nam": "https://media.gettyimages.com/id/1510932683/photo/aerial-photo-of-small-boats-carrying-tourists-sightseeing-on-thu-bon-river-hoi-an-ancient.jpg?s=612x612&w=gi&k=20&c=8UwBeCqlUBUhMjlXAh4nd14scxU1X2VrV8od4u-UJCY=",
  "Quang Ngai": "https://whileyoustayhome.com/wp-content/uploads/2024/10/The-most-beautiful-street-in-Quang-Ngai-vietnam-while-you-stay-home-1.jpg",
  "Quang Ninh": "https://sun-ecommerce-cdn.azureedge.net/ecommerce/service-sites/asset/SunParadiseLandQuangNinh/google-doc/post_id_13995/AD_4nXfupJ74sw01dpRgoflMx_eZobRV0MIKZJtKJ4JsygcVOgtSKtFtHgqTghgPS9muxqmU4ixx0rLrIaAezDRuM0p6MOJ88LSXCnFvxbn-xh64s6ffFBFidbwKn903VqENebKgjicLo_X3yS9c8orOJLSracgiawZQN0AvLCd3CoisZcmrt3M.webp",
  "Quang Tri": "https://oxalisadventure.com/uploads/2026/01/rung-phong-huong-quang-tri-1000__639032668692788307.jpg",
  "Soc Trang": "https://image.vietnam.travel/sites/default/files/styles/top_banner/public/2025-07/8099-soc%20trang-nguyen%20van%20phung-0908792297-nang%20chieu%20ben%20thap%20co%20%28resize%29.jpg?itok=z554kiRT",
  "Son La": "https://img.mauritius-images.com/DESI/cprev/15843931.jpg/save_as_name/mauritius%20images%20-%2015843931%20-%20Stunning%20mountainous%20beauty%20on%20the%20verdant%20landscape%20in%20Son%20La%2C.jpg",
  "Tay Ninh": "https://sun-ecommerce-cdn.azureedge.net/ecommerce/service-sites/asset/SunParadiseLandTayNinh/google-doc/post_id_17438/AD_4nXfbXiECK2UbQAIH28MgB-JQBSVlyne-AiMiRBomtluBxcXvu_yA4CBG9kM2gh3M_jqsmswIPt2HsdF2SCeUEyV4y9jPTsv9q7zDiD-CpA2uFOItzIcbBjxn51elA5yxNceZUu8WGu7L5LFoDn4zFaL27Fe_dWT7tylLMt5pE2RSfPVowgQ.webp",
  "Thai Binh": "https://www.momentlives.com/wp-content/uploads/2025/12/Thai-Binh-Infinite-Sea-Fishing.jpg",
  "Thai Nguyen": "https://vcdn1-dulich.vnecdn.net/2023/06/28/dulichthainguyenvnexpress51562-2394-9552-1687947768.jpg?w=1200&h=0&q=100&dpr=1&fit=crop&s=Hp1pTGVfnJDGCalDIIfFgg",
  "Thanh Hoa": "https://www.shutterstock.com/image-photo/thanh-hoa-province-vietnam-view-600w-2695244519.jpg",
  "Hue": "https://c8.alamy.com/comp/2B1HHR5/peaceful-countryside-landscape-in-thua-thien-hue-province-vietnam-2B1HHR5.jpg",
  "Tien Giang": "https://static.vecteezy.com/system/resources/previews/023/626/812/large_2x/tranquil-tien-giang-province-landscape-with-picturesque-cityscape-and-river-in-vietnam-photo.jpg",
  "Tra Vinh": "https://media.gettyimages.com/id/2150007318/photo/gateway-to-tra-vinh-city-morning-mist-in-the-mekong-delta-countryside-vietnam.jpg?s=612x612&w=gi&k=20&c=hNJIJ3iGbpABzf5b76YdjCoAOmoWy2fGR9aEftMZanI=",
  "Tuyen Quang": "https://scontent.iocvnpt.com/resources/portal/Images/TQG/ttcntt.tqg/Tin%20tuc/bai_viet_nam_2025/r2_931643433.png",
  "Vinh Long": "https://cdn.vietlongtravel.com/wp-content/uploads/2024/12/Vinh-Long-Mekong-Delta-.jpg",
  "Vinh Phuc": "https://images.pexels.com/photos/6870666/pexels-photo-6870666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  "Yen Bai": "https://media.istockphoto.com/id/2240353898/photo/sunset-over-la-pan-tan-rice-terraces-mu-cang-chai-yen-bai-northern-vietnam.jpg?s=612x612&w=0&k=20&c=MZSwfswApV_P1Mg6JSVIh5X1lWnRy60em4JtHGSOddk="
};

export const normalizeText = (value: string): string => {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const toSlug = (value: string): string => normalizeText(value).replace(/\s+/g, "-");

const PROVINCE_IMAGES: ProvinceImageItem[] = PROVINCE_NAMES.map((provinceName) => {
  const slug = toSlug(provinceName);
  const baseKeywords = [normalizeText(provinceName)];
  const aliasKeywords = (PROVINCE_ALIASES[provinceName] || []).map(normalizeText);
  const keywords = Array.from(new Set([...baseKeywords, ...aliasKeywords]));

  return {
    province: provinceName,
    slug,
    imageUrl: PROVINCE_IMAGE_URLS[provinceName] ?? `https://picsum.photos/seed/owntrip-${slug}/1200/700`,
    keywords
  };
});

export const getProvinceImages = (): ProvinceImageItem[] => PROVINCE_IMAGES;

export const findProvinceImageByDestination = (destination: string): ProvinceImageItem | null => {
  const input = normalizeText(destination || "");

  if (!input) {
    return null;
  }

  let bestMatch: { item: ProvinceImageItem; score: number } | null = null;

  for (const item of PROVINCE_IMAGES) {
    for (const keyword of item.keywords) {
      if (keyword.length < 3) {
        continue;
      }

      const isExact = input === keyword;
      const isIncluded = input.includes(keyword) || keyword.includes(input);

      if (!isExact && !isIncluded) {
        continue;
      }

      const score = isExact ? keyword.length + 100 : keyword.length;

      if (!bestMatch || score > bestMatch.score) {
        bestMatch = { item, score };
      }
    }
  }

  return bestMatch ? bestMatch.item : null;
};