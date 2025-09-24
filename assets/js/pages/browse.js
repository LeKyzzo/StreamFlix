// browse.js - list all movies with live search
import { qs, qsa, el } from '../utils/dom.js';
import { fetchCollection } from '../services/api.js';

function skeletonCard(){
  const article = el('article','movie-card');
  const link = el('a','card-media-wrap'); link.href = 'movie.html';
  const media = el('div','card-media skeleton');
  const meta = el('div','card-meta');
  const title = el('h3','card-title'); title.textContent='\u200b';
  const sub = el('p','card-subtitle'); sub.textContent='\u200b';
  meta.append(title, sub); link.append(media, meta); article.append(link);
  return article;
}

function cardFromMovie(m){
  const tpl = qs('#movie-card-template');
  const node = tpl.content.firstElementChild.cloneNode(true);
  node.dataset.id = m.id;
  const a = node.querySelector('a.card-media-wrap');
  a.href = `movie.html?id=${m.id}`;
  const img = node.querySelector('img.card-img');
  const webp = node.querySelector('source[type="image/webp"]');
  const avif = node.querySelector('source[type="image/avif"]');
  img.src = m.poster;
  img.srcset = `${m.poster} 1x, ${m.poster}&d=2 2x`;
  if(webp) webp.srcset = `${m.poster}.webp 1x, ${m.poster}.webp&d=2 2x`;
  if(avif) avif.srcset = `${m.poster}.avif 1x, ${m.poster}.avif&d=2 2x`;
  img.addEventListener('load', ()=>{ img.classList.remove('skeleton'); img.style.opacity='1'; }, {once:true});
  node.querySelector('.card-title').textContent = m.title;
  node.querySelector('.card-subtitle').textContent = `${m.year} • ${m.genre?.[0]||''}`;
  return node;
}

async function fetchAll(){
  // Aggregate multiple collections for now; later replace by real endpoint
  const kinds = ['popular','trending','recent'];
  const parts = await Promise.all(kinds.map(k=>fetchCollection(k)));
  const map = new Map();
  parts.flat().forEach(m=>{ map.set(m.id, m); });
  return Array.from(map.values());
}

function render(list){
  const grid = qs('[data-catalog]');
  if(!grid) return;
  const skeletonOnly = grid.getAttribute('data-skeleton-only') === 'true';
  if(!skeletonOnly){ grid.innerHTML = ''; }
  list.forEach((m,i)=>{
    const card = cardFromMovie(m);
    card.style.animationDelay = `${Math.min(i*30, 300)}ms`;
    if(!skeletonOnly) grid.append(card);
  });
}

function setupSearch(data){
  const input = qs('#catalogSearch');
  if(!input) return;
  function doFilter(){
    const q = input.value.trim().toLowerCase();
    const list = !q ? data : data.filter(m=> (m.title||'').toLowerCase().includes(q));
    render(list);
  }
  input.addEventListener('input', doFilter);
}

async function init(){
  const data = await fetchAll();
  // by default keep skeletons; if you want to render, remove the flag in HTML
  setupSearch(data);
  // If skeleton-only is false, render initial list
  const grid = qs('[data-catalog]');
  if(grid && grid.getAttribute('data-skeleton-only') !== 'true'){
    render(data);
  }
}

init();
