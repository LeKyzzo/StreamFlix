// nav.js - sticky header shrink and section highlighting
(function(){
  const header = document.querySelector('.site-header');
  if(!header) return;
  const links = [...document.querySelectorAll('.main-nav .nav-link')];
  const nav = document.querySelector('.main-nav');
  let underline;

  function ensureUnderline(){
    if(!nav) return;
    if(!underline){
      underline = document.createElement('span');
      underline.className = 'nav-underline';
      nav.appendChild(underline);
    }
  }

  function moveUnderlineTo(el){
    if(!underline || !el) return;
    const navRect = nav.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const left = r.left - navRect.left;
    underline.style.width = r.width + 'px';
    underline.style.transform = `translateX(${left}px)`;
  }

  function setHeaderOffset(){
    const h = header.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--header-offset', h + 'px');
  }
  setHeaderOffset();
  ensureUnderline();
  window.addEventListener('resize', setHeaderOffset);

  window.addEventListener('scroll', ()=>{
    const y = window.scrollY;
    header.style.transform = y>8 ? 'translateY(-2px)' : 'translateY(0)';
    if(y>8) header.classList.add('scrolled'); else header.classList.remove('scrolled');
    if(y>90) header.classList.add('shrink'); else header.classList.remove('shrink');
  },{passive:true});

  // highlight visible section
  const sections = links.map(a=>{
    const id = a.getAttribute('href')||'';
    if(id.startsWith('#')) return document.querySelector(id);
    return null;
  }).filter(Boolean);

  if('IntersectionObserver' in window && sections.length){
    const obs = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if(e.isIntersecting){
          const id = '#'+e.target.id;
          links.forEach(l=>{
            const active = l.getAttribute('href')===id;
            l.classList.toggle('active', active);
            if(active) moveUnderlineTo(l);
          });
        }
      })
    },{threshold:0.55});
    sections.forEach(s=>obs.observe(s));
  }

  // click -> move underline
  links.forEach(l=>{
    l.addEventListener('click', (e)=>{
      // let default scroll happen; just move underline immediately
      moveUnderlineTo(l);
    });
  });

  // reposition underline on resize
  window.addEventListener('resize', ()=>{
    const current = links.find(l=>l.classList.contains('active')) || links[0];
    moveUnderlineTo(current);
  });

  // initial underline position
  requestAnimationFrame(()=>{
    const current = links.find(l=>l.classList.contains('active')) || links[0];
    moveUnderlineTo(current);
  });
})();
