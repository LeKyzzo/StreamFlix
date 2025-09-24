// hero.js - dynamic parallax/tilt for hero media
(function(){
  const media = document.querySelector('.hero-media');
  if(!media) return;
  const layers = [
    media.querySelector('.layer-back'),
    media.querySelector('.layer-mid'),
    media.querySelector('.layer-front')
  ].filter(Boolean);

  let raf = 0;
  let px = 0, py = 0; // pointer tilt (-.5..+.5 normalized)
  let sy = 0;        // scroll offset contribution in px
  let inView = true;

  function apply(){
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(()=>{
      // container tilt (only when in view)
  const rx = inView ? (-py*8) : 0; // was 4
  const ry = inView ? (px*12) : 0; // was 6
      media.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
      // layers parallax
      layers.forEach((el,i)=>{
        const depth = (i+1) * 8; // was 4, now 8,16,24 px
        const tx = (inView ? px*depth : 0);
        const ty = (inView ? py*depth : 0) + sy*(i+1);
        el.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`;
      });
    });
  }

  function onMove(e){
    const r = media.getBoundingClientRect();
    px = (e.clientX - r.left)/r.width - .5;
    py = (e.clientY - r.top)/r.height - .5;
    apply();
  }
  function onLeave(){
    px = 0; py = 0; apply();
  }

  media.addEventListener('mousemove', onMove);
  media.addEventListener('mouseleave', onLeave);

  // limit parallax to hero visibility
  if('IntersectionObserver' in window){
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(ent=>{
        inView = ent.isIntersecting;
        if(!inView){ px = 0; py = 0; sy = 0; }
        apply();
      });
    },{threshold:0.1});
    io.observe(media);
  }

  // gentle scroll parallax (only while in view); compose transforms, do not append
  window.addEventListener('scroll', ()=>{
    if(!inView) return;
    const rect = media.getBoundingClientRect();
    const offset = -rect.top; // >0 when scrolled past top of viewport
    const raw = offset * 0.08; // stronger scroll factor
    sy = Math.max(-50, Math.min(50, raw)); // wider bounds
    apply();
  }, {passive:true});
})();
