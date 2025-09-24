// assets/js/pages/home.js
// Render collections with skeletons & staggered appear (branché sur TMDB)
import { qs, qsa, el } from "../utils/dom.js";
import { tmdbApi } from "../services/tmdb-service.js";
import { buildImageUrl, TMDB_CONFIG } from "../config/tmdb-config.js";

function skeletonCard() {
  const article = el("article", "movie-card");
  const link = el("a", "card-media-wrap");
  link.href = "#";
  const media = el("div", "card-media skeleton");
  const meta = el("div", "card-meta");
  const title = el("h3", "card-title");
  title.textContent = "\u200b";
  const sub = el("p", "card-subtitle");
  sub.textContent = "\u200b";
  meta.append(title, sub);
  link.append(media, meta);
  article.append(link);
  return article;
}

function cardFromMovie(m) {
  // On utilise le <template id="movie-card-template"> existant dans la page
  const tpl = qs("#movie-card-template");
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.id = m.id;

  const a = node.querySelector("a.card-media-wrap");
  a.href = `movie.html?id=${m.id}`;

  // Image TMDB (JPG). On remplit les sources si elles existent dans le template.
  const poster342 = buildImageUrl(
    m.poster_path,
    TMDB_CONFIG.IMAGE_SIZES.POSTER.MEDIUM
  ); // w342
  const poster500 = buildImageUrl(
    m.poster_path,
    TMDB_CONFIG.IMAGE_SIZES.POSTER.LARGE
  ); // w500

  const img = node.querySelector("img.card-img");
  const webp = node.querySelector('source[type="image/webp"]');
  const avif = node.querySelector('source[type="image/avif"]');

  // TMDB renvoie du JPG ; si le template contient <source>, on pointe vers le même JPG
  // (ou laissez-les vides si vous préférez). On garde un srcset 1x/2x pour la netteté.
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
  const year = (m.release_date || m.first_air_date || "").slice(0, 4);
  node.querySelector(".card-subtitle").textContent = year ? `${year}` : "";

  // Hover overlay content
  const oTitle = node.querySelector(".overlay-title");
  const oDesc = node.querySelector(".overlay-desc");
  if (oTitle) oTitle.textContent = m.title || m.name || "";
  if (oDesc) {
    const txt = (m.overview || "").trim();
    oDesc.textContent = txt.length > 160 ? txt.slice(0, 157) + "…" : txt;
  }

  return node;
}

function loaderForCollection(name) {
  // Associe data-collection aux endpoints TMDB
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
      // équivalent "sortie récente"
      return () =>
        tmdbApi.discoverMovies(1, {
          sort_by: "primary_release_date.desc",
          "vote_count.gte": 50,
        });
    default:
      // fallback : trending
      return () => tmdbApi.getTrendingMovies("week");
  }
}

async function renderCollection(grid) {
  const defaultCount = grid.classList.contains("top10") ? 10 : 6;
  const count = Math.max(Number(grid.dataset.skeleton) || defaultCount, 3);

  // Affiche des skeletons
  grid.innerHTML = "";
  for (let i = 0; i < count; i++) grid.append(skeletonCard());

  // Mode "skeleton only" (si pas d’API)
  if (grid.dataset.skeletonOnly === "true") {
    return;
  }

  try {
    const load = loaderForCollection(grid.dataset.collection);
    const data = await load(); // TMDB renvoie { results: [...] }
    const items = Array.isArray(data?.results) ? data.results : [];

    // Si rien, on conserve les skeletons pour l’effet visuel mais on peut afficher un message
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
    // En cas d’erreur, on garde les skeletons et on log l'erreur
    console.error("[Home] Échec de chargement", grid.dataset.collection, e);
  }
}

async function init() {
  const grids = qsa(".grid.movies");
  grids.forEach(renderCollection);
}

init();
