// Script JavaScript: interactividad básica para el sitio

document.addEventListener('DOMContentLoaded', function(){
  const initialHash = window.location.hash;
  if(initialHash === '#inicio'){
    document.body.classList.add('home-only');
  } else if(!initialHash){
    document.body.classList.add('project-only');
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
  setActiveNav(initialHash === '#inicio' ? '#inicio' : initialHash === '#propuesta' ? '#propuesta' : '#proyecto');

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

  // Deliverables dataset
  const deliverables = [
    {
      id: 1,
      title: 'Fase 1',
      description: 'Diagnóstico integral AS-IS de la Central de Ferrocarril, incluyendo contexto operativo, indicadores, análisis del proceso, capacidades, benchmarking y oportunidades de mejora.',
      category: 'Diagnóstico',
      stage: 'diagnostico',
      type: 'PDF',
      status: 'Completado',
      statusType: 'done',
      featured: true,
      url: 'documents/Etapa 1_Analisis del Proceso.pdf',
      downloadUrl: 'documents/Etapa 1_Analisis del Proceso.pdf'
    },
    {
      id: 2,
      title: 'BPMN - AS-IS',
      description: 'Modelo del proceso actual desde la planeación y programación hasta la recepción, descarga, liberación y registro de demoras.',
      category: 'Diagnóstico',
      stage: 'diagnostico',
      type: 'BPMN / PDF',
      status: 'Completado',
      statusType: 'done',
      featured: false,
      url: 'documents/BPMN AS-IS Proceso Ferroviario Ternium.pdf',
      downloadUrl: 'documents/TERNIUM - Proceso Ferroviario - AS IS.svg'
    },
    {
      id: 4,
      title: 'Dashboard de Logística Ferroviaria',
      description: 'Visualización de indicadores de cumplimiento, tiempos de tránsito, días excedidos y comportamiento por material.',
      category: 'Análisis',
      stage: 'analisis',
      type: 'Dashboard',
      status: 'Completado',
      statusType: 'done',
      featured: false,
      url: 'https://public.tableau.com/views/DashboardLogsticaFerroviaria/DashboardLogsticaFerroviaria?:language=en-US&publish=yes&:sid=&:redirect=auth&:display_count=n&:origin=viz_share_link',
      downloadUrl: null
    },
    {
      id: 6,
      title: 'Análisis de capacidades',
      description: 'Evaluación de recursos y capacidades del proceso frente al ritmo requerido, con identificación de puntos críticos y oportunidades de mejora.',
      category: 'Análisis',
      stage: 'analisis',
      type: 'Excel',
      status: 'Completado',
      statusType: 'done',
      featured: false,
      url: 'https://docs.google.com/spreadsheets/d/1vCwp-nhTsxdje8mPhllO2-WDg9zRJnib07P8tlZtCkE/edit?usp=sharing',
      downloadUrl: null
    },
    {
      id: 9,
      title: 'BPMN TO-BE',
      description: 'Modelo futuro del proceso ferroviario incorporando alertas, preparación anticipada, trazabilidad y gestión operativa de la ventana contractual.',
      category: 'Diseño / Propuesta',
      stage: 'propuesta',
      type: 'Proceso TO-BE',
      status: 'En desarrollo',
      statusType: 'progress',
      featured: false,
      url: 'documents/BPMN TO-BE Proceso Ferroviario Ternium.pdf',
      downloadUrl: 'documents/BPMN TO-BE Proceso Ferroviario Ternium.pdf'
    },
    {
      id: 10,
      title: 'Roadmap',
      description: 'Ruta de implementación por etapas e indicadores propuestos para evaluar reducción de esperas, cumplimiento y coordinación operativa.',
      category: 'Anexos',
      stage: 'Anexo',
      type: 'Roadmap',
      status: 'En desarrollo',
      statusType: 'progress',
      featured: false,
      url: '#roadmap',
      downloadUrl: null
    }
  ];

  const deliverablesList = document.getElementById('deliverables-list');

  function createBadge(statusType, text) {
    const badge = document.createElement('span');
    const className = statusType === 'done' ? 'deliverable-badge done' : statusType === 'progress' ? 'deliverable-badge in-progress' : 'deliverable-badge source';
    badge.className = className;
    badge.textContent = text;
    return badge;
  }

  function renderDeliverables(filter = 'all') {
    if (!deliverablesList) return;

    deliverablesList.innerHTML = '';

    const filtered = filter === 'all'
      ? deliverables
      : deliverables.filter(item => item.stage === filter);

    filtered.forEach((item, index) => {
      const col = document.createElement('div');
      col.className = 'col-md-6 col-xl-4 deliverable-item';
      col.dataset.stage = item.stage;
      col.style.display = 'block';

      const card = document.createElement('article');
      card.className = 'card deliverable-card h-100';

      const body = document.createElement('div');
      body.className = 'card-body';

      const top = document.createElement('div');
      top.className = 'deliverable-top';

      const category = document.createElement('span');
      category.className = 'deliverable-category';
      category.textContent = item.category;

      top.appendChild(category);
      if (item.featured) {
        const feature = document.createElement('span');
        feature.className = 'deliverable-feature';
        feature.textContent = 'Documento principal';
        top.appendChild(feature);
      }

      const title = document.createElement('h5');
      title.textContent = item.title;

      const description = document.createElement('p');
      description.className = 'small text-muted deliverable-description';
      description.textContent = item.description;

      const meta = document.createElement('div');
      meta.className = 'deliverable-meta';

      const type = document.createElement('span');
      type.className = 'deliverable-type';
      type.innerHTML = '<i class="fa-regular fa-file-lines"></i> ' + item.type;

      const status = createBadge(item.statusType, item.status);

      meta.appendChild(type);
      meta.appendChild(status);

      const actions = document.createElement('div');
      actions.className = 'deliverable-actions';

      const viewUrl = item.url || '#entregables';
      const viewLink = document.createElement('a');
      viewLink.href = viewUrl;
      viewLink.className = 'btn btn-sm btn-primary';
      viewLink.textContent = 'Ver';
      viewLink.target = item.url && item.url.startsWith('http') ? '_blank' : '_self';
      viewLink.rel = 'noopener noreferrer';

      const hasDownload = !!item.downloadUrl;
      if (hasDownload) {
        const downloadLink = document.createElement('a');
        downloadLink.href = item.downloadUrl;
        downloadLink.className = 'btn btn-sm btn-outline-primary';
        downloadLink.textContent = 'Descargar';
        downloadLink.download = item.downloadUrl.split('/').pop();
        actions.appendChild(viewLink);
        actions.appendChild(downloadLink);
      } else if (item.id === 9) {
        const proposalLink = document.createElement('a');
        proposalLink.href = '#propuesta';
        proposalLink.className = 'btn btn-sm btn-primary';
        proposalLink.textContent = 'Ver propuesta';
        actions.appendChild(proposalLink);
      } else {
        actions.appendChild(viewLink);
      }

      body.appendChild(top);
      body.appendChild(title);
      body.appendChild(description);
      body.appendChild(meta);
      body.appendChild(actions);
      card.appendChild(body);
      col.appendChild(card);
      deliverablesList.appendChild(col);
    });
  }

  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.dataset.filter;
      filterButtons.forEach(button => {
        const isActive = button === btn;
        button.classList.toggle('active', isActive);
        button.classList.toggle('btn-outline-secondary', !isActive);
        button.setAttribute('aria-pressed', String(isActive));
      });
      renderDeliverables(selected);
    });
  });

  renderDeliverables('all');

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
