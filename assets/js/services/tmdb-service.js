// Minimal TMDB client used by home.js (ESM)
import { TMDB_CONFIG } from "../config/tmdb-config.js";

function getBearer() {
  try {
    return (
      (typeof window !== "undefined" &&
        (window.STREAMFLIX_BEARER || window.STREAMFLIX_V4_TOKEN)) ||
      null
    );
  } catch (_) {
    return null;
  }
}

function buildUrl(endpoint, params = {}) {
  const u = new URL(TMDB_CONFIG.BASE_URL.replace(/\/$/, "") + endpoint);
  const bearer = getBearer();
  if (!bearer) {
    u.searchParams.set("api_key", TMDB_CONFIG.API_KEY);
  }
  // defaults
  if (TMDB_CONFIG.LANG) u.searchParams.set("language", TMDB_CONFIG.LANG);
  if (TMDB_CONFIG.REGION) u.searchParams.set("region", TMDB_CONFIG.REGION);
  // custom
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, v);
  });
  return u.toString();
}

async function fetchJson(url) {
  const bearer = getBearer();
  const start = Date.now();
  console.log("TMDB GET:", url);
  const res = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
    },
  });
  console.log(
    "TMDB STATUS:",
    res.status,
    res.statusText,
    `(${Date.now() - start}ms)`
  );
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    console.error("TMDB ERROR BODY:", body);
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  const data = await res.json();
  const keys = data && typeof data === "object" ? Object.keys(data) : [];
  if (keys.length) console.log("TMDB OK keys:", keys.join(", "));
  return data;
}

export const tmdbApi = {
  getTrendingMovies(timeWindow = "week", page = 1) {
    const url = buildUrl(`/trending/movie/${timeWindow}`, { page });
    return fetchJson(url);
  },
  discoverMovies(page = 1, filters = {}) {
    const url = buildUrl("/discover/movie", { page, ...filters });
    return fetchJson(url);
  },
  searchMovies(query, page = 1) {
    const url = buildUrl("/search/movie", { query, page });
    return fetchJson(url);
  },
  getMovieDetails(id) {
    const url = buildUrl(`/movie/${id}`, { append_to_response: "credits,videos,images,similar" });
    return fetchJson(url);
  },
  getMovieCredits(id) {
    const url = buildUrl(`/movie/${id}/credits`);
    return fetchJson(url);
  },
  getMovieVideos(id) {
    const url = buildUrl(`/movie/${id}/videos`);
    return fetchJson(url);
  },
  getSimilarMovies(id, page = 1) {
    const url = buildUrl(`/movie/${id}/similar`, { page });
    return fetchJson(url);
  },
  getMovieGenres() {
    const url = buildUrl("/genre/movie/list");
    return fetchJson(url);
  },
};

export default tmdbApi;
