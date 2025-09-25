// home.js - Page d'accueil avec collections TMDB
import { tmdbApi, buildImageUrl, TMDB_CONFIG } from "../api.js";

const { $, format } = window.StreamFlix;

function skeletonCard() {
  const article = $.el("article", "movie-card");
  const link = $.el("a", "card-media-wrap");
  link.href = "#";
  const media = $.el("div", "card-media skeleton");
  const meta = $.el("div", "card-meta");
  const title = $.el("h3", "card-title");
  title.textContent = "\u200b";
  const sub = $.el("p", "card-subtitle");
  sub.textContent = "\u200b";
  meta.append(title, sub);
  link.append(media, meta);
  article.append(link);
  return article;
}

function cardFromMovie(m) {
  const tpl = $.qs("#movie-card-template");
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.id = m.id;

  const a = node.querySelector("a.card-media-wrap");
  a.href = `movie.html?id=${m.id}`;

  const poster342 = buildImageUrl(
    m.poster_path,
    TMDB_CONFIG.TMDB_IMAGE_SIZES.POSTER.MEDIUM
  );
  const poster500 = buildImageUrl(
    m.poster_path,
    TMDB_CONFIG.TMDB_IMAGE_SIZES.POSTER.LARGE
  );

  const img = node.querySelector("img.card-img");
  const webp = node.querySelector('source[type="image/webp"]');
  const avif = node.querySelector('source[type="image/avif"]');

  img.src =
    poster342 || "https://placehold.co/300x450/222/888?text=Aucune+image";
  img.srcset = poster342 && poster500 ? `${poster342} 1x, ${poster500} 2x` : "";
  if (webp) webp.srcset = img.srcset || poster342 || "";
  if (avif) avif.srcset = img.srcset || poster342 || "";

  img.addEventListener(
    "load",
    () => {
      img.classList.remove("skeleton");
      img.style.opacity = "1";
    },
    { once: true }
  );

  node.querySelector(".card-title").textContent =
    m.title || m.name || "Sans titre";
  const year = format.year(m.release_date || m.first_air_date);
  node.querySelector(".card-subtitle").textContent = year;

  // Hover overlay content
  const oTitle = node.querySelector(".overlay-title");
  const oDesc = node.querySelector(".overlay-desc");
  if (oTitle) oTitle.textContent = m.title || m.name || "";
  if (oDesc) {
    oDesc.textContent = format.truncate(m.overview, 160);
  }

  return node;
}

function loaderForCollection(name) {
  switch ((name || "").toLowerCase()) {
    case "trending":
    case "tendances":
      return () => tmdbApi.getTrendingMovies("week");
    case "popular":
    case "populaires":
      return () => tmdbApi.discoverMovies(1, { sort_by: "popularity.desc" });
    case "toprated":
    case "mieux-notes":
      return () =>
        tmdbApi.discoverMovies(1, {
          sort_by: "vote_average.desc",
          "vote_count.gte": 1000,
        });
    case "recent":
    case "recents":
    case "now":
      return () =>
        tmdbApi.discoverMovies(1, {
          sort_by: "primary_release_date.desc",
          "vote_count.gte": 50,
        });
    default:
      return () => tmdbApi.getTrendingMovies("week");
  }
}

// --- Hero rotating trending movies ---
const HERO_ROTATION_ENABLED = true; // activation rotation
const HERO_ROTATION_INTERVAL = 15000; // 15s
const HERO_FADE_DURATION = 600; // ms
let heroRotationTimer = null;
let heroList = [];
let heroPos = 0;

function setHeroContent(movie) {
  const titleEl = document.getElementById("heroTitle");
  const subEl = document.getElementById("heroSubtitle");
  const playEl = document.getElementById("heroPlayBtn");
  const kickerEl = document.getElementById("heroKicker");
  const posterLayer = document.getElementById("heroPosterlayer");
  const layerMid = document.querySelector('.poster-layer.layer-mid');
  const layerBack = document.querySelector('.poster-layer.layer-back');
  const layerExtra = document.querySelector('.poster-layer.layer-extra');
  const heroSection = document.getElementById("hero");
  const heroContent = document.querySelector('.hero-content');
  if (!titleEl || !subEl) return;

  // Fade out
  if (heroContent) heroContent.style.opacity = 0;

  titleEl.textContent = movie.title || movie.name || "Sans titre";
  const raw = movie.overview || "Aucune description disponible.";
  const maxLen = 260;
  subEl.textContent = raw.length > maxLen ? raw.slice(0, maxLen - 1) + "…" : raw;
  if (playEl) playEl.href = `movie.html?id=${movie.id}`;
  if (kickerEl) kickerEl.textContent = "Tendance";

  if (posterLayer && movie.poster_path) {
    const posterUrl = buildImageUrl(
      movie.poster_path,
      TMDB_CONFIG.TMDB_IMAGE_SIZES.POSTER.LARGE
    );
    posterLayer.style.backgroundImage = `linear-gradient(135deg, rgba(255,255,255,0.10), transparent), url(${posterUrl})`;
    posterLayer.style.backgroundSize = "cover";
    posterLayer.style.backgroundPosition = "center";
  }
  // Pré-charger les 3 suivants sur les autres couches (2,3,4)
  if (heroList.length > 1) {
    const next1 = heroList[(heroPos + 1) % heroList.length];
    if (layerMid && next1?.poster_path) {
      const p1 = buildImageUrl(next1.poster_path, TMDB_CONFIG.TMDB_IMAGE_SIZES.POSTER.MEDIUM);
      layerMid.style.backgroundImage = `linear-gradient(135deg, #fff1, transparent), url(${p1})`;
      layerMid.style.backgroundSize = 'cover';
      layerMid.style.backgroundPosition = 'center';
    }
  }
  if (heroList.length > 2) {
    const next2 = heroList[(heroPos + 2) % heroList.length];
    if (layerBack && next2?.poster_path) {
      const p2 = buildImageUrl(next2.poster_path, TMDB_CONFIG.TMDB_IMAGE_SIZES.POSTER.MEDIUM);
      layerBack.style.backgroundImage = `linear-gradient(135deg, #fff1, transparent), url(${p2})`;
      layerBack.style.backgroundSize = 'cover';
      layerBack.style.backgroundPosition = 'center';
    }
  }
  if (heroList.length > 3) {
    const next3 = heroList[(heroPos + 3) % heroList.length];
    if (layerExtra && next3?.poster_path) {
      const p3 = buildImageUrl(next3.poster_path, TMDB_CONFIG.TMDB_IMAGE_SIZES.POSTER.MEDIUM);
      layerExtra.style.backgroundImage = `linear-gradient(135deg, #0006, transparent), url(${p3})`;
      layerExtra.style.backgroundSize = 'cover';
      layerExtra.style.backgroundPosition = 'center';
    }
  }
  // Utiliser l'affiche en plein fond (pas de duplication avec layer-front) => on peut flouter l'arrière plan si besoin
  if (heroSection && movie.poster_path) {
    const bgPoster = buildImageUrl(
      movie.poster_path,
      TMDB_CONFIG.TMDB_IMAGE_SIZES.POSTER.LARGE
    );
    heroSection.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.85) 100%), url(${bgPoster})`;
  }

  // Fade in
  if (heroContent) {
    setTimeout(() => {
      heroContent.style.opacity = 1;
    }, 20);
  }
}

async function loadHeroRotation() {
  try {
    const trending = await tmdbApi.getTrendingMovies("week");
    heroList = (trending?.results || []).filter(
      (m) => m.poster_path && m.backdrop_path && m.overview
    );
    if (!heroList.length) return;
    heroPos = 0;
    setHeroContent(heroList[heroPos]);

    if (HERO_ROTATION_ENABLED) {
      if (heroRotationTimer) clearInterval(heroRotationTimer);
      heroRotationTimer = setInterval(() => {
        heroPos = (heroPos + 1) % heroList.length;
        setHeroContent(heroList[heroPos]);
      }, HERO_ROTATION_INTERVAL);

      // Pause quand l'onglet est masqué
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          if (heroRotationTimer) {
            clearInterval(heroRotationTimer);
            heroRotationTimer = null;
          }
        } else if (!heroRotationTimer) {
          heroRotationTimer = setInterval(() => {
            heroPos = (heroPos + 1) % heroList.length;
            setHeroContent(heroList[heroPos]);
          }, HERO_ROTATION_INTERVAL);
        }
      });
    }
  } catch (e) {
    console.warn("[Hero] Échec chargement trending", e);
  }
}

async function renderCollection(grid) {
  const defaultCount = grid.classList.contains("top10") ? 10 : 6;
  const count = Math.max(Number(grid.dataset.skeleton) || defaultCount, 3);

  // Affiche des skeletons
  grid.innerHTML = "";
  for (let i = 0; i < count; i++) grid.append(skeletonCard());

  // Mode "skeleton only"
  if (grid.dataset.skeletonOnly === "true") {
    return;
  }

  try {
    const load = loaderForCollection(grid.dataset.collection);
    const data = await load();
    const items = Array.isArray(data?.results) ? data.results : [];

    if (!items.length) {
      grid.innerHTML = '<p class="empty">Aucun élément à afficher.</p>';
      return;
    }

    grid.innerHTML = "";
    items.slice(0, count).forEach((m, i) => {
      const card = cardFromMovie(m);
      card.style.animationDelay = `${Math.min(i * 40, 400)}ms`;
      grid.append(card);
    });
  } catch (e) {
    console.error("[Home] Échec de chargement", grid.dataset.collection, e);
  }
}

async function init() {
  loadHeroRotation();

  const grids = $.qsa(".grid.movies");
  grids.forEach(renderCollection);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init, { once: true });
} else {
  init();
}
