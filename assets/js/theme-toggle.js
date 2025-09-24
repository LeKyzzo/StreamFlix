// theme-toggle.js - 3 themes with persistence
const THEMES = ['dark','light','cinema'];
const STORAGE_KEY = 'sf_theme';

function applyTheme(name){
  if(!THEMES.includes(name)) name = 'dark';
  document.documentElement.setAttribute('data-theme', name);
  try{ localStorage.setItem(STORAGE_KEY, name); }catch(e){}
}

(function initTheme(){
  const saved = (()=>{ try{ return localStorage.getItem(STORAGE_KEY); }catch(e){ return null } })();
  applyTheme(saved || 'dark');
  const btn = document.getElementById('theme-toggle');
  if(btn){
    btn.addEventListener('click', ()=>{
      const cur = document.documentElement.getAttribute('data-theme') || 'dark';
      const next = THEMES[(THEMES.indexOf(cur)+1)%THEMES.length];
      applyTheme(next);
    });
  }
})();
