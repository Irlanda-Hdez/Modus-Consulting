// Script JavaScript: interactividad básica para el sitio

document.addEventListener('DOMContentLoaded', function(){
  // Smooth scroll for internal links and reveal sections when needed
  const collapseNav = ()=>{
    const nav = document.getElementById('mainNav');
    if(nav && nav.classList.contains('show')) nav.classList.remove('show');
    const off = document.getElementById('sideNav');
    if(off && off.classList.contains('show')){
      try{
        const oc = bootstrap.Offcanvas.getInstance(off) || new bootstrap.Offcanvas(off);
        oc.hide();
      }catch(e){ off.classList.remove('show'); }
    }
  };
  document.querySelectorAll('a[href^="#"]').forEach(function(anchor){
    anchor.addEventListener('click', function(e){
      const targetId = this.getAttribute('href');
      if(!targetId) return;
      // If clicking Inicio: hide other sections again
      if(targetId === '#inicio'){
        e.preventDefault();
        document.body.classList.add('home-only');
        collapseNav();
        setTimeout(()=>window.scrollTo({top:0, behavior:'smooth'}), 80);
        return;
      }
      // For other sections: reveal content if currently hidden, then scroll to the section
      if(targetId.length>1){
        e.preventDefault();
        const scrollToTarget = function(){
          const el = document.querySelector(targetId);
          if(el){ el.scrollIntoView({behavior:'smooth',block:'start'}); }
        };
        if(document.body.classList.contains('home-only')){
          document.body.classList.remove('home-only');
          setTimeout(()=>{ scrollToTarget(); collapseNav(); }, 120);
        } else {
          scrollToTarget();
          collapseNav();
        }
      }
    });
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('main section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const obsOptions = {root:null,threshold:0.35};
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const id = entry.target.id;
        navLinks.forEach(a=>{
          a.classList.toggle('active', a.getAttribute('href') === '#'+id);
        })
      }
    })
  }, obsOptions);
  sections.forEach(s=>observer.observe(s));

  // Fade-in on scroll
  const faders = document.querySelectorAll('.fade-in, .card, .kpi-card');
  const fObs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('visible'); fObs.unobserve(e.target); } });
  }, {threshold:0.2});
  faders.forEach(f=>fObs.observe(f));

  // Back to top button
  const back = document.getElementById('backToTop');
  window.addEventListener('scroll', ()=>{ if(window.scrollY>300) back.style.display='flex'; else back.style.display='none'; });
  back.addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'}));

  // Gallery modal
  document.querySelectorAll('.gallery-item').forEach(img=>{
    img.addEventListener('click', ()=>{
      const src = img.dataset.full || img.src;
      const modalImg = document.getElementById('galleryImage');
      modalImg.src = src;
      const galleryModal = new bootstrap.Modal(document.getElementById('galleryModal'));
      galleryModal.show();
    });
  });

  // Counters animation for KPIs
  const counters = document.querySelectorAll('.kpi-value');
  const counterObs = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const el = entry.target; const target = +el.dataset.target || 0;
        let start = 0; const dur = 1400; const step = Math.ceil(target / (dur/16));
        const t = setInterval(()=>{ start += step; if(start>=target){ el.textContent = target; clearInterval(t);} else el.textContent = start; },16);
        counterObs.unobserve(el);
      }
    });
  }, {threshold:0.4});
  counters.forEach(c=>counterObs.observe(c));

  // Filter entregables
  document.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const f = btn.dataset.filter; document.querySelectorAll('.deliverable-item').forEach(item=>{
        if(f==='all' || item.dataset.stage===f) item.style.display='block'; else item.style.display='none';
      });
    });
  });

  // Process modal demo: open with placeholder content
  document.querySelectorAll('.view-process').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      const modal = new bootstrap.Modal(document.getElementById('processModal'));
      const body = document.querySelector('#processModal .modal-body');
      body.innerHTML = '<p>[Información detallada del proceso — reemplazar con contenido real]</p>';
      modal.show();
    });
  });

});
