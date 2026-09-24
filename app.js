(() => {
  const content = window.PORTFOLIO_CONTENT;
  const app = document.querySelector('#app');
  const navLinks = [...document.querySelectorAll('.site-header nav a')];

  const imageUrl = (key) => content.images[key];
  function routePath() {
    const raw = window.location.hash.slice(1) || '/';
    return raw.length > 1 ? raw.replace(/\/+$/, '') : raw;
  }

  function projectTitle(project) {
    if (project.slug === 'marbella') return 'Senior Living<br>Marbella';
    if (project.slug === 'castellana-a-b') return 'Castellana<br>A + B';
    return project.title;
  }

  function homeProject(project, index) {
    const layouts = ['image-left', 'image-right'];
    return `
      <article class="home-project home-project--${layouts[index % layouts.length]} reveal">
        <div class="home-project__meta">
          <span class="project-number" aria-hidden="true"></span>
          <div>
            <h2>${projectTitle(project)}</h2>
            <p class="project-location">${project.location}</p>
          </div>
          <p class="project-type">${project.subtitle}</p>
          <a class="project-link" href="#/projects/${project.slug}">VER PROYECTO <span aria-hidden="true">↗</span></a>
        </div>
        <a class="home-project__image" href="#/projects/${project.slug}" aria-label="Ver proyecto ${project.title}">
          <img src="${imageUrl(project.cover)}" alt="${project.coverLabel} — ${project.title}" loading="${index < 2 ? 'eager' : 'lazy'}">
        </a>
      </article>`;
  }

  function homeView() {
    return `
      <section class="home-hero" aria-labelledby="home-title">
        <p class="ui-label">ARQUITECTO · SEVILLA</p>
        <h1 id="home-title">Del lugar a la materia.<br>De la idea al detalle.</h1>
        <p class="home-disciplines">ARQUITECTURA · DESARROLLO TÉCNICO · BIM</p>
      </section>
      <section class="home-projects" aria-label="Proyectos seleccionados">
        ${content.projects.map(homeProject).join('')}
      </section>
      <footer class="site-footer"><span>JAIME POLAINA · ARQUITECTO</span><a href="#/contact">CONTACTO ↗</a></footer>`;
  }

  function figure(key, label, className = '') {
    const caption = label ? `<figcaption>${label}</figcaption>` : '';
    return `<figure class="story-figure ${className}"><img src="${imageUrl(key)}" alt="${label || key}" loading="lazy">${caption}</figure>`;
  }

  function textBlock(number, title, text) {
    return `<div class="story-copy"><span class="story-number" aria-hidden="true"></span><h2>${title}</h2><p>${text}</p></div>`;
  }

  function bilbaoStory() {
    return `
      <section class="story-split story-split--copy-left reveal">
        ${textBlock('01.01', 'Preexistencia<br>y contexto', 'La intervención parte de la conservación de la fachada y del volumen de la antigua fábrica. El interior se reorganiza para introducir el nuevo programa residencial y la ampliación se sitúa sobre la cornisa existente mediante dos plantas retranqueadas.')}
        ${figure('bilbaoDiagram', '', 'story-figure--drawing')}
        ${figure('bilbaoPark', 'VISTA DESDE EL PARQUE', 'story-figure--park-below')}
        <div class="story-copy story-copy--park-text"><p>Desde el parque, la fachada conservada continúa definiendo la presencia urbana del edificio. Las plantas añadidas se retranquean para reducir su impacto y mantener la lectura del volumen industrial original.</p></div>
      </section>
      <section class="story-plan reveal">
        <header><span class="story-number" aria-hidden="true"></span><h2>Organización residencial</h2><p>Cinco portales · 144 viviendas · patios interiores</p></header>
        ${figure('bilbaoPlan01', 'PLANTA PRIMERA A TERCERA', 'story-figure--drawing')}
      </section>
      <section class="story-duo reveal">
        ${figure('bilbaoSection', 'SECCIÓN LONGITUDINAL', 'story-figure--drawing')}
        ${figure('bilbaoCrossSection', 'SECCIÓN TRANSVERSAL', 'story-figure--drawing')}
      </section>
      <section class="story-split story-split--image-left reveal">
        ${figure('bilbaoDetail', 'DETALLE DE FACHADA', 'story-figure--drawing story-figure--portrait')}
        ${textBlock('01.03', 'De la escala urbana<br>al detalle', 'El desarrollo coordina fachada, ampliación y encuentros constructivos dentro de un único modelo BIM, trasladando las decisiones arquitectónicas a la documentación de ejecución.')}
      </section>
      <section class="story-split story-split--copy-left reveal">
        ${textBlock('01.04', 'Desarrollo técnico<br>y BIM', 'Participación en el modelado Revit, plantas, tipologías, secciones, fachadas, detalles, normativa y documentación de Proyecto Básico y Proyecto de Ejecución.')}
        ${figure('bilbaoPbPe', 'DOCUMENTACIÓN PB + PE', 'story-figure--drawing')}
      </section>`;
  }

  function marbellaStory() {
    return `
      <section class="story-plan reveal">
        <header><span class="story-number" aria-hidden="true"></span><h2>Implantación y escala</h2><p>12 edificios · cerca de 300 alojamientos · 50.000 m²</p></header>
        ${figure('marbellaSitePlan', 'PLANTA GENERAL', 'story-figure--drawing')}
      </section>
      <section class="story-split story-split--image-left reveal">
        ${figure('marbellaBuilding', 'EDIFICIO TIPO')}
        ${textBlock('02.02', 'Un sistema<br>residencial', 'La implantación articula edificios residenciales, espacios asistenciales y zonas comunes dentro de un conjunto de gran escala vinculado al paisaje.')}
      </section>
      <section class="story-split story-split--copy-left reveal">
        ${textBlock('02.03', 'Modelo BIM<br>coordinado', 'El modelo organiza plantas, tipologías, secciones, fachadas y documentación de las fases de Proyecto Básico y Proyecto de Ejecución.')}
        ${figure('marbellaBim', 'MODELO BIM', 'story-figure--drawing')}
      </section>
      <section class="story-duo story-duo--plans reveal">
        ${figure('marbellaGround123', 'PLANTA BAJA · BLOQUES 1, 2 Y 3', 'story-figure--drawing')}
        ${figure('marbellaTypologies', 'PLANTA TIPO · TIPOLOGÍAS', 'story-figure--drawing')}
      </section>
      <section class="story-plan reveal">
        <header><span class="story-number" aria-hidden="true"></span><h2>Zonas comunes</h2><p>Salud · rehabilitación · deporte · convivencia</p></header>
        ${figure('marbellaCommon123', 'ZONAS COMUNES · BLOQUES 1, 2 Y 3', 'story-figure--drawing')}
      </section>`;
  }

  function cedacerosStory() {
    return `
      <section class="story-split story-split--copy-left reveal">
        ${textBlock('03.01', 'Zonas comunes<br>como interior urbano', 'La planta baja reúne acceso, estancia y servicios en una secuencia continua. Materialidad, iluminación y mobiliario fijo se desarrollan como una única estrategia de proyecto.')}
        ${figure('cedacerosCommonAreas', 'ZONAS COMUNES · PLANTA BAJA')}
      </section>
      <section class="story-plan reveal">
        <header><span class="story-number" aria-hidden="true"></span><h2>Organización de planta baja</h2><p>Acceso · recepción · zonas comunes · 22 viviendas</p></header>
        ${figure('cedacerosGroundPlan', 'PLANTA BAJA', 'story-figure--drawing')}
      </section>
      <section class="story-split story-split--image-left reveal">
        ${figure('cedacerosDetail', 'DETALLE · BARRA Y COPERO', 'story-figure--drawing story-figure--portrait')}
        ${textBlock('03.03', 'Mobiliario<br>a medida', 'La barra y el copero se definen desde la composición general hasta sus encuentros, materiales y documentación para fabricación, en contacto directo con industriales y taller.')}
      </section>
      <section class="story-duo reveal">
        ${figure('cedacerosLiving2dA', 'VIVIENDA TIPO 2dA · SALÓN')}
        ${figure('cedacerosPlan2dA', 'VIVIENDA TIPO 2dA · PLANTA', 'story-figure--drawing')}
      </section>
      <section class="story-duo reveal">
        ${figure('cedacerosLiving2dB', 'VIVIENDA TIPO 2dB · SALÓN')}
        ${figure('cedacerosPlan2dB', 'VIVIENDA TIPO 2dB · PLANTA', 'story-figure--drawing')}
      </section>`;
  }

  function castellanaStory() {
    return `
      <section class="story-split story-split--copy-left reveal">
        ${textBlock('04.01', 'Castellana A', 'Una organización fluida enlaza las estancias mediante geometrías curvas, celosías, revestimientos de madera y elementos integrados.')}
        ${figure('castellanaLivingCompleteA', 'CASTELLANA A · SALÓN')}
      </section>
      <section class="story-duo story-duo--plans reveal">
        ${figure('castellanaPreviousA', 'CASTELLANA A · ESTADO PREVIO', 'story-figure--drawing')}
        ${figure('castellanaReformedA', 'CASTELLANA A · ESTADO REFORMADO', 'story-figure--drawing')}
      </section>
      <section class="story-split story-split--image-left reveal">
        ${figure('castellanaBathA', 'CASTELLANA A · BAÑO')}
        ${textBlock('04.02', 'Materia, mobiliario<br>y encuentros', 'El desarrollo alcanza plantas de acabados, detalles constructivos y mobiliario a medida para dar continuidad a la propuesta espacial.')}
      </section>
      <section class="story-split story-split--copy-left reveal">
        ${textBlock('04.03', 'Castellana B', 'La segunda vivienda adopta un lenguaje más contenido y ortogonal. Madera, boiseries y carpinterías acompañan la escala longitudinal de la casa.')}
        ${figure('castellanaLivingB', 'CASTELLANA B · SALÓN')}
      </section>
      <section class="story-duo story-duo--plans reveal">
        ${figure('castellanaPreviousB', 'CASTELLANA B · ESTADO PREVIO', 'story-figure--drawing')}
        ${figure('castellanaReformedB', 'CASTELLANA B · ESTADO REFORMADO', 'story-figure--drawing')}
      </section>`;
  }

  function projectStory(project) {
    if (project.slug === 'bilbao') return bilbaoStory();
    if (project.slug === 'marbella') return marbellaStory();
    if (project.slug === 'cedaceros-9') return cedacerosStory();
    return castellanaStory();
  }

  function projectView(project) {
    const current = content.projects.findIndex((item) => item.slug === project.slug);
    const next = content.projects[(current + 1) % content.projects.length];
    return `
      <a href="#/" class="back-link"><span aria-hidden="true">←</span> ÍNDICE</a>
      <header class="project-intro">
        <div class="project-intro__title">
          <p class="ui-label">PROYECTO</p>
          <h1>${projectTitle(project)}</h1>
          <p class="project-intro__location">${project.location}</p>
        </div>
        <div class="project-intro__summary">
          <p class="project-intro__lead">${project.description.split('. ')[0]}.</p>
          <dl>${project.facts.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>
        </div>
      </header>
      ${figure(project.cover, project.coverLabel, 'project-hero')}
      <div class="project-story">${projectStory(project)}</div>
      <section class="project-role reveal">
        <span class="story-number" aria-hidden="true"></span>
        <h2>Participación<br>profesional</h2>
        <p>${project.action}</p>
      </section>
      <nav class="next-project" aria-label="Siguiente proyecto">
        <p>SIGUIENTE PROYECTO</p>
        <a href="#/projects/${next.slug}"><span aria-hidden="true"></span>${next.title}<i aria-hidden="true">↗</i></a>
      </nav>`;
  }

  function contactView() {
    return `
      <header class="contact-heading"><p class="ui-label">CONTACTO</p><h1>Hablemos.</h1></header>
      <section class="contact-layout">
        <figure class="contact-portrait"><img src="${content.images.contact}" alt="Retrato de Jaime Polaina"></figure>
        <div class="contact-panel">
          <p class="contact-intro">Si crees que mi perfil puede encajar en tu equipo, estaré encantado de hablar.</p>
          <div class="contact-details">
            <div class="contact-item"><span>EMAIL</span><a href="mailto:${content.profile.email}">${content.profile.email}</a></div>
            <div class="contact-item"><span>TELÉFONO</span><a href="tel:+34662695066">${content.profile.phone}</a></div>
            <div class="contact-item"><span>UBICACIÓN</span><p>${content.profile.location}</p></div>
          </div>
        </div>
      </section>`;
  }

  function cvView() {
    const experience = content.cv.experience.map((entry) => `
      <article class="cv-entry"><span class="cv-entry-index" aria-hidden="true"></span><div class="cv-entry-body">
        <header class="cv-entry-header"><h3>${entry.company}<span>${entry.role}</span></h3><p>${entry.period}<br>${entry.location}</p></header>
        <div class="cv-entry-copy">${entry.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('')}</div>
      </div></article>`).join('');
    const education = content.cv.education.map((entry) => `
      <article class="cv-education-entry"><div><h3>${entry.title}</h3><p class="cv-education-meta">${entry.institution} · ${entry.period}</p></div>${entry.description ? `<p>${entry.description}</p>` : ''}</article>`).join('');
    const software = content.cv.software.map((entry) => `<div class="cv-software-group"><h3>${entry.level}</h3><p>${entry.tools}</p></div>`).join('');
    return `
      <header class="page-heading page-heading--text"><div><p class="ui-label">CURRICULUM VITAE</p><h1>Formación<br>y experiencia</h1></div><p class="page-note">JAIME POLAINA<br>ARQUITECTO</p></header>
      <section class="cv-section"><header class="cv-section-heading"><span aria-hidden="true"></span><h2>Formación académica</h2></header><div>${education}</div></section>
      <section class="cv-section"><header class="cv-section-heading"><span aria-hidden="true"></span><h2>Software</h2></header><div class="cv-software-grid">${software}</div></section>
      <section class="cv-section"><header class="cv-section-heading"><span aria-hidden="true"></span><h2>Experiencia profesional</h2></header><div>${experience}</div></section>`;
  }

  function notFoundView() {
    return `<section class="not-found"><p class="ui-label">404</p><h1>Página no encontrada</h1><a href="#/">Volver al inicio →</a></section>`;
  }

  function updateNavigation(path) {
    navLinks.forEach((link) => {
      const destination = link.getAttribute('href').slice(1);
      const active = path === destination;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function wireReveals() {
    const items = [...document.querySelectorAll('.reveal')];
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      items.forEach((item) => item.classList.add('is-visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
  }

  function render() {
    const path = routePath();
    let html;
    let pageClass;
    let project;
    if (path === '/' || path === '/projects') {
      html = homeView();
      pageClass = 'home-page';
    } else if (path.startsWith('/projects/')) {
      project = content.projects.find((item) => item.slug === path.split('/')[2]);
      html = project ? projectView(project) : notFoundView();
      pageClass = project ? 'project-page' : 'text-page';
    } else if (path === '/contact') {
      html = contactView();
      pageClass = 'text-page contact-page';
    } else if (path === '/cv') {
      html = cvView();
      pageClass = 'text-page cv-page';
    } else {
      html = notFoundView();
      pageClass = 'text-page';
    }
    app.className = pageClass;
    app.innerHTML = html;
    updateNavigation(path);
    wireReveals();
    document.title = path === '/' ? 'Jaime Polaina — Arquitectura' : `${project?.title ?? path.slice(1).toUpperCase()} — Jaime Polaina`;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  window.addEventListener('hashchange', render);
  render();
})();
