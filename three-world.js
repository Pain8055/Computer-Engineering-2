import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { academicNode, cameraMotion, decayVelocity, pageDepth, qualityProfile, rendererProfile, spinProfile } from './three-world-core.js';

const NODE_LABELS = ['SYLLABUS','SUBJECTS','UNITS','TOPICS','NOTES','PRACTICE','PYQs','AI TUTOR','SEMESTER','SUBJECT MAP','UNIT MAP','TOPIC MAP'];
const NODE_COLORS = ['#8BE1E8','#FFFFFF','#B8E66B','#8BE1E8','#FFFFFF','#B8E66B','#8BE1E8','#FFFFFF','#B8E66B','#8BE1E8','#FFFFFF','#B8E66B'];

function createLabelSprite(text, accent) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Sprite(new THREE.SpriteMaterial({ color: accent }));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(3,14,18,.92)';
  ctx.strokeStyle = accent;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.roundRect(18, 26, 988, 188, 48);
  ctx.fill();
  ctx.stroke();
  ctx.font = '800 48px Inter,Arial,sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#F4FBFC';
  ctx.fillText(text, 512, 121);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, transparent: true, depthWrite: false }));
  sprite.scale.set(.94, .235, 1);
  return sprite;
}

function makePhysicalMaterial(color, options = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    roughness: options.roughness ?? .18,
    metalness: options.metalness ?? .42,
    clearcoat: options.clearcoat ?? 1,
    clearcoatRoughness: options.clearcoatRoughness ?? .08,
    transmission: options.transmission ?? 0,
    thickness: options.thickness ?? .4,
    emissive: options.emissive ?? color,
    emissiveIntensity: options.emissiveIntensity ?? .06
  });
}

function createByteCoreArtifact(detail = 4) {
  const group = new THREE.Group();
  const high = Math.max(2, Math.min(5, detail));
  const shell = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.32, high),
    makePhysicalMaterial('#2EACB9', { roughness: .13, metalness: .6, transmission: .08, emissiveIntensity: .14 })
  );
  group.add(shell);

  const inner = new THREE.Mesh(
    new THREE.IcosahedronGeometry(.72, Math.max(2, high - 1)),
    makePhysicalMaterial('#8BE1E8', { roughness: .08, metalness: .55, transmission: .1, emissiveIntensity: .3 })
  );
  inner.scale.setScalar(.9);
  group.add(inner);

  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.41, high),
    new THREE.MeshBasicMaterial({ color: '#B8E66B', wireframe: true, transparent: true, opacity: .22 })
  );
  group.add(wire);

  const shellLight = new THREE.Mesh(
    new THREE.SphereGeometry(1.48, 96, 96),
    new THREE.MeshBasicMaterial({ color: '#8BE1E8', transparent: true, opacity: .035, depthWrite: false })
  );
  group.add(shellLight);

  [
    [2.02, .018, .08, .42],
    [2.4, .012, .14, -.15],
    [2.76, .01, -.23, .67]
  ].forEach(([radius, tube, rotX, rotY]) => {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(radius, tube, 16, 280),
      new THREE.MeshBasicMaterial({ color: '#8BE1E8', transparent: true, opacity: .34 })
    );
    ring.rotation.x = Math.PI * rotX;
    ring.rotation.y = Math.PI * rotY;
    group.add(ring);
  });

  return group;
}

function createParticleField(count) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const radius = 3.2 + Math.random() * 3.2;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi) * .8;
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return new THREE.Points(geometry, new THREE.PointsMaterial({ color: '#8BE1E8', size: .026, transparent: true, opacity: .48, sizeAttenuation: true }));
}

function addNode(sceneGroup, node, index, profile) {
  const group = new THREE.Group();
  group.position.set(node.x, node.y, node.z);
  const shape = index % 3 === 0 ? new THREE.IcosahedronGeometry(.22, 2) : new THREE.OctahedronGeometry(.18, 2);
  const color = NODE_COLORS[index % NODE_COLORS.length];
  const mesh = new THREE.Mesh(shape, makePhysicalMaterial(color, { roughness: .2, metalness: .45, emissiveIntensity: .1 }));
  group.add(mesh);
  const halo = new THREE.Mesh(new THREE.TorusGeometry(.29, .008, 10, 80), new THREE.MeshBasicMaterial({ color, transparent: true, opacity: .48 }));
  halo.rotation.x = Math.PI / 2;
  group.add(halo);
  const label = createLabelSprite(NODE_LABELS[index % NODE_LABELS.length], color);
  label.position.set(0, -.45, .08);
  label.scale.multiplyScalar(profile.mobile ? .75 : 1);
  group.add(label);
  return { group, mesh, label, halo, phase: index * .67 };
}

export function initByteCoreWorld(root, mode = 'home') {
  if (!root || !root.ownerDocument) return { destroy() {} };
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const profile = qualityProfile(window.innerWidth, reduce);
  const renderProfile = rendererProfile(window.innerWidth);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#03090D', .032);

  const camera = new THREE.PerspectiveCamera(profile.mobile ? 34 : 28, 1, .1, 100);
  camera.position.set(0, .15, mode === 'vault' ? (profile.mobile ? 8.2 : 7.3) : (profile.mobile ? 8.8 : 7.7));

  const renderer = new THREE.WebGLRenderer({ antialias: renderProfile.antialias, alpha: true, powerPreference: renderProfile.powerPreference });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, renderProfile.pixelRatio));
  renderer.setClearColor('#03090D', 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = !profile.mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const key = new THREE.DirectionalLight('#FFFFFF', 4.8);
  key.position.set(4, 5, 6);
  key.castShadow = !profile.mobile;
  scene.add(key);
  scene.add(new THREE.HemisphereLight('#D8FFFF', '#021217', 2.2));
  const teal = new THREE.PointLight('#2EACB9', 11, 18);
  teal.position.set(-3, 0, 4);
  scene.add(teal);
  const lime = new THREE.PointLight('#B8E66B', 7, 14);
  lime.position.set(3, 2, -2);
  scene.add(lime);

  const world = new THREE.Group();
  scene.add(world);
  const artifact = createByteCoreArtifact(renderProfile.geometryDetail);
  world.add(artifact);
  const particles = createParticleField(renderProfile.particleCount);
  world.add(particles);

  const nodes = [];
  const count = profile.satellites;
  for (let i = 0; i < count; i += 1) {
    const entry = addNode(world, academicNode(i, count), i, profile);
    nodes.push(entry);
  }

  const linkMaterial = new THREE.LineBasicMaterial({ color: '#8BE1E8', transparent: true, opacity: .16 });
  nodes.forEach((entry) => {
    world.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), entry.group.position.clone()]),
      linkMaterial
    ));
  });

  const pointer = { targetX: 0, targetY: 0, rotationX: 0, rotationY: 0, velocityX: 0, velocityY: 0, dragging: false, hovered: false, lastX: 0, lastY: 0 };
  const onPointerEnter = () => { pointer.hovered = true; };
  const onPointerLeave = () => { pointer.hovered = false; if (!pointer.dragging) { pointer.targetX = 0; pointer.targetY = 0; } };
  const onPointerMove = (event) => {
    if (pointer.dragging) {
      pointer.velocityY = (event.clientX - pointer.lastX) * .0045;
      pointer.velocityX = (event.clientY - pointer.lastY) * .0032;
      pointer.rotationY += pointer.velocityY;
      pointer.rotationX += pointer.velocityX;
      pointer.rotationX = THREE.MathUtils.clamp(pointer.rotationX, -.62, .62);
      pointer.lastX = event.clientX;
      pointer.lastY = event.clientY;
      return;
    }
    const rect = root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    const motion = cameraMotion((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height, profile.mobile);
    pointer.targetX = motion.x;
    pointer.targetY = motion.y;
  };
  const onPointerDown = (event) => {
    pointer.dragging = true;
    pointer.velocityX = 0;
    pointer.velocityY = 0;
    pointer.lastX = event.clientX;
    pointer.lastY = event.clientY;
    root.setPointerCapture?.(event.pointerId);
    event.preventDefault();
  };
  const onPointerUp = (event) => {
    pointer.dragging = false;
    root.releasePointerCapture?.(event.pointerId);
  };
  root.addEventListener('pointerenter', onPointerEnter);
  root.addEventListener('pointerleave', onPointerLeave);
  root.addEventListener('pointermove', onPointerMove, { passive: false });
  root.addEventListener('pointerdown', onPointerDown, { passive: false });
  root.addEventListener('pointerup', onPointerUp);
  root.addEventListener('pointercancel', onPointerUp);

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
  let frame = 0;
  const tick = () => {
    frame = requestAnimationFrame(tick);
    const time = clock.getElapsedTime();
    const spin = spinProfile(pointer.hovered, reduce);
    const depth = pageDepth(Math.min(1, Math.max(0, window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight))));

    pointer.rotationX += (pointer.targetX - pointer.rotationX) * .045;
    pointer.rotationY += (pointer.targetY - pointer.rotationY) * .045;
    if (!pointer.dragging) {
      pointer.rotationY += spin.hover;
      pointer.velocityX = decayVelocity(pointer.velocityX, spin.damping);
      pointer.velocityY = decayVelocity(pointer.velocityY, spin.damping);
      artifact.rotation.x += pointer.velocityX;
      artifact.rotation.y += pointer.velocityY;
    }

    world.rotation.x = pointer.rotationX + (profile.animate ? Math.sin(time * .16) * .028 : 0);
    world.rotation.y = pointer.rotationY + depth.rotationY;
    world.position.y = Math.sin(time * .58) * .05;
    world.scale.setScalar(depth.coreScale);
    camera.position.x += ((pointer.targetY * 5) - camera.position.x) * .018;
    camera.position.y += ((pointer.targetX * 3.8 + .15) - camera.position.y) * .018;
    camera.position.z += (depth.cameraZ - camera.position.z) * .018;

    artifact.rotation.x += profile.animate ? .0012 : 0;
    artifact.rotation.y += profile.animate ? spin.idle : 0;
    particles.rotation.y += profile.animate ? .00065 : 0;
    particles.rotation.x += profile.animate ? .00015 : 0;

    nodes.forEach((entry, i) => {
      if (profile.animate) {
        entry.group.position.y += Math.sin(time * .45 + entry.phase) * .0008;
        entry.mesh.rotation.x = time * (.12 + i * .004);
        entry.mesh.rotation.y = time * (.16 + i * .005);
        entry.halo.rotation.z = time * .15;
      }
      entry.label.quaternion.copy(camera.quaternion);
    });
    teal.intensity = 9 + Math.sin(time * 1.4) * 1.2;
    lime.intensity = 6 + Math.sin(time * 1.1 + 1) * .8;
    renderer.render(scene, camera);
  };
  tick();

  return {
    destroy() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      root.removeEventListener('pointerenter', onPointerEnter);
      root.removeEventListener('pointerleave', onPointerLeave);
      root.removeEventListener('pointermove', onPointerMove);
      root.removeEventListener('pointerdown', onPointerDown);
      root.removeEventListener('pointerup', onPointerUp);
      root.removeEventListener('pointercancel', onPointerUp);
      renderer.dispose();
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose();
        if (object.material) {
          const materials = Array.isArray(object.material) ? object.material : [object.material];
          materials.forEach((material) => { material.map?.dispose(); material.dispose(); });
        }
      });
    }
  };
}

export { createByteCoreArtifact };
