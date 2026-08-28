import { spatialTransform } from './spatial.js';

const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
const search = document.querySelector('#global-search');
const results = document.querySelector('#search-results');
const searchAction = document.querySelector('#search-action');
const nav = document.querySelector('.navlinks');
const menu = document.querySelector('.menu');
const items = [...document.querySelectorAll('a[href], .feature-card, .semester')].filter((item) => !item.closest('header'));
const searchable = (item) => `${item.dataset.search || ''} ${item.textContent || ''}`.replace(/\s+/g, ' ').trim();

function renderSearchResults(matches) {
  results.replaceChildren();
  if (!matches.length) {
    const p = document.createElement('p');
    p.textContent = 'No indexed result. Try a subject, semester, topic, PYQ, or note.';
    results.append(p);
    return;
  }
  for (const item of matches) {
    const link = document.createElement('a');
    const strong = document.createElement('strong');
    const meta = document.createElement('span');
    link.href = item.getAttribute('href') || '#';
    strong.textContent = item.dataset.search || item.querySelector('h2,h3')?.textContent?.trim() || searchable(item).slice(0, 60);
    meta.textContent = item.textContent.trim();
    link.append(strong, meta);
    results.append(link);
  }
}

function runSearch() {
  const query = (search?.value || '').trim().toLowerCase();
  if (!results) return;
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
  const open = nav?.classList.toggle('open');
  menu.setAttribute('aria-expanded', open ? 'true' : 'false');
});
document.querySelectorAll('a[href^="#"]').forEach((anchor) => anchor.addEventListener('click', () => nav?.classList.remove('open')));

function setupPageTransitions() {
  if (reduceMotion) return;
  document.addEventListener('click', (event) => {
    const anchor = event.target.closest?.('a[href]');
    if (!anchor || event.defaultPrevented) return;
    if (anchor.target === '_blank' || anchor.hasAttribute('download')) return;
    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin || url.pathname === window.location.pathname && url.hash) return;
    if (!url.pathname.endsWith('.html') && url.pathname !== '/' && url.pathname !== '') return;
    event.preventDefault();
    document.body.classList.add('page-exit');
    window.setTimeout(() => { window.location.href = url.href; }, 230);
  });
}
setupPageTransitions();

const world = document.querySelector('#bytecore-world');
const spatial = world?.querySelector('[data-spatial-world]');
if (spatial && !reduceMotion) {
  const apply = (x, y) => {
    const transform = spatialTransform(x, y);
    spatial.style.transform = `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) translate3d(${transform.translateX}px,${transform.translateY}px,0)`;
  };
  const reset = () => apply(0.5, 0.5);
  const move = (clientX, clientY) => {
    const rect = spatial.parentElement.getBoundingClientRect();
    if (rect.width && rect.height) apply((clientX - rect.left) / rect.width, (clientY - rect.top) / rect.height);
  };
  spatial.addEventListener('pointermove', (event) => move(event.clientX, event.clientY));
  spatial.addEventListener('pointerleave', reset);
  spatial.addEventListener('pointercancel', reset);
}

const sections = [...document.querySelectorAll('.section')];
if ('IntersectionObserver' in window && !reduceMotion) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (entry.isIntersecting) entry.target.classList.add('is-visible');
  }), { threshold: 0.14, rootMargin: '0px 0px -8% 0px' });
  sections.forEach((section) => observer.observe(section));
} else {
  sections.forEach((section) => section.classList.add('is-visible'));
}

(async () => {
  if (!world || reduceMotion || !window.WebGLRenderingContext) return;
  try {
    const { initByteCoreWorld } = await import('./three-world.js');
    initByteCoreWorld(world);
  } catch (error) {
    world.dataset.threeFallback = 'true';
    console.info('ByteCore 3D runtime unavailable; CSS world retained.', error?.message || error);
  }
})();
