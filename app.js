import { spatialTransform } from './spatial.js';

const search = document.querySelector('#global-search');
const results = document.querySelector('#search-results');
const nav = document.querySelector('.navlinks');
const menu = document.querySelector('.menu');
const items = [...document.querySelectorAll('[data-search]')];

function renderSearchResults(matches) {
  results.replaceChildren();

  if (!matches.length) {
    const message = document.createElement('p');
    message.textContent = 'No indexed result. Try a subject, semester, topic, PYQ, or note.';
    results.append(message);
    return;
  }

  for (const item of matches) {
    const link = document.createElement('a');
    const strong = document.createElement('strong');
    const meta = document.createElement('span');
    const href = item.getAttribute('href') || '#';

    link.href = href;
    strong.textContent = item.dataset.search || '';
    meta.textContent = item.textContent.trim();
    link.append(strong, meta);
    results.append(link);
  }
}

function runSearch() {
  const q = (search?.value || '').trim().toLowerCase();
  if (!results) return;
  if (!q) { results.hidden = true; results.replaceChildren(); return; }
  const matches = items.filter((x) => x.dataset.search.toLowerCase().includes(q)).slice(0, 8);
  renderSearchResults(matches);
  results.hidden = false;
}

search?.addEventListener('input', runSearch);
search?.addEventListener('keydown', (event) => { if (event.key === 'Escape') { search.value = ''; runSearch(); search.blur(); } });
menu?.addEventListener('click', () => nav?.classList.toggle('open'));
document.querySelectorAll('a[href^="#"]').forEach((anchor) => anchor.addEventListener('click', () => nav?.classList.remove('open')));

const world = document.querySelector('#bytecore-world');
const spatial = world?.querySelector('[data-spatial-world]');
const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

if (spatial && !reduce) {
  const apply = (x, y) => {
    const transform = spatialTransform(x, y);
    spatial.style.transform = `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) translate3d(${transform.translateX}px,${transform.translateY}px,0)`;
  };
  const reset = () => apply(.5, .5);
  const move = (clientX, clientY) => {
    const rect = spatial.parentElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    apply((clientX - rect.left) / rect.width, (clientY - rect.top) / rect.height);
  };
  spatial.addEventListener('pointermove', (event) => move(event.clientX, event.clientY));
  spatial.addEventListener('pointerleave', reset);
  spatial.addEventListener('pointercancel', reset);
  spatial.addEventListener('touchmove', (event) => { const touch = event.touches[0]; if (touch) move(touch.clientX, touch.clientY); }, { passive: true });
  spatial.addEventListener('touchend', reset, { passive: true });
}

(async () => {
  if (!world || reduce || !window.WebGLRenderingContext) return;
  try {
    const { initByteCoreWorld } = await import('./three-world.js');
    initByteCoreWorld(world);
  } catch (error) {
    world.dataset.threeFallback = 'true';
    console.info('ByteCore 3D runtime unavailable; CSS world retained.', error?.message || error);
  }
})();
