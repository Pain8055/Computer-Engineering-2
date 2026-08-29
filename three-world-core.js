const numeric = (value, fallback = 0) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export function qualityProfile(width = 1440, prefersReducedMotion = false) {
  const viewport = numeric(width, 1440);
  const mobile = viewport <= 700;
  const compact = viewport <= 980;
  return {
    mobile,
    compact,
    pixelRatio: mobile ? 1.25 : compact ? 1.75 : 2.25,
    satellites: mobile ? 6 : compact ? 8 : 12,
    particles: mobile ? 70 : compact ? 120 : 180,
    animate: !prefersReducedMotion
  };
}

export function academicNode(index = 0, total = 12) {
  const count = Math.max(1, Math.floor(numeric(total, 12)));
  const i = ((Math.floor(numeric(index, 0)) % count) + count) % count;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5));
  const y = 1 - (i / Math.max(1, count - 1)) * 2;
  const radius = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = i * goldenAngle;
  const depth = 1.9 + ((i * 17) % 5) * 0.16;
  return {
    x: Number((Math.cos(theta) * radius * depth).toFixed(3)),
    y: Number((y * 1.35).toFixed(3)),
    z: Number((Math.sin(theta) * radius * depth).toFixed(3))
  };
}

export function vaultPortal(index = 0, total = 6) {
  const count = Math.max(1, Math.floor(numeric(total, 6)));
  const i = ((Math.floor(numeric(index, 0)) % count) + count) % count;
  const theta = (i / count) * Math.PI * 2 - Math.PI / 2;
  const radius = 3.25;
  return {
    x: Number((Math.cos(theta) * radius).toFixed(3)),
    y: Number((Math.sin(theta) * 1.55).toFixed(3)),
    z: Number((Math.cos(theta) * 1.15).toFixed(3))
  };
}

export function cameraMotion(normalizedX = 0.5, normalizedY = 0.5, mobile = false) {
  const x = clamp(numeric(normalizedX, 0.5), 0, 1);
  const y = clamp(numeric(normalizedY, 0.5), 0, 1);
  const range = mobile ? 0.18 : 0.3;
  return {
    x: Number(((0.5 - y) * range).toFixed(4)),
    y: Number(((x - 0.5) * range).toFixed(4))
  };
}

export function spinProfile(hovered = false, prefersReducedMotion = false) {
  if (prefersReducedMotion) return { idle: 0, hover: 0, damping: 0.86 };
  return { idle: 0.0018, hover: hovered ? 0.0048 : 0, damping: 0.94 };
}

export function decayVelocity(value, damping = 0.94) {
  return numeric(value, 0) * clamp(numeric(damping, 0.94), 0, 1);
}

export function rendererProfile(width = 1440) {
  const profile = qualityProfile(width, false);
  return {
    pixelRatio: profile.pixelRatio,
    antialias: !profile.mobile,
    powerPreference: profile.mobile ? 'default' : 'high-performance',
    geometryDetail: profile.mobile ? 2 : profile.compact ? 3 : 4,
    particleCount: profile.particles,
    target: '4k-capable-high-dpi'
  };
}

export function pageDepth(scrollProgress = 0) {
  const progress = clamp(numeric(scrollProgress, 0), 0, 1);
  return {
    cameraZ: Number((7.8 - progress * 0.9).toFixed(3)),
    rotationY: Number((progress * 0.35).toFixed(4)),
    coreScale: Number((1 + progress * 0.08).toFixed(4))
  };
}
