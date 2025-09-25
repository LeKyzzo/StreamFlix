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

  const poster342 = buildImageUrl(m.poster_path, TMDB_CONFIG.TMDB_IMAGE_SIZES.POSTER.MEDIUM);
  const poster500 = buildImageUrl(m.poster_path, TMDB_CONFIG.TMDB_IMAGE_SIZES.POSTER.LARGE);

  const img = node.querySelector("img.card-img");
  const webp = node.querySelector('source[type="image/webp"]');
  const avif = node.querySelector('source[type="image/avif"]');

  img.src = poster342 || "https://placehold.co/300x450/222/888?text=Aucune+image";
  img.srcset = poster342 && poster500 ? `${poster342} 1x, ${poster500} 2x` : "";
  if (webp) webp.srcset = img.srcset || poster342 || "";
  if (avif) avif.srcset = img.srcset || poster342 || "";

  img.addEventListener("load", () => {
    img.classList.remove("skeleton");
    img.style.opacity = "1";
  }, { once: true });

  node.querySelector(".card-title").textContent = m.title || m.name || "Sans titre";
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
      return () => tmdbApi.discoverMovies(1, {
        sort_by: "vote_average.desc",
        "vote_count.gte": 1000,
      });
    case "recent":
    case "recents":
    case "now":
      return () => tmdbApi.discoverMovies(1, {
        sort_by: "primary_release_date.desc",
        "vote_count.gte": 50,
      });
    default:
      return () => tmdbApi.getTrendingMovies("week");
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
  const grids = $.qsa(".grid.movies");
  grids.forEach(renderCollection);
}

init();