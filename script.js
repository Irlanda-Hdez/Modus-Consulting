// Script JavaScript: interactividad básica para el sitio

document.addEventListener('DOMContentLoaded', function(){
const initialHash = window.location.hash;
  if (!initialHash || initialHash === '#inicio') {
    document.body.classList.add('home-only');
  } else {
    document.body.classList.remove('home-only');
}

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
  const topNavLinks = document.querySelectorAll('.navbar .navbar-nav .nav-link');
  const siteHeader = document.querySelector('.site-header');
  const setActiveNav = (targetId)=>{
    topNavLinks.forEach(a=>{
      a.classList.toggle('active', a.getAttribute('href') === targetId);
    });
  };
  setActiveNav(initialHash || '#inicio');

  const updateHeaderState = () => {
    if(siteHeader) siteHeader.classList.toggle('is-scrolled', window.scrollY > 18);
  };
  updateHeaderState();
  window.addEventListener('scroll', updateHeaderState, {passive:true});

  document.querySelectorAll('a[href^="#"]').forEach(function(anchor){
    anchor.addEventListener('click', function(e){
      const targetId = this.getAttribute('href');
      if(!targetId) return;
      // If clicking Inicio: hide other sections again
      if(targetId === '#inicio'){
        e.preventDefault();
        document.body.classList.remove('project-only');
        document.body.classList.add('home-only');
        setActiveNav('#inicio');
        collapseNav();
        setTimeout(()=>window.scrollTo({top:0, behavior:'smooth'}), 80);
        return;
      }
      // Projects and other sections can be viewed in the standard flow
      if(targetId.length>1){
        e.preventDefault();
        document.body.classList.remove('home-only');
        document.body.classList.add('project-only');
        setActiveNav(targetId);
        const scrollToTarget = function(){
          const el = document.querySelector(targetId);
          if(el){ el.scrollIntoView({behavior:'smooth',block:'start'}); }
        };
        if(targetId === '#proyecto'){
          document.body.classList.add('project-only');
          setTimeout(()=>{ scrollToTarget(); collapseNav(); }, 120);
          return;
        }
        document.body.classList.remove('project-only');
        scrollToTarget();
        collapseNav();
      }
    });
  });

  // Active nav link on scroll
  const sections = document.querySelectorAll('main section[id]');
  const navTargets = new Set(Array.from(topNavLinks).map(a=>a.getAttribute('href')));
  const obsOptions = {root:null,threshold:0.35};
  const observer = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        const targetId = '#'+entry.target.id;
        if(navTargets.has(targetId)) setActiveNav(targetId);
      }
    })
  }, obsOptions);
  sections.forEach(s=>observer.observe(s));

  // Shared reveal system: one entrance per element, with a restrained group stagger.
  const revealSelectors = [
    '.fade-in',
    '.metric-card', '.scope-card', '.visibility-card', '.finding-card',
    '.pain-card', '.cycle-metric-card', '.deliverable-card', '.team-card',
    '.opportunity-card', '.solution-card', '.numbered-card', '.module-card',
    '.roadmap-phase', '.tower-mockup', '.arrival-case', '.timeline-panel'
  ];
  const revealTargets = document.querySelectorAll(revealSelectors.join(','));
  revealTargets.forEach((element, index) => {
    element.classList.add('reveal-target');
    element.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 80}ms`);
  });
  const revealObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {threshold:0.14, rootMargin:'0px 0px -5% 0px'});
  revealTargets.forEach(target=>revealObserver.observe(target));

  const heroSequence = document.querySelectorAll('.hero-section .hero-title, .hero-section .lead, .hero-section .small, .hero-section .mt-4, .proposal-hero .eyebrow, .proposal-hero .proposal-title, .proposal-hero .proposal-lead, .proposal-hero .proposal-mantra, .proposal-hero .proposal-actions, .proposal-hero .proposal-flow');
  heroSequence.forEach((element, index)=>{
    element.classList.add('hero-reveal');
    element.style.setProperty('--hero-delay', `${index * 90}ms`);
  });
  requestAnimationFrame(()=>heroSequence.forEach(element=>element.classList.add('hero-visible')));

  const motionObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('motion-started');
        motionObserver.unobserve(entry.target);
      }
    });
  }, {threshold:0.3});
  document.querySelectorAll('.timeline-comparison, .tower-mockup, .roadmap-grid').forEach(element=>motionObserver.observe(element));

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
