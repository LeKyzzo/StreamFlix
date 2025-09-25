/* Services API TMDB + fallback mock */

// Appels TMDB
export const tmdbApi = {
  getTrendingMovies(timeWindow = "week", page = 1) {
    return window.StreamFlix.API.fetchTmdb(`/trending/movie/${timeWindow}`, {
      page,
    });
  },

  discoverMovies(page = 1, filters = {}) {
    return window.StreamFlix.API.fetchTmdb("/discover/movie", {
      page,
      ...filters,
    });
  },

  searchMovies(query, page = 1) {
    return window.StreamFlix.API.fetchTmdb("/search/movie", { query, page });
  },

  getMovieDetails(id) {
    return window.StreamFlix.API.fetchTmdb(`/movie/${id}`, {
      append_to_response: "credits,videos,images,similar",
    });
  },

  getMovieCredits(id) {
    return window.StreamFlix.API.fetchTmdb(`/movie/${id}/credits`);
  },

  getMovieVideos(id) {
    return window.StreamFlix.API.fetchTmdb(`/movie/${id}/videos`);
  },

  getSimilarMovies(id, page = 1) {
    return window.StreamFlix.API.fetchTmdb(`/movie/${id}/similar`, { page });
  },

  getMovieGenres() {
    return window.StreamFlix.API.fetchTmdb("/genre/movie/list");
  },
};

// URL image
export const buildImageUrl = (path, size = "w342") => {
  return window.StreamFlix.API.buildImageUrl(path, size);
};

// Constantes config
export const TMDB_CONFIG = window.STREAMFLIX_CONFIG;

// Mock legacy si pas d'API propre
export async function fetchCollection(kind) {
  await new Promise((r) => setTimeout(r, 250));

  if (window.STREAMFLIX_CONFIG.USE_API) {
    try {
      const response = await fetch(
        `${window.STREAMFLIX_CONFIG.API_BASE}/collections/${encodeURIComponent(
          kind
        )}`
      );
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length) {
          return data;
        }
      }
    } catch (e) {
      console.warn("Mock API fallback for collection:", kind);
    }
  }

  // Données fictives
  const base = [
    {
      id: 1,
      title: "Aube Rouge",
      year: 2025,
      genre: ["Sci-Fi", "Action"],
      rating: 7.8,
      poster: "https://picsum.photos/300/450?random=1",
    },
    {
      id: 2,
      title: "Nuit Blanche",
      year: 2024,
      genre: ["Thriller"],
      rating: 7.2,
      poster: "https://picsum.photos/300/450?random=2",
    },
    {
      id: 3,
      title: "Lignes de fuite",
      year: 2023,
      genre: ["Drama"],
      rating: 6.9,
      poster: "https://picsum.photos/300/450?random=3",
    },
    {
      id: 4,
      title: "Zone Libre",
      year: 2025,
      genre: ["Action"],
      rating: 8.1,
      poster: "https://picsum.photos/300/450?random=4",
    },
    {
      id: 5,
      title: "Les Échos",
      year: 2022,
      genre: ["Mystery"],
      rating: 7.0,
      poster: "https://picsum.photos/300/450?random=5",
    },
    {
      id: 6,
      title: "Soleil Noir",
      year: 2024,
      genre: ["Horror"],
      rating: 6.5,
      poster: "https://picsum.photos/300/450?random=6",
    },
  ];

  const more = [...base].reverse();
  switch (kind) {
    case "popular":
      return base.concat(more, base);
    case "recent":
      return more.concat(base);
    case "trending":
      return base;
    case "similar":
      return base.slice(0, 8);
    default:
      return base;
  }
}

export async function fetchMovie(id) {
  await new Promise((r) => setTimeout(r, 200));

  if (window.STREAMFLIX_CONFIG.USE_API) {
    try {
      const response = await fetch(
        `${window.STREAMFLIX_CONFIG.API_BASE}/movies/${encodeURIComponent(id)}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.id) {
          return data;
        }
      }
    } catch (e) {
      console.warn("Mock API fallback for movie:", id);
    }
  }

  // Film fictif
  const n = Number(id) || 1;
  return {
    id: n,
    title: n === 1 ? "Aube Rouge" : `Film ${n}`,
    year: 2025,
    duration: 118,
    rating: 7.8,
    genres: ["Sci-Fi", "Action"],
    overview:
      "Dans un avenir proche, une pilote se bat pour sauver sa cité d'une menace inconnue.",
    poster: `https://picsum.photos/600/900?random=${n}`,
    director: "L. Durand",
    cast: ["A. Martin", "K. Leroy", "M. Dupont"],
    language: "FR",
    country: "FR",
  };
}
