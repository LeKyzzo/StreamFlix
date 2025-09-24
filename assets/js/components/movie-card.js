// assets/js/components/movie-card.js
import { el } from "../utils/dom.js";
import { buildImageUrl, TMDB_CONFIG } from "../config/tmdb-config.js";

export function movieCard(movie) {
  const a = el("a", "card-media-wrap");
  a.href = `movie.html?id=${movie.id}`;

  const poster = el("div", "card-media");
  poster.style.backgroundImage = `url("${buildImageUrl(
    movie.poster_path,
    TMDB_CONFIG.IMAGE_SIZES.POSTER.MEDIUM
  )}")`;

  const meta = el("div", "card-meta");
  const h3 = el("h3", "card-title");
  h3.textContent = movie.title || movie.name;
  const sub = el("p", "card-subtitle");
  sub.textContent = (movie.release_date || "").slice(0, 4) || "";

  meta.append(h3, sub);
  a.append(poster, meta);

  const article = el("article", "movie-card");
  article.append(a);
  return article;
}

export function skeletonCard() {
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
