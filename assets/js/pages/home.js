// home.js - render collections with skeletons & staggered appear
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
  img.addEventListener('load', ()=>{
    img.classList.remove('skeleton');
    img.style.opacity = '1';
  }, {once:true});
  node.querySelector('.card-title').textContent = m.title;
  node.querySelector('.card-subtitle').textContent = `${m.year} • ${m.genre?.[0]||''}`;
  return node;
}

async function renderCollection(grid){
  const defaultCount = grid.classList.contains('top10') ? 10 : 6;
  const count = Math.max(Number(grid.dataset.skeleton)||defaultCount, 3);
  grid.innerHTML = '';
  for(let i=0;i<count;i++) grid.append(skeletonCard());
  if(grid.dataset.skeletonOnly === 'true'){
    return; // keep skeletons when no API
  }
  try{
    const data = await fetchCollection(grid.dataset.collection);
    grid.innerHTML = '';
    data.forEach((m,i)=>{
      const card = cardFromMovie(m);
      card.style.animationDelay = `${Math.min(i*40, 400)}ms`;
      grid.append(card);
    })
  }catch(e){
    // keep the skeletons if failure
  }
}

async function init(){
  const grids = qsa('.grid.movies');
  grids.forEach(renderCollection);
}

init();
