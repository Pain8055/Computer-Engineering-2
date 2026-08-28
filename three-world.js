import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { academicNode, cameraMotion, interactionProfile, qualityProfile } from './three-world-core.js';

const LABELS = ['SYLLABUS', 'SUBJECTS', 'UNITS', 'TOPICS', 'NOTES', 'PRACTICE', 'PYQs', 'AI TUTOR', 'WORKSPACE'];

function material(color, options = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: options.roughness ?? 0.2,
    metalness: options.metalness ?? 0.62,
    clearcoat: options.clearcoat ?? 0.9,
    clearcoatRoughness: options.clearcoatRoughness ?? 0.12,
    emissive: options.emissive ?? color,
    emissiveIntensity: options.emissiveIntensity ?? 0.06,
    transmission: options.transmission ?? 0,
    transparent: options.transparent ?? false,
    opacity: options.opacity ?? 1
  });
}

function labelSprite(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 176;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(3, 12, 16, 0.92)';
  ctx.strokeStyle = 'rgba(139, 225, 232, 0.72)';
  ctx.lineWidth = 3;
  if (ctx.roundRect) ctx.roundRect(10, 16, 620, 124, 36);
  else ctx.rect(10, 16, 620, 124);
  ctx.fill();
  ctx.stroke();
  ctx.font = '800 44px Inter, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#F4FBFC';
  ctx.fillText(text, 320, 80);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(1.28, 0.35, 1);
  sprite.position.set(0, -0.55, 0.05);
  return sprite;
}

function createCore(detail) {
  const group = new THREE.Group();
  const segments = detail === 'high' ? 4 : 3;
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.1, segments),
    material('#2EACB9', { roughness: 0.12, metalness: 0.82, emissiveIntensity: 0.09, clearcoat: 1 })
  );
  const inner = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.58, detail === 'high' ? 3 : 2),
    material('#8BE1E8', { roughness: 0.08, metalness: 0.7, emissiveIntensity: 0.18, clearcoat: 1 })
  );
  const energy = new THREE.Mesh(
    new THREE.IcosahedronGeometry(0.78, 2),
    material('#B8E66B', { roughness: 0.18, metalness: 0.38, emissiveIntensity: 0.32, transparent: true, opacity: 0.14 })
  );
  const ringA = new THREE.Mesh(
    new THREE.TorusGeometry(1.34, 0.014, 20, detail === 'high' ? 160 : 96),
    new THREE.MeshBasicMaterial({ color: '#8BE1E8', transparent: true, opacity: 0.7 })
  );
  const ringB = new THREE.Mesh(
    new THREE.TorusGeometry(1.53, 0.008, 16, detail === 'high' ? 160 : 96),
    new THREE.MeshBasicMaterial({ color: '#B8E66B', transparent: true, opacity: 0.34 })
  );
  ringA.rotation.x = Math.PI * 0.42;
  ringB.rotation.y = Math.PI * 0.31;
  group.add(shell, energy, inner, ringA, ringB);
  group.userData.energy = energy.material;
  return group;
}

export function initByteCoreWorld(root) {
  if (!root || !root.ownerDocument) return { destroy() {} };

  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const profile = qualityProfile(window.innerWidth, reduced);
  const interaction = interactionProfile(window.innerWidth, reduced);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#03090d', 0.04);

  const camera = new THREE.PerspectiveCamera(profile.mobile ? 34 : 29, 1, 0.1, 100);
  camera.position.set(0, 0.1, profile.mobile ? 7.8 : 6.7);

  const renderer = new THREE.WebGLRenderer({
    antialias: !profile.mobile,
    alpha: true,
    powerPreference: profile.mobile ? 'default' : 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, profile.pixelRatio));
  renderer.setSize(root.clientWidth || 1, root.clientHeight || 1, false);
  renderer.setClearColor('#03090d', 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;cursor:grab';

  scene.add(new THREE.HemisphereLight('#DFFFFF', '#03151A', 2.1));
  const key = new THREE.DirectionalLight('#FFFFFF', 4.2);
  key.position.set(4, 5, 6);
  scene.add(key);
  const fill = new THREE.PointLight('#2EACB9', 12, 17);
  fill.position.set(-3, -1, 4);
  scene.add(fill);
  const rim = new THREE.PointLight('#B8E66B', 7, 13);
  rim.position.set(3, 2, -1);
  scene.add(rim);

  const world = new THREE.Group();
  scene.add(world);
  const core = createCore(profile.detail);
  world.add(core);

  const satellites = [];
  for (let i = 0; i < profile.satellites; i += 1) {
    const p = academicNode(i, profile.satellites);
    const group = new THREE.Group();
    group.position.set(p.x, p.y, p.z);
    const size = i % 3 === 0 ? 0.27 : 0.19;
    const geometry = i % 3 === 0
      ? new THREE.IcosahedronGeometry(size, profile.detail === 'high' ? 2 : 1)
      : new THREE.SphereGeometry(size, profile.mobile ? 16 : 24, profile.mobile ? 16 : 24);
    const mesh = new THREE.Mesh(geometry, material(i % 2 ? '#FFFFFF' : '#B8E66B', { roughness: 0.16, metalness: 0.42, emissiveIntensity: 0.08, opacity: i % 4 === 0 ? 0.84 : 1, transparent: i % 4 === 0 }));
    group.add(mesh);
    const label = labelSprite(LABELS[i]);
    label.scale.multiplyScalar(profile.mobile ? 0.72 : 1);
    group.add(label);
    satellites.push({ group, mesh, label, phase: i * 0.73 });
    world.add(group);
  }

  const lineMaterial = new THREE.LineBasicMaterial({ color: '#8BE1E8', transparent: true, opacity: 0.16 });
  satellites.forEach((satellite) => {
    const points = [new THREE.Vector3(0, 0, 0), satellite.group.position.clone()];
    world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMaterial));
  });

  const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, down: false, lastX: 0, lastY: 0, hover: false };
  let velocityX = 0;
  let velocityY = 0;
  let frame = 0;
  let idleTimer = 0;

  const resetHover = () => {
    pointer.hover = false;
    if (!pointer.down) {
      pointer.targetX = 0;
      pointer.targetY = 0;
    }
  };

  const onPointerMove = (event) => {
    if (pointer.down) {
      const dx = event.clientX - pointer.lastX;
      const dy = event.clientY - pointer.lastY;
      velocityY = dx * interaction.dragScale;
      velocityX = dy * interaction.dragScale * 0.72;
      pointer.targetY += velocityY;
      pointer.targetX += velocityX;
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      return;
    }
    const rect = root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const motion = cameraMotion((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height, profile.mobile);
    pointer.targetX = motion.x * Math.PI / 28;
    pointer.targetY = motion.y * Math.PI / 28;
  };

  const onPointerDown = (event) => {
    pointer.down = true;
    pointer.hover = true;
    pointer.lastX = event.clientX;
    pointer.lastY = event.clientY;
    velocityX = 0;
    velocityY = 0;
    renderer.domElement.style.cursor = 'grabbing';
    root.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };

  const onPointerUp = (event) => {
    pointer.down = false;
    renderer.domElement.style.cursor = 'grab';
    root.releasePointerCapture?.(event.pointerId);
    window.clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      pointer.targetX = 0;
      pointer.targetY = 0;
    }, 1400);
  };

  const onPointerEnter = () => { pointer.hover = true; };
  const onPointerLeave = () => resetHover();

  root.addEventListener('pointermove', onPointerMove, { passive: false });
  root.addEventListener('pointerdown', onPointerDown, { passive: false });
  root.addEventListener('pointerup', onPointerUp);
  root.addEventListener('pointercancel', onPointerUp);
  root.addEventListener('pointerenter', onPointerEnter);
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
  root.replaceChildren(renderer.domElement);

  const clock = new THREE.Clock();
  const animate = () => {
    frame = requestAnimationFrame(animate);
    const elapsed = clock.getElapsedTime();
    pointer.x += (pointer.targetX - pointer.x) * 0.055;
    pointer.y += (pointer.targetY - pointer.y) * 0.055;

    if (!pointer.down) {
      pointer.targetY += velocityY;
      pointer.targetX += velocityX;
      velocityY *= interaction.momentum;
      velocityX *= interaction.momentum;
      if (Math.abs(velocityY) < 0.00005) velocityY = 0;
      if (Math.abs(velocityX) < 0.00005) velocityX = 0;
    }

    const autoSpin = interaction.autoRotate * (pointer.hover ? interaction.hoverRotate / interaction.autoRotate : 1);
    if (interaction.float) {
      world.position.y = Math.sin(elapsed * 0.58) * 0.045;
      core.position.y = Math.sin(elapsed * 0.85) * 0.018;
    }
    world.rotation.x = pointer.x + (interaction.float ? Math.sin(elapsed * 0.16) * 0.018 : 0);
    world.rotation.y = pointer.y + (interaction.float ? elapsed * autoSpin : 0);
    core.rotation.x = interaction.float ? elapsed * 0.075 : 0;
    core.rotation.y = interaction.float ? elapsed * 0.11 : 0;
    core.userData.energy.emissiveIntensity = 0.2 + Math.sin(elapsed * 2.8) * 0.08;

    satellites.forEach((satellite, index) => {
      if (interaction.float) {
        satellite.mesh.position.y = Math.sin(elapsed * 0.55 + satellite.phase) * 0.05;
        satellite.mesh.rotation.x = elapsed * (0.14 + index * 0.006);
        satellite.mesh.rotation.y = elapsed * (0.18 + index * 0.008);
      }
      satellite.label.quaternion.copy(camera.quaternion);
    });

    renderer.render(scene, camera);
  };
  animate();

  return {
    destroy() {
      cancelAnimationFrame(frame);
      window.clearTimeout(idleTimer);
      observer.disconnect();
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointerup', onPointerUp);
      root.removeEventListener('pointercancel', onPointerUp);
      root.removeEventListener('pointerenter', onPointerEnter);
      root.removeEventListener('pointerleave', onPointerLeave);
      renderer.dispose();
      scene.traverse((object) => {
        object.geometry?.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((entry) => { entry.map?.dispose(); entry.dispose(); });
        }
      });
    }
  };
}
