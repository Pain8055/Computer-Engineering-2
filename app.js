const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
const search = document.querySelector('#global-search');
const results = document.querySelector('#search-results');
const searchAction = document.querySelector('#search-action');
const nav = document.querySelector('.navlinks');
const menu = document.querySelector('.menu');
const items = [...document.querySelectorAll('a[href], .feature-card, .semester')].filter((item) => !item.closest('header'));

const searchable = (item) => `${item.dataset.search || ''} ${item.textContent || ''}`.replace(/\s+/g, ' ').trim();

function renderSearchResults(matches) {
  if (!results) return;
  results.replaceChildren();
  if (!matches.length) {
    const p = document.createElement('p');
    p.textContent = 'No indexed result. Try a subject, semester, topic, PYQ, or note.';
    results.append(p);
    return;
  }
  matches.forEach((item) => {
    const link = document.createElement('a');
    const strong = document.createElement('strong');
    const meta = document.createElement('span');
    link.href = item.getAttribute('href') || '#';
    strong.textContent = item.dataset.search || item.querySelector('h2,h3')?.textContent?.trim() || searchable(item).slice(0, 60);
    meta.textContent = item.textContent.trim();
    link.append(strong, meta);
    results.append(link);
  });
}

function runSearch() {
  if (!results) return;
  const query = (search?.value || '').trim().toLowerCase();
  if (!query) {
    results.hidden = true;
    results.replaceChildren();
    return;
  }
  renderSearchResults(items.filter((item) => searchable(item).toLowerCase().includes(query)).slice(0, 8));
  results.hidden = false;
}

search?.addEventListener('input', runSearch);
search?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    search.value = '';
    runSearch();
    search.blur();
  }
  if (event.key === 'Enter') runSearch();
});
searchAction?.addEventListener('click', runSearch);
menu?.addEventListener('click', () => {
  const open = nav?.classList.toggle('open') ?? false;
  menu.setAttribute('aria-expanded', open ? 'true' : 'false');
});

document.querySelectorAll('.navlinks a, .menu + * a').forEach((link) => {
  link.addEventListener('click', () => nav?.classList.remove('open'));
});

function preparePageTransition(target) {
  if (reduceMotion || !target || target.target || target.hasAttribute?.('download')) return Promise.resolve(false);
  if (target.origin !== window.location.origin || target.href === window.location.href || target.hash) return Promise.resolve(false);
  document.body.classList.add('page-exit');
  return new Promise((resolve) => {
    window.setTimeout(() => { window.location.href = target.href; resolve(true); }, 260);
  });
}

for (const link of document.querySelectorAll('a[href]')) {
  link.addEventListener('click', (event) => {
    const href = link.href;
    if (!href || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const url = new URL(href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname === window.location.pathname && url.hash) return;
    event.preventDefault();
    preparePageTransition(link).then((handled) => { if (!handled) window.location.href = href; });
  });
}

for (const section of document.querySelectorAll('.section')) {
  if ('IntersectionObserver' in window && !reduceMotion) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .14, rootMargin: '0px 0px -8% 0px' });
    observer.observe(section);
  } else {
    section.classList.add('is-visible');
  }
}

(async () => {
  const stage = document.querySelector('[data-bytecore-3d]');
  if (!stage || reduceMotion || !window.WebGLRenderingContext) return;
  try {
    const { initByteCoreWorld } = await import('./three-world.js');
    const mode = stage.dataset.bytecore3d || 'home';
    stage.dataset.ready = 'true';
    initByteCoreWorld(stage, mode);
  } catch (error) {
    stage.dataset.threeFallback = 'true';
    console.info('ByteCore 3D runtime unavailable; CSS fallback retained.', error?.message || error);
  }
})();
