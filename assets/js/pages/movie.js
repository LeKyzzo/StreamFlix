// movie.js - populate movie page and similar grid
import { qs, qsa, el } from '../utils/dom.js';
import { fetchMovie, fetchCollection } from '../services/api.js';

function getId(){
  const u = new URL(location.href);
  return u.searchParams.get('id') || '1';
}

function setPoster(url){
  const poster = qs('#moviePoster');
  poster.classList.remove('skeleton');
  poster.style.backgroundImage = `url(${url})`;
  poster.style.backgroundSize = 'cover';
  poster.style.backgroundPosition = 'center';
}

function setDetails(m){
  qs('#movieTitle').textContent = m.title;
  qs('#crumbTitle').textContent = m.title;
  qs('#movieMeta').textContent = `${m.year} • ${m.duration} min • ${m.rating}/10`;
  qs('#movieOverview').textContent = m.overview;
  const genres = qs('#movieGenres');
  genres.innerHTML = '';
  (m.genres||[]).forEach(g=>{ const li = el('li'); li.textContent = g; genres.append(li); });

  const details = qs('#movieDetails');
  details.innerHTML = '';
  const map = {Réalisateur: m.director, Langue: m.language, Pays: m.country};
  Object.entries(map).forEach(([k,v])=>{
    const dt = el('dt'); dt.textContent = k;
    const dd = el('dd'); dd.textContent = v;
    details.append(dt,dd);
  });
}

function setupTabs(){
  const wrap = qs('[data-tabs]');
  if(!wrap) return;
  const buttons = qsa('.tab-btn', wrap);
  const indicator = qs('.tabs-indicator', wrap);
  const panels = qsa('.tab-panel', wrap);

  function activate(name){
    buttons.forEach(btn=>{
      const on = btn.dataset.tab === name;
      btn.setAttribute('aria-selected', on);
    });
    panels.forEach(p=> p.classList.toggle('is-active', p.id === `tab-${name}`));
    // move indicator under active tab
    const activeBtn = buttons.find(b=>b.dataset.tab===name);
    if(activeBtn){
      const r = activeBtn.getBoundingClientRect();
      const pr = indicator.parentElement.getBoundingClientRect();
      const w = Math.max(60, r.width * .6);
      indicator.style.setProperty('--x', `${r.left - pr.left + r.width*0.2}px`);
      indicator.style.setProperty('--w', `${w}px`);
      indicator.style.transform = `translateX(var(--x))`;
      indicator.style.setProperty('width', `var(--w)`);
    }
  }

  buttons.forEach(btn=> btn.addEventListener('click', ()=> activate(btn.dataset.tab)));
  window.addEventListener('resize', ()=>{
    const current = buttons.find(b=>b.getAttribute('aria-selected')==='true');
    if(current) activate(current.dataset.tab);
  });
  // init
  activate('overview');
}

async function renderSimilar(){
  const grid = qs('.grid.movies[data-collection="similar"]');
  if(!grid) return;
  const base = await fetchCollection('similar');
  // if skeleton-only, keep skeletons; else replace
  const skeletonOnly = grid.getAttribute('data-skeleton-only') === 'true';
  if(!skeletonOnly){
    grid.innerHTML = '';
  }
  base.forEach((m,i)=>{
    const tpl = qs('#movie-card-template');
    const card = tpl.content.firstElementChild.cloneNode(true);
    card.dataset.id = m.id;
    card.querySelector('a.card-media-wrap').href = `movie.html?id=${m.id}`;
  const img = card.querySelector('img.card-img');
  const webp = card.querySelector('source[type="image/webp"]');
  const avif = card.querySelector('source[type="image/avif"]');
  img.src = m.poster;
  img.srcset = `${m.poster} 1x, ${m.poster}&d=2 2x`;
  if(webp) webp.srcset = `${m.poster}.webp 1x, ${m.poster}.webp&d=2 2x`;
  if(avif) avif.srcset = `${m.poster}.avif 1x, ${m.poster}.avif&d=2 2x`;
    img.addEventListener('load', ()=>{
      img.classList.remove('skeleton');
      img.style.opacity = '1';
    }, {once:true});
    card.querySelector('.card-title').textContent = m.title;
    card.querySelector('.card-subtitle').textContent = `${m.year} • ${m.genre?.[0]||''}`;
    card.style.animationDelay = `${Math.min(i*40, 400)}ms`;
    if(!skeletonOnly){
      grid.append(card);
    }
  })
}

async function init(){
  const id = getId();
  const m = await fetchMovie(id);
  setPoster(m.poster);
  setDetails(m);
  setupTabs();
  renderSimilar();
}

init();
