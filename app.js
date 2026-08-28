import { spatialTransform } from './spatial.js';

const search = document.querySelector('#global-search');
const results = document.querySelector('#search-results');
const nav = document.querySelector('.navlinks');
const menu = document.querySelector('.menu');
const items = [...document.querySelectorAll('[data-search]')];

function runSearch() {
  const q = (search?.value || '').trim().toLowerCase();
  if (!results) return;
  if (!q) {
    results.hidden = true;
    return;
  }
  const matches = items.filter((x) => x.dataset.search.toLowerCase().includes(q)).slice(0, 8);
  results.innerHTML = matches.length
    ? matches.map((x) => `<a href="${x.getAttribute('href') || '#'}"><strong>${x.dataset.search}</strong><span>${x.textContent.trim()}</span></a>`).join('')
    : '<p>No indexed result. Try a subject, semester, topic, PYQ, or note.</p>';
  results.hidden = false;
}

search?.addEventListener('input', runSearch);
search?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    search.value = '';
    runSearch();
    search.blur();
  }
});
menu?.addEventListener('click', () => nav?.classList.toggle('open'));
document.querySelectorAll('a[href^="#"]').forEach((anchor) => anchor.addEventListener('click', () => nav?.classList.remove('open')));

const world = document.querySelector('[data-spatial-world]');
const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

if (world && !reduce) {
  const apply = (x, y) => {
    const transform = spatialTransform(x, y);
    world.style.transform = `rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) translate3d(${transform.translateX}px,${transform.translateY}px,0)`;
  };
  const reset = () => apply(0.5, 0.5);
  const move = (clientX, clientY) => {
    const rect = world.parentElement.getBoundingClientRect();
    apply((clientX - rect.left) / rect.width, (clientY - rect.top) / rect.height);
  };

  world.addEventListener('pointermove', (event) => move(event.clientX, event.clientY));
  world.addEventListener('pointerleave', reset);
  world.addEventListener('pointercancel', reset);
  world.addEventListener('touchmove', (event) => {
    const touch = event.touches[0];
    if (touch) move(touch.clientX, touch.clientY);
  }, { passive: true });
  world.addEventListener('touchend', reset, { passive: true });
}
