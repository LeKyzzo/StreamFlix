# StreamFlix

Interface front‑end que j’ai conçue pour reproduire une expérience “type Netflix” uniquement avec HTML, CSS moderne et un peu de JavaScript vanilla. Tout est statique (aucun backend obligatoire) mais j’ai intégré une logique pour brancher facilement une API (TMDB) et faire tourner un hero dynamique avec rotation et parallax.

## Objectif du projet

Expérimenter :

- Une architecture simple mais propre (fichiers séparés, utilitaires JS légers)
- Un hero cinéma plein écran avec couches parallax (tilt + rotation d’affiches tendances)
- Des rangées horizontales scrollables fluides (scroll-snap) façon plateforme de streaming
- Une navigation fixe translucide qui devient plus solide au scroll
- Des thèmes multiples persistants (sombre, clair, “cinéma”) via localStorage
- Des squelettes animés pour le chargement et une impression de réactivité immédiate

## Fonctionnalités principales

- Hero dynamique (film tendance qui change automatiquement)
- Effet parallax multi‑couches avec rotation sur mouvement de la souris
- Bouton de thème cyclique (dark → light → cinema)
- Navigation sticky + soulignement dynamique de la section
- Liste “Top 10” avec pastilles rang personnalisées
- Cartes de films : hover + overlay, squelette avant chargement
- Version mobile avec menu dépliant accessible (bouton ☰)
- Détails film enrichis (réalisateur, budget, recettes, statut, genres, cast, vidéos…)

## Structure rapide

```
index.html        Page d’accueil (hero + sections tendances, populaire, etc.)
movie.html        Page détail d’un film (hero info + tabs + similaires)
browse.html       Navigation catalogue avec filtres & pagination
assets/css        Styles (global + pages + animations)
assets/js/main.js Initialisation globale (thème, nav, parallax, utilitaires)
assets/js/pages   Logique spécifique par page (home.js, movie.js, browse.js)
```

## Thèmes

Je stocke le thème courant dans localStorage (clé : `sf_theme`) et j’applique très tôt une valeur sauvegardée pour éviter un flash visuel. Les trois thèmes ajustent couleurs de fond, contrastes, ambiance et scrollbar.

## Parallax & Hero

Le hero récupère une liste de films tendances et fait tourner l’affiche toutes les 15 secondes (précharge des suivantes pour éviter le flash). Les couches (.layer-extra/back/mid/front) composent un effet de profondeur léger. J’ai ajouté une version sans le décalage vertical au scroll pour éviter un “saut” visuel.

## Accessibilité

- Focus clavier cohérent avec le hover
- Scroll-snap non bloquant
- Prise en compte de la lisibilité (overlay glass + dégradés adaptatifs selon thème)
- Fermeture du menu mobile via Échap, clic extérieur, changement de taille d’écran

## Données / API

Le code est prêt pour l’API TMDB : clés et base URL configurées dans `window.STREAMFLIX_CONFIG`. Génération d’URL images et appels fetch centralisés (cf. objet API dans `main.js`).

## Lancer en local

Pas de build. J’ouvre simplement `index.html` dans le navigateur.
Pour un meilleur cache module / CORS : petit serveur statique (ex: Live Server VS Code) si besoin.

## Personnalisation rapide

- Ajuster la densité des cartes : modifier les clamps `--card-w` dans les règles `.grid.movies`
- Changer la vitesse de rotation hero : variable dans `home.js` (intervalle 15000ms)
- Affiner l’intensité parallax : multiplier / réduire les facteurs dans HeroEffects
- Modifier le gradient lisibilité : bloc `.hero-content` dans `index.css`

## Améliorations possibles (roadmap perso)

- Gestion d’état “Ma liste” côté localStorage
- Filtres combinés avancés (genre + année + note) avec URL sync
- Préchargement intelligent d’images selon proximité du viewport
- Mode hors connexion avec cache Service Worker

## Licence

Projet personnel libre d’inspiration / apprentissage. Utilisation libre tant que la mention est conservée.

---

Si tu parcours le code : j’ai volontairement gardé une approche claire, sans framework, pour montrer qu’on peut faire une UI moderne et fluide en pur vanilla.
