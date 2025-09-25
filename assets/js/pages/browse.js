// browse.js - Page de navigation avec recherche et filtres
import { tmdbApi, buildImageUrl, TMDB_CONFIG } from "../api.js";

const { $, format } = window.StreamFlix;

let currentPage = 1;
let currentQuery = "";
let currentGenre = "";
let currentSort = "popularity.desc";
let currentYear = "";
let totalPages = 1;
let genres = [];

function skeletonCard() {
  const article = $.el("article", "movie-card");
  const link = $.el("a", "card-media-wrap");
  link.href = "movie.html";
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
  img.src = poster342 || "https://placehold.co/300x450/222/888?text=Aucune+image";
  img.srcset = poster342 && poster500 ? `${poster342} 1x, ${poster500} 2x` : "";
  img.alt = `Affiche de ${m.title || m.name || "film"}`;

  img.addEventListener("load", () => {
    img.classList.remove("skeleton");
    img.style.opacity = "1";
  }, { once: true });

  node.querySelector(".card-title").textContent = m.title || m.name || "Sans titre";
  const year = format.year(m.release_date || m.first_air_date);
  const genreNames = m.genre_ids
    ?.map((id) => genres.find((g) => g.id === id)?.name)
    .filter(Boolean)
    .slice(0, 2)
    .join(", ") || "";
  
  node.querySelector(".card-subtitle").textContent = [year, genreNames]
    .filter(Boolean)
    .join(" • ");

  // Hover overlay content
  const oTitle = node.querySelector(".overlay-title");
  const oDesc = node.querySelector(".overlay-desc");
  if (oTitle) oTitle.textContent = m.title || m.name || "";
  if (oDesc) {
    oDesc.textContent = format.truncate(m.overview, 160);
  }

  return node;
}

async function loadGenres() {
  try {
    const response = await tmdbApi.getMovieGenres();
    genres = response.genres || [];

    const genreSelect = $.qs("#genreFilter");
    genres.forEach((genre) => {
      const option = $.el("option");
      option.value = genre.id;
      option.textContent = genre.name;
      genreSelect.append(option);
    });
  } catch (error) {
    console.error("[Browse] Erreur chargement genres:", error);
  }
}

function populateYearFilter() {
  const yearSelect = $.qs("#yearFilter");
  const currentYear = new Date().getFullYear();

  for (let year = currentYear; year >= 1980; year--) {
    const option = $.el("option");
    option.value = year;
    option.textContent = year;
    yearSelect.append(option);
  }
}

async function fetchMovies(page = 1) {
  const grid = $.qs("[data-catalog]");
  const resultsCount = $.qs("#resultsCount");

  // Show loading state
  if (page === 1) {
    grid.innerHTML = "";
    for (let i = 0; i < 20; i++) {
      grid.append(skeletonCard());
    }
    resultsCount.textContent = "Chargement...";
  }

  try {
    let data;

    if (currentQuery.trim()) {
      data = await tmdbApi.searchMovies(currentQuery.trim(), page);
    } else {
      const filters = {
        sort_by: currentSort,
        ...(currentGenre && { with_genres: currentGenre }),
        ...(currentYear && { primary_release_year: currentYear }),
        "vote_count.gte": 50,
      };
      data = await tmdbApi.discoverMovies(page, filters);
    }

    const movies = data.results || [];
    totalPages = Math.min(data.total_pages || 1, 500);

    if (page === 1) {
      grid.innerHTML = "";
    }

    if (movies.length === 0) {
      if (page === 1) {
        grid.innerHTML = '<div class="empty-state"><p>Aucun film trouvé pour ces critères.</p></div>';
      }
      resultsCount.textContent = "Aucun résultat";
    } else {
      movies.forEach((movie, i) => {
        const card = cardFromMovie(movie);
        card.style.animationDelay = `${Math.min(i * 30, 300)}ms`;
        grid.append(card);
      });

      const totalResults = Math.min(data.total_results || 0, 10000);
      resultsCount.textContent = `${totalResults.toLocaleString()} film${totalResults > 1 ? "s" : ""}`;
    }

    updatePagination();
  } catch (error) {
    console.error("[Browse] Erreur chargement films:", error);
    if (page === 1) {
      grid.innerHTML = '<div class="error-state"><p>Erreur lors du chargement des films.</p></div>';
      resultsCount.textContent = "Erreur";
    }
  }
}

function updatePagination() {
  const prevBtn = $.qs("#prevPage");
  const nextBtn = $.qs("#nextPage");
  const pageInfo = $.qs("#pageInfo");

  prevBtn.disabled = currentPage <= 1;
  nextBtn.disabled = currentPage >= totalPages;
  pageInfo.textContent = `Page ${currentPage} sur ${totalPages}`;
}

function setupEventListeners() {
  const searchInput = $.qs("#catalogSearch");
  const genreSelect = $.qs("#genreFilter");
  const sortSelect = $.qs("#sortBy");
  const yearSelect = $.qs("#yearFilter");
  const prevBtn = $.qs("#prevPage");
  const nextBtn = $.qs("#nextPage");

  let searchTimeout;

  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentQuery = e.target.value;
      currentPage = 1;
      fetchMovies(1);
    }, 500);
  });

  genreSelect.addEventListener("change", (e) => {
    currentGenre = e.target.value;
    currentPage = 1;
    fetchMovies(1);
  });

  sortSelect.addEventListener("change", (e) => {
    currentSort = e.target.value;
    currentPage = 1;
    fetchMovies(1);
  });

  yearSelect.addEventListener("change", (e) => {
    currentYear = e.target.value;
    currentPage = 1;
    fetchMovies(1);
  });

  prevBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      fetchMovies(currentPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  nextBtn.addEventListener("click", () => {
    if (currentPage < totalPages) {
      currentPage++;
      fetchMovies(currentPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

async function init() {
  await loadGenres();
  populateYearFilter();
  setupEventListeners();
  await fetchMovies(1);
}

init();