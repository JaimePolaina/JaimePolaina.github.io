(() => {
  const content = window.PORTFOLIO_CONTENT;
  const app = document.querySelector('#app');
  const navLinks = [...document.querySelectorAll('.site-header nav a')];

  const imageUrl = (key) => content.images[key];

  function routePath() {
    const raw = window.location.hash.slice(1) || '/';
    return raw.length > 1 ? raw.replace(/\/+$/, '') : raw;
  }

  function homeView() {
    return `
      <div class="home-index" aria-hidden="true">
        <span>ARQ.</span><span>SEVILLA</span>
      </div>
      <section class="home-intro" aria-labelledby="home-title">
        <div class="home-name">
          <p class="eyebrow">${content.profile.role.toUpperCase()}</p>
          <h1 id="home-title">Jaime<br>Polaina</h1>
        </div>
        <div class="home-copy">
          <p class="home-statement">Del lugar a la materia.<br>De la idea al detalle.</p>
          <p class="home-services">OBRA NUEVA <i>/</i> REHABILITACIÓN <i>/</i> INTERIORISMO</p>
        </div>
      </section>
      <div class="home-footnote">
        <span class="home-arrow" aria-hidden="true">↓</span><span>PORTFOLIO</span>
      </div>`;
  }

  function projectsView() {
    const cards = content.projects.map((project, index) => `
      <article class="project-card ${index % 3 === 1 ? 'project-card--tall' : ''}">
        <a href="#/projects/${project.slug}" aria-label="Abrir proyecto ${project.title}">
          <figure class="project-cover">
            <img src="${imageUrl(project.cover)}" alt="Imagen provisional del proyecto ${project.title}" loading="${index < 2 ? 'eager' : 'lazy'}">
            <figcaption>IMAGEN PROVISIONAL</figcaption>
          </figure>
          <div class="project-card-meta">
            <span>${project.number}</span>
            <h2>${project.title}</h2>
            <p>${project.subtitle}</p>
            <span>${project.year}</span>
          </div>
        </a>
      </article>`).join('');

    return `
      <header class="page-heading">
        <div><p class="eyebrow">OBRA SELECCIONADA</p><h1>Projects</h1></div>
        <p class="page-note">${content.projects.length} PROYECTOS / CONTENIDO PROVISIONAL<br>TEXTOS E IMÁGENES EDITABLES</p>
      </header>
      <section class="project-grid" aria-label="Listado de proyectos">${cards}</section>
      <footer class="page-footer"><span>JAIME POLAINA ARQUITECTURA</span><a href="#/">VOLVER AL INICIO ↑</a></footer>`;
  }

  function projectView(project) {
    const thumbnails = project.gallery.map((key, index) => `
      <button class="thumb ${index === 0 ? 'is-active' : ''}" data-slide="${index}" aria-label="Ver imagen ${index + 1}" aria-pressed="${index === 0}">
        <img src="${imageUrl(key)}" alt="Miniatura ${index + 1} de ${project.title}">
        <span>0${index + 1}</span>
      </button>`).join('');

    return `
      <a href="#/projects" class="back-link"><span aria-hidden="true">←</span> PROJECTS</a>
      <header class="project-heading">
        <div><p class="eyebrow">${project.number} / ${project.year}</p><h1>${project.title}</h1></div>
        <p>${project.subtitle}<br>${project.location}</p>
      </header>
      <section class="carousel" aria-label="Galería de ${project.title}" data-project="${project.slug}">
        <div class="carousel-stage">
          <img class="carousel-image" src="${imageUrl(project.gallery[0])}" alt="Imagen provisional 1 de ${project.title}">
          <button class="carousel-arrow carousel-arrow--prev" data-direction="-1" aria-label="Imagen anterior"><span aria-hidden="true">←</span></button>
          <button class="carousel-arrow carousel-arrow--next" data-direction="1" aria-label="Imagen siguiente"><span aria-hidden="true">→</span></button>
          <div class="image-label">IMAGEN PROVISIONAL <span class="slide-count">01 / ${String(project.gallery.length).padStart(2, '0')}</span></div>
        </div>
        <div class="thumbnail-row">${thumbnails}</div>
      </section>
      <section class="project-copy" aria-label="Información del proyecto">
        <article><p class="section-label">DESCRIPCIÓN</p><p class="copy-lead">${project.description}</p></article>
        <article><p class="section-label">MI ACTUACIÓN</p><p>${project.action}</p></article>
        <article>
          <p class="section-label">INFORMACIÓN</p>
          <dl class="project-facts">
            <div><dt>Localización</dt><dd>${project.location}</dd></div>
            <div><dt>Año</dt><dd>${project.year}</dd></div>
            <div><dt>Estado</dt><dd>${project.status}</dd></div>
            <div><dt>Superficie</dt><dd>${project.area}</dd></div>
            <div><dt>Participación</dt><dd>${project.role}</dd></div>
          </dl>
        </article>
      </section>
      <nav class="project-pagination" aria-label="Otros proyectos">
        ${projectPagination(project)}
      </nav>`;
  }

  function projectPagination(project) {
    const current = content.projects.findIndex((item) => item.slug === project.slug);
    const previous = content.projects[(current - 1 + content.projects.length) % content.projects.length];
    const next = content.projects[(current + 1) % content.projects.length];
    return `<a href="#/projects/${previous.slug}">← ${previous.title}</a><a href="#/projects/${next.slug}">${next.title} →</a>`;
  }

  function aboutView() {
    return `
      <header class="page-heading page-heading--text">
        <div><p class="eyebrow">PERFIL / PROVISIONAL</p><h1>About</h1></div>
        <p class="page-note">ARQUITECTURA, MATERIA<br>Y CONTINUIDAD</p>
      </header>
      <section class="about-layout">
        <p class="about-kicker">Una práctica independiente entre la ciudad y el paisaje.</p>
        <div class="about-copy">${content.profile.about.map((paragraph) => `<p>${paragraph}</p>`).join('')}<p class="placeholder-copy">Biografía, reconocimientos y fotografía de estudio pendientes de completar.</p></div>
        <div class="about-mark" aria-hidden="true"><span>JP</span><i></i></div>
      </section>`;
  }

  function contactView() {
    return `
      <header class="page-heading page-heading--text">
        <div><p class="eyebrow">CONTACTO / PROVISIONAL</p><h1>Contact</h1></div>
      </header>
      <section class="contact-layout">
        <p>Para proyectos, colaboraciones<br>y otras consultas:</p>
        <a href="mailto:${content.profile.email}" class="contact-link">${content.profile.email}</a>
        <div class="contact-meta"><span>${content.profile.location}</span><span>${content.profile.instagram}</span></div>
        <p class="placeholder-copy">Datos de contacto provisionales. Sustituir antes de publicar la versión definitiva.</p>
      </section>`;
  }

  function cvView() {
    const entries = content.cv.map(([date, title, place]) => `
      <div class="cv-row"><span>${date}</span><strong>${title}</strong><span>${place}</span></div>`).join('');
    return `
      <header class="page-heading page-heading--text">
        <div><p class="eyebrow">TRAYECTORIA / PROVISIONAL</p><h1>Curriculum<br>Vitae</h1></div>
        <p class="page-note">SELECCIÓN BREVE<br>DATOS POR COMPLETAR</p>
      </header>
      <section class="cv-list" aria-label="Currículum">${entries}</section>
      <p class="cv-note">Este contenido funciona como estructura editable para incorporar formación, experiencia, premios, publicaciones y exposiciones.</p>`;
  }

  function notFoundView() {
    return `<section class="not-found"><p class="eyebrow">404</p><h1>Página no encontrada</h1><a href="#/">Volver al inicio →</a></section>`;
  }

  function wireCarousel(project) {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    let current = 0;
    const stageImage = carousel.querySelector('.carousel-image');
    const counter = carousel.querySelector('.slide-count');
    const thumbs = [...carousel.querySelectorAll('.thumb')];

    const show = (nextIndex) => {
      current = (nextIndex + project.gallery.length) % project.gallery.length;
      stageImage.classList.add('is-changing');
      window.setTimeout(() => {
        stageImage.src = imageUrl(project.gallery[current]);
        stageImage.alt = `Imagen provisional ${current + 1} de ${project.title}`;
        counter.textContent = `0${current + 1} / 0${project.gallery.length}`;
        thumbs.forEach((thumb, index) => {
          const active = index === current;
          thumb.classList.toggle('is-active', active);
          thumb.setAttribute('aria-pressed', String(active));
        });
        stageImage.classList.remove('is-changing');
      }, 120);
    };

    carousel.querySelectorAll('.carousel-arrow').forEach((button) => {
      button.addEventListener('click', () => show(current + Number(button.dataset.direction)));
    });
    thumbs.forEach((button) => button.addEventListener('click', () => show(Number(button.dataset.slide))));
    document.addEventListener('keydown', function handleArrow(event) {
      if (!document.body.contains(carousel)) {
        document.removeEventListener('keydown', handleArrow);
        return;
      }
      if (event.key === 'ArrowLeft') show(current - 1);
      if (event.key === 'ArrowRight') show(current + 1);
    });
  }

  function updateNavigation(path) {
    navLinks.forEach((link) => {
      const destination = link.getAttribute('href').slice(1);
      const active = destination === '/projects' ? path.startsWith('/projects') : path === destination;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function render() {
    const path = routePath();
    let html;
    let pageClass;
    let project;

    if (path === '/') {
      html = homeView();
      pageClass = 'home-page';
    } else if (path === '/projects') {
      html = projectsView();
      pageClass = 'projects-page';
    } else if (path.startsWith('/projects/')) {
      project = content.projects.find((item) => item.slug === path.split('/')[2]);
      html = project ? projectView(project) : notFoundView();
      pageClass = project ? 'project-page' : 'text-page';
    } else if (path === '/about') {
      html = aboutView();
      pageClass = 'text-page';
    } else if (path === '/contact') {
      html = contactView();
      pageClass = 'text-page';
    } else if (path === '/cv') {
      html = cvView();
      pageClass = 'text-page';
    } else {
      html = notFoundView();
      pageClass = 'text-page';
    }

    app.className = pageClass;
    app.innerHTML = html;
    updateNavigation(path);
    if (project) wireCarousel(project);
    document.title = path === '/' ? 'Jaime Polaina — Arquitectura' : `${project?.title ?? path.slice(1).toUpperCase()} — Jaime Polaina`;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  window.addEventListener('hashchange', render);
  render();
})();
