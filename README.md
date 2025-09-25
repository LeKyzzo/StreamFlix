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

Les scripts utilisent des modules ES (`<script type="module">`). Certains navigateurs bloquent les imports de modules via le protocole `file://` (chemins relatifs, origin différente, CORS). Il faut donc idéalement servir le dossier via un petit serveur HTTP local.

Méthodes possibles :

### 1. Extension Live Server (VS Code)

La plus simple.

1. Ouvrir le dossier dans VS Code.
2. Installer l’extension “Live Server”.
3. Ouvrir `index.html` et cliquer sur “Go Live”.
4. Accéder à l’URL locale (souvent `http://127.0.0.1:5500/`).

### 2. Python (intégré sur beaucoup de systèmes)

Depuis la racine du projet :

Python 3.x :

```bash
python -m http.server 5173
```

Ou selon l’installation :

```bash
py -m http.server 5173
```

Puis ouvrir: http://localhost:5173

### 3. Node.js (sans dépendances)

Utilisation rapide avec un script one‑liner HTTP (Node 18+):

```bash
node -e "require('http').createServer((req,res)=>{const fs=require('fs');const p=require('path');let f=p.join(process.cwd(), req.url.split('?')[0]); if(fs.statSync(process.cwd()).isDirectory() && f.endsWith('/')) f+='index.html'; if(fs.existsSync(f) && fs.statSync(f).isFile()){res.writeHead(200);res.end(fs.readFileSync(f));} else {try{const idx=p.join(process.cwd(),'index.html');res.writeHead(200);res.end(fs.readFileSync(idx));}catch(e){res.writeHead(404);res.end('Not found');}}).listen(5173)"
```

Puis http://localhost:5173

Ou plus lisible (créer un fichier `serve.mjs`) :

```js
import { createServer } from "http";
import { stat, readFile } from "fs/promises";
import { join } from "path";

createServer(async (req, res) => {
  const urlPath = req.url.split("?")[0];
  let filePath = join(process.cwd(), urlPath === "/" ? "/index.html" : urlPath);
  try {
    const s = await stat(filePath);
    if (s.isDirectory()) filePath = join(filePath, "index.html");
    const data = await readFile(filePath);
    res.writeHead(200);
    res.end(data);
  } catch (e) {
    res.writeHead(404);
    res.end("Not found");
  }
}).listen(5173, () => console.log("Serveur sur http://localhost:5173"));
```

Puis :

```bash
node serve.mjs
```

### 4. npx serve (si Node installé)

```bash
npx serve -p 5173 .
```

---

Accès direct via double‑clic peut fonctionner, mais si tu vois des erreurs du style `Failed to load module script` ou `CORS` dans la console → passe à une des méthodes ci‑dessus.

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
