import { Request, Response } from "express";
import axios from "axios";

const GOONG_API_BASE_URL = "https://rsapi.goong.io";
const DEFAULT_PUBLIC_API_BASE_URL = "https://owntrip.vercel.app";

const WIKIMEDIA_HEADERS = {
  "User-Agent": "OwnTrip/1.0 (contact: owntrip@example.com)",
  "Accept-Language": "en"
};

const getGoongKey = () => process.env.GOONG_API_KEY!;

const isQuotaExceededError = (error: any) => {
  const status = error?.response?.status;
  const message = String(error?.response?.data?.message || error?.message || "").toLowerCase();
  return status === 429 || message.includes("daily quota") || message.includes("quota");
};

const normalizeBaseUrl = (value?: string | null) => {
  const raw = String(value || "").trim().replace(/\/+$/g, "");
  if (!raw) {
    return "";
  }

  if (/^https?:\/\//i.test(raw)) {
    return raw;
  }

  return `https://${raw}`;
};

const getRequestBaseUrl = (req: Request) => {
  const configuredBaseUrl = normalizeBaseUrl(process.env.PUBLIC_API_BASE_URL) || DEFAULT_PUBLIC_API_BASE_URL;
  if (configuredBaseUrl) {
    return configuredBaseUrl;
  }

  const deploymentBaseUrl =
    normalizeBaseUrl(process.env.APP_URL) ||
    normalizeBaseUrl(process.env.API_BASE_URL) ||
    normalizeBaseUrl(process.env.BACKEND_URL) ||
    normalizeBaseUrl(process.env.RENDER_EXTERNAL_URL) ||
    normalizeBaseUrl(process.env.RAILWAY_PUBLIC_DOMAIN) ||
    normalizeBaseUrl(process.env.RAILWAY_STATIC_URL) ||
    normalizeBaseUrl(process.env.VERCEL_URL);

  if (deploymentBaseUrl) {
    return deploymentBaseUrl;
  }

  const forwardedHostHeader = req.headers["x-forwarded-host"];
  const forwardedHost = Array.isArray(forwardedHostHeader)
    ? forwardedHostHeader[0]
    : String(forwardedHostHeader || "").split(",")[0].trim();

  const forwardedProtoHeader = req.headers["x-forwarded-proto"];
  const forwardedProto = Array.isArray(forwardedProtoHeader)
    ? forwardedProtoHeader[0]
    : String(forwardedProtoHeader || "").split(",")[0].trim();

  const originHeader = req.headers.origin;
  const origin = Array.isArray(originHeader)
    ? originHeader[0]
    : String(originHeader || "").trim();
  const originHost = origin ? origin.replace(/^https?:\/\//i, "").replace(/\/+$/g, "") : "";

  const protocol = forwardedProto || req.protocol;
  const host = forwardedHost || originHost || req.get("host") || "localhost";

  if (/^localhost(?::\d+)?$/i.test(host) || /^127\.0\.0\.1(?::\d+)?$/i.test(host)) {
    return "http://localhost:3000";
  }

  return `${protocol}://${host}`;
};

const buildPhotoProxyUrl = (req: Request, photoName: string, maxHeightPx = 400) => {
  const baseUrl = getRequestBaseUrl(req);
  return `${baseUrl}/api/places/photo?name=${encodeURIComponent(photoName)}&maxHeightPx=${maxHeightPx}`;
};

const toSeed = (value: string) =>
  String(value || "place")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "place";

const buildFallbackPhotoUrl = (seedBase: string) => {
  const seed = toSeed(seedBase);
  return `https://picsum.photos/seed/owntrip-place-${seed}/900/600`;
};

const fetchCommonsImageBySearchTerm = async (searchTerm: string) => {
  const normalized = String(searchTerm || "").trim();
  if (!normalized) {
    return null;
  }

  const response = await axios.get("https://commons.wikimedia.org/w/api.php", {
    params: {
      action: "query",
      format: "json",
      generator: "search",
      gsrsearch: normalized,
      gsrnamespace: 6,
      gsrlimit: 1,
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: 900
    },
    headers: WIKIMEDIA_HEADERS,
    timeout: 8000
  });

  const pages = response.data?.query?.pages || {};
  const firstPage = Object.values(pages)[0] as any;
  return firstPage?.imageinfo?.[0]?.thumburl || firstPage?.imageinfo?.[0]?.url || null;
};

const parseWikipediaTitle = (wikipediaTag?: string) => {
  if (!wikipediaTag) {
    return null;
  }

  const raw = String(wikipediaTag).trim();
  if (!raw) {
    return null;
  }

  const titlePart = raw.includes(":") ? raw.split(":").slice(1).join(":") : raw;
  const title = titlePart.replace(/_/g, " ").trim();
  return title || null;
};

const parseWikidataId = (wikidataTag?: string) => {
  if (!wikidataTag) {
    return null;
  }

  const value = String(wikidataTag).trim().toUpperCase();
  if (!/^Q\d+$/.test(value)) {
    return null;
  }

  return value;
};

const wikidataIdCache = new Map<string, string | null>();
const wikidataImageCache = new Map<string, string | null>();

const fetchCommonsThumbnailFromFileName = async (fileName: string) => {
  const normalizedFileName = String(fileName || "").replace(/^File:/i, "").trim();
  if (!normalizedFileName) {
    return null;
  }

  const response = await axios.get("https://commons.wikimedia.org/w/api.php", {
    params: {
      action: "query",
      format: "json",
      prop: "imageinfo",
      iiprop: "url",
      iiurlwidth: 900,
      titles: `File:${normalizedFileName}`
    },
    headers: WIKIMEDIA_HEADERS,
    timeout: 8000
  });

  const pages = response.data?.query?.pages || {};
  const firstPage = Object.values(pages)[0] as any;
  return firstPage?.imageinfo?.[0]?.thumburl || firstPage?.imageinfo?.[0]?.url || null;
};

const resolveWikidataIdByWikipediaTitle = async (title: string) => {
  const cacheKey = String(title || "").trim().toLowerCase();
  if (!cacheKey) {
    return null;
  }

  if (wikidataIdCache.has(cacheKey)) {
    return wikidataIdCache.get(cacheKey) || null;
  }

  const response = await axios.get("https://en.wikipedia.org/w/api.php", {
    params: {
      action: "query",
      format: "json",
      prop: "pageprops",
      redirects: 1,
      titles: title
    },
    headers: WIKIMEDIA_HEADERS,
    timeout: 8000
  });

  const pages = response.data?.query?.pages || {};
  const firstPage = Object.values(pages)[0] as any;
  const wikidataId = parseWikidataId(firstPage?.pageprops?.wikibase_item) || null;
  wikidataIdCache.set(cacheKey, wikidataId);
  return wikidataId;
};

const fetchWikimediaImageByWikidataId = async (wikidataId: string) => {
  const parsedId = parseWikidataId(wikidataId);
  if (!parsedId) {
    return null;
  }

  if (wikidataImageCache.has(parsedId)) {
    return wikidataImageCache.get(parsedId) || null;
  }

  const response = await axios.get("https://www.wikidata.org/w/api.php", {
    params: {
      action: "wbgetentities",
      format: "json",
      ids: parsedId,
      props: "claims"
    },
    headers: WIKIMEDIA_HEADERS,
    timeout: 8000
  });

  const entity = response.data?.entities?.[parsedId];
  const p18Claim = entity?.claims?.P18?.[0];
  const fileName = p18Claim?.mainsnak?.datavalue?.value;

  if (!fileName) {
    wikidataImageCache.set(parsedId, null);
    return null;
  }

  const imageUrl = await fetchCommonsThumbnailFromFileName(fileName);
  wikidataImageCache.set(parsedId, imageUrl || null);
  return imageUrl || null;
};

const fetchWikipediaImageByTitleAndLang = async (title: string, lang: "vi" | "en") => {
  const response = await axios.get(`https://${lang}.wikipedia.org/w/api.php`, {
    params: {
      action: "query",
      format: "json",
      prop: "pageimages",
      piprop: "thumbnail",
      pithumbsize: 900,
      redirects: 1,
      titles: title
    },
    headers: WIKIMEDIA_HEADERS,
    timeout: 8000
  });

  const pages = response.data?.query?.pages || {};
  const firstPage = Object.values(pages)[0] as any;
  return firstPage?.thumbnail?.source || null;
};

const fetchWikimediaImageByTitle = async (title: string) => {
  const viImage = await fetchWikipediaImageByTitleAndLang(title, "vi");
  if (viImage) {
    return viImage;
  }

  return fetchWikipediaImageByTitleAndLang(title, "en");
};

const guessWikiTitlesByPlaceName = (name?: string, address?: string) => {
  const placeName = String(name || "").trim();
  if (!placeName) {
    return [] as string[];
  }

  const suffix = String(address || "").split(",").map((v) => v.trim()).filter(Boolean);
  const cityOrProvince = suffix[suffix.length - 1] || "";

  return Array.from(new Set([
    placeName,
    cityOrProvince ? `${placeName}, ${cityOrProvince}` : "",
    cityOrProvince ? `${placeName} (${cityOrProvince})` : ""
  ].filter(Boolean)));
};

const enrichPlacesWithWikimedia = async (places: any[]) => {
  return Promise.all(
    places.map(async (place) => {
      const wikidataId = parseWikidataId(place?._wikidataId);
      const wikiTitle = String(place?._wikiTitle || "").trim();
      const placeName = String(place?._nameForWiki || place?.name || "").trim();
      const placeAddress = String(place?._addressForWiki || place?.address || "").trim();

      let wikiPhoto: string | null = null;

      try {
        if (wikidataId) {
          wikiPhoto = await fetchWikimediaImageByWikidataId(wikidataId);
        }

        if (!wikiPhoto && wikiTitle) {
          wikiPhoto = await fetchWikimediaImageByTitle(wikiTitle);
        }

        if (!wikiPhoto) {
          wikiPhoto = await resolveWikiPhotoByPlaceContext(placeName, placeAddress);
        }
      } catch (error: any) {
        console.error(
          `Wikimedia photo failed for ${placeName || place?.placeId || "unknown-place"}:`,
          error.response?.data || error.message
        );
      }

      const { _wikiTitle, _wikidataId, _nameForWiki, _addressForWiki, photo, photos, ...cleanPlace } = place;
      const fallbackPhoto = buildFallbackPhotoUrl(
        `${cleanPlace?.placeId || cleanPlace?.name || "place"}-${cleanPlace?.address || ""}`
      );

      const finalPhoto = wikiPhoto || fallbackPhoto;
      return {
        ...cleanPlace,
        photo: finalPhoto,
        photos: [finalPhoto]
      };
    })
  );
};

const resolveWikiPhotoByPlaceContext = async (name?: string, address?: string) => {
  const placeName = String(name || "").trim();
  const placeAddress = String(address || "").trim();
  const titleCandidates = guessWikiTitlesByPlaceName(placeName, placeAddress);

  for (const title of titleCandidates) {
    const resolvedWikidataId = await resolveWikidataIdByWikipediaTitle(title);
    if (resolvedWikidataId) {
      const wikidataPhoto = await fetchWikimediaImageByWikidataId(resolvedWikidataId);
      if (wikidataPhoto) {
        return wikidataPhoto;
      }
    }
  }

  for (const title of titleCandidates) {
    const wikiPhoto = await fetchWikimediaImageByTitle(title);
    if (wikiPhoto) {
      return wikiPhoto;
    }
  }

  if (placeName) {
    return (
      await fetchCommonsImageBySearchTerm(`${placeName} Vietnam`) ||
      await fetchCommonsImageBySearchTerm(placeName)
    );
  }

  return null;
};

const hashString = (value: string) => {
  let hash = 0;

  for (let i = 0; i < value.length; i++) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash);
};

const buildFallbackRating = (seedBase: string) => {
  const hash = hashString(seedBase || "place");
  const rating = 3.8 + (hash % 13) / 10; // 3.8 -> 5.0
  const totalReviews = 40 + (hash % 460); // 40 -> 499

  return {
    rating: Number(rating.toFixed(1)),
    totalReviews
  };
};



export const getPlacePhoto = async (req: Request, res: Response) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Missing photo name"
      });
    }

    // Goong doesn't have a direct equivalent to Google's media API for photos in the same way.
    // We will redirect to a fallback or return error if not found.
    // For now, let's try to use the name as a direct URL if it looks like one, or use fallback.
    if (String(name).startsWith("http")) {
      return res.redirect(String(name));
    }

    return res.status(404).json({
      success: false,
      message: "Photo not found or Goong API does not support this photo reference"
    });
  } catch (error: any) {
    console.error(error.message);
    return res.status(500).json({
      success: false,
      message: "Get place photo failed"
    });
  }
};

export const searchPlace = async (req: Request, res: Response) => {
  try {
    const { q, lat, lng } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Missing query"
      });
    }

    const response = await axios.get(
      `${GOONG_API_BASE_URL}/Place/Autocomplete`,
      {
        params: {
          api_key: getGoongKey(),
          input: String(q),
          location: lat && lng ? `${String(lat)},${String(lng)}` : undefined,
          limit: 10
        }
      }
    );

    console.log("Goong Autocomplete Raw:", JSON.stringify(response.data, null, 2));

    // Transform Goong predictions to match a consistent format if needed,
    // or return directly if Frontend handles Goong format.
    // For consistency with searchNearby, we'll return a wrapped object.
    const predictions = response.data?.predictions || [];
    const formattedPlaces = predictions.map((p: any) => ({
      placeId: p.place_id,
      name: p.structured_formatting?.main_text || p.description,
      address: p.description,
      types: p.types || [],
      source: "goong"
    }));

    res.json({
      success: true,
      source: "goong",
      predictions: response.data?.predictions, // Keep original for compatibility
      places: formattedPlaces
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Search place failed"
    });
  }
};

export const searchNearby = async (req: Request, res: Response) => {
  try {
    const { lat, lng, radius, type } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp tọa độ (lat, lng)"
      });
    }

    const typeToQuery: Record<string, string> = {
      restaurant: "nhà hàng",
      cafe: "cà phê",
      hotel: "khách sạn",
      hospital: "bệnh viện",
      atm: "ATM",
      school: "trường học",
      supermarket: "siêu thị",
      pharmacy: "nhà thuốc",
    };

    const searchQuery = type
      ? (typeToQuery[String(type).trim().toLowerCase()] || String(type).trim())
      : "địa điểm";

    // Bước 1: AutoComplete để lấy danh sách place_id
    const autocompleteRes = await axios.get(
      `${GOONG_API_BASE_URL}/Place/AutoComplete`,
      {
        params: {
          api_key: getGoongKey(),
          input: searchQuery,
          location: `${String(lat)},${String(lng)}`,
          radius: radius ? Number(radius) : 1000,
          limit: 10
        }
      }
    );

    const predictions = autocompleteRes.data?.predictions || [];

    if (predictions.length === 0) {
      return res.json({ success: true, source: "goong", total: 0, places: [] });
    }

    // Bước 2: Lấy Detail cho từng place để có coordinates
    const detailResults = await Promise.allSettled(
      predictions.slice(0, 10).map((p: any) =>
        axios.get(`${GOONG_API_BASE_URL}/Place/Detail`, {
          params: {
            api_key: getGoongKey(),
            place_id: p.place_id
          }
        })
      )
    );

    const places = detailResults
      .filter((r): r is PromiseFulfilledResult<any> => r.status === "fulfilled")
      .map((r) => {
        const d = r.value.data?.result;
        if (!d) return null;
        return {
          placeId: d.place_id,
          name: d.name,
          address: d.formatted_address,
          latitude: d.geometry?.location?.lat,
          longitude: d.geometry?.location?.lng,
          rating: d.rating,
          totalReviews: d.user_ratings_total,
          types: d.types || [],
          mapUrl: d.geometry?.location?.lat
            ? `https://www.google.com/maps/search/?api=1&query=${d.geometry.location.lat},${d.geometry.location.lng}`
            : null,
          photo: null,
          photos: []
        };
      })
      .filter(Boolean);

    res.json({
      success: true,
      source: "goong",
      total: places.length,
      places
    });
  } catch (error: any) {
    console.error("Goong searchNearby error:", {
      status: error.response?.status,
      data: JSON.stringify(error.response?.data),
      message: error.message
    });
    res.status(500).json({ success: false, message: "Search nearby failed" });
  }
};

export const searchText = async (req: Request, res: Response) => {
  try {
    const { q, lat, lng, radius, limit } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Missing query"
      });
    }

    const maxResultCount = limit ? Math.min(Number(limit), 50) : 20;

    const queryList = (Array.isArray(q) ? q : [q])
      .flatMap((item) => String(item).split(","))
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const searchResults = await Promise.allSettled(
      queryList.map((queryText) =>
        axios.get(`${GOONG_API_BASE_URL}/Place/Search`, {
          params: {
            api_key: getGoongKey(),
            input: queryText,
            location: lat && lng ? `${String(lat)},${String(lng)}` : undefined,
            radius: radius ? Number(radius) : undefined
          }
        })
      )
    );

    const successfulResponses = searchResults
      .filter((result): result is PromiseFulfilledResult<any> => result.status === "fulfilled")
      .map((result) => {
        const data = result.value.data;
        console.log("Goong Search Raw:", JSON.stringify(data, null, 2));
        // Goong might return results or predictions depending on the exact endpoint behavior
        return data?.results || data?.predictions || [];
      });

    const allRawItems = successfulResponses.flat();
    const uniqueById = new Map<string, any>();

    for (const item of allRawItems) {
      const id = item.place_id || item.id;
      if (id && !uniqueById.has(id)) {
        uniqueById.set(id, item);
      }
      if (uniqueById.size >= maxResultCount) break;
    }

    const places = await Promise.all(
      Array.from(uniqueById.values()).map(async (p: any) => {
        let wikiPhoto: string | null = null;
        const name = p.name || p.structured_formatting?.main_text || p.description;
        const address = p.formatted_address || p.vicinity || p.description;

        try {
          wikiPhoto = await resolveWikiPhotoByPlaceContext(name, address);
        } catch (e) {}

        const fallbackPhoto = buildFallbackPhotoUrl(`${p.place_id || p.id}-${name}`);
        const finalPhoto = wikiPhoto || fallbackPhoto;

        // If it's a prediction from Autocomplete, it won't have coordinates.
        // We could call Place/Detail here, but that might be too many requests.
        // For now, we'll return what we have.
        return {
          placeId: p.place_id || p.id,
          name: name,
          address: address,
          latitude: p.geometry?.location?.lat || null,
          longitude: p.geometry?.location?.lng || null,
          rating: p.rating,
          totalReviews: p.user_ratings_total,
          types: p.types || [],
          mapUrl: p.geometry?.location?.lat 
            ? `https://www.google.com/maps/search/?api=1&query=${p.geometry.location.lat},${p.geometry.location.lng}`
            : null,
          photo: finalPhoto,
          photos: [finalPhoto]
        };
      })
    );

    res.json({
      success: true,
      source: "goong",
      total: places.length,
      places
    });
  } catch (error: any) {
    console.error("Goong searchText failed:", error.message);
    res.status(500).json({ success: false, message: "Search text failed" });
  }
};

export const getPlaceChildren = async (req: Request, res: Response) => {
  try {
    const { parent_id, has_deprecated_administrative_unit } = req.query;

    if (!parent_id) {
      return res.status(400).json({
        success: false,
        message: "Missing parent_id"
      });
    }

    const response = await axios.get(
      "https://rsapi.goong.io/v2/place/children",
      {
        params: {
          parent_id: String(parent_id),
          api_key: getGoongKey(),
          has_deprecated_administrative_unit: has_deprecated_administrative_unit === "true"
        }
      }
    );

    res.json(response.data);
  } catch (error: any) {
    console.error("Goong getPlaceChildren failed:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch place children"
    });
  }
};
