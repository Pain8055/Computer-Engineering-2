import { spatialDepth, spatialTransform } from './spatial.js';

const search = document.querySelector('#global-search');
const results = document.querySelector('#search-results');
const nav = document.querySelector('.navlinks');
const menu = document.querySelector('.menu');
const items = [...document.querySelectorAll('[data-search]')];

function runSearch() {
  const q = (search?.value || '').trim().toLowerCase();
  if (!results) return;
  if (!q) { results.hidden = true; return; }
  const matches = items.filter((x) => x.dataset.search.toLowerCase().includes(q)).slice(0, 8);
  results.innerHTML = matches.length
    ? matches.map((x) => `<a href="${x.getAttribute('href') || '#'}"><strong>${x.dataset.search}</strong><span>${x.textContent.trim()}</span></a>`).join('')
    : '<p>No indexed result. Try a subject, semester, topic, PYQ, or note.</p>';
  results.hidden = false;
}

search?.addEventListener('input', runSearch);
search?.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { search.value = ''; runSearch(); search.blur(); }
});
menu?.addEventListener('click', () => nav?.classList.toggle('open'));
document.querySelectorAll('a[href^="#"]').forEach((anchor) => anchor.addEventListener('click', () => nav?.classList.remove('open')));

const world = document.querySelector('[data-spatial-world]');
const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

function loadSpatialStyles() {
  if (document.querySelector('link[data-bytecore-spatial]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = './styles/bytecore-spatial.css?v=2';
  link.dataset.bytecoreSpatial = 'true';
  document.head.appendChild(link);
}

function buildSpatialWorld() {
  if (!world || world.dataset.enhanced) return;
  loadSpatialStyles();
  world.dataset.enhanced = 'true';
  const labels = ['SYLLABUS','SUBJECTS','UNITS','TOPICS','NOTES','PRACTICE','PYQs','TUTOR'];
  labels.forEach((label, index) => {
    const depth = spatialDepth(index, labels.length);
    const node = document.createElement('span');
    node.className = 'spatial-node';
    node.dataset.depth = Math.abs(depth.z) > 40 ? 'high' : 'normal';
    node.textContent = label;
    node.style.transform = `translate3d(${depth.x}%,${depth.y}%,${depth.z}px)`;
    node.style.setProperty('--x', `${depth.x}%`);
    node.style.setProperty('--y', `${depth.y}%`);
    world.appendChild(node);
  });
  ['a','b'].forEach((kind) => {
    const orbit = document.createElement('span');
    orbit.className = `spatial-orbit ${kind}`;
    orbit.setAttribute('aria-hidden','true');
    world.appendChild(orbit);
  });
  const caption = document.createElement('span');
  caption.className = 'spatial-caption';
  caption.textContent = 'CURRICULUM GRAPH · LIVE SPATIAL VIEW';
  world.appendChild(caption);
}

if (world) {
  buildSpatialWorld();
  if (!reduce) {
    let frame = 0;
    const apply = (x, y) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const t = spatialTransform(x, y);
        world.style.transform = `rotateX(${t.rotateX}deg) rotateY(${t.rotateY}deg) translate3d(${t.translateX}px,${t.translateY}px,0)`;
      });
    };
    const reset = () => apply(.5, .5);
    const move = (clientX, clientY) => {
      const rect = world.parentElement.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      apply((clientX - rect.left) / rect.width, (clientY - rect.top) / rect.height);
    };
    world.addEventListener('pointermove', (event) => move(event.clientX, event.clientY));
    world.addEventListener('pointerleave', reset);
    world.addEventListener('pointercancel', reset);
    world.addEventListener('touchmove', (event) => { const touch = event.touches[0]; if (touch) move(touch.clientX, touch.clientY); }, { passive: true });
    world.addEventListener('touchend', reset, { passive: true });
  }
}
