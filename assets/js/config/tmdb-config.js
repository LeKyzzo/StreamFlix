// assets/js/config/tmdb-config.js
export const TMDB_CONFIG = {
  API_KEY: "e4b90327227c88daac14c0bd0c1f93cd",
  BASE_URL: "https://api.themoviedb.org/3",
  IMAGE_BASE_URL: "https://image.tmdb.org/t/p",
  IMAGE_SIZES: {
    POSTER: { SMALL: "w185", MEDIUM: "w342", LARGE: "w500" },
    BACKDROP: { SMALL: "w300", MEDIUM: "w780", LARGE: "w1280" },
    PROFILE: { SMALL: "w185" },
  },
  LANG: "fr-FR",
  REGION: "FR",
};

export const buildImageUrl = (path, size = "w342") =>
  path ? `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}` : "";
