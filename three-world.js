import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { academicNode, cameraMotion, qualityProfile } from './three-world-core.js';

const LABELS = ['SYLLABUS', 'SUBJECTS', 'UNITS', 'TOPICS', 'NOTES', 'PRACTICE', 'PYQs', 'TUTOR', 'WORKSPACE'];

function makeMaterial(color, roughness = 0.22, metalness = 0.55, opacity = 1) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness,
    metalness,
    transmission: opacity < 1 ? 0.35 : 0,
    transparent: opacity < 1,
    opacity,
    clearcoat: 0.8,
    clearcoatRoughness: 0.14
  });
}

function createCore() {
  const group = new THREE.Group();
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.08, 2), makeMaterial('#E5F985', 0.14, 0.72));
  const inner = new THREE.Mesh(new THREE.OctahedronGeometry(0.58, 1), makeMaterial('#82AF38', 0.08, 0.65));
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.32, 0.018, 12, 96), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.72 }));
  ring.rotation.x = Math.PI * 0.42;
  group.add(shell, inner, ring);
  return group;
}

export function initByteCoreWorld(root, options = {}) {
  if (!root || !root.ownerDocument) return { destroy() {} };
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const profile = qualityProfile(window.innerWidth, reduced);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#82AF38', 0.055);
  const camera = new THREE.PerspectiveCamera(profile.mobile ? 32 : 26, 1, 0.1, 100);
  camera.position.set(0, 0.15, profile.mobile ? 8.6 : 7.4);

  const renderer = new THREE.WebGLRenderer({ antialias: !profile.mobile, alpha: true, powerPreference: profile.mobile ? 'default' : 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, profile.pixelRatio));
  renderer.setClearColor('#82AF38', 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;';
  root.replaceChildren(renderer.domElement);

  scene.add(new THREE.HemisphereLight('#ffffff', '#315b20', 2.6));
  const key = new THREE.DirectionalLight('#ffffff', 4.2);
  key.position.set(4, 5, 6);
  scene.add(key);
  const fill = new THREE.PointLight('#E5F985', 8, 14);
  fill.position.set(-3, -1, 4);
  scene.add(fill);

  const world = new THREE.Group();
  scene.add(world);
  const core = createCore();
  world.add(core);

  const satellites = [];
  const count = profile.satellites;
  for (let i = 0; i < count; i += 1) {
    const p = academicNode(i, count);
    const group = new THREE.Group();
    group.position.set(p.x, p.y, p.z);
    const size = i % 3 === 0 ? 0.27 : 0.19;
    const geometry = i % 3 === 0 ? new THREE.IcosahedronGeometry(size, 1) : new THREE.SphereGeometry(size, 18, 18);
    const mesh = new THREE.Mesh(geometry, makeMaterial(i % 2 ? '#ffffff' : '#E5F985', i % 2 ? 0.18 : 0.12, 0.35, i % 4 === 0 ? 0.82 : 1));
    group.add(mesh);
    satellites.push({ group, mesh, phase: i * 0.73, label: LABELS[i] });
    world.add(group);
  }

  const lineMaterial = new THREE.LineBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.25 });
  satellites.forEach((satellite) => {
    const points = [new THREE.Vector3(0, 0, 0), satellite.group.position.clone()];
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMaterial);
    world.add(line);
  });

  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, down: false, lastX: 0, lastY: 0 };
  const onPointerMove = (event) => {
    if (pointer.down) {
      pointer.targetY += (event.clientX - pointer.lastX) * 0.006;
      pointer.targetX += (event.clientY - pointer.lastY) * 0.006;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      return;
    }
    const rect = root.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    const motion = cameraMotion(x, y, profile.mobile);
    pointer.targetX = motion.x * Math.PI / 18;
    pointer.targetY = motion.y * Math.PI / 18;
  };
  const onPointerDown = (event) => { pointer.down = true; pointer.lastX = event.clientX; pointer.lastY = event.clientY; root.setPointerCapture?.(event.pointerId); };
  const onPointerUp = (event) => { pointer.down = false; root.releasePointerCapture?.(event.pointerId); };
  const onPointerLeave = () => { if (!pointer.down) { pointer.targetX = 0; pointer.targetY = 0; } };
  root.addEventListener('pointermove', onPointerMove);
  root.addEventListener('pointerdown', onPointerDown);
  root.addEventListener('pointerup', onPointerUp);
  root.addEventListener('pointercancel', onPointerUp);
  root.addEventListener('pointerleave', onPointerLeave);

  const resize = () => {
    const width = Math.max(1, root.clientWidth);
    const height = Math.max(1, root.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(root);
  resize();

  const clock = new THREE.Clock();
  let frame = 0;
  const animate = () => {
    frame = requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    pointer.x += (pointer.targetX - pointer.x) * 0.055;
    pointer.y += (pointer.targetY - pointer.y) * 0.055;
    world.rotation.x = pointer.x + (profile.animate ? Math.sin(t * 0.18) * 0.035 : 0);
    world.rotation.y = pointer.y + (profile.animate ? t * 0.045 : 0);
    core.rotation.x = profile.animate ? t * 0.11 : 0;
    core.rotation.y = profile.animate ? t * 0.16 : 0;
    satellites.forEach((satellite, i) => {
      if (!profile.animate) return;
      const s = Math.sin(t * 0.55 + satellite.phase);
      satellite.mesh.position.y = s * 0.055;
      satellite.mesh.rotation.x = t * (0.16 + i * 0.008);
      satellite.mesh.rotation.y = t * (0.2 + i * 0.01);
    });
    renderer.render(scene, camera);
  };
  animate();

  return {
    destroy() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointerup', onPointerUp);
      root.removeEventListener('pointercancel', onPointerUp);
      root.removeEventListener('pointerleave', onPointerLeave);
      renderer.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => material.dispose());
        }
      });
    }
  };
}
