import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js';
import { academicNode, cameraMotion, decayVelocity, pageDepth, qualityProfile, rendererProfile, spinProfile, vaultPortal } from './three-world-core.js';

const NODE_LABELS = ['SYLLABUS','SUBJECTS','UNITS','TOPICS','NOTES','PRACTICE','PYQs','AI TUTOR','SEMESTER','SUBJECT MAP','UNIT MAP','TOPIC MAP'];
const NODE_COLORS = ['#8BE1E8','#FFFFFF','#B8E66B','#8BE1E8','#FFFFFF','#B8E66B','#8BE1E8','#FFFFFF','#B8E66B','#8BE1E8','#FFFFFF','#B8E66B'];
const SEMESTERS = ['SEM 01','SEM 02','SEM 03','SEM 04','SEM 05','SEM 06'];

function createLabelSprite(text, accent, scale = 1) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Sprite(new THREE.SpriteMaterial({ color: accent }));
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(3,14,18,.96)';
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
  sprite.scale.set(.94 * scale, .235 * scale, 1);
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
  const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1.32, high), makePhysicalMaterial('#2EACB9', { roughness: .13, metalness: .6, transmission: .08, emissiveIntensity: .14 }));
  const inner = new THREE.Mesh(new THREE.IcosahedronGeometry(.72, Math.max(2, high - 1)), makePhysicalMaterial('#8BE1E8', { roughness: .08, metalness: .55, transmission: .12, emissiveIntensity: .3 }));
  inner.scale.setScalar(.9);
  const innerGlow = new THREE.Mesh(new THREE.SphereGeometry(.62, 64, 64), new THREE.MeshBasicMaterial({ color: '#D9FFFF', transparent: true, opacity: .12, blending: THREE.AdditiveBlending, depthWrite: false }));
  const wire = new THREE.Mesh(new THREE.IcosahedronGeometry(1.41, high), new THREE.MeshBasicMaterial({ color: '#B8E66B', wireframe: true, transparent: true, opacity: .2 }));
  group.add(shell, inner, innerGlow, wire);
  [
    [2.02, .018, .42, .08], [2.4, .012, .63, -.15], [2.78, .01, -.23, .67], [3.12, .008, .2, .82]
  ].forEach(([radius, tube, rx, ry], index) => {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 16, 320), new THREE.MeshBasicMaterial({ color: index % 2 ? '#2EACB9' : '#8BE1E8', transparent: true, opacity: .34 - index * .045 }));
    ring.rotation.x = Math.PI * rx;
    ring.rotation.y = Math.PI * ry;
    ring.userData.orbit = true;
    group.add(ring);
  });
  return group;
}

function createParticleField(count) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const radius = 3.4 + Math.random() * 3.6;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.cos(phi) * .82;
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
  const label = createLabelSprite(NODE_LABELS[index % NODE_LABELS.length], color, profile.mobile ? .75 : 1);
  label.position.set(0, -.45, .08);
  group.add(label);
  return { group, mesh, label, halo, phase: index * .67 };
}

function createVaultArtifact(detail = 4, profile) {
  const group = new THREE.Group();
  const hyper = new THREE.Group();
  group.add(hyper);
  const vertices = [];
  for (let i = 0; i < 16; i += 1) vertices.push(new THREE.Vector4((i & 1) ? 1 : -1, (i & 2) ? 1 : -1, (i & 4) ? 1 : -1, (i & 8) ? 1 : -1));
  const edges = [];
  for (let i = 0; i < 16; i += 1) for (let bit = 0; bit < 4; bit += 1) { const j = i ^ (1 << bit); if (i < j) edges.push([i, j]); }
  const linePositions = new Float32Array(edges.length * 6);
  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const hyperLines = new THREE.LineSegments(lineGeometry, new THREE.LineBasicMaterial({ color: '#8BE1E8', transparent: true, opacity: .34 }));
  hyper.add(hyperLines);
  const outer = new THREE.Mesh(new THREE.BoxGeometry(2.5, 2.5, 2.5), new THREE.MeshPhysicalMaterial({ color: '#2EACB9', roughness: .12, metalness: .55, transmission: .2, transparent: true, opacity: .18, clearcoat: 1 }));
  const inner = new THREE.Mesh(new THREE.BoxGeometry(1.28, 1.28, 1.28), makePhysicalMaterial('#B8E66B', { roughness: .1, metalness: .5, emissiveIntensity: .2 }));
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(.72, Math.max(2, detail - 1)), makePhysicalMaterial('#8BE1E8', { roughness: .08, metalness: .6, emissiveIntensity: .3 }));
  hyper.add(outer, inner, core);
  const portals = [];
  for (let i = 0; i < 6; i += 1) {
    const p = vaultPortal(i, 6);
    const portal = new THREE.Group();
    portal.position.set(p.x, p.y, p.z);
    const frame = new THREE.Mesh(new THREE.TorusGeometry(.42, .028, 14, 96), new THREE.MeshBasicMaterial({ color: i % 2 ? '#B8E66B' : '#8BE1E8', transparent: true, opacity: .8 }));
    const body = new THREE.Mesh(new THREE.IcosahedronGeometry(.23, 2), makePhysicalMaterial(i % 2 ? '#B8E66B' : '#FFFFFF', { roughness: .12, metalness: .5, emissiveIntensity: .14 }));
    body.userData.portalIndex = i;
    portal.userData.portalIndex = i;
    portal.add(frame, body);
    const label = createLabelSprite(SEMESTERS[i], i % 2 ? '#B8E66B' : '#8BE1E8', profile.mobile ? .7 : .88);
    label.position.y = -.62;
    portal.add(label);
    portals.push({ portal, body, frame, label, base: new THREE.Vector3(p.x, p.y, p.z), phase: i * .82 });
    group.add(portal);
  }
  return { group, hyper, hyperLines, vertices, edges, portals, hyperW: 0 };
}

function updateHyperGeometry(vault, time) {
  const positions = vault.hyperLines.geometry.attributes.position.array;
  const wAngle = time * .23;
  const xyz = vault.vertices.map((v) => {
    const cw = Math.cos(wAngle * .9), sw = Math.sin(wAngle * .9);
    const xw = v.x * cw - v.w * sw;
    const ww = v.x * sw + v.w * cw;
    const cz = Math.cos(wAngle * .55), sz = Math.sin(wAngle * .55);
    const z = v.z * cz - ww * sz;
    const wz = v.z * sz + ww * cz;
    const perspective = 1 / Math.max(.45, 3.5 - wz * .38);
    return new THREE.Vector3(xw * perspective, v.y * perspective, z * perspective);
  });
  vault.edges.forEach(([a, b], i) => {
    const offset = i * 6;
    positions[offset] = xyz[a].x; positions[offset + 1] = xyz[a].y; positions[offset + 2] = xyz[a].z;
    positions[offset + 3] = xyz[b].x; positions[offset + 4] = xyz[b].y; positions[offset + 5] = xyz[b].z;
  });
  vault.hyperLines.geometry.attributes.position.needsUpdate = true;
  vault.hyper.rotation.y = time * .12;
  vault.hyper.rotation.x = Math.sin(time * .18) * .08;
}

export function initByteCoreWorld(root, mode = 'home') {
  if (!root || !root.ownerDocument) return { destroy() {} };
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches ?? false;
  const profile = qualityProfile(window.innerWidth, reduce);
  const renderProfile = rendererProfile(window.innerWidth);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2('#03090D', mode === 'vault' ? .038 : .032);
  const camera = new THREE.PerspectiveCamera(profile.mobile ? 34 : 28, 1, .1, 100);
  camera.position.set(0, .12, mode === 'vault' ? (profile.mobile ? 10.8 : 9.1) : (profile.mobile ? 8.8 : 7.7));

  const renderer = new THREE.WebGLRenderer({ antialias: renderProfile.antialias, alpha: true, powerPreference: renderProfile.powerPreference });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, renderProfile.pixelRatio));
  renderer.setClearColor('#03090D', 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = !profile.mobile;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;cursor:grab;';

  const key = new THREE.DirectionalLight('#FFFFFF', 4.8); key.position.set(4, 5, 6); key.castShadow = !profile.mobile; scene.add(key);
  scene.add(new THREE.HemisphereLight('#D8FFFF', '#021217', 2.2));
  const teal = new THREE.PointLight('#2EACB9', 11, 18); teal.position.set(-3, 0, 4); scene.add(teal);
  const lime = new THREE.PointLight('#B8E66B', 7, 14); lime.position.set(3, 2, -2); scene.add(lime);

  const world = new THREE.Group();
  scene.add(world);
  let artifact;
  let nodes = [];
  let vault = null;
  if (mode === 'vault') {
    vault = createVaultArtifact(renderProfile.geometryDetail, profile);
    artifact = vault.group;
    world.add(artifact);
  } else {
    artifact = createByteCoreArtifact(renderProfile.geometryDetail);
    world.add(artifact);
    world.add(createParticleField(renderProfile.particleCount));
    const count = profile.satellites;
    for (let i = 0; i < count; i += 1) nodes.push(addNode(world, academicNode(i, count), i, profile));
    const linkMaterial = new THREE.LineBasicMaterial({ color: '#8BE1E8', transparent: true, opacity: .16 });
    nodes.forEach((entry) => world.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), entry.group.position.clone()]), linkMaterial)));
  }

  const pointer = { targetX: 0, targetY: 0, rotationX: 0, rotationY: 0, velocityX: 0, velocityY: 0, dragging: false, hovered: false, hoveredPortal: -1, lastX: 0, lastY: 0 };
  const raycaster = new THREE.Raycaster();
  const pointerNdc = new THREE.Vector2();
  const onPointerMove = (event) => {
    const rect = root.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    pointerNdc.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    pointerNdc.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
    if (pointer.dragging) {
      pointer.velocityY = (event.clientX - pointer.lastX) * .0045;
      pointer.velocityX = (event.clientY - pointer.lastY) * .0032;
      pointer.rotationY += pointer.velocityY;
      pointer.rotationX += pointer.velocityX;
      pointer.rotationX = THREE.MathUtils.clamp(pointer.rotationX, -.62, .62);
      pointer.lastX = event.clientX; pointer.lastY = event.clientY;
      return;
    }
    const motion = cameraMotion((event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height, profile.mobile);
    pointer.targetX = motion.x; pointer.targetY = motion.y;
    if (vault) {
      raycaster.setFromCamera(pointerNdc, camera);
      const hits = raycaster.intersectObjects(vault.portals.map((entry) => entry.body), false);
      pointer.hoveredPortal = hits.length ? hits[0].object.userData.portalIndex : -1;
    }
  };
  const onPointerEnter = () => { pointer.hovered = true; };
  const onPointerLeave = () => { pointer.hovered = false; pointer.hoveredPortal = -1; if (!pointer.dragging) { pointer.targetX = 0; pointer.targetY = 0; } };
  const onPointerDown = (event) => { pointer.dragging = true; pointer.velocityX = 0; pointer.velocityY = 0; pointer.lastX = event.clientX; pointer.lastY = event.clientY; root.setPointerCapture?.(event.pointerId); event.preventDefault(); };
  const onPointerUp = (event) => { pointer.dragging = false; root.releasePointerCapture?.(event.pointerId); };
  root.addEventListener('pointerenter', onPointerEnter);
  root.addEventListener('pointerleave', onPointerLeave);
  root.addEventListener('pointermove', onPointerMove, { passive: false });
  root.addEventListener('pointerdown', onPointerDown, { passive: false });
  root.addEventListener('pointerup', onPointerUp);
  root.addEventListener('pointercancel', onPointerUp);

  const resize = () => { const width = Math.max(1, root.clientWidth); const height = Math.max(1, root.clientHeight); camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height, false); };
  const observer = new ResizeObserver(resize); observer.observe(root); resize();
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
    world.scale.setScalar(mode === 'vault' ? 1.0 + depth.coreScale * .025 : depth.coreScale);
    camera.position.x += ((pointer.targetY * 5) - camera.position.x) * .018;
    camera.position.y += ((pointer.targetX * 3.8 + .12) - camera.position.y) * .018;
    camera.position.z += (depth.cameraZ + (mode === 'vault' ? 1.15 : 0) - camera.position.z) * .018;

    if (profile.animate) artifact.rotation.y += spin.idle;
    if (mode === 'vault' && vault) {
      updateHyperGeometry(vault, time);
      vault.portals.forEach((entry, i) => {
        const hovered = pointer.hoveredPortal === i;
        const targetScale = hovered ? 1.22 : 1;
        entry.portal.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), .08);
        entry.portal.position.y = entry.base.y + (profile.animate ? Math.sin(time * .65 + entry.phase) * .09 : 0);
        entry.frame.rotation.z = profile.animate ? time * (.22 + i * .012) : 0;
        entry.body.rotation.x = profile.animate ? time * .18 : 0;
        entry.body.rotation.y = profile.animate ? time * .25 : 0;
        entry.label.quaternion.copy(camera.quaternion);
      });
      vault.hyper.children[1].rotation.x = time * .08;
      vault.hyper.children[1].rotation.y = time * .12;
      vault.hyper.children[2].rotation.x = -time * .1;
      vault.hyper.children[2].rotation.y = time * .14;
    } else {
      nodes.forEach((entry, i) => {
        if (profile.animate) {
          entry.group.position.y = academicNode(i, nodes.length).y + Math.sin(time * .45 + entry.phase) * .06;
          entry.mesh.rotation.x = time * (.12 + i * .004);
          entry.mesh.rotation.y = time * (.16 + i * .005);
          entry.halo.rotation.z = time * .15;
        }
        entry.label.quaternion.copy(camera.quaternion);
      });
    }
    teal.intensity = 9 + Math.sin(time * 1.4) * 1.2;
    lime.intensity = 6 + Math.sin(time * 1.1 + 1) * .8;
    renderer.render(scene, camera);
  };
  tick();

  return { destroy() { cancelAnimationFrame(frame); observer.disconnect(); root.removeEventListener('pointerenter', onPointerEnter); root.removeEventListener('pointerleave', onPointerLeave); root.removeEventListener('pointermove', onPointerMove); root.removeEventListener('pointerdown', onPointerDown); root.removeEventListener('pointerup', onPointerUp); root.removeEventListener('pointercancel', onPointerUp); renderer.dispose(); scene.traverse((object) => { if (object.geometry) object.geometry.dispose(); if (object.material) { const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.forEach((material) => { material.map?.dispose(); material.dispose(); }); } }); } };
}

export { createByteCoreArtifact, createVaultArtifact, updateHyperGeometry };
