// movie.js - Page de détail du film
import { tmdbApi, buildImageUrl, TMDB_CONFIG } from "../api.js";

const { $, format } = window.StreamFlix;

let currentMovie = null;

function getId() {
  const u = new URL(location.href);
  return u.searchParams.get("id") || "1";
}

function setPoster(url) {
  const poster = $.qs("#moviePoster");
  poster.classList.remove("skeleton");
  poster.style.backgroundImage = url ? `url(${url})` : "none";
  poster.style.backgroundSize = "cover";
  poster.style.backgroundPosition = "center";
  if (!url) {
    poster.style.backgroundColor = "#333";
  }
}

function getStatusText(status) {
  const statusMap = {
    Released: "Sorti",
    "Post Production": "Post-production",
    "In Production": "En production",
    Planned: "Planifié",
    Rumored: "Rumeur",
    Canceled: "Annulé",
  };
  return statusMap[status] || status || "";
}

function setMovieDetails(movie) {
  currentMovie = movie;

  // Basic info
  $.qs("#movieTitle").textContent = movie.title || "Film sans titre";
  $.qs("#crumbTitle").textContent = movie.title || "Film";

  // Meta line
  const year = movie.release_date
    ? new Date(movie.release_date).getFullYear()
    : "";
  const runtime = format.runtime(movie.runtime);
  const rating = movie.vote_average
    ? `${movie.vote_average.toFixed(1)}/10`
    : "";
  const metaParts = [year, runtime, rating].filter(Boolean);
  $.qs("#movieMeta").textContent = metaParts.join(" • ");

  // Overview
  $.qs("#movieOverview").textContent =
    movie.overview || "Aucune description disponible.";

  // Movie info grid (new fields)
  $.qs("#movieDirector").textContent = "—"; // Will be set from credits
  $.qs("#movieBudget").textContent = movie.budget ? format.money(movie.budget) : "—";
  $.qs("#movieRevenue").textContent = movie.revenue ? format.money(movie.revenue) : "—";
  $.qs("#movieStatus").textContent = getStatusText(movie.status) || "—";

  // Genres
  const genresContainer = $.qs("#movieGenres");
  genresContainer.innerHTML = "";
  if (movie.genres && movie.genres.length > 0) {
    movie.genres.forEach((genre) => {
      const li = $.el("li");
      li.textContent = genre.name;
      genresContainer.append(li);
    });
  }

  // Overview stats
  $.qs("#movieRating").textContent = movie.vote_average
    ? `${movie.vote_average.toFixed(1)}/10`
    : "—";
  $.qs("#movieVotes").textContent = movie.vote_count
    ? movie.vote_count.toLocaleString("fr-FR")
    : "—";
  $.qs("#moviePopularity").textContent = movie.popularity
    ? Math.round(movie.popularity)
    : "—";

  // Details metadata
  const details = $.qs("#movieDetails");
  details.innerHTML = "";

  const detailsData = [
    ["Titre original", movie.original_title],
    ["Statut", getStatusText(movie.status)],
    [
      "Date de sortie",
      movie.release_date ? format.date(movie.release_date) : "",
    ],
    ["Durée", format.runtime(movie.runtime)],
    ["Budget", format.money(movie.budget)],
    ["Recettes", format.money(movie.revenue)],
    ["Langues", movie.spoken_languages?.map((l) => l.name).join(", ")],
    ["Pays", movie.production_countries?.map((c) => c.name).join(", ")],
    ["Sociétés", movie.production_companies?.map((c) => c.name).join(", ")],
  ];

  detailsData.forEach(([label, value]) => {
    if (value) {
      const dt = $.el("dt");
      dt.textContent = label;
      const dd = $.el("dd");
      dd.textContent = value;
      details.append(dt, dd);
    }
  });

  // Set poster
  const posterUrl = movie.poster_path
    ? buildImageUrl(
        movie.poster_path,
        TMDB_CONFIG.TMDB_IMAGE_SIZES.POSTER.LARGE
      )
    : null;
  setPoster(posterUrl);
}

async function loadCast(movieId) {
  try {
    const credits = await tmdbApi.getMovieCredits(movieId);
    const castGrid = $.qs("#castGrid");

    // Find director in crew
    const director = credits.crew?.find(person => person.job === "Director");
    if (director) {
      $.qs("#movieDirector").textContent = director.name;
    }

    if (!credits.cast || credits.cast.length === 0) {
      castGrid.innerHTML =
        '<p class="empty">Aucune information sur la distribution.</p>';
      return;
    }

    castGrid.innerHTML = "";
    credits.cast.slice(0, 12).forEach((person) => {
      const castCard = $.el("div", "cast-card");

      const photo = $.el("div", "cast-photo");
      if (person.profile_path) {
        const img = $.el("img");
        img.src = buildImageUrl(
          person.profile_path,
          TMDB_CONFIG.TMDB_IMAGE_SIZES.PROFILE.MEDIUM
        );
        img.alt = `Photo de ${person.name}`;
        img.loading = "lazy";
        photo.append(img);
      } else {
        photo.classList.add("no-photo");
        photo.textContent = person.name?.[0]?.toUpperCase() || "?";
      }

      const info = $.el("div", "cast-info");
      const name = $.el("h4", "cast-name");
      name.textContent = person.name;
      const character = $.el("p", "cast-character");
      character.textContent = person.character;

      info.append(name, character);
      castCard.append(photo, info);
      castGrid.append(castCard);
    });
  } catch (error) {
    console.error("[Movie] Erreur chargement cast:", error);
    $.qs("#castGrid").innerHTML =
      '<p class="error">Erreur lors du chargement de la distribution.</p>';
  }
}

async function loadVideos(movieId) {
  try {
    const videos = await tmdbApi.getMovieVideos(movieId);
    const videosGrid = $.qs("#videosGrid");

    if (!videos.results || videos.results.length === 0) {
      videosGrid.innerHTML = '<p class="empty">Aucune vidéo disponible.</p>';
      return;
    }

    videosGrid.innerHTML = "";

    const trailers = videos.results.filter(
      (v) => v.type === "Trailer" && v.site === "YouTube"
    );
    const otherVideos = videos.results.filter(
      (v) => v.type !== "Trailer" && v.site === "YouTube"
    );
    const sortedVideos = [...trailers, ...otherVideos].slice(0, 6);

    sortedVideos.forEach((video) => {
      const videoCard = $.el("div", "video-card");
      const thumbnail = $.el("div", "video-thumbnail");

      const img = $.el("img");
      img.src = `https://img.youtube.com/vi/${video.key}/mqdefault.jpg`;
      img.alt = video.name;
      img.loading = "lazy";

      const playBtn = $.el("button", "video-play-btn");
      playBtn.innerHTML = "▶";
      playBtn.setAttribute("aria-label", `Lire ${video.name}`);
      playBtn.addEventListener("click", () => {
        window.open(`https://www.youtube.com/watch?v=${video.key}`, "_blank");
      });

      thumbnail.append(img, playBtn);

      const info = $.el("div", "video-info");
      const title = $.el("h4", "video-title");
      title.textContent = video.name;
      const type = $.el("p", "video-type");
      type.textContent = getVideoTypeText(video.type);

      info.append(title, type);
      videoCard.append(thumbnail, info);
      videosGrid.append(videoCard);
    });
  } catch (error) {
    console.error("[Movie] Erreur chargement vidéos:", error);
    $.qs("#videosGrid").innerHTML =
      '<p class="error">Erreur lors du chargement des vidéos.</p>';
  }
}

function getVideoTypeText(type) {
  const typeMap = {
    Trailer: "Bande-annonce",
    Teaser: "Teaser",
    Clip: "Extrait",
    Featurette: "Making-of",
    "Behind the Scenes": "Coulisses",
    Bloopers: "Bêtisiers",
  };
  return typeMap[type] || type;
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
  img.src =
    poster342 || "https://placehold.co/300x450/222/888?text=Aucune+image";
  img.srcset = poster342 && poster500 ? `${poster342} 1x, ${poster500} 2x` : "";
  img.alt = `Affiche de ${m.title || m.name || "film"}`;

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
  node.querySelector(".card-subtitle").textContent = year || "";

  // Hover overlay content
  const oTitle = node.querySelector(".overlay-title");
  const oDesc = node.querySelector(".overlay-desc");
  if (oTitle) oTitle.textContent = m.title || m.name || "";
  if (oDesc) {
    oDesc.textContent = format.truncate(m.overview, 160);
  }

  return node;
}

async function renderSimilar(movieId) {
  const grid = $.qs('.grid.movies[data-collection="similar"]');
  if (!grid) return;

  // Show skeletons first
  grid.innerHTML = "";
  for (let i = 0; i < 8; i++) {
    const skeleton = $.el("article", "movie-card");
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
    skeleton.append(link);
    grid.append(skeleton);
  }

  try {
    const similar = await tmdbApi.getSimilarMovies(movieId);
    const movies = similar.results || [];

    if (movies.length === 0) {
      grid.innerHTML = '<p class="empty">Aucun film similaire trouvé.</p>';
      return;
    }

    grid.innerHTML = "";
    movies.slice(0, 8).forEach((movie, i) => {
      const card = cardFromMovie(movie);
      card.style.animationDelay = `${Math.min(i * 40, 400)}ms`;
      grid.append(card);
    });
  } catch (error) {
    console.error("[Movie] Erreur chargement films similaires:", error);
    grid.innerHTML =
      '<p class="error">Erreur lors du chargement des films similaires.</p>';
  }
}

function setupTabs() {
  const wrap = $.qs("[data-tabs]");
  if (!wrap) return;

  const buttons = $.qsa(".tab-btn", wrap);
  const indicator = $.qs(".tabs-indicator", wrap);
  const panels = $.qsa(".tab-panel", wrap);

  function activate(name) {
    buttons.forEach((btn) => {
      const on = btn.dataset.tab === name;
      btn.setAttribute("aria-selected", on);
    });
    panels.forEach((p) =>
      p.classList.toggle("is-active", p.id === `tab-${name}`)
    );

    const activeBtn = buttons.find((b) => b.dataset.tab === name);
    if (activeBtn) {
      const r = activeBtn.getBoundingClientRect();
      const pr = indicator.parentElement.getBoundingClientRect();
      const w = Math.max(60, r.width * 0.6);
      indicator.style.setProperty(
        "--x",
        `${r.left - pr.left + r.width * 0.2}px`
      );
      indicator.style.setProperty("--w", `${w}px`);
      indicator.style.transform = `translateX(var(--x))`;
      indicator.style.width = `var(--w)`;
    }
  }

  buttons.forEach((btn) =>
    btn.addEventListener("click", () => activate(btn.dataset.tab))
  );

  window.addEventListener("resize", () => {
    const current = buttons.find(
      (b) => b.getAttribute("aria-selected") === "true"
    );
    if (current) activate(current.dataset.tab);
  });

  activate("overview");
}

function setupActionButtons() {
  const playBtn = $.qs("#playBtn");
  const trailerBtn = $.qs("#trailerBtn");
  const addBtn = $.qs("#addBtn");

  if (playBtn) {
    playBtn.addEventListener("click", () => {
      alert("Fonctionnalité de lecture à venir !");
    });
  }

  if (trailerBtn) {
    trailerBtn.addEventListener("click", () => {
      const videoTab = $.qs('[data-tab="videos"]');
      if (videoTab) videoTab.click();
    });
  }

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      const isAdded = addBtn.textContent.includes("✓");
      if (isAdded) {
        addBtn.innerHTML = "+ Ma liste";
        addBtn.classList.remove("added");
      } else {
        addBtn.innerHTML = "✓ Dans ma liste";
        addBtn.classList.add("added");
      }
    });
  }
}

async function init() {
  const movieId = getId();

  try {
    const movie = await tmdbApi.getMovieDetails(movieId);
    setMovieDetails(movie);

    await Promise.all([
      loadCast(movieId),
      loadVideos(movieId),
      renderSimilar(movieId),
    ]);

    setupTabs();
    setupActionButtons();
  } catch (error) {
    console.error("[Movie] Erreur chargement film:", error);
    $.qs("#movieTitle").textContent = "Erreur lors du chargement du film";
    $.qs("#movieOverview").textContent =
      "Impossible de charger les détails de ce film.";
  }
}

init();
