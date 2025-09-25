/* StreamFlix - Main JavaScript Bundle */

// ============================================================================
// CONFIGURATION & GLOBALS
// ============================================================================

window.STREAMFLIX_CONFIG = {
  USE_API: true, // enabled to fetch real TMDB trending
  API_BASE: "", // e.g., 'https://api.example.com'
  TMDB_API_KEY: "e4b90327227c88daac14c0bd0c1f93cd",
  TMDB_BASE_URL: "https://api.themoviedb.org/3",
  TMDB_IMAGE_BASE_URL: "https://image.tmdb.org/t/p",
  TMDB_LANG: "fr-FR",
  TMDB_REGION: "FR",
  TMDB_IMAGE_SIZES: {
    POSTER: { SMALL: "w185", MEDIUM: "w342", LARGE: "w500" },
    BACKDROP: { SMALL: "w300", MEDIUM: "w780", LARGE: "w1280" },
    PROFILE: { SMALL: "w185", MEDIUM: "w185" },
  },
};

// Legacy support
window.STREAMFLIX_USE_API = window.STREAMFLIX_CONFIG.USE_API;
window.STREAMFLIX_API_BASE = window.STREAMFLIX_CONFIG.API_BASE;

// ============================================================================
// UTILITIES
// ============================================================================

// DOM helpers
const $ = {
  qs: (sel, root = document) => root.querySelector(sel),
  qsa: (sel, root = document) => [...root.querySelectorAll(sel)],
  el: (tag, cls) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    return e;
  },
  setAttrs: (node, attrs) => {
    Object.entries(attrs).forEach(([k, v]) => node.setAttribute(k, String(v)));
    return node;
  },
};

// Formatting utilities
const format = {
  runtime: (minutes) => {
    if (!minutes) return "";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  },

  money: (amount, locale = "fr-FR", currency = "USD") => {
    if (!amount) return "";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currency,
    }).format(amount);
  },

  date: (dateStr, locale = "fr-FR") => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(locale);
  },

  year: (dateStr) => (dateStr || "").slice(0, 4),

  truncate: (text, maxLength) => {
    const txt = (text || "").trim();
    return txt.length > maxLength ? `${txt.slice(0, maxLength - 1)}…` : txt;
  },
};

// ============================================================================
// THEME SYSTEM
// ============================================================================

const Theme = {
  THEMES: ["dark", "light", "cinema"],
  STORAGE_KEY: "sf_theme",

  apply(name) {
    if (!this.THEMES.includes(name)) name = "dark";
    document.documentElement.setAttribute("data-theme", name);
    try {
      localStorage.setItem(this.STORAGE_KEY, name);
    } catch (e) {}
  },

  init() {
    const saved = (() => {
      try {
        return localStorage.getItem(this.STORAGE_KEY);
      } catch (e) {
        return null;
      }
    })();

    this.apply(saved || "dark");

    const btn = document.getElementById("theme-toggle");
    if (btn) {
      btn.addEventListener("click", () => {
        const cur =
          document.documentElement.getAttribute("data-theme") || "dark";
        const next =
          this.THEMES[(this.THEMES.indexOf(cur) + 1) % this.THEMES.length];
        this.apply(next);
      });
    }
  },
};

// ============================================================================
// NAVIGATION & HEADER
// ============================================================================

const Navigation = {
  init() {
    const header = $.qs(".site-header");
    if (!header) return;

    const links = $.qsa(".main-nav .nav-link");
    const nav = $.qs(".main-nav");
    let underline;

    this.ensureUnderline(nav);
    this.setHeaderOffset(header);
    this.setupScrollEffects(header);
    this.setupSectionHighlighting(links, nav);
    this.setupMobileToggle(nav);

    window.addEventListener("resize", () => this.setHeaderOffset(header));
  },

  ensureUnderline(nav) {
    if (!nav) return;
    if (!nav.querySelector(".nav-underline")) {
      const underline = $.el("span", "nav-underline");
      nav.appendChild(underline);
    }
  },

  moveUnderlineTo(el, nav) {
    const underline = nav?.querySelector(".nav-underline");
    if (!underline || !el || !nav) return;

    const navRect = nav.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const left = r.left - navRect.left;
    underline.style.width = r.width + "px";
    underline.style.transform = `translateX(${left}px)`;
  },

  setHeaderOffset(header) {
    const h = header.getBoundingClientRect().height;
    document.documentElement.style.setProperty("--header-offset", h + "px");
  },

  setupScrollEffects(header) {
    window.addEventListener(
      "scroll",
      () => {
        const y = window.scrollY;
        header.style.transform = y > 8 ? "translateY(-2px)" : "translateY(0)";
        header.classList.toggle("scrolled", y > 8);
        header.classList.toggle("shrink", y > 90);
      },
      { passive: true }
    );
  },

  setupSectionHighlighting(links, nav) {
    const sections = links
      .map((a) => {
        const id = a.getAttribute("href") || "";
        if (id.startsWith("#")) return $.qs(id);
        return null;
      })
      .filter(Boolean);

    if ("IntersectionObserver" in window && sections.length) {
      const obs = new IntersectionObserver(
        (entries) => {
          entries.forEach((e) => {
            if (e.isIntersecting) {
              const id = "#" + e.target.id;
              links.forEach((l) => {
                const active = l.getAttribute("href") === id;
                l.classList.toggle("active", active);
                if (active) this.moveUnderlineTo(l, nav);
              });
            }
          });
        },
        { threshold: 0.55 }
      );

      sections.forEach((s) => obs.observe(s));
    }

    links.forEach((l) => {
      l.addEventListener("click", () => {
        this.moveUnderlineTo(l, nav);
      });
    });

    window.addEventListener("resize", () => {
      const current =
        links.find((l) => l.classList.contains("active")) || links[0];
      this.moveUnderlineTo(current, nav);
    });

    requestAnimationFrame(() => {
      const current =
        links.find((l) => l.classList.contains("active")) || links[0];
      this.moveUnderlineTo(current, nav);
    });
  },

  setupMobileToggle(nav) {
    const toggle = document.getElementById("nav-toggle");
    if (!toggle || !nav) return;

    const root = document.documentElement; // will hold .nav-open
    const closeNav = () => {
      if (!root.classList.contains("nav-open")) return;
      root.classList.remove("nav-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Ouvrir le menu");
    };
    const openNav = () => {
      if (root.classList.contains("nav-open")) return;
      root.classList.add("nav-open");
      toggle.setAttribute("aria-expanded", "true");
      toggle.setAttribute("aria-label", "Fermer le menu");
    };
    const toggleNav = () => {
      if (root.classList.contains("nav-open")) closeNav();
      else openNav();
    };

    toggle.addEventListener("click", toggleNav);

    // Close when clicking a nav link (for anchor navigation) on mobile
    nav.addEventListener("click", (e) => {
      const a = e.target.closest("a.nav-link");
      if (a && window.innerWidth < 720) {
        // Slight delay so browser can start navigation/scroll
        setTimeout(closeNav, 120);
      }
    });

    // Close on Escape
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeNav();
    });

    // Click outside to close
    document.addEventListener("click", (e) => {
      if (!root.classList.contains("nav-open")) return;
      const within = e.target.closest("#primary-navigation, #nav-toggle");
      if (!within) closeNav();
    });

    // Resize / orientation change
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 720) {
        closeNav();
      }
    });
  },
};

// ============================================================================
// HERO PARALLAX EFFECTS
// ============================================================================

const HeroEffects = {
  init() {
    const media = $.qs(".hero-media");
    if (!media) return;

    const layers = [
      media.querySelector(".layer-extra"),
      media.querySelector(".layer-back"),
      media.querySelector(".layer-mid"),
      media.querySelector(".layer-front"),
    ].filter(Boolean);

    let raf = 0;
    let px = 0,
      py = 0;
  let sy = 0; // vertical scroll offset (will be neutralized to prevent jump)
    let inView = true;

    const apply = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rx = inView ? -py * 8 : 0;
        const ry = inView ? px * 12 : 0;
        media.style.transform = `rotateX(${rx.toFixed(
          2
        )}deg) rotateY(${ry.toFixed(2)}deg)`;

        layers.forEach((el, i) => {
          const depth = (i + 1) * 8;
          const tx = inView ? px * depth : 0;
          // Removed scroll-based vertical shift to avoid 'mounting' jump
          const ty = inView ? py * depth : 0;
          el.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`;
        });
      });
    };

    const onMove = (e) => {
      const r = media.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
      apply();
    };

    const onLeave = () => {
      px = 0;
      py = 0;
      apply();
    };

    media.addEventListener("mousemove", onMove);
    media.addEventListener("mouseleave", onLeave);

    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((ent) => {
            inView = ent.isIntersecting;
            if (!inView) {
              px = 0;
              py = 0;
              sy = 0;
            }
            apply();
          });
        },
        { threshold: 0.1 }
      );
      io.observe(media);
    }

    // Scroll effect disabled (was causing vertical jump). If needed later,
    // re-enable with a softer factor & clamped only when user not near top.
  },
};

// ============================================================================
// API SERVICE
// ============================================================================

const API = {
  // TMDB helper
  buildTmdbUrl(endpoint, params = {}) {
    const config = window.STREAMFLIX_CONFIG;
    const u = new URL(config.TMDB_BASE_URL.replace(/\/$/, "") + endpoint);

    const bearer = this.getTmdbBearer();
    if (!bearer) {
      u.searchParams.set("api_key", config.TMDB_API_KEY);
    }

    if (config.TMDB_LANG) u.searchParams.set("language", config.TMDB_LANG);
    if (config.TMDB_REGION) u.searchParams.set("region", config.TMDB_REGION);

    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") u.searchParams.set(k, v);
    });

    return u.toString();
  },

  getTmdbBearer() {
    try {
      return window.STREAMFLIX_BEARER || window.STREAMFLIX_V4_TOKEN || null;
    } catch (_) {
      return null;
    }
  },

  async fetchTmdb(endpoint, params = {}) {
    const url = this.buildTmdbUrl(endpoint, params);
    const bearer = this.getTmdbBearer();

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
      },
    });

    if (!res.ok) {
      throw new Error(`TMDB API Error: ${res.status} ${res.statusText}`);
    }

    return await res.json();
  },

  buildImageUrl(path, size = "w342") {
    const config = window.STREAMFLIX_CONFIG;
    return path ? `${config.TMDB_IMAGE_BASE_URL}/${size}${path}` : "";
  },
};

// ============================================================================
// INITIALIZATION
// ============================================================================

// Early theme initialization
Theme.init();

// DOM ready initialization
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    Navigation.init();
    HeroEffects.init();
  });
} else {
  Navigation.init();
  HeroEffects.init();
}

// Export for modules
window.StreamFlix = {
  $,
  format,
  Theme,
  Navigation,
  HeroEffects,
  API,
};
